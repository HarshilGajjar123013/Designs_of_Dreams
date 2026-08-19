import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Type Definitions
export type UserRole = 'SUPER_ADMIN' | 'MANAGER';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: 'Sarees' | 'Kurtis' | 'Blouses' | 'Dupattas' | 'Bridal' | 'Heritage Weaves';
  subCategory: string;
  collection: 'Bridal 2026' | 'Heritage Classics' | 'Summer Atelier' | 'Festive Luxe';
  mrp: number;
  sellingPrice: number;
  discount: number;
  gst: number;
  stock: number;
  lowStockAlert: number;
  description: string;
  fabric: string;
  weaveType: string;
  occasion: string;
  colors: string[]; // hex codes
  sizes: string[];
  features: string[];
  tags: string[];
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  featured: boolean;
  bestSeller: boolean;
  premium: boolean;
  newArrival: boolean;
  images: string[];
  videoUrl?: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  change: number; // + or -
  type: 'STOCK_IN' | 'SALE' | 'RETURN' | 'MANUAL_ADJUST';
  timestamp: string;
  user: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  gstAmount: number;
  shippingAmount: number;
  grandTotal: number;
  status: 'PENDING' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'REFUNDED';
  paymentStatus: 'PAID' | 'UNPAID' | 'REFUND_INITIATED' | 'REFUNDED';
  paymentMethod: 'COD' | 'CREDIT_CARD' | 'UPI' | 'NET_BANKING' | 'BANK_TRANSFER';
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  trackingDetails?: {
    carrier: string;
    trackingId: string;
    estimatedDelivery: string;
    logs: { status: string; timestamp: string; location: string }[];
  };
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  totalOrders: number;
  totalSpent: number;
  notes: string;
  joinedDate: string;
  wishlist: { productId: string; name: string; price: number; image: string }[];
  cart: { productId: string; name: string; price: number; quantity: number; image: string }[];
  addresses: { type: string; address: string }[];
}

export interface ContactForm {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'UNREAD' | 'REPLIED' | 'ARCHIVED';
  reply?: string;
  repliedAt?: string;
  createdAt: string;
}

export interface CMSConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  announcementText: string;
  announcementLink: string;
  announcementActive: boolean;
  featuredCollections: { id: string; name: string; image: string; count: number }[];
  bannerMiddle: string;
  footerBio: string;
  seoTitle: string;
  seoDescription: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  action: string;
  adminName: string;
  role: string;
  ip: string;
  device: string;
  status: 'SUCCESS' | 'FAILED';
}

// Initial Mock Data Sets
const INITIAL_PRODUCTS: Product[] = [];
const INITIAL_ORDERS: Order[] = [];
const INITIAL_CUSTOMERS: Customer[] = [];
const INITIAL_CONTACT_FORMS: ContactForm[] = [];
const INITIAL_SECURITY_LOGS: SecurityLog[] = [];

const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'dev-fallback-super-admin',
    name: 'Khyati Acharya',
    email: 'dod@gmail.com',
    role: 'SUPER_ADMIN',
    avatar: 'KA',
    status: 'ACTIVE',
    lastLogin: ''
  },
  {
    id: 'dev-fallback-manager',
    name: 'Harshil Gajjar',
    email: 'harshilgajjar124@gmail.com',
    role: 'MANAGER',
    avatar: 'HG',
    status: 'ACTIVE',
    lastLogin: ''
  }
];

const INITIAL_INVENTORY_LOGS: InventoryLog[] = [];

const INITIAL_CMS: CMSConfig = {
  heroTitle: 'Designs of Dreams — Heritage & Couture Atelier',
  heroSubtitle: 'Hand-woven luxury ethnic wear preserving the royal weaves of India.',
  heroImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200',
  announcementText: 'Atelier Booking Alert: Virtual consultations are open.',
  announcementLink: '/bookings',
  announcementActive: true,
  featuredCollections: [],
  bannerMiddle: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200',
  footerBio: 'Designs of Dreams is a curated marketplace celebrating premium Indian heritage textiles.',
  seoTitle: 'Designs of Dreams — Luxury Indian Ethnic Wear',
  seoDescription: 'Discover hand-woven Kanjeevarams, double-ikat Patan Patolas, and bespoke blouses.'
};

// Zustand Store State & Actions
interface AdminState {
  currentAdmin: AdminUser;
  admins: AdminUser[];
  role: UserRole;
  products: Product[];
  orders: Order[];
  customers: Customer[];
  contactForms: ContactForm[];
  cms: CMSConfig;
  securityLogs: SecurityLog[];
  inventoryLogs: InventoryLog[];
  coupons: { code: string; discountPercent: number; active: boolean; minOrder: number }[];
  searchTerms: { term: string; count: number; conversions: number }[];

  // Actions
  toggleRole: () => void;
  setRole: (role: UserRole) => void;
  setCredentials: (admin: AdminUser, role: UserRole) => void;

  // Catalog actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Orders actions
  updateOrderStatus: (id: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => void;
  updateOrderTracking: (id: string, carrier: string, trackingId: string, estimatedDelivery: string) => void;
  approveReturnRequest: (id: string) => void;

  // Support actions
  replyToContactForm: (id: string, reply: string) => void;
  updateContactStatus: (id: string, status: ContactForm['status']) => void;

  // CMS actions
  updateCMS: (updates: Partial<CMSConfig>) => void;

  // Admins actions
  addAdmin: (admin: Omit<AdminUser, 'id' | 'lastLogin'>) => void;
  updateAdminStatus: (id: string, status: AdminUser['status']) => void;

  // Security log actions
  addSecurityLog: (action: string, adminName: string, role: string, ip: string, device: string, status: 'SUCCESS' | 'FAILED') => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      currentAdmin: INITIAL_ADMINS[0],
      admins: INITIAL_ADMINS,
      role: 'SUPER_ADMIN',
      products: INITIAL_PRODUCTS,
      orders: INITIAL_ORDERS,
      customers: INITIAL_CUSTOMERS,
      contactForms: INITIAL_CONTACT_FORMS,
      cms: INITIAL_CMS,
      securityLogs: INITIAL_SECURITY_LOGS,
      inventoryLogs: INITIAL_INVENTORY_LOGS,
      coupons: [],
      searchTerms: [],

      // Actions
      toggleRole: () => set((state) => {
        const nextRole = state.role === 'SUPER_ADMIN' ? 'MANAGER' : 'SUPER_ADMIN';
        const nextAdmin = state.admins.find(a => a.role === nextRole) || state.admins[0];

        // Log the role transition
        const newLog: SecurityLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          action: `Role switched to ${nextRole}`,
          adminName: nextAdmin.name,
          role: nextRole,
          ip: '127.0.0.1',
          device: 'System Simulator',
          status: 'SUCCESS'
        };

        return {
          role: nextRole,
          currentAdmin: nextAdmin,
          securityLogs: [newLog, ...state.securityLogs]
        };
      }),

      setRole: (role) => set((state) => {
        const nextAdmin = state.admins.find(a => a.role === role) || state.admins[0];
        return { role, currentAdmin: nextAdmin };
      }),

      setCredentials: (admin, role) => set((state) => {
        const exists = state.admins.some(a => a.id === admin.id);
        const updatedAdmins = exists
          ? state.admins.map(a => a.id === admin.id ? { ...a, ...admin } : a)
          : [...state.admins, admin];
        return {
          currentAdmin: admin,
          role,
          admins: updatedAdmins
        };
      }),

      addProduct: (productData) => set((state) => {
        const newId = `prod-${Date.now()}`;
        const newProduct: Product = { ...productData, id: newId };

        const newInvLog: InventoryLog = {
          id: `inv-log-${Date.now()}`,
          productId: newId,
          productName: newProduct.name,
          sku: newProduct.sku,
          change: newProduct.stock,
          type: 'STOCK_IN',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          user: `${state.currentAdmin.name} (${state.role})`
        };

        const newSecLog: SecurityLog = {
          id: `sec-log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          action: `Created new product: ${newProduct.name} (SKU: ${newProduct.sku})`,
          adminName: state.currentAdmin.name,
          role: state.role,
          ip: '127.0.0.1',
          device: 'Atelier Console',
          status: 'SUCCESS'
        };

        return {
          products: [newProduct, ...state.products],
          inventoryLogs: [newInvLog, ...state.inventoryLogs],
          securityLogs: [newSecLog, ...state.securityLogs]
        };
      }),

      updateProduct: (id, updates) => set((state) => {
        let stockChangeLog: InventoryLog | null = null;

        const updatedProducts = state.products.map((prod) => {
          if (prod.id === id) {
            // Track stock change if stock is updated
            if (updates.stock !== undefined && updates.stock !== prod.stock) {
              const diff = updates.stock - prod.stock;
              stockChangeLog = {
                id: `inv-log-${Date.now()}`,
                productId: id,
                productName: prod.name,
                sku: updates.sku || prod.sku,
                change: diff,
                type: diff > 0 ? 'STOCK_IN' : 'MANUAL_ADJUST',
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                user: `${state.currentAdmin.name} (${state.role})`
              };
            }
            return { ...prod, ...updates };
          }
          return prod;
        });

        const newSecLog: SecurityLog = {
          id: `sec-log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          action: `Updated product details: ID ${id}`,
          adminName: state.currentAdmin.name,
          role: state.role,
          ip: '127.0.0.1',
          device: 'Atelier Console',
          status: 'SUCCESS'
        };

        return {
          products: updatedProducts,
          inventoryLogs: stockChangeLog ? [stockChangeLog, ...state.inventoryLogs] : state.inventoryLogs,
          securityLogs: [newSecLog, ...state.securityLogs]
        };
      }),

      deleteProduct: (id) => set((state) => {
        const productToDelete = state.products.find(p => p.id === id);

        const newSecLog: SecurityLog = {
          id: `sec-log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          action: `Deleted product: ${productToDelete?.name || id}`,
          adminName: state.currentAdmin.name,
          role: state.role,
          ip: '127.0.0.1',
          device: 'Atelier Console',
          status: 'SUCCESS'
        };

        return {
          products: state.products.filter(p => p.id !== id),
          securityLogs: [newSecLog, ...state.securityLogs]
        };
      }),

      updateOrderStatus: (id, status, paymentStatus) => set((state) => {
        const order = state.orders.find(o => o.id === id);

        const updatedOrders = state.orders.map((o) => {
          if (o.id === id) {
            const up: Partial<Order> = { status };
            if (paymentStatus) {
              up.paymentStatus = paymentStatus;
            }
            // Check status change and add logs inside tracking
            if (o.trackingDetails) {
              const currentLogs = o.trackingDetails.logs;
              const nextLogs = [
                {
                  status: `Status updated to ${status}`,
                  timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                  location: 'Atelier Fulfillment'
                },
                ...currentLogs
              ];
              up.trackingDetails = {
                ...o.trackingDetails,
                logs: nextLogs
              };
            }
            return { ...o, ...up };
          }
          return o;
        });

        // If returned, add stock back to inventory
        let updatedProducts = state.products;
        let inventoryLogs = state.inventoryLogs;

        if (status === 'RETURNED' && order && order.status !== 'RETURNED') {
          inventoryLogs = order.items.map((item, idx) => ({
            id: `inv-log-${Date.now()}-${idx}`,
            productId: item.productId,
            productName: item.name,
            sku: item.sku,
            change: item.quantity,
            type: 'RETURN' as 'STOCK_IN' | 'SALE' | 'RETURN' | 'MANUAL_ADJUST',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            user: `System (Return ORD-${id})`
          })).concat(state.inventoryLogs);

          updatedProducts = state.products.map((p) => {
            const orderItem = order.items.find(item => item.productId === p.id);
            if (orderItem) {
              return { ...p, stock: p.stock + orderItem.quantity };
            }
            return p;
          });
        }

        // If cancelled, add stock back to inventory
        if (status === 'CANCELLED' && order && order.status !== 'CANCELLED') {
          inventoryLogs = order.items.map((item, idx) => ({
            id: `inv-log-${Date.now()}-${idx}`,
            productId: item.productId,
            productName: item.name,
            sku: item.sku,
            change: item.quantity,
            type: 'MANUAL_ADJUST' as 'STOCK_IN' | 'SALE' | 'RETURN' | 'MANUAL_ADJUST',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            user: `System (Cancel ORD-${id})`
          })).concat(state.inventoryLogs);

          updatedProducts = state.products.map((p) => {
            const orderItem = order.items.find(item => item.productId === p.id);
            if (orderItem) {
              return { ...p, stock: p.stock + orderItem.quantity };
            }
            return p;
          });
        }

        const newSecLog: SecurityLog = {
          id: `sec-log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          action: `Updated order ${id} status to ${status}`,
          adminName: state.currentAdmin.name,
          role: state.role,
          ip: '127.0.0.1',
          device: 'Atelier Console',
          status: 'SUCCESS'
        };

        return {
          orders: updatedOrders,
          products: updatedProducts,
          inventoryLogs,
          securityLogs: [newSecLog, ...state.securityLogs]
        };
      }),

      updateOrderTracking: (id, carrier, trackingId, estimatedDelivery) => set((state) => {
        const updatedOrders = state.orders.map((o) => {
          if (o.id === id) {
            return {
              ...o,
              trackingDetails: {
                carrier,
                trackingId,
                estimatedDelivery,
                logs: o.trackingDetails?.logs || [
                  {
                    status: 'Courier assigned & parcel packed',
                    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                    location: 'Delhi Central Hub'
                  }
                ]
              }
            };
          }
          return o;
        });

        return { orders: updatedOrders };
      }),

      approveReturnRequest: (id) => {
        // Find order, set status to returned and handle refunds
        get().updateOrderStatus(id, 'RETURNED', 'REFUNDED');
      },

      replyToContactForm: (id, reply) => set((state) => {
        const updatedForms = state.contactForms.map((cf) => {
          if (cf.id === id) {
            return {
              ...cf,
              reply,
              status: 'REPLIED' as const,
              repliedAt: new Date().toISOString()
            };
          }
          return cf;
        });

        const newSecLog: SecurityLog = {
          id: `sec-log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          action: `Replied to contact message (ID ${id})`,
          adminName: state.currentAdmin.name,
          role: state.role,
          ip: '127.0.0.1',
          device: 'Atelier Support Console',
          status: 'SUCCESS'
        };

        return {
          contactForms: updatedForms,
          securityLogs: [newSecLog, ...state.securityLogs]
        };
      }),

      updateContactStatus: (id, status) => set((state) => ({
        contactForms: state.contactForms.map(cf => cf.id === id ? { ...cf, status } : cf)
      })),

      updateCMS: (updates) => set((state) => {
        const newSecLog: SecurityLog = {
          id: `sec-log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          action: 'Updated homepage CMS configurations',
          adminName: state.currentAdmin.name,
          role: state.role,
          ip: '127.0.0.1',
          device: 'Atelier CMS Editor',
          status: 'SUCCESS'
        };

        return {
          cms: { ...state.cms, ...updates },
          securityLogs: [newSecLog, ...state.securityLogs]
        };
      }),

      addAdmin: (adminData) => set((state) => {
        const newId = `adm-${Date.now()}`;
        const newAdmin: AdminUser = {
          ...adminData,
          id: newId,
          lastLogin: 'Never'
        };

        const newSecLog: SecurityLog = {
          id: `sec-log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          action: `Created new admin account: ${newAdmin.name} (${newAdmin.role})`,
          adminName: state.currentAdmin.name,
          role: state.role,
          ip: '127.0.0.1',
          device: 'Atelier Console',
          status: 'SUCCESS'
        };

        return {
          admins: [...state.admins, newAdmin],
          securityLogs: [newSecLog, ...state.securityLogs]
        };
      }),

      updateAdminStatus: (id, status) => set((state) => {
        const admin = state.admins.find(a => a.id === id);

        const newSecLog: SecurityLog = {
          id: `sec-log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          action: `Updated status of admin ${admin?.name || id} to ${status}`,
          adminName: state.currentAdmin.name,
          role: state.role,
          ip: '127.0.0.1',
          device: 'Atelier Console',
          status: 'SUCCESS'
        };

        return {
          admins: state.admins.map(a => a.id === id ? { ...a, status } : a),
          securityLogs: [newSecLog, ...state.securityLogs]
        };
      }),

      addSecurityLog: (action, adminName, role, ip, device, status) => set((state) => {
        const newLog: SecurityLog = {
          id: `sec-log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          action,
          adminName,
          role,
          ip,
          device,
          status
        };

        return {
          securityLogs: [newLog, ...state.securityLogs]
        };
      })
    }),
    {
      name: 'atelier-admin-storage-v2',
      partialize: (state) => ({
        products: state.products,
        orders: state.orders,
        customers: state.customers,
        contactForms: state.contactForms,
        cms: state.cms,
        securityLogs: state.securityLogs,
        inventoryLogs: state.inventoryLogs,
        role: state.role,
        currentAdmin: state.currentAdmin,
        coupons: state.coupons
      })
    }
  )
);
