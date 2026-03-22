import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Skill = {
  id: string;
  name: string;
  category: 'ataque';
  level: number;
  maxLevel: number;
  baseCost: number;
  baseTime: number;
  requires?: string[];
  upgrading: boolean;
  startTime?: number;
  endTime?: number;
  effect: string;
};

interface AttackSkillTreeState {
  skills: Record<string, Skill>;
  initializeSkills: () => void;
  startUpgrade: (skillId: string, playerMoney: number) => { success: boolean; message: string };
  finalizeUpgrade: (skillId: string) => { success: boolean; message: string };
  canUpgrade: (skillId: string, playerMoney: number) => boolean;
  getRemainingTime: (skillId: string) => number;
  getAttackBonus: () => number;
  calculateUpgradeCost: (skillId: string) => number;
  calculateUpgradeDuration: (skillId: string) => number;
  checkRequirements: (skillId: string) => boolean;
  getSkillProgress: (skillId: string) => number;
  resetAllSkills: () => void;
}

const INITIAL_SKILLS: Record<string, Skill> = {
  ataque_1: {
    id: 'ataque_1',
    name: 'Abordagem Rápida I',
    category: 'ataque',
    level: 0,
    maxLevel: 20,
    baseCost: 600,
    baseTime: 300000, // 5 minutos
    requires: [],
    upgrading: false,
    effect: '+1% sucesso em golpes por nível',
  },
  ataque_2: {
    id: 'ataque_2',
    name: 'Domínio de Território II',
    category: 'ataque',
    level: 0,
    maxLevel: 25,
    baseCost: 900,
    baseTime: 600000, // 10 minutos
    requires: ['ataque_1'],
    upgrading: false,
    effect: '+1.5% ganho em atividades ofensivas',
  },
  ataque_3: {
    id: 'ataque_3',
    name: 'Pressão Armada III',
    category: 'ataque',
    level: 0,
    maxLevel: 30,
    baseCost: 1300,
    baseTime: 1200000, // 20 minutos
    requires: ['ataque_2'],
    upgrading: false,
    effect: '+2% eficiência em ações ofensivas',
  },
  ataque_4: {
    id: 'ataque_4',
    name: 'Ataque Coordenado IV',
    category: 'ataque',
    level: 0,
    maxLevel: 40,
    baseCost: 2200,
    baseTime: 2400000, // 40 minutos
    requires: ['ataque_3'],
    upgrading: false,
    effect: '+1% bônus global em ataques por nível',
  },
  ataque_5: {
    id: 'ataque_5',
    name: 'Poder Ofensivo V',
    category: 'ataque',
    level: 0,
    maxLevel: 50,
    baseCost: 5500,
    baseTime: 3600000, // 1 hora
    requires: ['ataque_4'],
    upgrading: false,
    effect: 'Bônus massivo em todas ações ofensivas',
  },
};

export const useAttackSkillTreeStore = create<AttackSkillTreeState>()(
  persist(
    (set, get) => ({
      skills: INITIAL_SKILLS,

      initializeSkills: () => {
        set({ skills: INITIAL_SKILLS });
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

      checkRequirements: (skillId: string) => {
        const skill = get().skills[skillId];
        if (!skill || !skill.requires || skill.requires.length === 0) {
          return true;
        }

        // Verificar requisitos baseados no nível
        const requirementMap: Record<string, number> = {
          ataque_1: 0, // sem requisitos
          ataque_2: 10, // ataque_1 >= 10
          ataque_3: 15, // ataque_2 >= 15
          ataque_4: 20, // ataque_3 >= 20
          ataque_5: 25, // ataque_4 >= 25
        };

        for (const requiredSkillId of skill.requires) {
          const requiredSkill = get().skills[requiredSkillId];
          const requiredLevel = requirementMap[skillId] || 0;

          if (!requiredSkill || requiredSkill.level < requiredLevel) {
            return false;
          }
        }

        return true;
      },

      canUpgrade: (skillId: string, playerMoney: number) => {
        const skill = get().skills[skillId];
        if (!skill) return false;

        // Verificar se está em upgrade
        if (skill.upgrading) return false;

        // Verificar se atingiu maxLevel
        if (skill.level >= skill.maxLevel) return false;

        // Verificar requisitos
        if (!get().checkRequirements(skillId)) return false;

        // Verificar dinheiro
        const cost = get().calculateUpgradeCost(skillId);
        if (playerMoney < cost) return false;

        return true;
      },

      startUpgrade: (skillId: string, playerMoney: number) => {
        const skill = get().skills[skillId];

        if (!skill) {
          return { success: false, message: 'Skill não encontrada' };
        }

        if (skill.upgrading) {
          return { success: false, message: 'Esta skill já está em upgrade' };
        }

        if (skill.level >= skill.maxLevel) {
          return { success: false, message: 'Nível máximo atingido' };
        }

        if (!get().checkRequirements(skillId)) {
          return { success: false, message: 'Requisitos não atendidos' };
        }

        const cost = get().calculateUpgradeCost(skillId);
        if (playerMoney < cost) {
          return { success: false, message: `Dinheiro insuficiente. Necessário: ${cost}` };
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
        }));

        return { success: true, message: `Upgrade iniciado. Duração: ${(duration / 1000 / 60).toFixed(1)} minutos` };
      },

      finalizeUpgrade: (skillId: string) => {
        const skill = get().skills[skillId];

        if (!skill) {
          return { success: false, message: 'Skill não encontrada' };
        }

        if (!skill.upgrading) {
          return { success: false, message: 'Esta skill não está em upgrade' };
        }

        if (!skill.endTime || Date.now() < skill.endTime) {
          return { success: false, message: 'Upgrade ainda não foi concluído' };
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

        return { success: true, message: `${skill.name} agora está no nível ${skill.level + 1}` };
      },

      getRemainingTime: (skillId: string) => {
        const skill = get().skills[skillId];
        if (!skill || !skill.endTime) return 0;

        const remaining = skill.endTime - Date.now();
        return remaining > 0 ? remaining : 0;
      },

      getAttackBonus: () => {
        const skills = get().skills;
        let totalBonus = 0;

        // Abordagem Rápida: +1% sucesso em golpes por nível
        totalBonus += skills.ataque_1.level * 1;

        // Domínio de Território: +1.5% ganho em atividades ofensivas
        totalBonus += skills.ataque_2.level * 1.5;

        // Pressão Armada: +2% eficiência em ações ofensivas
        totalBonus += skills.ataque_3.level * 2;

        // Ataque Coordenado: +1% bônus global em ataques por nível
        totalBonus += skills.ataque_4.level * 1;

        // Poder Ofensivo: bônus massivo (5% por nível)
        totalBonus += skills.ataque_5.level * 5;

        return totalBonus;
      },

      getSkillProgress: (skillId: string) => {
        const skill = get().skills[skillId];
        if (!skill || !skill.upgrading || !skill.startTime || !skill.endTime) return 0;

        const elapsed = Date.now() - skill.startTime;
        const total = skill.endTime - skill.startTime;
        return Math.min((elapsed / total) * 100, 100);
      },

      resetAllSkills: () => {
        set({ skills: INITIAL_SKILLS });
      },
    }),
    {
      name: 'attack-skill-tree-storage',
      version: 1,
    }
  )
);
