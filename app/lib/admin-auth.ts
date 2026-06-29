"use server";

import { createAuthServerClient } from "./supabase/auth-server";
import { redirect } from "next/navigation";

const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS ?? ""
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAuthorizedAdminEmail(email: string | undefined | null): boolean {
  if (ADMIN_EMAILS.length === 0) return true;
  const normalized = email?.toLowerCase();
  return !!normalized && ADMIN_EMAILS.includes(normalized);
}

export async function loginAdmin(email: string, password: string) {
  const supabase = await createAuthServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (ADMIN_EMAILS.length > 0) {
    const userEmail = data.user?.email?.toLowerCase();
    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      await supabase.auth.signOut();
      return { ok: false, error: "Access denied. Your email is not authorized for admin." };
    }
  }

  return { ok: true };
}

export async function logoutAdmin() {
  const supabase = await createAuthServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function getAdminSession() {
  const supabase = await createAuthServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session?.user) {
    redirect("/admin/login");
  }
  if (ADMIN_EMAILS.length > 0) {
    const email = session.user.email?.toLowerCase();
    if (!email || !ADMIN_EMAILS.includes(email)) {
      redirect("/admin/login");
    }
  }
  return session;
}

/** For server actions that return `{ ok: boolean }` instead of redirecting. */
export async function verifyAdminForAction(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await getAdminSession();
  if (!session?.user) {
    return { ok: false, error: "Unauthorized" };
  }
  if (ADMIN_EMAILS.length > 0) {
    const email = session.user.email?.toLowerCase();
    if (!email || !ADMIN_EMAILS.includes(email)) {
      return { ok: false, error: "Unauthorized" };
    }
  }
  return { ok: true };
}
