
import { Image } from '@/components/ui/image';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSelectedTilesStore } from '@/store/selectedTilesStore';

interface CommerceOperation {
  id: string;
  name: string;
  value: number;
  tax: number;
  duration: number; // in seconds
  startTime?: number;
  isActive: boolean;
  timeLeft?: number;
  progress?: number;
}

interface CompletedOperation {
  id: string;
  name: string;
  cleanValue: number;
  profit: number;
  date: string;
}

export default function CommercialCenterPage() {
  const selectedTiles = useSelectedTilesStore((state) => state.selectedTiles);
  const averagePosition = useSelectedTilesStore((state) => state.getAveragePosition());

  const [operations, setOperations] = useState<CommerceOperation[]>([
    {
      id: 'commerce2',
      name: 'Administradora de Bens',
      value: 5000,
      tax: 50,
      duration: 18000, // 5 hours
      isActive: false,
    },
  ]);

  const [completedOps, setCompletedOps] = useState<CompletedOperation[]>([]);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('commerceState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setOperations(state.operations || []);
        setCompletedOps(state.completedOps || []);
      } catch (e) {
        console.error('Failed to load state:', e);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(
      'commerceState',
      JSON.stringify({ operations, completedOps })
    );
  }, [operations, completedOps]);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setOperations((prevOps) =>
        prevOps.map((op) => {
          if (!op.isActive || !op.startTime) return op;

          const elapsed = Date.now() - op.startTime;
          const timeLeft = Math.max(0, op.duration * 1000 - elapsed);
          const progress = ((op.duration * 1000 - timeLeft) / (op.duration * 1000)) * 100;

          // Operation completed
          if (timeLeft === 0) {
            const cleanValue = Math.floor(op.value * (op.tax / 100));
            const profit = cleanValue;

            setCompletedOps((prev) => [
              ...prev,
              {
                id: op.id,
                name: op.name,
                cleanValue,
                profit,
                date: new Date().toLocaleString('pt-BR'),
              },
            ]);

            return { ...op, isActive: false, timeLeft: 0, progress: 100 };
          }

          return {
            ...op,
            timeLeft: Math.ceil(timeLeft / 1000),
            progress,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleStartOperation = (opId: string) => {
    setOperations((prevOps) =>
      prevOps.map((op) => {
        if (op.id === opId && !op.isActive) {
          return {
            ...op,
            isActive: true,
            startTime: Date.now(),
            timeLeft: op.duration,
            progress: 0,
          };
        }
        return op;
      })
    );
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

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

      @keyframes progressFill {
        0% { width: 0%; }
        100% { width: 100%; }
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
        background: none;
        pointer-events: none;
      }

      .commerce-card {
        display: grid;
        grid-template-columns: 220px 1fr;
        gap: 0;
        transition: all 0.3s ease;
        min-height: 280px;
      }

      .commerce-card:hover {
        box-shadow: 0 0 30px rgba(0, 240, 255, 0.5);
      }

      .commerce-card.active {
        border-color: #00ff00;
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
      }

      .commerce-card.completed {
        border-color: #ffd700;
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
      }

      .commerce-image {
        width: 100%;
        height: 100%;
        border-right: 3px solid #00f0ff;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.3);
      }

      .commerce-image img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .commerce-content {
        padding: 2rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .progress-bar {
        width: 100%;
        height: 8px;
        background: rgba(0, 240, 255, 0.2);
        border-radius: 4px;
        overflow: hidden;
        margin-top: 0.5rem;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #00f0ff, #00ff00);
        transition: width 0.1s linear;
        box-shadow: 0 0 10px #00f0ff;
      }

      .timer-display {
        font-family: 'Courier New', monospace;
        font-size: 1.25rem;
        font-weight: bold;
        color: #00f0ff;
        text-shadow: 0 0 10px #00f0ff;
      }

      .history-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
      }

      .history-table th,
      .history-table td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #00f0ff;
        color: #00f0ff;
      }

      .history-table th {
        background: rgba(0, 240, 255, 0.1);
        font-weight: bold;
      }

      .history-table tr:hover {
        background: rgba(0, 240, 255, 0.05);
      }

      @media (max-width: 768px) {
        .commerce-card {
          grid-template-columns: 150px 1fr;
          min-height: 220px;
        }

        .commerce-content {
          padding: 1.5rem;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="commercial-grid min-h-screen flex flex-col">
      <Header />
      
      {/* WELCOME TITLE */}
      <div className="w-full pt-[120px] px-4 relative z-10">
        <div className="max-w-[100rem] mx-auto mb-8">
          <h1 className="neon-sign text-4xl md:text-5xl text-center">Bem-vindo ao Complexo</h1>
          {/* Display selected tiles info */}
          {selectedTiles.length > 0 && (
            <div className="mt-6 p-4 border-2 border-cyan-500 rounded-lg bg-cyan-500/10">
              <p className="text-cyan-300 text-center font-paragraph">
                <span className="font-bold">{selectedTiles.length}</span> tile(s) selecionado(s)
                {averagePosition && (
                  <span className="block text-sm mt-2">
                    Posição média: X: {Math.round(averagePosition.x)}, Z: {Math.round(averagePosition.y)}
                    <br />
                    <span className="text-xs text-cyan-400">Grid: 0-100 (X e Z)</span>
                  </span>
                )}
              </p>
            </div>
          )}
          {/* Grid info */}
          <div className="mt-4 p-3 border border-cyan-500/50 rounded bg-cyan-500/5 text-center">
            <p className="text-cyan-300 text-sm font-paragraph">
              Centro Comercial posicionado em: <span className="font-bold">Tiles 40, 80, 120, 160 (Centro: X: 60, Z: 40)</span>
            </p>
          </div>
        </div>
      </div>

      {/* BANNER */}
      <div className="w-full relative z-10">
        <div className="banner-container w-full flex items-center justify-center">
          <Image
            src="https://static.wixstatic.com/media/50f4bf_fd64ac461d5d41c2a6bc7639af7590ac~mv2.png"
            alt="Centro Comercial"
            className="h-auto w-auto max-w-full max-h-[600px] object-contain border border-none"
          />
        </div>
      </div>
      {/* OPERATIONS */}
      <div className="w-full px-4 py-12 relative z-10 mt-[20%]">
        <div className="max-w-[100rem] mx-auto space-y-6">
          {/* Container 1 - Administradora de Bens */}
          {operations.map((op) => (
            <div
              key={op.id}
              className={`container-neon commerce-card ${
                op.isActive ? 'active' : ''
              } ${completedOps.some((c) => c.id === op.id) ? 'completed' : ''}`}
            >
              {/* Image on left */}
              <div className="commerce-image">
                <Image
                  src="https://static.wixstatic.com/media/50f4bf_cbb8816f8c7c4767a24851c30377a5aa~mv2.png"
                  alt={op.name}
                  className="w-full h-full object-cover"
                  width={220}
                  height={280}
                />
              </div>

              {/* Content on right */}
              <div className="commerce-content border border-none">
                <div>
                  <h3 className="neon-sign text-lg md:text-xl mb-4">{op.name}</h3>

                  <div className="space-y-2 text-sm md:text-base text-cyan-300 mb-4">
                    <div className="flex justify-between">
                      <span>Valor:</span>
                      <span className="font-bold">{formatCurrency(op.value)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa:</span>
                      <span className="font-bold">{op.tax}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tempo:</span>
                      <span className="font-bold">
                        {op.isActive && op.timeLeft !== undefined
                          ? formatTime(op.timeLeft)
                          : `${Math.floor(op.duration / 3600)}h`}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {op.isActive && (
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${op.progress || 0}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Button */}
                <Button
                  onClick={() => handleStartOperation(op.id)}
                  disabled={op.isActive || completedOps.some((c) => c.id === op.id)}
                  className="mt-4 w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 px-4 rounded transition-all"
                >
                  {op.isActive
                    ? 'Em Progresso...'
                    : completedOps.some((c) => c.id === op.id)
                    ? 'Concluído'
                    : 'Iniciar'}
                </Button>
              </div>
            </div>
          ))}

          {/* Container 2 - Awaiting Instructions */}
          <div className="container-neon p-8 min-h-[280px] flex items-center justify-center">
            <p className="neon-sign text-lg text-center">Aguardando instruções...</p>
          </div>

          {/* Container 3 - Awaiting Instructions */}
          <div className="container-neon p-8 min-h-[280px] flex items-center justify-center">
            <p className="neon-sign text-lg text-center">Aguardando instruções...</p>
          </div>

          {/* Container 4 - Awaiting Instructions */}
          <div className="container-neon p-8 min-h-[280px] flex items-center justify-center">
            <p className="neon-sign text-lg text-center">Aguardando instruções...</p>
          </div>
        </div>
      </div>
      {/* HISTORY */}
      {completedOps.length > 0 && (
        <div className="w-full px-4 py-12 relative z-10 border-t border-cyan-500">
          <div className="max-w-[100rem] mx-auto">
            <h2 className="neon-sign text-2xl mb-6">Histórico de Operações</h2>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Comércio</th>
                  <th>Data</th>
                  <th>Valor Lavado</th>
                  <th>Lucro</th>
                </tr>
              </thead>
              <tbody>
                {completedOps.map((op) => (
                  <tr key={op.id}>
                    <td>{op.name}</td>
                    <td>{op.date}</td>
                    <td>{formatCurrency(op.cleanValue)}</td>
                    <td className="text-green-400 font-bold">
                      {formatCurrency(op.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
