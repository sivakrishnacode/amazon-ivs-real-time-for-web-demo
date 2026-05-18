import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  messages: [],
  roomJoined: false,
  inputFocused: false,

  initChatRoom: async (token, endpoint) => {
    // Demo Mode default messaging fallback
    set({
      roomJoined: true,
      messages: [
        {
          id: 'system-welcome',
          sender: { userId: 'system' },
          content: 'Welcome to the Live Demo Chat room!',
          sendTime: new Date().toISOString(),
        },
      ],
    });
  },

  sendMessage: (text) => {
    const nextMsg = {
      id: Math.random().toString(36).substr(2, 9),
      sender: { userId: 'Me' },
      content: text,
      sendTime: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, nextMsg] }));
  },

  addMessage: (text) => {
    const nextMsg = {
      id: Math.random().toString(36).substr(2, 9),
      sender: { userId: 'Me' },
      content: text,
      sendTime: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, nextMsg] }));
  },

  clearChat: () => set({ messages: [] }),
}));
