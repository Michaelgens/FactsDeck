"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { RelatedTool } from "./compute-fi-snapshot-metrics";

export default function FiSnapshotRelatedTools({ tools }: { tools: RelatedTool[] }) {
  if (tools.length === 0) return null;

  return (
    <div className="rounded-3xl border border-violet-800/50 bg-zinc-900/60 p-6">
      <p className="text-sm font-bold text-violet-100">Related Facts Deck tools</p>
      <p className="mt-1 text-xs text-violet-300/70">Based on your net worth, spend, and investing rate.</p>
      <ul className="mt-4 space-y-2">
        {tools.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/tools/${t.slug}`}
              className="group flex items-start justify-between gap-3 rounded-2xl border border-violet-800/40 bg-violet-950/40 px-4 py-3 transition-colors hover:border-violet-600/50 hover:bg-violet-950/70"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">{t.name}</p>
                <p className="text-xs text-violet-200/65 mt-0.5">{t.reason}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-violet-400 group-hover:text-white mt-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
