export type SupportTicketStatus = "open" | "pending" | "resolved" | "closed";
export type SupportTicketPriority = "low" | "normal" | "high" | "urgent";
export type SupportMessageDirection = "inbound" | "outbound";

export type SupportTicketRow = {
  id: string;
  ticket_number: string;
  name: string;
  email: string;
  department: string;
  priority: SupportTicketPriority;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  assigned_admin_email: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  last_reply_at: string | null;
  last_reply_by: string | null;
};

export type SupportTicketMessageRow = {
  id: string;
  ticket_id: string;
  direction: SupportMessageDirection;
  author_name: string;
  author_email: string;
  body: string;
  email_message_id: string | null;
  created_at: string;
};

export type ContactFormPayload = {
  name: string;
  email: string;
  subject: string;
  department: string;
  message: string;
  priority: SupportTicketPriority;
};

export const SUPPORT_DEPARTMENTS = [
  { name: "General Inquiries", email: "hello@factsdeck.com" },
  { name: "Editorial Team", email: "editorial@factsdeck.com" },
  { name: "Technical Support", email: "tech@factsdeck.com" },
  { name: "Business Partnerships", email: "partnerships@factsdeck.com" },
  { name: "Press & Media", email: "press@factsdeck.com" },
  { name: "Careers", email: "careers@factsdeck.com" },
] as const;

export const UNRESOLVED_STATUSES: SupportTicketStatus[] = ["open", "pending"];

export type ReplyTemplate = {
  id: string;
  label: string;
  description: string;
  subjectPrefix: string;
  body: string;
};

export const SUPPORT_REPLY_TEMPLATES: ReplyTemplate[] = [
  {
    id: "received",
    label: "We received your message",
    description: "Acknowledge and set expectations",
    subjectPrefix: "Re:",
    body: `Hi {{name}},

Thank you for contacting Facts Deck — we've received your message regarding "{{subject}}".

Our {{department}} team is reviewing your request and will follow up with more detail shortly. Typical response time is within one business day.

If you have additional context to share, reply to this email and your ticket ({{ticket_number}}) will update automatically.

Warm regards,
Facts Deck Support`,
  },
  {
    id: "need-info",
    label: "Need more information",
    description: "Ask for screenshots or details",
    subjectPrefix: "Re:",
    body: `Hi {{name}},

Thanks for reaching out about "{{subject}}".

To help us investigate ticket {{ticket_number}}, could you reply with:
• A brief description of what you expected vs. what happened
• Any relevant URLs or screenshots
• Your browser/device if this is a technical issue

We'll pick this up as soon as we have those details.

Best,
Facts Deck Support`,
  },
  {
    id: "resolved",
    label: "Issue resolved",
    description: "Close the loop positively",
    subjectPrefix: "Resolved:",
    body: `Hi {{name}},

Good news — we've addressed your request regarding "{{subject}}" (ticket {{ticket_number}}).

Here's what we did:
[Summarize the fix or answer in one or two sentences before sending.]

If anything still looks off, reply here and we'll reopen your ticket.

Thanks for reading Facts Deck,
Facts Deck Support`,
  },
  {
    id: "editorial",
    label: "Editorial pitch response",
    description: "For contributor inquiries",
    subjectPrefix: "Re:",
    body: `Hi {{name}},

Thank you for your interest in contributing to Facts Deck.

We've logged your pitch under ticket {{ticket_number}}. Our editorial team reviews submissions weekly. If your topic aligns with our coverage, we'll reply with next steps.

In the meantime, please share:
• Your credentials or portfolio link
• A proposed headline and 2–3 sentence outline

Best,
Facts Deck Editorial`,
  },
];

export function applyReplyTemplate(
  template: string,
  vars: Record<string, string>
): string {
  let out = template;
  for (const [key, val] of Object.entries(vars)) {
    out = out.replaceAll(`{{${key}}}`, val);
  }
  return out;
}

export function generateTicketNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `FD-${year}-${rand}`;
}

export function departmentInbox(department: string): string {
  return (
    SUPPORT_DEPARTMENTS.find((d) => d.name === department)?.email ?? "hello@factsdeck.com"
  );
}

export function priorityLabel(priority: SupportTicketPriority): string {
  const map: Record<SupportTicketPriority, string> = {
    low: "Low",
    normal: "Normal",
    high: "High",
    urgent: "Urgent",
  };
  return map[priority] ?? priority;
}

export function statusLabel(status: SupportTicketStatus): string {
  const map: Record<SupportTicketStatus, string> = {
    open: "Open",
    pending: "Pending",
    resolved: "Resolved",
    closed: "Closed",
  };
  return map[status] ?? status;
}
