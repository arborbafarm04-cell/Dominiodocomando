import { create } from 'zustand';

interface DragPosition {
  x: number;
  y: number;
}

interface DragCustomizationState {
  // Global drag mode toggle
  isDragModeEnabled: boolean;
  toggleDragMode: () => void;
  setDragMode: (enabled: boolean) => void;

  // Position storage for all draggable elements
  positions: Record<string, DragPosition>;
  setPosition: (id: string, position: DragPosition) => void;
  getPosition: (id: string) => DragPosition | undefined;
  
  // Reset all positions
  resetAllPositions: () => void;
  resetPosition: (id: string) => void;
}

export const useDragCustomizationStore = create<DragCustomizationState>((set, get) => ({
  isDragModeEnabled: false,
  
  toggleDragMode: () => {
    set((state) => ({ isDragModeEnabled: !state.isDragModeEnabled }));
  },
  
  setDragMode: (enabled: boolean) => {
    set({ isDragModeEnabled: enabled });
  },

  positions: {},

  setPosition: (id: string, position: DragPosition) => {
    set((state) => ({
      positions: {
        ...state.positions,
        [id]: position,
      },
    }));
  },

  getPosition: (id: string) => {
    return get().positions[id];
  },

  resetAllPositions: () => {
    set({ positions: {} });
  },

  resetPosition: (id: string) => {
    set((state) => {
      const newPositions = { ...state.positions };
      delete newPositions[id];
      return { positions: newPositions };
    });
  },
}));
