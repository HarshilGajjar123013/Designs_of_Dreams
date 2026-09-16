// Quick MongoDB / Prisma connectivity test
const { PrismaClient } = require('../packages/database/src/generated/prisma');

async function main() {
  const p = new PrismaClient({ log: ['error'] });
  try {
    console.log('Attempting Prisma $connect to MongoDB Atlas...');
    await p.$connect();
    console.log('✅ Prisma connected successfully!');

    // List products
    const products = await p.product.findMany({ take: 5 });
    console.log(`Products in DB: ${products.length}`);
    products.forEach(pr => console.log(`  - ${pr.name} (SKU: ${pr.sku})`));

    // List categories
    const categories = await p.category.findMany();
    console.log(`\nCategories in DB: ${categories.length}`);
    categories.forEach(c => console.log(`  - ${c.name} (${c.slug})`));

    // List collections
    const collections = await p.collection.findMany();
    console.log(`\nCollections in DB: ${collections.length}`);
    collections.forEach(c => console.log(`  - ${c.name} (${c.slug})`));

    // List orders
    const orders = await p.order.findMany({ take: 5 });
    console.log(`\nOrders in DB: ${orders.length}`);
    orders.forEach(o => console.log(`  - ${o.orderNumber} (${o.status})`));

    // List admin users
    const admins = await p.adminUser.findMany();
    console.log(`\nAdmin users: ${admins.length}`);
    admins.forEach(a => console.log(`  - ${a.name} (${a.email}) [${a.role}]`));

    // List customers
    const customers = await p.customer.findMany({ take: 5 });
    console.log(`\nCustomers: ${customers.length}`);
    customers.forEach(c => console.log(`  - ${c.name} (${c.email})`));

    await p.$disconnect();
    console.log('\n✅ All queries completed successfully. Database is functional.');
  } catch (err) {
    console.error('❌ Database error:', err.message);
    await p.$disconnect().catch(() => {});
    process.exit(1);
  }
}

main();
