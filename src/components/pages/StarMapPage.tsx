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
    // Create animated starfield background
    const canvas = document.getElementById('starfield-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create stars with pulsing effect
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

    // Create nebula clouds
    interface Nebula {
      x: number;
      y: number;
      size: number;
      opacity: number;
      color: string;
      offsetX: number;
      offsetY: number;
      speed: number;
    }

    const nebulas: Nebula[] = [
      {
        x: canvas.width * 0.3,
        y: canvas.height * 0.2,
        size: 400,
        opacity: 0.15,
        color: '#6b4ce6',
        offsetX: 0,
        offsetY: 0,
        speed: 0.0005,
      },
      {
        x: canvas.width * 0.7,
        y: canvas.height * 0.6,
        size: 500,
        opacity: 0.12,
        color: '#1e90ff',
        offsetX: 0,
        offsetY: 0,
        speed: 0.0003,
      },
      {
        x: canvas.width * 0.5,
        y: canvas.height * 0.8,
        size: 350,
        opacity: 0.1,
        color: '#00eaff',
        offsetX: 0,
        offsetY: 0,
        speed: 0.0004,
      },
    ];

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      time += 1;

      // Clear canvas with dark background
      ctx.fillStyle = 'rgba(15, 20, 30, 0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw nebulas with gradient
      nebulas.forEach((nebula) => {
        nebula.offsetX += nebula.speed;
        nebula.offsetY += nebula.speed * 0.5;

        const gradient = ctx.createRadialGradient(
          nebula.x + nebula.offsetX,
          nebula.y + nebula.offsetY,
          0,
          nebula.x + nebula.offsetX,
          nebula.y + nebula.offsetY,
          nebula.size
        );

        gradient.addColorStop(0, nebula.color);
        gradient.addColorStop(0.5, nebula.color + '80');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.globalAlpha = nebula.opacity;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
      });

      // Draw pulsing stars
      stars.forEach((star) => {
        const pulse = Math.sin(time * star.pulseSpeed + star.pulsePhase) * 0.5 + 0.5;
        const finalOpacity = star.opacity * (pulse * 0.7 + 0.3);

        ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * (pulse * 0.5 + 0.7), 0, Math.PI * 2);
        ctx.fill();

        // Add subtle glow
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
    <div ref={containerRef} className="relative w-full h-screen bg-background overflow-hidden">
      {/* Animated Starfield Background */}
      <canvas
        id="starfield-canvas"
        className="fixed top-0 left-0 w-full h-full z-0"
        style={{ display: 'block' }}
      />
      {/* Video Background Overlay (for future video integration) */}
      <div className="fixed top-0 left-0 w-full h-full z-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />
      {/* Content */}
      <div className="relative z-10 w-full h-screen flex flex-col">
        <Header />

        {/* Interactive Tile Grid Section */}
        <div className="flex-1 w-full h-full overflow-hidden relative">
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
