"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, isSupabaseConfigured } from "./supabase/server";
import { getPublishedPosts } from "./posts";
import { postPublicPath } from "./post-url";
import type { Post } from "./types";
import {
  createCampaignSendRecordsBatch,
  createEmailSend,
  finalizeEmailSend,
} from "./email-funnel-actions";
import { aggregateCampaignMetrics, pct } from "./campaign-metrics";
import {
  getSubscriberTotalCount,
  getSubscribersPaginated,
  startCampaignWorker,
} from "./promotion-campaign-actions";
import type {
  BriefPostPick,
  WeeklyBriefEdition,
  WeeklyBriefRecipientSelection,
  WeeklyBriefTemplate,
} from "./weekly-brief-types";

export { getSubscriberTotalCount, getSubscribersPaginated };

const BULK_SEND_THRESHOLD = 50;
const BRIEF_LOOKBACK_DAYS = 21;
const MAX_STORY_PICKS = 40;

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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getSiteUrl(): string {
  return getBackendConfig().siteUrl || "https://factsdeck.com";
}

function postToBriefPick(post: Post): BriefPostPick {
  const base = getSiteUrl();
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt?.slice(0, 220) || "",
    category: post.categories[0] || "Article",
    publishDate: post.publishDate,
    url: `${base}${postPublicPath(post)}`,
  };
}

export async function getPostsForWeeklyBrief(): Promise<BriefPostPick[]> {
  const posts = await getPublishedPosts();
  const cutoff = Date.now() - BRIEF_LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
  return posts
    .filter((p) => {
      const t = new Date(p.publishDate).getTime();
      return Number.isFinite(t) && t >= cutoff;
    })
    .slice(0, MAX_STORY_PICKS)
    .map(postToBriefPick);
}

async function resolveWeeklyBriefRecipients(
  selection: WeeklyBriefRecipientSelection
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

    if (error) break;
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

async function createWeeklyBriefCampaignRecord(
  template: WeeklyBriefTemplate,
  targetedCount: number
): Promise<{ ok: true; campaignId: string } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  const supabase = createServerClient();
  const name = template.issueLabel || template.headline.slice(0, 80) || "Weekly brief";

  const { data, error } = await supabase
    .from("email_campaigns")
    .insert({
      name,
      subject: template.subject,
      headline: template.headline,
      email_type: "weekly-brief",
      template: template as unknown as Record<string, unknown>,
      status: "sending",
      targeted_count: targetedCount,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createWeeklyBriefCampaignRecord]", error?.message);
    return { ok: false, error: "Could not create edition record" };
  }

  return { ok: true, campaignId: String(data.id) };
}

async function countEditionEngagement(
  campaignId: string
): Promise<{ opened: number; clicked: number; unsubscribed: number }> {
  const supabase = createServerClient();
  const openSendIds = new Set<string>();
  let clicked = 0;
  let unsubscribed = 0;
  let offset = 0;
  const pageSize = 2000;

  while (true) {
    const { data: sends } = await supabase
      .from("email_sends")
      .select("id")
      .eq("campaign_id", campaignId)
      .range(offset, offset + pageSize - 1);

    if (!sends?.length) break;

    const ids = sends.map((s) => s.id);
    const { data: ev } = await supabase
      .from("email_events")
      .select("send_id, event_type")
      .in("send_id", ids);

    for (const e of ev || []) {
      if (!e.send_id) continue;
      if (e.event_type === "open") openSendIds.add(e.send_id);
      if (e.event_type === "click") clicked++;
      if (e.event_type === "unsubscribe") unsubscribed++;
    }

    if (sends.length < pageSize) break;
    offset += pageSize;
  }

  return { opened: openSendIds.size, clicked, unsubscribed };
}

export async function getWeeklyBriefEditions(): Promise<WeeklyBriefEdition[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createServerClient();
  const { data: campaigns, error } = await supabase
    .from("email_campaigns")
    .select(
      "id, name, subject, headline, status, targeted_count, sent_count, failed_count, template, created_at"
    )
    .eq("email_type", "weekly-brief")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !campaigns?.length) {
    if (error) console.error("[getWeeklyBriefEditions]", error.message);
    return [];
  }

  const largeIds = new Set(
    campaigns.filter((c) => (c.targeted_count ?? 0) > 2000).map((c) => c.id)
  );
  const smallIds = campaigns.filter((c) => !largeIds.has(c.id)).map((c) => c.id);

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

  const largeEngagement = new Map<
    string,
    { opened: number; clicked: number; unsubscribed: number }
  >();
  await Promise.all(
    [...largeIds].map(async (id) => {
      const counts = await countEditionEngagement(id);
      largeEngagement.set(id, counts);
    })
  );

  return campaigns.map((c) => {
    const tpl = (c.template || {}) as WeeklyBriefTemplate;
    const issueLabel = tpl.issueLabel || c.name;
    const useStoredCounts = largeIds.has(c.id) || c.status === "sending";

    if (useStoredCounts) {
      const delivered = c.sent_count ?? 0;
      const failed = c.failed_count ?? 0;
      const attempted = c.targeted_count ?? delivered + failed;
      const engagement = largeEngagement.get(c.id) ?? {
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
      };
      const campaignSends = sendList.filter((s) => s.campaign_id === c.id);
      const eventMetrics = aggregateCampaignMetrics(campaignSends, events);
      const opened = largeIds.has(c.id) ? engagement.opened : eventMetrics.opened;
      const clicked = largeIds.has(c.id) ? engagement.clicked : eventMetrics.clicked;
      const unsubscribed = largeIds.has(c.id)
        ? engagement.unsubscribed
        : eventMetrics.unsubscribed;

      return {
        id: c.id,
        name: c.name,
        subject: c.subject,
        headline: c.headline || "",
        issueLabel,
        status: c.status,
        createdAt: c.created_at,
        targeted: c.targeted_count,
        delivered,
        failed,
        bounced: eventMetrics.bounced,
        opened,
        clicked,
        unsubscribed,
        deliveryRate: pct(delivered, attempted),
        openRate: pct(opened, delivered || 1),
        clickThroughRate: pct(clicked, delivered || 1),
        clickToOpenRate: pct(clicked, opened || 1),
        unsubscribeRate: pct(unsubscribed, delivered || 1),
      };
    }

    const campaignSends = sendList.filter((s) => s.campaign_id === c.id);
    const metrics = aggregateCampaignMetrics(campaignSends, events);

    return {
      id: c.id,
      name: c.name,
      subject: c.subject,
      headline: c.headline || "",
      issueLabel,
      status: c.status,
      createdAt: c.created_at,
      targeted: c.targeted_count,
      ...metrics,
    };
  });
}

export async function previewWeeklyBriefEmail(
  template: WeeklyBriefTemplate
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
        type: "weekly-brief",
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

export async function sendWeeklyBriefTest(
  testEmail: string,
  template: WeeklyBriefTemplate
): Promise<{ ok: boolean; error?: string }> {
  const email = normalizeEmail(testEmail);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { ok: false, error: "Enter a valid test email" };
  }

  const { backendUrl, secret, siteUrl } = getBackendConfig();
  if (!backendUrl) return { ok: false, error: "FACTSDECK_BACKEND_URL is not configured" };

  const sendRecord = await createEmailSend("weekly-brief", email);
  const sendId = sendRecord.ok ? sendRecord.sendId : undefined;

  try {
    const res = await fetch(`${backendUrl}/api/emails/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-welcome-email-secret": secret } : {}),
      },
      body: JSON.stringify({
        type: "weekly-brief",
        email,
        sendId,
        siteUrl,
        data: template,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      if (sendId) await finalizeEmailSend(sendId, "failed", undefined, `HTTP ${res.status}`);
      return { ok: false, error: `Send failed (${res.status})` };
    }

    const payload = (await res.json().catch(() => ({}))) as { messageId?: string };
    if (sendId) await finalizeEmailSend(sendId, "sent", payload.messageId);
    return { ok: true };
  } catch (err) {
    if (sendId) {
      await finalizeEmailSend(
        sendId,
        "failed",
        undefined,
        err instanceof Error ? err.message : "Request failed"
      );
    }
    return { ok: false, error: err instanceof Error ? err.message : "Send failed" };
  }
}

export async function sendWeeklyBriefCampaign(
  selection: WeeklyBriefRecipientSelection,
  template: WeeklyBriefTemplate
): Promise<{
  ok: boolean;
  sent: number;
  failed: number;
  targeted?: number;
  queued?: boolean;
  campaignId?: string;
  error?: string;
}> {
  if (template.sections.length === 0) {
    return { ok: false, sent: 0, failed: 0, error: "Add at least one story to the brief" };
  }

  const emails = await resolveWeeklyBriefRecipients(selection);
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

  const campaignRecord = await createWeeklyBriefCampaignRecord(template, emails.length);
  if (!campaignRecord.ok) {
    return { ok: false, sent: 0, failed: 0, error: campaignRecord.error };
  }
  const campaignId = campaignRecord.campaignId;

  if (emails.length >= BULK_SEND_THRESHOLD) {
    const batch = await createCampaignSendRecordsBatch(campaignId, emails, "weekly-brief");
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

  for (const email of emails) {
    const sendRecord = await createEmailSend("weekly-brief", email, campaignId);
    const sendId = sendRecord.ok ? sendRecord.sendId : undefined;

    try {
      const res = await fetch(`${backendUrl}/api/emails/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(secret ? { "x-welcome-email-secret": secret } : {}),
        },
        body: JSON.stringify({
          type: "weekly-brief",
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
        if (sendId) await finalizeEmailSend(sendId, "failed", undefined, `HTTP ${res.status}`);
        continue;
      }

      const payload = (await res.json().catch(() => ({}))) as { messageId?: string };
      if (sendId) await finalizeEmailSend(sendId, "sent", payload.messageId);
      sent++;
    } catch (err) {
      failed++;
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
    error: sent === 0 ? "No messages were sent" : undefined,
  };
}
