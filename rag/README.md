# PDF RAG Pipeline — NVIDIA + Qdrant + LangChain

A small Node.js Retrieval-Augmented Generation (RAG) pipeline. It ingests a local PDF, chunks and embeds it with an NVIDIA-hosted embedding model, stores the vectors in Qdrant, then answers a question about the document by retrieving the most relevant chunks and streaming a response from an NVIDIA-hosted LLM straight to the terminal.

## 🚀 Features

- **PDF Ingestion:** Parses local PDFs into LangChain documents via `PDFLoader` (`@langchain/community`).
- **Chunking:** Splits documents with `RecursiveCharacterTextSplitter` — 600-character chunks, 60-character overlap.
- **Embeddings:** Generates vectors using NVIDIA's `nv-embed-v1` model, called through `@langchain/openai`'s `OpenAIEmbeddings` class pointed at NVIDIA's API gateway.
- **Vector Storage:** Pushes/queries vectors in a Qdrant collection (`docs`) via `@langchain/qdrant`.
- **Retrieval-Augmented Chat:** Runs a top-4 similarity search and feeds the results as context to NVIDIA's `nemotron-3-ultra-550b-a55b` chat model, using the raw `openai` SDK.
- **Streamed Answers:** The chat response is streamed token-by-token to stdout.

## 🧠 How It Works

1. `index.js` loads a target PDF, splits it into chunks, embeds them, and writes the vectors into Qdrant under the `docs` collection.
2. Once ingestion finishes, it immediately calls `answerUserQuestion()` from `chat.js` with a query.
3. `chat.js` calls `queryVectorStore()` (in `queryStore.js`), which embeds the query and runs a similarity search (top 4 matches) against the `docs` collection.
4. The retrieved chunks are joined into a single context string and passed to the NVIDIA chat model as part of a system prompt that restricts it to answering only from that context.
5. The model's reply streams to the terminal in real time.

## 📋 Prerequisites

- Node.js v18 or higher
- A running Qdrant instance — a `docker-compose.yml` is included for spinning one up locally
- A valid NVIDIA API key (used for both the embedding and chat models)

## 🛠️ Installation

```bash
npm install dotenv @langchain/community @langchain/textsplitters @langchain/qdrant @langchain/openai openai pdf-parse
```

> `pdf-parse` is a required peer dependency of the `PDFLoader` used by `@langchain/community`. `openai` is used directly in `chat.js` for the completion call (separate from the LangChain-wrapped embeddings client).

## 🐳 Running Qdrant

This project ships with a `docker-compose.yml`. Start Qdrant with:

```bash
docker compose up -d
```

By default Qdrant will be reachable at `http://localhost:6333` (dashboard at `http://localhost:6333/dashboard`).

## ⚙️ Environment Configuration

Create a `.env` file in the project root:

```env
# NVIDIA API key — reused for both embeddings and chat completions
API_KEY=your_nvidia_api_key_here

# Qdrant connection URL
QDRANT_URL=http://localhost:6333
```

Both the embedding model and the chat model are proxied through NVIDIA's `https://integrate.api.nvidia.com/v1` endpoint, so a single `API_KEY` covers both.

## 📁 Directory Structure

```text
.
├── data/
│   ├── notes.pdf
│   └── notes_02.pdf        # file currently ingested by index.js
├── node_modules/
├── .env
├── .gitignore
├── chat.js                 # retrieval + streamed LLM answer
├── docker-compose.yml      # spins up a local Qdrant instance
├── index.js                # ingestion entry point
├── package.json
├── package-lock.json
├── queryStore.js            # similarity search against Qdrant
└── README.md
```

## 🖥️ Usage

1. Place the PDF you want to index inside `./data/`.
2. Open `index.js` and update the call at the bottom to point at your file and ask your question:

```js
createEmbeddingsFromFile("./data/notes_02.pdf", "System wide deployement");
```

3. Run the pipeline:

```bash
   node index.js
```

This parses the PDF, chunks it, embeds it, pushes it to Qdrant, then immediately queries it and streams the answer to your terminal.

> ⚠️ **Note:** the file path and question are currently hardcoded as arguments to `createEmbeddingsFromFile()` at the bottom of `index.js`, not read from CLI args or stdin — edit that line directly to ingest a different file or ask a different question. Each run re-parses and re-embeds the target PDF into the `docs` collection (there's no duplicate check).

## 🔍 Code Overview

### `index.js`

`createEmbeddingsFromFile(filePath, query)`

- Validates that `filePath` and `query` are non-empty.
- Loads the PDF with `PDFLoader`.
- Splits it with `RecursiveCharacterTextSplitter` (`chunkSize: 600`, `chunkOverlap: 60`).
- Embeds chunks with `OpenAIEmbeddings`, configured for NVIDIA's `nv-embed-v1` model.
- Stores the vectors in Qdrant via `QdrantVectorStore.fromDocuments(...)` under the `docs` collection.
- Calls `answerUserQuestion(query)` once storage completes.

### `queryStore.js`

`queryVectorStore(userQuery)`

- Rebuilds the same NVIDIA-backed embeddings client.
- Connects to the existing `docs` collection via `QdrantVectorStore.fromExistingCollection(...)`.
- Runs `similaritySearch(userQuery, 4)` and returns the top 4 matching chunks.

### `chat.js`

`answerUserQuestion(question)`

- Retrieves relevant chunks via `queryVectorStore`.
- Joins their `pageContent` into a single context string.
- Sends a chat completion request through the raw `openai` SDK, pointed at NVIDIA's API, using the `nemotron-3-ultra-550b-a55b` model.
- System prompt restricts the model to the provided context and instructs it to reply "I cannot find that in the provided document." when the answer isn't present.
- Streams the response chunk-by-chunk to `stdout`.

## 🔧 Configuration Reference

| Setting                 | Value                                 | Location                    |
| ----------------------- | ------------------------------------- | --------------------------- |
| Chunk size              | 600 characters                        | `index.js`                  |
| Chunk overlap           | 60 characters                         | `index.js`                  |
| Embedding model         | `nvidia/nv-embed-v1`                  | `index.js`, `queryStore.js` |
| Chat model              | `nvidia/nemotron-3-ultra-550b-a55b`   | `chat.js`                   |
| Qdrant collection name  | `docs`                                | `index.js`, `queryStore.js` |
| Similarity search top-k | 4                                     | `queryStore.js`             |
| NVIDIA API base URL     | `https://integrate.api.nvidia.com/v1` | all three files             |

## ⚠️ Known Limitations

- No CLI/argument parsing — the file path and question are hardcoded in `index.js`.
- No de-duplication check before ingestion — re-running `index.js` re-embeds and re-adds the same PDF to the `docs` collection.
- Console-only output — the streamed answer isn't persisted to a log, file, or API/UI layer.

---

_A local-first RAG pipeline: PDF in, grounded answer out._
