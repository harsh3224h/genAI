import { OpenAI } from 'openai';
import 'dotenv/config'

const client = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
})

async function main() {
  const result = await client.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [{
      role: 'user', content: `What is 2+5 equals 

      do not add  anything else in the answer, take samples from examples

      Examples:
      - What is 5+4?
        Expected outcome: 9 (Nine)
      - What is 10+10?
        Expected outcome: 20 (Twenty)
      ` }]
  });

  console.log(`Answer from gpt -> `, result.choices[0].message.content)
}

main();