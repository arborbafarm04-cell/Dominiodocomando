import { useEffect, useRef } from 'react';

export default function GameMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    // Dynamically load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Add styles for giroflex animation and interactive elements
    const style = document.createElement('style');
    style.innerHTML = `
      body, html { margin: 0; padding: 0; overflow: hidden; background: #000; }
      #map { margin: 0; padding: 0; }
      .leaflet-container { background: #000 !important; }

      /* Efeito Giroflex */
      .giroflex {
        animation: light 0.6s infinite;
        pointer-events: none;
      }
      @keyframes light {
        0% { filter: drop-shadow(0 0 5px red); }
        50% { filter: drop-shadow(0 0 10px blue); }
        100% { filter: drop-shadow(0 0 5px red); }
      }

      .leaflet-image-layer {
        cursor: pointer;
      }
      .leaflet-image-layer:hover {
        opacity: 0.9;
      }
    `;
    document.head.appendChild(style);

    // Dynamically load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      if (mapContainer.current && (window as any).L) {
        const L = (window as any).L;

        // Destroy existing map if it exists
        if (mapInstance.current) {
          mapInstance.current.remove();
        }

        // Setup do Mapa
        const map = L.map(mapContainer.current, {
          crs: L.CRS.Simple,
          minZoom: -1,
          maxZoom: 2,
          zoomControl: false,
          attributionControl: false
        });

        const bounds = [[0, 0], [1000, 600]];
        L.imageOverlay('https://static.wixstatic.com/media/50f4bf_9dbf16b020134b02adc81709d1e774b9~mv2.png', bounds).addTo(map);
        map.fitBounds(bounds);

        mapInstance.current = map;

        // Função para Criar Elementos que acompanham o Zoom
        // Usamos ImageOverlay em vez de Markers para eles "grudarem" na escala do mapa
        function addElemento(url: string, x: number, y: number, largura: number, altura: number, cssClass = '') {
          const area = [[y, x], [y + altura, x + largura]];
          const img = L.imageOverlay(url, area, {
            interactive: true,
            className: cssClass
          }).addTo(map);

          // Adiciona o Tooltip (opcional)
          img.bindTooltip("ENTRAR", { direction: 'top', sticky: true });

          return img;
        }

        // POSICIONAMENTO MANUAL (Ajuste os números para o lugar exato)

        // Viatura na entrada da favela (x, y, largura, altura)
        // Aumente/Diminua largura e altura para o tamanho desejado
        addElemento('https://static.wixstatic.com/media/50f4bf_73f5f22017304e5198d1a876f1537486~mv2.png', 380, 420, 60, 40, 'giroflex');

        // Seu QG (Barraco inicial)
        addElemento('https://static.wixstatic.com/media/50f4bf_1776337cd2dc4ff1982d01b0079a48d2~mv2.png', 200, 300, 80, 80);
      }
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
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
        width: '100%',
        height: '100%',
        background: '#000',
        margin: 0,
        padding: 0,
      }}
    />
  );
}
