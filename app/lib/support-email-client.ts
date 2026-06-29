"use server";

function backendConfig(): { url: string; secret: string | undefined } {
  const url =
    process.env.FACTSDECK_BACKEND_URL?.replace(/\/$/, "") ||
    (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "");
  const secret = process.env.WELCOME_EMAIL_SECRET?.trim() || process.env.EMAIL_API_SECRET?.trim();
  return { url, secret };
}

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "")
  );
}

export async function notifySupportTicketCreated(payload: {
  email: string;
  name: string;
  ticketNumber: string;
  subject: string;
  department: string;
  priority: string;
  message: string;
  departmentInbox: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { url, secret } = backendConfig();
  if (!url) {
    console.warn("[support-email] FACTSDECK_BACKEND_URL not set — skipping emails");
    return { ok: false, error: "Email service not configured" };
  }

  try {
    const res = await fetch(`${url}/api/support/notify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-email-api-secret": secret } : {}),
      },
      body: JSON.stringify({ ...payload, siteUrl: siteUrl() }),
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[support-email] notify failed:", res.status, detail);
      return { ok: false, error: "Could not send confirmation email" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[support-email] notify error:", err);
    return { ok: false, error: "Email service unreachable" };
  }
}

export async function sendSupportReplyEmail(payload: {
  email: string;
  name: string;
  ticketNumber: string;
  subject: string;
  body: string;
  adminName: string;
  adminEmail: string;
}): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const { url, secret } = backendConfig();
  if (!url) return { ok: false, error: "Email service not configured" };

  try {
    const res = await fetch(`${url}/api/emails/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-email-api-secret": secret } : {}),
      },
      body: JSON.stringify({
        type: "support-reply",
        email: payload.email,
        siteUrl: siteUrl(),
        data: payload,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });

    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      messageId?: string;
    };

    if (!res.ok || !json.ok) {
      return { ok: false, error: json.error ?? "Failed to send reply email" };
    }
    return { ok: true, messageId: json.messageId };
  } catch (err) {
    console.error("[support-email] reply error:", err);
    return { ok: false, error: "Email service unreachable" };
  }
}

export async function previewSupportReplyEmail(payload: {
  email: string;
  name: string;
  ticketNumber: string;
  subject: string;
  body: string;
  adminName: string;
}): Promise<{ ok: boolean; html?: string; subject?: string; error?: string }> {
  const { url, secret } = backendConfig();
  if (!url) return { ok: false, error: "Email service not configured" };

  try {
    const res = await fetch(`${url}/api/emails/preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-email-api-secret": secret } : {}),
      },
      body: JSON.stringify({
        type: "support-reply",
        email: payload.email,
        siteUrl: siteUrl(),
        data: payload,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      html?: string;
      subject?: string;
      error?: string;
    };

    if (!res.ok || !json.ok) {
      return { ok: false, error: json.error ?? "Preview failed" };
    }
    return { ok: true, html: json.html, subject: json.subject };
  } catch {
    return { ok: false, error: "Preview unavailable" };
  }
}
