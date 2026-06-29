"use server";

import { revalidatePath } from "next/cache";
import { parseEmailList } from "./email-test-utils";
import type { AdminTestSendReport, SubscriberImportReport } from "./email-test-types";
import type { EmailFunnelType } from "./email-funnel-types";
import {
  createEmailSend,
  finalizeEmailSend,
} from "./email-funnel-actions";
import { createServerClient, isSupabaseConfigured } from "./supabase/server";
import type { PromotionTemplate } from "./promotion-campaign-types";
import type { WeeklyBriefTemplate } from "./weekly-brief-types";

const IMPORT_CHUNK = 500;
const MAX_TEST_RECIPIENTS = 25;

function getBackendConfig() {
  const backendUrl =
    process.env.FACTSDECK_BACKEND_URL?.replace(/\/$/, "") ||
    (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "");
  const secret = process.env.WELCOME_EMAIL_SECRET?.trim();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");
  return { backendUrl, secret, siteUrl };
}

async function fetchExistingEmails(emails: string[]): Promise<Set<string>> {
  const existing = new Set<string>();
  if (!isSupabaseConfigured() || emails.length === 0) return existing;

  const supabase = createServerClient();
  for (let i = 0; i < emails.length; i += IMPORT_CHUNK) {
    const chunk = emails.slice(i, i + IMPORT_CHUNK);
    const { data, error } = await supabase.from("subscribers").select("email").in("email", chunk);
    if (error) {
      console.error("[fetchExistingEmails]", error.message);
      break;
    }
    for (const row of data || []) {
      existing.add(String(row.email).toLowerCase());
    }
  }
  return existing;
}

/** Import parsed emails into subscribers; skips addresses already in Supabase. */
export async function importSubscribersFromList(rawInput: string): Promise<SubscriberImportReport> {
  const { rawTokens, valid, invalid, duplicateInInput } = parseEmailList(rawInput);

  if (valid.length === 0) {
    return {
      ok: false,
      error: invalid.length ? "No valid emails found" : "Paste at least one email",
      parsedTokens: rawTokens,
      validCount: 0,
      duplicateInInput,
      alreadySubscribed: 0,
      newlyAdded: 0,
      invalidCount: invalid.length,
      duplicateEmails: [],
      addedEmails: [],
      invalidSamples: invalid.slice(0, 8),
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: "Database not configured",
      parsedTokens: rawTokens,
      validCount: valid.length,
      duplicateInInput,
      alreadySubscribed: 0,
      newlyAdded: 0,
      invalidCount: invalid.length,
      duplicateEmails: [],
      addedEmails: [],
      invalidSamples: invalid.slice(0, 8),
    };
  }

  const existingSet = await fetchExistingEmails(valid);
  const duplicateEmails = valid.filter((e) => existingSet.has(e));
  const toAdd = valid.filter((e) => !existingSet.has(e));

  const supabase = createServerClient();
  const addedEmails: string[] = [];

  for (let i = 0; i < toAdd.length; i += IMPORT_CHUNK) {
    const chunk = toAdd.slice(i, i + IMPORT_CHUNK);
    const { data, error } = await supabase
      .from("subscribers")
      .insert(chunk.map((email) => ({ email })))
      .select("email");

    if (error) {
      console.error("[importSubscribersFromList]", error.message);
      return {
        ok: false,
        error: error.message,
        parsedTokens: rawTokens,
        validCount: valid.length,
        duplicateInInput,
        alreadySubscribed: duplicateEmails.length,
        newlyAdded: addedEmails.length,
        invalidCount: invalid.length,
        duplicateEmails: duplicateEmails.slice(0, 20),
        addedEmails,
        invalidSamples: invalid.slice(0, 8),
      };
    }

    for (const row of data || []) {
      addedEmails.push(String(row.email).toLowerCase());
    }
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/marketing/funnel");

  return {
    ok: true,
    parsedTokens: rawTokens,
    validCount: valid.length,
    duplicateInInput,
    alreadySubscribed: duplicateEmails.length,
    newlyAdded: addedEmails.length,
    invalidCount: invalid.length,
    duplicateEmails: duplicateEmails.slice(0, 20),
    addedEmails: addedEmails.slice(0, 20),
    invalidSamples: invalid.slice(0, 8),
  };
}

async function dispatchOneTest(
  emailType: EmailFunnelType,
  email: string,
  siteUrl: string,
  backendUrl: string,
  secret: string | undefined,
  data: Record<string, unknown>
): Promise<{ ok: boolean; error?: string }> {
  const sendRecord = await createEmailSend(emailType, email);
  let sendId = sendRecord.ok ? sendRecord.sendId : undefined;
  if (!sendRecord.ok) {
    console.error("[sendAdminTestEmails] createEmailSend failed:", sendRecord.error);
  }

  const endpoint =
    emailType === "welcome" ? `${backendUrl}/api/welcome-email` : `${backendUrl}/api/emails/send`;

  const body =
    emailType === "welcome"
      ? { email, sendId, siteUrl }
      : { type: emailType, email, sendId, siteUrl, data };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-welcome-email-secret": secret } : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      let backendSendId: string | undefined;
      try {
        backendSendId = (JSON.parse(detail) as { sendId?: string | null }).sendId || undefined;
      } catch {
        /* ignore */
      }
      const failedSendId = sendId || backendSendId;
      if (failedSendId) await finalizeEmailSend(failedSendId, "failed", undefined, `HTTP ${res.status}`);
      return { ok: false, error: detail || `HTTP ${res.status}` };
    }

    const payload = (await res.json().catch(() => ({}))) as {
      messageId?: string;
      sendId?: string | null;
    };
    const effectiveSendId = sendId || payload.sendId || undefined;
    if (effectiveSendId) await finalizeEmailSend(effectiveSendId, "sent", payload.messageId);
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Send failed";
    if (sendId) await finalizeEmailSend(sendId, "failed", undefined, msg);
    return { ok: false, error: msg };
  }
}

/** Send test emails to a pasted list (does not add subscribers). Max 25 per run. */
export async function sendAdminTestEmails(
  emailType: EmailFunnelType,
  rawInput: string,
  options?: {
    promotionTemplate?: PromotionTemplate;
    weeklyBriefTemplate?: WeeklyBriefTemplate;
  }
): Promise<AdminTestSendReport> {
  const { valid, invalid } = parseEmailList(rawInput);

  if (valid.length === 0) {
    return {
      ok: false,
      error: invalid.length ? "No valid emails in list" : "Paste at least one email",
      sent: 0,
      failed: 0,
      failures: [],
    };
  }

  if (valid.length > MAX_TEST_RECIPIENTS) {
    return {
      ok: false,
      error: `Test sends are limited to ${MAX_TEST_RECIPIENTS} emails at a time (you have ${valid.length})`,
      sent: 0,
      failed: 0,
      failures: [],
    };
  }

  if (emailType === "weekly-brief" && !options?.weeklyBriefTemplate?.sections?.length) {
    return {
      ok: false,
      error: "Add at least one story to the weekly brief before testing",
      sent: 0,
      failed: 0,
      failures: [],
    };
  }

  const { backendUrl, secret, siteUrl } = getBackendConfig();
  if (!backendUrl) {
    return {
      ok: false,
      error: "FACTSDECK_BACKEND_URL is not configured",
      sent: 0,
      failed: 0,
      failures: [],
    };
  }

  const data =
    emailType === "promotion"
      ? (options?.promotionTemplate as Record<string, unknown>) || {}
      : emailType === "weekly-brief"
        ? (options?.weeklyBriefTemplate as Record<string, unknown>) || {}
        : {};

  let sent = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const email of valid) {
    const result = await dispatchOneTest(emailType, email, siteUrl, backendUrl, secret, data);
    if (result.ok) sent++;
    else {
      failed++;
      failures.push(`${email}: ${result.error || "failed"}`);
    }
    await new Promise((r) => setTimeout(r, 150));
  }

  revalidatePath("/admin/marketing/funnel");

  return {
    ok: sent > 0,
    sent,
    failed,
    failures: failures.slice(0, 8),
    error: sent === 0 ? failures[0] || "No messages were sent" : undefined,
  };
}

/** Import new subscribers, then send test emails to the valid parsed list. */
export async function importAndSendAdminTestEmails(
  emailType: EmailFunnelType,
  rawInput: string,
  options?: {
    promotionTemplate?: PromotionTemplate;
    weeklyBriefTemplate?: WeeklyBriefTemplate;
  }
): Promise<{
  import: SubscriberImportReport;
  send: AdminTestSendReport;
}> {
  const importReport = await importSubscribersFromList(rawInput);
  const sendReport = await sendAdminTestEmails(emailType, rawInput, options);
  return { import: importReport, send: sendReport };
}
