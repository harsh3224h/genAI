import 'dotenv/config'
import { nemotron_chat, phi_chat, mistral_chat } from './models.js'
import { GoogleGenAI } from "@google/genai";
import fs from 'node:fs'

const DB = []

const prompt = 'What is LLM? Explain in detail with examples and how it works under the hood. Also explain the architecture of LLM and how it works with examples.';

chat(prompt)

async function chat(prompt) {
  if (!prompt || prompt.trim() === '') return null;

  const data = {
    id: DB.length + 1,
    prompt: prompt,
    responses: []
  }

  // clearing the output.md file before writing new responses
  await fs.writeFileSync('output.md', `# Prompt\n${prompt}\n\n\n---\n\n`)

  // using NVIDIA's nemotron-3-ultra  model
  const nemotronReponse = await nemotron_chat(prompt);
  await fs.appendFileSync('output.md', `\n# Nemotron Response\n${nemotronReponse}\n\n\n---\n\n`)
  data.responses.push({ model: 'nemotron', response: nemotronReponse });

  // using mistralai small model
  const mistralResponse = await mistral_chat(prompt);
  await fs.appendFileSync('output.md', `\n# Mistral Response\n${mistralResponse}\n\n\n---\n\n`)
  data.responses.push({ model: 'mistral', response: mistralResponse });

  // using Microsoft's PHI model (expiring on 15/07/26)
  const phiResponse = await phi_chat(prompt);
  await fs.appendFileSync('output.md', `\n# Phi Response\n${phiResponse}\n\n\n---\n\n`)
  data.responses.push({ model: 'phi', response: phiResponse });

  DB.push(data)


  // Evaluator LLM :  Google's Gemini flash-3.5  model

  const SYSTEM_PROMPT = `
  
  Hey Gemini, I'm giving you few responses from different AI models, your job is to evaludate the best response out of all.
  In the output, you should only give the value of the best response which you picked and nothing else than that.

  Rule: Do not return anything else than the original response value of the best picked response. 

  Following is the example -> 
  
  Prompt -> What is LLM
  
  {model: 'first', response: 'An LLM, or Large Language Model, is a type of artificial intelligence designed to understand and generate human-like text. These models are trained on massive amounts of data from the internet, books, and articles. They power popular applications like chatbots, translation services, and text completion tools. By analyzing patterns in language, they can answer questions, write essays, and write code based on what a user types into them.

Why it's not the best: It tells you what an LLM does, but completely ignores how it works under the hood. It treats the AI like a magical black box that just "knows" things from reading books, omitting core concepts like probability, tokens, or the underlying architecture.'}

{model: 'second', response: 'A Large Language Model (LLM) is a deep learning architecture, typically utilizing the Transformer framework introduced by Vaswani et al. (2017), characterized by self-attention mechanisms. These models operate by tokenizing input text into numerical vectors and processing them through billions of parameters. Through self-supervised learning on vast corpora, the model optimizes a loss function to predict the next token in a sequence given the context window. They utilize high-dimensional vector spaces to represent semantic relationships between words, allowing for complex natural language processing tasks via autoregressive generation.

Why it's not the best: While technically accurate, it's dense and relies heavily on jargon. Unless you already have a background in machine learning, this explanation is difficult to digest and misses the bigger picture of how humans actually interact with and use these tools.'}

{model: 'third', response: 'A Large Language Model (LLM) is an advanced AI program trained to understand, process, and generate human language. Think of it as a highly sophisticated autocomplete system on steroids.

Instead of understanding the world the way humans do, an LLM works purely on advanced statistics and probability.

The "Large" Part: They are trained on massive datasets (billions of pages of text) and contain billions of internal settings called parameters that help them recognize complex patterns in how words relate to one another.

How They Work: When you give an LLM a prompt, it breaks the text down into smaller pieces called tokens (words or parts of words). It then calculates the most statistically likely token to follow your text, repeating this process word-by-word to form complete sentences.

The Architecture: Modern LLMs are built on a specific blueprint called the Transformer architecture, which allows the AI to look at a whole sentence at once and understand the context of words (e.g., knowing that "bank" means a riverbank and not a financial institution based on the surrounding words).

Ultimately, they are powerful pattern-recognition engines capable of drafting code, translating languages, summarizing documents, and conversing naturally, all by predicting the next most logical word.'}



  Output : 'A Large Language Model (LLM) is an advanced AI program trained to understand, process, and generate human language. Think of it as a highly sophisticated autocomplete system on steroids.

Instead of understanding the world the way humans do, an LLM works purely on advanced statistics and probability.

The "Large" Part: They are trained on massive datasets (billions of pages of text) and contain billions of internal settings called parameters that help them recognize complex patterns in how words relate to one another.

How They Work: When you give an LLM a prompt, it breaks the text down into smaller pieces called tokens (words or parts of words). It then calculates the most statistically likely token to follow your text, repeating this process word-by-word to form complete sentences.

The Architecture: Modern LLMs are built on a specific blueprint called the Transformer architecture, which allows the AI to look at a whole sentence at once and understand the context of words (e.g., knowing that "bank" means a riverbank and not a financial institution based on the surrounding words).

Ultimately, they are powerful pattern-recognition engines capable of drafting code, translating languages, summarizing documents, and conversing naturally, all by predicting the next most logical word.'

Because the third model has Balanced, Clear, and Complete output.
  `

  const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const interaction = await gemini.interactions.create({
    model: "gemini-3.5-flash",
    input: `
    ${SYSTEM_PROMPT}
    Prompt: ${prompt}
            Responses:
            ${JSON.stringify(DB[0].responses)}
    `,
  });

  await fs.appendFileSync('output.md', `\n\n\n# Best Response\n ${interaction.output_text}\n\n\n---`)
}