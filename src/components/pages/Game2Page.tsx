import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import PoliceCar from '@/components/PoliceCar';

interface Hotspot {
  id: string;
  x: number;
  y: number;
  destination?: string;
  number: number;
}

export default function Game2Page() {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([
    'https://static.wixstatic.com/media/50f4bf_6b3cb68c68a7486f93b1696d52192e7d~mv2.png',
  ]);
  const [isAddingHotspots, setIsAddingHotspots] = useState(false);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Method to update the image during gameplay
  const updateGameImage = (imageUrl: string) => {
    setImages(prev => [...prev, imageUrl]);
    setCurrentImageIndex(prev => prev + 1);
  };

  // Expose the update method globally for game logic to use
  useEffect(() => {
    (window as any).updateGame2Image = updateGameImage;
    return () => {
      delete (window as any).updateGame2Image;
    };
  }, []);

  const currentImage = images[currentImageIndex] || images[0];

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingHotspots) return;

    const container = imageContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const nextNumber = Math.max(...hotspots.map(h => h.number), 0) + 1;

    const newHotspot: Hotspot = {
      id: crypto.randomUUID(),
      x,
      y,
      destination: 'barraco',
      number: nextNumber,
    };

    setHotspots(prev => [...prev, newHotspot]);
    setSelectedHotspotId(newHotspot.id);
  };

  const removeHotspot = (id: string) => {
    setHotspots(prev => prev.filter(h => h.id !== id));
  };

  const updateHotspotDestination = (id: string, destination: string) => {
    setHotspots(prev =>
      prev.map(h => (h.id === id ? { ...h, destination } : h))
    );
  };

  const toggleAddingHotspots = () => {
    setIsAddingHotspots(!isAddingHotspots);
  };

  const clearAllHotspots = () => {
    setHotspots([]);
  };

  const destinationOptions = [
    { value: 'barraco', label: 'Barraco' },
    { value: 'luxury-showroom', label: 'Loja de Luxo' },
    { value: 'giro-no-asfalto', label: 'Giro no Asfalto' },
    { value: 'bribery-guard', label: 'Suborno do Guarda' },
  ];

  return (
    <div className="w-full min-h-screen flex flex-col bg-black">
      {/* Image Container */}
      <div
        ref={imageContainerRef}
        className={`flex-1 flex items-center justify-center overflow-hidden relative ${
          isAddingHotspots ? 'cursor-crosshair' : 'cursor-default'
        }`}
        onClick={handleImageClick}
      >
        <Image
          src={currentImage}
          alt="Game 2 Scene"
          className="w-full h-full object-contain"
          width={1080}
          height={1920}
        />

        {/* Hotspots Visualization */}
        {hotspots.map(hotspot => (
          <div
            key={hotspot.id}
            className="absolute w-10 h-10 bg-red-500 rounded-full border-2 border-red-300 flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors font-bold text-white text-sm"
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (hotspot.destination) {
                navigate(`/${hotspot.destination}`);
              }
            }}
            title={`Ponto ${hotspot.number} - Clique para ir para ${hotspot.destination || 'destino'}`}
          >
            {hotspot.number}
          </div>
        ))}

        {/* Police Car at Point 2 */}
        {hotspots.some(h => h.number === 2) && (
          <PoliceCar x={hotspots.find(h => h.number === 2)?.x || 50} y={hotspots.find(h => h.number === 2)?.y || 50} scale={0.8} />
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-gray-900 border-t border-gray-700 p-4 flex gap-3 justify-center items-center flex-wrap sticky bottom-0 z-50">
        <Button
          onClick={toggleAddingHotspots}
          className={`flex items-center gap-2 ${
            isAddingHotspots
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-primary hover:bg-orange-600'
          }`}
        >
          <Plus className="w-4 h-4" />
          {isAddingHotspots ? 'Cancelar Adição' : 'Adicionar Pontos Clicáveis'}
        </Button>

        {hotspots.length > 0 && (
          <>
            <span className="text-white text-sm">
              {hotspots.length} ponto{hotspots.length !== 1 ? 's' : ''} adicionado{hotspots.length !== 1 ? 's' : ''}
            </span>
            <Button
              onClick={clearAllHotspots}
              variant="outline"
              className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
            >
              Limpar Tudo
            </Button>
          </>
        )}
      </div>

      {/* Hotspots Configuration Panel */}
      {hotspots.length > 0 && (
        <div className="bg-gray-800 border-t border-gray-700 p-4 max-h-64 overflow-y-auto">
          <h3 className="text-white font-bold mb-3">Configurar Pontos Clicáveis</h3>
          <div className="space-y-3">
            {hotspots.map(hotspot => (
              <div
                key={hotspot.id}
                className="bg-gray-700 p-3 rounded flex items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="text-white font-bold text-sm mb-2">
                    Ponto {hotspot.number} ({hotspot.x.toFixed(1)}%, {hotspot.y.toFixed(1)}%)
                  </div>
                  <select
                    value={hotspot.destination || 'barraco'}
                    onChange={(e) => updateHotspotDestination(hotspot.id, e.target.value)}
                    className="w-full bg-gray-600 text-white text-sm p-2 rounded border border-gray-500"
                  >
                    {destinationOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={() => removeHotspot(hotspot.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
