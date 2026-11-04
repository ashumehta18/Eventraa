import React, { useState, useRef, useEffect } from 'react';
import './ChatWidget.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hi! 👋 I\'m Eventra\'s AI Assistant. Ask me about events, bookings, venues, or event planning!',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [error, setError] = useState('');

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError('');

    try {
      // Call backend chat API
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content: inputValue },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || 'Failed to get response from AI'
        );
      }

      // Add assistant message
      const assistantMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to send message');
      
      // Add error message
      const errorMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Widget Container */}
      <div className={`chat-widget ${isOpen ? 'open' : 'closed'}`}>
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-content">
            <h3>Eventra Assistant</h3>
            <p className="chat-status">Online</p>
          </div>
          <button
            className="chat-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        {/* Messages Container */}
        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message message-${message.role}`}>
              <div className="message-bubble">
                {message.content}
              </div>
              <span className="message-time">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}
          {isLoading && (
            <div className="message message-assistant">
              <div className="message-bubble typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="chat-error">
            <p>{error}</p>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask me anything..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={isLoading || !inputValue.trim()}
            aria-label="Send message"
          >
            {isLoading ? '...' : '→'}
          </button>
        </form>
      </div>

      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          className="chat-fab"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
          title="Chat with Eventra Assistant"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}
    </>
  );
};

export default ChatWidget;
