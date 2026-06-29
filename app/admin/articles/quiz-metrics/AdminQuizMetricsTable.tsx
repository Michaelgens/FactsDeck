"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, ExternalLink, Pencil, Target } from "lucide-react";
import type { ArticleQuizRow } from "../../../lib/quiz-insights";
import { formatRate } from "../../../lib/quiz-insights";
import { postPublicPath } from "../../../lib/post-url";
import { admin } from "../../components/admin-theme";

type SortKey =
  | "title"
  | "views"
  | "impressions"
  | "starts"
  | "completions"
  | "participationRate"
  | "completionRate"
  | "scoreCardsEarned";

export default function AdminQuizMetricsTable({
  rows,
  posts,
}: {
  rows: ArticleQuizRow[];
  posts: Array<{
    id: string;
    quizQuestions: Array<{
      prompt: string;
      correctOptionId: string;
      options: Array<{ id: string; label: string }>;
    }>;
    resultBands: Array<{ minScore: number; label: string; message: string }>;
  }>;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "quiz" | "published">("all");

  const postDetail = useMemo(() => new Map(posts.map((p) => [p.id, p])), [posts]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter === "quiz") return r.quizEnabled;
      if (filter === "published") return r.published;
      return true;
    });
  }, [rows, filter]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      switch (sortKey) {
        case "title":
          av = a.title.toLowerCase();
          bv = b.title.toLowerCase();
          break;
        case "views":
          av = a.views;
          bv = b.views;
          break;
        case "impressions":
          av = a.analytics.impressions;
          bv = b.analytics.impressions;
          break;
        case "starts":
          av = a.analytics.starts;
          bv = b.analytics.starts;
          break;
        case "completions":
          av = a.analytics.completions;
          bv = b.analytics.completions;
          break;
        case "participationRate":
          av = a.participationRate ?? -1;
          bv = b.participationRate ?? -1;
          break;
        case "completionRate":
          av = a.completionRate ?? -1;
          bv = b.completionRate ?? -1;
          break;
        case "scoreCardsEarned":
          av = a.scoreCardsEarned;
          bv = b.scoreCardsEarned;
          break;
      }
      if (typeof av === "string" && typeof bv === "string") {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortAsc ? Number(av) - Number(bv) : Number(bv) - Number(av);
    });
    return list;
  }, [filtered, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const SortHead = ({ label, col }: { label: string; col: SortKey }) => (
    <th className="py-3 px-3 font-semibold text-slate-600 dark:text-zinc-400">
      <button
        type="button"
        onClick={() => toggleSort(col)}
        className="inline-flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-300"
      >
        {label}
        {sortKey === col ? (
          sortAsc ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )
        ) : null}
      </button>
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "All articles"],
            ["quiz", "Quiz active"],
            ["published", "Published only"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              filter === id
                ? "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200"
                : `${admin.pill} hover:opacity-90`
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={`rounded-2xl ${admin.card} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${admin.divide} ${admin.tableHead}`}>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-zinc-400 min-w-[200px]">
                  Article
                </th>
                <SortHead label="Views" col="views" />
                <th className="py-3 px-3 font-semibold text-slate-600 dark:text-zinc-400">Quiz</th>
                <SortHead label="Impressions" col="impressions" />
                <SortHead label="Starts" col="starts" />
                <SortHead label="Finished" col="completions" />
                <th className="py-3 px-3 font-semibold text-slate-600 dark:text-zinc-400">Skipped</th>
                <th className="py-3 px-3 font-semibold text-slate-600 dark:text-zinc-400">No action</th>
                <SortHead label="Start %" col="participationRate" />
                <SortHead label="Finish %" col="completionRate" />
                <SortHead label="Score cards" col="scoreCardsEarned" />
                <th className="py-3 px-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500 dark:text-zinc-400">
                    No articles match this filter.
                  </td>
                </tr>
              ) : (
                sorted.map((row) => {
                  const open = expandedId === row.id;
                  const detail = postDetail.get(row.id);
                  return (
                    <Fragment key={row.id}>
                      <tr className={`border-b ${admin.divideSubtle} ${admin.tableRowHover}`}>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900 dark:text-zinc-100 line-clamp-2">
                            {row.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
                            {row.published ? "Published" : "Draft"}
                            {row.quizTitle ? ` · ${row.quizTitle}` : ""}
                          </p>
                        </td>
                        <td className="py-3 px-3 tabular-nums text-slate-700 dark:text-zinc-300">
                          {row.views.toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          {row.quizEnabled ? (
                            <span className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                              On
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">Off</span>
                          )}
                        </td>
                        <td className="py-3 px-3 tabular-nums">{row.analytics.impressions}</td>
                        <td className="py-3 px-3 tabular-nums">{row.analytics.starts}</td>
                        <td className="py-3 px-3 tabular-nums">{row.analytics.completions}</td>
                        <td className="py-3 px-3 tabular-nums text-amber-700 dark:text-amber-400">
                          {row.analytics.skips}
                        </td>
                        <td className="py-3 px-3 tabular-nums text-slate-500 dark:text-zinc-400">
                          {row.passiveCount}
                        </td>
                        <td className="py-3 px-3 tabular-nums font-medium">
                          {formatRate(row.participationRate)}
                        </td>
                        <td className="py-3 px-3 tabular-nums font-medium">
                          {formatRate(row.completionRate)}
                        </td>
                        <td className="py-3 px-3 tabular-nums font-semibold text-amber-800 dark:text-amber-300">
                          {row.scoreCardsEarned}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => setExpandedId(open ? null : row.id)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
                            title={open ? "Hide blueprint" : "Quiz blueprint"}
                          >
                            {open ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                      {open && detail ? (
                        <tr key={`${row.id}-detail`} className="bg-amber-50/50 dark:bg-amber-950/10">
                          <td colSpan={12} className="px-4 py-4">
                            <div className="flex flex-wrap gap-3 mb-4">
                              <Link
                                href={`/admin/articles/${row.id}/edit`}
                                className={`inline-flex items-center gap-1 text-sm font-semibold ${admin.link}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit quiz
                              </Link>
                              {row.published && row.slug ? (
                                <Link
                                  href={postPublicPath({ id: row.id, slug: row.slug })}
                                  target="_blank"
                                  className={`inline-flex items-center gap-1 text-sm font-semibold ${admin.link}`}
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  View live
                                </Link>
                              ) : null}
                            </div>

                            <div className="mb-4 rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-white/80 dark:bg-zinc-950/80 px-4 py-3 text-xs text-slate-600 dark:text-zinc-400">
                              <strong className="text-amber-800 dark:text-amber-300">Note:</strong> Quizzes
                              are graded in the browser — we track funnel events and score-card completions,
                              not per-answer distributions (unlike community polls).
                            </div>

                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-4">
                              {detail.quizQuestions.map((q, i) => {
                                const correct = q.options.find((o) => o.id === q.correctOptionId);
                                return (
                                  <div
                                    key={i}
                                    className="rounded-xl border border-amber-200/70 dark:border-amber-900/40 bg-white dark:bg-zinc-950 p-3"
                                  >
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                                      Q{i + 1} · Graded
                                    </p>
                                    <p className="text-sm font-medium text-slate-800 dark:text-zinc-200 mt-1 line-clamp-3">
                                      {q.prompt}
                                    </p>
                                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-2 flex items-start gap-1">
                                      <Target className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                      <span className="line-clamp-2">
                                        Key: {correct?.label ?? "—"}
                                      </span>
                                    </p>
                                  </div>
                                );
                              })}
                            </div>

                            {detail.resultBands.length > 0 ? (
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300 mb-2">
                                  Performance bands
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {[...detail.resultBands]
                                    .sort((a, b) => b.minScore - a.minScore)
                                    .map((band) => (
                                      <span
                                        key={`${band.minScore}-${band.label}`}
                                        className="inline-flex flex-col rounded-lg border border-amber-200 dark:border-amber-900/50 bg-white dark:bg-zinc-950 px-3 py-2 text-xs"
                                      >
                                        <span className="font-bold text-amber-900 dark:text-amber-200">
                                          {band.minScore}+ · {band.label}
                                        </span>
                                        <span className="text-slate-500 dark:text-zinc-400 line-clamp-1">
                                          {band.message}
                                        </span>
                                      </span>
                                    ))}
                                </div>
                              </div>
                            ) : null}

                            {!row.quizEnabled ? (
                              <p className="mt-3 text-xs text-slate-500 dark:text-zinc-400">
                                Quiz is off — metrics above are historical.
                              </p>
                            ) : null}
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
