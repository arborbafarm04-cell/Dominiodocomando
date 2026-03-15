import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';

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
  const { level } = usePlayerStore();

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
    } else if (point.id === '8' && level >= 1) {
      // Policial - Bribery Guard
      navigate('/bribery-guard');
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

        </div>
        {/* Instructions */}

      </main>
      <Footer />
    </div>
  );
}
