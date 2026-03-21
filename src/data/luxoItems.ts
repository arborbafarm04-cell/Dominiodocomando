

// ==========================================
// LUXURY ITEMS SYSTEM - FINAL VERSION
// ==========================================

/*
CONCEITO:

- Itens são FIXOS:
  Anel, Pulseira, Corrente, Relógio, Bolsa, Óculos

- O que muda:
  → Nome da coleção (baseado no nível do barraco)
  → Background visual

- O nível do barraco define TUDO
*/

// ==========================================
// ITENS FIXOS
// ==========================================

const itemTypes = [
  {
    name: "Anel",
    image: "https://static.wixstatic.com/media/50f4bf_b4ba3afc05854898ba783d0de389365c~mv2.png"
  },
  {
    name: "Pulseira",
    image: "https://static.wixstatic.com/media/50f4bf_80f3ea6ada6a4239b5fde6e862c0f4b0~mv2.png"
  },
  {
    name: "Corrente",
    image: "https://static.wixstatic.com/media/50f4bf_24463c72375a4151be5f718bd0169cab~mv2.png"
  },
  {
    name: "Relógio",
    image: "https://static.wixstatic.com/media/50f4bf_3f8630e8f4a845d581213e7fc906ba09~mv2.png"
  },
  {
    name: "Bolsa",
    image: "https://static.wixstatic.com/media/50f4bf_0f2cb270b40649d4a24e14b5aa4788bc~mv2.png"
  },
  {
    name: "Óculos",
    image: "https://static.wixstatic.com/media/50f4bf_01707feefbb346e09308f3739d8586a8~mv2.png"
  },
];

// ==========================================
// NOMES DAS COLEÇÕES
// ==========================================

export const collectionNames: Record<number, string> = {
  1: "Básico", 2: "Simples", 3: "Refinado", 4: "Premium", 5: "Luxo",
  6: "Elite", 7: "Supremo", 8: "Imperial", 9: "Real", 10: "Magnata",

  11: "Aristocrata", 12: "Nobre", 13: "Dinastia", 14: "Herança", 15: "Fortuna",
  16: "Prestige", 17: "Elite Suprema", 18: "Império", 19: "Apex", 20: "Soberano",

  21: "Monarca", 22: "Coroa", 23: "Platinum", 24: "Royal", 25: "Infinite",
  26: "Legacy", 27: "Obsidian", 28: "Velvet", 29: "Noir", 30: "Zenith",

  31: "Imperial Noir", 32: "Crown Legacy", 33: "Supreme Dynasty", 34: "Golden Empire",
  35: "Infinite Prestige", 36: "Platinum Empire", 37: "Diamond Sovereign",
  38: "Black Crown", 39: "Obsidian Royalty", 40: "Apex Dynasty",

  41: "Syndicate", 42: "Mafia Royale", 43: "Casino Prestige", 44: "Diamond Syndicate",
  45: "Black Market", 46: "Underworld", 47: "Crimson Empire",
  48: "Platinum Syndicate", 49: "Cartel Elite", 50: "Apex Underworld",

  51: "Billionaire", 52: "Global Elite", 53: "Supreme Capital",
  54: "Infinite Wealth", 55: "Ultra Dynasty", 56: "Titan",
  57: "Apex Billionaire", 58: "Supreme Mogul",
  59: "Infinite Empire", 60: "Ultimate Sovereign",

  61: "Eternal", 62: "Divine", 63: "Celestial", 64: "Infinite Aura",
  65: "Obsidian Legend", 66: "Diamond Eternity", 67: "Mythic",
  68: "Majesty", 69: "Cosmic", 70: "Apex Infinity",

  71: "Eternal Apex", 72: "Divine Infinity", 73: "Celestial Apex",
  74: "Infinite Divinity", 75: "Godtier", 76: "Immortal",
  77: "Mythic Infinity", 78: "Supreme Eternity",
  79: "Cosmic Apex", 80: "Absolute Infinity",

  81: "Eternal God", 82: "Divinity Prime", 83: "Celestial Absolute",
  84: "Apex Divinity", 85: "Godhood", 86: "Absolute Supreme",
  87: "Omnipotent", 88: "Transcendent",
  89: "Cosmic Supreme", 90: "Overlord",

  91: "Creator", 92: "Absolute Creator", 93: "Architect",
  94: "Infinite Architect", 95: "Supreme Entity",
  96: "Absolute Entity", 97: "Eternal Entity",
  98: "Infinite Entity", 99: "Supreme Infinity",
  100: "Domínio do Comando",
};

// ==========================================
// FUNÇÃO: GERAR ITENS
// ==========================================

export function generateLuxuryItems(level: number) {
  const basePrice = 120;

  // crescimento de 10% por nível
  const price = basePrice * Math.pow(1.1, level - 1);

  const collection = collectionNames[level] || `Nível ${level}`;

  return itemTypes.map((item) => ({
    name: `${item.name} ${collection}`,
    price: Number(price.toFixed(2)),
    image: item.image,
  }));
}

// ==========================================
// BACKGROUND DINÂMICO
// ==========================================

export function getBackgroundByLevel(level: number) {
  if (level <= 10) {
    return "linear-gradient(135deg, #2c2c2c, #1a1a1a)";
  }

  if (level <= 25) {
    return "linear-gradient(135deg, #1e3c72, #2a5298)";
  }

  if (level <= 50) {
    return "linear-gradient(135deg, #3a0ca3, #7209b7)";
  }

  if (level <= 75) {
    return "linear-gradient(135deg, #000000, #d4af37)";
  }

  if (level <= 90) {
    return "radial-gradient(circle at 30% 30%, #ffd700, #000000)";
  }

  // 91–100 (GOD TIER)
  return "radial-gradient(circle at 50% 50%, #ffffff, #ffd700, #000000)";
}

// ==========================================
// FUNÇÃO AUXILIAR: OBTER COR DO BACKGROUND
// ==========================================

export function getBackgroundColorByLevel(level: number): string {
  if (level <= 10) {
    return "#2c2c2c";
  }
  if (level <= 25) {
    return "#1e3c72";
  }
  if (level <= 50) {
    return "#3a0ca3";
  }
  if (level <= 75) {
    return "#d4af37";
  }
  if (level <= 90) {
    return "#ffd700";
  }
  return "#ffffff";
}

// ==========================================
// FUNÇÃO PRINCIPAL DO JOGO
// ==========================================

export function getLuxurySystem(playerBarracoLevel: number) {
  return {
    items: generateLuxuryItems(playerBarracoLevel),
    background: getBackgroundByLevel(playerBarracoLevel),
    collectionName: collectionNames[playerBarracoLevel],
  };
}
