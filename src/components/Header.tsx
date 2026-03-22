import { useState, useEffect, useRef } from 'react';
import { Vault, Zap, Dice5, Menu, X } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useGameStore } from '@/store/gameStore';
import { useDirtyMoneyStore } from '@/store/dirtyMoneyStore';
import { useCleanMoneyStore } from '@/store/cleanMoneyStore';
import { usePlayerStore } from '@/store/playerStore';
import { useSpinVault } from '@/hooks/useSpinVault';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const { dirtyMoney } = useDirtyMoneyStore();
  const { cleanMoney } = useCleanMoneyStore();
  const { playerName, level, setPlayerName } = usePlayerStore();
  const { spins, timeUntilNextGain, formatTime } = useSpinVault();

  const [customPlayerName, setCustomPlayerName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://static.wixstatic.com/media/50f4bf_a888df3d639f415b853110e459edba8c~mv2.png?originWidth=128&originHeight=128'
  );

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedName = localStorage.getItem('playerName');
    const savedCustomName = localStorage.getItem('customPlayerName');
    const savedAvatar = localStorage.getItem('playerAvatar');

    if (savedName) setPlayerName(savedName);
    if (savedCustomName) setCustomPlayerName(savedCustomName);
    if (savedAvatar) setAvatarUrl(savedAvatar);
  }, []);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const url = reader.result as string;
      setAvatarUrl(url);
      localStorage.setItem('playerAvatar', url);
    };
    reader.readAsDataURL(file);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
      style={{
        background: '#0a0a0a',
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.9), rgba(10,10,10,0.95)), url("https://www.transparenttextures.com/patterns/concrete-wall.png")',
        borderBottom: '2px solid #d4af37',
      }}
    >
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* LOGO + MENU */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <Link
            to="/"
            className="text-2xl font-bold uppercase tracking-widest"
            style={{
              color: '#d4af37',
              textShadow: '0 0 10px rgba(255,0,0,0.5)',
            }}
          >
            DOMÍNIO DO COMANDO
          </Link>

          {/* MOBILE MENU */}
          <div className="md:hidden">
            <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button className="text-white">
                  {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link to="/">Início</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/star-map">Star Map</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/giro-no-asfalto">Giro no Asfalto</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* CENTER (AVATAR + PLAYER) */}
        <div className="flex flex-col items-center gap-1">
          <button onClick={handleAvatarClick}>
            <div
              className="w-[70px] h-[70px] rounded-full overflow-hidden border-4 border-yellow-500"
              style={{
                boxShadow: '0 0 25px gold, inset 0 0 10px rgba(0,0,0,0.8)',
              }}
            >
              <Image src={avatarUrl} className="w-full h-full object-cover" alt="Player Avatar" />
            </div>
          </button>

          <div
            className="text-lg font-bold uppercase"
            style={{ color: '#d4af37', textShadow: '0 0 8px black' }}
          >
            {playerName}
          </div>

          <div
            className="text-xs px-3 py-1 bg-red-600 uppercase font-bold"
            style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)' }}
          >
            COMANDANTE DE ELITE
          </div>
        </div>

        {/* STATS */}
        <div className="flex flex-wrap justify-center gap-3 text-white text-xs md:text-sm">
          {/* NÍVEL */}
          <div className="flex items-center gap-2 px-3 py-2 border border-yellow-500 bg-black/70">
            <Zap className="text-yellow-400" />
            <span>NÍVEL {level}</span>
          </div>

          {/* DINHEIRO SUJO */}
          <div className="flex items-center gap-2 px-3 py-2 border border-red-600 bg-black/70">
            <Vault className="text-red-500" />
            <span>R$ {dirtyMoney.toLocaleString('pt-BR')}</span>
          </div>

          {/* DINHEIRO LIMPO */}
          <div className="flex items-center gap-2 px-3 py-2 border border-blue-500 bg-black/70">
            <Vault className="text-blue-400" />
            <span>R$ {cleanMoney.toLocaleString('pt-BR')}</span>
          </div>

          {/* GIROS */}
          <div className="flex items-center gap-2 px-3 py-2 border border-yellow-400 bg-black/70">
            <Dice5 className="text-yellow-400" />
            <span>GIROS {spins}</span>
          </div>
        </div>

        {/* TIMER */}
        <div
          className="text-red-500 font-bold text-xs animate-pulse"
          style={{ textShadow: '0 0 10px red' }}
        >
          PRÓXIMO GIRO: {formatTime(timeUntilNextGain)}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
        aria-label="Upload avatar"
      />
    </header>
  );
}
