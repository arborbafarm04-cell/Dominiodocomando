import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MapState {
  zoom: number;
  panX: number;
  panY: number;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  resetToDefault: () => void;
}

const DEFAULT_ZOOM = 1;
const DEFAULT_PAN_X = 0;
const DEFAULT_PAN_Y = 0;

export const useMapStateStore = create<MapState>()(
  persist(
    (set) => ({
      zoom: DEFAULT_ZOOM,
      panX: DEFAULT_PAN_X,
      panY: DEFAULT_PAN_Y,
      setZoom: (zoom) => set({ zoom }),
      setPan: (x, y) => set({ panX: x, panY: y }),
      resetToDefault: () => set({ 
        zoom: DEFAULT_ZOOM, 
        panX: DEFAULT_PAN_X, 
        panY: DEFAULT_PAN_Y 
      }),
    }),
    {
      name: 'map-state-store',
    }
  )
);
