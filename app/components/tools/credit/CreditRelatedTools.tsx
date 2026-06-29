"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { RelatedTool } from "./compute-credit-journey-metrics";

export default function CreditRelatedTools({ tools }: { tools: RelatedTool[] }) {
  if (tools.length === 0) return null;

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Related Facts Deck tools</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Based on your goal, utilization, and score band.</p>
      <ul className="mt-4 space-y-2">
        {tools.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/tools/${t.slug}`}
              className="group flex items-start justify-between gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 transition-colors hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-950/60 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/40"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t.name}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{t.reason}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 mt-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
