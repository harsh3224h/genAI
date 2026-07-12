import { OpenAI } from 'openai';
import 'dotenv/config'

const client = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
})

const SYSTEM_PROMPT = `
You are an expert AI engineer.
you have to analyze user input carefully.
you need to breakdown the problem into many subrpoblems before jumping to the final result.
Always breakdown the user's intention and how to solve that problem and then 
step by step solve it.

We are going to follow the pipeline of "INITIAL", "THINK", "ANALYZE", and "OUTPUT" pipeline.

The pipeline :
  "INITIAL" when user gives input, we will have initial thought process on what this user it trying to do.
  "THINK" This is where we are going to think about how to solve this and then start to breakdown the problem
  "ANALYZE" This is where we will analyze the solution and also verify if the output is correct.
  "THINK" we can go back to think to check if any sub problem remains and think
  "ANALYZE" again analyze the problem and get back to the solution
  "OUTPUT" this is where we can end and give the final output to the user

  Rules: 
  - Always output one step at a time and wait for other step before proceeding.
  -always maintian the sequence of pipeline as given in sample
  -always follow JSON output format strictly

  Example: 
  -"USER": What is 2+2-5*10/3?

  OUTPUT:
  - "INITIAL": "user wnats me to solve the maths equation"
  - "THINK": "I will use the BODMAS formula and based on that I should first multiply 5*10 which is 50"
  - "ANALYZE": "Yes, the bodmas is actually right and now the equation is  2+2-50/3 "
  - "THINK": "Now as per rule I should perform divide which is dividing 50/3 which is 16.66667"
  - "ANALYZE": "Now the new equation remains 2+2-16.66667"
  - "THINK": "Now it's simple we can just do 2+2 = 4 and new equation remains 4-16.66667"
  - "ANALYZE": "Great, now let's just do the final step as simple subtraction"
  - "THINK": "After the final subtraction, the answer is -12.66667"
  - "OUTPUT": "The final output is -12.66667"



  Output Format: 
  {"step": "INITIAL" | "THINK" | "ANALYZE" | "OUTPUT", "text" : "<The actual text>"}
`

const MESSAGES_DB = [
  { role: 'system', content: SYSTEM_PROMPT },

]

function parseFirstJSON(raw) {
  const trimmed = raw.trim()
  // Try first line first (handles one-JSON-per-line case)
  const firstLine = trimmed.split('\n')[0]
  try {
    return JSON.parse(firstLine)
  } catch {
    // fallback: find the first balanced {...}
    const match = trimmed.match(/\{[\s\S]*?\}(?=\s*\{|\s*$)/)
    if (match) return JSON.parse(match[0])
    throw new Error('Could not parse JSON from model output: ' + raw)
  }
}

async function main(prompt = '') {
  MESSAGES_DB.push({ role: 'user', content: prompt })

  while (true) {

    const result = await client.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: MESSAGES_DB
    });

    const rawResult = result.choices[0].message.content
    const parsed_result = parseFirstJSON(rawResult)

    MESSAGES_DB.push({ role: 'assistant', content: rawResult })

    console.log(`🤖 ${parsed_result.step}: ${parsed_result.text}`)

    if (parsed_result.step === 'OUTPUT') break;

  }
  // console.log(`Answer from gpt -> `, result.choices[0].message.content)
}

main('What is weather of Gundana');