import type { Post, PostSummary } from "./types";

/** Public article path: prefers SEO slug, falls back to id for legacy rows. */
export function postPublicPath(p: { id: string; slug?: string | null }): string {
  const s = p.slug?.trim();
  if (s) return `/post/${encodeURIComponent(s)}`;
  return `/post/${p.id}`;
}

export type PostLinkProps = Post | PostSummary;
