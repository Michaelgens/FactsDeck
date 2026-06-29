"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, isSupabaseConfigured } from "./supabase/server";
import { verifyAdminForAction, getAdminSession } from "./admin-auth";
import {
  type SupportTicketPriority,
  type SupportTicketStatus,
  UNRESOLVED_STATUSES,
} from "./support-types";
import { sendSupportReplyEmail } from "./support-email-client";

const VALID_STATUSES: SupportTicketStatus[] = ["open", "pending", "resolved", "closed"];
const VALID_PRIORITIES: SupportTicketPriority[] = ["low", "normal", "high", "urgent"];

export async function updateTicketStatus(
  ticketId: string,
  status: SupportTicketStatus
): Promise<{ ok: boolean; error?: string }> {
  const auth = await verifyAdminForAction();
  if (!auth.ok) return auth;
  if (!VALID_STATUSES.includes(status)) return { ok: false, error: "Invalid status" };

  const supabase = createServerClient();
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    status,
    updated_at: now,
    resolved_at: status === "resolved" || status === "closed" ? now : null,
  };

  const { error } = await supabase.from("support_tickets").update(patch).eq("id", ticketId);
  if (error) return { ok: false, error: "Could not update status" };

  revalidatePath("/admin/support");
  return { ok: true };
}

export async function updateTicketPriority(
  ticketId: string,
  priority: SupportTicketPriority
): Promise<{ ok: boolean; error?: string }> {
  const auth = await verifyAdminForAction();
  if (!auth.ok) return auth;
  if (!VALID_PRIORITIES.includes(priority)) return { ok: false, error: "Invalid priority" };

  const supabase = createServerClient();
  const { error } = await supabase
    .from("support_tickets")
    .update({ priority, updated_at: new Date().toISOString() })
    .eq("id", ticketId);

  if (error) return { ok: false, error: "Could not update priority" };
  revalidatePath("/admin/support");
  return { ok: true };
}

export async function assignTicketToSelf(ticketId: string): Promise<{ ok: boolean; error?: string }> {
  const auth = await verifyAdminForAction();
  if (!auth.ok) return auth;

  const session = await getAdminSession();
  const adminEmail = session?.user?.email;
  if (!adminEmail) return { ok: false, error: "No admin session" };

  const supabase = createServerClient();
  const { error } = await supabase
    .from("support_tickets")
    .update({
      assigned_admin_email: adminEmail,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticketId);

  if (error) return { ok: false, error: "Could not assign ticket" };
  revalidatePath("/admin/support");
  return { ok: true };
}

export async function sendTicketReply(input: {
  ticketId: string;
  subject: string;
  body: string;
  markResolved?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const auth = await verifyAdminForAction();
  if (!auth.ok) return auth;

  const subject = input.subject?.trim();
  const body = input.body?.trim();
  if (!subject || subject.length < 3) return { ok: false, error: "Subject is required" };
  if (!body || body.length < 10) return { ok: false, error: "Reply body is too short" };

  const session = await getAdminSession();
  const adminEmail = session?.user?.email ?? "support@factsdeck.com";
  const adminName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.user_metadata?.name ||
    adminEmail.split("@")[0] ||
    "Facts Deck Support";

  const supabase = createServerClient();
  const { data: ticket, error: fetchError } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("id", input.ticketId)
    .single();

  if (fetchError || !ticket) return { ok: false, error: "Ticket not found" };

  const emailResult = await sendSupportReplyEmail({
    email: ticket.email,
    name: ticket.name,
    ticketNumber: ticket.ticket_number,
    subject,
    body,
    adminName,
    adminEmail,
  });

  if (!emailResult.ok) return { ok: false, error: emailResult.error ?? "Email failed" };

  const now = new Date().toISOString();
  const currentStatus = ticket.status as SupportTicketStatus;
  const nextStatus: SupportTicketStatus = input.markResolved
    ? "resolved"
    : currentStatus === "open"
      ? "pending"
      : currentStatus;

  await supabase.from("support_ticket_messages").insert({
    ticket_id: ticket.id,
    direction: "outbound",
    author_name: adminName,
    author_email: adminEmail,
    body,
    email_message_id: emailResult.messageId ?? null,
  });

  await supabase
    .from("support_tickets")
    .update({
      status: nextStatus,
      last_reply_at: now,
      last_reply_by: adminName,
      assigned_admin_email: adminEmail,
      updated_at: now,
      resolved_at: nextStatus === "resolved" ? now : ticket.resolved_at,
    })
    .eq("id", ticket.id);

  revalidatePath("/admin/support");
  return { ok: true };
}

export async function getUnresolvedTicketCount(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  try {
    const supabase = createServerClient();
    const { count, error } = await supabase
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .in("status", UNRESOLVED_STATUSES);

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}
