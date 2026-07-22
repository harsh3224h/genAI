import { google } from "@ai-sdk/google";

// Fast & cost-effective alternative to gpt-4o-mini
export const DEFAULT_CHAT_MODEL = "gemini-3.6-flash"; 

export function getChatModel(modelId: string | null) {
  return google(modelId || DEFAULT_CHAT_MODEL);
}