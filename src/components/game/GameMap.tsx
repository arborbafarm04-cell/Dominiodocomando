import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GameMap() {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const navigate = useNavigate();
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [clickedCoordinates, setClickedCoordinates] = useState(null);
  const [showCursor, setShowCursor] = useState(false);

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
        /* Painel de debug de coordenadas */
        .coordinate-debug-panel {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid #00eaff;
          border-radius: 8px;
          padding: 12px 16px;
          font-family: 'Courier New', monospace;
          color: #00eaff;
          font-size: 14px;
          font-weight: bold;
          z-index: 1000;
          pointer-events: none;
          box-shadow: 0 0 10px rgba(0, 234, 255, 0.3);
        }
        .coordinate-debug-panel div {
          margin: 4px 0;
        }
        .coordinate-debug-panel .label {
          color: #ffffff;
          font-size: 12px;
          opacity: 0.7;
        }
        .coordinate-debug-panel .clicked {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #00eaff;
          color: #00ff00;
        }
        .coordinate-debug-panel .copy-btn {
          margin-top: 8px;
          padding: 4px 8px;
          background: #00eaff;
          color: #000;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          font-weight: bold;
          pointer-events: auto;
          transition: all 0.2s;
        }
        .coordinate-debug-panel .copy-btn:hover {
          background: #00ff00;
          box-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
        }
        /* Cursor de coordenadas */
        .coordinate-cursor {
          position: absolute;
          width: 20px;
          height: 20px;
          pointer-events: none;
          z-index: 999;
        }
        .coordinate-cursor::before,
        .coordinate-cursor::after {
          content: '';
          position: absolute;
          background: #00eaff;
        }
        .coordinate-cursor::before {
          width: 2px;
          height: 20px;
          left: 9px;
          top: 0;
        }
        .coordinate-cursor::after {
          width: 20px;
          height: 2px;
          left: 0;
          top: 9px;
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
        attributionControl: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        scrollWheelZoom: false,
        boxZoom: false,
        keyboard: false
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

      // Blitz e QG permanecem nos mesmos lugares
      addElemento('https://static.wixstatic.com/media/50f4bf_73f5f22017304e5198d1a876f1537486~mv2.png', 130, 430, 80, 54, 'giroflex', 'BLITZ', () => {
        navigate('/bribery-guard');
      });
      addElemento('https://static.wixstatic.com/media/50f4bf_1776337cd2dc4ff1982d01b0079a48d2~mv2.png', 200, 290, 200, 220, '', 'MEU QG', () => {
        navigate('/barraco');
      });

      // Adicionar listeners para coordenadas
      if (mapContainer.current) {
        const handleMouseMove = (e) => {
          const rect = mapContainer.current.getBoundingClientRect();
          const x = Math.round(e.clientX - rect.left);
          const y = Math.round(e.clientY - rect.top);
          setCoordinates({ x, y });
        };

        const handleClick = (e) => {
          const rect = mapContainer.current.getBoundingClientRect();
          const x = Math.round(e.clientX - rect.left);
          const y = Math.round(e.clientY - rect.top);
          setClickedCoordinates({ x, y, timestamp: new Date().toLocaleTimeString() });
        };

        const handleMouseEnter = () => setShowCursor(true);
        const handleMouseLeave = () => setShowCursor(false);

        mapContainer.current.addEventListener('mousemove', handleMouseMove);
        mapContainer.current.addEventListener('click', handleClick);
        mapContainer.current.addEventListener('mouseenter', handleMouseEnter);
        mapContainer.current.addEventListener('mouseleave', handleMouseLeave);

        return () => {
          if (mapContainer.current) {
            mapContainer.current.removeEventListener('mousemove', handleMouseMove);
            mapContainer.current.removeEventListener('click', handleClick);
            mapContainer.current.removeEventListener('mouseenter', handleMouseEnter);
            mapContainer.current.removeEventListener('mouseleave', handleMouseLeave);
          }
          if (mapInstance.current) mapInstance.current.remove();
        };
      }
    };
    document.body.appendChild(script);
    return () => { if (mapInstance.current) mapInstance.current.remove(); };
  }, [navigate]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div ref={mapContainer} id="map" className="relative">
      {/* Painel de Debug de Coordenadas */}
      <div className="coordinate-debug-panel">
        <div className="label">📍 COORDENADAS DO MAPA</div>
        <div>X: <span className="text-cyan-400">{coordinates.x}</span></div>
        <div>Y: <span className="text-cyan-400">{coordinates.y}</span></div>
        
        {clickedCoordinates && (
          <div className="clicked">
            <div className="label">✓ ÚLTIMA CLICADA</div>
            <div>X: <span className="text-green-400">{clickedCoordinates.x}</span></div>
            <div>Y: <span className="text-green-400">{clickedCoordinates.y}</span></div>
            <button
              className="copy-btn"
              onClick={() => copyToClipboard(`${clickedCoordinates.x}, ${clickedCoordinates.y}`)}
              title="Copiar coordenadas"
            >
              📋 COPIAR
            </button>
          </div>
        )}
      </div>

      {/* Cursor de Coordenadas */}
      {showCursor && (
        <div
          className="coordinate-cursor"
          style={{
            left: `${coordinates.x - 10}px`,
            top: `${coordinates.y - 10}px`,
          }}
        />
      )}
    </div>
  );
}
