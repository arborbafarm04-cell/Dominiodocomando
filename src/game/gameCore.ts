// ==========================================
// GAME CORE - DOMÍNIO DO COMANDO
// ==========================================

export type SkillKey =
  | 'ataque'
  | 'defesa'
  | 'inteligencia'
  | 'agilidade'
  | 'respeito'
  | 'vigor';

export interface PlayerSkills {
  ataque: number;
  defesa: number;
  inteligencia: number;
  agilidade: number;
  respeito: number;
  vigor: number;
}

export interface PlayerStateCore {
  dirtyMoney: number;
  cleanMoney: number;
  skills: PlayerSkills;
  barracoLevel: number;
  investments: number;
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================

export function createInitialPlayer(): PlayerStateCore {
  return {
    dirtyMoney: 0,
    cleanMoney: 0,
    barracoLevel: 1,
    investments: 0,
    skills: {
      ataque: 0,
      defesa: 0,
      inteligencia: 0,
      agilidade: 0,
      respeito: 0,
      vigor: 0,
    },
  };
}

// ==========================================
// SLOT (GIRO NO ASFALTO)
// ==========================================

export function applySlotReward(
  player: PlayerStateCore,
  amount: number
): PlayerStateCore {
  return {
    ...player,
    dirtyMoney: player.dirtyMoney + amount,
  };
}

// ==========================================
// LAVAGEM DE DINHEIRO
// ==========================================

export function washMoney(
  player: PlayerStateCore,
  amount: number,
  taxPercent: number
): PlayerStateCore {
  if (player.dirtyMoney < amount) return player;

  const tax = amount * (taxPercent / 100);
  const result = amount - tax;

  return {
    ...player,
    dirtyMoney: player.dirtyMoney - amount,
    cleanMoney: player.cleanMoney + result,
  };
}

// ==========================================
// COMPRA COM DINHEIRO LIMPO
// ==========================================

export function buyWithCleanMoney(
  player: PlayerStateCore,
  cost: number
): PlayerStateCore {
  if (player.cleanMoney < cost) return player;

  return {
    ...player,
    cleanMoney: player.cleanMoney - cost,
  };
}

// ==========================================
// COMPRA COM DINHEIRO SUJO
// ==========================================

export function buyWithDirtyMoney(
  player: PlayerStateCore,
  cost: number
): PlayerStateCore {
  if (player.dirtyMoney < cost) return player;

  return {
    ...player,
    dirtyMoney: player.dirtyMoney - cost,
  };
}

// ==========================================
// APLICAR BÔNUS DE HABILIDADE
// ==========================================

export function applySkillBonus(
  player: PlayerStateCore,
  skill: SkillKey,
  percent: number
): PlayerStateCore {
  return {
    ...player,
    skills: {
      ...player.skills,
      [skill]: player.skills[skill] + percent,
    },
  };
}

// ==========================================
// PODER TOTAL DO JOGADOR
// ==========================================

export function calculatePlayerPower(player: PlayerStateCore): number {
  const { skills, barracoLevel, investments } = player;

  const skillTotal =
    skills.ataque +
    skills.defesa +
    skills.inteligencia +
    skills.agilidade +
    skills.respeito +
    skills.vigor;

  return (
    skillTotal +
    barracoLevel * 2 +
    investments * 3
  );
}
