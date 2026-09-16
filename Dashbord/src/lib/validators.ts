// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Zod Validation Schemas for all API inputs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { z } from 'zod';

// ── Auth ──
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ── Product ──
export const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters').max(120),
  sku: z.string().min(3, 'SKU is required').max(30),
  categoryId: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional().nullable().transform((v) => (v && v.trim()) || 'Couture'),
  collectionId: z.string().optional().nullable(),
  mrp: z.number().positive('MRP must be positive'),
  sellingPrice: z.number().positive('Selling price must be positive'),
  discount: z.number().min(0).max(100).default(0),
  gst: z.number().min(0).max(28).default(5),
  stock: z.number().int().min(0).default(0),
  lowStockAlert: z.number().int().min(0).default(2),
  description: z.string().optional().nullable().transform((v) => (v && v.trim().length >= 5 ? v.trim() : 'Handcrafted luxury couture piece with artisanal detailing.')),
  fabric: z.string().optional().nullable().transform((v) => (v && v.trim()) || 'Pure Silk'),
  weaveType: z.string().optional().nullable().transform((v) => (v && v.trim()) || 'Handloom'),
  occasion: z.string().optional().nullable().transform((v) => (v && v.trim()) || 'Festive & Ceremonial'),
  sareeLength: z.string().optional().nullable(),
  blousePiece: z.string().optional().nullable(),
  careInstructions: z.string().optional().nullable(),
  origin: z.string().optional().nullable(),
  colors: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default(['Free Size']).transform((v) => v.length > 0 ? v : ['Free Size']),
  features: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('ACTIVE'),
  featured: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  premium: z.boolean().default(true),
  newArrival: z.boolean().default(false),
  images: z.array(z.string()).default([]),
  videoUrl: z.string().optional().nullable(),
  customizationConfig: z.object({
    enabled: z.boolean().default(false),
    fabrics: z.array(z.string()).default([]),
    allowCustomColor: z.boolean().default(true),
    colorPlaceholder: z.string().optional(),
    budgetRanges: z.array(z.string()).default([]),
    allowCustomBudget: z.boolean().default(true),
    aemroduriTypes: z.array(z.object({
      id: z.string(),
      name: z.string(),
      active: z.boolean().default(true),
    })).default([]),
    allowTassels: z.boolean().default(true),
    maxMonths: z.number().min(1).max(60).default(60),
  }).optional().nullable(),
});

export type ProductInput = z.infer<typeof productSchema>;

// ── Category ──
export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(50),
  description: z.string().optional(),
  image: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// ── Collection ──
export const collectionSchema = z.object({
  name: z.string().min(2, 'Collection name must be at least 2 characters').max(80),
  description: z.string().optional(),
  image: z.string().optional().nullable(),
  season: z.string().optional(),
  isActive: z.boolean().default(true),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
});

export type CollectionInput = z.infer<typeof collectionSchema>;

// ── Order Status Update ──
export const orderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED']),
  paymentStatus: z.enum(['UNPAID', 'PAID', 'REFUND_INITIATED', 'REFUNDED']).optional(),
});

// ── Order Tracking ──
export const orderTrackingSchema = z.object({
  carrier: z.string().min(1, 'Carrier name is required'),
  trackingId: z.string().min(1, 'Tracking ID is required'),
  estimatedDelivery: z.string().min(1, 'Estimated delivery date is required'),
});

// ── Return Request Action ──
export const returnActionSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'PICKED_UP', 'REFUNDED']),
  rejectionReason: z.string().optional(),
  refundAmount: z.number().positive().optional(),
});

// ── Contact Reply ──
export const contactReplySchema = z.object({
  reply: z.string().min(5, 'Reply must be at least 5 characters'),
  status: z.enum(['REPLIED', 'ARCHIVED']).default('REPLIED'),
});

// ── Coupon ──
export const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').max(20).transform(v => v.toUpperCase()),
  discountPercent: z.number().positive().max(100),
  maxDiscount: z.number().positive().optional().nullable(),
  minOrderValue: z.number().min(0).default(0),
  usageLimit: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional().nullable(),
});

export type CouponInput = z.infer<typeof couponSchema>;

// ── CMS Config ──
export const cmsConfigSchema = z.object({
  heroTitle: z.string().min(1).optional(),
  heroSubtitle: z.string().min(1).optional(),
  heroImage: z.string().optional(),
  announcementText: z.string().optional().nullable(),
  announcementLink: z.string().optional().nullable(),
  announcementActive: z.boolean().optional(),
  featuredCollections: z.any().optional(),
  gallery: z.any().optional(),
  galleryFilterTags: z.any().optional(),
  bannerMiddle: z.string().optional().nullable(),
  footerBio: z.string().optional().nullable(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

// ── Admin User ──
export const createAdminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['SUPER_ADMIN', 'MANAGER']).default('MANAGER'),
  avatar: z.string().optional(),
});

// ── Inventory Adjustment ──
export const inventoryAdjustSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  change: z.number().int().refine(v => v !== 0, 'Change cannot be zero'),
  reason: z.string().min(3, 'Reason is required'),
});
