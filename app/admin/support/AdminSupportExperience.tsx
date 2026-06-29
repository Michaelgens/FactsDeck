"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Inbox,
  Mail,
  MessageSquare,
  MessagesSquare,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import type { AdminSupportPageData, SupportTicketWithMessages } from "../../lib/admin-support-page-data";
import {
  applyReplyTemplate,
  priorityLabel,
  statusLabel,
  SUPPORT_REPLY_TEMPLATES,
  UNRESOLVED_STATUSES,
  type SupportTicketPriority,
  type SupportTicketStatus,
} from "../../lib/support-types";
import {
  assignTicketToSelf,
  sendTicketReply,
  updateTicketPriority,
  updateTicketStatus,
} from "../../lib/admin-support-actions";
import { previewSupportReplyEmail } from "../../lib/support-email-client";
import { AdminAlert, AdminPageHeader, AdminPanel, KpiCard } from "../components/admin-ui";
import { admin } from "../components/admin-theme";
import { AdminRefreshButton, AdminRefreshShell, adminSyncLabel } from "../components/admin-refresh-ui";
import SupportChatPreviewModal from "./SupportChatPreviewModal";

type StatusFilter = "all" | SupportTicketStatus | "unresolved";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unresolved", label: "Unresolved" },
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

function priorityBadge(priority: SupportTicketPriority) {
  const styles: Record<SupportTicketPriority, string> = {
    low: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300",
    normal: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
    high: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    urgent: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
  };
  return styles[priority] ?? styles.normal;
}

function statusBadge(status: SupportTicketStatus) {
  const styles: Record<SupportTicketStatus, string> = {
    open: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    closed: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400",
  };
  return styles[status] ?? styles.open;
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminSupportExperience({ initialData }: { initialData: AdminSupportPageData }) {
  const [tickets, setTickets] = useState(initialData.tickets);
  const [insights, setInsights] = useState(initialData.insights);
  const [selectedId, setSelectedId] = useState<string | null>(initialData.tickets[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("unresolved");
  const [priorityFilter, setPriorityFilter] = useState<SupportTicketPriority | "all">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [justSynced, setJustSynced] = useState(false);

  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [markResolved, setMarkResolved] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [actionPending, setActionPending] = useState(false);
  const [showChatPreview, setShowChatPreview] = useState(false);

  useEffect(() => {
    setTickets(initialData.tickets);
    setInsights(initialData.insights);
  }, [initialData]);

  useEffect(() => {
    if (!justSynced) return;
    const id = window.setTimeout(() => setJustSynced(false), 2400);
    return () => window.clearTimeout(id);
  }, [justSynced]);

  const refresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setRefreshError(null);
    try {
      const res = await fetch("/api/admin/support", { cache: "no-store" });
      if (!res.ok) throw new Error(res.status === 401 ? "Session expired." : "Could not refresh tickets.");
      const next = (await res.json()) as AdminSupportPageData;
      setTickets(next.tickets);
      setInsights(next.insights);
      setLastSyncedAt(new Date());
      setJustSynced(true);
    } catch (e) {
      setRefreshError(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((t) => {
      if (statusFilter === "unresolved" && !UNRESOLVED_STATUSES.includes(t.status)) return false;
      if (statusFilter !== "all" && statusFilter !== "unresolved" && t.status !== statusFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (!q) return true;
      return (
        t.ticket_number.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q)
      );
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const selected = useMemo(
    () => tickets.find((t) => t.id === selectedId) ?? filtered[0] ?? null,
    [tickets, selectedId, filtered]
  );

  useEffect(() => {
    if (!selected) {
      setReplySubject("");
      setReplyBody("");
      return;
    }
    setReplySubject(`Re: ${selected.subject} [${selected.ticket_number}]`);
    const defaultTemplate = SUPPORT_REPLY_TEMPLATES[0];
    setReplyBody(
      applyReplyTemplate(defaultTemplate.body, {
        name: selected.name.split(" ")[0] || selected.name,
        subject: selected.subject,
        ticket_number: selected.ticket_number,
        department: selected.department,
      })
    );
    setMarkResolved(false);
    setSendError(null);
    setSendSuccess(false);
    setPreviewHtml(null);
    setShowChatPreview(false);
  }, [selected?.id]);

  const applyTemplate = (templateId: string) => {
    if (!selected) return;
    const tpl = SUPPORT_REPLY_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    setReplySubject(`${tpl.subjectPrefix} ${selected.subject} [${selected.ticket_number}]`);
    setReplyBody(
      applyReplyTemplate(tpl.body, {
        name: selected.name.split(" ")[0] || selected.name,
        subject: selected.subject,
        ticket_number: selected.ticket_number,
        department: selected.department,
      })
    );
    if (templateId === "resolved") setMarkResolved(true);
  };

  const handlePreview = async () => {
    if (!selected) return;
    setIsPreviewLoading(true);
    setPreviewHtml(null);
    const result = await previewSupportReplyEmail({
      email: selected.email,
      name: selected.name,
      ticketNumber: selected.ticket_number,
      subject: replySubject,
      body: replyBody,
      adminName: "Facts Deck Support",
    });
    setIsPreviewLoading(false);
    if (result.ok && result.html) setPreviewHtml(result.html);
  };

  const handleSend = async () => {
    if (!selected || isSending) return;
    setIsSending(true);
    setSendError(null);
    setSendSuccess(false);
    const result = await sendTicketReply({
      ticketId: selected.id,
      subject: replySubject,
      body: replyBody,
      markResolved,
    });
    setIsSending(false);
    if (!result.ok) {
      setSendError(result.error ?? "Send failed");
      return;
    }
    setSendSuccess(true);
    await refresh();
  };

  const patchTicket = async (id: string, patch: Partial<SupportTicketWithMessages>) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const handleStatusChange = async (status: SupportTicketStatus) => {
    if (!selected || actionPending) return;
    setActionPending(true);
    const result = await updateTicketStatus(selected.id, status);
    setActionPending(false);
    if (result.ok) {
      await patchTicket(selected.id, { status });
      await refresh();
    }
  };

  const handlePriorityChange = async (priority: SupportTicketPriority) => {
    if (!selected || actionPending) return;
    setActionPending(true);
    const result = await updateTicketPriority(selected.id, priority);
    setActionPending(false);
    if (result.ok) {
      await patchTicket(selected.id, { priority });
      await refresh();
    }
  };

  const handleAssign = async () => {
    if (!selected || actionPending) return;
    setActionPending(true);
    const result = await assignTicketToSelf(selected.id);
    setActionPending(false);
    if (result.ok) await refresh();
  };

  return (
    <div>
      {refreshError ? (
        <AdminAlert title="Refresh failed" variant="error">
          {refreshError}
        </AdminAlert>
      ) : null}

      <AdminPageHeader
        title="Support desk"
        description="Contact form tickets, threaded replies, and email templates — reply goes straight to the user's inbox."
      >
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <AdminRefreshButton
            isRefreshing={isRefreshing}
            justSynced={justSynced}
            onRefresh={refresh}
            syncedLabel="Tickets updated"
          />
          <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 sm:text-right">
            {adminSyncLabel(lastSyncedAt)}
          </p>
        </div>
      </AdminPageHeader>

      <AdminRefreshShell isRefreshing={isRefreshing} loadingTitle="Refreshing support desk" loadingDescription="Updating tickets and counts">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard name="Unresolved" value={String(insights.unresolved)} sub={`${insights.urgent} urgent`} icon={Inbox} gradient="from-violet-500 to-purple-600" />
        <KpiCard name="Open" value={String(insights.open)} sub="Awaiting first reply" icon={MessageSquare} gradient="from-sky-500 to-blue-600" />
        <KpiCard name="Pending" value={String(insights.pending)} sub="Awaiting customer" icon={Clock} gradient="from-amber-500 to-orange-600" />
        <KpiCard name="Today" value={String(insights.today)} sub={`${insights.total} total`} icon={Zap} gradient="from-emerald-500 to-teal-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Ticket list */}
        <div className="xl:col-span-4 space-y-4">
          <AdminPanel title="Inbox" className="!p-0 overflow-hidden [&>div:last-child]:!p-0">
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tickets…"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm ${admin.input}`}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatusFilter(opt.value)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      statusFilter === opt.value
                        ? "bg-violet-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as SupportTicketPriority | "all")}
                className={`w-full text-sm rounded-lg px-3 py-2 ${admin.input}`}
              >
                <option value="all">All priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>

            <ul className="max-h-[32rem] overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800">
              {filtered.length === 0 ? (
                <li className="p-8 text-center text-sm text-slate-500 dark:text-zinc-400">
                  <Inbox className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  No tickets match your filters.
                </li>
              ) : (
                filtered.map((ticket) => {
                  const active = selected?.id === ticket.id;
                  return (
                    <li key={ticket.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(ticket.id)}
                        className={`w-full text-left p-4 transition-colors ${
                          active
                            ? "bg-violet-50 dark:bg-violet-950/30 border-l-2 border-violet-500"
                            : "hover:bg-slate-50 dark:hover:bg-zinc-900/50 border-l-2 border-transparent"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-xs font-mono font-semibold text-violet-600 dark:text-violet-400">
                            {ticket.ticket_number}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">{formatWhen(ticket.created_at)}</span>
                        </div>
                        <p className={`text-sm font-semibold truncate ${admin.heading}`}>{ticket.subject}</p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                          {ticket.name} · {ticket.email}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${statusBadge(ticket.status)}`}>
                            {statusLabel(ticket.status)}
                          </span>
                          <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${priorityBadge(ticket.priority)}`}>
                            {priorityLabel(ticket.priority)}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </AdminPanel>
        </div>

        {/* Detail + reply */}
        <div className="xl:col-span-8 space-y-4">
          {!selected ? (
            <AdminPanel title="No ticket selected">
              <p className={`text-sm ${admin.body}`}>Select a ticket from the list to view the thread and reply.</p>
            </AdminPanel>
          ) : (
            <>
              <AdminPanel title="Ticket details">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-mono font-semibold text-violet-600 dark:text-violet-400 mb-1">
                      {selected.ticket_number}
                    </p>
                    <h2 className={`text-xl font-bold ${admin.heading}`}>{selected.subject}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-zinc-400">
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {selected.name}
                      </span>
                      <a href={`mailto:${selected.email}`} className="inline-flex items-center gap-1 text-violet-600 hover:underline dark:text-violet-400">
                        <Mail className="h-3.5 w-3.5" />
                        {selected.email}
                      </a>
                      <span>{selected.department}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <select
                      value={selected.status}
                      onChange={(e) => handleStatusChange(e.target.value as SupportTicketStatus)}
                      disabled={actionPending}
                      className={`text-sm rounded-lg px-3 py-2 ${admin.input}`}
                    >
                      <option value="open">Open</option>
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <select
                      value={selected.priority}
                      onChange={(e) => handlePriorityChange(e.target.value as SupportTicketPriority)}
                      disabled={actionPending}
                      className={`text-sm rounded-lg px-3 py-2 ${admin.input}`}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAssign}
                      disabled={actionPending}
                      className="text-sm font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800"
                    >
                      Assign to me
                    </button>
                  </div>
                </div>
                {selected.assigned_admin_email ? (
                  <p className="mt-3 text-xs text-slate-500 dark:text-zinc-400">
                    Assigned: {selected.assigned_admin_email}
                    {selected.last_reply_by ? ` · Last reply by ${selected.last_reply_by}` : ""}
                  </p>
                ) : null}
              </AdminPanel>

              {/* Thread */}
              <AdminPanel
                title="Conversation"
                action={
                  <button
                    type="button"
                    onClick={() => setShowChatPreview(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60 transition-colors"
                  >
                    <MessagesSquare className="h-3.5 w-3.5" />
                    Preview conversation
                  </button>
                }
              >
                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {selected.messages.length === 0 ? (
                    <p className="text-sm text-slate-500">{selected.message}</p>
                  ) : (
                    selected.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`rounded-xl p-4 text-sm ${
                          msg.direction === "inbound"
                            ? "bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800"
                            : "bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-semibold text-xs">
                            {msg.direction === "inbound" ? "Customer" : "Team"} · {msg.author_name}
                          </span>
                          <span className="text-[10px] text-slate-400">{formatWhen(msg.created_at)}</span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-zinc-300">{msg.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </AdminPanel>

              {/* Reply composer */}
              <AdminPanel title="Reply via email">
                <div className="mb-4">
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${admin.subtle}`}>Quick templates</p>
                  <div className="flex flex-wrap gap-2">
                    {SUPPORT_REPLY_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => applyTemplate(tpl.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-violet-100 text-slate-700 hover:text-violet-800 dark:bg-zinc-800 dark:hover:bg-violet-950/50 dark:text-zinc-200 transition-colors"
                      >
                        <Sparkles className="h-3 w-3" />
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${admin.subtle}`}>Subject</label>
                    <input
                      type="text"
                      value={replySubject}
                      onChange={(e) => setReplySubject(e.target.value)}
                      className={`w-full rounded-lg px-3 py-2 text-sm ${admin.input}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${admin.subtle}`}>Message</label>
                    <textarea
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      rows={10}
                      className={`w-full rounded-lg px-3 py-2 text-sm font-mono leading-relaxed ${admin.input}`}
                    />
                    <p className={`mt-1 text-xs ${admin.subtle}`}>
                      Edit the template above, then send — delivers to {selected.email} with your admin address as reply-to.
                    </p>
                  </div>

                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={markResolved}
                      onChange={(e) => setMarkResolved(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    Mark ticket resolved after sending
                  </label>

                  {sendError ? (
                    <AdminAlert title="Send failed" variant="error">
                      {sendError}
                    </AdminAlert>
                  ) : null}
                  {sendSuccess ? (
                    <AdminAlert title="Reply sent" variant="info">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Email delivered to {selected.email}
                      </span>
                    </AdminAlert>
                  ) : null}

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={isSending}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold disabled:opacity-60"
                    >
                      {isSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Send reply
                    </button>
                    <button
                      type="button"
                      onClick={handlePreview}
                      disabled={isPreviewLoading}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800"
                    >
                      {isPreviewLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                      Preview email
                    </button>
                  </div>
                </div>
              </AdminPanel>

              {previewHtml ? (
                <AdminPanel title="Email preview">
                  <div
                    className="rounded-lg border border-slate-200 dark:border-zinc-800 overflow-hidden bg-white"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewHtml(null)}
                    className="mt-3 text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    Close preview
                  </button>
                </AdminPanel>
              ) : null}
              {showChatPreview && selected ? (
                <SupportChatPreviewModal ticket={selected} onClose={() => setShowChatPreview(false)} />
              ) : null}
            </>
          )}
        </div>
      </div>
      </AdminRefreshShell>
    </div>
  );
}
