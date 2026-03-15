import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSkinAtual } from '@/config/skinsQG';
import { usePlayerStore } from '@/store/playerStore';

export default function GameMap() {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const navigate = useNavigate();
  const { level } = usePlayerStore();

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const styleId = 'map-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        #map { background: #000; width: 100%; height: 100vh; }
        .giroflex { animation: light 0.6s infinite; pointer-events: auto !important; }
        @keyframes light {
          0% { filter: drop-shadow(0 0 5px red); }
          50% { filter: drop-shadow(0 0 10px blue); }
          100% { filter: drop-shadow(0 0 5px red); }
        }
        /* Classe para o NPC de Trânsito com luzes */
        .npc-transito {
          transition: transform 0.5s linear;
          pointer-events: none;
          z-index: 600;
          filter: drop-shadow(0 0 15px rgba(255, 255, 200, 0.6)); /* Brilho extra nos faróis */
        }
      `;
      document.head.appendChild(style);
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      const L = window.L;
      if (!L || !mapContainer.current) return;

      if (mapInstance.current) mapInstance.current.remove();

      const map = L.map(mapContainer.current, {
        crs: L.CRS.Simple,
        minZoom: -1,
        maxZoom: 2,
        zoomControl: false,
        attributionControl: false
      });

      // 1. FUNDO ORIGINAL (A CIDADE)
      const bounds = [[0, 0], [1000, 600]];
      L.imageOverlay('https://static.wixstatic.com/media/50f4bf_9dbf16b020134b02adc81709d1e774b9~mv2.png', bounds).addTo(map);
      map.fitBounds(bounds);
      mapInstance.current = map;


      // 3. RESTANTE DO CÓDIGO IGUAL (OBJETOS FIXOS)
      function addElemento(url, x, y, largura, altura, cssClass = '', label = '', onClick = null) {
        const area = [[y, x], [y + altura, x + largura]];
        const img = L.imageOverlay(url, area, { interactive: true, className: cssClass }).addTo(map);
        if (label) img.bindTooltip(label, { direction: 'top', sticky: true });
        if (onClick) {
          img.on('click', onClick);
        }
      }

      // Get the current QG skin based on player level
      const imagemDoQG = getSkinAtual(level);
      
      // Determine if police car giroflex should be active
      // (This would need to be connected to bribery completion state in a full implementation)
      const viaturaLigada = level > 0; // Placeholder logic
      const classeBlitz = viaturaLigada ? 'giroflex' : '';

      // Blitz e QG permanecem nos mesmos lugares
      addElemento('https://static.wixstatic.com/media/50f4bf_73f5f22017304e5198d1a876f1537486~mv2.png', 130, 430, 80, 54, classeBlitz, 'BLITZ', () => {
        navigate('/bribery-guard');
      });
      addElemento(imagemDoQG, 200, 290, 200, 220, '', 'MEU QG', () => {
        navigate('/barraco');
      });
    };
    document.body.appendChild(script);
    return () => { if (mapInstance.current) mapInstance.current.remove(); };
  }, [navigate, level]);

  return <div ref={mapContainer} id="map" />;
}
