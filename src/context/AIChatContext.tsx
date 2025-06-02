import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIChatContextType {
  messages: Message[];
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  clearHistory: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

const CHAT_HISTORY_KEY = "crm_ai_chat_history";

export const AIChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load messages from localStorage on initial render
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(CHAT_HISTORY_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Convert string timestamps back to Date objects
          return parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
        } catch (e) {
          console.error("Failed to parse chat history", e);
        }
      }
    }
    // Default welcome message
    return [
      {
        id: "1",
        content:
          "Hello! I'm your CRM assistant. Ask me anything about your contacts, deals, tasks, or any other CRM data.",
        isUser: false,
        timestamp: new Date(),
      },
    ];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const addMessage = (message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const clearHistory = () => {
    setMessages([
      {
        id: "1",
        content:
          "Hello! I'm your CRM assistant. Ask me anything about your contacts, deals, tasks, or any other CRM data.",
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <AIChatContext.Provider
      value={{ messages, addMessage, clearHistory, isLoading, setIsLoading }}
    >
      {children}
    </AIChatContext.Provider>
  );
};

export const useAIChat = (): AIChatContextType => {
  const context = useContext(AIChatContext);
  if (context === undefined) {
    throw new Error("useAIChat must be used within an AIChatProvider");
  }
  return context;
};
