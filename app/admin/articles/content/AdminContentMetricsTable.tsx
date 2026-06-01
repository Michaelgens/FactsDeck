"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, ExternalLink, Pencil } from "lucide-react";
import type { ArticleContentRow } from "../../../lib/poll-insights";
import { formatRate } from "../../../lib/poll-insights";
import { postPublicPath } from "../../../lib/post-url";
import { pollKindLabel, type PollQuestionKind } from "../../../lib/poll-types";
import { admin } from "../../components/admin-theme";

type SortKey =
  | "title"
  | "views"
  | "impressions"
  | "starts"
  | "completions"
  | "participationRate"
  | "completionRate"
  | "totalVotes";

export default function AdminContentMetricsTable({
  rows,
  posts,
}: {
  rows: ArticleContentRow[];
  /** Full posts with poll question labels — keyed by id */
  posts: Array<{
    id: string;
    pollQuestions: Array<{ prompt: string; kind: string; options: Array<{ label: string; votes: number }> }>;
  }>;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "poll" | "published">("all");

  const postDetail = useMemo(() => new Map(posts.map((p) => [p.id, p])), [posts]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter === "poll") return r.pollEnabled;
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
        case "totalVotes":
          av = a.totalVotes;
          bv = b.totalVotes;
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
        className="inline-flex items-center gap-1 hover:text-purple-600 dark:hover:text-violet-300"
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
            ["poll", "Poll active"],
            ["published", "Published only"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              filter === id
                ? "bg-purple-100 text-purple-800 dark:bg-violet-500/15 dark:text-violet-200"
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
                <th className="py-3 px-3 font-semibold text-slate-600 dark:text-zinc-400">Poll</th>
                <SortHead label="Impressions" col="impressions" />
                <SortHead label="Starts" col="starts" />
                <SortHead label="Done" col="completions" />
                <th className="py-3 px-3 font-semibold text-slate-600 dark:text-zinc-400">Skipped</th>
                <th className="py-3 px-3 font-semibold text-slate-600 dark:text-zinc-400">No action</th>
                <SortHead label="Start %" col="participationRate" />
                <SortHead label="Finish %" col="completionRate" />
                <SortHead label="Votes" col="totalVotes" />
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
                            {row.pollTitle ? ` · ${row.pollTitle}` : ""}
                          </p>
                        </td>
                        <td className="py-3 px-3 tabular-nums text-slate-700 dark:text-zinc-300">
                          {row.views.toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          {row.pollEnabled ? (
                            <span className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
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
                        <td className="py-3 px-3 tabular-nums">{row.totalVotes}</td>
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => setExpandedId(open ? null : row.id)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
                            title={open ? "Hide breakdown" : "Question breakdown"}
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
                        <tr key={`${row.id}-detail`} className="bg-slate-50/80 dark:bg-zinc-900/50">
                          <td colSpan={12} className="px-4 py-4">
                            <div className="flex flex-wrap gap-3 mb-4">
                              <Link
                                href={`/admin/articles/${row.id}/edit`}
                                className={`inline-flex items-center gap-1 text-sm font-semibold ${admin.link}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
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
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                              {detail.pollQuestions.map((q, i) => {
                                const qVotes = row.votesPerQuestion[i] ?? 0;
                                return (
                                  <div
                                    key={i}
                                    className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3"
                                  >
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400">
                                      Q{i + 1} · {pollKindLabel(q.kind as PollQuestionKind)}
                                    </p>
                                    <p className="text-sm font-medium text-slate-800 dark:text-zinc-200 mt-1 line-clamp-2">
                                      {q.prompt}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-2 mb-1">
                                      {qVotes} responses
                                    </p>
                                    <ul className="space-y-1">
                                      {q.options.map((o) => (
                                        <li
                                          key={o.label}
                                          className="flex justify-between gap-2 text-xs text-slate-600 dark:text-zinc-400"
                                        >
                                          <span className="truncate">{o.label}</span>
                                          <span className="tabular-nums shrink-0">{o.votes}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              })}
                            </div>
                            {!row.pollEnabled ? (
                              <p className="mt-3 text-xs text-slate-500 dark:text-zinc-400">
                                Poll is off — metrics above are historical.
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
