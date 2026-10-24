import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  subcategory: string;
  desc: string;
  longDesc: string;
  price: number;
  image: string;
  badge: string;
  fabrics: string[];
  features: string[];
  sizes: string[];
  rating: number;
  mrp?: number;
  discountPercent?: number;
  images?: string[];
  sareeLength?: string;
  blousePiece?: string;
  careInstructions?: string;
  origin?: string;
  weaveType?: string;
  occasion?: string;
  videoUrl?: string;
  fabric?: string;
  customizationConfig?: any;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  isLoggedIn: boolean;
  avatar?: string;
  phone?: string;
}

interface ECommerceStore {
  products: Product[];
  cart: CartItem[];
  wishlist: Product[];
  user: UserSession | null;

  // Auth actions
  login: (id: string, email: string, name: string, avatar?: string, phone?: string) => void;
  signup: (id: string, email: string, name: string, avatar?: string, phone?: string) => void;
  logout: () => void;
  updateAvatar: (avatar: string) => void;
  fetchAndSyncUserData: (userId: string) => Promise<void>;

  // Cart actions
  addToCart: (product: Product, quantity: number, size: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;

  // Wishlist actions
  toggleWishlist: (product: Product) => void;
}

const initialProducts: Product[] = [];

export const useStore = create<ECommerceStore>()(
  persist(
    (set) => ({
      products: [],
      cart: [],
      wishlist: [],
      user: null,

      // Authentication Actions
      login: (id, email, name, avatar, phone) => {
        set({
          user: { id, email, name, isLoggedIn: true, avatar, phone }
        });
        useStore.getState().fetchAndSyncUserData(id);
      },
      signup: (id, email, name, avatar, phone) => {
        set({
          user: { id, email, name, isLoggedIn: true, avatar, phone }
        });
        useStore.getState().fetchAndSyncUserData(id);
      },
      logout: () => {
        fetch('/api/auth/logout', { method: 'POST' }).catch(err => console.error('Failed to logout cookie:', err));
        set({ user: null, cart: [], wishlist: [] });
      },
      updateAvatar: (avatar) => set((state) => ({
        user: state.user ? { ...state.user, avatar } : null
      })),
      fetchAndSyncUserData: async (userId) => {
        try {
          const cartRes = await fetch(`/api/cart?userId=${userId}`);
          if (cartRes.ok) {
            const cartData = await cartRes.json();
            if (cartData.success) {
              set({ cart: cartData.cart });
            }
          }

          const wishlistRes = await fetch(`/api/wishlist?userId=${userId}`);
          if (wishlistRes.ok) {
            const wishlistData = await wishlistRes.json();
            if (wishlistData.success) {
              set({ wishlist: wishlistData.wishlist });
            }
          }
        } catch (err) {
          console.error('Error fetching user data from backend:', err);
        }
      },

      // Cart Actions
      addToCart: (product, quantity, size) => set((state) => {
        const existingItemIndex = state.cart.findIndex(
          (item) => item.product.id === product.id && item.size === size
        );

        let newCart;
        if (existingItemIndex > -1) {
          newCart = [...state.cart];
          newCart[existingItemIndex].quantity += quantity;
        } else {
          newCart = [...state.cart, { product, quantity, size }];
        }

        const userId = state.user?.id;
        if (userId) {
          fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, cart: newCart })
          }).catch(err => console.error('Failed to sync cart:', err));
        }

        return { cart: newCart };
      }),

      removeFromCart: (productId, size) => set((state) => {
        const newCart = state.cart.filter(
          (item) => !(item.product.id === productId && item.size === size)
        );

        const userId = state.user?.id;
        if (userId) {
          fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, cart: newCart })
          }).catch(err => console.error('Failed to sync cart:', err));
        }

        return { cart: newCart };
      }),

      updateQuantity: (productId, size, quantity) => set((state) => {
        let newCart;
        if (quantity <= 0) {
          newCart = state.cart.filter(
            (item) => !(item.product.id === productId && item.size === size)
          );
        } else {
          newCart = state.cart.map((item) =>
            item.product.id === productId && item.size === size
              ? { ...item, quantity }
              : item
          );
        }

        const userId = state.user?.id;
        if (userId) {
          fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, cart: newCart })
          }).catch(err => console.error('Failed to sync cart:', err));
        }

        return { cart: newCart };
      }),

      clearCart: () => set((state) => {
        const userId = state.user?.id;
        if (userId) {
          fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, cart: [] })
          }).catch(err => console.error('Failed to sync cart:', err));
        }
        return { cart: [] };
      }),

      // Wishlist Actions
      toggleWishlist: (product) => set((state) => {
        const isFavorited = state.wishlist.some((item) => item.id === product.id);
        let newWishlist;
        if (isFavorited) {
          newWishlist = state.wishlist.filter((item) => item.id !== product.id);
        } else {
          newWishlist = [...state.wishlist, product];
        }

        const userId = state.user?.id;
        if (userId) {
          fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, wishlist: newWishlist })
          }).catch(err => console.error('Failed to sync wishlist:', err));
        }

        return { wishlist: newWishlist };
      })
    }),
    {
      name: 'dod-ecommerce-store',
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        user: state.user
      })
    }
  )
);
