const { PrismaClient } = require('../packages/database/src/generated/prisma');

async function main() {
  console.log('Testing Prisma connection with DATABASE_URL...');
  console.log('DATABASE_URL starts with:', (process.env.DATABASE_URL || '').substring(0, 30));
  
  const prisma = new PrismaClient({
    log: ['error', 'warn']
  });

  try {
    await prisma.$connect();
    console.log('✅ Connected successfully to MongoDB!');
    
    // Test count on several models
    const adminCount = await prisma.adminUser.count();
    console.log('Admin users count:', adminCount);

    const prodCount = await prisma.product.count();
    console.log('Products count:', prodCount);

    const catCount = await prisma.category.count();
    console.log('Categories count:', catCount);

    const custCount = await prisma.customer.count();
    console.log('Customers count:', custCount);

    const orderCount = await prisma.order.count();
    console.log('Orders count:', orderCount);

  } catch (err) {
    console.error('❌ Connection or query failed:');
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
