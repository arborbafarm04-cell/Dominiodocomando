import { create } from 'zustand';

export interface MapState {
  currentLocation: string;
  mapZoom: number;
  mapPosition: { x: number; y: number };

  setCurrentLocation: (location: string) => void;
  setMapZoom: (zoom: number) => void;
  setMapPosition: (position: { x: number; y: number }) => void;
  resetToDefault: () => void;
}

const DEFAULT_LOCATION = 'home';
const DEFAULT_ZOOM = 1;
const DEFAULT_POSITION = { x: 0, y: 0 };

export const useMapStateStore = create<MapState>((set) => ({
  currentLocation: DEFAULT_LOCATION,
  mapZoom: DEFAULT_ZOOM,
  mapPosition: DEFAULT_POSITION,

  setCurrentLocation: (location) =>
    set({
      currentLocation: location,
    }),

  setMapZoom: (zoom) =>
    set({
      mapZoom: zoom,
    }),

  setMapPosition: (position) =>
    set({
      mapPosition: position,
    }),

  resetToDefault: () =>
    set({
      currentLocation: DEFAULT_LOCATION,
      mapZoom: DEFAULT_ZOOM,
      mapPosition: DEFAULT_POSITION,
    }),
}));