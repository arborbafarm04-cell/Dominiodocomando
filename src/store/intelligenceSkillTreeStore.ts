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
  description?: string;
  effect?: string;
};

export type IntelligenceSkillTreeState = {
  skills: Record<string, Skill>;
  playerMoney: number;
  setPlayerMoney: (money: number) => void;
  addPlayerMoney: (amount: number) => void;
  subtractPlayerMoney: (amount: number) => boolean;
  
  // Upgrade functions
  startUpgrade: (skillId: string) => { success: boolean; error?: string };
  finalizeUpgrade: (skillId: string) => { success: boolean; error?: string };
  canUpgrade: (skillId: string) => boolean;
  getUpgradeDetails: (skillId: string) => { cost: number; duration: number; error?: string } | null;
  
  // Query functions
  getRemainingTime: (skillId: string) => number;
  getIntelligenceBonus: () => number;
  getSkillProgress: (skillId: string) => number; // 0-100
  isSkillUnlocked: (skillId: string) => boolean;
  getSkillRequirements: (skillId: string) => { met: boolean; details: string[] };
  
  // Utility
  resetAllSkills: () => void;
  getSkill: (skillId: string) => Skill | undefined;
};

const INITIAL_SKILLS: Record<string, Skill> = {
  inteligencia_1: {
    id: 'inteligencia_1',
    name: 'Informante da Quebrada I',
    category: 'inteligencia',
    level: 0,
    maxLevel: 20,
    baseCost: 500,
    baseTime: 300000, // 5 minutos
    upgrading: false,
    description: 'Recrute informantes locais para coletar inteligência',
    effect: '+1% lucro por nível',
  },
  inteligencia_2: {
    id: 'inteligencia_2',
    name: 'Escuta Policial II',
    category: 'inteligencia',
    level: 0,
    maxLevel: 25,
    baseCost: 800,
    baseTime: 600000, // 10 minutos
    requires: ['inteligencia_1'],
    upgrading: false,
    description: 'Monitore comunicações policiais para evitar operações',
    effect: '-0.5% falha por nível',
  },
  inteligencia_3: {
    id: 'inteligencia_3',
    name: 'Infiltração Digital III',
    category: 'inteligencia',
    level: 0,
    maxLevel: 30,
    baseCost: 1200,
    baseTime: 1200000, // 20 minutos
    requires: ['inteligencia_2'],
    upgrading: false,
    description: 'Infiltre sistemas digitais para obter dados sensíveis',
    effect: '+2% eficiência',
  },
  inteligencia_4: {
    id: 'inteligencia_4',
    name: 'Rede de Dados IV',
    category: 'inteligencia',
    level: 0,
    maxLevel: 40,
    baseCost: 2000,
    baseTime: 2400000, // 40 minutos
    requires: ['inteligencia_3'],
    upgrading: false,
    description: 'Construa uma rede de coleta de dados em tempo real',
    effect: '+1.5% lucro global',
  },
  inteligencia_5: {
    id: 'inteligencia_5',
    name: 'Inteligência Estratégica V',
    category: 'inteligencia',
    level: 0,
    maxLevel: 50,
    baseCost: 5000,
    baseTime: 3600000, // 1 hora
    requires: ['inteligencia_4'],
    upgrading: false,
    description: 'Coordene todas as operações de inteligência para máxima eficiência',
    effect: 'Bônus geral em todas mecânicas',
  },
};

export const useIntelligenceSkillTree = create<IntelligenceSkillTreeState>()(
  persist(
    (set, get) => ({
      skills: INITIAL_SKILLS,
      playerMoney: 10000, // Valor inicial para testes

      setPlayerMoney: (money: number) => {
        set({ playerMoney: Math.max(0, money) });
      },

      addPlayerMoney: (amount: number) => {
        const state = get();
        set({ playerMoney: state.playerMoney + amount });
      },

      subtractPlayerMoney: (amount: number) => {
        const state = get();
        if (state.playerMoney >= amount) {
          set({ playerMoney: state.playerMoney - amount });
          return true;
        }
        return false;
      },

      getUpgradeDetails: (skillId: string) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill) {
          return { cost: 0, duration: 0, error: 'Skill não encontrada' };
        }

        if (skill.level >= skill.maxLevel) {
          return { cost: 0, duration: 0, error: 'Skill já está no máximo' };
        }

        // Calcular custo: baseCost * (level + 1)^1.8
        const cost = Math.ceil(skill.baseCost * Math.pow(skill.level + 1, 1.8));

        // Calcular duração: baseTime * (level + 1)^1.5
        const duration = Math.ceil(skill.baseTime * Math.pow(skill.level + 1, 1.5));

        return { cost, duration };
      },

      canUpgrade: (skillId: string) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill) return false;
        if (skill.upgrading) return false;
        if (skill.level >= skill.maxLevel) return false;

        // Verificar requisitos
        if (skill.requires && skill.requires.length > 0) {
          for (const requiredSkillId of skill.requires) {
            const requiredSkill = state.skills[requiredSkillId];
            if (!requiredSkill) return false;

            // Determinar nível mínimo necessário
            const minLevelRequired = requiredSkillId === 'inteligencia_1' ? 10 : 
                                     requiredSkillId === 'inteligencia_2' ? 15 :
                                     requiredSkillId === 'inteligencia_3' ? 20 :
                                     requiredSkillId === 'inteligencia_4' ? 25 : 0;

            if (requiredSkill.level < minLevelRequired) return false;
          }
        }

        // Verificar dinheiro
        const details = state.getUpgradeDetails(skillId);
        if (details?.error || state.playerMoney < details!.cost) return false;

        return true;
      },

      startUpgrade: (skillId: string) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill) {
          return { success: false, error: 'Skill não encontrada' };
        }

        if (skill.upgrading) {
          return { success: false, error: 'Skill já está em upgrade' };
        }

        if (skill.level >= skill.maxLevel) {
          return { success: false, error: 'Skill já está no máximo' };
        }

        // Verificar requisitos
        if (skill.requires && skill.requires.length > 0) {
          for (const requiredSkillId of skill.requires) {
            const requiredSkill = state.skills[requiredSkillId];
            if (!requiredSkill) {
              return { success: false, error: `Skill requerida não encontrada: ${requiredSkillId}` };
            }

            const minLevelRequired = requiredSkillId === 'inteligencia_1' ? 10 : 
                                     requiredSkillId === 'inteligencia_2' ? 15 :
                                     requiredSkillId === 'inteligencia_3' ? 20 :
                                     requiredSkillId === 'inteligencia_4' ? 25 : 0;

            if (requiredSkill.level < minLevelRequired) {
              return { 
                success: false, 
                error: `${requiredSkill.name} deve estar no nível ${minLevelRequired}` 
              };
            }
          }
        }

        // Calcular custo e duração
        const details = state.getUpgradeDetails(skillId);
        if (details?.error) {
          return { success: false, error: details.error };
        }

        const { cost, duration } = details!;

        // Verificar dinheiro
        if (state.playerMoney < cost) {
          return { success: false, error: `Dinheiro insuficiente. Necessário: ${cost}, Disponível: ${state.playerMoney}` };
        }

        // Descontar dinheiro
        if (!state.subtractPlayerMoney(cost)) {
          return { success: false, error: 'Erro ao descontar dinheiro' };
        }

        // Iniciar upgrade
        const now = Date.now();
        set({
          skills: {
            ...state.skills,
            [skillId]: {
              ...skill,
              upgrading: true,
              startTime: now,
              endTime: now + duration,
            },
          },
        });

        return { success: true };
      },

      finalizeUpgrade: (skillId: string) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill) {
          return { success: false, error: 'Skill não encontrada' };
        }

        if (!skill.upgrading) {
          return { success: false, error: 'Skill não está em upgrade' };
        }

        if (!skill.endTime || Date.now() < skill.endTime) {
          const remainingTime = skill.endTime ? skill.endTime - Date.now() : 0;
          return { 
            success: false, 
            error: `Upgrade ainda não está pronto. Tempo restante: ${Math.ceil(remainingTime / 1000)}s` 
          };
        }

        // Incrementar nível
        set({
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
        });

        return { success: true };
      },

      getRemainingTime: (skillId: string) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill || !skill.upgrading || !skill.endTime) {
          return 0;
        }

        const remaining = skill.endTime - Date.now();
        return Math.max(0, remaining);
      },

      getIntelligenceBonus: () => {
        const state = get();
        let totalBonus = 0;

        // Somar todos os níveis
        Object.values(state.skills).forEach((skill) => {
          totalBonus += skill.level;
        });

        return totalBonus;
      },

      getSkillProgress: (skillId: string) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill || !skill.upgrading || !skill.startTime || !skill.endTime) {
          return 0;
        }

        const total = skill.endTime - skill.startTime;
        const elapsed = Date.now() - skill.startTime;
        return Math.min(100, (elapsed / total) * 100);
      },

      isSkillUnlocked: (skillId: string) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill) return false;

        // Primeira skill é sempre desbloqueada
        if (skillId === 'inteligencia_1') return true;

        // Verificar requisitos
        if (skill.requires && skill.requires.length > 0) {
          for (const requiredSkillId of skill.requires) {
            const requiredSkill = state.skills[requiredSkillId];
            if (!requiredSkill) return false;

            const minLevelRequired = requiredSkillId === 'inteligencia_1' ? 10 : 
                                     requiredSkillId === 'inteligencia_2' ? 15 :
                                     requiredSkillId === 'inteligencia_3' ? 20 :
                                     requiredSkillId === 'inteligencia_4' ? 25 : 0;

            if (requiredSkill.level < minLevelRequired) return false;
          }
        }

        return true;
      },

      getSkillRequirements: (skillId: string) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill) {
          return { met: false, details: ['Skill não encontrada'] };
        }

        const details: string[] = [];
        let met = true;

        if (skill.requires && skill.requires.length > 0) {
          for (const requiredSkillId of skill.requires) {
            const requiredSkill = state.skills[requiredSkillId];
            if (!requiredSkill) {
              details.push(`❌ ${requiredSkillId} não encontrada`);
              met = false;
              continue;
            }

            const minLevelRequired = requiredSkillId === 'inteligencia_1' ? 10 : 
                                     requiredSkillId === 'inteligencia_2' ? 15 :
                                     requiredSkillId === 'inteligencia_3' ? 20 :
                                     requiredSkillId === 'inteligencia_4' ? 25 : 0;

            const isMet = requiredSkill.level >= minLevelRequired;
            const status = isMet ? '✓' : '❌';
            details.push(`${status} ${requiredSkill.name} nível ${minLevelRequired} (atual: ${requiredSkill.level})`);
            
            if (!isMet) met = false;
          }
        }

        return { met, details };
      },

      resetAllSkills: () => {
        set({ skills: INITIAL_SKILLS, playerMoney: 10000 });
      },

      getSkill: (skillId: string) => {
        const state = get();
        return state.skills[skillId];
      },
    }),
    {
      name: 'intelligence-skill-tree-storage',
      version: 1,
    }
  )
);
