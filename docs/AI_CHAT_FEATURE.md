# AI Chat Feature Documentation

## Overview
The AI Chat feature is a powerful assistant integrated into the CRM that allows users to ask questions about their CRM data, including contacts, deals, tasks, and more. The chat interface is accessible from any page in the application through a floating action button.

## Features

### 1. Chat Interface
- **Floating Action Button**: Accessible from any page in the bottom-right corner
- **Real-time Messaging**: Send and receive messages instantly
- **Message History**: View past conversations
- **Loading States**: Visual feedback when waiting for responses
- **Error Handling**: Clear error messages when something goes wrong

### 2. Message History
- **Persistent Storage**: Chat history is saved in the browser's local storage
- **Date Grouping**: Messages are grouped by date (Today, Yesterday, etc.)
- **Quick Access**: Easily navigate to previous conversations

### 3. User Experience
- **Responsive Design**: Works on all screen sizes
- **Dark Mode Support**: Automatically adapts to the current theme
- **Keyboard Navigation**: Use Enter to send messages
- **Accessible**: Proper ARIA labels and keyboard support

## Technical Implementation

### Components

#### 1. AIChatButton
- **Location**: `src/components/ai-chat/AIChatButton.tsx`
- **Purpose**: Floating action button that toggles the chat window
- **Props**: None
- **State**: Manages chat window visibility

#### 2. AIChatWindow
- **Location**: `src/components/ai-chat/AIChatWindow.tsx`
- **Purpose**: Main chat interface component
- **Props**:
  - `onClose`: Function to close the chat window
- **State**:
  - `input`: Current message input
  - `showHistory`: Toggle for history panel
  - Uses `useAIChat` hook for message management

#### 3. AIChatContext
- **Location**: `src/context/AIChatContext.tsx`
- **Purpose**: Manages chat state and persistence
- **Context Value**:
  - `messages`: Array of message objects
  - `addMessage`: Function to add a new message
  - `clearHistory`: Function to clear chat history
  - `isLoading`: Loading state
  - `setIsLoading`: Function to update loading state

## Integration

### 1. App Integration
The chat feature is integrated into the main application through the `AIChatProvider`:

```tsx
// In App.tsx
<AIChatProvider>
  <Router>
    <AppRouter />
  </Router>
</AIChatProvider>
```

### 2. Layout Integration
The chat button is added to the main layout component:

```tsx
// In Layout.tsx
<Layout>
  {/* Other layout components */}
  <AIChatButton />
</Layout>
```

## Usage

### Basic Usage
1. Click the chat icon in the bottom-right corner to open the chat window
2. Type your question in the input field
3. Press Enter or click Send to submit
4. View responses in the chat window
5. Click the clock icon to view chat history

### Viewing History
1. Click the clock icon in the chat header
2. Browse through your conversation history grouped by date
3. Click on a message to view it in the chat

### Clearing History
1. Open the chat history panel
2. Click the trash icon in the top-right corner
3. Confirm to clear all chat history

## API Integration (Future)

The current implementation includes a mock response system. To connect to a real API:

1. Update the `handleSubmit` function in `AIChatWindow.tsx`
2. Replace the mock response with an actual API call:

```typescript
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
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });
    
    const data = await response.json();
    
    // Add AI response to chat
    addMessage({
      content: data.response,
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
```

## Styling

The chat interface uses Tailwind CSS for styling. Customize the appearance by modifying the class names in the components.

## Testing

To test the chat feature:
1. Open the application in a browser
2. Click the chat button
3. Send test messages
4. Verify that messages are displayed correctly
5. Test the history functionality
6. Verify that the chat works in both light and dark modes

## Known Issues

- Currently uses mock responses
- No rate limiting implemented
- No message persistence across devices

## Future Enhancements

1. **Real-time Updates**: Implement WebSocket for real-time message updates
2. **Typing Indicators**: Show when the AI is typing
3. **Message Reactions**: Add emoji reactions to messages
4. **File Attachments**: Support for sending and receiving files
5. **Rich Text**: Support for markdown or rich text in messages
6. **Search**: Search through message history
7. **Export**: Export chat history as text or PDF

## Dependencies

- React 18+
- TypeScript
- Tailwind CSS
- Heroicons (for icons)

## Browser Support

The chat feature is tested on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility

The chat interface includes:
- Keyboard navigation
- ARIA labels
- Proper focus management
- High contrast support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Your License Here]
