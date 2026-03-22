import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Skill = {
  id: string;
  name: string;
  category: 'agilidade';
  level: number;
  maxLevel: number;
  baseCost: number;
  baseTime: number;
  requires?: string[];
  upgrading: boolean;
  startTime?: number;
  endTime?: number;
};

type AgilitySkillTreeState = {
  skills: Record<string, Skill>;
  initializeSkills: () => void;
  startUpgrade: (skillId: string, playerMoney: number) => { success: boolean; error?: string };
  finalizeUpgrade: (skillId: string) => { success: boolean; error?: string };
  canUpgrade: (skillId: string, playerMoney: number) => boolean;
  getRemainingTime: (skillId: string) => number;
  getAgilityBonus: () => number;
  getSkillByLevel: (level: number) => Skill | null;
  isSkillUnlocked: (skillId: string) => boolean;
  getUpgradeCost: (skillId: string) => number;
  getUpgradeDuration: (skillId: string) => number;
};

const INITIAL_SKILLS: Record<string, Skill> = {
  agilidade_1: {
    id: 'agilidade_1',
    name: 'Fuga de Viela I',
    category: 'agilidade',
    level: 0,
    maxLevel: 20,
    baseCost: 500,
    baseTime: 300000, // 5 minutos
    requires: [],
    upgrading: false,
  },
  agilidade_2: {
    id: 'agilidade_2',
    name: 'Direção Perigosa II',
    category: 'agilidade',
    level: 0,
    maxLevel: 25,
    baseCost: 800,
    baseTime: 600000, // 10 minutos
    requires: ['agilidade_1'],
    upgrading: false,
  },
  agilidade_3: {
    id: 'agilidade_3',
    name: 'Reflexo de Rua III',
    category: 'agilidade',
    level: 0,
    maxLevel: 30,
    baseCost: 1200,
    baseTime: 1200000, // 20 minutos
    requires: ['agilidade_2'],
    upgrading: false,
  },
  agilidade_4: {
    id: 'agilidade_4',
    name: 'Mobilidade Tática IV',
    category: 'agilidade',
    level: 0,
    maxLevel: 40,
    baseCost: 2000,
    baseTime: 2400000, // 40 minutos
    requires: ['agilidade_3'],
    upgrading: false,
  },
  agilidade_5: {
    id: 'agilidade_5',
    name: 'Velocidade Estratégica V',
    category: 'agilidade',
    level: 0,
    maxLevel: 50,
    baseCost: 5000,
    baseTime: 3600000, // 1 hora
    requires: ['agilidade_4'],
    upgrading: false,
  },
};

export const useAgilitySkillTreeStore = create<AgilitySkillTreeState>()(
  persist(
    (set, get) => ({
      skills: INITIAL_SKILLS,

      initializeSkills: () => {
        set({ skills: INITIAL_SKILLS });
      },

      getUpgradeCost: (skillId: string) => {
        const skill = get().skills[skillId];
        if (!skill) return 0;
        return Math.floor(skill.baseCost * Math.pow(skill.level + 1, 1.8));
      },

      getUpgradeDuration: (skillId: string) => {
        const skill = get().skills[skillId];
        if (!skill) return 0;
        return Math.floor(skill.baseTime * Math.pow(skill.level + 1, 1.5));
      },

      isSkillUnlocked: (skillId: string) => {
        const skill = get().skills[skillId];
        if (!skill || !skill.requires || skill.requires.length === 0) return true;

        return skill.requires.every((requiredSkillId) => {
          const requiredSkill = get().skills[requiredSkillId];
          if (requiredSkillId === 'agilidade_1') return requiredSkill?.level >= 10;
          if (requiredSkillId === 'agilidade_2') return requiredSkill?.level >= 15;
          if (requiredSkillId === 'agilidade_3') return requiredSkill?.level >= 20;
          if (requiredSkillId === 'agilidade_4') return requiredSkill?.level >= 25;
          return false;
        });
      },

      canUpgrade: (skillId: string, playerMoney: number) => {
        const skill = get().skills[skillId];
        if (!skill) return false;
        if (skill.upgrading) return false;
        if (skill.level >= skill.maxLevel) return false;
        if (!get().isSkillUnlocked(skillId)) return false;

        const cost = get().getUpgradeCost(skillId);
        if (playerMoney < cost) return false;

        return true;
      },

      startUpgrade: (skillId: string, playerMoney: number) => {
        const skill = get().skills[skillId];

        if (!skill) {
          return { success: false, error: 'Skill não encontrada' };
        }

        if (skill.upgrading) {
          return { success: false, error: 'Skill já está sendo atualizada' };
        }

        if (skill.level >= skill.maxLevel) {
          return { success: false, error: 'Nível máximo atingido' };
        }

        if (!get().isSkillUnlocked(skillId)) {
          return { success: false, error: 'Skill não desbloqueada' };
        }

        const cost = get().getUpgradeCost(skillId);
        if (playerMoney < cost) {
          return { success: false, error: 'Dinheiro insuficiente' };
        }

        const duration = get().getUpgradeDuration(skillId);
        const now = Date.now();

        set((state) => ({
          skills: {
            ...state.skills,
            [skillId]: {
              ...state.skills[skillId],
              upgrading: true,
              startTime: now,
              endTime: now + duration,
            },
          },
        }));

        return { success: true };
      },

      finalizeUpgrade: (skillId: string) => {
        const skill = get().skills[skillId];

        if (!skill) {
          return { success: false, error: 'Skill não encontrada' };
        }

        if (!skill.upgrading || !skill.endTime) {
          return { success: false, error: 'Upgrade não está em progresso' };
        }

        if (Date.now() < skill.endTime) {
          return { success: false, error: 'Upgrade ainda não foi concluído' };
        }

        set((state) => ({
          skills: {
            ...state.skills,
            [skillId]: {
              ...state.skills[skillId],
              level: state.skills[skillId].level + 1,
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
        return remaining > 0 ? remaining : 0;
      },

      getAgilityBonus: () => {
        const skills = get().skills;
        return Object.values(skills).reduce((total, skill) => total + skill.level, 0);
      },

      getSkillByLevel: (level: number) => {
        const skills = get().skills;
        const skillArray = Object.values(skills).sort((a, b) => {
          const levelOrder = { agilidade_1: 1, agilidade_2: 2, agilidade_3: 3, agilidade_4: 4, agilidade_5: 5 };
          return (levelOrder[a.id as keyof typeof levelOrder] || 0) - (levelOrder[b.id as keyof typeof levelOrder] || 0);
        });
        return skillArray[level] || null;
      },
    }),
    {
      name: 'agility-skill-tree-storage',
      version: 1,
    }
  )
);
