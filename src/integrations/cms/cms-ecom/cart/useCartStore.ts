import { create } from 'zustand';

export interface CartItem {
  id: string;
  collectionId: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartStore {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  isOpen: boolean;
  addingItemId: string | null;
  isCheckingOut: boolean;
  actions: {
    addToCart: (params: { collectionId: string; itemId: string; quantity?: number }) => Promise<void>;
    removeFromCart: (item: CartItem) => void;
    updateQuantity: (item: CartItem, quantity: number) => void;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    clearCart: () => void;
    checkout: () => Promise<void>;
  };
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  itemCount: 0,
  totalPrice: 0,
  isOpen: false,
  addingItemId: null,
  isCheckingOut: false,
  actions: {
    addToCart: async ({ collectionId, itemId, quantity = 1 }) => {
      set({ addingItemId: itemId });
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { items } = get();
        const existingItem = items.find(
          item => item.itemId === itemId && item.collectionId === collectionId
        );

        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === existingItem.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                id: `${collectionId}-${itemId}`,
                collectionId,
                itemId,
                name: `Item ${itemId}`,
                price: 0,
                quantity,
              },
            ],
          });
        }

        // Update totals
        const updatedItems = get().items;
        set({
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        });
      } finally {
        set({ addingItemId: null });
      }
    },
    removeFromCart: (item) => {
      const { items } = get();
      const updatedItems = items.filter(i => i.id !== item.id);
      set({
        items: updatedItems,
        itemCount: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
        totalPrice: updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
      });
    },
    updateQuantity: (item, quantity) => {
      const { items } = get();
      const updatedItems = items.map(i =>
        i.id === item.id ? { ...i, quantity: Math.max(0, quantity) } : i
      ).filter(i => i.quantity > 0);

      set({
        items: updatedItems,
        itemCount: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
        totalPrice: updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
      });
    },
    toggleCart: () => {
      set(state => ({ isOpen: !state.isOpen }));
    },
    openCart: () => {
      set({ isOpen: true });
    },
    closeCart: () => {
      set({ isOpen: false });
    },
    clearCart: () => {
      set({
        items: [],
        itemCount: 0,
        totalPrice: 0,
        isOpen: false,
      });
    },
    checkout: async () => {
      set({ isCheckingOut: true });
      try {
        // Simulate checkout API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        get().actions.clearCart();
      } finally {
        set({ isCheckingOut: false });
      }
    },
  },
}));
