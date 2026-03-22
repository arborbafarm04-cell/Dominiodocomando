import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Skill = {
  id: string;
  name: string;
  category: 'respeito';
  level: number;
  maxLevel: number;
  baseCost: number;
  baseTime: number;
  requires?: string[];
  upgrading: boolean;
  startTime?: number;
  endTime?: number;
};

export type RespeitSkillTreeState = {
  skills: Record<string, Skill>;
  initializeSkills: () => void;
  startUpgrade: (skillId: string, playerMoney: number) => { success: boolean; message: string };
  finalizeUpgrade: (skillId: string) => { success: boolean; message: string };
  canUpgrade: (skillId: string, playerMoney: number) => boolean;
  getRemainingTime: (skillId: string) => number;
  getRespectBonus: () => number;
  getTotalRespectLevel: () => number;
  getSkillProgress: (skillId: string) => number;
  getUnlockedContent: () => {
    unlockedAreas: string[];
    unlockedNPCs: string[];
    unlockedMissions: string[];
  };
};

const INITIAL_SKILLS: Record<string, Skill> = {
  respeito_1: {
    id: 'respeito_1',
    name: 'Nome na Quebrada I',
    category: 'respeito',
    level: 0,
    maxLevel: 20,
    baseCost: 700,
    baseTime: 300000, // 5 minutos
    requires: [],
    upgrading: false,
  },
  respeito_2: {
    id: 'respeito_2',
    name: 'Influência Local II',
    category: 'respeito',
    level: 0,
    maxLevel: 25,
    baseCost: 1000,
    baseTime: 600000, // 10 minutos
    requires: ['respeito_1'],
    upgrading: false,
  },
  respeito_3: {
    id: 'respeito_3',
    name: 'Rede de Contatos III',
    category: 'respeito',
    level: 0,
    maxLevel: 30,
    baseCost: 1500,
    baseTime: 1200000, // 20 minutos
    requires: ['respeito_2'],
    upgrading: false,
  },
  respeito_4: {
    id: 'respeito_4',
    name: 'Domínio Regional IV',
    category: 'respeito',
    level: 0,
    maxLevel: 40,
    baseCost: 2500,
    baseTime: 2400000, // 40 minutos
    requires: ['respeito_3'],
    upgrading: false,
  },
  respeito_5: {
    id: 'respeito_5',
    name: 'Império do Comando V',
    category: 'respeito',
    level: 0,
    maxLevel: 50,
    baseCost: 6000,
    baseTime: 3600000, // 1 hora
    requires: ['respeito_4'],
    upgrading: false,
  },
};

export const useRespeitSkillTreeStore = create<RespeitSkillTreeState>()(
  persist(
    (set, get) => ({
      skills: INITIAL_SKILLS,

      initializeSkills: () => {
        set({ skills: INITIAL_SKILLS });
      },

      startUpgrade: (skillId: string, playerMoney: number) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill) {
          return { success: false, message: 'Skill não encontrada' };
        }

        // Verificar se já está em upgrade
        if (skill.upgrading) {
          return { success: false, message: 'Skill já está em upgrade' };
        }

        // Verificar se atingiu maxLevel
        if (skill.level >= skill.maxLevel) {
          return { success: false, message: 'Skill já atingiu o nível máximo' };
        }

        // Verificar requisitos
        if (skill.requires && skill.requires.length > 0) {
          for (const requiredSkillId of skill.requires) {
            const requiredSkill = state.skills[requiredSkillId];
            if (!requiredSkill) {
              return { success: false, message: `Skill requisitada não encontrada: ${requiredSkillId}` };
            }

            // Verificar se o requisito foi cumprido
            const requiredLevel = requiredSkillId === 'respeito_1' ? 10 : requiredSkillId === 'respeito_2' ? 15 : requiredSkillId === 'respeito_3' ? 20 : 25;
            if (requiredSkill.level < requiredLevel) {
              return { success: false, message: `Requisito não cumprido: ${requiredSkill.name} deve estar no nível ${requiredLevel}` };
            }
          }
        }

        // Calcular custo
        const cost = Math.ceil(skill.baseCost * Math.pow(skill.level + 1, 1.8));

        // Verificar se tem dinheiro suficiente
        if (playerMoney < cost) {
          return { success: false, message: `Dinheiro insuficiente. Necessário: ${cost}, Disponível: ${playerMoney}` };
        }

        // Calcular duração
        const duration = Math.ceil(skill.baseTime * Math.pow(skill.level + 1, 1.5));

        // Atualizar skill
        set((state) => ({
          skills: {
            ...state.skills,
            [skillId]: {
              ...skill,
              upgrading: true,
              startTime: Date.now(),
              endTime: Date.now() + duration,
            },
          },
        }));

        return { success: true, message: `Upgrade iniciado. Custo: ${cost}. Duração: ${Math.ceil(duration / 1000)}s` };
      },

      finalizeUpgrade: (skillId: string) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill) {
          return { success: false, message: 'Skill não encontrada' };
        }

        if (!skill.upgrading) {
          return { success: false, message: 'Skill não está em upgrade' };
        }

        if (!skill.endTime || Date.now() < skill.endTime) {
          return { success: false, message: 'Upgrade ainda não foi concluído' };
        }

        // Incrementar level
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

        return { success: true, message: `${skill.name} foi atualizado para nível ${skill.level + 1}` };
      },

      canUpgrade: (skillId: string, playerMoney: number) => {
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

            const requiredLevel = requiredSkillId === 'respeito_1' ? 10 : requiredSkillId === 'respeito_2' ? 15 : requiredSkillId === 'respeito_3' ? 20 : 25;
            if (requiredSkill.level < requiredLevel) return false;
          }
        }

        // Verificar dinheiro
        const cost = Math.ceil(skill.baseCost * Math.pow(skill.level + 1, 1.8));
        return playerMoney >= cost;
      },

      getRemainingTime: (skillId: string) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill || !skill.endTime) return 0;

        const remaining = skill.endTime - Date.now();
        return remaining > 0 ? remaining : 0;
      },

      getRespectBonus: () => {
        const state = get();
        let totalBonus = 0;

        Object.values(state.skills).forEach((skill) => {
          totalBonus += skill.level;
        });

        return totalBonus;
      },

      getTotalRespectLevel: () => {
        const state = get();
        let totalLevel = 0;

        Object.values(state.skills).forEach((skill) => {
          totalLevel += skill.level;
        });

        return totalLevel;
      },

      getSkillProgress: (skillId: string) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill) return 0;

        return (skill.level / skill.maxLevel) * 100;
      },

      getUnlockedContent: () => {
        const state = get();
        const totalRespect = state.getTotalRespectLevel();
        const respeito1Level = state.skills.respeito_1.level;
        const respeito2Level = state.skills.respeito_2.level;
        const respeito3Level = state.skills.respeito_3.level;
        const respeito4Level = state.skills.respeito_4.level;
        const respeito5Level = state.skills.respeito_5.level;

        const unlockedAreas: string[] = [];
        const unlockedNPCs: string[] = [];
        const unlockedMissions: string[] = [];

        // Nome na Quebrada - Áreas iniciais
        if (respeito1Level >= 5) {
          unlockedAreas.push('Favela Central');
          unlockedNPCs.push('Chefe Local');
          unlockedMissions.push('Primeiras Operações');
        }

        if (respeito1Level >= 10) {
          unlockedAreas.push('Zona de Influência');
          unlockedNPCs.push('Informante');
        }

        if (respeito1Level >= 15) {
          unlockedAreas.push('Mercado Negro');
          unlockedMissions.push('Operações Intermediárias');
        }

        // Influência Local - NPCs e missões
        if (respeito2Level >= 5) {
          unlockedNPCs.push('Fornecedor');
          unlockedMissions.push('Missões de Influência');
        }

        if (respeito2Level >= 10) {
          unlockedNPCs.push('Mediador');
          unlockedAreas.push('Bairro Controlado');
        }

        if (respeito2Level >= 15) {
          unlockedNPCs.push('Estrategista');
          unlockedMissions.push('Operações Estratégicas');
        }

        // Rede de Contatos - Contatos estratégicos
        if (respeito3Level >= 5) {
          unlockedNPCs.push('Contato Estratégico');
          unlockedMissions.push('Operações Coordenadas');
        }

        if (respeito3Level >= 10) {
          unlockedNPCs.push('Aliado Regional');
          unlockedAreas.push('Zona de Operações');
        }

        if (respeito3Level >= 15) {
          unlockedNPCs.push('Chefe Regional');
          unlockedMissions.push('Operações Regionais');
        }

        if (respeito3Level >= 20) {
          unlockedNPCs.push('Conselheiro');
          unlockedMissions.push('Missões de Alto Risco');
        }

        // Domínio Regional - Novas regiões
        if (respeito4Level >= 5) {
          unlockedAreas.push('Região Expandida');
          unlockedMissions.push('Operações de Expansão');
        }

        if (respeito4Level >= 10) {
          unlockedAreas.push('Zona de Domínio');
          unlockedNPCs.push('Lorde do Território');
        }

        if (respeito4Level >= 15) {
          unlockedAreas.push('Região Controlada');
          unlockedMissions.push('Operações de Consolidação');
        }

        if (respeito4Level >= 20) {
          unlockedAreas.push('Império Regional');
          unlockedNPCs.push('Imperador Regional');
        }

        if (respeito4Level >= 25) {
          unlockedMissions.push('Operações Imperiais');
        }

        // Império do Comando - Conteúdo avançado
        if (respeito5Level >= 5) {
          unlockedMissions.push('Operações Globais');
          unlockedNPCs.push('Conselho Supremo');
        }

        if (respeito5Level >= 10) {
          unlockedAreas.push('Sede do Comando');
          unlockedMissions.push('Operações Estratégicas Globais');
        }

        if (respeito5Level >= 15) {
          unlockedNPCs.push('Líder Supremo');
          unlockedMissions.push('Missões Lendárias');
        }

        if (respeito5Level >= 20) {
          unlockedAreas.push('Zona Proibida');
          unlockedMissions.push('Operações Secretas');
        }

        if (respeito5Level >= 30) {
          unlockedMissions.push('Operações Finais');
        }

        return {
          unlockedAreas: [...new Set(unlockedAreas)],
          unlockedNPCs: [...new Set(unlockedNPCs)],
          unlockedMissions: [...new Set(unlockedMissions)],
        };
      },
    }),
    {
      name: 'respeit-skill-tree-storage',
      version: 1,
    }
  )
);
