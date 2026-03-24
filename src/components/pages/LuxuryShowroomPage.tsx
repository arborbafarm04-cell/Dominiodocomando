import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Image } from '@/components/ui/image';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { usePlayerStore } from '@/store/playerStore';
import { useCleanMoneyStore } from '@/store/cleanMoneyStore';
import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';
import { getLuxurySystem, getBackgroundByLevel } from '@/data/luxoItems';

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

  const playerName = usePlayerStore((s) => s.playerName) || 'COMANDANTE';
  const barracoLevel = usePlayerStore((s) => s.barracoLevel);
  const playerLevel = usePlayerStore((s) => s.level);
  const setBarracoLevel = usePlayerStore((s) => s.setBarracoLevel);
  const cleanMoney = useCleanMoneyStore((s) => s.cleanMoney);
  const removeCleanMoney = useCleanMoneyStore((s) => s.removeCleanMoney);

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        let playerId = urlParams.get('playerId') || localStorage.getItem('currentPlayerId');
        if (!playerId) {
          const result = await BaseCrudService.getAll<Players>('players', [], { limit: 1 });
          if (result.items?.length) {
            playerId = result.items[0]._id;
            localStorage.setItem('currentPlayerId', playerId);
          }
        }
        if (playerId) {
          const playerData = await BaseCrudService.getById<Players>('players', playerId);
          if (playerData?.level) setBarracoLevel(playerData.level);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do jogador:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPlayerData();
  }, [setBarracoLevel]);

  const level = barracoLevel && barracoLevel > 0 ? barracoLevel : Math.max(1, playerLevel || 1);
  const system = useMemo(() => getLuxurySystem(level), [level]);
  const theme = useMemo(() => themeByLevel(level), [level]);
  const storageKey = useMemo(
    () => `luxury_showroom_owned_${playerName.toLowerCase().replace(/\s+/g, '_')}`,
    [playerName],
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setPurchasedItems(JSON.parse(saved));
    } catch {
      setPurchasedItems({});
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(purchasedItems));
  }, [purchasedItems, storageKey]);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      setDialogTitle(`Boa noite, ${playerName}`);
      setDialogMessage(npcLine('welcome', playerName));
      setShowDialog(true);
    }, 900);
    return () => clearTimeout(timer);
  }, [loading, playerName]);

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
    if (!selectedItem) return;
    if (purchasedItems[selectedItem.id]) {
      setShowItemShowcase(false);
      openNpcDialog('owned');
      return;
    }
    if (cleanMoney < selectedItem.price) {
      setShowItemShowcase(false);
      openNpcDialog('insufficient');
      return;
    }
    setShowCard(true);
    setTimeout(() => {
      removeCleanMoney(selectedItem.price);
      setPurchasedItems((prev) => ({ ...prev, [selectedItem.id]: true }));
      setShowCard(false);
      setShowItemShowcase(false);
      setFlash(true);
      setTimeout(() => setFlash(false), 650);
      openNpcDialog('purchase', selectedItem.name, skillLabels[selectedItem.skill]);
      setShowHint(true);
    }, 2800);
  };

  const ownedCount = Object.values(purchasedItems).filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <Header />
        <div
          className="relative flex flex-1 items-center justify-center overflow-hidden"
          style={{ background: getBackgroundByLevel(1) }}
        >
          <Image src={SHOWROOM_BG} alt="showroom" className="absolute h-full w-full object-cover opacity-80" width={1920} height={1080} />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative z-10 rounded-[28px] border border-white/10 bg-black/55 px-8 py-6 text-center backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-white/45">Luxury Showroom</p>
            <h2 className="mt-3 text-3xl font-black text-white">Carregando vitrine privada</h2>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black pt-[140px]">
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

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-140px)] w-full max-w-[1800px] flex-col gap-6 px-4 pb-8 pt-5 lg:px-8">
          {/* TOP SECTION - HEADER & PLAYER INFO */}
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            {/* LEFT - HEADER */}
            <div className="rounded-[34px] border border-white/10 p-6 sm:p-8" style={{ background: 'linear-gradient(180deg, rgba(10,10,10,.36), rgba(0,0,0,.58))', boxShadow: '0 24px 100px rgba(0,0,0,.5), inset 0 0 50px rgba(255,255,255,.03)' }}>
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-white/52">Showroom Privado</p>
              <h1 className="mt-3 text-4xl font-black leading-none text-white sm:text-5xl">
                Coleção {system.collectionName}
              </h1>
              <p className="mt-4 max-w-xl text-sm text-white/74 sm:text-base">
                Luxo, provocação e presença. Aqui você não compra só peça. Você compra o jeito que o mundo vai te enxergar.
              </p>
              <div className="mt-6 rounded-3xl border p-4 backdrop-blur-md" style={{ borderColor: theme.accentSoft, background: 'rgba(0,0,0,.28)' }}>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/48">Dinheiro limpo disponível</p>
                <p className="mt-2 text-3xl font-black text-white">R$ {money(cleanMoney)}</p>
              </div>
            </div>

            {/* RIGHT - PLAYER INFO & STATUS */}
            <div className="flex flex-col gap-4">
              <div
                className="rounded-2xl border px-6 py-4"
                style={{ borderColor: theme.accentSoft, background: 'rgba(0,0,0,.38)', boxShadow: `0 0 30px ${theme.accentSoft}` }}
              >
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">Jogador</p>
                <p className="mt-2 text-2xl font-black uppercase text-white">{playerName}</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/45">Barraco nível {level}</p>
              </div>

              <div className="rounded-[34px] border p-5" style={{ borderColor: theme.accentSoft, background: 'rgba(0,0,0,.46)' }}>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/44">Assinatura de poder</p>
                <h3 className="mt-2 text-xl font-black text-white">
                  {totalBonus <= 1 ? 'Presença em ascensão' : totalBonus <= 3 ? 'Figura de respeito' : totalBonus <= 5 ? 'Luxo que impõe presença' : 'Domínio absoluto da ostentação'}
                </h3>
                <div className="mt-4 space-y-3">
                  {(Object.entries(bonuses) as [SkillKey, number][]).slice(0, 3).map(([skill, value]) => (
                    <div key={skill}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-white/82">{skillLabels[skill]}</span>
                        <span className="font-black text-white">+{value}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${value * 100}%` }}
                          transition={{ duration: 0.45 }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${theme.accent}, #ffffff)`, boxShadow: `0 0 18px ${theme.accentSoft}` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MAIN SECTION - NPC & ITEMS */}
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            {/* LEFT - NPC & DIALOG */}
            <div className="relative overflow-hidden rounded-[34px] border border-white/10" style={{ background: 'linear-gradient(180deg, rgba(10,10,10,.36), rgba(0,0,0,.58))', boxShadow: '0 24px 100px rgba(0,0,0,.5), inset 0 0 50px rgba(255,255,255,.03)' }}>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-[8%] top-[8%] h-64 w-64 rounded-full blur-3xl" style={{ background: theme.aura }} />
                <div className="absolute right-[7%] top-[18%] h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
                <div className="absolute bottom-[10%] left-[28%] h-64 w-64 rounded-full bg-white/5 blur-3xl" />
              </div>

              <div className="relative z-10 flex min-h-[600px] flex-col justify-between px-4 py-6 sm:px-6">
                {/* DIALOG - TOP */}
                <AnimatePresence mode="wait">
                  {showDialog && (
                    <motion.div
                      key={`${dialogTitle}-${dialogMessage}`}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.26, ease: 'easeOut' }}
                      className="relative overflow-hidden rounded-[28px] border mb-4"
                      style={{
                        borderColor: theme.accent,
                        background: 'linear-gradient(180deg, rgba(15,15,15,.94), rgba(0,0,0,.96))',
                        boxShadow: `0 20px 70px rgba(0,0,0,.5), 0 0 24px ${theme.accentSoft}`,
                      }}
                    >
                      <div className="absolute inset-0 opacity-75" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,.03), transparent 40%, rgba(255,215,0,.05))' }} />
                      <motion.div
                        className="absolute -inset-10 blur-3xl"
                        animate={{ opacity: [0.22, 0.42, 0.22] }}
                        transition={{ duration: 3.2, repeat: Infinity }}
                        style={{ background: `radial-gradient(circle, ${theme.aura}, transparent 55%)` }}
                      />
                      <div className="relative p-5">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-white/38">Atendimento privado</p>
                        <h2 className="mt-2 text-xl font-black text-white">{dialogTitle}</h2>
                        <p className="mt-3 text-sm leading-relaxed text-white/82">{dialogMessage}</p>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => {
                              setShowDialog(false);
                              setShowHint(true);
                            }}
                            className="flex-1 rounded-2xl px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-black"
                            style={{ background: theme.cardMetal, boxShadow: `0 12px 30px ${theme.accentSoft}` }}
                          >
                            Ver coleção
                          </button>
                          <button
                            onClick={handleNpcClick}
                            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-white"
                          >
                            Ouvir mais
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* NPC - BOTTOM */}
                <div className="relative flex flex-1 items-end justify-center">
                  <motion.div
                    onMouseEnter={() => setNpcHover(true)}
                    onMouseLeave={() => {
                      setNpcHover(false);
                      setNpcDrift({ x: 0, y: 0 });
                    }}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const dx = e.clientX - (rect.left + rect.width / 2);
                      const dy = e.clientY - (rect.top + rect.height / 2);
                      setNpcDrift({ x: Math.max(-4, Math.min(4, dx / 85)), y: Math.max(-3, Math.min(3, dy / 120)) });
                    }}
                    onClick={handleNpcClick}
                    animate={{ y: [0, -1.2, 0] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative cursor-pointer"
                    style={{ filter: npcHover ? 'brightness(1.08)' : 'brightness(1)' }}
                  >
                    <motion.div animate={{ x: npcDrift.x, y: npcDrift.y, scale: npcHover ? 1.015 : 1 }} transition={{ duration: .22 }} className="relative">
                      <div className="absolute -bottom-5 left-1/2 h-12 w-[72%] -translate-x-1/2 rounded-full blur-2xl" style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,.58), transparent 70%)' }} />
                      <div className="absolute inset-0 rounded-full blur-3xl opacity-45" style={{ background: 'radial-gradient(circle, rgba(255,94,162,.14), transparent 45%)' }} />
                      <Image
                        src={NPC_IMG}
                        alt="NPC Luxury"
                        className="relative z-10 h-[480px] w-auto object-contain drop-shadow-[0_0_46px_rgba(255,215,0,0.18)] sm:h-[540px]"
                        width={520}
                        height={940}
                      />
                      {blink && <div className="pointer-events-none absolute left-1/2 top-[22%] z-20 h-[5.4%] w-[24%] -translate-x-1/2 rounded-full" style={{ background: 'rgba(0,0,0,.16)' }} />}
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* RIGHT - ITEMS CATALOG */}
            <div className="flex flex-col gap-6">
              <div
                className="rounded-[34px] border p-5"
                style={{
                  borderColor: theme.accentSoft,
                  background: theme.itemBg,
                  boxShadow: '0 24px 80px rgba(0,0,0,.44), inset 0 0 30px rgba(255,255,255,.04)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.35em] text-white/44">Catálogo de luxo</p>
                    <h2 className="mt-2 text-2xl font-black text-white">Coleção {system.collectionName}</h2>
                    <p className="mt-2 text-sm text-white/66">
                      Toque na peça para ela ser apresentada. Compra única. Cada item aumenta uma habilidade em +1% permanente.
                    </p>
                  </div>
                  <div className="rounded-2xl border px-3 py-2 text-center" style={{ borderColor: theme.accentSoft, background: 'rgba(255,255,255,.03)' }}>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/44">Nível</p>
                    <p className="text-xl font-black text-white">{level}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4">
                  {items.map((item, index) => {
                    const accent = getItemVisual(level, index);
                    const bought = !!purchasedItems[item.id];
                    return (
                      <motion.button
                        key={item.id}
                        whileHover={{ y: -2 }}
                        onClick={() => handleOpenItem(index)}
                        className="group relative overflow-hidden rounded-[28px] border p-5 text-left transition-all"
                        style={{
                          borderColor: bought ? 'rgba(255,255,255,.08)' : accent.overlay,
                          background: bought
                            ? 'linear-gradient(135deg, rgba(16,16,16,.92), rgba(10,10,10,.95))'
                            : `linear-gradient(135deg, rgba(10,10,10,.94), ${accent.overlay})`,
                          boxShadow: bought ? '0 14px 30px rgba(0,0,0,.24)' : `0 18px 45px rgba(0,0,0,.34), 0 0 20px ${accent.overlay}`,
                        }}
                      >
                        <div className="absolute inset-0 opacity-70" style={{ background: `radial-gradient(circle at 82% 20%, ${accent.overlay}, transparent 35%)` }} />
                        <div className="relative z-10 flex flex-col gap-4 sm:flex-row">
                          <div
                            className="relative flex h-[165px] w-full shrink-0 items-center justify-center overflow-hidden rounded-[22px] border sm:w-[190px]"
                            style={{
                              borderColor: bought ? 'rgba(255,255,255,.08)' : accent.overlay,
                              background: 'linear-gradient(135deg, rgba(255,255,255,.03), rgba(0,0,0,.28))',
                            }}
                          >
                            <div className="absolute inset-0 opacity-65" style={{ background: `radial-gradient(circle at 50% 42%, ${accent.overlay}, transparent 60%)` }} />
                            <Image
                              src={item.image}
                              alt={item.name}
                              className="relative z-10 h-[138px] w-[138px] object-contain transition-transform duration-300 group-hover:scale-[1.06]"
                              style={{
                                filter: bought
                                  ? 'brightness(.88) contrast(1.05)'
                                  : `${accent.filter} drop-shadow(0 0 22px ${accent.primary})`,
                              }}
                              width={170}
                              height={170}
                            />
                            <div className="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-black" style={{ background: theme.cardMetal }}>
                              {bought ? 'Comprado' : 'Toque para ver'}
                            </div>
                          </div>

                          <div className="flex flex-1 flex-col justify-between">
                            <div>
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <h3 className="text-2xl font-black leading-tight text-white">{item.name}</h3>
                                  <p className="mt-2 text-sm text-white/64">{skillLabels[item.skill]} +1% permanente</p>
                                </div>
                                <div className="rounded-2xl border px-4 py-2 text-center" style={{ borderColor: bought ? 'rgba(255,255,255,.08)' : accent.overlay, background: 'rgba(0,0,0,.22)' }}>
                                  <p className="text-[10px] uppercase tracking-[0.26em] text-white/42">Valor</p>
                                  <p className="mt-1 text-xl font-black text-white">R$ {money(item.price)}</p>
                                </div>
                              </div>
                              <p className="mt-4 text-sm leading-relaxed text-white/72">
                                Peça de impacto visual forte, feita para aumentar seu status e transformar sua presença dentro do jogo.
                              </p>
                            </div>

                            <div className="mt-5 flex items-center justify-between gap-3">
                              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.26em] text-white/72">
                                {bought ? 'Peça conquistada' : 'Apresentação privada'}
                              </div>
                              <div className="rounded-[18px] px-4 py-3 text-xs font-black uppercase tracking-[0.24em] text-black" style={{ background: theme.cardMetal }}>
                                {bought ? 'Seu item' : 'Abrir vitrine'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[34px] border p-5" style={{ borderColor: theme.accentSoft, background: 'rgba(0,0,0,.46)' }}>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/44">Assinatura de poder</p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  {totalBonus <= 1 ? 'Presença em ascensão' : totalBonus <= 3 ? 'Figura de respeito' : totalBonus <= 5 ? 'Luxo que impõe presença' : 'Domínio absoluto da ostentação'}
                </h3>
                <p className="mt-2 text-sm text-white/64">
                  Cada peça comprada aumenta uma parte da sua força. Aqui o luxo vira estatística.
                </p>

                <div className="mt-6 space-y-4">
                  {(Object.entries(bonuses) as [SkillKey, number][]).map(([skill, value]) => (
                    <div key={skill}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="text-white/82">{skillLabels[skill]}</span>
                        <span className="font-black text-white">+{value}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${value * 100}%` }}
                          transition={{ duration: 0.45 }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${theme.accent}, #ffffff)`, boxShadow: `0 0 18px ${theme.accentSoft}` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowHint((prev) => !prev)}
                  className="mt-6 w-full rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-[0.24em] text-black"
                  style={{ background: theme.cardMetal, boxShadow: `0 14px 34px ${theme.accentSoft}` }}
                >
                  {showHint ? 'Ocultar aviso' : 'Exibir aviso da coleção'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* MOBILE DIALOG */}
      <AnimatePresence>
        {showDialog && (
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 22 }}
            className="fixed bottom-5 left-1/2 z-[9999] w-[92%] max-w-[560px] -translate-x-1/2 xl:hidden"
          >
            <div
              className="overflow-hidden rounded-[30px] border"
              style={{
                borderColor: theme.accent,
                background: 'linear-gradient(180deg, rgba(15,15,15,.95), rgba(0,0,0,.96))',
                boxShadow: `0 20px 80px rgba(0,0,0,.55), 0 0 26px ${theme.accentSoft}`,
              }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Atendimento privado</p>
                    <h2 className="mt-2 text-xl font-black text-white">{dialogTitle}</h2>
                  </div>
                  <button
                    onClick={() => setShowDialog(false)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-white/78"
                  >
                    fechar
                  </button>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/78">{dialogMessage}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setShowDialog(false);
                      setShowHint(true);
                    }}
                    className="flex-1 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.22em] text-black"
                    style={{ background: theme.cardMetal }}
                  >
                    Ver coleção
                  </button>
                  <button
                    onClick={handleNpcClick}
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-[0.22em] text-white"
                  >
                    Ouvir mais
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* HINT */}
      <AnimatePresence>
        {showHint && !showDialog && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            className="fixed bottom-5 left-1/2 z-[9990] w-[92%] max-w-[900px] -translate-x-1/2 rounded-[28px] border border-white/10 bg-black/82 px-5 py-4 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">Coleção liberada</p>
                <p className="mt-1 text-white/85">
                  {playerName}, toque na peça para ela ser apresentada. Cada compra aumenta uma habilidade em{' '}
                  <span className="font-black text-white">+1%</span>.
                </p>
              </div>
              <button
                onClick={() => setShowHint(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-[0.25em] text-white/75"
              >
                Fechar aviso
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ITEM SHOWCASE */}
      <AnimatePresence>
        {showItemShowcase && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/88 backdrop-blur-md"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.04),transparent_20%),radial-gradient(circle_at_80%_18%,rgba(255,215,0,0.18),transparent_22%),radial-gradient(circle_at_52%_88%,rgba(255,80,140,0.1),transparent_25%)]" />
            <div className="relative flex h-full flex-col items-center justify-center gap-8 px-4 py-8 lg:flex-row lg:justify-between lg:px-10">
              <motion.div
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-full max-w-[520px] order-2 lg:order-1"
              >
                <div
                  className="relative overflow-hidden rounded-[32px] border"
                  style={{
                    borderColor: theme.accent,
                    background: 'linear-gradient(180deg, rgba(12,12,12,.95), rgba(0,0,0,.98))',
                    boxShadow: `0 24px 90px rgba(0,0,0,.55), 0 0 30px ${theme.accentSoft}`,
                  }}
                >
                  <motion.div
                    className="absolute -inset-10 blur-3xl"
                    animate={{ opacity: [0.18, 0.42, 0.18] }}
                    transition={{ duration: 3.5, repeat: Infinity }}
                    style={{ background: `radial-gradient(circle, ${theme.aura}, transparent 55%)` }}
                  />
                  <div className="relative p-6 sm:p-8">
                    <p className="text-[10px] uppercase tracking-[0.42em] text-white/38">Apresentação privada</p>
                    <h2 className="mt-2 text-3xl font-black text-white">{selectedItem.name}</h2>
                    <p className="mt-3 text-sm text-white/68">
                      {skillLabels[selectedItem.skill]} +1% permanente • Compra única
                    </p>
                    <p className="mt-5 text-base leading-relaxed text-white/82">
                      {purchasedItems[selectedItem.id]
                        ? `${playerName}, essa peça já é sua. Continua linda, continua pesada, continua combinando com a forma como você gosta de ser visto.`
                        : `${playerName}, olha essa peça comigo. É exatamente o tipo de luxo que transforma presença em poder e atenção em respeito.`}
                    </p>

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                      <button
                        onClick={handleBuy}
                        disabled={showCard}
                        className="flex-1 rounded-[22px] px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-black"
                        style={{ background: theme.cardMetal, boxShadow: `0 14px 34px ${theme.accentSoft}` }}
                      >
                        {purchasedItems[selectedItem.id] ? 'Comprado' : `Comprar por R$ ${money(selectedItem.price)}`}
                      </button>
                      <button
                        onClick={() => setShowItemShowcase(false)}
                        className="flex-1 rounded-[22px] border border-white/10 bg-white/5 px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-white"
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="relative flex w-full flex-1 items-center justify-center order-1 lg:order-2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative flex w-full max-w-[980px] items-end justify-end"
                >
                  {/* giant item near hands */}
                  <motion.div
                    initial={{ y: 28, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.45 }}
                    className="absolute left-[4%] top-[16%] z-20 w-[40%] max-w-[360px] min-w-[220px] lg:left-[16%] lg:top-[18%]"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${theme.aura}, transparent 55%)` }} />
                      <div className="absolute inset-x-[12%] bottom-5 h-8 rounded-full blur-xl" style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,.55), transparent 70%)' }} />
                      <Image
                        src={selectedItem.image}
                        alt={selectedItem.name}
                        className="relative z-10 h-auto w-full object-contain"
                        style={{
                          filter: `${getItemVisual(level, selectedItem.id).filter} drop-shadow(0 0 30px ${theme.accent})`,
                        }}
                        width={420}
                        height={420}
                      />
                    </div>
                  </motion.div>

                  {/* npc */}
                  <motion.div
                    animate={{ y: [0, -1.2, 0] }}
                    transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-10 mr-0 lg:mr-8"
                  >
                    <div className="absolute -bottom-5 left-1/2 h-12 w-[72%] -translate-x-1/2 rounded-full blur-2xl" style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,.62), transparent 70%)' }} />
                    <div className="absolute inset-0 rounded-full blur-3xl opacity-40" style={{ background: 'radial-gradient(circle, rgba(255,94,162,.14), transparent 45%)' }} />
                    <Image
                      src={NPC_IMG}
                      alt="NPC apresentando item"
                      className="relative z-10 h-[540px] w-auto object-contain sm:h-[640px] lg:h-[740px] drop-shadow-[0_0_46px_rgba(255,215,0,0.16)]"
                      width={520}
                      height={940}
                    />
                  </motion.div>
                </motion.div>
              </div>

              <button
                onClick={() => setShowItemShowcase(false)}
                className="absolute right-5 top-5 rounded-full border border-white/10 bg-black/45 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-white/82"
              >
                fechar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* CARD */}
      <AnimatePresence>
        {showCard && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10020] flex items-center justify-center bg-black/82 px-4 backdrop-blur-sm"
          >
            <div className="relative flex w-full max-w-[1100px] flex-col items-center justify-center gap-10 lg:flex-row">
              <motion.div
                initial={{ x: -120, opacity: 0, rotate: -8 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="max-w-md text-center lg:text-left"
              >
                <p className="text-[11px] uppercase tracking-[0.38em] text-white/45">Transação privada</p>
                <h2 className="mt-3 text-3xl font-black text-white sm:text-5xl">Confirmando sua compra</h2>
                <p className="mt-4 text-base leading-relaxed text-white/72">
                  Dinheiro virando presença. Presença virando poder. É assim que homem caro deve comprar.
                </p>
                <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-white/60">Item selecionado</p>
                  <p className="mt-2 text-2xl font-black text-white">{selectedItem.name}</p>
                  <p className="mt-2 text-lg font-black text-yellow-300">R$ {money(selectedItem.price)}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ scale: 0.88, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative"
              >
                <motion.div
                  animate={{ rotateY: [0, 8, -8, 0], rotateX: [0, 2, -2, 0], y: [0, -5, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative h-[235px] w-[390px] overflow-hidden rounded-[30px] border border-white/15 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
                  style={{ background: 'linear-gradient(135deg,#0d0d0d 0%,#1a1a1a 24%,#2e2208 58%,#0e0e0e 100%)', perspective: '1000px' }}
                >
                  <div className="absolute inset-0 opacity-70">
                    <div className="absolute -left-20 top-0 h-52 w-52 rounded-full bg-yellow-400/10 blur-3xl" />
                    <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />
                    <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-sky-500/10 blur-3xl" />
                  </div>

                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.44em] text-white/45">Private Access</p>
                        <p className="mt-2 text-xl font-black text-white">Noir Reserve</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="h-11 w-16 rounded-xl" style={{ background: theme.cardMetal, boxShadow: '0 0 18px rgba(255,215,0,.35)' }} />
                        <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/35">Secure</p>
                      </div>
                    </div>

                    <div>
                      <div className="mb-5 flex items-center gap-2">
                        {[0, 1, 2, 3].map((n) => (
                          <span key={n} className="h-2.5 w-12 rounded-full bg-white/70" style={{ opacity: 0.9 - n * 0.18 }} />
                        ))}
                      </div>
                      <p className="text-[11px] uppercase tracking-[0.36em] text-white/45">Portador</p>
                      <p className="mt-1 text-xl font-black uppercase tracking-[0.18em] text-white">{playerName}</p>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">Valor</p>
                        <p className="mt-1 text-lg font-black text-yellow-300">R$ {money(selectedItem.price)}</p>
                      </div>
                      <motion.div
                        animate={{ opacity: [0.55, 1, 0.55] }}
                        transition={{ duration: 1.1, repeat: Infinity }}
                        className="rounded-full border border-yellow-300/40 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-yellow-200"
                      >
                        validando
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.2, 0.82, 0.2] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="pointer-events-none absolute inset-0 rounded-[32px]"
                  style={{ boxShadow: '0 0 70px rgba(255,215,0,.18), 0 0 130px rgba(255,77,154,.12)' }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
