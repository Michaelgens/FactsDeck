import Link from "next/link";
import { ArrowRight, Home, List, FileText, Target } from "lucide-react";
import { getDashboardInsights } from "../../../lib/admin-insights";
import {
  HOME_LATEST_CAROUSEL,
  PLACEMENT_PRIORITY,
  PLACEMENT_SLOTS,
  SURFACE_BLOCK_ALLOCATIONS,
} from "../../../lib/placement-labels";
import { AdminPageHeader, AdminPanel, PlacementPill } from "../../components/admin-ui";
import { admin } from "../../components/admin-theme";
import ArticlesSubnav from "../../components/ArticlesSubnav";
import AutoAllocateArticles from "../../components/AutoAllocateArticles";

const PLACEMENT_GUIDE = [
  {
    flag: "Featured",
    color: "bg-violet-500",
    home: "Major coverage hero stacks (1 hero + 4 minors per section)",
    postList: "Large major blocks in editorial grid",
    detail: "Indirect via related/top content pools",
  },
  {
    flag: "Expert Pick",
    color: "bg-amber-500",
    home: "Top picks rail, expert sections",
    postList: "Top picks sidebar rail",
    detail: "Top picks sidebar on article page",
  },
  {
    flag: "Trending",
    color: "bg-orange-500",
    home: "Latest analysis block (priority slot)",
    postList: "Latest analysis section",
    detail: "Related content weighting",
  },
  {
    flag: "Popular Guide",
    color: "bg-emerald-500",
    home: "Top picks fallback, guide stacks",
    postList: "Guides tab & stacks",
    detail: "Top picks / read-more pools",
  },
  {
    flag: "(none — Latest slot)",
    color: "bg-sky-500",
    home: "Not used for home carousel (carousel uses all posts)",
    postList: "Latest tab + paginated grid",
    detail: "Read more grid",
  },
];

function inventoryStatus(current: number, recommended: number): { label: string; className: string } {
  if (current >= recommended) {
    return {
      label: "Healthy",
      className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    };
  }
  if (current >= Math.ceil(recommended * 0.5)) {
    return {
      label: "Low",
      className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    };
  }
  return {
    label: "Needs content",
    className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  };
}

export default async function AdminPlacementsPage() {
  const { placement } = await getDashboardInsights();

  return (
    <div>
      <AdminPageHeader
        title="Article placements"
        description="Editorial flags, recommended article counts per slot, and UI block caps on Home, Post list, and Post detail."
      >
        <Link
          href="/admin/articles"
          className={`inline-flex items-center gap-2 text-sm font-semibold ${admin.link} hover:underline`}
        >
          Back to articles
          <ArrowRight className="h-4 w-4" />
        </Link>
      </AdminPageHeader>

      <ArticlesSubnav />

      <div className="mb-8">
        <AutoAllocateArticles />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <AdminPanel
          title="Flag inventory vs targets"
          description="Published articles per bucket — compare to recommended minimums"
        >
          <ul className="space-y-3">
            {PLACEMENT_SLOTS.map((slot) => {
              const current = placement[slot.key];
              const status = inventoryStatus(current, slot.recommendedCount);
              return (
                <li
                  key={slot.key}
                  className="rounded-xl border border-slate-100 dark:border-zinc-800 px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${slot.color}`} />
                      <span className="text-sm font-semibold text-slate-800 dark:text-zinc-100">{slot.label}</span>
                    </div>
                    <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-zinc-100">
                      {current}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-slate-500 dark:text-zinc-400">
                      Target: {slot.recommendedLabel}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </AdminPanel>

        <div className={`lg:col-span-2 rounded-2xl p-6 ${admin.calloutViolet}`}>
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-zinc-100 mb-2">Priority rule</h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed mb-4">
            Each published article is assigned exactly one primary feed section. If multiple flags are enabled, the
            highest-priority wins: <strong>{PLACEMENT_PRIORITY}</strong>.
          </p>
          <div className="mb-4 rounded-xl border border-sky-200/80 bg-sky-50/90 dark:border-sky-800/50 dark:bg-sky-950/40 px-4 py-3 text-sm text-sky-950 dark:text-sky-100">
            <p className="font-semibold">
              {HOME_LATEST_CAROUSEL.title} — max {HOME_LATEST_CAROUSEL.maxVisible} cards
            </p>
            <p className="mt-1 text-sky-900/90 dark:text-sky-200/90">
              <strong>Where:</strong> {HOME_LATEST_CAROUSEL.location}. {HOME_LATEST_CAROUSEL.behavior}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { icon: Home, label: "Home /", href: "/" },
              { icon: List, label: "Post list /post", href: "/post" },
              { icon: FileText, label: "Article detail", href: "/post" },
            ].map(({ icon: Icon, label, href }) => (
              <Link
                key={href + label}
                href={href}
                target="_blank"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-zinc-900 text-sm font-semibold text-slate-800 dark:text-zinc-200 hover:text-purple-600"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {SURFACE_BLOCK_ALLOCATIONS.map((surface) => (
        <AdminPanel
          key={surface.page}
          title={`Block allocation — ${surface.page}`}
          description="Maximum items the UI can show per block (from site code)"
          className="mb-6"
        >
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-left">
                  <th className="py-2 px-3 font-semibold text-slate-600 dark:text-zinc-400">Block</th>
                  <th className="py-2 px-3 font-semibold text-slate-600 dark:text-zinc-400">Max shown</th>
                  <th className="py-2 px-3 font-semibold text-slate-600 dark:text-zinc-400">Content pool</th>
                  <th className="py-2 px-3 font-semibold text-slate-600 dark:text-zinc-400">What to flag</th>
                </tr>
              </thead>
              <tbody>
                {surface.blocks.map((row) => (
                  <tr key={row.block} className="border-b border-slate-50 dark:border-zinc-800/80">
                    <td className="py-3 px-3 font-medium text-slate-900 dark:text-zinc-100">{row.block}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 font-bold tabular-nums text-purple-700 dark:text-violet-300">
                        <Target className="h-3.5 w-3.5" />
                        {row.maxShown}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-zinc-400 max-w-xs">{row.pool}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-zinc-400 max-w-sm">{row.flagHint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminPanel>
      ))}

      <div className={`rounded-2xl ${admin.card} overflow-hidden`}>
        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-zinc-100">Flag → surface map</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">Where each editorial flag affects the site</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800">
                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-zinc-400">Flag</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-zinc-400">Home</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-zinc-400">Post list</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-zinc-400">Post detail</th>
              </tr>
            </thead>
            <tbody>
              {PLACEMENT_GUIDE.map((row) => (
                <tr key={row.flag} className="border-b border-slate-100 dark:border-zinc-800/80">
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-2 font-semibold text-slate-900 dark:text-zinc-100">
                      <span className={`w-2.5 h-2.5 rounded-full ${row.color}`} />
                      {row.flag}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-600 dark:text-zinc-400 max-w-xs">{row.home}</td>
                  <td className="py-4 px-4 text-slate-600 dark:text-zinc-400 max-w-xs">{row.postList}</td>
                  <td className="py-4 px-4 text-slate-600 dark:text-zinc-400 max-w-xs">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
