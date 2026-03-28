/** Canonical site origin for metadata, canonical URLs, and JSON-LD. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://factsdeck.com";

/** Resolve relative paths (e.g. /foo.jpg) to absolute URLs for Open Graph and schema.org. */
export function absoluteUrl(href: string): string {
  if (!href) return SITE_URL;
  if (/^https?:\/\//i.test(href)) return href;
  const base = SITE_URL.replace(/\/$/, "");
  const path = href.startsWith("/") ? href : `/${href}`;
  return `${base}${path}`;
}
