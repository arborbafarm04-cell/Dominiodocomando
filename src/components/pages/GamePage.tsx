import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

interface Point {
  id: string;
  name: string;
  x: number;
  y: number;
  link?: string;
}

const initialPoints: Point[] = [
  { id: '1', name: 'Casa', x: 15, y: 20, link: '/casa' },
  { id: '2', name: 'Loja de Luxo', x: 85, y: 25, link: '/luxury-showroom' },
  { id: '3', name: 'Barracão da quadrilha', x: 25, y: 60 },
  { id: '4', name: 'Arsenal', x: 75, y: 55 },
  { id: '5', name: 'Cassino', x: 50, y: 35 },
  { id: '6', name: 'Lavanderia', x: 30, y: 75 },
  { id: '7', name: 'Viatura', x: 70, y: 70 },
  { id: '8', name: 'Policial', x: 45, y: 80 },
  { id: '9', name: 'Delegacia', x: 60, y: 45 },
  { id: '10', name: 'Prefeitura', x: 20, y: 40, link: '/giro-no-asfalto' },
  { id: '11', name: 'Tribunal de justiça', x: 80, y: 65 },
  { id: '12', name: 'Governo do Estado', x: 35, y: 50 },
  { id: '13', name: 'Ministério', x: 55, y: 15 },
];

export default function GamePage() {
  const [points, setPoints] = useState<Point[]>(initialPoints);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleMouseDown = (e: React.MouseEvent, pointId: string) => {
    e.preventDefault();
    setDraggingId(pointId);
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const point = points.find(p => p.id === pointId);
      if (point) {
        const pointX = (point.x / 100) * rect.width;
        const pointY = (point.y / 100) * rect.height;
        setDragOffset({
          x: e.clientX - pointX,
          y: e.clientY - pointY,
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragOffset.x;
      const newY = e.clientY - rect.top - dragOffset.y;

      const percentX = Math.max(0, Math.min(100, (newX / rect.width) * 100));
      const percentY = Math.max(0, Math.min(100, (newY / rect.height) * 100));

      setPoints(points.map(p =>
        p.id === draggingId ? { ...p, x: percentX, y: percentY } : p
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const handlePointClick = (point: Point) => {
    if (point.link) {
      navigate(point.link);
    }
  };

  useEffect(() => {
    if (draggingId) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingId, points, dragOffset]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 w-full max-w-[120rem] mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-heading text-5xl font-bold text-foreground mb-2">
            Mapa da Cidade
          </h1>
          <p className="font-paragraph text-lg text-secondary">
            Clique e arraste os pontos para explorar diferentes locais
          </p>
        </div>

        <div
          ref={containerRef}
          className="relative w-full bg-cover bg-center rounded-lg overflow-hidden shadow-2xl"
          style={{
            backgroundImage: 'url(https://static.wixstatic.com/media/50f4bf_9bfebb56113d4108b67a172447ef9e47~mv2.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            aspectRatio: '16 / 9',
            minHeight: '500px',
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Overlay for better visibility */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Interactive Points */}
          {points.map((point) => (
            <motion.div
              key={point.id}
              className="absolute"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onMouseDown={(e) => handleMouseDown(e, point.id)}
                onClick={() => handlePointClick(point)}
                className={`
                  relative w-12 h-12 rounded-full flex items-center justify-center
                  transition-all duration-200 cursor-grab active:cursor-grabbing
                  ${draggingId === point.id ? 'cursor-grabbing' : 'cursor-grab'}
                  ${point.link 
                    ? 'bg-gradient-to-br from-primary to-logo-gradient-end hover:shadow-lg hover:shadow-primary' 
                    : 'bg-gradient-to-br from-secondary to-subtitle-neon-blue hover:shadow-lg hover:shadow-secondary'
                  }
                  shadow-md border-2 border-foreground/30
                  group
                `}
                title={point.name}
              >
                {/* Pulsing glow effect */}
                <div className={`
                  absolute inset-0 rounded-full opacity-0 group-hover:opacity-100
                  transition-opacity duration-300
                  ${point.link 
                    ? 'bg-primary/30' 
                    : 'bg-secondary/30'
                  }
                  animate-pulse
                `} />
                
                {/* Icon indicator */}
                <div className="relative z-10 text-foreground font-bold text-xs text-center px-1">
                  {point.id}
                </div>
              </button>

              {/* Tooltip */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap
                  bg-background/95 backdrop-blur-sm px-3 py-2 rounded-lg
                  border border-secondary/50 shadow-lg pointer-events-none z-50"
              >
                <p className="font-paragraph text-sm text-foreground font-medium">
                  {point.name}
                </p>
                {point.link && (
                  <p className="font-paragraph text-xs text-secondary">
                    Clique para visitar
                  </p>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-background/50 backdrop-blur-sm border border-secondary/30 rounded-lg p-6">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-3">
            Como Usar
          </h2>
          <ul className="font-paragraph text-foreground space-y-2">
            <li className="flex items-start">
              <span className="text-secondary mr-3">•</span>
              <span>Arraste qualquer ponto para movê-lo pelo mapa</span>
            </li>
            <li className="flex items-start">
              <span className="text-secondary mr-3">•</span>
              <span>Clique em um ponto para obter mais informações</span>
            </li>
            <li className="flex items-start">
              <span className="text-secondary mr-3">•</span>
              <span>Pontos em laranja levam a outras páginas</span>
            </li>
            <li className="flex items-start">
              <span className="text-secondary mr-3">•</span>
              <span>Passe o mouse sobre um ponto para ver seu nome</span>
            </li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
