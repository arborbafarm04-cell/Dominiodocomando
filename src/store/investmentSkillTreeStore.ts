import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Skill = {
  id: string;
  name: string;
  category: string;
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

type InvestmentSkillTreeState = {
  skills: Record<string, Skill>;
  dirtyMoney: number;
  setDirtyMoney: (amount: number) => void;
  upgradeSkill: (skillId: string) => boolean;
  finalizeUpgrade: (skillId: string) => void;
  canUpgrade: (skillId: string) => boolean;
  getRemainingTime: (skill: Skill) => number;
  getSkill: (skillId: string) => Skill | undefined;
  updateSkillLevel: (skillId: string, level: number) => void;
  resetAllSkills: () => void;
};

const INITIAL_SKILLS: Record<string, Skill> = {
  // INTELIGÊNCIA
  'intel-1': {
    id: 'intel-1',
    name: 'Informante da Quebrada',
    category: 'Inteligência',
    level: 0,
    maxLevel: 20,
    baseCost: 5000,
    baseTime: 3600,
    requires: [],
    upgrading: false,
    description: 'Recrute informantes locais',
    effect: '+1% lucro',
  },
  'intel-2': {
    id: 'intel-2',
    name: 'Escuta Policial',
    category: 'Inteligência',
    level: 0,
    maxLevel: 25,
    baseCost: 7500,
    baseTime: 5400,
    requires: [],
    upgrading: false,
    description: 'Monitore comunicações policiais',
    effect: '-0.5% falha',
  },
  'intel-3': {
    id: 'intel-3',
    name: 'Infiltração Digital',
    category: 'Inteligência',
    level: 0,
    maxLevel: 30,
    baseCost: 10000,
    baseTime: 7200,
    requires: [],
    upgrading: false,
    description: 'Acesse sistemas digitais',
    effect: '+2% eficiência',
  },
  'intel-4': {
    id: 'intel-4',
    name: 'Rede de Dados',
    category: 'Inteligência',
    level: 0,
    maxLevel: 40,
    baseCost: 15000,
    baseTime: 10800,
    requires: [],
    upgrading: false,
    description: 'Construa rede de informações',
    effect: '+1.5% lucro global',
  },
  'intel-5': {
    id: 'intel-5',
    name: 'Inteligência Estratégica',
    category: 'Inteligência',
    level: 0,
    maxLevel: 50,
    baseCost: 25000,
    baseTime: 14400,
    requires: [],
    upgrading: false,
    description: 'Planeje operações estratégicas',
    effect: 'Bônus global',
  },

  // AGILIDADE
  'agility-1': {
    id: 'agility-1',
    name: 'Fuga de Viela',
    category: 'Agilidade',
    level: 0,
    maxLevel: 20,
    baseCost: 5000,
    baseTime: 3600,
    requires: [],
    upgrading: false,
    description: 'Domine fugas rápidas',
    effect: '-1% tempo',
  },
  'agility-2': {
    id: 'agility-2',
    name: 'Direção Perigosa',
    category: 'Agilidade',
    level: 0,
    maxLevel: 25,
    baseCost: 7500,
    baseTime: 5400,
    requires: [],
    upgrading: false,
    description: 'Manobras de risco',
    effect: '+0.5% fuga',
  },
  'agility-3': {
    id: 'agility-3',
    name: 'Reflexo de Rua',
    category: 'Agilidade',
    level: 0,
    maxLevel: 30,
    baseCost: 10000,
    baseTime: 7200,
    requires: [],
    upgrading: false,
    description: 'Reações instantâneas',
    effect: '-1.5% cooldown',
  },
  'agility-4': {
    id: 'agility-4',
    name: 'Mobilidade Tática',
    category: 'Agilidade',
    level: 0,
    maxLevel: 40,
    baseCost: 15000,
    baseTime: 10800,
    requires: [],
    upgrading: false,
    description: 'Movimento estratégico',
    effect: '+1% velocidade',
  },
  'agility-5': {
    id: 'agility-5',
    name: 'Velocidade Estratégica',
    category: 'Agilidade',
    level: 0,
    maxLevel: 50,
    baseCost: 25000,
    baseTime: 14400,
    requires: [],
    upgrading: false,
    description: 'Velocidade máxima',
    effect: 'Bônus global',
  },

  // ATAQUE
  'attack-1': {
    id: 'attack-1',
    name: 'Abordagem Rápida',
    category: 'Ataque',
    level: 0,
    maxLevel: 20,
    baseCost: 5000,
    baseTime: 3600,
    requires: [],
    upgrading: false,
    description: 'Ataques rápidos',
    effect: '+1% sucesso',
  },
  'attack-2': {
    id: 'attack-2',
    name: 'Domínio de Território',
    category: 'Ataque',
    level: 0,
    maxLevel: 25,
    baseCost: 7500,
    baseTime: 5400,
    requires: [],
    upgrading: false,
    description: 'Controle territorial',
    effect: '+1.5% ganho',
  },
  'attack-3': {
    id: 'attack-3',
    name: 'Pressão Armada',
    category: 'Ataque',
    level: 0,
    maxLevel: 30,
    baseCost: 10000,
    baseTime: 7200,
    requires: [],
    upgrading: false,
    description: 'Força bruta coordenada',
    effect: '+2% eficiência',
  },
  'attack-4': {
    id: 'attack-4',
    name: 'Ataque Coordenado',
    category: 'Ataque',
    level: 0,
    maxLevel: 40,
    baseCost: 15000,
    baseTime: 10800,
    requires: [],
    upgrading: false,
    description: 'Operações sincronizadas',
    effect: '+1% ataque',
  },
  'attack-5': {
    id: 'attack-5',
    name: 'Poder Ofensivo',
    category: 'Ataque',
    level: 0,
    maxLevel: 50,
    baseCost: 25000,
    baseTime: 14400,
    requires: [],
    upgrading: false,
    description: 'Poder máximo',
    effect: 'Bônus ofensivo',
  },

  // DEFESA
  'defense-1': {
    id: 'defense-1',
    name: 'Esquema de Fuga',
    category: 'Defesa',
    level: 0,
    maxLevel: 20,
    baseCost: 5000,
    baseTime: 3600,
    requires: [],
    upgrading: false,
    description: 'Planos de escape',
    effect: '-1% perdas',
  },
  'defense-2': {
    id: 'defense-2',
    name: 'Caixa Blindado',
    category: 'Defesa',
    level: 0,
    maxLevel: 25,
    baseCost: 7500,
    baseTime: 5400,
    requires: [],
    upgrading: false,
    description: 'Proteção de bens',
    effect: '+1.5% proteção',
  },
  'defense-3': {
    id: 'defense-3',
    name: 'Proteção de Território',
    category: 'Defesa',
    level: 0,
    maxLevel: 30,
    baseCost: 10000,
    baseTime: 7200,
    requires: [],
    upgrading: false,
    description: 'Defesa territorial',
    effect: '-1.5% dano',
  },
  'defense-4': {
    id: 'defense-4',
    name: 'Segurança Avançada',
    category: 'Defesa',
    level: 0,
    maxLevel: 40,
    baseCost: 15000,
    baseTime: 10800,
    requires: [],
    upgrading: false,
    description: 'Sistemas avançados',
    effect: '+1% resistência',
  },
  'defense-5': {
    id: 'defense-5',
    name: 'Blindagem Total',
    category: 'Defesa',
    level: 0,
    maxLevel: 50,
    baseCost: 25000,
    baseTime: 14400,
    requires: [],
    upgrading: false,
    description: 'Proteção total',
    effect: 'Bônus global defesa',
  },

  // RESPEITO
  'respect-1': {
    id: 'respect-1',
    name: 'Nome na Quebrada',
    category: 'Respeito',
    level: 0,
    maxLevel: 20,
    baseCost: 5000,
    baseTime: 3600,
    requires: [],
    upgrading: false,
    description: 'Construa reputação',
    effect: 'Desbloqueios iniciais',
  },
  'respect-2': {
    id: 'respect-2',
    name: 'Influência Local',
    category: 'Respeito',
    level: 0,
    maxLevel: 25,
    baseCost: 7500,
    baseTime: 5400,
    requires: [],
    upgrading: false,
    description: 'Influencie NPCs',
    effect: 'Acesso NPCs',
  },
  'respect-3': {
    id: 'respect-3',
    name: 'Rede de Contatos',
    category: 'Respeito',
    level: 0,
    maxLevel: 30,
    baseCost: 10000,
    baseTime: 7200,
    requires: [],
    upgrading: false,
    description: 'Expanda contatos',
    effect: 'Operações',
  },
  'respect-4': {
    id: 'respect-4',
    name: 'Domínio Regional',
    category: 'Respeito',
    level: 0,
    maxLevel: 40,
    baseCost: 15000,
    baseTime: 10800,
    requires: [],
    upgrading: false,
    description: 'Controle regional',
    effect: 'Acesso mapa',
  },
  'respect-5': {
    id: 'respect-5',
    name: 'Império do Comando',
    category: 'Respeito',
    level: 0,
    maxLevel: 50,
    baseCost: 25000,
    baseTime: 14400,
    requires: [],
    upgrading: false,
    description: 'Poder supremo',
    effect: 'Conteúdo global',
  },

  // VIGOR
  'vigor-1': {
    id: 'vigor-1',
    name: 'Fôlego de Rua',
    category: 'Vigor',
    level: 0,
    maxLevel: 20,
    baseCost: 5000,
    baseTime: 3600,
    requires: [],
    upgrading: false,
    description: 'Aumente resistência',
    effect: '+energia',
  },
  'vigor-2': {
    id: 'vigor-2',
    name: 'Resistência Física',
    category: 'Vigor',
    level: 0,
    maxLevel: 25,
    baseCost: 7500,
    baseTime: 5400,
    requires: [],
    upgrading: false,
    description: 'Força física',
    effect: '-energia',
  },
  'vigor-3': {
    id: 'vigor-3',
    name: 'Ritmo de Operação',
    category: 'Vigor',
    level: 0,
    maxLevel: 30,
    baseCost: 10000,
    baseTime: 7200,
    requires: [],
    upgrading: false,
    description: 'Aumente ações',
    effect: '+ações',
  },
  'vigor-4': {
    id: 'vigor-4',
    name: 'Recuperação Acelerada',
    category: 'Vigor',
    level: 0,
    maxLevel: 40,
    baseCost: 15000,
    baseTime: 10800,
    requires: [],
    upgrading: false,
    description: 'Regeneração rápida',
    effect: '+regen',
  },
  'vigor-5': {
    id: 'vigor-5',
    name: 'Energia Inquebrável',
    category: 'Vigor',
    level: 0,
    maxLevel: 50,
    baseCost: 25000,
    baseTime: 14400,
    requires: [],
    upgrading: false,
    description: 'Energia infinita',
    effect: 'Bônus stamina',
  },
};

export const useInvestmentSkillTreeStore = create<InvestmentSkillTreeState>()(
  persist(
    (set, get) => ({
      skills: INITIAL_SKILLS,
      dirtyMoney: 50000,

      setDirtyMoney: (amount) => set({ dirtyMoney: amount }),

      getSkill: (skillId) => {
        const state = get();
        return state.skills[skillId];
      },

      getRemainingTime: (skill) => {
        if (!skill.upgrading || !skill.endTime) return 0;
        const remaining = skill.endTime - Date.now();
        return Math.max(0, remaining);
      },

      canUpgrade: (skillId) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill) return false;
        if (skill.upgrading) return false;
        if (skill.level >= skill.maxLevel) return false;

        // Check if any skill is currently upgrading (only one upgrade at a time)
        for (const s of Object.values(state.skills)) {
          if (s.upgrading) return false;
        }

        // Get all skills in the same category
        const categorySkills = Object.values(state.skills)
          .filter((s) => s.category === skill.category)
          .sort((a, b) => {
            const aNum = parseInt(a.id.split('-')[1]);
            const bNum = parseInt(b.id.split('-')[1]);
            return aNum - bNum;
          });

        const skillIndex = categorySkills.findIndex((s) => s.id === skillId);

        // For the first skill in a category (index 0), it's always available
        if (skillIndex === 0) {
          // Check money
          const cost = skill.baseCost * Math.pow(skill.level + 1, 1.8);
          if (state.dirtyMoney < cost) return false;
          return true;
        }

        // For other skills, check if the previous skill has reached level 1
        const previousSkill = categorySkills[skillIndex - 1];
        if (!previousSkill || previousSkill.level < 1) {
          return false;
        }

        // Check money
        const cost = skill.baseCost * Math.pow(skill.level + 1, 1.8);
        if (state.dirtyMoney < cost) return false;

        return true;
      },

      upgradeSkill: (skillId) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!state.canUpgrade(skillId)) return false;

        const cost = skill.baseCost * Math.pow(skill.level + 1, 1.8);
        const duration = skill.baseTime * Math.pow(skill.level + 1, 1.5);

        set({
          skills: {
            ...state.skills,
            [skillId]: {
              ...skill,
              upgrading: true,
              startTime: Date.now(),
              endTime: Date.now() + duration,
            },
          },
          dirtyMoney: state.dirtyMoney - cost,
        });

        return true;
      },

      finalizeUpgrade: (skillId) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill || !skill.upgrading) return;

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
      },

      updateSkillLevel: (skillId, level) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill) return;

        set({
          skills: {
            ...state.skills,
            [skillId]: {
              ...skill,
              level: Math.min(level, skill.maxLevel),
            },
          },
        });
      },

      resetAllSkills: () => {
        set({
          skills: INITIAL_SKILLS,
          dirtyMoney: 0,
        });
      },
    }),
    {
      name: 'investment-skill-tree-store',
      version: 1,
    }
  )
);
