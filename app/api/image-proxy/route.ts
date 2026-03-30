import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isPrivateVercelBlobUrl(url: URL): boolean {
  return url.hostname.endsWith(".private.blob.vercel-storage.com");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const urlParam = searchParams.get("url");
  if (!urlParam) {
    return NextResponse.json({ error: "Missing url query param" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(urlParam);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  // Only proxy private blob images; everything else is passed through.
  if (!isPrivateVercelBlobUrl(target)) {
    return NextResponse.redirect(target.toString(), 302);
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Server env BLOB_READ_WRITE_TOKEN is required to fetch private blobs." },
      { status: 500 }
    );
  }

  try {
    const { get } = await import("@vercel/blob");
    const result = await get(target.toString(), { access: "private", useCache: false });

    if (result?.statusCode === 200 && result.stream) {
      const contentType =
        result.headers?.get("content-type") ||
        result.headers?.get("Content-Type") ||
        "application/octet-stream";
      const body = result.stream as ReadableStream<Uint8Array>;
      return new NextResponse(body, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          // Avoid caching private content at the CDN level.
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch image from private blob", statusCode: result?.statusCode },
      { status: result?.statusCode || 500 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: "Image proxy error", message: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

