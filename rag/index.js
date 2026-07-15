import 'dotenv/config'
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { QdrantVectorStore } from "@langchain/qdrant"
import { OpenAIEmbeddings } from "@langchain/openai";
import { OpenAI } from "openai";


async function generateEmbeddingsFromFile(filePath, query) {

  if (!filePath || filePath == '') {
    console.log("file path should not be empty")
    return null;
  }

  if (!query || query === '') {
    console.log("query should not be empty")
    return null;
  }

  const loader = new PDFLoader(filePath);
  const docs = await loader.load();

  // console.log("pdf loaded successfully")

  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 600, chunkOverlap: 60 });
  const chunkedDocs = await splitter.splitDocuments(docs)

  // console.log("data chunked successfully")

  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.API_KEY,
    model: "nvidia/nv-embed-v1",
    configuration: {
      baseURL: "https://integrate.api.nvidia.com/v1",
    },
  });

  // console.log("embeddings initialized successfully")

  const vectorStore = await QdrantVectorStore.fromDocuments(chunkedDocs, embeddings, {
    url: process.env.QDRANT_URL,
    collectionName: "docs",
  });
  console.log("Embeddings successfully pushed to Qdrant!");

  answerUserQuestion(query)
}

async function answerUserQuestion(question) {

  const relevantDocs = await queryVectorStore(question);
  const contextText = relevantDocs.map(doc => doc.pageContent).join("\n\n");

  const openai = new OpenAI({
    apiKey: process.env.API_KEY,
    baseURL: "https://integrate.api.nvidia.com/v1"
  });

  const response = await openai.chat.completions.create({
    model: "nvidia/nemotron-3-ultra-550b-a55b",
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant. Answer the user's question accurately using ONLY the following context. If the answer cannot be found in the context, say "I cannot find that in the provided document."\n\nContext:\n${contextText}`
      },
      { role: "user", content: question }
    ],
    temperature: 1,
    top_p: 0.95,
    max_tokens: 16384,
    reasoning_budget: 16384,
    chat_template_kwargs: { "enable_thinking": true },
    stream: true
  });

  for await (const chunk of response) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '')
  }
}

async function queryVectorStore(userQuery) {

  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.API_KEY,
    model: "nvidia/nv-embed-v1",
    configuration: { baseURL: "https://integrate.api.nvidia.com/v1" },
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_URL,
    collectionName: "docs",
  });

  const results = await vectorStore.similaritySearch(userQuery, 4);
  return results;
}

generateEmbeddingsFromFile('./data/notes.pdf', 'System-Wide Deployment')