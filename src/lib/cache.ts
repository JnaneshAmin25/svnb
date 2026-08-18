import { env } from "@/lib/env";
import Redis from "ioredis";

const CACHE_PREFIX = "svnb:cache:";

type CacheValue<T> = {
  value: T;
  expiresAt: number;
};

const memory = new Map<string, CacheValue<unknown>>();
let redis: Redis | null = null;

function getRedisClient(): Redis | null {
  if (!env.REDIS_URL) return null;
  if (redis) return redis;

  redis = new Redis(env.REDIS_URL, {
    password: env.REDIS_TOKEN || undefined,
    lazyConnect: true,
    maxRetriesPerRequest: 2,
  });
  return redis;
}

export async function getCachedJSON<T>(key: string): Promise<T | null> {
  const now = Date.now();
  const cacheKey = `${CACHE_PREFIX}${key}`;
  const memoryHit = memory.get(cacheKey);
  if (memoryHit && memoryHit.expiresAt > now) {
    return memoryHit.value as T;
  }
  if (memoryHit) {
    memory.delete(cacheKey);
  }

  const client = getRedisClient();
  if (!client) return null;

  const raw = await client.get(cacheKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CacheValue<T>;
    if (parsed.expiresAt < Date.now()) {
      await client.del(cacheKey);
      return null;
    }

    return parsed.value;
  } catch {
    await client.del(cacheKey);
    return null;
  }
}

export async function setCachedJSON<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  const cacheKey = `${CACHE_PREFIX}${key}`;
  memory.set(cacheKey, { value, expiresAt });

  const client = getRedisClient();
  if (!client) return;

  await client.set(
    cacheKey,
    JSON.stringify({ value, expiresAt }),
    "EX",
    ttlSeconds,
  );
}

export async function invalidateCache(prefix: string): Promise<void> {
  const client = getRedisClient();
  if (client) {
    const stream = client.scanStream({ match: `${CACHE_PREFIX}${prefix}*` });
    for await (const keys of stream) {
      if (keys.length > 0) await client.del(...keys);
    }
  }

  for (const key of [...memory.keys()]) {
    if (key.startsWith(`${CACHE_PREFIX}${prefix}`)) {
      memory.delete(key);
    }
  }
}
