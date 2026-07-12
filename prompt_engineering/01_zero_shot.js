import { OpenAI } from 'openai';
import 'dotenv/config'

const client = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
})

async function main() {
  const result = await client.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [{ role: 'user', content: 'Tell me the story about little red ridding hood' }]
  });

  console.log(`Answer from gpt -> `, result.choices[0].message.content)
}

main();