import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
  const [points] = useState<Point[]>(initialPoints);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { actions } = useMember();

  const handleLogout = async () => {
    await actions.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 w-full max-w-[120rem] mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="font-heading text-5xl font-bold text-foreground mb-2">
              Mapa da Cidade
            </h1>
            <p className="font-paragraph text-lg text-secondary">
              Explore o mapa da cidade
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-destructive hover:bg-red-700 text-destructive-foreground font-bold py-3 px-6 rounded-lg transition-colors duration-200 font-heading text-lg"
          >
            Sair
          </button>
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
        >
          {/* Overlay for better visibility */}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-background/50 backdrop-blur-sm border border-secondary/30 rounded-lg p-6">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-3">
            Locais do Mapa
          </h2>
          <ul className="font-paragraph text-foreground space-y-2">
            {points.map((point) => (
              <li key={point.id} className="flex items-start">
                <span className="text-secondary mr-3">•</span>
                <span>{point.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
