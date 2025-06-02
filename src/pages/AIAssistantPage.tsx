import React, { useRef, useEffect, useState } from "react";
import { useAIChat, type Message } from "../context/AIChatContext";
import {
  ClockIcon,
  TrashIcon,
  PaperAirplaneIcon,
  DocumentPlusIcon,
  BookOpenIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../components/ui/Button";
import {
  generateChatbotResponse,
  generateAndStoreEmbeddings,
  getUserDocuments,
  deleteDocument,
} from "../services/chatbotService";
import { getAllDummyData } from "../services/getAllDataForEmbadding";

interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  type: string;
  source: string;
  created_at: string;
}

const AIAssistantPage: React.FC = () => {
  const [input, setInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  // Add document form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocContent, setNewDocContent] = useState("");
  const [newDocType, setNewDocType] = useState("knowledge");
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  const { messages, addMessage, clearHistory, isLoading, setIsLoading } =
    useAIChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter out the initial welcome message for history
  const chatHistory = messages.filter((msg) => msg.id !== "1");

  // Load knowledge documents when knowledge tab is opened
  useEffect(() => {
    if (showKnowledge) {
      loadKnowledgeDocs();
    }
  }, [showKnowledge]);

  const loadKnowledgeDocs = async () => {
    setIsLoadingDocs(true);
    try {
      const docs = await getUserDocuments();
      setKnowledgeDocs(docs);
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

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
    if (!showHistory && !showKnowledge && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showHistory, showKnowledge]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message to chat
    addMessage({
      content: input,
      isUser: true,
    });

    const userInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await generateChatbotResponse(userInput);
      // Add AI response to chat
      addMessage({
        content: response,
        isUser: false,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage({
        content:
          "Sorry, I encountered an error. Please try again later. Make sure your OpenAI API key is configured in Settings.",
        isUser: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !newDocContent.trim()) return;

    setIsAddingDoc(true);
    try {
      await generateAndStoreEmbeddings(
        newDocTitle,
        newDocContent,
        newDocType,
        "manual"
      );

      // Reset form
      setNewDocTitle("");
      setNewDocContent("");
      setNewDocType("knowledge");
      setShowAddForm(false);

      // Reload documents
      await loadKnowledgeDocs();

      addMessage({
        content: `Successfully added "${newDocTitle}" to the knowledge base!`,
        isUser: false,
      });
    } catch (error) {
      console.error("Error adding document:", error);
      addMessage({
        content:
          "Sorry, I couldn't add the document to the knowledge base. Please check your API keys and try again.",
        isUser: false,
      });
    } finally {
      setIsAddingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const success = await deleteDocument(docId);
      if (success) {
        await loadKnowledgeDocs();
        addMessage({
          content: `Successfully deleted "${title}" from the knowledge base.`,
          isUser: false,
        });
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleLoadDummyData = async () => {
    const dummyData = getAllDummyData();
    setIsLoadingDocs(true);

    try {
      for (const item of dummyData) {
        await generateAndStoreEmbeddings(
          item.title,
          item.content,
          item.type,
          item.source
        );
      }

      await loadKnowledgeDocs();
      addMessage({
        content: `Successfully loaded ${dummyData.length} dummy documents into the knowledge base!`,
        isUser: false,
      });
    } catch (error) {
      console.error("Error loading dummy data:", error);
      addMessage({
        content:
          "Sorry, I couldn't load the dummy data. Please check your API keys and try again.",
        isUser: false,
      });
    } finally {
      setIsLoadingDocs(false);
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
              {showHistory
                ? "Chat History"
                : showKnowledge
                ? "Knowledge Base"
                : "AI Assistant"}
            </h1>
            <p className="text-text-secondary">
              {showHistory
                ? "View your conversation history"
                : showKnowledge
                ? "Manage your knowledge base for better AI responses"
                : "Your intelligent CRM companion"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={() => {
              setShowKnowledge(false);
              setShowHistory(!showHistory);
            }}
            className="flex items-center space-x-2"
          >
            <ClockIcon className="h-5 w-5" />
            <span>{showHistory ? "Back to Chat" : "History"}</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setShowHistory(false);
              setShowKnowledge(!showKnowledge);
            }}
            className="flex items-center space-x-2"
          >
            <BookOpenIcon className="h-5 w-5" />
            <span>{showKnowledge ? "Back to Chat" : "Knowledge"}</span>
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
        {showKnowledge ? (
          <div className="w-full h-full overflow-y-auto bg-background">
            <div className="max-w-4xl mx-auto p-6">
              {/* Knowledge Base Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-2">
                    Knowledge Base Management
                  </h2>
                  <p className="text-text-secondary">
                    Add documents to improve AI responses. The AI will use this
                    knowledge to answer questions more accurately.
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleLoadDummyData}
                    disabled={isLoadingDocs}
                    className="flex items-center space-x-2"
                  >
                    <DocumentPlusIcon className="h-5 w-5" />
                    <span>Load Sample Data</span>
                  </Button>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center space-x-2"
                  >
                    <DocumentPlusIcon className="h-5 w-5" />
                    <span>Add Document</span>
                  </Button>
                </div>
              </div>

              {/* Add Document Form */}
              {showAddForm && (
                <div className="bg-surface rounded-lg border border-border p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-text-primary">
                      Add New Document
                    </h3>
                    <Button
                      variant="ghost"
                      onClick={() => setShowAddForm(false)}
                      className="p-1"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </Button>
                  </div>
                  <form onSubmit={handleAddDocument} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={newDocTitle}
                        onChange={(e) => setNewDocTitle(e.target.value)}
                        placeholder="Enter document title..."
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Type
                      </label>
                      <select
                        value={newDocType}
                        onChange={(e) => setNewDocType(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="knowledge">Knowledge</option>
                        <option value="faq">FAQ</option>
                        <option value="policy">Policy</option>
                        <option value="procedure">Procedure</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Content
                      </label>
                      <textarea
                        value={newDocContent}
                        onChange={(e) => setNewDocContent(e.target.value)}
                        placeholder="Enter document content..."
                        rows={8}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          isAddingDoc ||
                          !newDocTitle.trim() ||
                          !newDocContent.trim()
                        }
                        className="flex items-center space-x-2"
                      >
                        {isAddingDoc ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <CheckIcon className="h-4 w-4" />
                        )}
                        <span>
                          {isAddingDoc ? "Adding..." : "Add Document"}
                        </span>
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Documents List */}
              {isLoadingDocs ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : knowledgeDocs.length > 0 ? (
                <div className="space-y-4">
                  {knowledgeDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-surface rounded-lg border border-border p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-text-primary">
                            {doc.title}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm text-text-secondary mt-1">
                            <span className="px-2 py-1 bg-background-secondary rounded-md capitalize">
                              {doc.type}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(doc.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() =>
                            handleDeleteDocument(doc.id, doc.title)
                          }
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-text-secondary text-sm line-clamp-3">
                        {doc.content.substring(0, 200)}...
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpenIcon className="h-16 w-16 text-text-secondary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    No documents yet
                  </h3>
                  <p className="text-text-secondary mb-4">
                    Add documents to improve AI responses with your company's
                    knowledge.
                  </p>
                  <div className="flex justify-center space-x-2">
                    <Button onClick={handleLoadDummyData} variant="ghost">
                      Load Sample Data
                    </Button>
                    <Button onClick={() => setShowAddForm(true)}>
                      Add Your First Document
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : showHistory ? (
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
                    onClick={() => setInput("What are the CRM best practices?")}
                    className="px-3 py-1 text-sm bg-background-secondary hover:bg-background-tertiary text-text-secondary rounded-md border border-border transition-colors"
                  >
                    CRM best practices
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setInput("How should I handle price objections?")
                    }
                    className="px-3 py-1 text-sm bg-background-secondary hover:bg-background-tertiary text-text-secondary rounded-md border border-border transition-colors"
                  >
                    Handle objections
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput("What's our onboarding process?")}
                    className="px-3 py-1 text-sm bg-background-secondary hover:bg-background-tertiary text-text-secondary rounded-md border border-border transition-colors"
                  >
                    Onboarding process
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput("Tell me about our pricing tiers")}
                    className="px-3 py-1 text-sm bg-background-secondary hover:bg-background-tertiary text-text-secondary rounded-md border border-border transition-colors"
                  >
                    Pricing information
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
