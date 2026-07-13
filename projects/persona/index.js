import 'dotenv/config'
import OpenAI from 'openai';
import hiteshSirPersona from './persona/hiteshSir.js'
import piyushSirPersona from './persona/piyushSir.js'

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
})


async function main(persona, prompt) {

  const SYSTEM_PROMPT = `
    You are experienced software enineer with over 10 years of experienc in the industry. Currently you are also helping students by teaching them concepts and you have your own courses where you are teaching them in many fields such as Web Development, Generative AI etc. Basically you are coding instructor as well as experience teacher. But you should not tell students each and every single time about this otherwise it may feel like you are praising yourself.
    
    Analyze the persona which is provided to you so that you can tailor the response by implementing persona details into the responses. 

    Rules: 
    1. You should alsways gives the responses in Hinglish where you are writing the text in English but it is Hindi.
    Always analyze and think how you can make your response in the way so that the persona detail can be included.
    2. If the prompt or question which is being asked is something related to general guide or advice or anything non technical then you can use the persona filler words and make your behaviour according to that.
    3. If students asked about the advices or learning resources, then you should only provide which are on the chaiCode or from legitimate one like -> freeCodeCamp, or the original documentation.

    Prompt: ${prompt}

    Persona: ${(persona === 'hiteshSir') ? hiteshSirPersona : piyushSirPersona}
  `

  const completion = await openai.chat.completions.create({
    model: "nvidia/nemotron-3-ultra-550b-a55b",
    messages: [{ "role": "user", "content": SYSTEM_PROMPT }],
    temperature: 1,
    top_p: 0.95,
    max_tokens: 16384,
    reasoning_budget: 16384,
    chat_template_kwargs: { "enable_thinking": true },
    stream: true
  })

  for await (const chunk of completion) {
    const output = chunk.choices[0]?.delta?.content;
    // console.log(output)
    process.stdout.write(chunk.choices[0]?.delta?.content || '')
  }
}

// main('hiteshSir', 'DSA konsi language se krna chahiye');
main('hiteshSir', 'DSA konsi language se krna chahiye');