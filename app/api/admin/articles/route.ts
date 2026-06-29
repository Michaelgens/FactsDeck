import { NextResponse } from "next/server";
import { getAllPostsWithLoadError } from "../../../lib/posts";
import { computeArticleListStats } from "../../../lib/article-list-stats";
import { createAuthServerClient } from "../../../lib/supabase/auth-server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function GET() {
  const supabase = await createAuthServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (ADMIN_EMAILS.length > 0) {
    const email = session.user.email?.toLowerCase();
    if (!email || !ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const { posts, loadError } = await getAllPostsWithLoadError();
  return NextResponse.json({ posts, loadError, stats: computeArticleListStats(posts) });
}
