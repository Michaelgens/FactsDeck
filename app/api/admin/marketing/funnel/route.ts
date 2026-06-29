import { NextRequest, NextResponse } from "next/server";
import {
  loadEmailFunnelPageData,
  parseEmailFunnelSearchParams,
} from "../../../../lib/email-funnel-page-data";
import { createAuthServerClient } from "../../../../lib/supabase/auth-server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function GET(request: NextRequest) {
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

  const raw = Object.fromEntries(request.nextUrl.searchParams.entries());
  const params = parseEmailFunnelSearchParams(raw);
  const data = await loadEmailFunnelPageData(params);

  return NextResponse.json(data);
}
