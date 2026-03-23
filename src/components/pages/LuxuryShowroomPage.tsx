import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePlayerStore } from '@/store/playerStore';
import { useCleanMoneyStore } from '@/store/cleanMoneyStore';
import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';

type SkillKey = 'inteligencia' | 'agilidade' | 'ataque' | 'defesa' | 'respeito' | 'vigor';
type DialogTone = 'welcome' | 'click' | 'purchase' | 'owned' | 'insufficient';
type PurchaseMap = Record<number, boolean>;
type DialogState = { open: boolean; tone: DialogTone; title: string; message: string };
type CardState = { open: boolean; itemName: string; price: number };

type LuxuryItem = {
  id: number;
  baseName: string;
  image: string;
  skill: SkillKey;
};

const SHOWROOM_BG =
  'https://static.wixstatic.com/media/50f4bf_e591cecf171a471cbfa4c0d91653f072~mv2.png';
const NPC_IMG =
  'https://static.wixstatic.com/media/50f4bf_8dc3c6fde14f4e06b7937591bf2c203d~mv2.png';

const ITEM_TYPES: LuxuryItem[] = [
  {
    id: 0,
    baseName: 'Anel',
    image:
      'https://static.wixstatic.com/media/50f4bf_b4ba3afc05854898ba783d0de389365c~mv2.png',
    skill: 'respeito',
  },
  {
    id: 1,
    baseName: 'Pulseira',
    image:
      'https://static.wixstatic.com/media/50f4bf_80f3ea6ada6a4239b5fde6e862c0f4b0~mv2.png',
    skill: 'agilidade',
  },
  {
    id: 2,
    baseName: 'Corrente',
    image:
      'https://static.wixstatic.com/media/50f4bf_24463c72375a4151be5f718bd0169cab~mv2.png',
    skill: 'ataque',
  },
  {
    id: 3,
    baseName: 'Relógio',
    image:
      'https://static.wixstatic.com/media/50f4bf_3f8630e8f4a845d581213e7fc906ba09~mv2.png',
    skill: 'inteligencia',
  },
  {
    id: 4,
    baseName: 'Bolsa',
    image:
      'https://static.wixstatic.com/media/50f4bf_0f2cb270b40649d4a24e14b5aa4788bc~mv2.png',
    skill: 'defesa',
  },
  {
    id: 5,
    baseName: 'Óculos',
    image:
      'https://static.wixstatic.com/media/50f4bf_01707feefbb346e09308f3739d8586a8~mv2.png',
    skill: 'vigor',
  },
];

const COLLECTION_NAMES: Record<number, string> = {
  1: 'Básico',
  2: 'Simples',
  3: 'Refinado',
  4: 'Premium',
  5: 'Luxo',
  6: 'Elite',
  7: 'Supremo',
  8: 'Imperial',
  9: 'Real',
  10: 'Magnata',
  11: 'Aristocrata',
  12: 'Nobre',
  13: 'Dinastia',
  14: 'Herança',
  15: 'Fortuna',
  16: 'Prestige',
  17: 'Elite Suprema',
  18: 'Império',
  19: 'Apex',
  20: 'Soberano',
  21: 'Monarca',
  22: 'Coroa',
  23: 'Platinum',
  24: 'Royal',
  25: 'Infinite',
  26: 'Legacy',
  27: 'Obsidian',
  28: 'Velvet',
  29: 'Noir',
  30: 'Zenith',
  31: 'Imperial Noir',
  32: 'Crown Legacy',
  33: 'Supreme Dynasty',
  34: 'Golden Empire',
  35: 'Infinite Prestige',
  36: 'Platinum Empire',
  37: 'Diamond Sovereign',
  38: 'Black Crown',
  39: 'Obsidian Royalty',
  40: 'Apex Dynasty',
  41: 'Syndicate',
  42: 'Mafia Royale',
  43: 'Casino Prestige',
  44: 'Diamond Syndicate',
  45: 'Black Market',
  46: 'Underworld',
  47: 'Crimson Empire',
  48: 'Platinum Syndicate',
  49: 'Cartel Elite',
  50: 'Apex Underworld',
  51: 'Billionaire',
  52: 'Global Elite',
  53: 'Supreme Capital',
  54: 'Infinite Wealth',
  55: 'Ultra Dynasty',
  56: 'Titan',
  57: 'Apex Billionaire',
  58: 'Supreme Mogul',
  59: 'Infinite Empire',
  60: 'Ultimate Sovereign',
  61: 'Eternal',
  62: 'Divine',
  63: 'Celestial',
  64: 'Infinite Aura',
  65: 'Obsidian Legend',
  66: 'Diamond Eternity',
  67: 'Mythic',
  68: 'Majesty',
  69: 'Cosmic',
  70: 'Apex Infinity',
  71: 'Eternal Apex',
  72: 'Divine Infinity',
  73: 'Celestial Apex',
  74: 'Infinite Divinity',
  75: 'Godtier',
  76: 'Immortal',
  77: 'Mythic Infinity',
  78: 'Supreme Eternity',
  79: 'Cosmic Apex',
  80: 'Absolute Infinity',
  81: 'Eternal God',
  82: 'Divinity Prime',
  83: 'Celestial Absolute',
  84: 'Apex Divinity',
  85: 'Godhood',
  86: 'Absolute Supreme',
  87: 'Omnipotent',
  88: 'Transcendent',
  89: 'Cosmic Supreme',
  90: 'Overlord',
  91: 'Creator',
  92: 'Absolute Creator',
  93: 'Architect',
  94: 'Infinite Architect',
  95: 'Supreme Entity',
  96: 'Absolute Entity',
  97: 'Eternal Entity',
  98: 'Infinite Entity',
  99: 'Supreme Infinity',
  100: 'Domínio do Comando',
};

const SKILL_LABELS: Record<SkillKey, string> = {
  inteligencia: 'Inteligência',
  agilidade: 'Agilidade',
  ataque: 'Ataque',
  defesa: 'Defesa',
  respeito: 'Respeito',
  vigor: 'Vigor',
};

const NPC_LINES: Record<DialogTone, (name: string, item?: string, skill?: string) => string[]> = {
  welcome: (name) => [
    `${name}... olha em volta. Aqui não entra quem quer parecer rico. Aqui entra quem quer ser lembrado, desejado e respeitado.`,
    `Eu gosto quando você chega com fome de status, ${name}. Luxo não é detalhe... é presença.`,
    `${name}, cada peça aqui muda o jeito que o mundo te lê. Compra certa é poder sem precisar dizer uma palavra.`,
  ],
  click: (name) => [
    `Voltou pra mim, ${name}? Eu adoro quando homem ambicioso sabe exatamente onde o brilho dele começa.`,
    `${name}, me diz que você não veio só olhar... porque essa coleção foi feita pra quem gosta de ser notado.`,
    `Você tem cara de quem nasceu pra chamar atenção, ${name}. Agora só falta escolher com maldade e classe.`,
  ],
  purchase: (name, item, skill) => [
    `${item} ficou absurdo em você, ${name}. Agora sua ${skill} subiu +1%... e isso já muda o jeito que te olham.`,
    `Era isso que eu queria ver. ${item} te deixou ainda mais perigoso, ${name}. +1% em ${skill}.`,
    `Agora sim você começa a parecer o tipo de homem que eu gosto de ver gastar. ${item}. +1% em ${skill}.`,
  ],
  owned: (name) => [
    `${name}, esse já é seu. E honestamente? Ficou bom demais em você pra repetir.`,
    `Você já marcou essa peça como sua. Homem com presença não precisa provar duas vezes o mesmo ponto.`,
    `Esse já está comprado, ${name}. Seu gosto é caro... e eu gosto disso.`,
  ],
  insufficient: (name) => [
    `${name}, desejo sem caixa não sustenta luxo. Junta mais dinheiro limpo e volta do jeito que eu gosto.`,
    `Quase. Mas quase não combina com esse nível. Volta quando o bolso estiver tão forte quanto a intenção, ${name}.`,
    `Não me vem com hesitação agora, ${name}. Luxo sério exige valor sério.`,
  ],
};

function clampLevel(level: number) {
  return Math.min(100, Math.max(1, level || 1));
}

function pick<T>(list: T[]) {
  return list[Math.floor(Math.random() * list.length)];
}

function formatMoney(value: number) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getCollectionName(level: number) {
  return COLLECTION_NAMES[clampLevel(level)] || `Nível ${level}`;
}

function getLuxuryPrice(level: number) {
  return Number((120 * Math.pow(1.1, clampLevel(level) - 1)).toFixed(2));
}

function getLuxuryBackground(level: number) {
  if (level <= 10) return 'linear-gradient(135deg,#1d1d1d 0%,#090909 100%)';
  if (level <= 25) return 'linear-gradient(135deg,#0b1122 0%,#1b3768 100%)';
  if (level <= 50) return 'linear-gradient(135deg,#18091e 0%,#5c1490 100%)';
  if (level <= 75) return 'linear-gradient(135deg,#0a0a0a 0%,#2a1f05 45%,#d2a217 100%)';
  if (level <= 90) return 'radial-gradient(circle at 25% 20%,#ffe58a 0%,#66500d 25%,#050505 100%)';
  return 'radial-gradient(circle at 50% 35%,#ffffff 0%,#ffd700 18%,#070707 75%)';
}

function getTheme(level: number) {
  if (level <= 10) {
    return {
      accent: '#9a9a9a',
      glow: 'rgba(255,255,255,0.18)',
      panel: 'linear-gradient(135deg,rgba(26,26,26,0.94),rgba(6,6,6,0.97))',
    };
  }
  if (level <= 25) {
    return {
      accent: '#58a7ff',
      glow: 'rgba(88,167,255,0.25)',
      panel: 'linear-gradient(135deg,rgba(12,27,58,0.94),rgba(5,8,18,0.97))',
    };
  }
  if (level <= 50) {
    return {
      accent: '#be73ff',
      glow: 'rgba(190,115,255,0.26)',
      panel: 'linear-gradient(135deg,rgba(38,10,55,0.95),rgba(9,4,18,0.97))',
    };
  }
  if (level <= 75) {
    return {
      accent: '#d9aa26',
      glow: 'rgba(217,170,38,0.28)',
      panel: 'linear-gradient(135deg,rgba(18,18,18,0.96),rgba(53,39,4,0.95))',
    };
  }
  if (level <= 90) {
    return {
      accent: '#ffd700',
      glow: 'rgba(255,215,0,0.3)',
      panel: 'linear-gradient(135deg,rgba(20,20,20,0.96),rgba(77,59,7,0.96))',
    };
  }
  return {
    accent: '#ffffff',
    glow: 'rgba(255,255,255,0.32)',
    panel: 'linear-gradient(135deg,rgba(18,18,18,0.96),rgba(84,67,11,0.96))',
  };
}

function getItemVisual(level: number, index: number) {
  const palette = [
    ['#f8d874', '#b98908'],
    ['#76eaff', '#1488bc'],
    ['#ff80cf', '#ac1f7a'],
    ['#caa5ff', '#7640d4'],
    ['#79ffaf', '#149a4d'],
    ['#ffe1a1', '#d07f1d'],
  ];
  const [primary, secondary] = palette[index % palette.length];
  return {
    primary,
    secondary,
    overlay: `hsla(${(level * 8 + index * 34) % 360},85%,58%,.14)`,
    filter: `hue-rotate(${(level * 7 + index * 18) % 360}deg) saturate(${1 + level / 150})`,
  };
}

function getPowerTitle(totalBonus: number) {
  if (totalBonus <= 1) return 'Presença em ascensão';
  if (totalBonus <= 2) return 'Nome começando a pesar';
  if (totalBonus <= 3) return 'Figura de respeito';
  if (totalBonus <= 4) return 'Luxo que impõe presença';
  if (totalBonus <= 5) return 'Patamar de elite criminosa';
  return 'Domínio absoluto da ostentação';
}

export default function LuxuryShowroomPage() {
  const playerNameRaw = usePlayerStore((state) => state.playerName);
  const barracoLevel = usePlayerStore((state) => state.barracoLevel);
  const playerLevel = usePlayerStore((state) => state.level);
  const setBarracoLevel = usePlayerStore((state) => state.setBarracoLevel);
  const cleanMoney = useCleanMoneyStore((state) => state.cleanMoney);
  const removeCleanMoney = useCleanMoneyStore((state) => state.removeCleanMoney);

  const playerName = (playerNameRaw || 'COMANDANTE').trim() || 'COMANDANTE';
  const level = clampLevel(barracoLevel || playerLevel || 1);
  const collectionName = useMemo(() => getCollectionName(level), [level]);
  const price = useMemo(() => getLuxuryPrice(level), [level]);
  const theme = useMemo(() => getTheme(level), [level]);
  const storageKey = useMemo(
    () => `luxury_showroom_purchases_${playerName.toLowerCase().replace(/\s+/g, '_')}`,
    [playerName],
  );

  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState<PurchaseMap>({});
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    tone: 'welcome',
    title: '',
    message: '',
  });
  const [showCollectionHint, setShowCollectionHint] = useState(false);
  const [cardState, setCardState] = useState<CardState>({
    open: false,
    itemName: '',
    price: 0,
  });
  const [flash, setFlash] = useState(false);
  const [npcHover, setNpcHover] = useState(false);
  const [blink, setBlink] = useState(false);
  const [npcShift, setNpcShift] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        let playerId = urlParams.get('playerId') || localStorage.getItem('currentPlayerId');

        if (!playerId) {
          const result = await BaseCrudService.getAll<Players>('players', [], { limit: 1 });
          if (result.items && result.items.length > 0) {
            playerId = result.items[0]._id;
            localStorage.setItem('currentPlayerId', playerId);
          }
        }

        if (playerId) {
          const playerData = await BaseCrudService.getById<Players>('players', playerId);
          if (playerData?.level) {
            setBarracoLevel(playerData.level);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados do jogador:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPlayerData();
  }, [setBarracoLevel]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setPurchased(JSON.parse(saved));
    } catch {
      setPurchased({});
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(purchased));
  }, [purchased, storageKey]);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      setDialog({
        open: true,
        tone: 'welcome',
        title: `Boa noite, ${playerName}`,
        message: pick(NPC_LINES.welcome(playerName)),
      });
    }, 900);
    return () => clearTimeout(timer);
  }, [loading, playerName]);

  useEffect(() => {
    let active = true;
    const loop = () => {
      const delay = Math.random() * 2600 + 2800;
      const timer = setTimeout(() => {
        if (!active) return;
        setBlink(true);
        setTimeout(() => setBlink(false), 120);
        loop();
      }, delay);
      return timer;
    };
    const timer = loop();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const items = useMemo(
    () =>
      ITEM_TYPES.map((item) => ({
        ...item,
        name: `${item.baseName} ${collectionName}`,
        price,
      })),
    [collectionName, price],
  );

  const skillBonuses = useMemo(() => {
    const initial: Record<SkillKey, number> = {
      inteligencia: 0,
      agilidade: 0,
      ataque: 0,
      defesa: 0,
      respeito: 0,
      vigor: 0,
    };
    ITEM_TYPES.forEach((item) => {
      if (purchased[item.id]) initial[item.skill] += 1;
    });
    return initial;
  }, [purchased]);

  const boughtCount = Object.values(purchased).filter(Boolean).length;
  const totalBonus = Object.values(skillBonuses).reduce((sum, value) => sum + value, 0);

  const openDialog = (tone: DialogTone, itemName?: string, skillLabel?: string) => {
    const titles: Record<DialogTone, string> = {
      welcome: `Boa noite, ${playerName}`,
      click: `${playerName}, olha pra mim`,
      purchase: `${playerName}, agora você pesa mais`,
      owned: `${playerName}, esse já é seu`,
      insufficient: `${playerName}, ainda não`,
    };
    setDialog({
      open: true,
      tone,
      title: titles[tone],
      message: pick(NPC_LINES[tone](playerName, itemName, skillLabel)),
    });
  };

  const handleNpcClick = () => {
    openDialog('click');
    setShowCollectionHint(true);
  };

  const finalizeBuy = (item: (typeof items)[number]) => {
    removeCleanMoney(item.price);
    setPurchased((prev) => ({ ...prev, [item.id]: true }));
    setCardState({ open: false, itemName: '', price: 0 });
    setFlash(true);
    setTimeout(() => setFlash(false), 700);
    openDialog('purchase', item.name, SKILL_LABELS[item.skill]);
    setShowCollectionHint(true);
  };

  const handleBuy = (item: (typeof items)[number]) => {
    if (purchased[item.id]) {
      openDialog('owned');
      return;
    }
    if (cleanMoney < item.price) {
      openDialog('insufficient');
      return;
    }
    setCardState({ open: true, itemName: item.name, price: item.price });
    setTimeout(() => finalizeBuy(item), 3200);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <Header />
        <div
          className="relative flex flex-1 items-center justify-center overflow-hidden"
          style={{ background: getLuxuryBackground(level) }}
        >
          <Image
            src={SHOWROOM_BG}
            alt="Luxury Showroom Background"
            className="absolute h-full w-full object-cover opacity-35"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative z-10 rounded-[28px] border border-white/10 bg-black/55 px-8 py-6 text-center backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-white/45">
              Luxury Showroom
            </p>
            <h2 className="mt-3 text-3xl font-black text-white">Carregando vitrine privada</h2>
            <div className="mx-auto mt-6 h-2.5 w-56 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg,#ffd700,#ffffff)',
                }}
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Header />

      <div className="relative flex-1 overflow-hidden" style={{ background: getLuxuryBackground(level) }}>
        <div className="absolute inset-0">
          <Image
            src={SHOWROOM_BG}
            alt="Luxury Showroom Background"
            className="absolute h-full w-full object-cover opacity-80"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/55" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,215,0,0.18),transparent_28%),radial-gradient(circle_at_78%_20%,rgba(255,0,140,0.14),transparent_24%),radial-gradient(circle_at_50%_80%,rgba(0,180,255,0.08),transparent_28%)]" />
        </div>

        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.32 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-40"
              style={{
                background:
                  'radial-gradient(circle at center, rgba(255,215,0,0.62), rgba(255,84,166,0.18), transparent 60%)',
              }}
            />
          )}
        </AnimatePresence>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-140px)] w-full max-w-[1680px] flex-col gap-6 px-4 pb-8 pt-5 lg:px-8">
          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            {/* LEFT SIDE */}
            <div
              className="relative overflow-hidden rounded-[34px] border border-white/10"
              style={{
                background: 'linear-gradient(180deg,rgba(10,10,10,0.48),rgba(0,0,0,0.65))',
                boxShadow: '0 24px 100px rgba(0,0,0,0.55), inset 0 0 50px rgba(255,255,255,0.03)',
              }}
            >
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-[7%] top-[8%] h-64 w-64 rounded-full bg-yellow-400/15 blur-3xl" />
                <div className="absolute right-[6%] top-[16%] h-72 w-72 rounded-full bg-fuchsia-500/12 blur-3xl" />
                <div className="absolute bottom-[8%] left-[28%] h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
              </div>

              <div className="relative z-10 flex min-h-[760px] flex-col justify-between px-6 py-6 sm:px-8 lg:px-10">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.45em] text-white/55">
                      Showroom Privado
                    </p>
                    <h1 className="mt-2 text-3xl font-black leading-none text-white sm:text-5xl">
                      Coleção {collectionName}
                    </h1>
                    <p className="mt-3 max-w-xl text-sm text-white/72 sm:text-base">
                      Luxo ostentação, provocação e presença. Aqui você compra peças
                      que fazem você parecer mais caro, mais desejado e mais forte.
                    </p>
                  </div>

                  <div
                    className="rounded-2xl border px-4 py-3 text-right"
                    style={{
                      borderColor: theme.glow,
                      background: 'rgba(0,0,0,0.42)',
                      boxShadow: `0 0 35px ${theme.glow}`,
                    }}
                  >
                    <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">
                      Jogador
                    </p>
                    <p className="mt-1 text-lg font-black uppercase text-white">
                      {playerName}
                    </p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/45">
                      Barraco nível {level}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div
                    className="rounded-3xl border p-4 backdrop-blur-md"
                    style={{ borderColor: theme.glow, background: 'rgba(0,0,0,0.3)' }}
                  >
                    <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
                      Dinheiro limpo
                    </p>
                    <p className="mt-2 text-2xl font-black text-white">
                      R$ {formatMoney(cleanMoney)}
                    </p>
                  </div>

                  <div
                    className="rounded-3xl border p-4 backdrop-blur-md"
                    style={{ borderColor: theme.glow, background: 'rgba(0,0,0,0.3)' }}
                  >
                    <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
                      Itens comprados
                    </p>
                    <p className="mt-2 text-2xl font-black text-white">{boughtCount}/6</p>
                  </div>

                  <div
                    className="rounded-3xl border p-4 backdrop-blur-md"
                    style={{ borderColor: theme.glow, background: 'rgba(0,0,0,0.3)' }}
                  >
                    <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
                      Presença total
                    </p>
                    <p className="mt-2 text-2xl font-black text-white">+{totalBonus}%</p>
                  </div>
                </div>

                <div className="relative mt-4 flex min-h-[500px] items-end justify-between gap-4 overflow-hidden rounded-[30px] border border-white/10 bg-black/20 px-3 sm:px-6">
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/85 to-transparent" />
                    <div className="absolute bottom-0 left-0 h-full w-full bg-[radial-gradient(circle_at_50%_95%,rgba(255,215,0,0.18),transparent_36%)]" />
                  </div>

                  {/* DIALOG PANEL */}
                  <div className="relative z-10 hidden max-w-[420px] self-center xl:block">
                    <AnimatePresence mode="wait">
                      {dialog.open && (
                        <motion.div
                          key={`${dialog.title}-${dialog.message}`}
                          initial={{ opacity: 0, x: -28, y: 12 }}
                          animate={{ opacity: 1, x: 0, y: 0 }}
                          exit={{ opacity: 0, x: -12, y: 8 }}
                          transition={{ duration: 0.28, ease: 'easeOut' }}
                          className="overflow-hidden rounded-[30px] border"
                          style={{
                            borderColor: theme.accent,
                            background:
                              'linear-gradient(180deg,rgba(12,12,12,0.94),rgba(0,0,0,0.96))',
                            boxShadow: `0 18px 70px rgba(0,0,0,0.5), 0 0 28px ${theme.glow}`,
                          }}
                        >
                          <div className="pointer-events-none absolute inset-0" />
                          <div className="relative p-6">
                            <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">
                              Atendimento privado
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-white">
                              {dialog.title}
                            </h2>
                            <p className="mt-4 text-base leading-relaxed text-white/80">
                              {dialog.message}
                            </p>
                            <div className="mt-6 flex gap-3">
                              <button
                                onClick={() => {
                                  setDialog((prev) => ({ ...prev, open: false }));
                                  setShowCollectionHint(true);
                                }}
                                className="flex-1 rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-[0.22em] text-black"
                                style={{
                                  background: `linear-gradient(135deg, ${theme.accent}, #f7e7b2)`,
                                  boxShadow: `0 12px 28px ${theme.glow}`,
                                }}
                              >
                                Ver coleção
                              </button>
                              <button
                                onClick={handleNpcClick}
                                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black uppercase tracking-[0.22em] text-white"
                              >
                                Ouvir mais
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* NPC */}
                  <div className="relative z-10 flex h-full flex-1 items-end justify-end">
                    <motion.div
                      onMouseEnter={() => setNpcHover(true)}
                      onMouseLeave={() => {
                        setNpcHover(false);
                        setNpcShift({ x: 0, y: 0 });
                      }}
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const dx = e.clientX - (rect.left + rect.width / 2);
                        const dy = e.clientY - (rect.top + rect.height / 2);
                        setNpcShift({
                          x: Math.max(-4, Math.min(4, dx / 80)),
                          y: Math.max(-3, Math.min(3, dy / 120)),
                        });
                      }}
                      onClick={handleNpcClick}
                      animate={{ y: [0, -1.5, 0] }}
                      transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut' }}
                      className="relative cursor-pointer"
                      style={{ filter: npcHover ? 'brightness(1.08)' : 'brightness(1)' }}
                    >
                      <motion.div
                        animate={{
                          x: npcShift.x,
                          y: npcShift.y,
                          scale: npcHover ? 1.02 : 1,
                        }}
                        transition={{ duration: 0.22 }}
                        className="relative"
                      >
                        <div
                          className="absolute -bottom-5 left-1/2 h-12 w-[72%] -translate-x-1/2 rounded-full blur-2xl"
                          style={{
                            background:
                              'radial-gradient(ellipse, rgba(0,0,0,0.58), transparent 70%)',
                          }}
                        />
                        <div
                          className="absolute inset-0 rounded-full blur-3xl opacity-55"
                          style={{
                            background:
                              'radial-gradient(circle, rgba(255,86,156,0.16), transparent 45%)',
                          }}
                        />

                        <Image
                          src={NPC_IMG}
                          alt="NPC Luxury"
                          className="relative z-10 h-[610px] w-auto object-contain drop-shadow-[0_0_45px_rgba(255,215,0,0.2)] sm:h-[700px]"
                          width={520}
                          height={940}
                        />

                        {blink && (
                          <div
                            className="pointer-events-none absolute left-1/2 top-[22%] z-20 h-[5.5%] w-[24%] -translate-x-1/2 rounded-full"
                            style={{ background: 'rgba(0,0,0,0.16)' }}
                          />
                        )}
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex flex-col gap-6">
              <div
                className="rounded-[34px] border p-5 shadow-2xl"
                style={{
                  borderColor: theme.glow,
                  background: theme.panel,
                  boxShadow:
                    '0 24px 80px rgba(0,0,0,0.46), inset 0 0 30px rgba(255,255,255,0.04)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">
                      Catálogo de luxo
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-white">
                      Coleção {collectionName}
                    </h2>
                    <p className="mt-2 text-sm text-white/65">
                      Peças grandes, visuais e caras do jeito certo. Cada compra
                      aumenta uma habilidade em +1% permanentemente.
                    </p>
                  </div>

                  <div
                    className="rounded-2xl border px-3 py-2 text-center"
                    style={{
                      borderColor: theme.glow,
                      background: 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/45">
                      Nível
                    </p>
                    <p className="text-xl font-black text-white">{level}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-5">
                  {items.map((item, index) => {
                    const visual = getItemVisual(level, index);
                    const bought = !!purchased[item.id];

                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: bought ? 0 : -2 }}
                        className="relative overflow-hidden rounded-[30px] border p-5 transition-all"
                        style={{
                          borderColor: bought ? 'rgba(255,255,255,0.08)' : visual.overlay,
                          background: bought
                            ? 'linear-gradient(135deg, rgba(16,16,16,0.9), rgba(10,10,10,0.92))'
                            : `linear-gradient(135deg, rgba(12,12,12,0.94), ${visual.overlay})`,
                          opacity: bought ? 0.88 : 1,
                          boxShadow: bought
                            ? '0 14px 35px rgba(0,0,0,0.28)'
                            : `0 18px 45px rgba(0,0,0,0.34), 0 0 20px ${visual.overlay}`,
                        }}
                      >
                        <div
                          className="pointer-events-none absolute inset-0"
                          style={{
                            background: `radial-gradient(circle at 82% 18%, ${visual.overlay}, transparent 35%)`,
                          }}
                        />

                        <div className="relative z-10 flex flex-col gap-5 md:flex-row">
                          <div
                            className="relative flex h-[190px] w-full shrink-0 items-center justify-center overflow-hidden rounded-[24px] border md:w-[220px]"
                            style={{
                              borderColor: bought ? 'rgba(255,255,255,0.08)' : visual.overlay,
                              background:
                                'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(0,0,0,0.28))',
                            }}
                          >
                            <div
                              className="absolute inset-0 opacity-65"
                              style={{
                                background: `radial-gradient(circle at 50% 42%, ${visual.overlay}, transparent 60%)`,
                              }}
                            />
                            <div
                              className="absolute inset-x-[14%] bottom-4 h-7 rounded-full blur-xl"
                              style={{
                                background:
                                  'radial-gradient(ellipse, rgba(0,0,0,0.45), transparent 70%)',
                              }}
                            />
                            <Image
                              src={item.image}
                              alt={item.name}
                              className="relative z-10 h-[148px] w-[148px] object-contain"
                              style={{
                                filter: bought
                                  ? 'brightness(0.86) contrast(1.05)'
                                  : `${visual.filter} drop-shadow(0 0 24px ${visual.primary})`,
                              }}
                              width={180}
                              height={180}
                            />
                            {!bought && (
                              <div
                                className="absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-black"
                                style={{
                                  background: `linear-gradient(135deg, ${visual.primary}, #f7e7b4)`,
                                }}
                              >
                                Exclusivo
                              </div>
                            )}
                            {bought && (
                              <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/55 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-white/85">
                                Comprado
                              </div>
                            )}
                          </div>

                          <div className="flex flex-1 flex-col justify-between">
                            <div>
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <h3 className="text-2xl font-black leading-tight text-white">
                                    {item.name}
                                  </h3>
                                  <p className="mt-2 text-sm text-white/64">
                                    {SKILL_LABELS[item.skill]} +1% permanente
                                  </p>
                                </div>

                                <div
                                  className="rounded-2xl border px-4 py-2 text-center"
                                  style={{
                                    borderColor: bought ? 'rgba(255,255,255,0.08)' : visual.overlay,
                                    background: bought ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.24)',
                                  }}
                                >
                                  <p className="text-[10px] uppercase tracking-[0.26em] text-white/45">
                                    Valor
                                  </p>
                                  <p className="mt-1 text-xl font-black text-white">
                                    R$ {formatMoney(item.price)}
                                  </p>
                                </div>
                              </div>

                              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/72">
                                Peça feita para elevar sua presença, reforçar sua imagem e
                                deixar sua assinatura mais pesada no jogo.
                              </p>
                            </div>

                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.26em] text-white/72">
                                {bought ? 'Sua peça já está garantida' : 'Compra única'}
                              </div>

                              <button
                                onClick={() => handleBuy(item)}
                                disabled={bought || cardState.open}
                                className="rounded-[20px] px-5 py-4 text-sm font-black uppercase tracking-[0.24em] transition-all disabled:cursor-not-allowed"
                                style={{
                                  background: bought
                                    ? 'rgba(255,255,255,0.08)'
                                    : `linear-gradient(135deg, ${visual.primary}, ${visual.secondary})`,
                                  color: bought ? 'rgba(255,255,255,0.55)' : '#080808',
                                  boxShadow: bought ? 'none' : `0 14px 34px ${visual.overlay}`,
                                }}
                              >
                                {bought ? 'Comprado' : 'Comprar agora'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div
                className="rounded-[34px] border p-5"
                style={{
                  borderColor: theme.glow,
                  background: 'rgba(0,0,0,0.46)',
                }}
              >
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">
                  Assinatura de poder
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  {getPowerTitle(totalBonus)}
                </h3>
                <p className="mt-2 text-sm text-white/64">
                  Cada peça compra percepção, desejo e autoridade. Aqui sua imagem
                  vira estatística.
                </p>

                <div className="mt-6 space-y-4">
                  {(Object.entries(skillBonuses) as [SkillKey, number][]).map(([skill, value]) => (
                    <div key={skill}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="text-white/82">{SKILL_LABELS[skill]}</span>
                        <span className="font-black text-white">+{value}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${value * 100}%` }}
                          transition={{ duration: 0.45 }}
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${theme.accent}, #ffffff)`,
                            boxShadow: `0 0 18px ${theme.glow}`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowCollectionHint((prev) => !prev)}
                  className="mt-6 w-full rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-[0.24em] text-black"
                  style={{
                    background: `linear-gradient(135deg, ${theme.accent}, #f5e6b1)`,
                    boxShadow: `0 14px 34px ${theme.glow}`,
                  }}
                >
                  {showCollectionHint ? 'Ocultar aviso' : 'Exibir aviso da coleção'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE / EXTRA DIALOG */}
      <AnimatePresence>
        {dialog.open && (
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
                background: 'linear-gradient(180deg, rgba(14,14,14,0.95), rgba(0,0,0,0.96))',
                boxShadow: `0 20px 80px rgba(0,0,0,0.55), 0 0 26px ${theme.glow}`,
              }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">
                      Atendimento privado
                    </p>
                    <h2 className="mt-2 text-xl font-black text-white">{dialog.title}</h2>
                  </div>
                  <button
                    onClick={() => setDialog((prev) => ({ ...prev, open: false }))}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-white/78"
                  >
                    fechar
                  </button>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/78">{dialog.message}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setDialog((prev) => ({ ...prev, open: false }));
                      setShowCollectionHint(true);
                    }}
                    className="flex-1 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.22em] text-black"
                    style={{ background: `linear-gradient(135deg, ${theme.accent}, #f7e7b4)` }}
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

      {/* COLLECTION HINT */}
      <AnimatePresence>
        {showCollectionHint && !dialog.open && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            className="fixed bottom-5 left-1/2 z-[9990] w-[92%] max-w-[900px] -translate-x-1/2 rounded-[28px] border border-white/10 bg-black/82 px-5 py-4 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">
                  Coleção liberada
                </p>
                <p className="mt-1 text-white/85">
                  {playerName}, escolha a peça certa. Cada compra aumenta uma habilidade em{' '}
                  <span className="font-black text-white">+1%</span>.
                </p>
              </div>
              <button
                onClick={() => setShowCollectionHint(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-[0.25em] text-white/75"
              >
                Fechar aviso
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CARD TRANSACTION */}
      <AnimatePresence>
        {cardState.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/82 px-4 backdrop-blur-sm"
          >
            <div className="relative flex w-full max-w-[1140px] flex-col items-center justify-center gap-10 lg:flex-row">
              <motion.div
                initial={{ x: -120, opacity: 0, rotate: -8 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="max-w-md text-center lg:text-left"
              >
                <p className="text-[11px] uppercase tracking-[0.38em] text-white/45">
                  Transação privada
                </p>
                <h2 className="mt-3 text-3xl font-black text-white sm:text-5xl">
                  Confirmando sua compra
                </h2>
                <p className="mt-4 text-base leading-relaxed text-white/72">
                  Você não está só comprando uma peça. Está comprando impacto,
                  leitura social e mais poder dentro do jogo.
                </p>

                <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-white/60">Item selecionado</p>
                  <p className="mt-2 text-2xl font-black text-white">{cardState.itemName}</p>
                  <p className="mt-2 text-lg font-black text-yellow-300">
                    R$ {formatMoney(cardState.price)}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ scale: 0.88, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative"
              >
                <motion.div
                  animate={{
                    rotateY: [0, 8, -8, 0],
                    rotateX: [0, 2, -2, 0],
                    y: [0, -5, 0],
                  }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative h-[235px] w-[390px] overflow-hidden rounded-[30px] border border-white/15 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
                  style={{
                    background:
                      'linear-gradient(135deg,#0d0d0d 0%,#1a1a1a 24%,#2e2208 58%,#0e0e0e 100%)',
                  }}
                >
                  <div className="absolute inset-0 opacity-70">
                    <div className="absolute -left-20 top-0 h-52 w-52 rounded-full bg-yellow-400/10 blur-3xl" />
                    <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />
                    <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-sky-500/10 blur-3xl" />
                  </div>

                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.44em] text-white/45">
                          Private Access
                        </p>
                        <p className="mt-2 text-xl font-black text-white">Noir Reserve</p>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="h-11 w-16 rounded-xl bg-gradient-to-br from-yellow-200 to-yellow-600 shadow-[0_0_18px_rgba(255,215,0,0.35)]" />
                        <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/35">
                          Secure
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="mb-5 flex items-center gap-2">
                        {[0, 1, 2, 3].map((n) => (
                          <span
                            key={n}
                            className="h-2.5 w-12 rounded-full bg-white/70"
                            style={{ opacity: 0.9 - n * 0.18 }}
                          />
                        ))}
                      </div>

                      <p className="text-[11px] uppercase tracking-[0.36em] text-white/45">
                        Portador
                      </p>
                      <p className="mt-1 text-xl font-black uppercase tracking-[0.18em] text-white">
                        {playerName}
                      </p>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                          Valor
                        </p>
                        <p className="mt-1 text-lg font-black text-yellow-300">
                          R$ {formatMoney(cardState.price)}
                        </p>
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
                  style={{
                    boxShadow:
                      '0 0 70px rgba(255,215,0,0.18), 0 0 130px rgba(255,77,154,0.12)',
                  }}
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
