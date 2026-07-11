import { OpenAI } from 'openai';
import 'dotenv/config'

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
})

async function main() {
  const completion = await openai.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [{ "role": "user", "content": "Hello, how are you" }],
    temperature: 1,
    top_p: 1,
    max_tokens: 4096,
    stream: false
  })

  const reasoning = completion.choices[0]?.message?.reasoning_content;
  if (reasoning) process.stdout.write(reasoning + "\n");
  process.stdout.write(completion.choices[0]?.message?.content);

}

main();