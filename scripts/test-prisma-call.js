require('dotenv').config();
const { prisma } = require('../packages/database/src');

async function test() {
  console.log('Testing prisma.product.findMany()...');
  try {
    const res = await prisma.product.findMany();
    console.log('Returned successfully! Count:', res.length);
  } catch (err) {
    console.log('Threw error:', err.message);
  }
}
test();
