// Server-side storage for the "open to opportunities" flag.
// Uses Upstash Redis when UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are set (needed on Vercel),
// otherwise a local JSON file (fine for `npm run dev` and self-hosting).
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const KEY = "open_to_opportunities";
const FILE = path.join(process.cwd(), "data", "status.json");
const DEFAULT_OPEN = true;

function upstash() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, headers: { Authorization: `Bearer ${token}` } } : null;
}

export async function readOpen(): Promise<boolean> {
  const redis = upstash();
  if (redis) {
    const res = await fetch(`${redis.url}/get/${KEY}`, { headers: redis.headers, cache: "no-store" });
    const { result } = (await res.json()) as { result: string | null };
    return result === null ? DEFAULT_OPEN : result === "1";
  }
  try {
    const data = JSON.parse(await readFile(FILE, "utf8")) as { open?: boolean };
    return data.open ?? DEFAULT_OPEN;
  } catch {
    return DEFAULT_OPEN;
  }
}

export async function writeOpen(open: boolean) {
  const redis = upstash();
  if (redis) {
    await fetch(`${redis.url}/set/${KEY}/${open ? 1 : 0}`, { method: "POST", headers: redis.headers });
    return;
  }
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify({ open }, null, 2));
}
