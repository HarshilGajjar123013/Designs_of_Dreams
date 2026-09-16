const path = require('path');
const { execSync } = require('child_process');

// 1. Run Prisma generation on Vercel/Local
try {
  console.log('[POSTINSTALL] Generating Prisma client...');
  const schemaPath = path.resolve(__dirname, '..', 'packages', 'database', 'prisma', 'schema.prisma');
  execSync(`npx prisma generate --schema="${schemaPath}"`, { stdio: 'inherit' });
  console.log('[POSTINSTALL] Prisma client generated successfully.');
} catch (err) {
  console.warn('[POSTINSTALL] Warning: Prisma client generation failed/skipped (expected if engines are locked locally):', err.message);
}
