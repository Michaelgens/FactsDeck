"use server";

import { headers } from "next/headers";
import { createServerClient, isSupabaseConfigured } from "./supabase/server";
import {
  type ContactFormPayload,
  type SupportTicketPriority,
  departmentInbox,
  generateTicketNumber,
} from "./support-types";
import { notifySupportTicketCreated } from "./support-email-client";
import { clientIpFromHeaders } from "./engagement-rate-limit";

const contactBuckets = new Map<string, { count: number; resetAt: number }>();
const MAX_CONTACT_PER_HOUR = 5;

function checkContactRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = contactBuckets.get(ip);
  if (!entry || now > entry.resetAt) {
    contactBuckets.set(ip, { count: 1, resetAt: now + 3_600_000 });
    return true;
  }
  if (entry.count >= MAX_CONTACT_PER_HOUR) return false;
  entry.count += 1;
  return true;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

const VALID_PRIORITIES: SupportTicketPriority[] = ["low", "normal", "high", "urgent"];

export async function submitContactForm(
  payload: ContactFormPayload
): Promise<{ ok: boolean; ticketNumber?: string; error?: string }> {
  const name = payload.name?.trim();
  const email = payload.email?.trim().toLowerCase();
  const subject = payload.subject?.trim();
  const message = payload.message?.trim();
  const department = payload.department?.trim() || "General Inquiries";
  const priority = VALID_PRIORITIES.includes(payload.priority) ? payload.priority : "normal";

  if (!name || name.length < 2) return { ok: false, error: "Please enter your name." };
  if (!email || !isValidEmail(email)) return { ok: false, error: "Please enter a valid email." };
  if (!subject || subject.length < 3) return { ok: false, error: "Please enter a subject." };
  if (!message || message.length < 10) return { ok: false, error: "Please enter a longer message." };
  if (message.length > 8000) return { ok: false, error: "Message is too long." };

  const hdrs = await headers();
  const ip = clientIpFromHeaders(hdrs);
  if (!checkContactRateLimit(ip)) {
    return { ok: false, error: "Too many messages from this connection. Please try again later." };
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Support desk is temporarily unavailable. Please email hello@factsdeck.com." };
  }

  const ticketNumber = generateTicketNumber();
  const supabase = createServerClient();

  const { data: ticket, error: insertError } = await supabase
    .from("support_tickets")
    .insert({
      ticket_number: ticketNumber,
      name,
      email,
      department,
      priority,
      subject,
      message,
      status: "open",
    })
    .select("id")
    .single();

  if (insertError || !ticket) {
    console.error("[submitContactForm] insert failed:", insertError);
    return { ok: false, error: "Could not save your message. Please try again." };
  }

  await supabase.from("support_ticket_messages").insert({
    ticket_id: ticket.id,
    direction: "inbound",
    author_name: name,
    author_email: email,
    body: message,
  });

  const emailResult = await notifySupportTicketCreated({
    email,
    name,
    ticketNumber,
    subject,
    department,
    priority,
    message,
    departmentInbox: departmentInbox(department),
  });

  if (!emailResult.ok) {
    console.warn("[submitContactForm] acknowledgment email failed:", emailResult.error);
  }

  return { ok: true, ticketNumber };
}
