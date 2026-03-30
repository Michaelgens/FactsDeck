/**
 * Private Vercel Blob URLs require auth (403 without token).
 * We route those through `/api/image-proxy` which adds `BLOB_READ_WRITE_TOKEN` server-side.
 */

export function proxiedImageSrc(src: string | null | undefined): string {
  if (!src) return "";
  if (src.includes("private.blob.vercel-storage.com")) {
    return `/api/image-proxy?url=${encodeURIComponent(src)}`;
  }
  return src;
}

