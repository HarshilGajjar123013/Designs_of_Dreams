import { SignJWT } from 'jose';

async function testDashboardApi() {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dod-atelier-admin-jwt-secret-change-in-production-2026');
  const token = await new SignJWT({
    id: 'test-super-admin',
    name: 'Super Admin',
    email: 'admin@dod.com',
    role: 'SUPER_ADMIN'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(secret);

  console.log('Testing GET http://localhost:3002/api/products with token...');
  const getRes = await fetch('http://localhost:3002/api/products', {
    headers: {
      Cookie: `dod-admin-token=${token}`
    }
  });

  console.log('GET status:', getRes.status);
  const getData = await getRes.json();
  console.log('GET products count:', getData.products?.length);
  if (getData.products?.length > 0) {
    console.log('First product:', getData.products[0].name, '(SKU:', getData.products[0].sku, ')');
  }

  // Test POST creation
  const testSku = `TEST-${Date.now().toString().slice(-4)}`;
  console.log(`\nTesting POST create product with SKU ${testSku}...`);
  const postRes = await fetch('http://localhost:3002/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `dod-admin-token=${token}`
    },
    body: JSON.stringify({
      name: `Automated Test Silk Saree ${testSku}`,
      sku: testSku,
      categoryId: getData.products?.[0]?.categoryId || 'cat-sarees',
      mrp: 15000,
      sellingPrice: 12000,
      description: 'Handcrafted luxury pure silk saree with zari border'
    })
  });

  console.log('POST status:', postRes.status);
  const postData = await postRes.json();
  console.log('POST response:', postData.success ? 'Success! Product ID: ' + (postData.product?.id || postData.id) : postData);
}

testDashboardApi().catch(console.error);
