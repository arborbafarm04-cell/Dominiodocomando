import { useState } from 'react';

interface Hotspot {
  id: string;
  name: string;
  left: string;
  top: string;
  width: string;
  height: string;
}

interface CommercialCenterHotspotsProps {
  onCommerceClick: (commerceId: string) => void;
}

const SHOW_HOTSPOTS = true;

const HOTSPOTS: Hotspot[] = [
  {
    id: 'academia',
    name: 'Academia Músculos',
    left: '3%',
    top: '12%',
    width: '30%',
    height: '20%',
  },
  {
    id: 'templo',
    name: 'Templo Ungí-vos',
    left: '68%',
    top: '12%',
    width: '27%',
    height: '18%',
  },
  {
    id: 'pizzaria',
    name: 'Pizzaria da Mama',
    left: '4%',
    top: '55%',
    width: '26%',
    height: '24%',
  },
  {
    id: 'admBens',
    name: 'ADM. de Bens',
    left: '31%',
    top: '58%',
    width: '33%',
    height: '18%',
  },
  {
    id: 'lavanderia',
    name: 'Lavanderia Povão',
    left: '69%',
    top: '54%',
    width: '25%',
    height: '24%',
  },
];

export default function CommercialCenterHotspots({
  onCommerceClick,
}: CommercialCenterHotspotsProps) {
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 z-20 w-full h-full pointer-events-none">
      {HOTSPOTS.map((hotspot) => (
        <button
          key={hotspot.id}
          type="button"
          onClick={() => onCommerceClick(hotspot.id)}
          onMouseEnter={() => setHoveredHotspot(hotspot.id)}
          onMouseLeave={() => setHoveredHotspot(null)}
          className={`absolute pointer-events-auto transition-all duration-200 ${
            SHOW_HOTSPOTS
              ? 'border-2 border-cyan-300/80 bg-cyan-400/15'
              : 'border-2 border-transparent bg-transparent'
          } ${
            hoveredHotspot === hotspot.id
              ? 'scale-[1.02] bg-cyan-400/25 border-cyan-200'
              : ''
          }`}
          style={{
            left: hotspot.left,
            top: hotspot.top,
            width: hotspot.width,
            height: hotspot.height,
          }}
          title={hotspot.name}
          aria-label={hotspot.name}
        >
          {SHOW_HOTSPOTS && (
            <div className="absolute inset-0 flex items-start justify-center pt-1">
              <span className="bg-black/75 text-cyan-100 text-[10px] md:text-xs px-2 py-1 rounded">
                {hotspot.name}
              </span>
            </div>
          )}

          {hoveredHotspot === hotspot.id && !SHOW_HOTSPOTS && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-cyan-900/90 text-cyan-100 text-sm rounded whitespace-nowrap pointer-events-none z-50">
              {hotspot.name}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}