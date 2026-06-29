/** Simple in-memory rate limiting for public poll/quiz server actions. */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const MAX_EVENTS_PER_MINUTE = 40;

export function checkEngagementRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= MAX_EVENTS_PER_MINUTE) return false;
  entry.count += 1;
  return true;
}

export function engagementClientKey(
  ip: string,
  postId: string,
  action: string
): string {
  const normalizedIp = ip.trim() || "unknown";
  return `${normalizedIp}:${postId}:${action}`;
}

export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
