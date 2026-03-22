import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Skill = {
  id: string;
  name: string;
  category: 'inteligencia';
  level: number;
  maxLevel: number;
  baseCost: number;
  baseTime: number;
  requires?: string[];
  upgrading: boolean;
  startTime?: number;
  endTime?: number;
  description: string;
  effect: string;
};

export type IntelligenceSkillTreeState = {
  skills: Record<string, Skill>;
  playerMoney: number;
  setPlayerMoney: (money: number) => void;
  startUpgrade: (skillId: string) => { success: boolean; error?: string };
  finalizeUpgrade: (skillId: string) => { success: boolean; error?: string };
  canUpgrade: (skillId: string) => boolean;
  getRemainingTime: (skillId: string) => number;
  getIntelligenceBonus: () => number;
  getSkillByLevel: (skillId: string) => Skill | null;
  getSkillRequirements: (skillId: string) => { met: boolean; missing: string[] };
  calculateUpgradeCost: (skillId: string) => number;
  calculateUpgradeDuration: (skillId: string) => number;
  resetAllSkills: () => void;
};

const INITIAL_SKILLS: Record<string, Skill> = {
  inteligencia_1: {
    id: 'inteligencia_1',
    name: 'Informante da Quebrada',
    category: 'inteligencia',
    level: 0,
    maxLevel: 20,
    baseCost: 500,
    baseTime: 300000, // 5 minutos
    requires: [],
    upgrading: false,
    description: 'Recrute informantes locais para coletar inteligência',
    effect: '+1% lucro por nível',
  },
  inteligencia_2: {
    id: 'inteligencia_2',
    name: 'Escuta Policial',
    category: 'inteligencia',
    level: 0,
    maxLevel: 25,
    baseCost: 800,
    baseTime: 600000, // 10 minutos
    requires: ['inteligencia_1'],
    upgrading: false,
    description: 'Intercepte comunicações policiais para evitar operações',
    effect: '-0.5% falha por nível',
  },
  inteligencia_3: {
    id: 'inteligencia_3',
    name: 'Infiltração Digital',
    category: 'inteligencia',
    level: 0,
    maxLevel: 30,
    baseCost: 1200,
    baseTime: 1200000, // 20 minutos
    requires: ['inteligencia_2'],
    upgrading: false,
    description: 'Infiltre sistemas digitais para ganhar vantagem',
    effect: '+2% eficiência',
  },
  inteligencia_4: {
    id: 'inteligencia_4',
    name: 'Rede de Dados',
    category: 'inteligencia',
    level: 0,
    maxLevel: 40,
    baseCost: 2000,
    baseTime: 2400000, // 40 minutos
    requires: ['inteligencia_3'],
    upgrading: false,
    description: 'Construa uma rede de dados para operações avançadas',
    effect: '+1.5% lucro global',
  },
  inteligencia_5: {
    id: 'inteligencia_5',
    name: 'Inteligência Estratégica',
    category: 'inteligencia',
    level: 0,
    maxLevel: 50,
    baseCost: 5000,
    baseTime: 3600000, // 1 hora
    requires: ['inteligencia_4'],
    upgrading: false,
    description: 'Domine a inteligência estratégica para máxima eficiência',
    effect: 'Bônus geral em todas mecânicas',
  },
};

export const useIntelligenceSkillTreeStore = create<IntelligenceSkillTreeState>()(
  persist(
    (set, get) => ({
      skills: INITIAL_SKILLS,
      playerMoney: 0,

      setPlayerMoney: (money: number) => {
        set({ playerMoney: Math.max(0, money) });
      },

      calculateUpgradeCost: (skillId: string) => {
        const skill = get().skills[skillId];
        if (!skill) return 0;
        return Math.floor(skill.baseCost * Math.pow(skill.level + 1, 1.8));
      },

      calculateUpgradeDuration: (skillId: string) => {
        const skill = get().skills[skillId];
        if (!skill) return 0;
        return Math.floor(skill.baseTime * Math.pow(skill.level + 1, 1.5));
      },

      getSkillRequirements: (skillId: string) => {
        const skill = get().skills[skillId];
        const skills = get().skills;

        if (!skill || !skill.requires || skill.requires.length === 0) {
          return { met: true, missing: [] };
        }

        const missing: string[] = [];

        skill.requires.forEach((requiredSkillId) => {
          const requiredSkill = skills[requiredSkillId];
          const requiredLevel = skillId === 'inteligencia_2' ? 10 : 
                               skillId === 'inteligencia_3' ? 15 : 
                               skillId === 'inteligencia_4' ? 20 : 
                               skillId === 'inteligencia_5' ? 25 : 0;

          if (!requiredSkill || requiredSkill.level < requiredLevel) {
            missing.push(`${requiredSkill?.name || 'Unknown'} nível ${requiredLevel}`);
          }
        });

        return { met: missing.length === 0, missing };
      },

      canUpgrade: (skillId: string) => {
        const skill = get().skills[skillId];
        const playerMoney = get().playerMoney;

        if (!skill) return false;
        if (skill.upgrading) return false;
        if (skill.level >= skill.maxLevel) return false;

        const cost = get().calculateUpgradeCost(skillId);
        if (playerMoney < cost) return false;

        const requirements = get().getSkillRequirements(skillId);
        if (!requirements.met) return false;

        return true;
      },

      startUpgrade: (skillId: string) => {
        const skill = get().skills[skillId];

        if (!skill) {
          return { success: false, error: 'Skill não encontrada' };
        }

        if (skill.upgrading) {
          return { success: false, error: 'Skill já está em upgrade' };
        }

        if (skill.level >= skill.maxLevel) {
          return { success: false, error: 'Skill já atingiu o nível máximo' };
        }

        const requirements = get().getSkillRequirements(skillId);
        if (!requirements.met) {
          return { success: false, error: `Requisitos não atendidos: ${requirements.missing.join(', ')}` };
        }

        const cost = get().calculateUpgradeCost(skillId);
        const playerMoney = get().playerMoney;

        if (playerMoney < cost) {
          return { success: false, error: `Dinheiro insuficiente. Necessário: ${cost}, Disponível: ${playerMoney}` };
        }

        const duration = get().calculateUpgradeDuration(skillId);
        const now = Date.now();

        set((state) => ({
          skills: {
            ...state.skills,
            [skillId]: {
              ...skill,
              upgrading: true,
              startTime: now,
              endTime: now + duration,
            },
          },
          playerMoney: state.playerMoney - cost,
        }));

        return { success: true };
      },

      finalizeUpgrade: (skillId: string) => {
        const skill = get().skills[skillId];

        if (!skill) {
          return { success: false, error: 'Skill não encontrada' };
        }

        if (!skill.upgrading) {
          return { success: false, error: 'Skill não está em upgrade' };
        }

        if (!skill.endTime || Date.now() < skill.endTime) {
          return { success: false, error: 'Upgrade ainda não foi concluído' };
        }

        set((state) => ({
          skills: {
            ...state.skills,
            [skillId]: {
              ...skill,
              level: skill.level + 1,
              upgrading: false,
              startTime: undefined,
              endTime: undefined,
            },
          },
        }));

        return { success: true };
      },

      getRemainingTime: (skillId: string) => {
        const skill = get().skills[skillId];

        if (!skill || !skill.endTime) return 0;

        const remaining = skill.endTime - Date.now();
        return Math.max(0, remaining);
      },

      getIntelligenceBonus: () => {
        const skills = get().skills;
        const totalLevels = Object.values(skills).reduce((sum, skill) => sum + skill.level, 0);

        // Bônus base: 0.5% por nível total
        const baseBonus = totalLevels * 0.5;

        // Bônus específico por skill
        const informanteBonus = (skills.inteligencia_1.level * 1) / 100;
        const escutaBonus = (skills.inteligencia_2.level * -0.5) / 100;
        const infiltracaoBonus = (skills.inteligencia_3.level * 2) / 100;
        const redeBonus = (skills.inteligencia_4.level * 1.5) / 100;
        const estrategicaBonus = skills.inteligencia_5.level > 0 ? 5 : 0; // 5% bônus geral

        return baseBonus + informanteBonus + escutaBonus + infiltracaoBonus + redeBonus + estrategicaBonus;
      },

      getSkillByLevel: (skillId: string) => {
        return get().skills[skillId] || null;
      },

      resetAllSkills: () => {
        set({
          skills: INITIAL_SKILLS,
          playerMoney: 0,
        });
      },
    }),
    {
      name: 'intelligence-skill-tree-storage',
      version: 1,
    }
  )
);
