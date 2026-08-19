import { PrismaClient } from '@prisma/client';
import net from 'net';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

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

export async function isDbReachable(): Promise<boolean> {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return true;
  }

  // In development or local runs, still verify reachability even when DATABASE_URL is configured.
  // This allows the app to fall back to the local JSON database when the remote service is down.
  const now = Date.now();
  // Cache the status for 5 seconds to prevent spamming TCP connections
  if (cachedReachable !== null && now - lastChecked < 5000) {
    return cachedReachable;
  }

  cachedReachable = await new Promise<boolean>((resolve) => {
    const urlStr = process.env.DATABASE_URL;
    let host = 'localhost';
    let port = 5432;

    if (urlStr) {
      try {
        const parsed = new URL(urlStr);
        host = parsed.hostname;
        if (parsed.port) {
          port = parseInt(parsed.port, 10);
        }
      } catch (e) {
        // ignore
      }
    }

    let resolved = false;
    const socket = new net.Socket();
    
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(false);
      }
    }, 800);

    socket.connect(port, host, () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        socket.destroy();
        resolve(true);
      }
    });

    socket.on('error', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        socket.destroy();
        resolve(false);
      }
    });
  });

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
          throw new Error('Database is offline (TCP reachability check failed)');
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
                throw new Error('Database is offline (TCP reachability check failed)');
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
