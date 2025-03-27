import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface ChatUser {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  date: Date;
  img?: string;
  unsent?: boolean;
}

interface ChatState {
  chatId: string;
  user: ChatUser | null;
  messages: Message[];
}

type ChatAction =
  | { type: 'CHANGE_USER'; payload: ChatUser }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UNSEND_MESSAGE'; payload: string }
  | { type: 'RESET' };

interface ChatContextProps {
  data: ChatState;
  dispatch: React.Dispatch<ChatAction>;
}

const ChatContext = createContext<ChatContextProps | null>(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};

const initialState: ChatState = {
  chatId: 'null',
  user: null,
  messages: []
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'CHANGE_USER':
      return {
        user: action.payload,
        chatId:
          action.payload.uid > state.user?.uid
            ? state.user?.uid + action.payload.uid
            : action.payload.uid + state.user?.uid,
        messages: []
      };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
    case 'UNSEND_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(message => 
          message.id === action.payload 
            ? { ...message, unsent: true } 
            : message
        )
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const { currentUser } = useAuth();
  
  const [state, dispatch] = useReducer(chatReducer, initialState);
  
  // Expose context via global window property to break circular dependency
  useEffect(() => {
    (window as any).__CHAT_CONTEXT__ = { data: state, dispatch };
  }, [state, dispatch]);

  return (
    <ChatContext.Provider value={{ data: state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
}; 