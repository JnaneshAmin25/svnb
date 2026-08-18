// One-off test script: verifies the same ioredis connection the app uses.
// Run with:  node scripts/test-redis.mjs
import Redis from "ioredis";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const envPath = path.join(root, ".env.local");
if (!fs.existsSync(envPath)) {
  console.error(".env.local not found at", envPath);
  process.exit(2);
}
const envText = fs.readFileSync(envPath, "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const idx = line.indexOf("=");
      let key = line.slice(0, idx).trim();
      let value = line.slice(idx + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      return [key, value];
    }),
);

const url = env.REDIS_URL;
const token = env.REDIS_TOKEN;
if (!url) {
  console.error("REDIS_URL is empty in .env.local");
  process.exit(2);
}
console.log("URL scheme:", url.split("://")[0]);
console.log("Host:", new URL(url).host);

const client = new Redis(url, {
  password: token || undefined,
  lazyConnect: true,
  maxRetriesPerRequest: 2,
  connectTimeout: 5000,
  tls: url.startsWith("rediss://") ? { rejectUnauthorized: true } : undefined,
});

const startedAt = Date.now();
try {
  console.log("Connecting...");
  await client.connect();
  console.log("Connected in", Date.now() - startedAt, "ms");

  const pong = await client.ping();
  console.log("PING ->", pong);

  const setKey = "svnb:test:hello";
  await client.set(setKey, JSON.stringify({ at: Date.now() }), "EX", 30);
  console.log("SET", setKey, "OK");

  const got = await client.get(setKey);
  console.log("GET", setKey, "->", got);

  const ttl = await client.ttl(setKey);
  console.log("TTL", setKey, "->", ttl, "s");

  await client.del(setKey);
  console.log("DEL", setKey, "OK");

  const info = await client.info("server");
  const version = info.split("\n").find((l) => l.startsWith("redis_version:"));
  console.log("Server:", version?.trim());

  console.log("\nRESULT: Redis connection is working.");
  process.exitCode = 0;
} catch (err) {
  console.error("\nRESULT: Redis connection FAILED.");
  console.error("Error name:", err?.name);
  console.error("Error code:", err?.code);
  console.error("Error message:", err?.message);
  if (err?.cause) console.error("Cause:", err.cause);
  process.exitCode = 1;
} finally {
  client.disconnect();
}
