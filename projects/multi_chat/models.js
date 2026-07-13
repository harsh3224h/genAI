import OpenAI from 'openai';
import axios from 'axios';
import { readFile } from 'node:fs/promises';

export async function nemotron_chat(prompt) {

  const nemotron = new OpenAI({
    apiKey: process.env.NVIDIA_NEMOTRON_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
  })

  const completion = await nemotron.chat.completions.create({
    model: "nvidia/nemotron-3-ultra-550b-a55b",
    messages: [{ "role": "user", "content": prompt }],
    temperature: 1,
    top_p: 0.95,
    max_tokens: 16384,
    reasoning_budget: 16384,
    chat_template_kwargs: { "enable_thinking": true },
    stream: false
  })

  return completion.choices[0].message.content

}

export async function llama_chat(prompt) {
  console.log('Prompt:', prompt);

  const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
  const headers = {
    "Authorization": `Bearer ${process.env.LLAMA_maverick_API_KEY}`,
    "Accept": "application/json"
  };

  const payload = {
    "model": "meta/llama-4-maverick-17b-128e-instruct",
    "messages": [{ "role": "user", "content": prompt }],
    "max_tokens": 512,
    "temperature": 1.00,
    "top_p": 1.00,
    "frequency_penalty": 0.00,
    "presence_penalty": 0.00,
    "stream": false
  };

  try {
    const response = await axios.post(invokeUrl, payload, {
      headers: headers,
      responseType: 'json',
      timeout: 60000 // Forces a failure if no response after 60 seconds
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code out of 2xx
      console.error('API Error Response:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received (e.g., timeout)
      console.error('No response received from API:', error.message);
    } else {
      console.error('Request setup error:', error.message);
    }
    throw error; // Re-throw to ensure the main thread knows it failed
  }
}

export async function mistral_chat(prompt) {
  const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
  const stream = false;

  const headers = {
    "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
    "Accept": stream ? "text/event-stream" : "application/json"
  };


  const payload = {
    "model": "mistralai/mistral-small-4-119b-2603",
    "reasoning_effort": "high",
    "messages": [{ "role": "user", "content": prompt }],
    "max_tokens": 16384,
    "temperature": 0.10,
    "top_p": 1.00,
    "stream": stream
  };

  try {
    const response = await axios.post(invokeUrl, payload, {
      headers: headers,
      responseType: stream ? 'stream' : 'json',
      timeout: 60000
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Mistral API Error:', error.message);
    throw error;
  }
}

export async function phi_chat(prompt) {
  const openai = new OpenAI({
    apiKey: process.env.PHI_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
  })

  const completion = await openai.chat.completions.create({
    model: "microsoft/phi-4-mini-instruct",
    messages: [{ "role": "user", "content": prompt }],
    temperature: 0.1,
    top_p: 0.7,
    max_tokens: 1024,
    stream: false
  })

  return completion.choices[0]?.message?.content;
}