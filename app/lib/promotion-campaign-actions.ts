"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, isSupabaseConfigured } from "./supabase/server";
import type {
  PromotionCampaignPerformance,
  PromotionRecipientSelection,
  PromotionTemplate,
  SubscribersPage,
} from "./promotion-campaign-types";
import {
  createEmailSend,
  createPromotionSendRecordsBatch,
  finalizeEmailSend,
} from "./email-funnel-actions";
import { aggregateCampaignMetrics, pct } from "./campaign-metrics";

/** Above this count, sends run in the background on the email backend. */
const BULK_SEND_THRESHOLD = 50;

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

export async function getSubscriberTotalCount(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const supabase = createServerClient();
  const { count, error } = await supabase
    .from("subscribers")
    .select("id", { count: "exact", head: true });
  if (error) {
    console.error("[getSubscriberTotalCount]", error.message);
    return 0;
  }
  return count ?? 0;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function resolvePromotionRecipientEmails(
  selection: PromotionRecipientSelection
): Promise<string[]> {
  if (selection.mode === "explicit") {
    return [...new Set(selection.emails.map(normalizeEmail).filter(Boolean))];
  }

  const exclude = new Set(selection.excludeEmails.map(normalizeEmail).filter(Boolean));
  if (!isSupabaseConfigured()) return [];

  const supabase = createServerClient();
  const batchSize = 1000;
  const emails: string[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from("subscribers")
      .select("email")
      .order("created_at", { ascending: false })
      .range(offset, offset + batchSize - 1);

    if (error) {
      console.error("[resolvePromotionRecipientEmails]", error.message);
      break;
    }
    if (!data?.length) break;

    for (const row of data) {
      const email = normalizeEmail(String(row.email));
      if (email && !exclude.has(email)) emails.push(email);
    }

    if (data.length < batchSize) break;
    offset += batchSize;
  }

  return emails;
}

export async function getSubscribersPaginated(options: {
  page?: number;
  limit?: number;
  query?: string;
}): Promise<SubscribersPage> {
  const page = Math.max(1, options.page ?? 1);
  const limit = [10, 50, 100].includes(options.limit ?? 10) ? (options.limit as number) : 10;
  const query = (options.query ?? "").trim().toLowerCase();

  if (!isSupabaseConfigured()) {
    return { rows: [], total: 0, page, limit, query };
  }

  const supabase = createServerClient();
  let countQuery = supabase.from("subscribers").select("id", { count: "exact", head: true });
  let dataQuery = supabase
    .from("subscribers")
    .select("id, email, created_at")
    .order("created_at", { ascending: false });

  if (query) {
    countQuery = countQuery.ilike("email", `%${query}%`);
    dataQuery = dataQuery.ilike("email", `%${query}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const [{ count }, { data, error }] = await Promise.all([
    countQuery,
    dataQuery.range(from, to),
  ]);

  if (error) {
    console.error("[getSubscribersPaginated]", error.message);
    return { rows: [], total: 0, page, limit, query };
  }

  return {
    rows: (data || []).map((row) => ({
      id: String(row.id),
      email: String(row.email),
      createdAt: String(row.created_at),
    })),
    total: count ?? 0,
    page,
    limit,
    query,
  };
}

export async function getPromotionCampaigns(): Promise<PromotionCampaignPerformance[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createServerClient();
  const { data: campaigns, error } = await supabase
    .from("email_campaigns")
    .select(
      "id, name, subject, headline, status, targeted_count, sent_count, failed_count, created_at"
    )
    .eq("email_type", "promotion")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !campaigns?.length) {
    if (error) console.error("[getPromotionCampaigns]", error.message);
    return [];
  }

  const largeCampaignIds = new Set(
    campaigns.filter((c) => (c.targeted_count ?? 0) > 2000).map((c) => c.id)
  );
  const smallIds = campaigns.filter((c) => !largeCampaignIds.has(c.id)).map((c) => c.id);

  let sendList: Array<{ id: string; status: string; campaign_id: string | null }> = [];
  if (smallIds.length > 0) {
    const { data: sends } = await supabase
      .from("email_sends")
      .select("id, status, campaign_id")
      .in("campaign_id", smallIds);
    sendList = sends || [];
  }

  const sendIds = sendList.map((s) => s.id);
  let events: Array<{ send_id: string | null; event_type: string }> = [];

  if (sendIds.length > 0) {
    const { data: ev } = await supabase
      .from("email_events")
      .select("send_id, event_type")
      .in("send_id", sendIds);
    events = ev || [];
  }

  return campaigns.map((c) => {
    const useStoredCounts =
      largeCampaignIds.has(c.id) || c.status === "sending";

    if (useStoredCounts) {
      const delivered = c.sent_count ?? 0;
      const failed = c.failed_count ?? 0;
      const attempted = c.targeted_count ?? delivered + failed;
      const campaignSends = sendList.filter((s) => s.campaign_id === c.id);
      const eventMetrics = aggregateCampaignMetrics(campaignSends, events);
      return {
        id: c.id,
        name: c.name,
        subject: c.subject,
        headline: c.headline || "",
        status: c.status,
        createdAt: c.created_at,
        targeted: c.targeted_count,
        delivered,
        failed,
        bounced: eventMetrics.bounced,
        opened: eventMetrics.opened,
        clicked: eventMetrics.clicked,
        unsubscribed: eventMetrics.unsubscribed,
        deliveryRate: pct(delivered, attempted),
        openRate: pct(eventMetrics.opened, delivered || 1),
        clickThroughRate: pct(eventMetrics.clicked, delivered || 1),
        clickToOpenRate: pct(eventMetrics.clicked, eventMetrics.opened || 1),
        unsubscribeRate: pct(eventMetrics.unsubscribed, delivered || 1),
      };
    }

    const campaignSends = sendList.filter((s) => s.campaign_id === c.id);
    const metrics = aggregateCampaignMetrics(campaignSends, events);
    return {
      id: c.id,
      name: c.name,
      subject: c.subject,
      headline: c.headline || "",
      status: c.status,
      createdAt: c.created_at,
      targeted: c.targeted_count,
      ...metrics,
    };
  });
}

export async function startCampaignWorker(
  campaignId: string,
  siteUrl: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { backendUrl, secret } = getBackendConfig();
  if (!backendUrl) {
    return { ok: false, error: "FACTSDECK_BACKEND_URL is not configured" };
  }

  try {
    const res = await fetch(`${backendUrl}/api/emails/campaigns/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-welcome-email-secret": secret } : {}),
      },
      body: JSON.stringify({ campaignId, siteUrl }),
      cache: "no-store",
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, error: detail || `Worker start failed (${res.status})` };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not start campaign worker",
    };
  }
}

async function createPromotionCampaignRecord(
  template: PromotionTemplate,
  targetedCount: number
): Promise<{ ok: true; campaignId: string } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  const supabase = createServerClient();
  const name =
    template.headline?.slice(0, 80) ||
    template.subject.replace(/^\[Promotion\]\s*/i, "").slice(0, 80) ||
    "Promotion campaign";

  const { data, error } = await supabase
    .from("email_campaigns")
    .insert({
      name,
      subject: template.subject,
      headline: template.headline,
      email_type: "promotion",
      template: template as unknown as Record<string, unknown>,
      status: "sending",
      targeted_count: targetedCount,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createPromotionCampaignRecord]", error?.message);
    return { ok: false, error: "Could not create campaign record" };
  }

  return { ok: true, campaignId: String(data.id) };
}

export async function previewPromotionEmail(
  template: PromotionTemplate
): Promise<{ ok: true; subject: string; html: string } | { ok: false; error: string }> {
  const { backendUrl, secret } = getBackendConfig();
  if (!backendUrl) {
    return { ok: false, error: "FACTSDECK_BACKEND_URL is not configured" };
  }

  try {
    const res = await fetch(`${backendUrl}/api/emails/preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-welcome-email-secret": secret } : {}),
      },
      body: JSON.stringify({
        type: "promotion",
        email: "preview@factsdeck.com",
        data: template,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, error: detail || "Preview failed" };
    }

    const payload = (await res.json()) as { subject?: string; html?: string };
    return {
      ok: true,
      subject: payload.subject || template.subject,
      html: payload.html || "",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Preview request failed",
    };
  }
}

export async function sendPromotionCampaign(
  selection: PromotionRecipientSelection,
  template: PromotionTemplate
): Promise<{
  ok: boolean;
  sent: number;
  failed: number;
  targeted?: number;
  queued?: boolean;
  campaignId?: string;
  error?: string;
  failures?: string[];
}> {
  const emails = await resolvePromotionRecipientEmails(selection);
  if (emails.length === 0) {
    return { ok: false, sent: 0, failed: 0, error: "Select at least one recipient" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalid = emails.filter((e) => !emailRegex.test(e));
  if (invalid.length) {
    return { ok: false, sent: 0, failed: 0, error: `Invalid email: ${invalid[0]}` };
  }

  const { backendUrl, secret, siteUrl } = getBackendConfig();
  if (!backendUrl) {
    return { ok: false, sent: 0, failed: 0, error: "FACTSDECK_BACKEND_URL is not configured" };
  }

  const campaignRecord = await createPromotionCampaignRecord(template, emails.length);
  if (!campaignRecord.ok) {
    return { ok: false, sent: 0, failed: 0, error: campaignRecord.error };
  }
  const campaignId = campaignRecord.campaignId;

  if (emails.length >= BULK_SEND_THRESHOLD) {
    const batch = await createPromotionSendRecordsBatch(campaignId, emails);
    if (!batch.ok) {
      const supabase = createServerClient();
      await supabase
        .from("email_campaigns")
        .update({ status: "failed", completed_at: new Date().toISOString() })
        .eq("id", campaignId);
      return { ok: false, sent: 0, failed: 0, error: batch.error };
    }

    const worker = await startCampaignWorker(campaignId, siteUrl);
    if (!worker.ok) {
      const supabase = createServerClient();
      await supabase
        .from("email_campaigns")
        .update({ status: "failed", completed_at: new Date().toISOString() })
        .eq("id", campaignId);
      return { ok: false, sent: 0, failed: 0, error: worker.error };
    }

    revalidatePath("/admin/marketing/funnel");

    return {
      ok: true,
      queued: true,
      targeted: emails.length,
      sent: 0,
      failed: 0,
      campaignId,
    };
  }

  let sent = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const email of emails) {
    const sendRecord = await createEmailSend("promotion", email, campaignId);
    const sendId = sendRecord.ok ? sendRecord.sendId : undefined;

    try {
      const res = await fetch(`${backendUrl}/api/emails/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(secret ? { "x-welcome-email-secret": secret } : {}),
        },
        body: JSON.stringify({
          type: "promotion",
          email,
          sendId,
          siteUrl,
          data: template,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        failed++;
        failures.push(`${email}: HTTP ${res.status}`);
        if (sendId) await finalizeEmailSend(sendId, "failed", undefined, `HTTP ${res.status}`);
        continue;
      }

      const payload = (await res.json().catch(() => ({}))) as { messageId?: string };
      if (sendId) await finalizeEmailSend(sendId, "sent", payload.messageId);
      sent++;
    } catch (err) {
      failed++;
      failures.push(`${email}: ${err instanceof Error ? err.message : "failed"}`);
      if (sendId) {
        await finalizeEmailSend(
          sendId,
          "failed",
          undefined,
          err instanceof Error ? err.message : "Request failed"
        );
      }
    }

    await new Promise((r) => setTimeout(r, 200));
  }

  const supabase = createServerClient();
  await supabase
    .from("email_campaigns")
    .update({
      status: sent > 0 ? "completed" : "failed",
      sent_count: sent,
      failed_count: failed,
      completed_at: new Date().toISOString(),
    })
    .eq("id", campaignId);

  revalidatePath("/admin/marketing/funnel");

  return {
    ok: sent > 0,
    sent,
    failed,
    campaignId,
    failures: failures.length ? failures.slice(0, 10) : undefined,
    error: sent === 0 ? "No messages were sent" : undefined,
  };
}
