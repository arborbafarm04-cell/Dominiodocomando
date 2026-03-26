import { useEffect, useRef, useState } from 'react';
import { Image } from '@/components/ui/image';
import { usePlayerStore } from '@/store/playerStore';
import { useSpinVault } from '@/hooks/useSpinVault';
import { useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { logoutLocalPlayer } from '@/services/playerService';
import { Droplet, LogOut, LogIn } from 'lucide-react';

const LOGO_SRC = 'https://static.wixstatic.com/media/50f4bf_01590cb08b7048babbfed83e2830a27c~mv2.png';
const DEFAULT_AVATAR = 'https://static.wixstatic.com/media/50f4bf_a888df3d639f415b853110e459edba8c~mv2.png';

function formatMoney(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
  return value.toString();
}

function formatTimerDisplay(timeString: string): string[] {
  const parts = timeString.split(':');
  return parts.length === 2 ? parts : ['45', '00'];
}

interface StatProps {
  label: string;
  value: string | number;
}

function Stat({ label, value }: StatProps) {
  return (
    <div className="flex flex-col text-center">
      <span className="text-yellow-400 text-xs font-bold uppercase">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}

export default function Header() {
  const { dirtyMoney, cleanMoney, playerName, level, playerId } = usePlayerStore();
  const { spins, timeUntilNextGain, formatTime } = useSpinVault();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { member, actions } = useMember();

  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);

  useEffect(() => {
    const savedName = localStorage.getItem('playerName');
    const savedAvatar = localStorage.getItem('playerAvatar');

    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }
  }, []);

  const handleLogout = async () => {
    if (member) {
      // Google logout
      await actions.logout();
    } else {
      // Local logout - clear session but keep playerId in players collection
      await logoutLocalPlayer();
      // Clear session data only
      localStorage.removeItem('currentPlayerId');
      localStorage.removeItem('currentPlayerEmail');
      localStorage.removeItem('playerAuthToken');
      localStorage.removeItem('lastPlayerData');
      navigate('/');
    }
  };

  const timerParts = formatTimerDisplay(formatTime(timeUntilNextGain));

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div
        className="w-full px-4 py-2"
        style={{
          background: 'linear-gradient(90deg, #1a0a07 0%, #2b0d09 40%, #120807 100%)',
          borderBottom: '2px solid #d4af37',
        }}
      >
        <div className="flex items-center justify-between max-w-[1400px] mx-auto gap-4">
          {/* LEFT - LOGO */}
          <div className="flex items-center flex-shrink-0">
            <Image
              src={LOGO_SRC}
              alt="Game Logo"
              width={180}
              height={80}
              className="object-contain"
            />
          </div>

          {/* CENTER - PLAYER INFO & STATS */}
          <div className="flex items-center gap-6 flex-1">
            {/* AVATAR & PLAYER NAME */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="w-[70px] h-[70px] rounded-full border-4 border-yellow-500 overflow-hidden">
                <Image
                  src={avatarUrl}
                  alt={playerName || 'Player Avatar'}
                  width={70}
                  height={70}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="text-yellow-400 font-bold text-xl">
                  {playerName || 'Jogador'}
                </div>
                <div className="bg-red-600 text-white text-xs px-3 py-1 font-bold uppercase rounded">
                  COMANDANTE DE ELITE
                </div>
              </div>
            </div>

            {/* STATS */}
            <div className="flex gap-6 text-white text-sm">
              <Stat label="NÍVEL" value={level || 0} />
              <Stat label="PODER" value="1.2M" />
              <Stat label="DINHEIRO SUJO" value={formatMoney(dirtyMoney)} />
              <Stat label="DINHEIRO LIMPO" value={formatMoney(cleanMoney)} />
              <Stat label="GIROS" value={spins || 0} />
            </div>

            {/* WASH BUTTON */}
            <button
              onClick={() => navigate('/giro-no-asfalto')}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-4 py-2 rounded-lg text-white font-semibold transition-all text-sm flex-shrink-0"
              title="Operações de Lavagem"
            >
              <Droplet className="w-4 h-4" />
              Lavagem
            </button>
          </div>

          {/* RIGHT - TIMER & LOGOUT */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-white text-center">
              <div className="text-xs uppercase font-bold">
                PRÓXIMO GANHO EM:
              </div>

              <div className="flex gap-2 justify-center mt-1">
                {timerParts.map((part, index) => (
                  <div
                    key={index}
                    className="bg-black px-3 py-2 text-xl font-bold border border-gray-700 rounded"
                  >
                    {part}
                  </div>
                ))}
              </div>

              <div className="text-xs mt-1 text-gray-400">
                Tempo até próximo giro
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-white font-semibold transition-all text-sm"
              title="Sair do jogo"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
