import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InteractiveTileGrid from '@/components/game/InteractiveTileGrid';
import { useNavigate } from 'react-router-dom';

export default function StarMapPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [showLuxuryNotification, setShowLuxuryNotification] = useState(false);
  const [showQGNotification, setShowQGNotification] = useState(false);
  const [showGiroNotification, setShowGiroNotification] = useState(false);

  const handleLuxuryStoreClick = () => {
    setShowLuxuryNotification(true);
    setTimeout(() => {
      setShowLuxuryNotification(false);
      window.location.href = '/luxury-showroom';
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
    const canvas = document.getElementById('starfield-canvas') as HTMLCanvasElement;
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

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      time += 1;

      // 🔥 ALTERAÇÃO: FUNDO MAIS CLARO
      ctx.fillStyle = 'rgba(30, 45, 75, 1)';
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

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1e2a44 0%, #0f141e 100%)', // 🔥 ALTERAÇÃO
      }}
    >
      {/* Animated Starfield Background */}
      <canvas
        id="starfield-canvas"
        className="fixed top-0 left-0 w-full h-full z-0"
        style={{ display: 'block' }}
      />

      {/* ❌ REMOVIDO overlay escuro */}

      {/* Content */}
      <div className="relative z-10 w-full h-screen flex flex-col overflow-hidden"> {/* 🔥 ALTERAÇÃO */}
        
        <Header />

        {/* Interactive Tile Grid Section */}
        <div className="flex-1 w-full relative overflow-hidden"> {/* 🔥 ALTERAÇÃO */}
          
          <InteractiveTileGrid 
            gridWidth={40} 
            gridHeight={20} 
            tileSize={1}
            onLuxuryStoreClick={handleLuxuryStoreClick}
            onQGClick={handleQGClick}
          />
          
          {/* Luxury Store Notification */}
          {showLuxuryNotification && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-logo-gradient-start to-logo-gradient-end px-6 py-3 rounded-lg shadow-lg animate-pulse">
              <p className="text-white font-heading text-lg">🏢 Loja de Luxo 3D Clicada!</p>
            </div>
          )}

          {/* QG Notification */}
          {showQGNotification && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-subtitle-neon-blue to-player-info-glow-blue px-6 py-3 rounded-lg shadow-lg animate-pulse">
              <p className="text-white font-heading text-lg">🏛️ Quartel General Clicado!</p>
            </div>
          )}

          {/* Giro Notification */}
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
