import OpenAI from "openai";
import { SettingsService } from "./settingsService";
import { supabase } from "../lib/supabase";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Document } from "@langchain/core/documents";

// Create OpenAI client instance
let openaiClient: OpenAI | null = null;
let pineconeClient: Pinecone | null = null;
let embeddings: OpenAIEmbeddings | null = null;

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

const getPineconeClient = async (): Promise<Pinecone> => {
  if (!pineconeClient) {
    const apiKey = import.meta.env.VITE_PINECONE_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Pinecone API key not found. Please set VITE_PINECONE_API_KEY environment variable."
      );
    }

    pineconeClient = new Pinecone({
      apiKey,
    });
  }
  return pineconeClient;
};

const getEmbeddings = async (): Promise<OpenAIEmbeddings> => {
  if (!embeddings) {
    let apiKey = await SettingsService.getOpenAIApiKey();
    if (!apiKey) {
      apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    }

    if (!apiKey) {
      throw new Error("OpenAI API key not found.");
    }

    embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      modelName: "text-embedding-3-small",
    });
  }
  return embeddings;
};

// Document types for embedding
export interface EmbeddingDocument {
  id: string;
  content: string;
  metadata: {
    type: string;
    title: string;
    source: string;
    timestamp: string;
  };
}

// Store document data in Supabase
export const storeDocumentInSupabase = async (
  title: string,
  content: string,
  type: string = "knowledge",
  source: string = "manual"
): Promise<string> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("embedding_documents")
      .insert({
        title,
        content,
        type,
        source,
        user_id: user.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error storing document in Supabase:", error);
    throw error;
  }
};

// Generate embeddings and store in Pinecone
export const generateAndStoreEmbeddings = async (
  title: string,
  content: string,
  type: string = "knowledge",
  source: string = "manual"
): Promise<{ success: boolean; docId: string }> => {
  try {
    // Store document in Supabase first
    const docId = await storeDocumentInSupabase(title, content, type, source);

    // Get Pinecone client and embeddings
    const pinecone = await getPineconeClient();
    const embeddingsModel = await getEmbeddings();

    // Get or create index
    const indexName = import.meta.env.VITE_PINECONE_INDEX || "crm-embeddings";
    const index = pinecone.index(indexName);

    // Create document
    const doc = new Document({
      pageContent: content,
      metadata: {
        id: docId,
        type,
        title,
        source,
        timestamp: new Date().toISOString(),
      },
    });

    // Store in Pinecone
    await PineconeStore.fromDocuments([doc], embeddingsModel, {
      pineconeIndex: index,
      namespace: "crm-knowledge",
    });

    return { success: true, docId };
  } catch (error) {
    console.error("Error generating and storing embeddings:", error);
    throw error;
  }
};

// Retrieve similar documents from Pinecone
export const getMostSimilarEmbeddings = async (
  userInput: string,
  topK: number = 3
): Promise<Document[]> => {
  try {
    const pinecone = await getPineconeClient();
    const embeddingsModel = await getEmbeddings();

    const indexName = import.meta.env.VITE_PINECONE_INDEX || "crm-embeddings";
    const index = pinecone.index(indexName);

    // Create vector store
    const vectorStore = await PineconeStore.fromExistingIndex(embeddingsModel, {
      pineconeIndex: index,
      namespace: "crm-knowledge",
    });

    // Search for similar documents
    const results = await vectorStore.similaritySearch(userInput, topK);
    return results;
  } catch (error) {
    console.error("Error retrieving similar embeddings:", error);
    return [];
  }
};

// Generate chatbot response with retrieved context
export const generateChatbotResponse = async (
  userInput: string
): Promise<string> => {
  try {
    const openai = await getOpenAIClient();

    // Get relevant context from embeddings
    const relevantDocs = await getMostSimilarEmbeddings(userInput, 3);

    // Prepare context from retrieved documents
    const context = relevantDocs
      .map((doc) => `Title: ${doc.metadata.title}\nContent: ${doc.pageContent}`)
      .join("\n\n---\n\n");

    // Create enhanced prompt with context
    const prompt = `You are a helpful CRM assistant with access to company knowledge base. Use the provided context to answer questions accurately and helpfully.

Context from knowledge base:
${context}

User Question: ${userInput}

Please provide a helpful and accurate response based on the context above. If the context doesn't contain relevant information, acknowledge this and provide general guidance.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful CRM assistant with access to a company knowledge base. Provide accurate, helpful responses based on the provided context.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return (
      response.choices[0].message.content ||
      "I'm sorry, I couldn't generate a response."
    );
  } catch (error) {
    console.error("Error generating chatbot response:", error);
    throw error;
  }
};

// Get all documents from Supabase for the current user
export const getUserDocuments = async (): Promise<any[]> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("embedding_documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching user documents:", error);
    return [];
  }
};

// Delete document from both Supabase and Pinecone
export const deleteDocument = async (docId: string): Promise<boolean> => {
  try {
    // Delete from Supabase
    const { error } = await supabase
      .from("embedding_documents")
      .delete()
      .eq("id", docId);

    if (error) throw error;

    // Note: Pinecone deletion would require vector IDs which we'd need to track
    // For now, we'll just delete from Supabase

    return true;
  } catch (error) {
    console.error("Error deleting document:", error);
    return false;
  }
};
