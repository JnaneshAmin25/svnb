// One-off script: load .env.local into process.env, then run Prisma CLI.
// Keeps secrets out of the command line.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error(".env.local not found at", envPath);
  process.exit(2);
}

const text = fs.readFileSync(envPath, "utf8");
for (const line of text.split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue;
  const i = line.indexOf("=");
  if (i < 0) continue;
  let key = line.slice(0, i).trim();
  let value = line.slice(i + 1).trim();
  if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
  process.env[key] = value;
}

const args = process.argv.slice(2);
const pooledIndex = args.indexOf("--use-pooled-url");
if (pooledIndex >= 0) {
  args.splice(pooledIndex, 1);
  process.env.DATABASE_DIRECT_URL = process.env.DATABASE_URL;
}
const prismaCli = path.resolve(process.cwd(), "node_modules/prisma/build/index.js");
const result = spawnSync(process.execPath, [prismaCli, ...args], {
  stdio: "inherit",
  env: process.env,
});
process.exit(result.status ?? 0);
