import GameMap from './GameMap';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export default function GameMapScreen() {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center overflow-hidden">
      {/* Map Container with 9:16 aspect ratio */}
      <div 
        className="relative"
        style={{
          width: '100%',
          height: '100%',
          maxWidth: 'calc(100vh * 9 / 16)',
          maxHeight: '100vh',
          aspectRatio: '9 / 16',
        }}
      >
        <div 
          className="w-full h-full"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center',
            transition: 'transform 0.2s ease-out',
          }}
        >
          <GameMap />
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-50">
          <button
            onClick={handleZoomIn}
            className="w-12 h-12 bg-primary hover:bg-orange-600 text-white rounded-lg flex items-center justify-center transition-colors shadow-lg border border-orange-400"
            title="Aumentar zoom"
          >
            <Plus size={24} />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-12 h-12 bg-primary hover:bg-orange-600 text-white rounded-lg flex items-center justify-center transition-colors shadow-lg border border-orange-400"
            title="Diminuir zoom"
          >
            <Minus size={24} />
          </button>
        </div>

        {/* Zoom Level Display */}
        <div className="absolute bottom-6 left-6 bg-black bg-opacity-70 border border-secondary px-4 py-2 rounded-lg text-secondary font-mono text-sm z-50">
          Zoom: {(zoom * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
}
