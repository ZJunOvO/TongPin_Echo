import { create } from 'zustand';

interface UIState {
  isFabVisible: boolean;
  setFabVisible: (visible: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isFabVisible: true,
  setFabVisible: (visible: boolean) => set({ isFabVisible: visible }),
})); 