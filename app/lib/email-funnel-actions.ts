"use server";

import { createServerClient, isSupabaseConfigured } from "./supabase/server";
import {
  type EmailEventType,
  type EmailFunnelInsights,
  type EmailFunnelType,
  type EmailSendStatus,
  type EmailTypeMetrics,
  type WelcomeSendRow,
  type WelcomeSendsPage,
  emptyMetrics,
} from "./email-funnel-types";

const PERIOD_DAYS = 30;

function pct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function periodStart(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function monthLabels(count: number): string[] {
  const labels: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }));
  }
  return labels;
}

function computeMetrics(
  type: EmailTypeMetrics["type"],
  label: string,
  sends: Array<{ status: string; email_type: string }>,
  events: Array<{ event_type: string; send_id: string | null; email_type: string }>
): EmailTypeMetrics {
  const relevantSends =
    type === "all" ? sends : sends.filter((s) => s.email_type === type);
  const attempted = relevantSends.length;
  const bouncedFromStatus = relevantSends.filter((s) => s.status === "bounced").length;
  const delivered = relevantSends.filter((s) => s.status === "sent").length;

  const relevantEvents =
    type === "all"
      ? events
      : events.filter((e) => e.email_type === type);

  const bounceEvents = relevantEvents.filter((e) => e.event_type === "bounce").length;
  const bounced = Math.max(bouncedFromStatus, bounceEvents);

  const openSendIds = new Set(
    relevantEvents.filter((e) => e.event_type === "open" && e.send_id).map((e) => e.send_id as string)
  );
  const opened = openSendIds.size;

  const clicked = relevantEvents.filter((e) => e.event_type === "click").length;
  const spamComplaints = relevantEvents.filter((e) => e.event_type === "spam_complaint").length;
  const unsubscribed = relevantEvents.filter((e) => e.event_type === "unsubscribe").length;

  const deliveryBase = attempted || 1;
  const engagementBase = delivered || 1;

  return {
    type,
    label,
    attempted,
    delivered,
    deliveryRate: pct(delivered, attempted),
    bounced,
    bounceRate: pct(bounced, deliveryBase),
    opened,
    openRate: pct(opened, engagementBase),
    clicked,
    clickThroughRate: pct(clicked, engagementBase),
    clickToOpenRate: pct(clicked, opened || 1),
    spamComplaints,
    spamComplaintRate: pct(spamComplaints, engagementBase),
    unsubscribed,
    unsubscribeRate: pct(unsubscribed, engagementBase),
  };
}

function healthScore(m: EmailTypeMetrics): number {
  if (m.attempted === 0) return 0;
  const delivery = m.deliveryRate * 0.35;
  const engagement = m.openRate * 0.25 + m.clickThroughRate * 0.2;
  const penalties = m.bounceRate * 0.15 + m.spamComplaintRate * 0.25 + m.unsubscribeRate * 0.1;
  return Math.max(0, Math.min(100, Math.round(delivery + engagement - penalties)));
}

/** Create a pending send row before dispatch (returns send id for tracking). */
export async function createEmailSend(
  emailType: EmailFunnelType,
  recipientEmail: string,
  campaignId?: string
): Promise<{ ok: true; sendId: string } | { ok: false; error: string }> {
  const trimmed = recipientEmail?.trim().toLowerCase();
  if (!trimmed) return { ok: false, error: "Invalid email" };
  if (!isSupabaseConfigured()) return { ok: false, error: "Database not configured" };

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("email_sends")
    .insert({
      email_type: emailType,
      recipient_email: trimmed,
      status: "pending",
      ...(campaignId ? { campaign_id: campaignId } : {}),
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createEmailSend]", error?.message);
    return { ok: false, error: "Could not create send record" };
  }

  return { ok: true, sendId: String(data.id) };
}

const SEND_RECORD_BATCH = 500;

/** Bulk-insert pending sends for a campaign (large lists). */
export async function createCampaignSendRecordsBatch(
  campaignId: string,
  emails: string[],
  emailType: EmailFunnelType
): Promise<{ ok: true; created: number } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Database not configured" };
  if (!campaignId) return { ok: false, error: "Missing campaign id" };

  const unique = [...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))];
  if (unique.length === 0) return { ok: false, error: "No recipients" };

  const supabase = createServerClient();
  let created = 0;

  for (let i = 0; i < unique.length; i += SEND_RECORD_BATCH) {
    const chunk = unique.slice(i, i + SEND_RECORD_BATCH);
    const rows = chunk.map((recipient_email) => ({
      email_type: emailType,
      recipient_email,
      status: "pending" as const,
      campaign_id: campaignId,
    }));

    const { error } = await supabase.from("email_sends").insert(rows);
    if (error) {
      console.error("[createCampaignSendRecordsBatch]", error.message);
      return { ok: false, error: error.message };
    }
    created += chunk.length;
  }

  return { ok: true, created };
}

/** @deprecated Use createCampaignSendRecordsBatch */
export async function createPromotionSendRecordsBatch(
  campaignId: string,
  emails: string[]
): Promise<{ ok: true; created: number } | { ok: false; error: string }> {
  return createCampaignSendRecordsBatch(campaignId, emails, "promotion");
}

export async function finalizeEmailSend(
  sendId: string,
  status: EmailSendStatus,
  messageId?: string,
  failedReason?: string
): Promise<void> {
  if (!isSupabaseConfigured() || !sendId) return;
  const supabase = createServerClient();
  await supabase
    .from("email_sends")
    .update({
      status,
      message_id: messageId || null,
      failed_reason: failedReason || null,
      sent_at: new Date().toISOString(),
    })
    .eq("id", sendId);
}

export async function logEmailEvent(params: {
  sendId?: string;
  emailType: EmailFunnelType;
  eventType: EmailEventType;
  recipientEmail: string;
  linkUrl?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    console.error("[logEmailEvent] Supabase not configured");
    return { ok: false, error: "Database not configured" };
  }
  const supabase = createServerClient();
  const { error } = await supabase.from("email_events").insert({
    send_id: params.sendId || null,
    email_type: params.emailType,
    event_type: params.eventType,
    recipient_email: params.recipientEmail.trim().toLowerCase(),
    link_url: params.linkUrl || null,
  });

  if (error) {
    console.error("[logEmailEvent]", params.eventType, error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

function mapSendRows(
  sends: Array<{
    id: string;
    email_type: string;
    recipient_email: string;
    status: string;
    sent_at: string;
  }>,
  eventCountsBySend: Map<string, { opens: number; clicks: number }>
): WelcomeSendRow[] {
  return sends.map((s) => ({
    id: s.id,
    emailType: s.email_type as EmailFunnelType,
    recipientEmail: s.recipient_email,
    status: s.status as EmailSendStatus,
    sentAt: s.sent_at,
    opens: eventCountsBySend.get(s.id)?.opens ?? 0,
    clicks: eventCountsBySend.get(s.id)?.clicks ?? 0,
  }));
}

export async function getWelcomeSendsPaginated(options: {
  page?: number;
  limit?: number;
  query?: string;
}): Promise<WelcomeSendsPage> {
  const page = Math.max(1, options.page ?? 1);
  const limit = [10, 50, 100].includes(options.limit ?? 10) ? (options.limit as number) : 10;
  const query = (options.query ?? "").trim().toLowerCase();

  if (!isSupabaseConfigured()) {
    return { rows: [], total: 0, page, limit, query };
  }

  const supabase = createServerClient();
  const since = periodStart(PERIOD_DAYS).toISOString();

  let countQuery = supabase
    .from("email_sends")
    .select("id", { count: "exact", head: true })
    .eq("email_type", "welcome")
    .gte("sent_at", since);

  let dataQuery = supabase
    .from("email_sends")
    .select("id, email_type, recipient_email, status, message_id, sent_at")
    .eq("email_type", "welcome")
    .gte("sent_at", since)
    .order("sent_at", { ascending: false });

  if (query) {
    countQuery = countQuery.ilike("recipient_email", `%${query}%`);
    dataQuery = dataQuery.ilike("recipient_email", `%${query}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const [{ count }, { data: sends, error }] = await Promise.all([
    countQuery,
    dataQuery.range(from, to),
  ]);

  if (error) {
    console.error("[getWelcomeSendsPaginated]", error.message);
    return { rows: [], total: 0, page, limit, query };
  }

  const sendList = sends || [];
  const sendIds = sendList.map((s) => s.id);
  let eventCountsBySend = new Map<string, { opens: number; clicks: number }>();

  if (sendIds.length > 0) {
    const { data: events } = await supabase
      .from("email_events")
      .select("send_id, event_type")
      .in("send_id", sendIds);

    for (const e of events || []) {
      if (!e.send_id) continue;
      const cur = eventCountsBySend.get(e.send_id) || { opens: 0, clicks: 0 };
      if (e.event_type === "open") cur.opens++;
      if (e.event_type === "click") cur.clicks++;
      eventCountsBySend.set(e.send_id, cur);
    }
  }

  return {
    rows: mapSendRows(sendList, eventCountsBySend),
    total: count ?? 0,
    page,
    limit,
    query,
  };
}

export async function getEmailFunnelInsights(): Promise<EmailFunnelInsights> {
  const since = periodStart(PERIOD_DAYS).toISOString();

  if (!isSupabaseConfigured()) {
    return {
      periodDays: PERIOD_DAYS,
      updatedAt: new Date().toISOString(),
      audienceSize: 0,
      healthScore: 0,
      overall: emptyMetrics("all", "All email"),
      welcome: emptyMetrics("welcome", "Welcome"),
      weeklyBrief: emptyMetrics("weekly-brief", "Weekly briefs"),
      promotion: emptyMetrics("promotion", "Promotions"),
      sendsTimeline: monthLabels(6).map((label) => ({
        label,
        welcome: 0,
        weeklyBrief: 0,
        promotion: 0,
      })),
      engagementTimeline: monthLabels(6).map((label) => ({ label, opens: 0, clicks: 0 })),
      recentSends: [],
      topLinks: [],
    };
  }

  const supabase = createServerClient();

  const [sendsRes, eventsRes, subsRes] = await Promise.all([
    supabase
      .from("email_sends")
      .select("id, email_type, recipient_email, status, message_id, sent_at")
      .gte("sent_at", since)
      .order("sent_at", { ascending: false }),
    supabase
      .from("email_events")
      .select("id, send_id, email_type, event_type, link_url, created_at")
      .gte("created_at", since),
    supabase.from("subscribers").select("id", { count: "exact", head: true }),
  ]);

  const sends = sendsRes.data || [];
  const events = eventsRes.data || [];
  const audienceSize = subsRes.count ?? 0;

  const welcome = computeMetrics("welcome", "Welcome", sends, events);
  const weeklyBrief = computeMetrics("weekly-brief", "Weekly briefs", sends, events);
  const promotion = computeMetrics("promotion", "Promotions", sends, events);
  const overall = computeMetrics("all", "All email", sends, events);

  const labels = monthLabels(6);
  const sendsTimeline = labels.map((label, idx) => {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - (5 - idx));
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59);

    const inMonth = (iso: string) => {
      const t = new Date(iso).getTime();
      return t >= monthStart.getTime() && t <= monthEnd.getTime();
    };

    const monthSends = sends.filter((s) => inMonth(s.sent_at));
    return {
      label,
      welcome: monthSends.filter((s) => s.email_type === "welcome").length,
      weeklyBrief: monthSends.filter((s) => s.email_type === "weekly-brief").length,
      promotion: monthSends.filter((s) => s.email_type === "promotion").length,
    };
  });

  const engagementTimeline = labels.map((label, idx) => {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - (5 - idx));
    monthStart.setDate(1);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59);
    const inMonth = (iso: string) => {
      const t = new Date(iso).getTime();
      return t >= monthStart.getTime() && t <= monthEnd.getTime();
    };
    const monthEvents = events.filter((e) => inMonth(e.created_at));
    return {
      label,
      opens: monthEvents.filter((e) => e.event_type === "open").length,
      clicks: monthEvents.filter((e) => e.event_type === "click").length,
    };
  });

  const eventCountsBySend = new Map<string, { opens: number; clicks: number }>();
  for (const e of events) {
    if (!e.send_id) continue;
    const cur = eventCountsBySend.get(e.send_id) || { opens: 0, clicks: 0 };
    if (e.event_type === "open") cur.opens++;
    if (e.event_type === "click") cur.clicks++;
    eventCountsBySend.set(e.send_id, cur);
  }

  const recentSends = sends.slice(0, 12).map((s) => ({
    id: s.id,
    emailType: s.email_type as EmailFunnelType,
    recipientEmail: s.recipient_email,
    status: s.status as EmailSendStatus,
    sentAt: s.sent_at,
    opens: eventCountsBySend.get(s.id)?.opens ?? 0,
    clicks: eventCountsBySend.get(s.id)?.clicks ?? 0,
  }));

  const linkCounts = new Map<string, number>();
  for (const e of events) {
    if (e.event_type !== "click" || !e.link_url) continue;
    linkCounts.set(e.link_url, (linkCounts.get(e.link_url) || 0) + 1);
  }
  const topLinks = [...linkCounts.entries()]
    .map(([url, clicks]) => ({ url, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 6);

  return {
    periodDays: PERIOD_DAYS,
    updatedAt: new Date().toISOString(),
    audienceSize,
    healthScore: healthScore(overall),
    overall,
    welcome,
    weeklyBrief,
    promotion,
    sendsTimeline,
    engagementTimeline,
    recentSends,
    topLinks,
  };
}
