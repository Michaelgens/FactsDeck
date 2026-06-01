"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Wand2, Eye } from "lucide-react";
import {
  autoAllocateArticles,
  previewArticleAllocation,
  type AutoAllocateResult,
} from "../../lib/article-allocation-actions";
import { admin } from "./admin-theme";

type Props = {
  variant?: "panel" | "compact";
};

function CountRow({
  label,
  count,
  target,
  color,
}: {
  label: string;
  count: number;
  target: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="flex items-center gap-2 text-slate-700 dark:text-zinc-200">
        <span className={`w-2 h-2 rounded-full ${color}`} />
        {label}
      </span>
      <span className="font-bold tabular-nums text-slate-900 dark:text-zinc-100">
        {count}
        <span className="text-slate-400 dark:text-zinc-500 font-normal"> / {target} target</span>
      </span>
    </div>
  );
}

export default function AutoAllocateArticles({ variant = "panel" }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState<AutoAllocateResult | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const showPreview = (res: AutoAllocateResult) => {
    if (!res.ok) {
      setMessage({ type: "err", text: res.error });
      setPreview(null);
      return;
    }
    setPreview(res);
    setMessage(null);
  };

  const runPreview = () => {
    startTransition(async () => {
      const res = await previewArticleAllocation();
      showPreview(res);
    });
  };

  const runApply = () => {
    const summary = preview?.ok ? preview.summary : "";
    const ok = window.confirm(
      `Apply smart allocation to all published articles?\n\n${summary}\n\nEach article will be placed in exactly one bucket. Latest gets all remaining posts for paginated grids. This replaces current Featured / Expert / Trending / Guide flags.`
    );
    if (!ok) return;

    startTransition(async () => {
      const res = await autoAllocateArticles({ dryRun: false });
      if (!res.ok) {
        setMessage({ type: "err", text: res.error });
        return;
      }
      if (res.dryRun) return;
      setMessage({
        type: "ok",
        text: `Allocated ${res.updated} articles. ${res.summary}`,
      });
      setPreview(null);
      router.refresh();
    });
  };

  const counts = preview?.ok ? preview.counts : null;
  const quotas = preview?.ok ? preview.quotas : null;

  const isCompact = variant === "compact";

  return (
    <div
      className={
        isCompact
          ? "flex flex-wrap items-center gap-2"
          : `rounded-2xl ${admin.calloutViolet} p-6`
      }
    >
      {!isCompact && (
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-accent-600 flex items-center justify-center shadow-lg shrink-0">
            <Wand2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-zinc-100">
              Smart auto-allocate
            </h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed max-w-2xl">
              Distributes every <strong>published</strong> article into exactly one editorial bucket—no
              overlaps. Featured, Expert, Trending, and Guides get fixed targets for hero rails and analysis;
              <strong> Latest</strong> receives all remaining posts for paginated grids and Read more.
            </p>
          </div>
        </div>
      )}

      <div className={`flex flex-wrap gap-2 ${!isCompact ? "mb-4" : ""}`}>
        <button
          type="button"
          disabled={pending}
          onClick={runPreview}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border ${admin.card} font-semibold text-sm ${admin.label} hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-60`}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
          Preview plan
        </button>
        <button
          type="button"
          disabled={pending || !preview?.ok}
          onClick={runApply}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-accent-600 text-white font-bold text-sm hover:from-violet-700 hover:to-accent-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Apply allocation
        </button>
      </div>

      {counts && quotas ? (
        <div
          className={`rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-800/80 p-4 space-y-2 ${
            isCompact ? "w-full mt-2" : ""
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
            Preview — exclusive buckets
          </p>
          <CountRow label="Featured" count={counts.featured} target={quotas.featured} color="bg-violet-500" />
          <CountRow
            label="Expert picks"
            count={counts.expertPicks}
            target={quotas.expertPicks}
            color="bg-amber-500"
          />
          <CountRow
            label="Trending"
            count={counts.trending}
            target={quotas.trending}
            color="bg-orange-500"
          />
          <CountRow label="Guides" count={counts.guides} target={quotas.guides} color="bg-emerald-500" />
          <CountRow
            label="Latest (paginated pool)"
            count={counts.latest}
            target={counts.latest}
            color="bg-sky-500"
          />
          <p className="text-xs text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-zinc-800">
            {preview?.ok ? preview.summary : ""}
          </p>
        </div>
      ) : null}

      {message ? (
        <p
          className={`text-sm mt-3 ${message.type === "ok" ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-400"}`}
          role="status"
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
