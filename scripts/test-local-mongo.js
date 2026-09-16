const { PrismaClient } = require('../packages/database/src/generated/prisma');

async function testLocal() {
  const url = process.argv[2] || 'mongodb://127.0.0.1:27017/dodshop?directConnection=true';
  console.log('Testing Prisma with URL:', url);
  
  const prisma = new PrismaClient({
    datasources: {
      db: { url }
    },
    log: ['error', 'warn']
  });

  try {
    await prisma.$connect();
    console.log('✅ Connected to MongoDB!');
    const users = await prisma.adminUser.findMany();
    console.log('Admin users count:', users.length);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLocal();
