"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  Mail,
  Send,
  Sparkles,
} from "lucide-react";
import type { EmailFunnelInsights, EmailTypeMetrics, WelcomeSendsPage } from "@/app/lib/email-funnel-types";
import type { PromotionCampaignPerformance, SubscribersPage } from "@/app/lib/promotion-campaign-types";
import { formatCount } from "@/app/lib/admin";
import { admin } from "../../components/admin-theme";
import { AdminPanel } from "../../components/admin-ui";
import { GroupedBarChart, MiniSparkline } from "../../components/admin-charts";
import WelcomeTabPanel from "./WelcomeTabPanel";
import PromotionCampaign from "./PromotionCampaign";
import WeeklyBriefPanel from "./WeeklyBriefPanel";
import { MetricsGrid, RecentSendsTable, TypePanelHeader } from "./funnel-shared";
import type { BriefPostPick, WeeklyBriefEdition } from "@/app/lib/weekly-brief-types";

const TABS = [
  { id: "main", label: "Overview", icon: BarChart3 },
  { id: "welcome", label: "Welcome", icon: Mail },
  { id: "promotion", label: "Promotions", icon: Sparkles },
  { id: "weekly-brief", label: "Weekly briefs", icon: Send },
] as const;

type TabId = (typeof TABS)[number]["id"];

function TypeComparisonTable({
  overall,
  welcome,
  weeklyBrief,
  promotion,
}: {
  overall: EmailTypeMetrics;
  welcome: EmailTypeMetrics;
  weeklyBrief: EmailTypeMetrics;
  promotion: EmailTypeMetrics;
}) {
  const rows = [
    { label: "Delivery rate", key: "deliveryRate" as const },
    { label: "Bounce rate", key: "bounceRate" as const },
    { label: "Open rate", key: "openRate" as const },
    { label: "CTR", key: "clickThroughRate" as const },
    { label: "CTOR", key: "clickToOpenRate" as const },
    { label: "Spam rate", key: "spamComplaintRate" as const },
    { label: "Unsubscribe rate", key: "unsubscribeRate" as const },
  ];

  const cols = [
    { name: "All", m: overall },
    { name: "Welcome", m: welcome },
    { name: "Weekly", m: weeklyBrief },
    { name: "Promo", m: promotion },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className={`border-b ${admin.divide}`}>
            <th className={`text-left py-3 pr-4 font-semibold ${admin.label}`}>Metric</th>
            {cols.map((c) => (
              <th key={c.name} className={`text-right py-3 px-3 font-semibold ${admin.label}`}>
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className={`border-b ${admin.divideSubtle}`}>
              <td className={`py-3 pr-4 ${admin.body}`}>{row.label}</td>
              {cols.map((c) => (
                <td key={c.name} className={`py-3 px-3 text-right font-semibold tabular-nums ${admin.heading}`}>
                  {c.m[row.key].toFixed(1)}%
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type Props = {
  insights: EmailFunnelInsights;
  welcomeSends: WelcomeSendsPage;
  subscribersPage: SubscribersPage;
  totalAllSubscribers: number;
  promotionCampaigns: PromotionCampaignPerformance[];
  briefPostPicks: BriefPostPick[];
  briefSubscribersPage: SubscribersPage;
  weeklyBriefEditions: WeeklyBriefEdition[];
  initialTab: TabId;
};

export default function FunnelDashboard({
  insights,
  welcomeSends,
  subscribersPage,
  totalAllSubscribers,
  promotionCampaigns,
  briefPostPicks,
  briefSubscribersPage,
  weeklyBriefEditions,
  initialTab,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<TabId>(initialTab);
  const updated = new Date(insights.updatedAt).toLocaleString();

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const onPopState = () => {
      const tabParam = new URLSearchParams(window.location.search).get("tab");
      if (tabParam && TABS.some((t) => t.id === tabParam)) {
        setTab(tabParam as TabId);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const setTabWithUrl = useCallback(
    (next: TabId) => {
      setTab(next);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", next);
      if (next === "welcome") {
        if (!params.get("page")) params.set("page", "1");
        if (!params.get("limit")) params.set("limit", "10");
      }
      const qs = params.toString();
      window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, searchParams]
  );

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl ${admin.gradientPanel} border p-6 md:p-8`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-violet-700 dark:text-violet-300 uppercase">
              Email intelligence
            </p>
            <h2 className={`mt-2 font-display text-2xl md:text-3xl font-bold ${admin.heading}`}>
              Editorial mail performance
            </h2>
            <p className={`mt-2 max-w-xl text-sm ${admin.body}`}>
              Delivery, engagement, and list health — last {insights.periodDays} days. Updated {updated}.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div
              className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-violet-200 dark:border-violet-500/40"
              style={{
                background: `conic-gradient(rgb(139 92 246) ${insights.healthScore * 3.6}deg, rgb(228 228 231) 0deg)`,
              }}
            >
              <div className={`absolute inset-2 rounded-full ${admin.card} flex flex-col items-center justify-center`}>
                <span className={`text-2xl font-bold ${admin.heading}`}>{insights.healthScore}</span>
                <span className={`text-[10px] uppercase tracking-wider ${admin.subtle}`}>Health</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className={admin.body}>
                <span className={`font-semibold ${admin.heading}`}>{formatCount(insights.audienceSize)}</span>{" "}
                subscribers
              </p>
              <p className={admin.body}>
                <span className={`font-semibold ${admin.heading}`}>{formatCount(insights.overall.attempted)}</span>{" "}
                sends
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`flex flex-wrap gap-2 p-1.5 rounded-2xl ${admin.muted} border ${admin.divide}`}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTabWithUrl(t.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                active ? admin.navActive : admin.navItem
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {insights.overall.attempted === 0 && tab === "main" ? (
        <div className={`rounded-xl border border-dashed ${admin.divide} p-6 flex gap-3 ${admin.calloutSky}`}>
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">No email sends in this period yet</p>
            <p className="mt-1 opacity-90">
              Footer signups create welcome sends. Use Promotions to broadcast custom templates to subscribers.
            </p>
          </div>
        </div>
      ) : null}

      {tab === "main" ? (
        <div className="space-y-6">
          <MetricsGrid metrics={insights.overall} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminPanel title="Sends by program" description="Volume by email type (6 months)">
              <GroupedBarChart
                labels={insights.sendsTimeline.map((p) => p.label)}
                series={[
                  { name: "Welcome", values: insights.sendsTimeline.map((p) => p.welcome), color: "bg-violet-500" },
                  { name: "Weekly", values: insights.sendsTimeline.map((p) => p.weeklyBrief), color: "bg-emerald-500" },
                  { name: "Promo", values: insights.sendsTimeline.map((p) => p.promotion), color: "bg-amber-500" },
                ]}
              />
            </AdminPanel>
            <AdminPanel title="Engagement pulse" description="Opens vs clicks by month">
              <GroupedBarChart
                labels={insights.engagementTimeline.map((p) => p.label)}
                series={[
                  { name: "Opens", values: insights.engagementTimeline.map((p) => p.opens), color: "bg-sky-500" },
                  { name: "Clicks", values: insights.engagementTimeline.map((p) => p.clicks), color: "bg-fuchsia-500" },
                ]}
              />
              <div className="mt-4">
                <MiniSparkline values={insights.engagementTimeline.map((p) => p.opens + p.clicks)} />
              </div>
            </AdminPanel>
          </div>
          <AdminPanel title="Cross-program benchmarks" description="Compare rates across all mail types">
            <TypeComparisonTable
              overall={insights.overall}
              welcome={insights.welcome}
              weeklyBrief={insights.weeklyBrief}
              promotion={insights.promotion}
            />
          </AdminPanel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminPanel title="Recent dispatches" description="Last 12 sends">
              <RecentSendsTable sends={insights.recentSends} />
            </AdminPanel>
            <AdminPanel title="Top clicked links" description="Tracked destinations">
              {insights.topLinks.length === 0 ? (
                <p className={`text-sm text-center py-6 ${admin.subtle}`}>No clicks tracked yet.</p>
              ) : (
                <ul className="space-y-3">
                  {insights.topLinks.map((link) => (
                    <li key={link.url} className="flex justify-between gap-3 text-sm">
                      <span className={`truncate ${admin.body}`} title={link.url}>
                        {link.url.replace(/^https?:\/\//, "")}
                      </span>
                      <span className={`font-bold tabular-nums shrink-0 ${admin.heading}`}>{link.clicks}</span>
                    </li>
                  ))}
                </ul>
              )}
            </AdminPanel>
          </div>
        </div>
      ) : null}

      {tab === "welcome" ? (
        <WelcomeTabPanel metrics={insights.welcome} welcomeSends={welcomeSends} />
      ) : null}

      {tab === "promotion" ? (
        <PromotionCampaign
          metrics={insights.promotion}
          subscribersPage={subscribersPage}
          totalAllSubscribers={totalAllSubscribers}
          campaigns={promotionCampaigns}
        />
      ) : null}

      {tab === "weekly-brief" ? (
        <WeeklyBriefPanel
          metrics={insights.weeklyBrief}
          postPicks={briefPostPicks}
          subscribersPage={briefSubscribersPage}
          totalAllSubscribers={totalAllSubscribers}
          editions={weeklyBriefEditions}
        />
      ) : null}
    </div>
  );
}
