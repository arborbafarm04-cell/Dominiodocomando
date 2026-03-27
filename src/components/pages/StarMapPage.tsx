import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InteractiveTileGrid from '@/components/game/InteractiveTileGrid';
import { useEnsurePlayerLot } from '@/hooks/useEnsurePlayerLot';
import { usePlayerLot } from '@/hooks/usePlayerLot';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/playerStore';
import { usePlayerAuth } from '@/hooks/usePlayerAuth';

export default function StarMapPage() {
  const navigate = useNavigate();

  const { isLoading: isAuthLoading, isAuthenticated } = usePlayerAuth();
  const player = usePlayerStore((state) => state.player);

  useEnsurePlayerLot(40, 20);
  const lot = usePlayerLot();

  const [isPageLoading, setIsPageLoading] = useState(true);
const [showLuxuryNotification, setShowLuxuryNotification] = useState(false);
  const [showQGNotification, setShowQGNotification] = useState(false);
  const [showGiroNotification, setShowGiroNotification] = useState(false);

  const handleLuxuryStoreClick = () => {
    setShowLuxuryNotification(true);
    setTimeout(() => {
      setShowLuxuryNotification(false);
      navigate('/luxury-showroom');
    }, 1200);
  };

  const handleQGClick = () => {
    setShowQGNotification(true);
    setTimeout(() => setShowQGNotification(false), 2000);
  };

  const handleGiroClick = () => {
    setShowGiroNotification(true);
    setTimeout(() => {
      setShowGiroNotification(false);
      navigate('/giro-no-asfalto');
    }, 1200);
  };
useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated || !player?._id) {
      navigate('/');
      return;
    }

    setIsPageLoading(false);
  }, [isAuthLoading, isAuthenticated, player?._id, navigate]);
if (isPageLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white text-lg">
        Carregando mapa...
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">

      {/* 🌃 GRADIENTE AMBIENTE */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0a] to-black z-0" />

      {/* 🌆 GLOW CENTRAL */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,234,255,0.15),transparent_70%)] z-0" />

      <Header />

      {/* 🧠 MAPA */}
      <div className="absolute inset-0 z-10">
        <InteractiveTileGrid
          onLuxuryStoreClick={handleLuxuryStoreClick}
          onQGClick={handleQGClick}
          onGiroClick={handleGiroClick}
        />
      </div>
{/* 💬 NOTIFICAÇÕES */}
      {showLuxuryNotification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-6 py-2 rounded-lg font-bold shadow-lg z-20">
          Entrando na Loja de Luxo...
        </div>
      )}

      {showQGNotification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg z-20">
          QG do Comando
        </div>
      )}

      {showGiroNotification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-green-500 text-black px-6 py-2 rounded-lg font-bold shadow-lg z-20">
          Giro no Asfalto...
        </div>
      )}

      <Footer />
    </div>
  );
}