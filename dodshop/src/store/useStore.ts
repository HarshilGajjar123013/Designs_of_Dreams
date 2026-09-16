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

const initialProducts: Product[] = [
  // SAREES
  {
    id: "1",
    title: "Royal Katan Silk Banarasi Saree",
    subtitle: "Varanasi Pure Silk Heritage",
    category: "Saree",
    subcategory: "Banarasi",
    desc: "A masterpiece hand-woven with pure silver zari work on premium mulberry silk.",
    longDesc: "Draped in sheer luxury, our flagship saree is hand-woven in Varanasi using the finest Katan mulberry silk and real silver zari threads. Features traditional Kadwa weave borders that take over 240 hours to complete.",
    price: 12999,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
    badge: "Royal Drape",
    fabrics: ["Katan Silk", "Pure Zari"],
    features: ["Pure Kadwa weave", "Intricate paisley pallu", "Gold-silver border"],
    sizes: ["One Size"],
    rating: 4.9
  },
  {
    id: "2",
    title: "Gilded Crimson Organza Saree",
    subtitle: "Lightweight Contemporary Silk",
    category: "Saree",
    subcategory: "Silk",
    desc: "Translucent pastel organza saree featuring hand-woven floral motifs and gold borders.",
    longDesc: "A delicate weave combining the lightweight translucency of premium organza with a hand-spun silk blend. Ornamented with delicate flower bootis and finished with custom scalloped borders.",
    price: 8499,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
    badge: "Limited Edition",
    fabrics: ["Organza Silk", "Zari Blend"],
    features: ["Scalloped embroidery", "Pastel hues", "Hand-painted borders"],
    sizes: ["One Size"],
    rating: 4.7
  },
  {
    id: "3",
    title: "Heritage Chanderi Zardozi Saree",
    subtitle: "Traditional Zari Handloom",
    category: "Saree",
    subcategory: "Chanderi",
    desc: "Fine handloom Chanderi silk saree with hand-stitched zardozi gold borders.",
    longDesc: "A classical ensemble directly from Chanderi weavers, elevated in our atelier with meticulous gold zardozi leaf designs hand-stitched onto royal crimson borders.",
    price: 9999,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    badge: "Artisanal Craft",
    fabrics: ["Chanderi Silk", "Zari Cotton"],
    features: ["Hand zardozi work", "Eco-friendly natural dye", "Lightweight weave"],
    sizes: ["One Size"],
    rating: 4.8
  },
  // KURTIS
  {
    id: "4",
    title: "Anarkali Chikankari Kurti",
    subtitle: "Lucknowi Hand Shadow Embroidery",
    category: "Kurti",
    subcategory: "Anarkali Kurti",
    desc: "Flowy flared silhouette in premium georgette, hand-embroidered by local artisans.",
    longDesc: "Made with flowy georgette and layered with cotton lining, this Anarkali showcases authentic Bakhiya (shadow work), Phanda, and Keel Kangan stitches. Each kurti supports local women artisans in Lucknow.",
    price: 3499,
    image: "https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=800&auto=format&fit=crop",
    badge: "Best Seller",
    fabrics: ["Premium Georgette", " Lucknow Chikankari"],
    features: ["Shadow embroidery", "Flared design", "Comes with slip"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.9
  },
  {
    id: "5",
    title: "Premium Cotton Straight Kurti",
    subtitle: "Classic Everyday Comfort",
    category: "Kurti",
    subcategory: "Straight Kurti",
    desc: "Everyday breathability featuring hand-block floral prints and delicate threadwork.",
    longDesc: "Designed for day-long comfort, this straight-cut cotton kurti features delicate hand-block prints using natural indigo dye, accented with hand-sewn thread details along the neck.",
    price: 1899,
    image: "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=800&q=80",
    badge: "Eco-Wear",
    fabrics: ["100% Pure Cotton"],
    features: ["Hand-block printed", "Breathable style", "Side slit pockets"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.5
  },
  {
    id: "6",
    title: "Mulmul Silk Partywear Kurti",
    subtitle: "Royal Festive Silhouette",
    category: "Kurti",
    subcategory: "Party Wear Kurti",
    desc: "Luxurious pastel rose silk kurti with handcrafted mirror work detailing.",
    longDesc: "Crafted on premium hand-spun Mulmul silk, this designer kurti glows with subtle mirror-work boundaries that catch the light beautifully during evening celebrations.",
    price: 4299,
    image: "https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=800&auto=format&fit=crop",
    badge: "Atelier Premium",
    fabrics: ["Mulmul Silk", "Mulberry Blend"],
    features: ["Real mirror work", "Pastel embroidery", "Comfort-fit lining"],
    sizes: ["M", "L", "XL"],
    rating: 4.8
  },
  // BLOUSES
  {
    id: "7",
    title: "Raw Silk Zardozi Blouse",
    subtitle: "Custom Embroidered Silhouette",
    category: "Blouse",
    subcategory: "Custom",
    desc: "Vibrant custom designer blouse featuring heavy gold embroidery and sweetheart neck.",
    longDesc: "Dazzle in raw silk featuring handwork gold zardozi wires, beads, and stone settings. Tailored with a premium sweetheart neck and matching dori tie-backs.",
    price: 2499,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
    badge: "Tailored Luxury",
    fabrics: ["Raw Silk", "Zardozi Thread"],
    features: ["Sweetheart neck", "Back dori ties", "Padded cups"],
    sizes: ["34", "36", "38", "40"],
    rating: 4.7
  },
  {
    id: "8",
    title: "Velvet Royal Heritage Blouse",
    subtitle: "Royal Winter Designer Blouse",
    category: "Blouse",
    subcategory: "Designer",
    desc: "Deep maroon velvet blouse featuring heavy traditional gold embroidery.",
    longDesc: "A plush, royal velvet blouse designed for high-profile winter weddings. Features elaborate floral gold embroidery wrapping around the sleeves and back.",
    price: 3199,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
    badge: "Exclusive",
    fabrics: ["Micro Velvet", "Gold Zardozi"],
    features: ["Elbow sleeves", "Deep back neck", "Soft inner cotton lining"],
    sizes: ["36", "38", "40", "42"],
    rating: 4.9
  },
  {
    id: "9",
    title: "Brocade Floral Padded Blouse",
    subtitle: "Ready Made Brocade Style",
    category: "Blouse",
    subcategory: "Ready Made",
    desc: "Classic gold and orange brocade blouse with contemporary keyhole back.",
    longDesc: "A highly versatile blouse woven in Banarasi brocade patterns. Seamlessly pairs with plain sarees or matching silk coordinates. Includes ready-padded cups.",
    price: 1999,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
    badge: "Versatile Core",
    fabrics: ["Banarasi Brocade", "Polyester Blend"],
    features: ["Keyhole back design", "Concealed side zipper", "Comfort padding"],
    sizes: ["34", "36", "38"],
    rating: 4.6
  },
  // DUPATTAS
  {
    id: "10",
    title: "Pure Silk Banarasi Dupatta",
    subtitle: "Luxury Gold Weave",
    category: "Dupatta",
    subcategory: "Heavy",
    desc: "Premium heavy silk woven dupatta featuring traditional royal paisley gold grids.",
    longDesc: "Woven in Varanasi, this dupatta is a complete outfit elevator. Crafted with premium katan silk warp, heavy floral creepers, and matching gold tassel trim finish.",
    price: 3999,
    image: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=800&auto=format&fit=crop",
    badge: "Collector Sourced",
    fabrics: ["Katan Silk", "Pure Zari Threads"],
    features: [" Paisley designs", "Handmade tassel border", "Double dye finish"],
    sizes: ["One Size"],
    rating: 4.9
  },
  {
    id: "11",
    title: "Chiffon Gota Patti Dupatta",
    subtitle: "Lightweight Shimmer Drape",
    category: "Dupatta",
    subcategory: "Light",
    desc: "Flowy chiffon dupatta featuring handcrafted shimmering Gota Patti borders.",
    longDesc: "A light, festive dupatta featuring delicate gota leaf patterns hand-applied on sheer chiffon. Provides a graceful weightless drape for festive settings.",
    price: 1499,
    image: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80",
    badge: "Festive Shimmer",
    fabrics: ["Pure Chiffon", "Gota Ribbons"],
    features: ["Gota Patti border", "Handmade mirrors", "Crinkled texture"],
    sizes: ["One Size"],
    rating: 4.6
  },
  {
    id: "12",
    title: "Hand-Dyed Bandhani Dupatta",
    subtitle: "Traditional Rajasthani Tie-Dye",
    category: "Dupatta",
    subcategory: "Floral",
    desc: "Vibrantly dyed cotton-silk dupatta with traditional tie-dye dots and borders.",
    longDesc: "Handmade in Rajasthan, this dupatta uses traditional tie-and-dye techniques. Features gold border highlights and delicate thread work trims.",
    price: 1799,
    image: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=800&auto=format&fit=crop",
    badge: "Traditional Tie-Dye",
    fabrics: ["Cotton Silk Blend"],
    features: ["Authentic Bandhani nodes", "Bright tie-dye", "Gold zari accents"],
    sizes: ["One Size"],
    rating: 4.7
  }
];

export const useStore = create<ECommerceStore>()(
  persist(
    (set) => ({
      products: initialProducts,
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
