import fs from 'fs';
import path from 'path';

// Find the monorepo root dynamically to ensure a single shared db-fallback.json file
export function getSharedFallbackPath(): string {
  let currentDir = process.cwd();

  // Prefer an explicit shared fallback file if it already exists in an ancestor.
  for (let i = 0; i < 10; i++) {
    const fallbackPath = path.join(currentDir, 'db-fallback.json');
    if (fs.existsSync(fallbackPath)) {
      return fallbackPath;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }

  // Traverse up to 5 levels to find the monorepo root containing package.json with name "designs-of-dreams"
  currentDir = process.cwd();
  for (let i = 0; i < 5; i++) {
    const pkgPath = path.join(currentDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.name === 'designs-of-dreams') {
          return path.join(currentDir, 'db-fallback.json');
        }
      } catch (e) {
        // ignore JSON parse errors
      }
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }

  // Try locating relative to __dirname (when compiled inside node_modules/@dod/database)
  // __dirname is usually packages/database/src/ or packages/database/dist/
  let dir = __dirname;
  for (let i = 0; i < 5; i++) {
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.name === 'designs-of-dreams') {
          return path.join(dir, 'db-fallback.json');
        }
      } catch (e) {
        // ignore
      }
    }
    const parentDir = path.dirname(dir);
    if (parentDir === dir) break;
    dir = parentDir;
  }

  // Fallback to process.cwd()
  return path.join(process.cwd(), 'db-fallback.json');
}

const FALLBACK_FILE = getSharedFallbackPath();

const INITIAL_CATEGORIES = [
  { id: 'cat-sarees', name: 'Sarees', slug: 'sarees', description: 'Timeless drapes from India\'s finest looms.', sortOrder: 1, isActive: true },
  { id: 'cat-kurtis', name: 'Kurtis', slug: 'kurtis', description: 'Elegant ethnic tops.', sortOrder: 2, isActive: true },
  { id: 'cat-blouses', name: 'Blouses', slug: 'blouses', description: 'Designer blouses.', sortOrder: 3, isActive: true },
  { id: 'cat-dupattas', name: 'Dupattas', slug: 'dupattas', description: 'Handwoven accessories.', sortOrder: 4, isActive: true },
  { id: 'cat-heritage', name: 'Heritage Weaves', slug: 'heritage-weaves', description: 'Rare handloom treasures.', sortOrder: 5, isActive: true },
  { id: 'cat-bridal', name: 'Bridal', slug: 'bridal', description: 'Curated bridal couture.', sortOrder: 6, isActive: true },
];

const INITIAL_COLLECTIONS = [
  { id: 'coll-bridal', name: 'Bridal 2026', slug: 'bridal-2026', description: 'The complete bridal trousseau.', season: 'Autumn/Winter 2026', isActive: true, startDate: '2026-07-01T00:00:00Z', endDate: '2026-12-31T00:00:00Z' },
  { id: 'coll-heritage', name: 'Heritage Classics', slug: 'heritage-classics', description: 'Timeless handloom masterpieces.', season: 'Evergreen', isActive: true },
  { id: 'coll-summer', name: 'Summer Atelier', slug: 'summer-atelier', description: 'Lightweight breathable fabrics.', season: 'Spring/Summer 2026', isActive: true, startDate: '2026-03-01T00:00:00Z', endDate: '2026-08-31T00:00:00Z' },
  { id: 'coll-festive', name: 'Festive Luxe', slug: 'festive-luxe', description: 'Celebrate with opulence.', season: 'Festive 2026', isActive: true, startDate: '2026-09-01T00:00:00Z', endDate: '2026-11-30T00:00:00Z' },
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Kanjeevaram Brocade Silk Saree',
    slug: 'kanjeevaram-brocade-silk-saree',
    sku: 'DOD-SAR-001',
    categoryId: 'cat-heritage',
    subCategory: 'Silk Sarees',
    collectionId: 'coll-heritage',
    mrp: 95000,
    sellingPrice: 85000,
    discount: 10,
    gst: 5,
    stock: 8,
    lowStockAlert: 3,
    description: 'A timeless heirloom woven with pure gold and silver zari. Crafted over 45 days in Kanchipuram.',
    fabric: 'Pure Mulberry Silk',
    weaveType: 'Double Warp Handloom',
    occasion: 'Bridal & Ceremonial',
    colors: ['#800020', '#C5A059'],
    sizes: ['Free Size'],
    features: ['100% pure gold zari border', 'Includes matching blouse fabric', 'Silk Mark Certified'],
    tags: ['Kanjeevaram', 'Heritage Saree', 'Luxury Bridal'],
    status: 'ACTIVE',
    featured: true,
    bestSeller: true,
    premium: true,
    newArrival: false,
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600'],
    rating: 4.9,
    reviewCount: 47,
  },
  {
    id: 'prod-2',
    name: 'Zardozi Hand-Embellished Velvet Blouse',
    slug: 'zardozi-hand-embellished-velvet-blouse',
    sku: 'DOD-BLU-102',
    categoryId: 'cat-blouses',
    subCategory: 'Bridal Blouses',
    collectionId: 'coll-bridal',
    mrp: 18000,
    sellingPrice: 15500,
    discount: 14,
    gst: 12,
    stock: 12,
    lowStockAlert: 5,
    description: 'Exquisite bridal blouse in silk-velvet featuring intricate zardozi embroidery detailing.',
    fabric: 'Premium Silk Velvet',
    weaveType: 'Hand Embroidered',
    occasion: 'Wedding Rituals',
    colors: ['#4E0707', '#C5A059'],
    sizes: ['S', 'M', 'L', 'XL'],
    features: ['Deep scoop neck back', 'Padded cups'],
    tags: ['Zardozi', 'Bridal Blouse', 'Designer Velvet'],
    status: 'ACTIVE',
    featured: true,
    bestSeller: false,
    premium: true,
    newArrival: true,
    images: ['https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=600'],
    rating: 4.7,
    reviewCount: 23,
  },
  {
    id: 'prod-3',
    name: 'Lucknowi Chikankari Georgette Anarkali Set',
    slug: 'lucknowi-chikankari-georgette-anarkali-set',
    sku: 'DOD-KUR-204',
    categoryId: 'cat-kurtis',
    subCategory: 'Anarkali Suits',
    collectionId: 'coll-summer',
    mrp: 29000,
    sellingPrice: 26000,
    discount: 10,
    gst: 5,
    stock: 5,
    lowStockAlert: 2,
    description: 'Beautifully crafted chikankari floor-length kurti on premium georgette fabric.',
    fabric: 'Georgette with cotton inner',
    weaveType: 'Lucknow Hand-embroidery',
    occasion: 'High Tea & Mehendi',
    colors: ['#E6F2F7', '#FFFEEF'],
    sizes: ['M', 'L', 'XL'],
    features: ['Includes georgette dupatta and silk pants'],
    tags: ['Chikankari', 'Anarkali', 'Pastel Ethnic'],
    status: 'ACTIVE',
    featured: false,
    bestSeller: true,
    premium: false,
    newArrival: true,
    images: ['https://images.unsplash.com/photo-1609357518652-6cf0416f0cbe?q=80&w=600'],
    rating: 4.8,
    reviewCount: 36,
  }
];

const INITIAL_ORDERS = [
  {
    id: 'DOD-8921',
    customerId: 'cust-1',
    customerName: 'Aishwarya Roy',
    customerEmail: 'aishwarya.roy@luxury.in',
    totalAmount: 85000,
    discountAmount: 0,
    gstAmount: 4250,
    shippingAmount: 500,
    grandTotal: 89750,
    status: 'PROCESSING',
    paymentStatus: 'PAID',
    paymentMethod: 'CREDIT_CARD',
    shippingAddress: { line1: 'Bungalow 7, Malabar Hill', city: 'Mumbai', state: 'Maharashtra', postalCode: '400006', country: 'India', phone: '+91 98200 12345' },
    trackingDetails: { carrier: 'DHL Express Luxury Cargo', trackingId: 'DHL-DOD-9821-MUM', estimatedDelivery: '2026-06-26', logs: [{ status: 'Order accepted at Atelier', timestamp: '2026-06-23 10:15', location: 'Atelier Head Office, Delhi' }] },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { productId: 'prod-1', name: 'Kanjeevaram Brocade Silk Saree', sku: 'DOD-SAR-001', price: 85000, quantity: 1, size: 'Free Size', color: '#800020', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600' }
    ]
  }
];

const INITIAL_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Aishwarya Roy',
    email: 'aishwarya.roy@luxury.in',
    phone: '+91 98200 12345',
    avatar: 'AR',
    totalOrders: 1,
    totalSpent: 89750,
    notes: 'Prefers red and gold Kanjeevarams.',
    joinedDate: '2025-01-10T00:00:00Z',
    wishlist: [{ productId: 'prod-1', name: 'Kanjeevaram Brocade Silk Saree', price: 85000, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600' }],
    cart: [{ productId: 'prod-2', name: 'Zardozi Hand-Embellished Velvet Blouse', price: 15500, quantity: 1, image: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=600' }],
    addresses: [{ type: 'Home', address: 'Bungalow 7, Malabar Hill, Mumbai, Maharashtra 400006' }]
  }
];

const INITIAL_INVENTORY_LOGS = [
  { id: 'log-1', productId: 'prod-1', productName: 'Kanjeevaram Brocade Silk Saree', sku: 'DOD-SAR-001', change: 8, type: 'STOCK_IN', timestamp: new Date().toISOString(), user: 'Harsh Vardhan (SUPER_ADMIN)' }
];

const INITIAL_CONTACT_FORMS = [
  { id: 'form-1', name: 'Kareena Kapoor', email: 'kareena.k@bollywood.com', phone: '+91 90000 11111', subject: 'Bridal Couture Inquiry', message: 'Hello, I am interested in viewing your archival bridal collection for an upcoming wedding in London. Do you offer virtual bridal consultation with design customization?', status: 'UNREAD', createdAt: new Date().toISOString() }
];

const INITIAL_SECURITY_LOGS = [
  { id: 'sec-1', timestamp: new Date().toISOString(), action: 'Dev Server Initialized fallback DB', adminName: 'System', role: 'SUPER_ADMIN', ip: '127.0.0.1', device: 'Node Server', status: 'SUCCESS' }
];

const INITIAL_COUPONS = [
  { id: 'coup-1', code: 'ROYALTY10', discountPercent: 10, maxDiscount: 10000, minOrderValue: 50000, isActive: true, validFrom: new Date().toISOString() }
];

const INITIAL_CMS_CONFIG = {
  heroTitle: 'Designs of Dreams — Heritage & Couture Atelier',
  heroSubtitle: 'Hand-woven luxury ethnic wear preserving the royal weaves of India.',
  heroImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200',
  announcementText: 'Atelier Booking Alert: Virtual consultations are open.',
  announcementLink: '/bookings',
  announcementActive: true,
  featuredCollections: [
    { id: 'coll-bridal', name: 'Bridal Collections', image: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=300', count: 18 },
  ],
  gallery: [
    {
      id: 1,
      title: "Detail & Thread",
      category: "Detail Studio",
      filterTag: "embroidery",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
      desc: "Finely spun gold threads embroidered onto heavy velvet base fabric."
    },
    {
      id: 2,
      title: "The Master Weaver",
      category: "Artisanal Handloom",
      filterTag: "weaving",
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop",
      desc: "Varanasi master weaver hand-weaving mulberry silk over weeks of dedicated labor."
    },
    {
      id: 3,
      title: "Zardozi Handwork",
      category: "Intricate Embroidery",
      filterTag: "embroidery",
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop",
      desc: "Detailed shadow embroidery and metal wire applique from Lucknow on georgette."
    },
    {
      id: 4,
      title: "Heritage Spools",
      category: "Weaving Spools",
      filterTag: "weaving",
      image: "https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=800&auto=format&fit=crop",
      desc: "Premium colored silk threads prepared on traditional reels, ready for looms."
    },
    {
      id: 5,
      title: "Draping Elegance",
      category: "Bridal Drape",
      filterTag: "weaving",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
      desc: "Mulberry silk saree exhibiting detailed pure silver zari brocade work."
    },
    {
      id: 6,
      title: "Indigo Dye Vat",
      category: "Organic Coloring",
      filterTag: "coloring",
      image: "https://images.unsplash.com/photo-1524295988555-44ade8b4034f?q=80&w=600&auto=format&fit=crop",
      desc: "Traditional hand-dyeing processes using pure organic botanical indigo vats."
    },
    {
      id: 7,
      title: "The Crimson Silk",
      category: "Festive Crimson",
      filterTag: "coloring",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop",
      desc: "Crimson hand-dyed organic silk threads drying in the afternoon sun."
    },
    {
      id: 8,
      title: "Craft Dyeing Vat",
      category: "Colors & Craft",
      filterTag: "coloring",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
      desc: "Botanical ingredients creating natural organic coloring solutions for yarn."
    },
    {
      id: 9,
      title: "Block Print Matrix",
      category: "Hand-Block Printing",
      filterTag: "finishing",
      image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop",
      desc: "Hand-carved seasoned teak wood block matrices used for printing intricate motifs."
    },
    {
      id: 10,
      title: "Gold Zari Skeins",
      category: "Pure Zari Work",
      filterTag: "weaving",
      image: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=800&auto=format&fit=crop",
      desc: "Fine silver wire bundles electroplated with pure gold ready to be woven into borders."
    },
    {
      id: 11,
      title: "The Finishing Touch",
      category: "Quality Inspection",
      filterTag: "finishing",
      image: "https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=800&auto=format&fit=crop",
      desc: "Meticulous quality inspection and thread trimming on finished sarees before packing."
    },
    {
      id: 12,
      title: "Loom Drafting",
      category: "Design Mapping",
      filterTag: "weaving",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop",
      desc: "Traditional card drafting and loom-harness mapping for floral zari grids."
    }
  ],
  bannerMiddle: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200',
  footerBio: 'Designs of Dreams is a curated marketplace celebrating premium Indian heritage textiles.',
  seoTitle: 'Designs of Dreams — Luxury Indian Ethnic Wear',
  seoDescription: 'Discover hand-woven Kanjeevarams, Patan Patolas, and zardozi blouses.',
};

const isReadOnlyEnv = !!(process.env.VERCEL || process.env.NODE_ENV === 'production');

let inMemoryData: any = null;

function getRawData(): any {
  const isDev = process.env.NODE_ENV !== 'production';
  if (!isDev && inMemoryData) {
    return inMemoryData;
  }

  const defaultData = {
    products: INITIAL_PRODUCTS,
    categories: INITIAL_CATEGORIES,
    collections: INITIAL_COLLECTIONS,
    orders: INITIAL_ORDERS,
    customers: INITIAL_CUSTOMERS,
    inventoryLogs: INITIAL_INVENTORY_LOGS,
    contactForms: INITIAL_CONTACT_FORMS,
    securityLogs: INITIAL_SECURITY_LOGS,
    coupons: INITIAL_COUPONS,
    cmsConfig: INITIAL_CMS_CONFIG,
  };

  if (isReadOnlyEnv) {
    inMemoryData = defaultData;
    return defaultData;
  }

  if (!fs.existsSync(FALLBACK_FILE)) {
    try {
      fs.writeFileSync(FALLBACK_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    } catch (e) {
      console.warn('⚠️ Failed to write initial fallback DB to disk (filesystem might be read-only):', e);
    }
    inMemoryData = defaultData;
    return defaultData;
  }

  try {
    const content = fs.readFileSync(FALLBACK_FILE, 'utf-8');
    inMemoryData = JSON.parse(content);
    return inMemoryData;
  } catch (error) {
    console.error('Failed to read fallback DB, resetting to defaults.', error);
    try {
      fs.unlinkSync(FALLBACK_FILE);
    } catch (e) { }
    inMemoryData = null;
    return getRawData();
  }
}

function saveRawData(data: any) {
  inMemoryData = data;
  if (isReadOnlyEnv) {
    return;
  }
  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error: any) {
    if (error.code === 'EROFS') {
      console.warn('⚠️ Read-only filesystem detected on Vercel. Saved changes to in-memory fallback cache only.');
    } else {
      console.error('Failed to save fallback DB to disk:', error);
    }
  }
}

export const fallbackDb = {
  getCollection: (collectionName: string): any[] => {
    const data = getRawData();
    return data[collectionName] || [];
  },

  saveCollection: (collectionName: string, items: any[]) => {
    const data = getRawData();
    data[collectionName] = items;
    saveRawData(data);
  },

  getCmsConfig: (): any => {
    const data = getRawData();
    if (!data.cmsConfig) return INITIAL_CMS_CONFIG;
    return {
      ...INITIAL_CMS_CONFIG,
      ...data.cmsConfig
    };
  },

  saveCmsConfig: (config: any) => {
    const data = getRawData();
    data.cmsConfig = config;
    saveRawData(data);
  }
};
