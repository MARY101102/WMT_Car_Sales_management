import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  cart: [],

  checkAuth: async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        set({ token: accessToken, isAuthenticated: true });
      } else {
        set({ token: null, isAuthenticated: false, user: null });
      }
    } catch (e) {
      set({ token: null, isAuthenticated: false, user: null });
    }
  },

  addToCart: (item) => set(state => ({ cart: [...state.cart, item] })),
  removeFromCart: (id) => set(state => ({ cart: state.cart.filter(i => i.id !== id) })),
  updateCartQuantity: (id, quantity) => set(state => ({
    cart: state.cart.map(i => (i.id === id ? { ...i, quantity } : i))
  })),
  clearCart: () => set({ cart: [] }),
}));

export default useStore;
