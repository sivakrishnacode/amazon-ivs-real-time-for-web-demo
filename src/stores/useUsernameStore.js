import { create } from 'zustand';

export const useUsernameStore = create((set) => ({
  username: '',
  userId: '',
  init: () => {
    let saved = localStorage.getItem('ivs-demo-username');
    let savedId = localStorage.getItem('ivs-demo-userid');
    if (!saved) {
      const rand = Math.floor(Math.random() * 9000) + 1000;
      saved = `Guest-${rand}`;
      savedId = `user-${rand}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('ivs-demo-username', saved);
      localStorage.setItem('ivs-demo-userid', savedId);
    }
    set({ username: saved, userId: savedId });
  },
  setUsername: (name) => {
    const trimmed = String(name).trim();
    if (!trimmed) return;
    localStorage.setItem('ivs-demo-username', trimmed);
    set({ username: trimmed });
  },
}));
