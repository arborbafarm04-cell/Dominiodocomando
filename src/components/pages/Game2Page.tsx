import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';

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
  const [playerLevel, setPlayerLevel] = useState<number>(1);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Load player level and hotspots on mount
  useEffect(() => {
    const loadPlayerLevel = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const idFromUrl = urlParams.get('playerId');
        const playerId = idFromUrl || localStorage.getItem('currentPlayerId') || '';
        
        if (playerId) {
          const playerData = await BaseCrudService.getById<Players>('players', playerId);
          if (playerData?.level) {
            setPlayerLevel(playerData.level);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar nível do jogador:', err);
      }
    };

    loadPlayerLevel();

    const savedHotspots = localStorage.getItem('game2_hotspots');
    if (savedHotspots) {
      try {
        let loadedHotspots = JSON.parse(savedHotspots);
        
        // Ensure all hotspots have valid x and y percentages (0-100)
        loadedHotspots = loadedHotspots.map((h: Hotspot) => {
          const validX = typeof h.x === 'number' && h.x >= 0 && h.x <= 100 ? h.x : 50;
          const validY = typeof h.y === 'number' && h.y >= 0 && h.y <= 100 ? h.y : 50;
          
          // Update destinations for specific points
          let destination = h.destination || 'barraco';
          if (h.number === 1) destination = 'barraco';
          if (h.number === 2) destination = 'bribery-guard';
          if (h.number === 12) destination = 'giro-no-asfalto';
          
          return { ...h, x: validX, y: validY, destination };
        });
        
        setHotspots(loadedHotspots);
      } catch (e) {
        console.error('Erro ao carregar pontos salvos:', e);
      }
    }

    // Set up polling to detect level changes
    const interval = setInterval(loadPlayerLevel, 2000);
    return () => clearInterval(interval);
  }, []);

  // Save hotspots to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('game2_hotspots', JSON.stringify(hotspots));
  }, [hotspots]);

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

  // Refresh player level periodically to detect Barraco level changes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const idFromUrl = urlParams.get('playerId');
        const playerId = idFromUrl || localStorage.getItem('currentPlayerId') || '';
        
        if (playerId) {
          const playerData = await BaseCrudService.getById<Players>('players', playerId);
          if (playerData?.level && playerData.level !== playerLevel) {
            setPlayerLevel(playerData.level);
          }
        }
      } catch (err) {
        console.error('Erro ao atualizar nível do jogador:', err);
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [playerLevel]);

  // Determine which image to display based on player level
  const getDisplayImage = (): string => {
    if (playerLevel >= 100) {
      return 'https://static.wixstatic.com/media/50f4bf_c47b6eb7b3d646e992a903b063fcb3ea~mv2.png';
    }
    if (playerLevel >= 90) {
      return 'https://static.wixstatic.com/media/50f4bf_30c57cf30d2b46c1a0c182ec0335ca90~mv2.png';
    }
    if (playerLevel >= 80) {
      return 'https://static.wixstatic.com/media/50f4bf_b2170b375ed1400cb58429f269be5db1~mv2.png';
    }
    if (playerLevel >= 70) {
      return 'https://static.wixstatic.com/media/50f4bf_59641328a66848a4b0e53be9cacc321e~mv2.png';
    }
    if (playerLevel >= 60) {
      return 'https://static.wixstatic.com/media/50f4bf_d91eb628c4944ca393540e381e4d242c~mv2.png';
    }
    if (playerLevel >= 50) {
      return 'https://static.wixstatic.com/media/50f4bf_cebea7e174c7422cb50482edbece270c~mv2.png';
    }
    if (playerLevel >= 40) {
      return 'https://static.wixstatic.com/media/50f4bf_9d7eef85347c4c5d8ea84266bb417092~mv2.png';
    }
    if (playerLevel >= 30) {
      return 'https://static.wixstatic.com/media/50f4bf_575530527bf046f69c61086e07a9c7e1~mv2.png';
    }
    if (playerLevel >= 20) {
      return 'https://static.wixstatic.com/media/50f4bf_5c232e0bf0e64af6bced8de19939526a~mv2.png';
    }
    if (playerLevel >= 10) {
      return 'https://static.wixstatic.com/media/50f4bf_f1b0939c07364a7ead7fb3e92d126ff0~mv2.png';
    }
    return images[currentImageIndex] || images[0];
  };

  // Update image when player level changes
  useEffect(() => {
    const displayImage = getDisplayImage();
    if (displayImage && images[currentImageIndex] !== displayImage) {
      setImages([displayImage]);
      setCurrentImageIndex(0);
    }
  }, [playerLevel]);

  const currentImage = getDisplayImage();

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
    if (confirm('Tem certeza que deseja limpar TODOS os pontos? Esta ação não pode ser desfeita.')) {
      setHotspots([]);
    }
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
          className="w-full h-full object-cover"
          width={1080}
          height={1920}
        />

        {/* Hotspots Visualization - Always on top */}
        {hotspots.map(hotspot => (
          // Hide point 2 when barraco level >= 10
          (hotspot.number === 2 && playerLevel >= 10) ? null : (
            <div
              key={hotspot.id}
              className="absolute w-10 h-10 rounded-full border-2 border-gray-400 flex items-center justify-center cursor-pointer transition-colors font-bold text-white text-sm z-40"
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(128, 128, 128, 0.2)',
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
          )
        ))}

        {/* Police Car at Point 2 - Hidden when barraco level >= 10 */}
        {hotspots.some(h => h.number === 2) && playerLevel < 10 && (
          <div
            className="absolute w-86 h-86 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              left: `${hotspots.find(h => h.number === 2)?.x || 50}%`,
              top: `${hotspots.find(h => h.number === 2)?.y || 50}%`,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={(e) => {
              e.stopPropagation();
              navigate('/bribery-guard');
            }}
            title="Clique para ir para Suborno do Guarda"
          >
            <Image
              src="https://static.wixstatic.com/media/50f4bf_be8212bb9150412aada836ee21d92405~mv2.png"
              alt="Police Car"
              width={292}
              height={292}
              className="w-full h-full object-contain"
            />
          </div>
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
