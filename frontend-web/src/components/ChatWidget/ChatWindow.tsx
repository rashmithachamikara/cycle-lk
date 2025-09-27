import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import chatbotService from '../../services/chatbotService';
import './ChatWindow.css';

interface ChatWindowProps {
  onNewMessage?: () => void;
  onClose?: () => void;
  theme?: 'light' | 'dark';
  sessionId?: string;
}

interface Message {
  messageId: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: Record<string, unknown>[];
  needsHumanSupport?: boolean;
  isLoading?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  onNewMessage,
  onClose,
  theme = 'light',
  sessionId: propSessionId
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(propSessionId || null);
  const [isOnline, setIsOnline] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const addWelcomeMessage = useCallback(() => {
    const welcomeMessage: Message = {
      messageId: 'welcome_' + Date.now(),
      type: 'bot',
      content: "Hi! I'm here to help you with bike rentals, locations, bookings, and more. How can I assist you today?",
      timestamp: new Date(),
      suggestions: [
        "Find bikes near me",
        "How to rent a bike?",
        "Check availability",
        "What payment methods do you accept?",
        "What safety features do you provide?",
        "View locations"
      ]
    };
    setMessages([welcomeMessage]);
  }, []);

  const loadChatHistory = useCallback(async (sessionId: string) => {
    try {
      const result = await chatbotService.getChatHistory(sessionId, 20);
      if (result.success && result.history && result.history.length > 0) {
        const formattedMessages = result.history
          .map(msg => chatbotService.formatMessage(msg))
          .filter(msg => msg.messageId) as Message[];
        setMessages(formattedMessages);
      } else {
        addWelcomeMessage();
      }
    } catch {
      addWelcomeMessage();
    }
  }, [addWelcomeMessage]);

  const checkChatbotStatus = useCallback(async () => {
    try {
      const result = await chatbotService.getChatbotStatus();
      setIsOnline(result.success && result.status.online);
    } catch {
      setIsOnline(false);
    }
  }, []);

  // Initialize chat session and load history
  useEffect(() => {
    const initializeChat = async () => {
      // Get or create session ID
      const savedSessionId = propSessionId || chatbotService.getSavedSessionId();
      
      if (savedSessionId) {
        setSessionId(savedSessionId);
        // Load chat history
        await loadChatHistory(savedSessionId);
      } else {
        // Create new session
        const newSessionId = chatbotService.generateSessionId();
        setSessionId(newSessionId);
        chatbotService.saveSessionId(newSessionId);
        
        // Add welcome message
        addWelcomeMessage();
      }
      
      // Check chatbot status
      checkChatbotStatus();
    };

    initializeChat();
  }, [propSessionId, loadChatHistory, addWelcomeMessage, checkChatbotStatus]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      messageId: 'user_' + Date.now(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInputValue('');
    
    // Maintain focus on input field
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    // Add loading message
    const loadingMessage: Message = {
      messageId: 'loading_' + Date.now(),
      type: 'bot',
      content: 'Thinking...',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Send message to chatbot
      const result = await chatbotService.sendMessage(content, sessionId);

      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading));

      if (result.success && result.data) {
        // Add bot response
        const botMessage: Message = {
          messageId: result.data.messageId || 'bot_' + Date.now(),
          type: 'bot',
          content: result.data.message,
          timestamp: new Date(result.data.timestamp || Date.now()),
          suggestions: result.data.suggestions,
          actions: result.data.actions,
          needsHumanSupport: result.data.needsHumanSupport
        };

        setMessages(prev => [...prev, botMessage]);
        
        // Update session ID if provided
        if (result.data.sessionId && result.data.sessionId !== sessionId) {
          setSessionId(result.data.sessionId);
          chatbotService.saveSessionId(result.data.sessionId);
        }

        // Notify parent component
        onNewMessage?.();
      } else {
        // Add fallback response
        const fallbackMessage: Message = {
          messageId: 'fallback_' + Date.now(),
          type: 'bot',
          content: result.fallbackResponse?.message || 
                  "I'm sorry, I'm having trouble understanding. Could you please try rephrasing your question?",
          timestamp: new Date(),
          suggestions: result.fallbackResponse?.suggestions,
          needsHumanSupport: result.fallbackResponse?.needsHumanSupport
        };

        setMessages(prev => [...prev, fallbackMessage]);
      }
    } catch {
      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading));

      // Add error message
      const errorMessage: Message = {
        messageId: 'error_' + Date.now(),
        type: 'bot',
        content: "I'm sorry, I'm experiencing technical difficulties. Please try again later or contact our support team.",
        timestamp: new Date(),
        needsHumanSupport: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Restore focus to input after response is received
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
    // Maintain focus after suggestion click
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleClearChat = async () => {
    if (!sessionId) return;

    try {
      await chatbotService.clearChatHistory(sessionId);
      setMessages([]);
      addWelcomeMessage();
      
      // Generate new session
      const newSessionId = chatbotService.generateSessionId();
      setSessionId(newSessionId);
      chatbotService.saveSessionId(newSessionId);
    } catch {
      // Silently fail
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-window chat-window--${theme}`}>
      {/* Header */}
      <div className="chat-window__header">
        <div className="chat-window__header-info">
          <div className="chat-window__title">
            <span className="chat-window__brand">CycleBot Assistant</span>
            <div className={`chat-window__status ${isOnline ? 'chat-window__status--online' : 'chat-window__status--offline'}`}>
              <span className="chat-window__status-dot" />
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
        
        <div className="chat-window__header-actions">
          {/* Clear Chat Button */}
          <button
            className="chat-window__action-btn"
            onClick={handleClearChat}
            title="Clear chat"
            disabled={isLoading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          
          {/* Close Button */}
          {onClose && (
            <button
              className="chat-window__action-btn"
              onClick={onClose}
              title="Close chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-window__messages">
        {messages.map((message) => (
          <div
            key={message.messageId}
            className={`message ${message.type === 'user' ? 'message--user' : 'message--bot'} ${message.isLoading ? 'message--loading' : ''}`}
          >
            <div className="message__content">
              {message.type === 'bot' ? (
                <ReactMarkdown
                  components={{
                    // Customize rendering for better styling
                    ul: ({ children }) => <ul className="message__list">{children}</ul>,
                    ol: ({ children }) => <ol className="message__list message__list--ordered">{children}</ol>,
                    li: ({ children }) => <li className="message__list-item">{children}</li>,
                    strong: ({ children }) => <strong className="message__strong">{children}</strong>,
                    em: ({ children }) => <em className="message__emphasis">{children}</em>,
                    p: ({ children }) => <p className="message__paragraph">{children}</p>,
                    h1: ({ children }) => <h1 className="message__heading message__heading--1">{children}</h1>,
                    h2: ({ children }) => <h2 className="message__heading message__heading--2">{children}</h2>,
                    h3: ({ children }) => <h3 className="message__heading message__heading--3">{children}</h3>,
                    code: ({ children, className }) => 
                      className?.includes('language-') ? (
                        <pre className="message__code-block"><code className="message__code">{children}</code></pre>
                      ) : (
                        <code className="message__code">{children}</code>
                      ),
                    blockquote: ({ children }) => <blockquote className="message__quote">{children}</blockquote>,
                    a: ({ children, href }) => (
                      <a 
                        href={href} 
                        className="message__link" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    )
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                message.content
              )}
              {message.isLoading && (
                <div className="message__typing">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
            </div>
            <div className="message__time">
              {formatTime(message.timestamp)}
            </div>
            
            {/* Suggestions */}
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="message__suggestions">
                {message.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion-btn"
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isLoading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-window__input">
        <div className="message-input">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(inputValue);
              }
            }}
            placeholder={isOnline ? "Type your message..." : "Chatbot is offline"}
            disabled={isLoading || !isOnline}
            className="message-input__field"
          />
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={isLoading || !isOnline || !inputValue.trim()}
            className="message-input__send"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="chat-window__offline-banner">
          <span>🔴 Chatbot is currently offline. Please try again later.</span>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
