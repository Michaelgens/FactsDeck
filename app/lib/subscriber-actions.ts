"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, isSupabaseConfigured } from "./supabase/server";

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
      body: JSON.stringify({ email: trimmed }),
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
      if (res.status === 401) {
        console.error(
          "[subscribeEmail] 401 Unauthorized — backend has WELCOME_EMAIL_SECRET but Next.js is missing it or values differ. Set WELCOME_EMAIL_SECRET in both .env files to the same string."
        );
      }
    }
  } catch (err) {
    console.error(
      "[subscribeEmail] Welcome email request error:",
      err instanceof Error ? err.message : err
    );
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
