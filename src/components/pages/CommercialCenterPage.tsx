import Header from '@/components/Header';
import { Image } from '@/components/ui/image';
import { useEffect } from 'react';

export default function CommercialCenterPage() {
  useEffect(() => {
    // Inject custom CSS for neon effects and animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gridMove {
        from { background-position: 0 0; }
        to { background-position: 100px 100px; }
      }

      @keyframes pulse {
        from {
          text-shadow:
            0 0 10px #00f0ff,
            0 0 20px #00f0ff,
            0 0 30px #00f0ff;
          opacity: 0.9;
        }
        to {
          text-shadow:
            0 0 20px #00f0ff,
            0 0 40px #00f0ff,
            0 0 80px #00f0ff,
            0 0 120px #00f0ff;
          opacity: 1;
        }
      }

      @keyframes neonBorder {
        0%, 100% {
          border-color: #00f0ff;
          box-shadow: 0 0 10px #00f0ff, inset 0 0 10px rgba(0, 240, 255, 0.1);
        }
        50% {
          border-color: #9d00ff;
          box-shadow: 0 0 20px #9d00ff, inset 0 0 15px rgba(157, 0, 255, 0.15);
        }
      }

      .neon-sign {
        color: #00f0ff;
        text-shadow:
          0 0 5px #00f0ff,
          0 0 10px #00f0ff,
          0 0 20px #00f0ff,
          0 0 40px #00f0ff,
          0 0 80px #00f0ff;
        animation: pulse 3s infinite alternate;
        font-weight: 700;
        letter-spacing: 2px;
      }

      .commercial-grid {
        background: linear-gradient(to bottom, #0a0015, #000814);
        position: relative;
        overflow: hidden;
      }

      .commercial-grid::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          rgba(0, 240, 255, 0.03) 10px,
          rgba(0, 240, 255, 0.03) 20px
        );
        animation: gridMove 60s linear infinite;
        pointer-events: none;
      }

      .container-neon {
        border: 2px solid #00f0ff;
        background: rgba(10, 0, 30, 0.6);
        backdrop-filter: blur(10px);
        animation: neonBorder 4s ease-in-out infinite;
        position: relative;
        overflow: hidden;
      }

      .container-neon::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(0, 240, 255, 0.1),
          transparent
        );
        animation: shimmer 3s infinite;
      }

      @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
      }

      .banner-container {
        position: relative;
        overflow: hidden;
        border-bottom: 3px solid #00f0ff;
        box-shadow: 0 0 30px rgba(0, 240, 255, 0.3), inset 0 0 20px rgba(0, 240, 255, 0.1);
        min-height: 600px;
        display: flex;
        align-items: flex-end;
        justify-content: center;
      }

      .banner-container::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          135deg,
          rgba(0, 240, 255, 0.05),
          rgba(157, 0, 255, 0.05)
        );
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="commercial-grid min-h-screen">
      {/* HEADER */}
      <Header />

      {/* BANNER */}
      <div className="w-full pt-[120px] relative z-10">
        <div className="banner-container w-full bg-black">
          <Image
            src="https://static.wixstatic.com/media/50f4bf_fd64ac461d5d41c2a6bc7639af7590ac~mv2.png"
            alt="Centro Comercial"
            className="h-auto w-auto"
            style={{ maxHeight: 'none' }}
          />
        </div>
      </div>

      {/* 5 CONTAINERS */}
      <div className="w-full px-4 py-12 relative z-10">
        <div className="max-w-[100rem] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 auto-rows-max">
            {/* Container 1 */}
            <div className="container-neon p-6 flex flex-col items-center justify-center min-h-[250px] md:min-h-[300px]">
              <h3 className="neon-sign text-lg md:text-xl text-center">COMÉRCIO 1</h3>
            </div>

            {/* Container 2 */}
            <div className="container-neon p-6 flex flex-col items-center justify-center min-h-[250px] md:min-h-[300px]">
              <h3 className="neon-sign text-lg md:text-xl text-center">COMÉRCIO 2</h3>
            </div>

            {/* Container 3 */}
            <div className="container-neon p-6 flex flex-col items-center justify-center min-h-[250px] md:min-h-[300px]">
              <h3 className="neon-sign text-lg md:text-xl text-center">COMÉRCIO 3</h3>
            </div>

            {/* Container 4 */}
            <div className="container-neon p-6 flex flex-col items-center justify-center min-h-[250px] md:min-h-[300px]">
              <h3 className="neon-sign text-lg md:text-xl text-center">COMÉRCIO 4</h3>
            </div>

            {/* Container 5 */}
            <div className="container-neon p-6 flex flex-col items-center justify-center min-h-[250px] md:min-h-[300px]">
              <h3 className="neon-sign text-lg md:text-xl text-center">COMÉRCIO 5</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
