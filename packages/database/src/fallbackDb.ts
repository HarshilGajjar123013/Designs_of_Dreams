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

const INITIAL_CATEGORIES: any[] = [];
const INITIAL_COLLECTIONS: any[] = [];
const INITIAL_PRODUCTS: any[] = [];
const INITIAL_ORDERS: any[] = [];
const INITIAL_CUSTOMERS: any[] = [];
const INITIAL_INVENTORY_LOGS: any[] = [];
const INITIAL_CONTACT_FORMS: any[] = [];
const INITIAL_SECURITY_LOGS: any[] = [];
const INITIAL_COUPONS: any[] = [];

const DEFAULT_LOGIN_SLOT_URLS = [
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1610030470298-4058fbb6190c?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=400&q=80"
];

const DEFAULT_SIGNUP_SLOT_URLS = [
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=400&q=80"
];

const INITIAL_AUTH_PAGE_IMAGES = [
  ...DEFAULT_LOGIN_SLOT_URLS.map((url, idx) => ({
    id: `auth-login-slot-${idx + 1}`,
    pageType: 'login',
    slotNumber: idx + 1,
    imageUrl: url,
    storagePath: null,
    isActive: true,
    displayOrder: idx + 1,
    title: `Login Collage ${idx + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })),
  ...DEFAULT_SIGNUP_SLOT_URLS.map((url, idx) => ({
    id: `auth-signup-slot-${idx + 1}`,
    pageType: 'signup',
    slotNumber: idx + 1,
    imageUrl: url,
    storagePath: null,
    isActive: true,
    displayOrder: idx + 1,
    title: `Sign Up Collage ${idx + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })),
];

const INITIAL_CMS_CONFIG = {
  heroTitle: 'Designs of Dreams — Heritage & Couture Atelier',
  heroSubtitle: 'Hand-woven luxury ethnic wear preserving the royal weaves of India.',
  heroImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200',
  announcementText: 'Atelier Booking Alert: Virtual consultations are open.',
  announcementLink: '/bookings',
  announcementActive: true,
  featuredCollections: [],
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
      image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop",
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
// Enable fallback DB by default unless explicitly turned off, ensuring offline safety
const isFallbackEnabled = process.env.ALLOW_FALLBACK_DB !== 'false';

let inMemoryData: any = null;

function getEmptyData() {
  return {
    products: [],
    categories: [],
    collections: [],
    orders: [],
    customers: [],
    inventoryLogs: [],
    contactForms: [],
    securityLogs: [],
    coupons: [],
    cmsConfig: null,
    customizationRequests: [],
    cost_calculations: [],
  };
}

function getRawData(): any {
  const isDev = process.env.NODE_ENV !== 'production';
  if (inMemoryData) {
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
    customizationRequests: [],
    auth_page_images: INITIAL_AUTH_PAGE_IMAGES,
    cost_calculations: [],
  };

  if (isReadOnlyEnv) {
    inMemoryData = defaultData;
    return defaultData;
  }

  if (fs.existsSync(FALLBACK_FILE)) {
    try {
      const content = fs.readFileSync(FALLBACK_FILE, 'utf-8');
      inMemoryData = JSON.parse(content);
      return inMemoryData;
    } catch (error) {
      console.error('Failed to read fallback DB, resetting to defaults.', error);
    }
  }

  if (!isFallbackEnabled) {
    inMemoryData = getEmptyData();
    return inMemoryData;
  }

  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  } catch (e) {
    console.warn('⚠️ Failed to write initial fallback DB to disk:', e);
  }
  inMemoryData = defaultData;
  return defaultData;
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
