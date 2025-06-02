import OpenAI from "openai";
import { SettingsService } from "./settingsService";

// Create OpenAI client instance
let openaiClient: OpenAI | null = null;

const getOpenAIClient = async (): Promise<OpenAI> => {
  // Try to get API key from user settings first
  let apiKey = await SettingsService.getOpenAIApiKey();

  // Fallback to environment variable if no user key is set
  if (!apiKey) {
    apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  }

  if (!apiKey) {
    throw new Error(
      "OpenAI API key not found. Please add your API key in Settings or set VITE_OPENAI_API_KEY environment variable."
    );
  }

  // Create new client if it doesn't exist or if the API key has changed
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // Note: In production, this should be handled server-side
    });
  }

  return openaiClient;
};

// generate embeddings from a string
export const generateEmbeddings = async (input: string): Promise<any> => {
  const openai = await getOpenAIClient();
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input,
  });
  return response.data[0].embedding;
};

// save embeddings to a vector store supabase
// on asking a question, we will use the vector store to find the most similar embeddings and then use the chatbot to generate a response

// generate chatbot response
export const generateChatbotResponse = async (input: any): Promise<any> => {
  const openai = await getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: input.message }],
  });
  return response.choices[0].message.content;
};
