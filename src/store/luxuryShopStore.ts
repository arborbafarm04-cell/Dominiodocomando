import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LuxuryItem {
  id: string;
  name: string;
  description: string;
  price: number;
  level: number;
  category: 'vehicle' | 'property' | 'accessory' | 'upgrade';
  image: string;
  bonus?: {
    moneyMultiplier?: number;
    spinsBonus?: number;
    levelBonus?: number;
  };
}

export interface LuxuryShopState {
  isOpen: boolean;
  selectedItem: LuxuryItem | null;
  purchasedItems: string[];
  openShop: () => void;
  closeShop: () => void;
  selectItem: (item: LuxuryItem | null) => void;
  purchaseItem: (itemId: string) => void;
  isPurchased: (itemId: string) => boolean;
}

const luxuryItems: LuxuryItem[] = [
  {
    id: 'ferrari-f8',
    name: 'Ferrari F8 Tributo',
    description: 'Superesportivo italiano de alta performance',
    price: 50000,
    level: 5,
    category: 'vehicle',
    image: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
    bonus: { moneyMultiplier: 1.5, spinsBonus: 100 },
  },
  {
    id: 'lamborghini-revuelto',
    name: 'Lamborghini Revuelto',
    description: 'Hipercar híbrida com design futurista',
    price: 75000,
    level: 8,
    category: 'vehicle',
    image: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
    bonus: { moneyMultiplier: 2, spinsBonus: 200 },
  },
  {
    id: 'penthouse-miami',
    name: 'Penthouse Miami',
    description: 'Cobertura de luxo com vista para o oceano',
    price: 100000,
    level: 10,
    category: 'property',
    image: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
    bonus: { moneyMultiplier: 2.5, levelBonus: 1 },
  },
  {
    id: 'rolex-daytona',
    name: 'Rolex Daytona',
    description: 'Relógio de ouro com cronógrafo suíço',
    price: 25000,
    level: 3,
    category: 'accessory',
    image: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
    bonus: { spinsBonus: 50 },
  },
  {
    id: 'diamond-ring',
    name: 'Anel de Diamante',
    description: 'Anel com diamante de 5 quilates',
    price: 35000,
    level: 4,
    category: 'accessory',
    image: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
    bonus: { moneyMultiplier: 1.2, spinsBonus: 75 },
  },
  {
    id: 'private-jet',
    name: 'Jato Privado G650',
    description: 'Aeronave de negócios de ultra-luxo',
    price: 150000,
    level: 12,
    category: 'vehicle',
    image: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
    bonus: { moneyMultiplier: 3, spinsBonus: 300, levelBonus: 2 },
  },
  {
    id: 'yacht-charter',
    name: 'Iate de Luxo',
    description: 'Iate de 150 metros com tripulação',
    price: 120000,
    level: 11,
    category: 'property',
    image: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
    bonus: { moneyMultiplier: 2.8, spinsBonus: 250 },
  },
  {
    id: 'vip-upgrade',
    name: 'Status VIP',
    description: 'Acesso VIP a todos os eventos premium',
    price: 40000,
    level: 6,
    category: 'upgrade',
    image: 'https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png',
    bonus: { moneyMultiplier: 1.8, spinsBonus: 150 },
  },
];

export const useLuxuryShopStore = create<LuxuryShopState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      selectedItem: null,
      purchasedItems: [],
      openShop: () => set({ isOpen: true }),
      closeShop: () => set({ isOpen: false, selectedItem: null }),
      selectItem: (item) => set({ selectedItem: item }),
      purchaseItem: (itemId) =>
        set((state) => {
          if (!state.purchasedItems.includes(itemId)) {
            return {
              purchasedItems: [...state.purchasedItems, itemId],
            };
          }
          return state;
        }),
      isPurchased: (itemId) => {
        const state = get();
        return state.purchasedItems.includes(itemId);
      },
    }),
    {
      name: 'luxury-shop-store',
    }
  )
);

export { luxuryItems };
