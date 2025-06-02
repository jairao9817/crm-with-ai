import { useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import AIChatWindow from './AIChatWindow';

export const AIChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <AIChatWindow onClose={() => setIsOpen(false)} />
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
          aria-label="Open AI Chat"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default AIChatButton;
