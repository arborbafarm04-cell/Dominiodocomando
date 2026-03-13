import { useState, useEffect, useRef } from 'react';
import { Bell, Settings, Crown, Vault, Zap } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useGameStore } from '@/store/gameStore';
import { useDirtyMoneyStore } from '@/store/dirtyMoneyStore';
import { useCleanMoneyStore } from '@/store/cleanMoneyStore';
import { usePlayerStore } from '@/store/playerStore';

export default function Header() {
  const { dirtMoney } = useGameStore();
  const { dirtyMoney } = useDirtyMoneyStore();
  const { cleanMoney } = useCleanMoneyStore();
  const { playerName, level, setPlayerName, setLevel } = usePlayerStore();
  const [customPlayerName, setCustomPlayerName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://static.wixstatic.com/media/50f4bf_a888df3d639f415b853110e459edba8c~mv2.png?originWidth=128&originHeight=128');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingCustomName, setIsEditingCustomName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempCustomName, setTempCustomName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved data from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('playerName');
    const savedCustomName = localStorage.getItem('customPlayerName');
    const savedAvatar = localStorage.getItem('playerAvatar');
    
    if (savedName) {
      setPlayerName(savedName);
    }
    
    if (savedCustomName) {
      setCustomPlayerName(savedCustomName);
    }
    
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }
  }, []);

  // Handle avatar click to open file picker
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Handle avatar image selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setAvatarUrl(imageUrl);
        localStorage.setItem('playerAvatar', imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle name edit
  const handleNameClick = () => {
    setIsEditingName(true);
    setTempName(playerName);
  };

  const handleNameSave = () => {
    if (tempName.trim()) {
      const newName = tempName.trim().toUpperCase();
      setPlayerName(newName);
      localStorage.setItem('playerName', newName);
    }
    setIsEditingName(false);
  };

  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
    }
  };

  // Handle custom name edit
  const handleCustomNameClick = () => {
    setIsEditingCustomName(true);
    setTempCustomName(customPlayerName);
  };

  const handleCustomNameSave = () => {
    if (tempCustomName.trim()) {
      setCustomPlayerName(tempCustomName.trim());
      localStorage.setItem('customPlayerName', tempCustomName.trim());
    }
    setIsEditingCustomName(false);
  };

  const handleCustomNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomNameSave();
    } else if (e.key === 'Escape') {
      setIsEditingCustomName(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[110px]" style={{
      background: 'rgba(15,20,30,0.85)',
      backdropFilter: 'blur(10px)',
      borderBottom: '2px solid #00eaff',
      boxShadow: '0 0 20px rgba(0,234,255,0.3)'
    }}>
      {/* HUD Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[30px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-hud-line-blue/20 to-transparent" />
        <div className="absolute bottom-[30px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-hud-line-blue/20 to-transparent" />
      </div>
      <div className="h-full max-w-[120rem] mx-auto px-6 flex items-center justify-between">
        {/* Left Area - Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">

          </div>
          <div className="flex flex-col">

          </div>
        </div>

        {/* Center Area - Avatar */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleAvatarClick}
            className="relative group cursor-pointer transition-transform duration-300 hover:scale-110"
            aria-label="Alterar avatar"
          >
            <div className="w-[70px] h-[70px] rounded-full overflow-hidden border-[3px] border-subtitle-neon-blue relative" style={{
              boxShadow: '0 0 20px rgba(0,234,255,0.8), inset 0 0 10px rgba(0,234,255,0.3)'
            }}>
              <Image
                src={avatarUrl}
                alt="Avatar do jogador"
                width={70}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-subtitle-neon-blue/0 group-hover:bg-subtitle-neon-blue/20 transition-colors duration-300 flex items-center justify-center">
                <span className="text-white text-xs font-paragraph opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  TROCAR
                </span>
              </div>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
            aria-label="Selecionar imagem do avatar"
          />
        </div>

        {/* Right Area - Player Name & Icons */}
        <div className="flex items-center gap-6">
          {/* Player Names */}
          <div className="flex flex-col items-start gap-1">
            {/* Main Player Name */}
            <div className="flex items-center gap-2">

            </div>

            {/* Custom Player Name */}
            <div className="flex items-center">
              {isEditingCustomName ? (
                <input
                  type="text"
                  value={tempCustomName}
                  onChange={(e) => setTempCustomName(e.target.value)}
                  onBlur={handleCustomNameSave}
                  onKeyDown={handleCustomNameKeyPress}
                  className="bg-transparent border-b-2 border-logo-gradient-start text-logo-gradient-start font-paragraph text-sm md:text-base font-medium tracking-wider outline-none px-2"
                  style={{
                    textShadow: '0 0 8px rgba(255,69,0,0.6)'
                  }}
                  autoFocus
                  maxLength={30}
                  placeholder="Digite seu nome gamer..."
                />
              ) : (
                <button
                  onClick={handleCustomNameClick}
                  className="px-3 py-1 rounded border-2 border-logo-gradient-start text-logo-gradient-start font-paragraph text-sm md:text-base font-medium tracking-wider hover:bg-logo-gradient-start/10 hover:brightness-150 transition-all duration-300"
                  style={{
                    textShadow: '0 0 8px rgba(255,69,0,0.6)'
                  }}
                >
                  {customPlayerName || '+ Nome Gamer'}
                </button>
              )}
            </div>
          </div>
          {/* Clean Money Vault */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-logo-gradient-start/20 to-logo-gradient-end/20 rounded-lg border-2 border-logo-gradient-start" style={{
            filter: 'drop-shadow(0 0 10px rgba(255,69,0,0.5))'
          }}>
            <Vault className="w-6 h-6 text-logo-gradient-start" style={{
              filter: 'drop-shadow(0 0 8px rgba(255,69,0,0.8))'
            }} />
            <div className="flex flex-col">
              <span className="text-xs text-logo-gradient-start font-heading">COFRE SUJO</span>
              <span className="text-lg font-bold text-white font-heading">R$ {dirtyMoney.toLocaleString('pt-BR')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-subtitle-neon-blue/20 to-subtitle-neon-blue/10 rounded-lg border-2 border-subtitle-neon-blue" style={{
            filter: 'drop-shadow(0 0 10px rgba(0,234,255,0.5))'
          }}>
            <Vault className="w-6 h-6 text-subtitle-neon-blue" style={{
              filter: 'drop-shadow(0 0 8px rgba(0,234,255,0.8))'
            }} />
            <div className="flex flex-col">
              <span className="text-xs text-subtitle-neon-blue font-heading">COFRE LIMPO</span>
              <span className="text-lg font-bold text-white font-heading">R$ {cleanMoney.toLocaleString('pt-BR')}</span>
            </div>
          </div>
          {/* Dirty Money Vault - Updated from Giro no Asfalto */}
          {/* Level Display */}

          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-logo-gradient-start/20 to-logo-gradient-end/20 rounded-lg border-2 border-logo-gradient-start" style={{
            filter: 'drop-shadow(0 0 10px rgba(255,69,0,0.5))'
          }}>
            <Zap className="w-6 h-6 text-logo-gradient-start" style={{
              filter: 'drop-shadow(0 0 8px rgba(255,69,0,0.8))'
            }} />
            <div className="flex flex-col">
              <span className="text-xs text-logo-gradient-start font-heading">NÍVEL</span>
              <span className="text-lg font-bold text-white font-heading">{level}/100</span>
            </div>
          </div>
          {/* Dirty Money Display */}
          {/* Icons */}
          <div className="flex items-center gap-4">
            <button
              className="text-white hover:text-subtitle-neon-blue transition-all duration-300 hover:brightness-150"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(0,234,255,0.6))'
              }}
              aria-label="Notificações"
            >

            </button>
            <button
              className="text-white hover:text-subtitle-neon-blue transition-all duration-300 hover:brightness-150"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(0,234,255,0.6))'
              }}
              aria-label="Configurações"
            >

            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
