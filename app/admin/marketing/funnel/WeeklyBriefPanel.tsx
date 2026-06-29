"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  CalendarClock,
  CheckSquare,
  Eye,
  Loader2,
  Newspaper,
  Plus,
  Search,
  Send,
  Sparkles,
  Square,
  Trash2,
  Wand2,
} from "lucide-react";
import type { EmailTypeMetrics } from "@/app/lib/email-funnel-types";
import type { SubscribersPage } from "@/app/lib/promotion-campaign-types";
import type { BriefPostPick, WeeklyBriefEdition, WeeklyBriefTemplate } from "@/app/lib/weekly-brief-types";
import {
  WEEKLY_BRIEF_PRESETS,
  buildBriefTemplateFromPosts,
  buildDefaultWeeklyBrief,
  getCurrentIssueLabel,
} from "@/app/lib/weekly-brief-types";
import {
  previewWeeklyBriefEmail,
  sendWeeklyBriefCampaign,
} from "@/app/lib/weekly-brief-actions";
import { formatCount } from "@/app/lib/admin";
import { admin } from "../../components/admin-theme";
import { AdminPanel } from "../../components/admin-ui";
import AdminPagination from "../../components/AdminPagination";
import EmailTestLab from "./EmailTestLab";
import { MetricsGrid, TypePanelHeader } from "./funnel-shared";

const inputClass = `w-full rounded-xl px-4 py-2.5 text-sm ${admin.input}`;
const MAX_SECTIONS = 8;
type SelectionMode = "manual" | "all";

type Props = {
  metrics: EmailTypeMetrics;
  postPicks: BriefPostPick[];
  subscribersPage: SubscribersPage;
  totalAllSubscribers: number;
  editions: WeeklyBriefEdition[];
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export default function WeeklyBriefPanel({
  metrics,
  postPicks,
  subscribersPage,
  totalAllSubscribers,
  editions,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [template, setTemplate] = useState<WeeklyBriefTemplate>(() => buildDefaultWeeklyBrief());
  const [pickedPostIds, setPickedPostIds] = useState<Set<string>>(new Set());
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

  const hasSendingEdition = editions.some((e) => e.status === "sending");

  useEffect(() => {
    if (!hasSendingEdition) return;
    const id = window.setInterval(() => router.refresh(), 15_000);
    return () => window.clearInterval(id);
  }, [hasSendingEdition, router]);

  const pickedPosts = useMemo(
    () => postPicks.filter((p) => pickedPostIds.has(p.id)),
    [postPicks, pickedPostIds]
  );

  const rows = subscribersPage.rows;

  function isRowSelected(email: string): boolean {
    const key = normalizeEmail(email);
    return selectionMode === "all" ? !excluded.has(key) : selected.has(key);
  }

  const selectedCount =
    selectionMode === "all"
      ? Math.max(0, totalAllSubscribers - excluded.size)
      : selected.size;

  const canSend = selectedCount > 0 && template.sections.length > 0 && !sending;
  const allPageSelected = rows.length > 0 && rows.every((s) => isRowSelected(s.email));

  function pushParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "weekly-brief");
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    pushParams({ briefPage: "1", briefQ: searchInput.trim() || undefined });
  }

  function togglePost(id: string) {
    setPickedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_SECTIONS) next.add(id);
      return next;
    });
  }

  function composeFromPicks() {
    setTemplate(buildBriefTemplateFromPosts(pickedPosts, template));
  }

  function applyPreset(id: string) {
    const preset = WEEKLY_BRIEF_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setTemplate((t) => ({ ...t, ...preset.template }));
  }

  function updateSection(index: number, patch: Partial<WeeklyBriefTemplate["sections"][0]>) {
    setTemplate((t) => {
      const sections = [...t.sections];
      sections[index] = { ...sections[index], ...patch };
      return { ...t, sections };
    });
  }

  function moveSection(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= template.sections.length) return;
    setTemplate((t) => {
      const sections = [...t.sections];
      [sections[index], sections[next]] = [sections[next], sections[index]];
      return { ...t, sections };
    });
  }

  function removeSection(index: number) {
    setTemplate((t) => ({
      ...t,
      sections: t.sections.filter((_, i) => i !== index),
    }));
  }

  function addEmptySection() {
    if (template.sections.length >= MAX_SECTIONS) return;
    setTemplate((t) => ({
      ...t,
      sections: [...t.sections, { title: "", summary: "", url: "" }],
    }));
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

  async function handlePreview() {
    setLoadingPreview(true);
    setResult(null);
    const res = await previewWeeklyBriefEmail(template);
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
    if (!canSend) return;
    if (!confirm(`Send this weekly brief to ${formatCount(selectedCount)} subscriber(s)?`)) return;

    setSending(true);
    setResult(null);
    const selection =
      selectionMode === "all"
        ? { mode: "all" as const, excludeEmails: [...excluded] }
        : { mode: "explicit" as const, emails: [...selected] };
    const res = await sendWeeklyBriefCampaign(selection, template);
    setSending(false);
    setResult({
      sent: res.sent,
      failed: res.failed,
      queued: res.queued,
      targeted: res.targeted,
      error: res.error,
    });
    if (res.ok && (res.queued || res.sent > 0)) {
      clearSelection();
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <TypePanelHeader metrics={metrics} />

      <div
        className={`rounded-2xl border overflow-hidden ${admin.divide} bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50 dark:from-emerald-950/40 dark:via-zinc-900 dark:to-teal-950/20`}
      >
        <div className="px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              Editorial desk
            </p>
            <h2 className={`text-xl font-bold mt-1 ${admin.heading}`}>Weekly Brief composer</h2>
            <p className={`text-sm mt-1 max-w-xl ${admin.subtle}`}>
              Curate stories from your site, shape the roundup, test to your inbox, then dispatch to
              the list — large sends run in the background like promotions.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-emerald-200/80 dark:border-emerald-900 px-4 py-3 shadow-sm">
            <Newspaper className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Current issue
              </p>
              <p className={`text-sm font-semibold tabular-nums ${admin.heading}`}>{template.issueLabel}</p>
            </div>
          </div>
        </div>
      </div>

      <MetricsGrid metrics={metrics} />

      <EmailTestLab emailType="weekly-brief" accent="emerald" weeklyBriefTemplate={template} />

      <AdminPanel
        title="Edition performance"
        description="Per-edition delivery and engagement — one row for each weekly brief you send"
      >
        {editions.length === 0 ? (
          <p className={`text-sm text-center py-8 ${admin.subtle}`}>
            No editions yet. Send a weekly brief below and performance will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[960px]">
              <thead>
                <tr className={`border-b ${admin.divide}`}>
                  <th className={`text-left py-2 pr-3 font-semibold ${admin.label}`}>Edition</th>
                  <th className={`text-left py-2 font-semibold ${admin.label}`}>Status</th>
                  <th className={`text-right py-2 px-2 font-semibold ${admin.label}`}>Targeted</th>
                  <th className={`text-right py-2 px-2 font-semibold ${admin.label}`}>Delivered</th>
                  <th className={`text-right py-2 px-2 font-semibold ${admin.label}`}>Failed</th>
                  <th className={`text-right py-2 px-2 font-semibold ${admin.label}`}>Opens</th>
                  <th className={`text-right py-2 px-2 font-semibold ${admin.label}`}>Clicks</th>
                  <th className={`text-right py-2 px-2 font-semibold ${admin.label}`}>Open %</th>
                  <th className={`text-right py-2 px-2 font-semibold ${admin.label}`}>CTR</th>
                  <th className={`text-right py-2 px-2 font-semibold ${admin.label}`}>CTOR</th>
                  <th className={`text-right py-2 pl-2 font-semibold ${admin.label}`}>Sent</th>
                </tr>
              </thead>
              <tbody>
                {editions.map((e) => (
                  <tr key={e.id} className={`border-b ${admin.divideSubtle} ${admin.tableRowHover}`}>
                    <td className={`py-3 pr-3 min-w-[200px]`}>
                      <p className={`font-semibold ${admin.heading}`}>{e.issueLabel}</p>
                      <p className={`text-xs truncate max-w-[240px] ${admin.subtle}`} title={e.subject}>
                        {e.subject}
                      </p>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          e.status === "completed"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : e.status === "failed"
                              ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className={`py-3 text-right tabular-nums ${admin.heading}`}>
                      {formatCount(e.targeted)}
                    </td>
                    <td className={`py-3 text-right tabular-nums ${admin.heading}`}>
                      {e.status === "sending" ? (
                        <>
                          {formatCount(e.delivered)} / {formatCount(e.targeted)}
                        </>
                      ) : (
                        formatCount(e.delivered)
                      )}
                      <span className={`block text-xs ${admin.subtle}`}>
                        {e.status === "sending"
                          ? `${e.targeted > 0 ? Math.round((e.delivered / e.targeted) * 100) : 0}%`
                          : `${e.deliveryRate.toFixed(1)}%`}
                      </span>
                    </td>
                    <td className={`py-3 text-right tabular-nums ${admin.heading}`}>
                      {formatCount(e.failed)}
                    </td>
                    <td className={`py-3 text-right tabular-nums ${admin.heading}`}>
                      {formatCount(e.opened)}
                    </td>
                    <td className={`py-3 text-right tabular-nums ${admin.heading}`}>
                      {formatCount(e.clicked)}
                    </td>
                    <td className={`py-3 text-right tabular-nums ${admin.heading}`}>
                      {e.openRate.toFixed(1)}%
                    </td>
                    <td className={`py-3 text-right tabular-nums ${admin.heading}`}>
                      {e.clickThroughRate.toFixed(1)}%
                    </td>
                    <td className={`py-3 text-right tabular-nums ${admin.heading}`}>
                      {e.clickToOpenRate.toFixed(1)}%
                    </td>
                    <td className={`py-3 text-right text-xs tabular-nums ${admin.subtle}`}>
                      {new Date(e.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <AdminPanel
          title="Story studio"
          description={`Pick up to ${MAX_SECTIONS} published stories from the last ${21} days`}
          className="xl:col-span-1"
        >
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={composeFromPicks}
              disabled={pickedPosts.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 dark:bg-emerald-600 text-white text-xs font-semibold disabled:opacity-50"
            >
              <Wand2 className="h-3.5 w-3.5" />
              Compose from picks ({pickedPosts.length})
            </button>
            <button
              type="button"
              onClick={() => setPickedPostIds(new Set())}
              className={`text-xs font-semibold hover:underline ${admin.subtle}`}
            >
              Clear picks
            </button>
          </div>
          {postPicks.length === 0 ? (
            <p className={`text-sm py-6 text-center ${admin.subtle}`}>
              No published stories in the last few weeks. Publish posts first.
            </p>
          ) : (
            <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {postPicks.map((p) => {
                const on = pickedPostIds.has(p.id);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => togglePost(p.id)}
                      className={`w-full text-left rounded-xl border p-3 transition ${
                        on
                          ? "border-emerald-400 bg-emerald-50/80 dark:border-emerald-700 dark:bg-emerald-950/30"
                          : `${admin.divide} hover:border-emerald-200 dark:hover:border-emerald-900`
                      }`}
                    >
                      <div className="flex gap-2 items-start">
                        {on ? (
                          <CheckSquare className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                        ) : (
                          <Square className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold line-clamp-2 ${admin.heading}`}>{p.title}</p>
                          <p className={`text-xs mt-1 ${admin.subtle}`}>
                            {p.category} · {new Date(p.publishDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel
          title="Brief copy"
          description="Subject, intro, and story blocks — order matters in the email"
          className="xl:col-span-2"
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
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  canSend
                    ? "bg-emerald-600 text-white hover:opacity-90"
                    : "bg-slate-200 dark:bg-zinc-800 text-slate-400 cursor-not-allowed"
                }`}
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send edition ({formatCount(selectedCount)})
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <select
                className={`${inputClass} max-w-[200px]`}
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) applyPreset(e.target.value);
                  e.target.value = "";
                }}
              >
                <option value="">Tone preset…</option>
                {WEEKLY_BRIEF_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() =>
                  setTemplate((t) => ({
                    ...buildDefaultWeeklyBrief(getCurrentIssueLabel()),
                    sections: t.sections,
                  }))
                }
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Reset issue dates
              </button>
            </div>

            <BriefField
              label="Issue label"
              value={template.issueLabel}
              onChange={(v) => setTemplate((t) => ({ ...t, issueLabel: v }))}
            />
            <BriefField label="Subject" value={template.subject} onChange={(v) => setTemplate((t) => ({ ...t, subject: v }))} />
            <BriefField
              label="Preheader"
              value={template.preheader}
              onChange={(v) => setTemplate((t) => ({ ...t, preheader: v }))}
            />
            <BriefField
              label="Headline"
              value={template.headline}
              onChange={(v) => setTemplate((t) => ({ ...t, headline: v }))}
            />
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${admin.label}`}>Intro</label>
              <textarea
                rows={3}
                value={template.intro}
                onChange={(e) => setTemplate((t) => ({ ...t, intro: e.target.value }))}
                className={`${inputClass} resize-y`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${admin.label}`}>Editor&apos;s note (optional)</label>
              <textarea
                rows={2}
                value={template.editorsNote}
                onChange={(e) => setTemplate((t) => ({ ...t, editorsNote: e.target.value }))}
                placeholder="A short personal line from the desk…"
                className={`${inputClass} resize-y`}
              />
            </div>

            <div className={`border-t pt-4 ${admin.divide}`}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-xs font-bold uppercase tracking-wider ${admin.label}`}>
                  Stories in this edition ({template.sections.length})
                </p>
                <button
                  type="button"
                  onClick={addEmptySection}
                  disabled={template.sections.length >= MAX_SECTIONS}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add slot
                </button>
              </div>
              <div className="space-y-4">
                {template.sections.map((section, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-4 ${admin.divide} bg-slate-50/50 dark:bg-zinc-900/40`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs font-bold ${admin.subtle}`}>#{i + 1}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveSection(i, -1)}
                          disabled={i === 0}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30"
                          aria-label="Move up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection(i, 1)}
                          disabled={i === template.sections.length - 1}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30"
                          aria-label="Move down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSection(i)}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <BriefField
                      label="Title"
                      value={section.title}
                      onChange={(v) => updateSection(i, { title: v })}
                    />
                    <div className="mt-2">
                      <label className={`block text-xs font-semibold mb-1.5 ${admin.label}`}>Summary</label>
                      <textarea
                        rows={2}
                        value={section.summary}
                        onChange={(e) => updateSection(i, { summary: e.target.value })}
                        className={`${inputClass} resize-y`}
                      />
                    </div>
                    <div className="mt-2">
                      <BriefField
                        label="Link"
                        value={section.url || ""}
                        onChange={(v) => updateSection(i, { url: v })}
                      />
                    </div>
                  </div>
                ))}
                {template.sections.length === 0 ? (
                  <p className={`text-sm text-center py-6 ${admin.subtle}`}>
                    Pick stories from the studio or add slots manually.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BriefField
                label="CTA label"
                value={template.ctaLabel}
                onChange={(v) => setTemplate((t) => ({ ...t, ctaLabel: v }))}
              />
              <BriefField
                label="CTA URL"
                value={template.ctaUrl}
                onChange={(v) => setTemplate((t) => ({ ...t, ctaUrl: v }))}
              />
            </div>
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
                  Edition queued for <strong>{formatCount(result.targeted ?? 0)}</strong> subscribers. Progress
                  updates in Past editions.
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
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AdminPanel
          title="Subscribers"
          description={`${formatCount(selectedCount)} selected · ${formatCount(totalAllSubscribers)} total`}
          action={
            <div className="flex flex-wrap gap-3 justify-end">
              <button
                type="button"
                onClick={selectAllSubscribers}
                disabled={totalAllSubscribers === 0}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-50"
              >
                Select all ({formatCount(totalAllSubscribers)})
              </button>
              <button
                type="button"
                onClick={selectAllOnPage}
                className="text-xs font-semibold text-emerald-600 hover:underline"
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
            <div className="mb-3 rounded-xl border px-3 py-2.5 text-xs border-emerald-200 bg-emerald-50/80 dark:border-emerald-900 dark:bg-emerald-950/30">
              All subscribers selected. Search and click rows to exclude.
              {excluded.size > 0 ? (
                <>
                  {" "}
                  (<strong>{formatCount(excluded.size)}</strong> excluded)
                </>
              ) : null}
            </div>
          ) : null}
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
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold"
            >
              Search
            </button>
          </form>
          <div className={`rounded-xl border ${admin.divide} overflow-hidden`}>
            <table className="w-full text-sm">
              <thead className={admin.tableHead}>
                <tr>
                  <th className="w-10 py-2 pl-3" />
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
                          <CheckSquare className="h-4 w-4 text-emerald-600" />
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
              pinnedParams={{ tab: "weekly-brief" }}
              pageParam="briefPage"
              limitParam="briefLimit"
            />
          </div>
        </AdminPanel>

        <AdminPanel title="Schedule" description="Automated Monday-morning dispatch">
          <div
            className={`rounded-xl border border-dashed p-6 text-center ${admin.divide} opacity-90`}
          >
            <CalendarClock className="h-10 w-10 mx-auto text-emerald-500/70 mb-3" />
            <p className={`font-semibold ${admin.heading}`}>Scheduler coming soon</p>
            <p className={`text-sm mt-2 max-w-sm mx-auto ${admin.subtle}`}>
              You&apos;ll set day, time, and timezone — we&apos;ll auto-pull the week&apos;s top stories and
              queue the brief. For now, compose and send manually.
            </p>
          </div>
          <div className={`mt-4 flex gap-3 text-sm ${admin.body}`}>
            <BookOpen className="h-5 w-5 shrink-0 text-emerald-500" />
            <p>
              Run migration{" "}
              <code className={admin.code}>20250607120000_email_campaigns_email_type.sql</code> so editions
              are tracked separately from promotions.
            </p>
          </div>
        </AdminPanel>
      </div>

      {previewOpen && previewHtml ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal>
          <div className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl ${admin.card} shadow-2xl`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${admin.divide}`}>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${admin.subtle}`}>Weekly brief preview</p>
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
            <iframe title="Weekly brief preview" srcDoc={previewHtml} className="flex-1 min-h-[480px] w-full bg-white" sandbox="" />
          </div>
        </div>
      ) : null}

      <div className={`rounded-xl border border-dashed ${admin.divide} p-4 flex gap-3 text-sm ${admin.body}`}>
        <Sparkles className="h-5 w-5 shrink-0 text-emerald-500" />
        <p>
          Large sends (50+) use the same background worker as promotions. Keep{" "}
          <code className={admin.code}>node index.js</code> running until the edition shows{" "}
          <strong>completed</strong>.
        </p>
      </div>
    </div>
  );
}

function BriefField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className={`block text-xs font-semibold mb-1.5 ${admin.label}`}>{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </div>
  );
}
