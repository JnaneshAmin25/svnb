import Redis from "ioredis";
import { env } from "@/lib/env";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!env.REDIS_URL) return null;
  if (redis) return redis;

  redis = new Redis(env.REDIS_URL, {
    password: env.REDIS_TOKEN || undefined,
    lazyConnect: true,
    maxRetriesPerRequest: 2,
  });

  return redis;
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const client = getRedis();
  if (!client) {
    return { allowed: true, remaining: limit - 1 };
  }

  const fullKey = `svnb:rl:${key}`;
  const txn = client.multi();
  txn.incr(fullKey);
  txn.ttl(fullKey);
  const values = await txn.exec();

  const count = Number(values?.[0]?.[1] || 0);
  const ttl = Number(values?.[1]?.[1] || -1);

  if (ttl < 0) {
    await client.expire(fullKey, windowSeconds);
  }

  const allowed = count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - count),
  };
}
