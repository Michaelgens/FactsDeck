import type { PromotionCampaignPerformance } from "./promotion-campaign-types";

export function pct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export function aggregateCampaignMetrics(
  sends: Array<{ id: string; status: string }>,
  events: Array<{ send_id: string | null; event_type: string }>
): Omit<
  PromotionCampaignPerformance,
  "id" | "name" | "subject" | "headline" | "status" | "createdAt" | "targeted"
> {
  const attempted = sends.length;
  const delivered = sends.filter((s) => s.status === "sent").length;
  const failed = sends.filter((s) => s.status === "failed").length;
  const bounced = sends.filter((s) => s.status === "bounced").length;

  const sendIds = new Set(sends.map((s) => s.id));
  const relevant = events.filter((e) => e.send_id && sendIds.has(e.send_id));

  const openSendIds = new Set(
    relevant.filter((e) => e.event_type === "open").map((e) => e.send_id as string)
  );
  const opened = openSendIds.size;
  const clicked = relevant.filter((e) => e.event_type === "click").length;
  const unsubscribed = relevant.filter((e) => e.event_type === "unsubscribe").length;

  const engagementBase = delivered || 1;

  return {
    delivered,
    failed,
    bounced,
    opened,
    clicked,
    unsubscribed,
    deliveryRate: pct(delivered, attempted),
    openRate: pct(opened, engagementBase),
    clickThroughRate: pct(clicked, engagementBase),
    clickToOpenRate: pct(clicked, opened || 1),
    unsubscribeRate: pct(unsubscribed, engagementBase),
  };
}
