export const EMAIL_FUNNEL_TYPES = ["welcome", "weekly-brief", "promotion"] as const;
export type EmailFunnelType = (typeof EMAIL_FUNNEL_TYPES)[number];

export type EmailSendStatus = "pending" | "sent" | "failed" | "bounced";

export type EmailEventType = "open" | "click" | "bounce" | "spam_complaint" | "unsubscribe";

export type EmailTypeMetrics = {
  type: EmailFunnelType | "all";
  label: string;
  attempted: number;
  delivered: number;
  deliveryRate: number;
  bounced: number;
  bounceRate: number;
  opened: number;
  openRate: number;
  clicked: number;
  clickThroughRate: number;
  clickToOpenRate: number;
  spamComplaints: number;
  spamComplaintRate: number;
  unsubscribed: number;
  unsubscribeRate: number;
};

export type EmailFunnelInsights = {
  periodDays: number;
  updatedAt: string;
  audienceSize: number;
  healthScore: number;
  overall: EmailTypeMetrics;
  welcome: EmailTypeMetrics;
  weeklyBrief: EmailTypeMetrics;
  promotion: EmailTypeMetrics;
  sendsTimeline: Array<{
    label: string;
    welcome: number;
    weeklyBrief: number;
    promotion: number;
  }>;
  engagementTimeline: Array<{
    label: string;
    opens: number;
    clicks: number;
  }>;
  recentSends: Array<WelcomeSendRow>;
  topLinks: Array<{ url: string; clicks: number }>;
};

export type WelcomeSendRow = {
  id: string;
  emailType: EmailFunnelType;
  recipientEmail: string;
  status: EmailSendStatus;
  sentAt: string;
  opens: number;
  clicks: number;
};

export type WelcomeSendsPage = {
  rows: WelcomeSendRow[];
  total: number;
  page: number;
  limit: number;
  query: string;
};

export function isValidFunnelType(value: string): value is EmailFunnelType {
  return EMAIL_FUNNEL_TYPES.includes(value as EmailFunnelType);
}

export function emptyMetrics(type: EmailTypeMetrics["type"], label: string): EmailTypeMetrics {
  return {
    type,
    label,
    attempted: 0,
    delivered: 0,
    deliveryRate: 0,
    bounced: 0,
    bounceRate: 0,
    opened: 0,
    openRate: 0,
    clicked: 0,
    clickThroughRate: 0,
    clickToOpenRate: 0,
    spamComplaints: 0,
    spamComplaintRate: 0,
    unsubscribed: 0,
    unsubscribeRate: 0,
  };
}
