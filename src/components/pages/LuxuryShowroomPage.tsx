import { useEffect, useMemo, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Image } from '@/components/ui/image';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { usePlayerStore } from '@/store/playerStore';
import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';
import { getLuxurySystem, getBackgroundByLevel } from '@/data/luxoItems';
import { removeCleanMoney } from '@/services/playerEconomyService';

type SkillKey = 'inteligencia' | 'agilidade' | 'ataque' | 'defesa' | 'respeito' | 'vigor';
type PurchaseMap = Record<number, boolean>;
type DialogTone = 'welcome' | 'click' | 'purchase' | 'owned' | 'insufficient';

const SHOWROOM_BG =
  'https://static.wixstatic.com/media/50f4bf_c55094f4ebfa49f9b7b851a1c7fa96b1~mv2.png';
const NPC_IMG =
  'https://static.wixstatic.com/media/50f4bf_8dc3c6fde14f4e06b7937591bf2c203d~mv2.png';

const itemSkillMap: Record<number, SkillKey> = {
  0: 'respeito',
  1: 'agilidade',
  2: 'ataque',
  3: 'inteligencia',
  4: 'defesa',
  5: 'vigor',
};

const skillLabels: Record<SkillKey, string> = {
  inteligencia: 'Inteligência',
  agilidade: 'Agilidade',
  ataque: 'Ataque',
  defesa: 'Defesa',
  respeito: 'Respeito',
  vigor: 'Vigor',
};

function money(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pick<T>(list: T[]) {
  return list[Math.floor(Math.random() * list.length)];
}

function themeByLevel(level: number) {
  if (level <= 10) {
    return {
      accent: '#b48728',
      accentSoft: 'rgba(180,135,40,.22)',
      accentStrong: '#d9ad48',
      itemBg: 'linear-gradient(135deg, rgba(18,18,18,.96), rgba(58,42,10,.88))',
      showroomShade: 'rgba(0,0,0,.42)',
      aura: 'rgba(255,215,120,.16)',
      cardMetal: 'linear-gradient(135deg,#d3b26a,#9e7424,#f4dfa3)',
    };
  }
  if (level <= 25) {
    return {
      accent: '#7344b5',
      accentSoft: 'rgba(115,68,181,.24)',
      accentStrong: '#a26cff',
      itemBg: 'linear-gradient(135deg, rgba(18,12,28,.96), rgba(69,28,106,.86))',
      showroomShade: 'rgba(0,0,0,.46)',
      aura: 'rgba(162,108,255,.18)',
      cardMetal: 'linear-gradient(135deg,#f0d58c,#a26cff,#f7e9c4)',
    };
  }
  if (level <= 50) {
    return {
      accent: '#8e1739',
      accentSoft: 'rgba(142,23,57,.24)',
      accentStrong: '#d72e62',
      itemBg: 'linear-gradient(135deg, rgba(24,10,16,.96), rgba(96,16,42,.86))',
      showroomShade: 'rgba(0,0,0,.5)',
      aura: 'rgba(215,46,98,.17)',
      cardMetal: 'linear-gradient(135deg,#f4d183,#b97d28,#f8ebc6)',
    };
  }
  if (level <= 75) {
    return {
      accent: '#ffd66b',
      accentSoft: 'rgba(255,214,107,.23)',
      accentStrong: '#fff0a8',
      itemBg: 'linear-gradient(135deg, rgba(16,14,10,.96), rgba(92,69,8,.88))',
      showroomShade: 'rgba(0,0,0,.52)',
      aura: 'rgba(255,214,107,.18)',
      cardMetal: 'linear-gradient(135deg,#fff1be,#c99223,#fff7dd)',
    };
  }
  return {
    accent: '#d7b053',
    accentSoft: 'rgba(215,176,83,.22)',
    accentStrong: '#ffffff',
    itemBg: 'linear-gradient(135deg, rgba(20,16,10,.96), rgba(110,83,20,.88))',
    showroomShade: 'rgba(0,0,0,.54)',
    aura: 'rgba(255,244,190,.17)',
    cardMetal: 'linear-gradient(135deg,#ffffff,#d7b053,#fff7d3)',
  };
}

function getItemVisual(level: number, itemIndex: number) {
  const colors = [
    { primary: '#FFD700', overlay: 'rgba(255,215,0,.22)', filter: 'brightness(1.1) saturate(1.2)' },
    { primary: '#a26cff', overlay: 'rgba(162,108,255,.22)', filter: 'brightness(1.08) saturate(1.15)' },
    { primary: '#d72e62', overlay: 'rgba(215,46,98,.22)', filter: 'brightness(1.12) saturate(1.25)' },
    { primary: '#fff0a8', overlay: 'rgba(255,240,168,.22)', filter: 'brightness(1.15) saturate(1.1)' },
    { primary: '#d7b053', overlay: 'rgba(215,176,83,.22)', filter: 'brightness(1.09) saturate(1.18)' },
    { primary: '#ffffff', overlay: 'rgba(255,255,255,.18)', filter: 'brightness(1.2) saturate(1.05)' },
  ];
  return colors[itemIndex % colors.length];
}

function npcLine(tone: DialogTone, playerName: string, itemName?: string, skill?: string) {
  const name = playerName || 'Comandante';
  const lines: Record<DialogTone, string[]> = {
    welcome: [
      `${name}... aqui tudo custa caro porque foi feito pra homens que gostam de ser desejados quando entram num lugar.`,
      `Olha bem pra essa vitrine, ${name}. Luxo certo não enfeita. Luxo certo impõe respeito e chama atenção.`,
      `${name}, me mostra até onde você consegue transformar dinheiro em presença.`,
    ],
    click: [
      `Eu gosto quando você volta pra me olhar desse jeito, ${name}. Escolhe uma peça e deixa eu ver você ficar ainda mais perigoso.`,
      `${name}, homem que compra com classe sempre prende meu interesse. Me mostra o seu nível.`,
      `Se vai gastar, gasta do jeito certo. Quero ver qual peça combina com esse ego bonito que você carrega.`,
    ],
    purchase: [
      `${itemName} ficou perfeito em você, ${name}. Agora sua ${skill} subiu +1%... e eu reparei nisso.`,
      `Era exatamente essa a escolha que eu queria ver. ${itemName}. +1% em ${skill}. Agora sim você pesa mais.`,
      `${name}, quando você compra certo, até o seu jeito de existir muda. ${itemName}. +1% em ${skill}.`,
    ],
    owned: [
      `${name}, essa peça já é sua. E sinceramente? Ainda continua te deixando irresistivelmente caro.`,
      `Você já comprou essa. Homem de presença não precisa repetir duas vezes o mesmo golpe.`,
      `Essa já tá marcada como sua, ${name}. E eu gosto quando você sabe o que já conquistou.`,
    ],
    insufficient: [
      `${name}, vontade sem caixa não sustenta luxo. Volta com mais dinheiro limpo e eu te levo mais alto.`,
      `Quase... mas quase não me impressiona. Junta o valor e volta como eu gosto.`,
      `Luxo sério exige bolso firme. Não me decepciona agora.`,
    ],
  };
  return pick(lines[tone]);
}

export default function LuxuryShowroomPage() {
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [showItemShowcase, setShowItemShowcase] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [flash, setFlash] = useState(false);
  const [purchasedItems, setPurchasedItems] = useState<PurchaseMap>({});
  const [blink, setBlink] = useState(false);
  const [npcHover, setNpcHover] = useState(false);
  const [npcDrift, setNpcDrift] = useState({ x: 0, y: 0 });

  const { player, setPlayer } = usePlayerStore();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const loadPlayerData = async () => {
      try {
        let currentPlayerId = player?._id;
        if (!currentPlayerId) {
          const urlParams = new URLSearchParams(window.location.search);
          currentPlayerId = urlParams.get('playerId');
        }
        if (!currentPlayerId) {
          const result = await BaseCrudService.getAll<Players>('players', [], { limit: 1 });
          if (result.items?.length) {
            currentPlayerId = result.items[0]._id;
          }
        }
        if (currentPlayerId) {
          const playerData = await BaseCrudService.getById<Players>('players', currentPlayerId);
          if (playerData) {
            setPlayer(playerData);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados do jogador:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPlayerData();
  }, [player?._id, setPlayer]);

  const level = player?.level || 1;
  const system = useMemo(() => getLuxurySystem(level), [level]);
  const theme = useMemo(() => themeByLevel(level), [level]);

  useEffect(() => {
    setPurchasedItems(
      (player?.ownedLuxuryItems ? JSON.parse(player.ownedLuxuryItems) : []).reduce((acc: PurchaseMap, item: any) => {
        const index = system.items.findIndex((sysItem) => sysItem._id === item.id);
        if (index !== -1) {
          acc[index] = true;
        }
        return acc;
      }, {} as PurchaseMap)
    );
  }, [player?.ownedLuxuryItems, system.items]);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      setDialogTitle(`Boa noite, ${player?.playerName || 'COMANDANTE'}`);
      setDialogMessage(npcLine('welcome', player?.playerName || 'COMANDANTE'));
      setShowDialog(true);
    }, 900);
    return () => clearTimeout(timer);
  }, [loading, player?.playerName]);

  useEffect(() => {
    let active = true;
    const loop = () => {
      const delay = Math.random() * 2600 + 2800;
      const t = setTimeout(() => {
        if (!active) return;
        setBlink(true);
        setTimeout(() => setBlink(false), 120);
        loop();
      }, delay);
      return t;
    };
    const t = loop();
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, []);

  const items = (system?.items || []).map((item, index) => ({
    id: index,
    _id: item._id,
    name: item.name,
    image: item.image,
    price: item.price,
    skill: itemSkillMap[index],
  }));

  const selectedItem = selectedItemIndex !== null ? items[selectedItemIndex] : null;

  const bonuses = useMemo(() => {
    const base: Record<SkillKey, number> = {
      inteligencia: 0,
      agilidade: 0,
      ataque: 0,
      defesa: 0,
      respeito: 0,
      vigor: 0,
    };
    items.forEach((item) => {
      if (purchasedItems[item.id]) base[item.skill] += 1;
    });
    return base;
  }, [items, purchasedItems]);

  const totalBonus = Object.values(bonuses).reduce((a, b) => a + b, 0);

  const openNpcDialog = (tone: DialogTone, itemName?: string, skill?: string) => {
    const titles: Record<DialogTone, string> = {
      welcome: `Boa noite, ${playerName}`,
      click: `${playerName}, olha isso`,
      purchase: `${playerName}, agora sim`,
      owned: `${playerName}, isso já é seu`,
      insufficient: `${playerName}, ainda falta`,
    };
    setDialogTitle(titles[tone]);
    setDialogMessage(npcLine(tone, playerName, itemName, skill));
    setShowDialog(true);
  };

  const handleNpcClick = () => {
    openNpcDialog('click');
    setShowHint(true);
  };

  const handleOpenItem = (itemIndex: number) => {
    setSelectedItemIndex(itemIndex);
    setShowItemShowcase(true);
    setShowDialog(false);
  };

  const handleBuy = () => {
    if (!selectedItem || !player) return;
    if (purchasedItems[selectedItem.id]) {
      setShowItemShowcase(false);
      openNpcDialog('owned');
      return;
    }
    if ((player.cleanMoney || 0) < selectedItem.price) {
      setShowItemShowcase(false);
      openNpcDialog('insufficient');
      return;
    }
    setShowCard(true);
    setTimeout(async () => {
      try {
        // Parse existing owned items from database
        let ownedItems: Array<{ id: string; purchaseDate: string; bonus: number; cost: number }> = [];
        if (player.ownedLuxuryItems) {
          try {
            ownedItems = JSON.parse(player.ownedLuxuryItems);
          } catch (e) {
            console.warn('Error parsing owned items:', e);
            ownedItems = [];
          }
        }
        
        // Add new item with metadata
        ownedItems.push({
          id: selectedItem._id,
          purchaseDate: new Date().toISOString(),
          bonus: 1,
          cost: selectedItem.price,
        });
        
        // Use economy service to deduct money
        const updated = await removeCleanMoney(player._id, selectedItem.price, 'LUXURY_ITEM_PURCHASE');
        
        if (!updated) {
          setShowCard(false);
          return;
        }
        
        // Update owned items in database
        await BaseCrudService.update<Players>('players', {
          _id: player._id,
          ownedLuxuryItems: JSON.stringify(ownedItems),
        });
        
        // Reload player data
        const reloaded = await BaseCrudService.getById<Players>('players', player._id);
        if (reloaded) {
          setPlayer(reloaded);
        }
        
        setPurchasedItems((prev) => ({ ...prev, [selectedItem.id]: true }));
        setShowCard(false);
        setShowItemShowcase(false);
        setFlash(true);
        setTimeout(() => setFlash(false), 650);
        openNpcDialog('purchase', selectedItem.name, skillLabels[selectedItem.skill]);
        setShowHint(true);
      } catch (err) {
        console.error('Erro ao processar compra:', err);
        setShowCard(false);
      }
    }, 2800);
  };

  const ownedCount = Object.values(purchasedItems).filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <Header />
        <div
          className="relative flex flex-1 items-center justify-center overflow-hidden px-4"
          style={{ background: getBackgroundByLevel(1) }}
        >
          <Image src={SHOWROOM_BG} alt="showroom" className="absolute h-full w-full object-cover opacity-80" width={1920} height={1080} />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative z-10 rounded-[28px] border border-white/10 bg-black/55 px-6 sm:px-8 py-4 sm:py-6 text-center backdrop-blur-xl max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-white/45">Luxury Showroom</p>
            <h2 className="mt-3 text-xl sm:text-3xl font-black text-white">Carregando vitrine privada</h2>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black pt-16 sm:pt-20 md:pt-[140px]">
      <Header />
      <div className="relative flex-1 overflow-hidden" style={{ background: getBackgroundByLevel(level) }}>
        <div className="absolute inset-0">
          <Image src={SHOWROOM_BG} alt="showroom" className="absolute h-full w-full object-cover opacity-90" width={1920} height={1080} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, rgba(0,0,0,.58), ${theme.showroomShade}, rgba(0,0,0,.42))` }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.06),transparent_22%),radial-gradient(circle_at_80%_18%,rgba(255,215,0,0.1),transparent_25%),radial-gradient(circle_at_50%_85%,rgba(255,255,255,0.04),transparent_24%)]" />
        </div>

        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.32 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-40"
              style={{ background: 'radial-gradient(circle at center, rgba(255,215,0,.65), rgba(255,84,166,.16), transparent 58%)' }}
            />
          )}
        </AnimatePresence>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-140px)] w-full max-w-full flex-col gap-4 sm:gap-6 px-3 sm:px-4 pb-6 sm:pb-8 pt-4 sm:pt-5 lg:px-8">
          {/* Placeholder for full JSX - keeping structure minimal for now */}
          <div className="text-white text-center">
            <h2 className="text-lg sm:text-2xl font-bold">Coleção {system.collectionName}</h2>
            <p className="text-sm sm:text-base">Itens: {ownedCount} comprados</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
