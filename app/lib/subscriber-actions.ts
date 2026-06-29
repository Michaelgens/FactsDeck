"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, isSupabaseConfigured } from "./supabase/server";
import {
  createEmailSend,
  finalizeEmailSend,
  logEmailEvent,
} from "./email-funnel-actions";

export type Subscriber = {
  id: string;
  email: string;
  createdAt: string;
};

/** Subscribe email from footer. Returns ok/error. Handles duplicate (already subscribed) gracefully. */
export async function subscribeEmail(
  email: string
): Promise<{ ok: boolean; error?: string }> {
  const trimmed = email?.trim().toLowerCase();
  if (!trimmed) return { ok: false, error: "Please enter an email address" };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return { ok: false, error: "Please enter a valid email address" };

  if (!isSupabaseConfigured()) return { ok: false, error: "Newsletter signup is temporarily unavailable" };

  const supabase = createServerClient();

  const { error } = await supabase.from("subscribers").insert({ email: trimmed });

  if (error) {
    if (error.code === "23505") {
      return { ok: true };
    }
    console.error("[subscribeEmail]", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/marketing/funnel");

  const sendRecord = await createEmailSend("welcome", trimmed);
  let sendId = sendRecord.ok ? sendRecord.sendId : undefined;
  if (!sendRecord.ok) {
    console.error("[subscribeEmail] Could not create email_sends row:", sendRecord.error);
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");

  const backendUrl =
    process.env.FACTSDECK_BACKEND_URL?.replace(/\/$/, "") ||
    (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "");
  const secret = process.env.WELCOME_EMAIL_SECRET?.trim();

  if (!backendUrl) {
    console.warn(
      "[subscribeEmail] Set FACTSDECK_BACKEND_URL to your email API URL so welcome emails can be sent."
    );
    return { ok: true };
  }

  try {
    const res = await fetch(`${backendUrl}/api/welcome-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-welcome-email-secret": secret } : {}),
      },
      body: JSON.stringify({ email: trimmed, sendId, siteUrl }),
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(
        "[subscribeEmail] Welcome email API failed:",
        res.status,
        detail || res.statusText
      );
      let backendSendId: string | undefined;
      try {
        const parsed = JSON.parse(detail) as { sendId?: string | null };
        backendSendId = parsed.sendId || undefined;
      } catch {
        /* not JSON */
      }
      const failedSendId = sendId || backendSendId;
      if (failedSendId) {
        await finalizeEmailSend(failedSendId, "failed", undefined, `HTTP ${res.status}`);
      }
      if (res.status === 401) {
        console.error(
          "[subscribeEmail] 401 Unauthorized — backend has WELCOME_EMAIL_SECRET but Next.js is missing it or values differ. Set WELCOME_EMAIL_SECRET in both .env files to the same string."
        );
      }
    } else {
      const payload = (await res.json().catch(() => ({}))) as {
        messageId?: string;
        sendId?: string | null;
      };
      const effectiveSendId = sendId || payload.sendId || undefined;
      if (effectiveSendId) {
        await finalizeEmailSend(effectiveSendId, "sent", payload.messageId);
      }
    }
  } catch (err) {
    console.error(
      "[subscribeEmail] Welcome email request error:",
      err instanceof Error ? err.message : err
    );
    if (sendId) {
      await finalizeEmailSend(
        sendId,
        "failed",
        undefined,
        err instanceof Error ? err.message : "Request failed"
      );
    }
  }

  return { ok: true };
}

/** Get all subscribers for admin. */
export async function getSubscribers(): Promise<Subscriber[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("subscribers")
    .select("id, email, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getSubscribers]", error.message);
    return [];
  }

  return (data || []).map((row: { id: string; email: string; created_at: string }) => ({
    id: String(row.id),
    email: String(row.email),
    createdAt: String(row.created_at),
  }));
}

export type UnsubscribeResult =
  | { ok: true; status: "removed" | "not_found" }
  | { ok: false; error: string };

/** Public unsubscribe — removes subscriber by email (newsletter opt-out). */
export async function unsubscribeEmail(email: string): Promise<UnsubscribeResult> {
  const trimmed = email?.trim().toLowerCase();
  if (!trimmed) return { ok: false, error: "Please enter an email address" };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return { ok: false, error: "Please enter a valid email address" };

  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Unsubscribe is temporarily unavailable. Please try again later." };
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("subscribers")
    .delete()
    .eq("email", trimmed)
    .select("id");

  if (error) {
    console.error("[unsubscribeEmail]", error.message);
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  if (data?.length) {
    await logEmailEvent({
      emailType: "welcome",
      eventType: "unsubscribe",
      recipientEmail: trimmed,
    });
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    revalidatePath("/admin/analytics");
    revalidatePath("/admin/marketing/funnel");
    return { ok: true, status: "removed" };
  }

  return { ok: true, status: "not_found" };
}

/** Remove a subscriber (admin). */
export async function deleteSubscriber(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!id?.trim()) return { ok: false, error: "Invalid subscriber" };
  if (!isSupabaseConfigured()) return { ok: false, error: "Database not configured" };

  const supabase = createServerClient();
  const { error } = await supabase.from("subscribers").delete().eq("id", id);

  if (error) {
    console.error("[deleteSubscriber]", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  revalidatePath("/admin/analytics");
  return { ok: true };
}

/** CSV export for admin download (server-generated string). */
export async function exportSubscribersCsv(): Promise<string> {
  const rows = await getSubscribers();
  const header = "email,subscribed_at\n";
  const body = rows
    .map((s) => `"${s.email.replace(/"/g, '""')}","${s.createdAt}"`)
    .join("\n");
  return header + body;
}
