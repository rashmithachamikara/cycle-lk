// Main ChatWidget export
export { default as ChatWidget } from './ChatWidget';
export { default as ChatWindow } from './ChatWindow';

// Types
export interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark';
  showWelcomeMessage?: boolean;
  className?: string;
}

export interface ChatWindowProps {
  onNewMessage?: () => void;
  onClose?: () => void;
  theme?: 'light' | 'dark';
  sessionId?: string;
}