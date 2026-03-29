import { NextResponse } from "next/server";
import {
  buildMortgageSummaryHtml,
  buildMortgageSummaryPlainText,
  validateMortgageSummaryPayload,
  type MortgageSummaryPayload,
} from "../../../lib/mortgage-summary-email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function sendViaResend(
  key: string,
  to: string,
  subject: string,
  text: string,
  html: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    "Facts Deck <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[mortgage-summary] Resend error:", res.status, detail);
    return { ok: false, message: "Could not send email. Try again later." };
  }

  return { ok: true };
}

async function forwardToBackend(
  email: string,
  summary: MortgageSummaryPayload,
  text: string,
  html: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const backendUrl = process.env.FACTSDECK_BACKEND_URL?.replace(/\/$/, "");
  if (!backendUrl) return { ok: false, message: "Email delivery is not configured." };

  const secret = process.env.MORTGAGE_SUMMARY_EMAIL_SECRET?.trim();
  try {
    const res = await fetch(`${backendUrl}/api/mortgage-summary-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-mortgage-summary-secret": secret } : {}),
      },
      body: JSON.stringify({ email, summary, text, html }),
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[mortgage-summary] Backend error:", res.status, detail);
      return { ok: false, message: "Could not send email. Try again later." };
    }
    return { ok: true };
  } catch (e) {
    console.error("[mortgage-summary]", e instanceof Error ? e.message : e);
    return { ok: false, message: "Could not send email. Try again later." };
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;

  if (typeof o.website === "string" && o.website.length > 0) {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const emailRaw = typeof o.email === "string" ? o.email.trim().toLowerCase() : "";
  if (!emailRaw || emailRaw.length > 254 || !EMAIL_RE.test(emailRaw)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }

  const validated = validateMortgageSummaryPayload(o.summary);
  if (!validated.ok) {
    return NextResponse.json({ ok: false, error: validated.error }, { status: 400 });
  }

  const { summary } = validated;
  const subject = "Your mortgage calculation summary — Facts Deck";
  const text = buildMortgageSummaryPlainText(summary);
  const html = buildMortgageSummaryHtml(summary);

  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    const sent = await sendViaResend(resendKey, emailRaw, subject, text, html);
    if (!sent.ok) {
      return NextResponse.json({ ok: false, error: sent.message }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  }

  const forwarded = await forwardToBackend(emailRaw, summary, text, html);
  if (!forwarded.ok) {
    const status = forwarded.message === "Email delivery is not configured." ? 503 : 502;
    return NextResponse.json({ ok: false, error: forwarded.message }, { status });
  }

  return NextResponse.json({ ok: true });
}
