import { prisma } from '@dod/database';
import bcrypt from 'bcryptjs';
import { generateRecoveryCode, hashRecoveryCode } from '../src/lib/recoveryCode';
import { randomUUID } from 'crypto';

async function seedAtoZ() {
  console.log('🚀 Seeding Complete A-to-Z Database on New MongoDB Atlas Cluster...\n');

  // Pre-generate stable UUIDs
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

  const CUST_HARSHIL_1 = randomUUID();
  const CUST_HARSHIL_2 = randomUUID();
  const CUST_SHIVAM = randomUUID();
  const CUST_AISHWARYA = randomUUID();
  const CUST_MEERA = randomUUID();
  const CUST_PRIYA = randomUUID();

  // Common password hashes
  const adminPasswordHash = await bcrypt.hash('khyati@dod', 10);
  const userPasswordHash = await bcrypt.hash('Password@2026', 10);

  // ── 1. Admin Users ──
  console.log('1. Creating Admin Operators...');
  await prisma.adminUser.createMany({
    data: [
      {
        id: randomUUID(),
        name: 'Khyati Maheta',
        email: 'dod@gmail.com',
        passwordHash: adminPasswordHash,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        lastLogin: new Date(),
      },
      {
        id: randomUUID(),
        name: 'Harshil Gajjar',
        email: 'harshil@dod.com',
        passwordHash: await bcrypt.hash('Admin@2026', 10),
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        lastLogin: new Date(),
      }
    ]
  });
  console.log('  ✓ Created 2 Admin accounts (dod@gmail.com, harshil@dod.com)');

  // ── 2. Categories ──
  console.log('2. Creating Luxury Handloom Categories...');
  await prisma.category.createMany({
    data: [
      { id: CAT_SAREES, name: 'Sarees', slug: 'sarees', description: 'Timeless drapes from India\'s finest looms — Banarasi, Kanjeevaram, Chanderi, and more.', sortOrder: 1, isActive: true },
      { id: CAT_KURTIS, name: 'Kurtis', slug: 'kurtis', description: 'Elegant ethnic tops from Lucknowi chikankari to contemporary silhouettes.', sortOrder: 2, isActive: true },
      { id: CAT_BLOUSES, name: 'Blouses', slug: 'blouses', description: 'Designer blouses with zardozi, velvet, brocade, and custom tailoring.', sortOrder: 3, isActive: true },
      { id: CAT_DUPATTAS, name: 'Dupattas', slug: 'dupattas', description: 'Handwoven and hand-embroidered drape accessories.', sortOrder: 4, isActive: true },
      { id: CAT_HERITAGE, name: 'Heritage Weaves', slug: 'heritage-weaves', description: 'Rare handloom treasures — Patola, Paithani, Pochampally and collector pieces.', sortOrder: 5, isActive: true },
      { id: CAT_BRIDAL, name: 'Bridal', slug: 'bridal', description: 'Curated bridal couture and trousseau collections.', sortOrder: 6, isActive: true },
    ]
  });
  console.log('  ✓ Created 6 Luxury Categories');

  // ── 3. Collections ──
  console.log('3. Creating Signature Collections...');
  await prisma.collection.createMany({
    data: [
      { id: COLL_BRIDAL, name: 'Bridal 2026', slug: 'bridal-2026', description: 'The complete bridal trousseau — from ceremony to cocktail.', season: 'Autumn/Winter 2026', startDate: new Date('2026-07-01'), endDate: new Date('2026-12-31'), isActive: true },
      { id: COLL_HERITAGE, name: 'Heritage Classics', slug: 'heritage-classics', description: 'Timeless handloom masterpieces celebrating India\'s weaving legacy.', season: 'Evergreen', isActive: true },
      { id: COLL_SUMMER, name: 'Summer Atelier', slug: 'summer-atelier', description: 'Lightweight breathable fabrics for the warm season.', season: 'Spring/Summer 2026', startDate: new Date('2026-03-01'), endDate: new Date('2026-08-31'), isActive: true },
      { id: COLL_FESTIVE, name: 'Festive Luxe', slug: 'festive-luxe', description: 'Celebrate with opulence — Diwali, Navratri, and festive special editions.', season: 'Festive 2026', startDate: new Date('2026-09-01'), endDate: new Date('2026-11-30'), isActive: true },
    ]
  });
  console.log('  ✓ Created 4 Collections');

  // ── 4. Products ──
  console.log('4. Creating Flagship Luxury Products...');
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
        stock: 6,
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
        stock: 2,
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
    ]
  });
  console.log('  ✓ Created 8 Flagship Products');

  // ── 5. Customers ──
  console.log('5. Creating Customer Accounts with Single-Use Recovery Codes...');
  const customerList = [
    { id: CUST_HARSHIL_1, name: 'Harshil Gajjar', email: 'harshilgajjar31@gmail.com', phone: '7874479943', notes: 'Master Atelier Patron' },
    { id: CUST_HARSHIL_2, name: 'Harshil Gajjar', email: 'harshilgajjar124@gmail.com', phone: '7383651680', notes: 'Atelier Patron' },
    { id: CUST_SHIVAM, name: 'Shivam Bari', email: 'shivambari853@gmail.com', phone: '4574963214', notes: 'Storefront Client' },
    { id: CUST_AISHWARYA, name: 'Aishwarya Roy', email: 'aishwarya.roy@luxury.in', phone: '+91 98200 12345', notes: 'Prefers red and gold Kanjeevarams.' },
    { id: CUST_MEERA, name: 'Meera Deshmukh', email: 'meera.deshmukh@gmail.com', phone: '+91 88866 54321', notes: 'Bridal client. Wedding Nov 2026.' },
    { id: CUST_PRIYA, name: 'Priya Sharma', email: 'priya.sharma@outlook.com', phone: '+91 99100 99200', notes: 'Regular buyer of fine silks.' },
  ];

  for (const c of customerList) {
    const { rawCode, normalized } = generateRecoveryCode();
    const recoveryCodeHash = await hashRecoveryCode(normalized);
    await prisma.customer.create({
      data: {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        passwordHash: userPasswordHash,
        avatar: c.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
        notes: c.notes,
        isVerified: true,
        customerType: 'NEW',
        recoveryCodeHash,
        recoveryCodeUsed: false,
        recoveryCodeCreatedAt: new Date(),
        recoveryAttempts: 0,
        joinedDate: new Date('2026-01-15'),
      }
    });
    console.log(`  ✓ Created customer: ${c.name} (${c.email}) [Recovery Code: ${rawCode}]`);
  }

  // ── 6. Addresses ──
  console.log('6. Creating Addresses...');
  await prisma.address.createMany({
    data: [
      { customerId: CUST_HARSHIL_1, label: 'Home', line1: 'Atelier House, B-404', line2: 'Science City Road', city: 'Ahmedabad', state: 'Gujarat', postalCode: '380060', phone: '7874479943', isDefault: true },
      { customerId: CUST_AISHWARYA, label: 'Home', line1: 'Bungalow 7, Malabar Hill', line2: 'Near Hanging Gardens', city: 'Mumbai', state: 'Maharashtra', postalCode: '400006', phone: '+91 98200 12345', isDefault: true },
      { customerId: CUST_MEERA, label: 'Home', line1: 'Flat 402, Golden Crest Apartments', line2: 'Jubilee Hills Road No. 3', city: 'Hyderabad', state: 'Telangana', postalCode: '500033', phone: '+91 88866 54321', isDefault: true },
      { customerId: CUST_PRIYA, label: 'Home', line1: 'House 14B, Sector 15', city: 'Noida', state: 'Uttar Pradesh', postalCode: '201301', phone: '+91 99100 99200', isDefault: true },
    ]
  });
  console.log('  ✓ Created 4 Addresses');

  // ── 7. Orders & Order Items ──
  console.log('7. Creating Live Orders...');
  await prisma.order.create({
    data: {
      id: 'DOD-8921',
      customerId: CUST_AISHWARYA,
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
      trackingDetails: { carrier: 'DHL Express Luxury Cargo', trackingId: 'DHL-DOD-9821-MUM', estimatedDelivery: '2026-11-05', logs: [{ status: 'Order accepted at Atelier', timestamp: '2026-10-24 10:15', location: 'Atelier Head Office, Delhi' }] },
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
      customerId: CUST_MEERA,
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
      trackingDetails: { carrier: 'BlueDart Luxury Service', trackingId: 'BD-DOD-49910-HYD', estimatedDelivery: '2026-10-20', logs: [{ status: 'Delivered', timestamp: '2026-10-20 14:10', location: 'Hyderabad Central' }] },
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
      customerId: CUST_PRIYA,
      customerName: 'Priya Sharma',
      customerEmail: 'priya.sharma@outlook.com',
      totalAmount: 32000,
      discountAmount: 0,
      gstAmount: 1600,
      shippingAmount: 0,
      grandTotal: 33600,
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      paymentMethod: 'NET_BANKING',
      shippingAddress: { line1: 'House 14B, Sector 15', city: 'Noida', state: 'Uttar Pradesh', postalCode: '201301', country: 'India', phone: '+91 99100 99200' },
      items: {
        create: [
          { productId: PROD_4, name: 'Real Zari Banarasi Georgette Dupatta', sku: 'DOD-DUP-309', price: 32000, quantity: 1, size: 'Free Size', color: '#FF1493', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600' },
        ],
      },
    },
  });
  console.log('  ✓ Created 3 Orders with 4 Order Items');

  // ── 8. Wishlist & Cart ──
  console.log('8. Creating Wishlist & Cart Items...');
  await prisma.wishlistItem.createMany({
    data: [
      { customerId: CUST_HARSHIL_1, productId: PROD_1 },
      { customerId: CUST_AISHWARYA, productId: PROD_5 },
    ]
  });
  await prisma.cartItem.createMany({
    data: [
      { customerId: CUST_HARSHIL_1, productId: PROD_2, quantity: 1, size: 'L' },
    ]
  });
  console.log('  ✓ Created Wishlist & Cart records');

  // ── 9. Coupons ──
  console.log('9. Creating Coupons...');
  await prisma.coupon.createMany({
    data: [
      { code: 'ROYALTY10', discountPercent: 10, maxDiscount: 10000, minOrderValue: 50000, isActive: true, validFrom: new Date('2026-01-01'), validUntil: new Date('2026-12-31') },
      { code: 'ATELIER15', discountPercent: 15, maxDiscount: 25000, minOrderValue: 100000, isActive: true, validFrom: new Date('2026-01-01'), validUntil: new Date('2026-12-31') },
      { code: 'FESTIVE2026', discountPercent: 20, maxDiscount: 20000, minOrderValue: 30000, isActive: true, validFrom: new Date('2026-09-01'), validUntil: new Date('2026-12-31') },
      { code: 'WELCOMELUXE', discountPercent: 5, maxDiscount: 5000, minOrderValue: 20000, usageLimit: 100, timesUsed: 12, isActive: true, validFrom: new Date('2026-01-01'), validUntil: new Date('2026-12-31') },
    ]
  });
  console.log('  ✓ Created 4 Luxury Coupons');

  // ── 10. CMS Config ──
  console.log('10. Creating CMS Config...');
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
    }
  });
  console.log('  ✓ Created CMS Configuration');

  // ── 11. Cost Calculations ──
  console.log('11. Creating Cost Calculations...');
  await prisma.costCalculation.createMany({
    data: [
      {
        id: randomUUID(),
        productName: 'Kanjeevaram Brocade Silk Saree',
        quantity: 10,
        fabricCost: 35000,
        threadCost: 4500,
        materialCost: 6000,
        printingCost: 0,
        labourCost: 18000,
        otherCost: 3500,
        totalCost: 67000,
        costPerPiece: 6700,
        sellingPrice: 12500,
        profitPerPiece: 5800,
        totalProfit: 58000,
      },
      {
        id: randomUUID(),
        productName: 'Zardozi Handwork Velvet Blouse',
        quantity: 25,
        fabricCost: 15000,
        threadCost: 2500,
        materialCost: 8500,
        printingCost: 1200,
        labourCost: 16000,
        otherCost: 2000,
        totalCost: 45200,
        costPerPiece: 1808,
        sellingPrice: 3200,
        profitPerPiece: 1392,
        totalProfit: 34800,
      },
      {
        id: randomUUID(),
        productName: 'Lucknowi Chikankari Anarkali Set',
        quantity: 15,
        fabricCost: 18000,
        threadCost: 3000,
        materialCost: 4500,
        printingCost: 0,
        labourCost: 21000,
        otherCost: 2500,
        totalCost: 49000,
        costPerPiece: 3266,
        sellingPrice: 6500,
        profitPerPiece: 3234,
        totalProfit: 48510,
      }
    ]
  });
  console.log('  ✓ Created 3 Cost Calculations');

  // ── 12. Auth Page Images (12 Login + 12 Signup) ──
  console.log('12. Creating 24 Auth Collage Images...');
  const authImages: any[] = [];
  const baseImgUrls = [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=400&q=80',
  ];

  for (let i = 1; i <= 12; i++) {
    authImages.push({
      id: `auth-login-slot-${i}`,
      pageType: 'login',
      slotNumber: i,
      displayOrder: i,
      imageUrl: baseImgUrls[(i - 1) % baseImgUrls.length],
      isActive: true,
      title: `Login Collage ${i}`
    });
    authImages.push({
      id: `auth-signup-slot-${i}`,
      pageType: 'signup',
      slotNumber: i,
      displayOrder: i,
      imageUrl: baseImgUrls[(i + 2) % baseImgUrls.length],
      isActive: true,
      title: `Sign Up Collage ${i}`
    });
  }
  await prisma.authPageImage.createMany({ data: authImages });
  console.log('  ✓ Created 24 Auth Collage Images');

  // ── 13. Customization Requests ──
  console.log('13. Creating Customization Inquiries...');
  await prisma.customizationRequest.createMany({
    data: [
      {
        id: randomUUID(),
        productId: PROD_1,
        customerId: CUST_HARSHIL_1,
        customerName: 'Harshil Gajjar',
        customerEmail: 'harshilgajjar31@gmail.com',
        customerPhone: '7874479943',
        fabric: 'Mulberry Katan Silk',
        color: 'Deep Wine & Antique Gold',
        budget: '₹95,000 - ₹1,20,000',
        aemroduriType: 'Pure Silver Zari Kadwa',
        tassels: 'Yes',
        timeEstimateMonths: 2,
        notes: 'Requested custom temple border weaving with custom initials on the pallu.',
        status: 'IN_REVIEW'
      },
      {
        id: randomUUID(),
        productId: PROD_2,
        customerId: CUST_MEERA,
        customerName: 'Meera Deshmukh',
        customerEmail: 'meera.deshmukh@gmail.com',
        customerPhone: '+91 88866 54321',
        fabric: 'Royal Micro Velvet',
        color: 'Crimson Red',
        budget: '₹20,000 - ₹25,000',
        aemroduriType: 'Hand Zardozi with Dabka',
        tassels: 'Yes',
        timeEstimateMonths: 1,
        notes: 'Deep back cutout with customized handmade latkans.',
        status: 'APPROVED'
      }
    ]
  });
  console.log('  ✓ Created 2 Customization Requests');

  // ── 14. Contact Forms & Inventory Logs ──
  console.log('14. Creating Inquiries & Logs...');
  await prisma.contactForm.createMany({
    data: [
      {
        name: 'Kareena Kapoor',
        email: 'kareena.k@bollywood.com',
        phone: '+91 90000 11111',
        subject: 'Bridal Couture Inquiry',
        message: 'Hello, I am interested in viewing your archival bridal collection for an upcoming wedding in London. Do you offer virtual bridal consultation with design customization?',
        status: 'UNREAD',
      },
      {
        name: 'Dr. Devika Sen',
        email: 'devika.sen@oxford.edu',
        phone: '+44 77009 00077',
        subject: 'Patan Patola Saree Verification',
        message: 'I purchased a silk saree from your heritage section last month. Can I get a physical copy of the handloom weaver registry record?',
        status: 'REPLIED',
        reply: 'Dear Dr. Sen, We have sent the weaver credentials and certification of Patola registry directly to your UK mailing address.',
        repliedAt: new Date(),
      }
    ]
  });

  await prisma.inventoryLog.createMany({
    data: [
      { productId: PROD_1, productName: 'Kanjeevaram Brocade Silk Saree', sku: 'DOD-SAR-001', change: 8, type: 'STOCK_IN', user: 'Harshil Gajjar (Super Admin)' },
      { productId: PROD_6, productName: 'Royal Katan Silk Banarasi Saree', sku: 'DOD-SAR-006', change: 15, type: 'STOCK_IN', user: 'Harshil Gajjar (Super Admin)' },
      { productId: PROD_2, productName: 'Zardozi Hand-Embellished Velvet Blouse', sku: 'DOD-BLU-102', change: 12, type: 'STOCK_IN', user: 'Harshil Gajjar (Super Admin)' },
    ]
  });

  await prisma.securityLog.createMany({
    data: [
      { timestamp: new Date(), action: 'Cluster Migration & Database Provisioning', adminName: 'Harshil Gajjar', role: 'SUPER_ADMIN', ip: '127.0.0.1', device: 'Atelier Console', status: 'SUCCESS' },
    ]
  });
  console.log('  ✓ Created Inquiries, Inventory Logs & Security Audit records');

  // ── Final Verification Summary ──
  const counts = {
    adminUsers: await prisma.adminUser.count(),
    categories: await prisma.category.count(),
    collections: await prisma.collection.count(),
    products: await prisma.product.count(),
    customers: await prisma.customer.count(),
    addresses: await prisma.address.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
    coupons: await prisma.coupon.count(),
    cmsConfig: await prisma.cMSConfig.count(),
    costCalculations: await prisma.costCalculation.count(),
    authPageImages: await prisma.authPageImage.count(),
    customizationRequests: await prisma.customizationRequest.count(),
    contactForms: await prisma.contactForm.count(),
    inventoryLogs: await prisma.inventoryLog.count(),
    securityLogs: await prisma.securityLog.count(),
  };

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🎉 NEW MONGODB ATLAS CLUSTER IS 100% COMPLETE FROM A TO Z!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(JSON.stringify(counts, null, 2));

  await prisma.$disconnect();
}

seedAtoZ().catch(err => {
  console.error('❌ Failed to seed new database:', err);
  process.exit(1);
});
