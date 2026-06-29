"use client";

import { useEffect, useMemo, useRef } from "react";
import { X } from "lucide-react";
import type { SupportTicketMessageRow } from "../../lib/support-types";
import type { SupportTicketWithMessages } from "../../lib/admin-support-page-data";

type ChatMessage = {
  id: string;
  direction: "inbound" | "outbound";
  authorName: string;
  body: string;
  createdAt: string;
};

function chatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function chatDateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

function buildMessages(ticket: SupportTicketWithMessages): ChatMessage[] {
  if (ticket.messages.length > 0) {
    return ticket.messages.map((m: SupportTicketMessageRow) => ({
      id: m.id,
      direction: m.direction,
      authorName: m.author_name,
      body: m.body,
      createdAt: m.created_at,
    }));
  }
  return [
    {
      id: "initial",
      direction: "inbound",
      authorName: ticket.name,
      body: ticket.message,
      createdAt: ticket.created_at,
    },
  ];
}

function groupByDate(messages: ChatMessage[]) {
  const groups: { label: string; items: ChatMessage[] }[] = [];
  for (const msg of messages) {
    const label = chatDateLabel(msg.createdAt);
    const last = groups[groups.length - 1];
    if (last?.label === label) {
      last.items.push(msg);
    } else {
      groups.push({ label, items: [msg] });
    }
  }
  return groups;
}

function Bubble({
  msg,
  isUser,
}: {
  msg: ChatMessage;
  isUser: boolean;
}) {
  return (
    <div className={`flex ${isUser ? "justify-start" : "justify-end"} mb-1`}>
      <div
        className={`relative max-w-[85%] sm:max-w-[72%] px-3 py-2 shadow-sm ${
          isUser
            ? "rounded-2xl rounded-tl-sm bg-white text-slate-800"
            : "rounded-2xl rounded-tr-sm bg-[#dcf8c6] text-slate-900"
        }`}
      >
        {!isUser ? (
          <p className="text-[10px] font-semibold text-emerald-800/70 mb-0.5">{msg.authorName}</p>
        ) : null}
        <p className="text-[13.5px] leading-[1.45] whitespace-pre-wrap break-words">{msg.body}</p>
        <p
          className={`mt-1 text-[10px] text-right tabular-nums ${
            isUser ? "text-slate-400" : "text-emerald-900/45"
          }`}
        >
          {chatTime(msg.createdAt)}
        </p>
      </div>
    </div>
  );
}

export default function SupportChatPreviewModal({
  ticket,
  onClose,
}: {
  ticket: SupportTicketWithMessages;
  onClose: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messages = useMemo(() => buildMessages(ticket), [ticket]);
  const groups = useMemo(() => groupByDate(messages), [messages]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [ticket.id, messages.length]);

  const firstName = ticket.name.split(" ")[0] || ticket.name;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-preview-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close conversation preview"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/10 animate-in fade-in zoom-in-95 duration-200">
        {/* WhatsApp-style header */}
        <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3 text-white">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#128c7e] text-sm font-bold uppercase">
            {firstName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p id="chat-preview-title" className="truncate text-sm font-semibold">
              {ticket.name}
            </p>
            <p className="truncate text-xs text-emerald-100/80">
              {ticket.ticket_number} · {ticket.subject}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat body */}
        <div
          ref={scrollRef}
          className="h-[min(32rem,70vh)] overflow-y-auto px-3 py-4"
          style={{
            backgroundColor: "#e5ddd5",
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4cdc4' fill-opacity='0.45'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          <p className="mb-4 text-center text-[11px] text-slate-500/90">
            Messages are sent by email — this preview shows the thread as a chat.
          </p>

          {groups.map((group) => (
            <div key={group.label} className="mb-4">
              <div className="mb-3 flex justify-center">
                <span className="rounded-lg bg-[#d1ecc8]/90 px-3 py-1 text-[11px] font-medium text-slate-600 shadow-sm">
                  {group.label}
                </span>
              </div>
              {group.items.map((msg) => (
                <Bubble key={msg.id} msg={msg} isUser={msg.direction === "inbound"} />
              ))}
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="border-t border-slate-200/80 bg-[#f0f0f0] px-4 py-2.5 text-center text-[11px] text-slate-500">
          <span className="font-medium text-slate-600">User</span> on the left ·{" "}
          <span className="font-medium text-emerald-700">Facts Deck</span> on the right
        </div>
      </div>
    </div>
  );
}
