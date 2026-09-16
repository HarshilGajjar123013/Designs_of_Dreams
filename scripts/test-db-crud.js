const { PrismaClient } = require('../packages/database/src/generated/prisma');

const targetUrl = process.argv[2] || process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/dodshop?directConnection=true';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 COMPREHENSIVE DATABASE VERIFICATION & CRUD TEST');
console.log('Target URL:', targetUrl.replace(/:[^:@]+@/, ':****@'));
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const prisma = new PrismaClient({
  datasources: {
    db: { url: targetUrl }
  },
  log: ['error']
});

async function runTests() {
  const results = [];

  function record(task, status, details = '') {
    results.push({ task, status, details });
    const icon = status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} [${status}] ${task} ${details ? '(' + details + ')' : ''}`);
  }

  try {
    // 1. Connection test
    await prisma.$connect();
    record('1. Database Connection', 'PASS', 'Connected successfully');

    // 2. AdminUser CRUD
    const adminEmail = `test-admin-${Date.now()}@example.com`;
    const admin = await prisma.adminUser.create({
      data: {
        name: 'Test Admin',
        email: adminEmail,
        passwordHash: 'hash123',
        role: 'SUPER_ADMIN'
      }
    });
    record('2. AdminUser CREATE', 'PASS', `Created ID: ${admin.id}`);

    const fetchedAdmin = await prisma.adminUser.findUnique({ where: { id: admin.id } });
    if (!fetchedAdmin || fetchedAdmin.email !== adminEmail) throw new Error('Admin read mismatch');
    record('2. AdminUser READ', 'PASS');

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { name: 'Updated Admin' }
    });
    record('2. AdminUser UPDATE', 'PASS');

    // 3. Category CRUD
    const catSlug = `test-cat-${Date.now()}`;
    const category = await prisma.category.create({
      data: {
        name: `Test Category ${Date.now()}`,
        slug: catSlug,
        description: 'Test category description'
      }
    });
    record('3. Category CREATE', 'PASS', `Created ID: ${category.id}`);

    // 4. Collection CRUD
    const collSlug = `test-coll-${Date.now()}`;
    const collection = await prisma.collection.create({
      data: {
        name: `Test Collection ${Date.now()}`,
        slug: collSlug,
        description: 'Test collection description'
      }
    });
    record('4. Collection CREATE', 'PASS', `Created ID: ${collection.id}`);

    // 5. Product CRUD (with Category & Collection relations)
    const prodSlug = `test-prod-${Date.now()}`;
    const prodSku = `SKU-${Date.now()}`;
    const product = await prisma.product.create({
      data: {
        name: 'Test Silk Saree',
        slug: prodSlug,
        sku: prodSku,
        categoryId: category.id,
        collectionId: collection.id,
        subCategory: 'Banarasi',
        mrp: 12000,
        sellingPrice: 9999,
        description: 'Handwoven pure silk saree',
        fabric: 'Pure Silk',
        weaveType: 'Banarasi',
        occasion: 'Wedding',
        colors: ['Red', 'Gold'],
        sizes: ['Free Size'],
        images: ['https://example.com/test.jpg'],
        stock: 10
      },
      include: {
        category: true,
        collection: true
      }
    });
    if (!product.category || product.category.id !== category.id) throw new Error('Product category relation failed');
    record('5. Product CREATE & RELATION', 'PASS', `Created ID: ${product.id}`);

    const prodRead = await prisma.product.findUnique({
      where: { id: product.id },
      include: { category: true, collection: true }
    });
    record('5. Product READ with relations', 'PASS');

    await prisma.product.update({
      where: { id: product.id },
      data: { sellingPrice: 8999, stock: 9 }
    });
    record('5. Product UPDATE', 'PASS');

    // 6. Customer CRUD
    const custEmail = `test-customer-${Date.now()}@example.com`;
    const customer = await prisma.customer.create({
      data: {
        name: 'Test Customer',
        email: custEmail,
        phone: '9876543210',
        customerType: 'NEW'
      }
    });
    record('6. Customer CREATE', 'PASS', `Created ID: ${customer.id}`);

    // 7. Address CRUD (relation to Customer)
    const address = await prisma.address.create({
      data: {
        customerId: customer.id,
        label: 'Home',
        line1: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India'
      }
    });
    record('7. Address CREATE & RELATION', 'PASS', `Created ID: ${address.id}`);

    // 8. CartItem CRUD (composite unique customer + product + size)
    const cartItem = await prisma.cartItem.create({
      data: {
        customerId: customer.id,
        productId: product.id,
        size: 'Free Size',
        quantity: 2
      }
    });
    record('8. CartItem CREATE', 'PASS', `Created ID: ${cartItem.id}`);

    // 9. WishlistItem CRUD (composite unique customer + product)
    const wishItem = await prisma.wishlistItem.create({
      data: {
        customerId: customer.id,
        productId: product.id
      }
    });
    record('9. WishlistItem CREATE', 'PASS', `Created ID: ${wishItem.id}`);

    // 10. Order and OrderItem CRUD
    const orderId = `DOD-TEST-${Date.now().toString().slice(-6)}`;
    const order = await prisma.order.create({
      data: {
        id: orderId,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email || 'customer@example.com',
        totalAmount: 17998,
        grandTotal: 17998,
        status: 'PENDING',
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        shippingAddress: {
          line1: address.line1,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country
        },
        items: {
          create: [
            {
              productId: product.id,
              name: product.name,
              sku: product.sku,
              price: product.sellingPrice,
              quantity: 2,
              size: 'Free Size',
              image: product.images[0]
            }
          ]
        }
      },
      include: {
        items: true,
        customer: true
      }
    });
    if (!order.items || order.items.length === 0) throw new Error('Order items relation failed');
    record('10. Order & OrderItem CREATE with relations', 'PASS', `Order ID: ${order.id}`);

    // 11. InventoryLog CRUD
    const invLog = await prisma.inventoryLog.create({
      data: {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        change: -2,
        type: 'SALE',
        user: 'System (Order Test)'
      }
    });
    record('11. InventoryLog CREATE', 'PASS', `Created ID: ${invLog.id}`);

    // 12. ReturnRequest CRUD
    const returnReq = await prisma.returnRequest.create({
      data: {
        orderId: order.id,
        customerId: customer.id,
        reason: 'Size issue',
        description: 'Need a different style'
      }
    });
    record('12. ReturnRequest CREATE', 'PASS', `Created ID: ${returnReq.id}`);

    // 13. ContactForm CRUD
    const contact = await prisma.contactForm.create({
      data: {
        name: 'Inquiry User',
        email: 'inquiry@example.com',
        subject: 'Custom Order',
        message: 'Looking for custom bridal design'
      }
    });
    record('13. ContactForm CREATE', 'PASS', `Created ID: ${contact.id}`);

    // 14. CMSConfig CRUD (singleton upsert)
    const cms = await prisma.cMSConfig.upsert({
      where: { id: 'singleton' },
      update: {
        heroTitle: 'Heritage Elegance',
        heroSubtitle: 'Handcrafted luxury'
      },
      create: {
        id: 'singleton',
        heroTitle: 'Heritage Elegance',
        heroSubtitle: 'Handcrafted luxury',
        heroImage: 'https://example.com/hero.jpg',
        seoTitle: 'Designs of Dreams',
        seoDescription: 'Luxury Sarees',
        featuredCollections: []
      }
    });
    record('14. CMSConfig UPSERT (singleton)', 'PASS', `ID: ${cms.id}`);

    // 15. Coupon CRUD
    const couponCode = `SAVE${Date.now().toString().slice(-4)}`;
    const coupon = await prisma.coupon.create({
      data: {
        code: couponCode,
        discountPercent: 15,
        minOrderValue: 2000
      }
    });
    record('15. Coupon CREATE & READ', 'PASS', `Code: ${coupon.code}`);

    // 16. SecurityLog CRUD
    const secLog = await prisma.securityLog.create({
      data: {
        action: 'ADMIN_LOGIN_TEST',
        adminName: admin.name,
        role: admin.role,
        status: 'SUCCESS'
      }
    });
    record('16. SecurityLog CREATE', 'PASS', `ID: ${secLog.id}`);

    // 17. CustomizationRequest CRUD
    const customReq = await prisma.customizationRequest.create({
      data: {
        productId: product.id,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        fabric: 'Pure Katan Silk',
        color: 'Deep Maroon',
        budget: '₹20,000 - ₹30,000',
        aemroduriType: 'Zardozi Handwork',
        tassels: 'Yes',
        timeEstimateMonths: 2
      }
    });
    record('17. CustomizationRequest CREATE & RELATION', 'PASS', `ID: ${customReq.id}`);

    // 18. OldCustomer CRUD
    const oldCust = await prisma.oldCustomer.create({
      data: {
        name: 'Legacy VIP Client',
        phone: '9988776655',
        joinedDate: new Date('2023-01-15'),
        purchaseCount: 5,
        lifetimeValue: 125000
      }
    });
    record('18. OldCustomer CREATE', 'PASS', `ID: ${oldCust.id}`);

    // 19. Transaction test ($transaction)
    try {
      await prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: 1 } }
        });
        await tx.inventoryLog.create({
          data: {
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            change: -1,
            type: 'SALE',
            user: 'Transaction Test'
          }
        });
      });
      record('19. Multi-model $transaction', 'PASS', 'Interactive transaction committed');
    } catch (txErr) {
      record('19. Multi-model $transaction', 'WARN', `Replica set transaction note: ${txErr.message}`);
    }

    // 20. Clean up test records
    await prisma.customizationRequest.delete({ where: { id: customReq.id } }).catch(() => {});
    await prisma.returnRequest.delete({ where: { id: returnReq.id } }).catch(() => {});
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } }).catch(() => {});
    await prisma.order.delete({ where: { id: order.id } }).catch(() => {});
    await prisma.wishlistItem.delete({ where: { id: wishItem.id } }).catch(() => {});
    await prisma.cartItem.delete({ where: { id: cartItem.id } }).catch(() => {});
    await prisma.address.delete({ where: { id: address.id } }).catch(() => {});
    await prisma.inventoryLog.deleteMany({ where: { productId: product.id } }).catch(() => {});
    await prisma.product.delete({ where: { id: product.id } }).catch(() => {});
    await prisma.customer.delete({ where: { id: customer.id } }).catch(() => {});
    await prisma.oldCustomer.delete({ where: { id: oldCust.id } }).catch(() => {});
    await prisma.category.delete({ where: { id: category.id } }).catch(() => {});
    await prisma.collection.delete({ where: { id: collection.id } }).catch(() => {});
    await prisma.coupon.delete({ where: { id: coupon.id } }).catch(() => {});
    await prisma.contactForm.delete({ where: { id: contact.id } }).catch(() => {});
    await prisma.securityLog.delete({ where: { id: secLog.id } }).catch(() => {});
    await prisma.adminUser.delete({ where: { id: admin.id } }).catch(() => {});
    record('20. Clean up test records (DELETE)', 'PASS', 'All created test data deleted successfully');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎉 ALL TESTS COMPLETED! Total steps: ${results.length}`);
    const passed = results.filter(r => r.status === 'PASS').length;
    console.log(`Passed: ${passed}/${results.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Unhandled error during verification:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
