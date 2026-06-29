import { NextRequest, NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/app/lib/supabase/server";
import { logEmailEvent } from "@/app/lib/email-funnel-actions";
import { isValidFunnelType, type EmailFunnelType } from "@/app/lib/email-funnel-types";

/**
 * Mailbox bounce webhook — call from your ESP when a message hard-bounces.
 * Body: { email, emailType?: "welcome", sendId?: string, reason?: string }
 */
export async function POST(req: NextRequest) {
  const secret = process.env.BOUNCE_WEBHOOK_SECRET?.trim();
  if (secret) {
    const provided = req.headers.get("x-bounce-webhook-secret") || "";
    if (provided !== secret) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 503 });
  }

  let body: { email?: string; emailType?: string; sendId?: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ ok: false, error: "Missing email" }, { status: 400 });
  }

  const emailType = (body.emailType && isValidFunnelType(body.emailType)
    ? body.emailType
    : "welcome") as EmailFunnelType;

  const supabase = createServerClient();
  let sendId = body.sendId;

  if (!sendId) {
    const { data: rows } = await supabase
      .from("email_sends")
      .select("id")
      .eq("recipient_email", email)
      .eq("status", "sent")
      .order("sent_at", { ascending: false })
      .limit(1);
    sendId = rows?.[0]?.id;
  }

  if (sendId) {
    await supabase
      .from("email_sends")
      .update({ status: "bounced", failed_reason: body.reason || "Hard bounce" })
      .eq("id", sendId);
  }

  await logEmailEvent({
    sendId,
    emailType,
    eventType: "bounce",
    recipientEmail: email,
  });

  return NextResponse.json({ ok: true });
}
