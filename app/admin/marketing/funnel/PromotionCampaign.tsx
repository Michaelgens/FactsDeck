"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Eye, Loader2, Search, Send, Sparkles, CheckSquare, Square } from "lucide-react";
import type { EmailTypeMetrics } from "@/app/lib/email-funnel-types";
import type {
  PromotionCampaignPerformance,
  PromotionTemplate,
  SubscribersPage,
} from "@/app/lib/promotion-campaign-types";
import {
  DEFAULT_PROMOTION_TEMPLATE,
  PROMOTION_PRESETS,
} from "@/app/lib/promotion-campaign-types";
import { previewPromotionEmail, sendPromotionCampaign } from "@/app/lib/promotion-campaign-actions";
import { formatCount } from "@/app/lib/admin";
import { admin } from "../../components/admin-theme";
import { AdminPanel } from "../../components/admin-ui";
import AdminPagination from "../../components/AdminPagination";
import EmailTestLab from "./EmailTestLab";
import { MetricsGrid, TypePanelHeader } from "./funnel-shared";

const inputClass = `w-full rounded-xl px-4 py-2.5 text-sm ${admin.input}`;

type SelectionMode = "manual" | "all";

type Props = {
  metrics: EmailTypeMetrics;
  subscribersPage: SubscribersPage;
  totalAllSubscribers: number;
  campaigns: PromotionCampaignPerformance[];
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export default function PromotionCampaign({
  metrics,
  subscribersPage,
  totalAllSubscribers,
  campaigns,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [template, setTemplate] = useState<PromotionTemplate>({ ...DEFAULT_PROMOTION_TEMPLATE });
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("manual");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [searchInput, setSearchInput] = useState(subscribersPage.query);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewSubject, setPreviewSubject] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    sent: number;
    failed: number;
    queued?: boolean;
    targeted?: number;
    error?: string;
  } | null>(null);

  const hasSendingCampaign = campaigns.some((c) => c.status === "sending");

  useEffect(() => {
    if (!hasSendingCampaign) return;
    const id = window.setInterval(() => router.refresh(), 15_000);
    return () => window.clearInterval(id);
  }, [hasSendingCampaign, router]);

  const rows = subscribersPage.rows;

  function isRowSelected(email: string): boolean {
    const key = normalizeEmail(email);
    return selectionMode === "all" ? !excluded.has(key) : selected.has(key);
  }

  const selectedCount =
    selectionMode === "all"
      ? Math.max(0, totalAllSubscribers - excluded.size)
      : selected.size;

  const canSend = selectedCount > 0 && !sending;

  const allPageSelected = rows.length > 0 && rows.every((s) => isRowSelected(s.email));

  function pushParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "promotion");
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    pushParams({ promoPage: "1", promoQ: searchInput.trim() || undefined });
  }

  function toggleAllOnPage() {
    if (selectionMode === "all") {
      setExcluded((prev) => {
        const next = new Set(prev);
        if (allPageSelected) {
          rows.forEach((s) => next.add(normalizeEmail(s.email)));
        } else {
          rows.forEach((s) => next.delete(normalizeEmail(s.email)));
        }
        return next;
      });
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        rows.forEach((s) => next.delete(normalizeEmail(s.email)));
      } else {
        rows.forEach((s) => next.add(normalizeEmail(s.email)));
      }
      return next;
    });
  }

  function toggleOne(email: string) {
    const key = normalizeEmail(email);
    if (selectionMode === "all") {
      setExcluded((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectAllOnPage() {
    if (selectionMode === "all") {
      setExcluded((prev) => {
        const next = new Set(prev);
        rows.forEach((s) => next.delete(normalizeEmail(s.email)));
        return next;
      });
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      rows.forEach((s) => next.add(normalizeEmail(s.email)));
      return next;
    });
  }

  function selectAllSubscribers() {
    setSelectionMode("all");
    setSelected(new Set());
    setExcluded(new Set());
  }

  function clearSelection() {
    setSelectionMode("manual");
    setSelected(new Set());
    setExcluded(new Set());
  }

  function applyPreset(id: string) {
    const preset = PROMOTION_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setTemplate((t) => ({ ...t, ...preset.template }));
  }

  function updateField<K extends keyof PromotionTemplate>(key: K, value: PromotionTemplate[K]) {
    setTemplate((t) => ({ ...t, [key]: value }));
  }

  async function handlePreview() {
    setLoadingPreview(true);
    setResult(null);
    const res = await previewPromotionEmail(template);
    setLoadingPreview(false);
    if (!res.ok) {
      setResult({ sent: 0, failed: 0, error: res.error });
      return;
    }
    setPreviewHtml(res.html);
    setPreviewSubject(res.subject);
    setPreviewOpen(true);
  }

  async function handleSend() {
    if (selectedCount === 0) return;
    if (!confirm(`Send promotion to ${formatCount(selectedCount)} selected recipient(s)?`)) return;

    setSending(true);
    setResult(null);
    const selection =
      selectionMode === "all"
        ? { mode: "all" as const, excludeEmails: [...excluded] }
        : { mode: "explicit" as const, emails: [...selected] };
    const res = await sendPromotionCampaign(selection, template);
    setSending(false);
    setResult({
      sent: res.sent,
      failed: res.failed,
      queued: res.queued,
      targeted: res.targeted,
      error: res.error || (res.failures?.length ? res.failures.join("; ") : undefined),
    });
    if (res.ok && (res.queued || res.sent > 0)) {
      clearSelection();
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <TypePanelHeader metrics={metrics} />
      <MetricsGrid metrics={metrics} />

      <EmailTestLab emailType="promotion" accent="purple" promotionTemplate={template} />

      <AdminPanel
        title="Campaign history"
        description="Per-campaign delivery and engagement after each send"
      >
        {campaigns.length === 0 ? (
          <p className={`text-sm text-center py-8 ${admin.subtle}`}>
            No promotion campaigns yet. Compose and send your first campaign below.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className={`border-b ${admin.divide}`}>
                  <th className={`text-left py-2 pr-3 font-semibold ${admin.label}`}>Campaign</th>
                  <th className={`text-left py-2 font-semibold ${admin.label}`}>Status</th>
                  <th className={`text-right py-2 px-2 font-semibold ${admin.label}`}>Targeted</th>
                  <th className={`text-right py-2 px-2 font-semibold ${admin.label}`}>Delivered</th>
                  <th className={`text-right py-2 px-2 font-semibold ${admin.label}`}>Opens</th>
                  <th className={`text-right py-2 px-2 font-semibold ${admin.label}`}>Clicks</th>
                  <th className={`text-right py-2 px-2 font-semibold ${admin.label}`}>Open %</th>
                  <th className={`text-right py-2 px-2 font-semibold ${admin.label}`}>CTR</th>
                  <th className={`text-right py-2 px-2 font-semibold ${admin.label}`}>CTOR</th>
                  <th className={`text-right py-2 pl-2 font-semibold ${admin.label}`}>Sent</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className={`border-b ${admin.divideSubtle} ${admin.tableRowHover}`}>
                    <td className={`py-3 pr-3 min-w-[200px]`}>
                      <p className={`font-semibold ${admin.heading}`}>{c.name}</p>
                      <p className={`text-xs truncate max-w-[240px] ${admin.subtle}`} title={c.subject}>
                        {c.subject}
                      </p>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          c.status === "completed"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : c.status === "failed"
                              ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className={`py-3 text-right tabular-nums ${admin.heading}`}>{c.targeted}</td>
                    <td className={`py-3 text-right tabular-nums ${admin.heading}`}>
                      {c.status === "sending" ? (
                        <>
                          {formatCount(c.delivered)} / {formatCount(c.targeted)}
                        </>
                      ) : (
                        c.delivered
                      )}
                      <span className={`block text-xs ${admin.subtle}`}>
                        {c.status === "sending"
                          ? `${c.targeted > 0 ? Math.round((c.delivered / c.targeted) * 100) : 0}%`
                          : `${c.deliveryRate.toFixed(1)}%`}
                      </span>
                    </td>
                    <td className={`py-3 text-right tabular-nums ${admin.heading}`}>{c.opened}</td>
                    <td className={`py-3 text-right tabular-nums ${admin.heading}`}>{c.clicked}</td>
                    <td className={`py-3 text-right tabular-nums ${admin.heading}`}>{c.openRate.toFixed(1)}%</td>
                    <td className={`py-3 text-right tabular-nums ${admin.heading}`}>
                      {c.clickThroughRate.toFixed(1)}%
                    </td>
                    <td className={`py-3 text-right tabular-nums ${admin.heading}`}>
                      {c.clickToOpenRate.toFixed(1)}%
                    </td>
                    <td className={`py-3 text-right text-xs tabular-nums ${admin.subtle}`}>
                      {new Date(c.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AdminPanel
          title="Compose campaign"
          description="Draft a promotional email — clearly labeled for readers"
          action={
            <div className="flex flex-wrap gap-2 items-center">
              <button
                type="button"
                onClick={handlePreview}
                disabled={loadingPreview}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800"
              >
                {loadingPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                Preview
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                title={selectedCount === 0 ? "Select at least one recipient" : undefined}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  canSend
                    ? "bg-purple-600 dark:bg-violet-600 text-white hover:opacity-90"
                    : "bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed"
                }`}
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send campaign ({formatCount(selectedCount)})
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${admin.label}`}>Template preset</label>
              <select
                className={inputClass}
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) applyPreset(e.target.value);
                  e.target.value = "";
                }}
              >
                <option value="">Choose a starting template…</option>
                {PROMOTION_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <Field label="Subject line" value={template.subject} onChange={(v) => updateField("subject", v)} />
            <Field label="Preheader" value={template.preheader} onChange={(v) => updateField("preheader", v)} />
            <Field label="Eyebrow" value={template.eyebrow} onChange={(v) => updateField("eyebrow", v)} />
            <Field label="Headline" value={template.headline} onChange={(v) => updateField("headline", v)} />
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${admin.label}`}>Body</label>
              <textarea
                rows={5}
                value={template.body}
                onChange={(e) => updateField("body", e.target.value)}
                className={`${inputClass} resize-y`}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="CTA label" value={template.ctaLabel} onChange={(v) => updateField("ctaLabel", v)} />
              <Field label="CTA URL" value={template.ctaUrl} onChange={(v) => updateField("ctaUrl", v)} />
            </div>
            <Field label="Disclaimer" value={template.disclaimer} onChange={(v) => updateField("disclaimer", v)} multiline />
          </div>
          {result ? (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                (result.queued || result.sent > 0) && !result.error
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100"
                  : "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100"
              }`}
            >
              {result.queued ? (
                <p>
                  Campaign queued — sending <strong>{formatCount(result.targeted ?? 0)}</strong> emails in the
                  background. Watch progress in <strong>Campaign history</strong> (refreshes every 15s while
                  sending). Keep the email backend running until status is <strong>completed</strong>.
                </p>
              ) : null}
              {result.sent > 0 ? (
                <p>
                  Sent to <strong>{result.sent}</strong> recipient(s).
                  {result.failed > 0 ? ` ${result.failed} failed.` : ""}
                </p>
              ) : null}
              {result.error ? <p className="mt-1">{result.error}</p> : null}
            </div>
          ) : null}
        </AdminPanel>

        <AdminPanel
          title="Recipients"
          description={`${formatCount(selectedCount)} selected · ${formatCount(totalAllSubscribers)} subscribers`}
          action={
            <div className="flex flex-wrap gap-3 justify-end">
              <button
                type="button"
                onClick={selectAllSubscribers}
                disabled={totalAllSubscribers === 0}
                className="text-xs font-semibold text-purple-600 dark:text-violet-400 hover:underline disabled:opacity-50"
              >
                Select all ({formatCount(totalAllSubscribers)})
              </button>
              <button
                type="button"
                onClick={selectAllOnPage}
                className="text-xs font-semibold text-purple-600 dark:text-violet-400 hover:underline"
              >
                Select page
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className={`text-xs font-semibold hover:underline ${admin.subtle}`}
              >
                Clear
              </button>
            </div>
          }
        >
          {selectionMode === "all" ? (
            <div
              className={`mb-3 rounded-xl border px-3 py-2.5 text-xs ${admin.body} border-purple-200 bg-purple-50/80 dark:border-violet-900 dark:bg-violet-950/30`}
            >
              All <strong>{formatCount(totalAllSubscribers)}</strong> subscribers are selected. Search to find
              someone, then click their row to exclude them
              {excluded.size > 0 ? (
                <>
                  {" "}
                  (<strong>{formatCount(excluded.size)}</strong> excluded)
                </>
              ) : null}
              .
            </div>
          ) : (
            <p className={`text-xs mb-3 ${admin.subtle}`}>
              Pick recipients individually or use <strong>Select all</strong> for every subscriber. Manual
              selection persists across pages.
            </p>
          )}
          <form onSubmit={applySearch} className={`flex gap-2 mb-3 pb-3 border-b ${admin.divide}`}>
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${admin.subtle}`} />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search subscribers…"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm ${admin.input}`}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-purple-600 dark:bg-violet-600 text-white text-sm font-semibold"
            >
              Search
            </button>
          </form>
          <div className={`rounded-xl border ${admin.divide} overflow-hidden`}>
            <table className="w-full text-sm">
              <thead className={admin.tableHead}>
                <tr>
                  <th className="w-10 py-2 pl-3">
                    <button type="button" onClick={toggleAllOnPage} aria-label="Select all on page">
                      {allPageSelected ? (
                        <CheckSquare className="h-4 w-4 text-purple-600" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className={`text-left py-2 font-semibold ${admin.label}`}>Email</th>
                  <th className={`text-right py-2 pr-3 font-semibold ${admin.label}`}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={`py-8 text-center ${admin.subtle}`}>
                      No subscribers match.
                    </td>
                  </tr>
                ) : (
                  rows.map((s) => (
                    <tr
                      key={s.id}
                      className={`border-t ${admin.divideSubtle} ${admin.tableRowHover} cursor-pointer`}
                      onClick={() => toggleOne(s.email)}
                    >
                      <td className="py-2.5 pl-3">
                        {isRowSelected(s.email) ? (
                          <CheckSquare className="h-4 w-4 text-purple-600" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-400" />
                        )}
                      </td>
                      <td className={`py-2.5 font-medium ${admin.heading}`}>{s.email}</td>
                      <td className={`py-2.5 pr-3 text-right text-xs ${admin.subtle}`}>
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <AdminPagination
              totalCount={subscribersPage.total}
              currentPage={subscribersPage.page}
              limit={subscribersPage.limit}
              itemLabel="subscribers"
              pinnedParams={{ tab: "promotion" }}
              pageParam="promoPage"
              limitParam="promoLimit"
            />
          </div>
        </AdminPanel>
      </div>

      {previewOpen && previewHtml ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal>
          <div className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl ${admin.card} shadow-2xl`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${admin.divide}`}>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${admin.subtle}`}>Preview</p>
                <p className={`font-semibold ${admin.heading}`}>{previewSubject}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
            <iframe title="Email preview" srcDoc={previewHtml} className="flex-1 min-h-[480px] w-full bg-white" sandbox="" />
          </div>
        </div>
      ) : null}

      <div className={`rounded-xl border border-dashed ${admin.divide} p-4 flex gap-3 text-sm ${admin.body}`}>
        <Sparkles className="h-5 w-5 shrink-0 text-violet-500" />
        <p>
          Sends of 50+ recipients run in the background on the email backend (safe for 40k+ lists). Configure{" "}
          <code className={admin.code}>SUPABASE_URL</code> and{" "}
          <code className={admin.code}>SUPABASE_SERVICE_ROLE_KEY</code> on the backend, then restart{" "}
          <code className={admin.code}>node index.js</code>. Tune pace with{" "}
          <code className={admin.code}>CAMPAIGN_SEND_DELAY_MS</code> (default 250ms).
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className={`block text-xs font-semibold mb-1.5 ${admin.label}`}>{label}</label>
      {multiline ? (
        <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass} resize-y`} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      )}
    </div>
  );
}
