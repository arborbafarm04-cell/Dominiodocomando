import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InteractiveTileGrid from '@/components/game/InteractiveTileGrid';
import { useEnsurePlayerLot } from '@/hooks/useEnsurePlayerLot';
import { usePlayerLot } from '@/hooks/usePlayerLot';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/playerStore';
import { loadPlayerFromDatabase } from '@/services/playerDataService';

export default function StarMapPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const player = usePlayerStore((state) => state.player);

  useEnsurePlayerLot(40, 20);
  const lot = usePlayerLot();

  const [showLuxuryNotification, setShowLuxuryNotification] = useState(false);
  const [showQGNotification, setShowQGNotification] = useState(false);
  const [showGiroNotification, setShowGiroNotification] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const hasLoadedPlayerRef = useRef(false);

  const handleLuxuryStoreClick = () => {
    setShowLuxuryNotification(true);
    setTimeout(() => {
      setShowLuxuryNotification(false);
      navigate('/luxury-showroom');
    }, 1500);
  };

  const handleQGClick = () => {
    setShowQGNotification(true);
    setTimeout(() => setShowQGNotification(false), 3000);
  };

  const handleGiroClick = () => {
    setShowGiroNotification(true);
    setTimeout(() => {
      setShowGiroNotification(false);
      navigate('/giro-no-asfalto');
    }, 1500);
  };

  useEffect(() => {
    if (!player?._id) {
      navigate('/login');
      return;
    }

    setIsPageLoading(false);
  }, [player?._id, navigate]);

  useEffect(() => {
    const hydratePlayer = async () => {
      if (hasLoadedPlayerRef.current) return;
      if (!player?._id) return;

      hasLoadedPlayerRef.current = true;
      await loadPlayerFromDatabase(player._id);
    };

    hydratePlayer();
  }, [player?._id]);

  useEffect(() => {
    const canvas = document.getElementById('starfield-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    interface Star {
      x: number;
      y: number;
      radius: number;
      opacity: number;
      pulseSpeed: number;
      pulsePhase: number;
    }

    const stars: Star[] = [];
    const starCount = 200;

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        opacity: Math.random() * 0.5 + 0.3,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    let animationFrameId = 0;
    let time = 0;
const animate = () => {
      time += 1;

      ctx.fillStyle = 'rgba(15, 20, 30, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        const pulse = Math.sin(time * star.pulseSpeed + star.pulsePhase) * 0.5 + 0.5;
        const finalOpacity = star.opacity * (pulse * 0.7 + 0.3);

        ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * (pulse * 0.5 + 0.7), 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(0, 234, 255, ${finalOpacity * 0.3})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-lg font-heading">Carregando mapa...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-background overflow-hidden">
      <canvas
        id="starfield-canvas"
        className="fixed top-0 left-0 w-full h-full z-0"
        style={{ display: 'block' }}
      />

      <div className="fixed top-0 left-0 w-full h-full z-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />

      <div className="relative z-10 w-full h-screen flex flex-col">
        <Header />

        <div className="flex-1 w-full h-full overflow-hidden relative">
          <InteractiveTileGrid
            gridWidth={40}
            gridHeight={20}
            tileSize={1}
            onLuxuryStoreClick={handleLuxuryStoreClick}
            onQGClick={handleQGClick}
            onGiroClick={handleGiroClick}
            customObjects={
              lot
                ? [
                    {
                      position: { x: 0, z: 0 },
                      gridX: lot.gridX || 0,
                      gridZ: lot.gridZ || 0,
                      size: 2,
                      model: null,
                      isClickable: true,
                      modelUrl:
                        'https://static.wixstatic.com/3d/50f4bf_a1a58716fad74a4999b6a3aba5cddf58.glb',
                    },
                  ]
                : []
            }
          />
{showLuxuryNotification && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-logo-gradient-start to-logo-gradient-end px-6 py-3 rounded-lg shadow-lg animate-pulse">
              <p className="text-white font-heading text-lg">🏢 Loja de Luxo 3D Clicada!</p>
            </div>
          )}

          {showQGNotification && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-subtitle-neon-blue to-player-info-glow-blue px-6 py-3 rounded-lg shadow-lg animate-pulse">
              <p className="text-white font-heading text-lg">🏛️ Quartel General Clicado!</p>
            </div>
          )}

          {showGiroNotification && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-logo-gradient-start to-logo-gradient-end px-6 py-3 rounded-lg shadow-lg animate-pulse">
              <p className="text-white font-heading text-lg">🎰 Giro no Asfalto Clicado!</p>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}