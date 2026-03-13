import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  { id: '8', name: 'Policial', x: 45, y: 80, link: '/bribery' },
  { id: '9', name: 'Delegacia', x: 60, y: 45 },
  { id: '10', name: 'Prefeitura', x: 20, y: 40, link: '/giro-no-asfalto' },
  { id: '11', name: 'Tribunal de justiça', x: 80, y: 65 },
  { id: '12', name: 'Governo do Estado', x: 35, y: 50 },
  { id: '13', name: 'Ministério', x: 55, y: 15 },
];

export default function GamePage() {
  const navigate = useNavigate();
  const [points] = useState<Point[]>(initialPoints);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointClick = (point: Point) => {
    if (point.link) {
      navigate(point.link);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 w-full max-w-[120rem] mx-auto px-4 py-8 pt-32">
        <div className="mb-6">
          <h1 className="font-heading text-5xl font-bold text-foreground mb-2">
            Mapa da Cidade
          </h1>
          <p className="font-paragraph text-lg text-secondary">
            Explore o mapa da cidade
          </p>
        </div>

        <div
          ref={containerRef}
          className="relative w-full bg-cover bg-center rounded-lg overflow-hidden shadow-2xl cursor-pointer group"
          style={{
            backgroundImage: 'url(https://static.wixstatic.com/media/50f4bf_9bfebb56113d4108b67a172447ef9e47~mv2.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            aspectRatio: '16 / 9',
            minHeight: '500px',
          }}
        >
          {/* Overlay for better visibility */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
          
          {/* Interactive Points */}
          {points.map((point) => (
            <button
              key={point.id}
              onClick={() => handlePointClick(point)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                point.link 
                  ? 'hover:scale-125 cursor-pointer' 
                  : 'cursor-default'
              }`}
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
              }}
              title={point.name}
              disabled={!point.link}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                point.link
                  ? 'bg-subtitle-neon-blue/60 hover:bg-subtitle-neon-blue/100 border-2 border-subtitle-neon-blue hover:shadow-lg hover:shadow-subtitle-neon-blue/50'
                  : 'bg-white/30 border-2 border-white/50'
              }`} style={{
                boxShadow: point.link ? '0 0 15px rgba(0,234,255,0.6)' : 'none'
              }}>
                <span className="text-white text-xs font-bold">•</span>
              </div>
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                {point.name}
              </div>
            </button>
          ))}
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
                <button
                  onClick={() => handlePointClick(point)}
                  className={`text-left transition-all duration-300 ${
                    point.link
                      ? 'text-secondary hover:text-subtitle-neon-blue hover:underline cursor-pointer'
                      : 'text-foreground cursor-default'
                  }`}
                >
                  {point.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
