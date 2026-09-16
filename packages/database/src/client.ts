import { PrismaClient } from './generated/prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.trim();
}

const rawPrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = rawPrisma;
}

let cachedReachable: boolean | null = null;
let lastChecked = 0;
const CONNECTION_CHECK_TIMEOUT_MS = 5_000;

export async function isDbReachable(): Promise<boolean> {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return true;
  }

  const now = Date.now();
  // Cache the status for 5 seconds to prevent repeated connection attempts.
  if (cachedReachable !== null && now - lastChecked < 5000) {
    return cachedReachable;
  }

  try {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        rawPrisma.adminUser.findFirst({ select: { id: true } }),
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error('MongoDB connection check timed out')),
            3000,
          );
        }),
      ]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
    cachedReachable = true;
  } catch {
    cachedReachable = false;
  }

  lastChecked = Date.now();
  return cachedReachable;
}

// Create a Proxy that intercepts all method calls on prisma and its model operations
export const prisma = new Proxy(rawPrisma, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);

    // If it's a direct method on Prisma Client ($transaction, $connect, etc.)
    if (typeof value === 'function') {
      return async function (...args: any[]) {
        const reachable = await isDbReachable();
        if (!reachable) {
          throw new Error('Database is offline (MongoDB connection check failed)');
        }
        return value.apply(target, args);
      };
    }

    // If it's a model instance (like prisma.product, prisma.order, etc.)
    if (value && typeof value === 'object') {
      // Prevent proxying internal Promises or symbols
      if (prop === 'then' || typeof prop === 'symbol') {
        return value;
      }
      return new Proxy(value, {
        get(modelTarget, modelProp, modelReceiver) {
          const modelValue = Reflect.get(modelTarget, modelProp, modelReceiver);
          
          if (typeof modelValue === 'function') {
            return async function (...args: any[]) {
              const reachable = await isDbReachable();
              if (!reachable) {
                throw new Error('Database is offline (MongoDB connection check failed)');
              }
              return modelValue.apply(modelTarget, args);
            };
          }
          return modelValue;
        }
      });
    }

    return value;
  }
}) as typeof rawPrisma;
