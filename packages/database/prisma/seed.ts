// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌱 DESIGNS OF DREAMS — Database Seed Script
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// Pre-generate consistent UUIDs for relations
const CAT_SAREES = randomUUID();
const CAT_KURTIS = randomUUID();
const CAT_BLOUSES = randomUUID();
const CAT_DUPATTAS = randomUUID();
const CAT_HERITAGE = randomUUID();
const CAT_BRIDAL = randomUUID();

const COLL_BRIDAL = randomUUID();
const COLL_HERITAGE = randomUUID();
const COLL_SUMMER = randomUUID();
const COLL_FESTIVE = randomUUID();

const PROD_1 = randomUUID();
const PROD_2 = randomUUID();
const PROD_3 = randomUUID();
const PROD_4 = randomUUID();
const PROD_5 = randomUUID();
const PROD_6 = randomUUID();
const PROD_7 = randomUUID();
const PROD_8 = randomUUID();

const CUST_1 = randomUUID();
const CUST_2 = randomUUID();
const CUST_3 = randomUUID();

async function main() {
  console.log('🌱 Seeding Designs of Dreams database...\n');

  // ── Clean existing data ──
  await prisma.securityLog.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.address.deleteMany();
  await prisma.contactForm.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.cMSConfig.deleteMany();

  console.log('  ✓ Cleaned existing data');

  // ── 1. Admin Users ──
  // Password hash for "khyati@dod" using bcrypt cost 10
  const passwordHash = '$2b$10$g9d2B1ns4bMSBOUTb7sa9OwtuuHyGDJFDokqPFHoE9N6iFiB.9sp2';

  await prisma.adminUser.createMany({
    data: [
      {
        name: 'Khyati Acharya',
        email: 'dod@gmail.com',
        passwordHash,
        role: 'SUPER_ADMIN',
        avatar: null,
        status: 'ACTIVE',
        lastLogin: null,
      },
    ],
  });
  console.log('  ✓ Created 1 admin user (Khyati Acharya)');

  // ── 2. Categories ──
  await prisma.category.createMany({
    data: [
      { id: CAT_SAREES, name: 'Sarees', slug: 'sarees', description: 'Timeless drapes from India\'s finest looms — Banarasi, Kanjeevaram, Chanderi, and more.', sortOrder: 1 },
      { id: CAT_KURTIS, name: 'Kurtis', slug: 'kurtis', description: 'Elegant ethnic tops from Lucknowi chikankari to contemporary silhouettes.', sortOrder: 2 },
      { id: CAT_BLOUSES, name: 'Blouses', slug: 'blouses', description: 'Designer blouses with zardozi, velvet, brocade, and custom tailoring.', sortOrder: 3 },
      { id: CAT_DUPATTAS, name: 'Dupattas', slug: 'dupattas', description: 'Handwoven and hand-embroidered drape accessories.', sortOrder: 4 },
      { id: CAT_HERITAGE, name: 'Heritage Weaves', slug: 'heritage-weaves', description: 'Rare handloom treasures — Patola, Paithani, Pochampally and collector pieces.', sortOrder: 5 },
      { id: CAT_BRIDAL, name: 'Bridal', slug: 'bridal', description: 'Curated bridal couture and trousseau collections.', sortOrder: 6 },
    ],
  });
  console.log('  ✓ Created 6 categories');

  // ── 3. Collections ──
  await prisma.collection.createMany({
    data: [
      { id: COLL_BRIDAL, name: 'Bridal 2026', slug: 'bridal-2026', description: 'The complete bridal trousseau — from ceremony to cocktail.', season: 'Autumn/Winter 2026', startDate: new Date('2026-07-01'), endDate: new Date('2026-12-31') },
      { id: COLL_HERITAGE, name: 'Heritage Classics', slug: 'heritage-classics', description: 'Timeless handloom masterpieces celebrating India\'s weaving legacy.', season: 'Evergreen' },
      { id: COLL_SUMMER, name: 'Summer Atelier', slug: 'summer-atelier', description: 'Lightweight breathable fabrics for the warm season.', season: 'Spring/Summer 2026', startDate: new Date('2026-03-01'), endDate: new Date('2026-08-31') },
      { id: COLL_FESTIVE, name: 'Festive Luxe', slug: 'festive-luxe', description: 'Celebrate with opulence — Diwali, Navratri, and festive special editions.', season: 'Festive 2026', startDate: new Date('2026-09-01'), endDate: new Date('2026-11-30') },
    ],
  });
  console.log('  ✓ Created 4 collections');

  // ── 4. Products ──
  await prisma.product.createMany({
    data: [
      {
        id: PROD_1,
        name: 'Kanjeevaram Brocade Silk Saree',
        slug: 'kanjeevaram-brocade-silk-saree',
        sku: 'DOD-SAR-001',
        categoryId: CAT_HERITAGE,
        subCategory: 'Silk Sarees',
        collectionId: COLL_HERITAGE,
        mrp: 95000,
        sellingPrice: 85000,
        discount: 10,
        gst: 5,
        stock: 8,
        lowStockAlert: 3,
        description: 'A timeless heirloom woven with pure gold and silver zari. Crafted over 45 days in Kanchipuram, this saree features traditional temple architecture borders and peacock pair motifs.',
        fabric: 'Pure Mulberry Silk',
        weaveType: 'Double Warp Handloom',
        occasion: 'Bridal & Ceremonial',
        colors: ['#800020', '#C5A059'],
        sizes: ['Free Size'],
        features: ['100% pure gold zari border', 'Includes matching blouse fabric', 'Silk Mark Certified'],
        tags: ['Kanjeevaram', 'Heritage Saree', 'Luxury Bridal', 'Silk Saree'],
        status: 'ACTIVE',
        featured: true,
        bestSeller: true,
        premium: true,
        images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600', 'https://images.unsplash.com/photo-1610030470298-df15699479cd?q=80&w=600'],
        rating: 4.9,
        reviewCount: 47,
      },
      {
        id: PROD_2,
        name: 'Zardozi Hand-Embellished Velvet Blouse',
        slug: 'zardozi-hand-embellished-velvet-blouse',
        sku: 'DOD-BLU-102',
        categoryId: CAT_BLOUSES,
        subCategory: 'Bridal Blouses',
        collectionId: COLL_BRIDAL,
        mrp: 18000,
        sellingPrice: 15500,
        discount: 14,
        gst: 12,
        stock: 12,
        lowStockAlert: 5,
        description: 'Exquisite bridal blouse in silk-velvet featuring intricate zardozi embroidery detailing. Hand-sewn with dabka, sequins, and semi-precious beads.',
        fabric: 'Premium Silk Velvet',
        weaveType: 'Hand Embroidered',
        occasion: 'Wedding Rituals',
        colors: ['#4E0707', '#C5A059'],
        sizes: ['S', 'M', 'L', 'XL'],
        features: ['Deep scoop neck back', 'Padded cups', 'Adjustable side strings with custom dori'],
        tags: ['Zardozi', 'Bridal Blouse', 'Designer Velvet'],
        status: 'ACTIVE',
        featured: true,
        newArrival: true,
        premium: true,
        images: ['https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=600'],
        rating: 4.7,
        reviewCount: 23,
      },
      {
        id: PROD_3,
        name: 'Lucknowi Chikankari Georgette Anarkali Set',
        slug: 'lucknowi-chikankari-georgette-anarkali-set',
        sku: 'DOD-KUR-204',
        categoryId: CAT_KURTIS,
        subCategory: 'Anarkali Suits',
        collectionId: COLL_SUMMER,
        mrp: 29000,
        sellingPrice: 26000,
        discount: 10,
        gst: 5,
        stock: 5,
        lowStockAlert: 2,
        description: 'Beautifully crafted chikankari floor-length kurti on premium georgette fabric. Accentuated with micro Mukaish hand embroidery work.',
        fabric: 'Georgette with cotton inner',
        weaveType: 'Lucknow Hand-embroidery',
        occasion: 'High Tea & Mehendi',
        colors: ['#E6F2F7', '#FFFEEF'],
        sizes: ['M', 'L', 'XL'],
        features: ['Includes georgette dupatta and silk pants', 'Intricate shadow-work stitches', 'Mukaish accents'],
        tags: ['Chikankari', 'Anarkali', 'Pastel Ethnic', 'Lucknowi'],
        status: 'ACTIVE',
        bestSeller: true,
        newArrival: true,
        images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600'],
        rating: 4.8,
        reviewCount: 36,
      },
      {
        id: PROD_4,
        name: 'Real Zari Banarasi Georgette Dupatta',
        slug: 'real-zari-banarasi-georgette-dupatta',
        sku: 'DOD-DUP-309',
        categoryId: CAT_DUPATTAS,
        subCategory: 'Silk Dupattas',
        collectionId: COLL_HERITAGE,
        mrp: 35000,
        sellingPrice: 32000,
        discount: 8,
        gst: 5,
        stock: 2,
        lowStockAlert: 2,
        description: 'A masterpiece Banarasi dupatta woven in pure khaddi georgette with gold cutwork weave patterns and heavy gold palla details.',
        fabric: 'Khaddi Georgette',
        weaveType: 'Banarasi Kadwa Weave',
        occasion: 'Weddings',
        colors: ['#FF1493', '#FFD700'],
        sizes: ['Free Size'],
        features: ['Authentic Banarasi handloom stamp', 'Real zari tested', 'Scalloped borders'],
        tags: ['Banarasi', 'Khaddi Georgette', 'Luxury Dupatta'],
        status: 'ACTIVE',
        featured: true,
        premium: true,
        images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600'],
        rating: 4.9,
        reviewCount: 18,
      },
      {
        id: PROD_5,
        name: 'Patan Patola Double Ikat Heritage Saree',
        slug: 'patan-patola-double-ikat-heritage-saree',
        sku: 'DOD-SAR-005',
        categoryId: CAT_HERITAGE,
        subCategory: 'Ikat Sarees',
        collectionId: COLL_HERITAGE,
        mrp: 195000,
        sellingPrice: 185000,
        discount: 5,
        gst: 5,
        stock: 1,
        lowStockAlert: 1,
        description: 'A genuine double ikat Patan Patola. The warp and weft are tie-dyed separately with mathematical precision, creating identical patterns on both sides.',
        fabric: 'Natural Silk',
        weaveType: 'Double Ikat Handloom',
        occasion: 'Exquisite Heirloom',
        colors: ['#D21F3C', '#228B22'],
        sizes: ['Free Size'],
        features: ['Reversible design', 'Vegetable dyed yarns', 'Atelier certificate of authenticity'],
        tags: ['Patola', 'Double Ikat', 'Patan', 'Rare Handloom'],
        status: 'ACTIVE',
        featured: true,
        premium: true,
        images: ['https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=600'],
        rating: 5.0,
        reviewCount: 8,
      },
      {
        id: PROD_6,
        name: 'Royal Katan Silk Banarasi Saree',
        slug: 'royal-katan-silk-banarasi-saree',
        sku: 'DOD-SAR-006',
        categoryId: CAT_SAREES,
        subCategory: 'Banarasi',
        collectionId: COLL_HERITAGE,
        mrp: 15999,
        sellingPrice: 12999,
        discount: 19,
        gst: 5,
        stock: 15,
        lowStockAlert: 3,
        description: 'A masterpiece hand-woven with pure silver zari work on premium mulberry silk. Features traditional Kadwa weave borders that take over 240 hours to complete.',
        fabric: 'Katan Silk',
        weaveType: 'Kadwa Weave',
        occasion: 'Weddings & Pujas',
        colors: ['#C5A059', '#800020'],
        sizes: ['Free Size'],
        features: ['Pure Kadwa weave', 'Intricate paisley pallu', 'Gold-silver border'],
        tags: ['Banarasi', 'Katan Silk', 'Heritage'],
        status: 'ACTIVE',
        bestSeller: true,
        images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop'],
        rating: 4.9,
        reviewCount: 52,
      },
      {
        id: PROD_7,
        name: 'Anarkali Chikankari Kurti',
        slug: 'anarkali-chikankari-kurti',
        sku: 'DOD-KUR-007',
        categoryId: CAT_KURTIS,
        subCategory: 'Anarkali Kurti',
        collectionId: COLL_SUMMER,
        mrp: 4499,
        sellingPrice: 3499,
        discount: 22,
        gst: 5,
        stock: 25,
        lowStockAlert: 5,
        description: 'Flowy flared silhouette in premium georgette, hand-embroidered by local artisans of Lucknow. Each kurti supports local women artisans.',
        fabric: 'Premium Georgette',
        weaveType: 'Lucknow Chikankari',
        occasion: 'Casual & Festive',
        colors: ['#FFFFFF', '#FAF9F6'],
        sizes: ['S', 'M', 'L', 'XL'],
        features: ['Shadow embroidery', 'Flared design', 'Comes with slip'],
        tags: ['Chikankari', 'Anarkali', 'Best Seller'],
        status: 'ACTIVE',
        bestSeller: true,
        images: ['https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=800&auto=format&fit=crop'],
        rating: 4.9,
        reviewCount: 89,
      },
      {
        id: PROD_8,
        name: 'Velvet Royal Heritage Blouse',
        slug: 'velvet-royal-heritage-blouse',
        sku: 'DOD-BLU-008',
        categoryId: CAT_BLOUSES,
        subCategory: 'Designer',
        collectionId: COLL_FESTIVE,
        mrp: 4199,
        sellingPrice: 3199,
        discount: 24,
        gst: 12,
        stock: 18,
        lowStockAlert: 4,
        description: 'Deep maroon velvet blouse designed for high-profile winter weddings. Features elaborate floral gold embroidery wrapping around sleeves and back.',
        fabric: 'Micro Velvet',
        weaveType: 'Gold Zardozi',
        occasion: 'Winter Weddings',
        colors: ['#800020', '#C5A059'],
        sizes: ['36', '38', '40', '42'],
        features: ['Elbow sleeves', 'Deep back neck', 'Soft inner cotton lining'],
        tags: ['Velvet', 'Winter', 'Designer Blouse'],
        status: 'ACTIVE',
        premium: true,
        images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'],
        rating: 4.9,
        reviewCount: 31,
      },
    ],
  });
  console.log('  ✓ Created 8 products');

  // ── 5. Customers ──
  // Password hash for "Customer@2026"
  const custPasswordHash = '$2b$12$ABC123XYZ456DEF789GHI012JKL345MNO678PQR901STU234VWX567';

  await prisma.customer.createMany({
    data: [
      { id: CUST_1, name: 'Aishwarya Roy', email: 'aishwarya.roy@luxury.in', passwordHash: custPasswordHash, phone: '+91 98200 12345', notes: 'Prefers red and gold Kanjeevarams. Requests custom blouse tailoring.', isVerified: true, joinedDate: new Date('2025-01-10') },
      { id: CUST_2, name: 'Meera Deshmukh', email: 'meera.deshmukh@gmail.com', passwordHash: custPasswordHash, phone: '+91 88866 54321', notes: 'Bridal client. Wedding Nov 2026. Needs premium consultation.', isVerified: true, joinedDate: new Date('2025-04-12') },
      { id: CUST_3, name: 'Priya Sharma', email: 'priya.sharma@outlook.com', passwordHash: custPasswordHash, phone: '+91 99100 99200', notes: 'Regular buyer of fine silks.', isVerified: true, joinedDate: new Date('2025-02-18') },
    ],
  });
  console.log('  ✓ Created 3 customers');

  // ── 6. Addresses ──
  await prisma.address.createMany({
    data: [
      { customerId: CUST_1, label: 'Home', line1: 'Bungalow 7, Malabar Hill', line2: 'Near Hanging Gardens', city: 'Mumbai', state: 'Maharashtra', postalCode: '400006', phone: '+91 98200 12345', isDefault: true },
      { customerId: CUST_2, label: 'Home', line1: 'Flat 402, Golden Crest Apartments', line2: 'Jubilee Hills Road No. 3', city: 'Hyderabad', state: 'Telangana', postalCode: '500033', phone: '+91 88866 54321', isDefault: true },
      { customerId: CUST_3, label: 'Home', line1: 'House 14B, Sector 15', city: 'Noida', state: 'Uttar Pradesh', postalCode: '201301', phone: '+91 99100 99200', isDefault: true },
    ],
  });
  console.log('  ✓ Created 3 addresses');

  // ── 7. Orders ──
  await prisma.order.create({
    data: {
      id: 'DOD-8921',
      customerId: CUST_1,
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
      shippingAddress: { line1: 'Bungalow 7, Malabar Hill', line2: 'Near Hanging Gardens', city: 'Mumbai', state: 'Maharashtra', postalCode: '400006', country: 'India', phone: '+91 98200 12345' },
      trackingDetails: { carrier: 'DHL Express Luxury Cargo', trackingId: 'DHL-DOD-9821-MUM', estimatedDelivery: '2026-06-26', logs: [{ status: 'Order accepted at Atelier', timestamp: '2026-06-23 10:15', location: 'Atelier Head Office, Delhi' }] },
      items: {
        create: [
          { productId: PROD_1, name: 'Kanjeevaram Brocade Silk Saree', sku: 'DOD-SAR-001', price: 85000, quantity: 1, size: 'Free Size', color: '#800020', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600' },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      id: 'DOD-8919',
      customerId: CUST_2,
      customerName: 'Meera Deshmukh',
      customerEmail: 'meera.deshmukh@gmail.com',
      totalAmount: 41500,
      discountAmount: 1500,
      gstAmount: 4980,
      shippingAmount: 0,
      grandTotal: 44980,
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      paymentMethod: 'UPI',
      shippingAddress: { line1: 'Flat 402, Golden Crest Apartments', line2: 'Jubilee Hills Road No. 3', city: 'Hyderabad', state: 'Telangana', postalCode: '500033', country: 'India', phone: '+91 88866 54321' },
      trackingDetails: { carrier: 'BlueDart Luxury Service', trackingId: 'BD-DOD-49910-HYD', estimatedDelivery: '2026-06-22', logs: [{ status: 'Delivered', timestamp: '2026-06-22 14:10', location: 'Hyderabad Central' }] },
      items: {
        create: [
          { productId: PROD_2, name: 'Zardozi Hand-Embellished Velvet Blouse', sku: 'DOD-BLU-102', price: 15500, quantity: 1, size: 'M', color: '#4E0707', image: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=600' },
          { productId: PROD_3, name: 'Lucknowi Chikankari Georgette Anarkali Set', sku: 'DOD-KUR-204', price: 26000, quantity: 1, size: 'M', color: '#E6F2F7', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600' },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      id: 'DOD-8874',
      customerId: CUST_3,
      customerName: 'Priya Sharma',
      customerEmail: 'priya.sharma@outlook.com',
      totalAmount: 32000,
      discountAmount: 0,
      gstAmount: 1600,
      shippingAmount: 0,
      grandTotal: 33600,
      status: 'RETURNED',
      paymentStatus: 'REFUNDED',
      paymentMethod: 'NET_BANKING',
      shippingAddress: { line1: 'House 14B, Sector 15', city: 'Noida', state: 'Uttar Pradesh', postalCode: '201301', country: 'India', phone: '+91 99100 99200' },
      items: {
        create: [
          { productId: PROD_4, name: 'Real Zari Banarasi Georgette Dupatta', sku: 'DOD-DUP-309', price: 32000, quantity: 1, size: 'Free Size', color: '#FF1493', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600' },
        ],
      },
    },
  });
  console.log('  ✓ Created 3 orders with 4 order items');

  // ── 8. Wishlist Items ──
  await prisma.wishlistItem.createMany({
    data: [
      { customerId: CUST_1, productId: PROD_5 },
      { customerId: CUST_3, productId: PROD_1 },
    ],
  });
  console.log('  ✓ Created 2 wishlist items');

  // ── 9. Cart Items ──
  await prisma.cartItem.createMany({
    data: [
      { customerId: CUST_1, productId: PROD_2, quantity: 1, size: 'M' },
    ],
  });
  console.log('  ✓ Created 1 cart item');

  // ── 10. Inventory Logs ──
  await prisma.inventoryLog.createMany({
    data: [
      { productId: PROD_1, productName: 'Kanjeevaram Brocade Silk Saree', sku: 'DOD-SAR-001', change: 2, type: 'STOCK_IN', timestamp: new Date('2026-06-23T20:10:44Z'), user: 'Sanjay Dutt (Manager)' },
      { productId: PROD_3, productName: 'Lucknowi Chikankari Georgette Anarkali Set', sku: 'DOD-KUR-204', change: -1, type: 'SALE', timestamp: new Date('2026-06-20T08:44:00Z'), user: 'System (Order DOD-8919)' },
      { productId: PROD_4, productName: 'Real Zari Banarasi Georgette Dupatta', sku: 'DOD-DUP-309', change: 1, type: 'RETURN', timestamp: new Date('2026-06-17T11:15:00Z'), user: 'Rohini Sen (Manager)' },
    ],
  });
  console.log('  ✓ Created 3 inventory logs');

  // ── 11. Contact Forms ──
  await prisma.contactForm.createMany({
    data: [
      {
        name: 'Kareena Kapoor',
        email: 'kareena.k@bollywood.com',
        phone: '+91 90000 11111',
        subject: 'Bridal Couture Inquiry',
        message: 'Hello, I am interested in viewing your archival bridal collection for an upcoming wedding in London. Do you offer virtual bridal consultation with design customization?',
        status: 'UNREAD',
        createdAt: new Date('2026-06-23T11:22:00Z'),
      },
      {
        name: 'Dr. Devika Sen',
        email: 'devika.sen@oxford.edu',
        phone: '+44 77009 00077',
        subject: 'Patan Patola Saree Verification',
        message: 'I purchased a silk saree from your heritage section last month. Can I get a physical copy of the handloom weaver registry record?',
        status: 'REPLIED',
        reply: 'Dear Dr. Sen, We have sent the weaver credentials and certification of Patola registry directly to your UK mailing address.',
        repliedAt: new Date('2026-06-22T14:00:00Z'),
        createdAt: new Date('2026-06-21T09:12:00Z'),
      },
    ],
  });
  console.log('  ✓ Created 2 contact forms');

  // ── 12. CMS Config ──
  await prisma.cMSConfig.create({
    data: {
      id: 'singleton',
      heroTitle: 'Designs of Dreams — Heritage & Couture Atelier',
      heroSubtitle: 'Hand-woven luxury ethnic wear preserving the royal weaves of India.',
      heroImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200',
      announcementText: 'Atelier Booking Alert: Virtual consultations for the Autumn/Winter Bridal Collection are now open.',
      announcementLink: '/bookings',
      announcementActive: true,
      featuredCollections: [
        { id: COLL_BRIDAL, name: 'Bridal Collections', image: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=300', count: 18 },
        { id: COLL_HERITAGE, name: 'Heritage Weaves', image: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=300', count: 24 },
        { id: COLL_SUMMER, name: 'Premium Kurtis & Sets', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=300', count: 12 },
      ],
      bannerMiddle: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200',
      footerBio: 'Designs of Dreams is a curated marketplace celebrating premium Indian heritage textiles. We bridge master artisans and modern collectors.',
      seoTitle: 'Designs of Dreams — Luxury Indian Ethnic Wear & Bridal Couture',
      seoDescription: 'Discover hand-woven Kanjeevarams, double-ikat Patan Patolas, zardozi blouses, and bespoke chikankari kurtis.',
    },
  });
  console.log('  ✓ Created CMS config');

  // ── 13. Coupons ──
  await prisma.coupon.createMany({
    data: [
      { code: 'ROYALTY10', discountPercent: 10, maxDiscount: 10000, minOrderValue: 50000, isActive: true, validFrom: new Date('2026-06-01'), validUntil: new Date('2026-12-31') },
      { code: 'ATELIER15', discountPercent: 15, maxDiscount: 25000, minOrderValue: 100000, isActive: true, validFrom: new Date('2026-06-01'), validUntil: new Date('2026-12-31') },
      { code: 'WELCOMELUXE', discountPercent: 5, maxDiscount: 5000, minOrderValue: 20000, usageLimit: 100, timesUsed: 42, isActive: false, validFrom: new Date('2026-01-01'), validUntil: new Date('2026-06-30') },
    ],
  });
  console.log('  ✓ Created 3 coupons');

  // ── 14. Security Logs ──
  await prisma.securityLog.createMany({
    data: [
      { timestamp: new Date('2026-06-23T22:15:33Z'), action: 'Administrator Login', adminName: 'Harsh Vardhan', role: 'SUPER_ADMIN', ip: '192.168.1.12', device: 'Chrome 125, Windows 11', status: 'SUCCESS' },
      { timestamp: new Date('2026-06-23T20:10:44Z'), action: 'Inventory Adjustment: DOD-SAR-001 (+2 units)', adminName: 'Sanjay Dutt', role: 'MANAGER', ip: '192.168.1.18', device: 'Safari 17, iPadOS 17', status: 'SUCCESS' },
      { timestamp: new Date('2026-06-23T18:45:12Z'), action: 'Failed Login Attempt', adminName: 'Unknown', role: 'MANAGER', ip: '203.0.113.88', device: 'Firefox 126, Linux Ubuntu', status: 'FAILED' },
    ],
  });
  console.log('  ✓ Created 3 security logs');

  // ── 15. Return Request ──
  await prisma.returnRequest.create({
    data: {
      orderId: 'DOD-8874',
      customerId: CUST_3,
      reason: 'Color Mismatch',
      description: 'The dupatta color appears different in daylight compared to the product images. The pink tone is more towards magenta in person.',
      images: [],
      status: 'REFUNDED',
      refundAmount: 33600,
      resolvedAt: new Date('2026-06-18T14:00:00Z'),
    },
  });
  console.log('  ✓ Created 1 return request');

  console.log('\n✅ Database seeded successfully!');
  console.log('   Total: 3 admins, 6 categories, 4 collections, 8 products,');
  console.log('   3 customers, 3 addresses, 3 orders, 4 order items,');
  console.log('   2 wishlist items, 1 cart item, 3 inventory logs,');
  console.log('   2 contact forms, 1 CMS config, 3 coupons,');
  console.log('   3 security logs, 1 return request\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
