import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWindow from './ChatWindow';
import './ChatWidget.css';

interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark';
  showWelcomeMessage?: boolean;
  minimized?: boolean;
  className?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  position = 'bottom-right',
  theme = 'light',
  showWelcomeMessage = true,

  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        if (isOpen) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle new messages when chat is closed
  const handleNewMessage = () => {
    if (!isOpen) {
      setHasNewMessage(true);
      setUnreadCount(prev => prev + 1);
    }
  };

  // Clear notifications when opening chat
  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
      setUnreadCount(0);
    }
  };

  const getPositionClasses = () => {
    const baseClasses = 'chat-widget';
    switch (position) {
      case 'bottom-left':
        return `${baseClasses} chat-widget--bottom-left`;
      case 'top-right':
        return `${baseClasses} chat-widget--top-right`;
      case 'top-left':
        return `${baseClasses} chat-widget--top-left`;
      default:
        return `${baseClasses} chat-widget--bottom-right`;
    }
  };

  const chatButtonVariants = {
    initial: { scale: 0, rotate: 0 },
    animate: { 
      scale: 1, 
      rotate: isOpen ? 45 : 0,
      transition: { 
        type: "tween" as const, 
        ease: "linear" as const,
        duration: 0.3
      } 
    },
    hover: { 
      scale: 1.1,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  const chatWindowVariants = {
    initial: { 
      opacity: 0, 
      scale: 0.8, 
      y: position.includes('bottom') ? 20 : -20 
    },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring" as const, 
        stiffness: 300, 
        damping: 30 
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: position.includes('bottom') ? 20 : -20,
      transition: { duration: 0.2 }
    }
  };

  const pulseVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };

  return (
    <div 
      ref={widgetRef} 
      className={`${getPositionClasses()} chat-widget--${theme} ${className}`}
    >
      {/* Welcome Message Tooltip */}
      <AnimatePresence>
        {showWelcomeMessage && !isOpen && hasNewMessage && (
          <motion.div
            className="chat-widget__welcome"
            initial={{ opacity: 0, x: position.includes('right') ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: position.includes('right') ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="chat-widget__welcome-content">
              Hi! How can I help you today?
            </div>
            <div className="chat-widget__welcome-arrow" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-widget__window"
            variants={chatWindowVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ChatWindow
              onNewMessage={handleNewMessage}
              onClose={() => setIsOpen(false)}
              theme={theme}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button */}
      <motion.button
        className={`chat-widget__toggle ${hasNewMessage ? 'chat-widget__toggle--has-notification' : ''}`}
        onClick={handleToggleChat}
        variants={chatButtonVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {/* Notification Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              className="chat-widget__badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse Effect */}
        {hasNewMessage && (
          <motion.div
            className="chat-widget__pulse"
            variants={pulseVariants}
            initial="initial"
            animate="animate"
          />
        )}

        {/* Button Icon */}
        <div className="chat-widget__icon">
          {isOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </motion.button>
    </div>
  );
};

export default ChatWidget;