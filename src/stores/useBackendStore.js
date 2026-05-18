import { create } from 'zustand';

export const useBackendStore = create((set) => ({
  stages: [],
  setStages: (stages) => set({ stages }),
}));
