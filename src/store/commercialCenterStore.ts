import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LaunderingOperation = {
  id: string;
  businessType: string;
  amount: number;
  returnAmount: number;
  startTime: number;
  endTime: number;
  risk: 'low' | 'medium' | 'high';
  status: 'running' | 'completed';
  date: string; // YYYY-MM-DD
};

export type BusinessType = 'lava-rapido' | 'bar-do-zé' | 'oficina-do-malandro' | 'balada-do-crime' | 'empresa-fantasma';

export const BUSINESSES = {
  'lava-rapido': {
    name: '🚗 Lava Rápido do Seu Zé',
    risk: 'low' as const,
    baseTax: 0.15, // 15% taxa
    baseConversion: 0.85,
    time: 5 * 60 * 1000, // 5 minutes
    description: 'Lavagem rápida com espuma e brilho',
    minRespect: 0,
    emoji: '🚗',
  },
  'bar-do-zé': {
    name: '🍺 Bar do Zé Cachaceiro',
    risk: 'low' as const,
    baseTax: 0.12, // 12% taxa
    baseConversion: 0.88,
    time: 10 * 60 * 1000, // 10 minutes
    description: 'Bebidas, conversa e dinheiro limpo',
    minRespect: 5,
    emoji: '🍺',
  },
  'oficina-do-malandro': {
    name: '🔧 Oficina do Malandro',
    risk: 'medium' as const,
    baseTax: 0.18, // 18% taxa
    baseConversion: 1.15,
    time: 20 * 60 * 1000, // 20 minutes
    description: 'Consertos que ninguém pergunta',
    minRespect: 15,
    emoji: '🔧',
  },
  'balada-do-crime': {
    name: '🎉 Balada do Crime',
    risk: 'medium' as const,
    baseTax: 0.20, // 20% taxa
    baseConversion: 1.40,
    time: 30 * 60 * 1000, // 30 minutes
    description: 'Música alta, bebida cara, dinheiro limpo',
    minRespect: 30,
    emoji: '🎉',
  },
  'empresa-fantasma': {
    name: '👻 Empresa Fantasma S.A.',
    risk: 'high' as const,
    baseTax: 0.25, // 25% taxa
    baseConversion: 1.90,
    time: 60 * 60 * 1000, // 1 hour
    description: 'Consultoria em operações especiais',
    minRespect: 50,
    emoji: '👻',
  },
};

export const RISK_FAILURE_CHANCE = {
  low: 0.05,
  medium: 0.15,
  high: 0.3,
};

interface CommercialCenterUpgrades {
  taxReduction: number; // Reduz taxa em %
  conversionBonus: number; // Aumenta conversão em %
  operationsPerDay: number; // Operações por dia (começa em 1)
}

interface CommercialCenterState {
  operations: LaunderingOperation[];
  upgrades: CommercialCenterUpgrades;
  addOperation: (operation: LaunderingOperation) => void;
  removeOperation: (id: string) => void;
  updateOperation: (id: string, updates: Partial<LaunderingOperation>) => void;
  getActiveOperations: () => LaunderingOperation[];
  getCompletedOperations: () => LaunderingOperation[];
  getOperationsToday: () => LaunderingOperation[];
  clearOperations: () => void;
  upgradeTaxReduction: (amount: number) => void;
  upgradeConversionBonus: (amount: number) => void;
  upgradeOperationsPerDay: (amount: number) => void;
  getTodayDate: () => string;
}

export const useCommercialCenterStore = create<CommercialCenterState>()(
  persist(
    (set, get) => ({
      operations: [],
      upgrades: {
        taxReduction: 0,
        conversionBonus: 0,
        operationsPerDay: 1,
      },
      
      getTodayDate: () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
      },

      addOperation: (operation) =>
        set((state) => ({
          operations: [...state.operations, operation],
        })),
      
      removeOperation: (id) =>
        set((state) => ({
          operations: state.operations.filter((op) => op.id !== id),
        })),
      
      updateOperation: (id, updates) =>
        set((state) => ({
          operations: state.operations.map((op) =>
            op.id === id ? { ...op, ...updates } : op
          ),
        })),
      
      getActiveOperations: () =>
        get().operations.filter((op) => op.status === 'running'),
      
      getCompletedOperations: () =>
        get().operations.filter((op) => op.status === 'completed'),
      
      getOperationsToday: () => {
        const today = get().getTodayDate();
        return get().operations.filter((op) => op.date === today && op.status === 'completed');
      },
      
      clearOperations: () => set({ operations: [] }),
      
      upgradeTaxReduction: (amount) =>
        set((state) => ({
          upgrades: {
            ...state.upgrades,
            taxReduction: state.upgrades.taxReduction + amount,
          },
        })),
      
      upgradeConversionBonus: (amount) =>
        set((state) => ({
          upgrades: {
            ...state.upgrades,
            conversionBonus: state.upgrades.conversionBonus + amount,
          },
        })),
      
      upgradeOperationsPerDay: (amount) =>
        set((state) => ({
          upgrades: {
            ...state.upgrades,
            operationsPerDay: state.upgrades.operationsPerDay + amount,
          },
        })),
    }),
    {
      name: 'commercial-center-store',
    }
  )
);
