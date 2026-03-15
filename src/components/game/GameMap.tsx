import { useEffect, useRef } from 'react';

export default function GameMap() {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Add styles for neon tooltips and giroflex animation
    const style = document.createElement('style');
    style.innerHTML = `
      body, html { margin: 0; padding: 0; overflow: hidden; }
      .tooltip-neon {
        background: rgba(10, 10, 15, 0.9) !important;
        border: 1px solid #0ff !important;
        color: #fff !important;
        font-family: sans-serif;
        text-align: center;
      }
      .btn-entrar {
        display: inline-block; margin-top: 5px; padding: 3px 10px;
        border: 1px solid #0ff; color: #0ff; border-radius: 10px; font-weight: bold;
      }
      @keyframes giroflex {
        0% { filter: drop-shadow(0 0 5px red); }
        50% { filter: drop-shadow(0 0 10px blue); }
        100% { filter: drop-shadow(0 0 5px red); }
      }
      .animacao-policia { animation: giroflex 0.6s infinite; }
    `;
    document.head.appendChild(style);

    // Dynamically load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      if (mapContainer.current && (window as any).L) {
        const L = (window as any).L;
        const urlMapaFundo = 'https://static.wixstatic.com/media/50f4bf_9dbf16b020134b02adc81709d1e774b9~mv2.png';
        
        const map = L.map(mapContainer.current, {
          crs: L.CRS.Simple,
          minZoom: -1.5,
          maxZoom: 2,
          zoomControl: false,
          attributionControl: false,
        });
        
        const bounds = [[0, 0], [1000, 600]];
        L.imageOverlay(urlMapaFundo, bounds).addTo(map);
        map.fitBounds(bounds);

        // Helper function to add locations
        function addLocal(nome: string, img: string, x: number, y: number, size: number, css = '') {
          const icon = L.icon({
            iconUrl: img,
            iconSize: [size, size],
            iconAnchor: [size / 2, size],
            className: css,
          });
          L.marker([y, x], { icon: icon })
            .addTo(map)
            .bindTooltip(`<b>${nome}</b><br><div class="btn-entrar">ENTRAR</div>`, {
              direction: 'top',
              className: 'tooltip-neon',
              interactive: true,
            });
        }

        // 1. Police Vehicle (at the entrance of the favela - adjusted to the asphalt of the climb)
        addLocal(
          'VIATURA PM',
          'https://static.wixstatic.com/media/50f4bf_73f5f22017304e5198d1a876f1537486~mv2.png',
          380,
          420,
          70,
          'animacao-policia'
        );

        // 2. Your Initial QG (deeper inside the community)
        addLocal(
          'SEU QG',
          'https://static.wixstatic.com/media/50f4bf_1776337cd2dc4ff1982d01b0079a48d2~mv2.png',
          200,
          300,
          100
        );
      }
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      id="map"
      style={{
        width: '100vw',
        height: '100vh',
        background: '#000',
        margin: 0,
        padding: 0,
      }}
    />
  );
}
