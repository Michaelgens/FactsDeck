import type { SiteTool } from "./site-config";

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic subset that changes once per UTC day; same `contextKey` always picks the same order for that day. */
export function pickDailyTools(tools: SiteTool[], count: number, contextKey: string): SiteTool[] {
  if (tools.length <= count) return [...tools];
  const day = new Date().toISOString().slice(0, 10);
  const rng = mulberry32(hashString(`${day}:${contextKey}`));
  const indices = tools.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, count).map((i) => tools[i]!);
}

export function toolMatchesSearch(tool: SiteTool, raw: string): boolean {
  const q = raw.trim().toLowerCase();
  if (!q) return false;
  const hay = [tool.name, tool.tagline, tool.description, ...tool.searchTerms].join(" ").toLowerCase();
  if (hay.includes(q)) return true;
  const words = q.split(/\s+/).filter((w) => w.length >= 2);
  if (words.length === 0) return hay.includes(q);
  return words.every((w) => hay.includes(w));
}
