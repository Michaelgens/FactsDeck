import { createServerClient, isSupabaseConfigured } from "./supabase/server";
import type { SupportTicketMessageRow, SupportTicketRow } from "./support-types";
import { UNRESOLVED_STATUSES } from "./support-types";

export type SupportTicketWithMessages = SupportTicketRow & {
  messages: SupportTicketMessageRow[];
};

export type AdminSupportInsights = {
  open: number;
  pending: number;
  resolved: number;
  closed: number;
  total: number;
  unresolved: number;
  urgent: number;
  today: number;
};

export type AdminSupportPageData = {
  tickets: SupportTicketWithMessages[];
  insights: AdminSupportInsights;
};

function emptyInsights(): AdminSupportInsights {
  return { open: 0, pending: 0, resolved: 0, closed: 0, total: 0, unresolved: 0, urgent: 0, today: 0 };
}

export async function loadAdminSupportPageData(): Promise<AdminSupportPageData> {
  if (!isSupabaseConfigured()) {
    return { tickets: [], insights: emptyInsights() };
  }

  const supabase = createServerClient();
  const { data: tickets, error } = await supabase
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error || !tickets) {
    console.error("[loadAdminSupportPageData]", error);
    return { tickets: [], insights: emptyInsights() };
  }

  const ticketIds = tickets.map((t) => t.id);
  let messages: SupportTicketMessageRow[] = [];

  if (ticketIds.length > 0) {
    const { data: msgRows } = await supabase
      .from("support_ticket_messages")
      .select("*")
      .in("ticket_id", ticketIds)
      .order("created_at", { ascending: true });
    messages = (msgRows ?? []) as SupportTicketMessageRow[];
  }

  const byTicket = new Map<string, SupportTicketMessageRow[]>();
  for (const m of messages) {
    const list = byTicket.get(m.ticket_id) ?? [];
    list.push(m);
    byTicket.set(m.ticket_id, list);
  }

  const withMessages: SupportTicketWithMessages[] = tickets.map((t) => ({
    ...(t as SupportTicketRow),
    messages: byTicket.get(t.id) ?? [],
  }));

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const insights: AdminSupportInsights = {
    open: tickets.filter((t) => t.status === "open").length,
    pending: tickets.filter((t) => t.status === "pending").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
    total: tickets.length,
    unresolved: tickets.filter((t) => UNRESOLVED_STATUSES.includes(t.status as "open" | "pending")).length,
    urgent: tickets.filter((t) => t.priority === "urgent" && UNRESOLVED_STATUSES.includes(t.status as "open" | "pending"))
      .length,
    today: tickets.filter((t) => new Date(t.created_at) >= todayStart).length,
  };

  return { tickets: withMessages, insights };
}
