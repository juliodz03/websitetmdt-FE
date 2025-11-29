import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Auth Store
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData }
      })),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Cart Store
export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: { items: [], totalAmount: 0 },
      
      setCart: (cart) => set({ cart }),
      
      addToCart: (item) => set((state) => {
        const existingIndex = state.cart.items.findIndex(
          (i) => i.product._id === item.product._id && i.variantId === item.variantId
        );
        
        let newItems;
        if (existingIndex > -1) {
          newItems = [...state.cart.items];
          newItems[existingIndex].quantity += item.quantity;
        } else {
          newItems = [...state.cart.items, item];
        }
        
        const totalAmount = newItems.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        );
        
        return { cart: { items: newItems, totalAmount } };
      }),
      
      removeFromCart: (productId, variantId) => set((state) => {
        const newItems = state.cart.items.filter(
          (i) => !(i.product._id === productId && i.variantId === variantId)
        );
        
        const totalAmount = newItems.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        );
        
        return { cart: { items: newItems, totalAmount } };
      }),
      
      updateQuantity: (productId, variantId, quantity) => set((state) => {
        const newItems = state.cart.items.map((i) =>
          i.product._id === productId && i.variantId === variantId
            ? { ...i, quantity }
            : i
        );
        
        const totalAmount = newItems.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        );
        
        return { cart: { items: newItems, totalAmount } };
      }),
      
      clearCart: () => set({ cart: { items: [], totalAmount: 0 } }),
      
      getCartItemCount: () => {
        const state = get();
        return state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage', // localStorage key
    }
  )
);

// UI Store
export const useUIStore = create((set) => ({
  sidebarOpen: false,
  cartOpen: false,
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleCart: () => set((state) => ({ cartOpen: !state.cartOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
  closeCart: () => set({ cartOpen: false }),
}));
