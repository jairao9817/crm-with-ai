import { useRef, useEffect, useState } from 'react';
import { XMarkIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAIChat, type Message } from '../../context/AIChatContext';

type FormEvent = React.FormEvent<HTMLFormElement>;

interface AIChatWindowProps {
  onClose: () => void;
}

const AIChatWindow: React.FC<AIChatWindowProps> = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const { messages, addMessage, clearHistory, isLoading, setIsLoading } = useAIChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Filter out the initial welcome message for history
  const chatHistory = messages.filter(msg => msg.id !== '1');
  const userMessages = chatHistory.filter(msg => msg.isUser);
  
  // Group messages by date
  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    msgs.forEach(msg => {
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showHistory]);
  
  useEffect(() => {
    // Focus input when chat window opens
    if (!showHistory) {
      inputRef.current?.focus();
    }
  }, [showHistory]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message to chat
    addMessage({
      content: input,
      isUser: true,
    });
    
    setInput('');
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
        content: `I received your question: "${input}"`,
        isUser: false,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({
        content: 'Sorry, I encountered an error. Please try again later.',
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
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-96 h-[600px] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-md"
            aria-label={showHistory ? 'Hide history' : 'Show history'}
          >
            <ClockIcon className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {showHistory ? 'Chat History' : 'CRM Assistant'}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {showHistory && chatHistory.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all chat history?')) {
                  clearHistory();
                }
              }}
              className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-md"
              aria-label="Clear history"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1 rounded-md"
            aria-label="Close chat"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {showHistory ? (
          <div className="w-full h-full overflow-y-auto bg-gray-50 dark:bg-gray-800">
            {Object.entries(groupedHistory).length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {Object.entries(groupedHistory).map(([date, msgs]) => (
                  <div key={date} className="py-2">
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {formatDate(new Date(date))}
                    </div>
                    <div className="space-y-1">
                      {msgs.map(msg => (
                        <button
                          key={msg.id}
                          onClick={() => {
                            const messageIndex = messages.findIndex(m => m.id === msg.id);
                            if (messageIndex !== -1) {
                              setShowHistory(false);
                            }
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 truncate"
                        >
                          <span className="font-medium">
                            {msg.isUser ? 'You' : 'Assistant'}:
                          </span>{' '}
                          <span className="truncate">{msg.content}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                No chat history yet
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`rounded-lg p-3 max-w-[80%] ${
                        message.isUser
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-[80%] rounded-bl-none">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <form onSubmit={handleSubmit} className="flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about your CRM..."
                  className="flex-1 rounded-l-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white px-4 py-2 text-sm"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as unknown as FormEvent);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatWindow;
