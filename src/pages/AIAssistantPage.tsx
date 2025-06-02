import React, { useRef, useEffect, useState } from "react";
import { useAIChat, type Message } from "../context/AIChatContext";
import {
  ClockIcon,
  TrashIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../components/ui/Button";

const AIAssistantPage: React.FC = () => {
  const [input, setInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const { messages, addMessage, clearHistory, isLoading, setIsLoading } =
    useAIChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter out the initial welcome message for history
  const chatHistory = messages.filter((msg) => msg.id !== "1");

  // Group messages by date
  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    msgs.forEach((msg) => {
      const date = msg.timestamp.toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });

    return groups;
  };

  const groupedHistory = groupMessagesByDate(chatHistory);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input when page loads
    if (!showHistory && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showHistory]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message to chat
    addMessage({
      content: input,
      isUser: true,
    });

    setInput("");
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call to your backend
      // const response = await fetch('/api/ai/chat', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: input }),
      // });
      // const data = await response.json();

      // Simulate API response
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add AI response to chat
      addMessage({
        content: `I received your question: "${input}". As your CRM AI Assistant, I can help you with customer data analysis, lead management, sales insights, and task automation. How can I assist you with your CRM activities today?`,
        isUser: false,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage({
        content: "Sorry, I encountered an error. Please try again later.",
        isUser: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border bg-surface">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {showHistory ? "Chat History" : "AI Assistant"}
            </h1>
            <p className="text-text-secondary">
              {showHistory
                ? "View your conversation history"
                : "Your intelligent CRM companion"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center space-x-2"
          >
            <ClockIcon className="h-5 w-5" />
            <span>{showHistory ? "Back to Chat" : "History"}</span>
          </Button>
          {showHistory && chatHistory.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to clear all chat history?"
                  )
                ) {
                  clearHistory();
                }
              }}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700"
            >
              <TrashIcon className="h-5 w-5" />
              <span>Clear History</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {showHistory ? (
          <div className="w-full h-full overflow-y-auto bg-background">
            {Object.entries(groupedHistory).length > 0 ? (
              <div className="max-w-4xl mx-auto p-6">
                <div className="space-y-6">
                  {Object.entries(groupedHistory).map(([date, msgs]) => (
                    <div
                      key={date}
                      className="bg-surface rounded-lg border border-border p-6"
                    >
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-text-primary">
                          {formatDate(new Date(date))}
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {msgs.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.isUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`rounded-lg p-4 max-w-[80%] ${
                                msg.isUser
                                  ? "bg-primary-600 text-white"
                                  : "bg-background-secondary text-text-primary border border-border"
                              }`}
                            >
                              <div className="text-sm">
                                <span className="font-medium">
                                  {msg.isUser ? "You" : "AI Assistant"}
                                </span>
                                <span className="text-xs opacity-70 ml-2">
                                  {msg.timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <div className="mt-1">{msg.content}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <ClockIcon className="h-16 w-16 text-text-secondary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    No chat history yet
                  </h3>
                  <p className="text-text-secondary">
                    Start a conversation to see your history here
                  </p>
                  <Button
                    onClick={() => setShowHistory(false)}
                    className="mt-4"
                  >
                    Start Chatting
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg p-4 max-w-[80%] ${
                        message.isUser
                          ? "bg-primary-600 text-white"
                          : "bg-surface text-text-primary border border-border shadow-sm"
                      }`}
                    >
                      <div className="text-sm mb-1">
                        <span className="font-medium">
                          {message.isUser ? "You" : "AI Assistant"}
                        </span>
                        <span
                          className={`text-xs ml-2 ${
                            message.isUser
                              ? "text-primary-100"
                              : "text-text-secondary"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-surface text-text-primary border border-border rounded-lg p-4 shadow-sm">
                      <div className="text-sm font-medium mb-1">
                        AI Assistant
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="animate-pulse flex space-x-1">
                          <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-text-secondary text-sm">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Form */}
            <div className="border-t border-border bg-surface p-6">
              <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="flex space-x-4">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about your CRM data, customers, or business insights..."
                    className="flex-1 px-4 py-3 border border-border rounded-lg bg-background text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="px-6 py-3 flex items-center space-x-2"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                    <span>Send</span>
                  </Button>
                </form>

                {/* Quick Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setInput("Show me my recent deals")}
                    className="px-3 py-1 text-sm bg-background-secondary hover:bg-background-tertiary text-text-secondary rounded-md border border-border transition-colors"
                  >
                    Show recent deals
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput("What are my pending tasks?")}
                    className="px-3 py-1 text-sm bg-background-secondary hover:bg-background-tertiary text-text-secondary rounded-md border border-border transition-colors"
                  >
                    Pending tasks
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput("Analyze my sales performance")}
                    className="px-3 py-1 text-sm bg-background-secondary hover:bg-background-tertiary text-text-secondary rounded-md border border-border transition-colors"
                  >
                    Sales analysis
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput("Help me find hot leads")}
                    className="px-3 py-1 text-sm bg-background-secondary hover:bg-background-tertiary text-text-secondary rounded-md border border-border transition-colors"
                  >
                    Find hot leads
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistantPage;
