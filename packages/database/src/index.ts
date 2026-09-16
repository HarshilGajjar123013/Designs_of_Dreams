// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// @dod/database — Barrel Export
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Re-export Prisma client singleton
export { prisma } from './client';

// Re-export fallback database manager
export { fallbackDb } from './fallbackDb';

// Re-export all generated Prisma types
export type {
  AdminUser,
  Category,
  Collection,
  Product,
  Customer,
  OldCustomer,
  Address,
  CartItem,
  WishlistItem,
  Order,
  OrderItem,
  InventoryLog,
  ReturnRequest,
  ContactForm,
  CMSConfig,
  Coupon,
  SecurityLog,
} from './generated/prisma';

export interface CustomizationRequest {
  id: string;
  productId: string;
  customerId?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  fabric: string;
  color: string;
  budget: string;
  aemroduriType: string;
  tassels: string;
  timeEstimateMonths: number;
  notes?: string | null;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Re-export all enums
export {
  AdminRole,
  AccountStatus,
  CustomerType,
  ProductStatus,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  InventoryLogType,
  ContactStatus,
  ReturnStatus,
  AuditStatus,
} from './generated/prisma';
