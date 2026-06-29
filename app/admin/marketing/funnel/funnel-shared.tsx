"use client";

import {
  Activity,
  Inbox,
  MailCheck,
  MailX,
  MousePointerClick,
  ShieldAlert,
  TrendingUp,
  UserMinus,
} from "lucide-react";
import type { EmailTypeMetrics, WelcomeSendRow } from "@/app/lib/email-funnel-types";
import { formatCount } from "@/app/lib/admin";
import { admin } from "../../components/admin-theme";

function rateColor(rate: number, invert = false): string {
  const good = invert ? rate < 2 : rate >= 20;
  const mid = invert ? rate < 5 : rate >= 8;
  if (good) return "text-emerald-600 dark:text-emerald-400";
  if (mid) return "text-amber-600 dark:text-amber-400";
  return "text-slate-600 dark:text-zinc-400";
}

export function MetricTile({
  label,
  count,
  rate,
  icon: Icon,
  invertRate,
  hint,
}: {
  label: string;
  count: number;
  rate: number;
  icon: React.ComponentType<{ className?: string }>;
  invertRate?: boolean;
  hint?: string;
}) {
  return (
    <div className={`rounded-2xl ${admin.card} p-5 relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 rounded-bl-full" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-wider ${admin.subtle}`}>{label}</p>
          <p className={`mt-2 text-2xl font-bold tabular-nums ${admin.heading}`}>{formatCount(count)}</p>
          <p className={`mt-1 text-sm font-semibold tabular-nums ${rateColor(rate, invertRate)}`}>
            {rate.toFixed(1)}%
          </p>
          {hint ? <p className={`mt-2 text-xs ${admin.subtle}`}>{hint}</p> : null}
        </div>
        <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
      </div>
    </div>
  );
}

export function MetricsGrid({ metrics }: { metrics: EmailTypeMetrics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <MetricTile label="Delivered" count={metrics.delivered} rate={metrics.deliveryRate} icon={MailCheck} hint={`${formatCount(metrics.attempted)} attempted`} />
      <MetricTile label="Bounced" count={metrics.bounced} rate={metrics.bounceRate} icon={MailX} invertRate hint="Hard + soft bounces" />
      <MetricTile label="Opened" count={metrics.opened} rate={metrics.openRate} icon={Inbox} hint="Unique opens" />
      <MetricTile label="Clicked" count={metrics.clicked} rate={metrics.clickThroughRate} icon={MousePointerClick} hint="Total link clicks" />
      <MetricTile label="Click-to-open" count={metrics.clicked} rate={metrics.clickToOpenRate} icon={TrendingUp} hint="CTOR = clicks ÷ opens" />
      <MetricTile label="Spam complaints" count={metrics.spamComplaints} rate={metrics.spamComplaintRate} icon={ShieldAlert} invertRate hint="Mailbox provider reports" />
      <MetricTile label="Unsubscribed" count={metrics.unsubscribed} rate={metrics.unsubscribeRate} icon={UserMinus} invertRate hint="Opt-outs in period" />
      <MetricTile label="Delivery rate" count={metrics.delivered} rate={metrics.deliveryRate} icon={Activity} hint="Sent ÷ attempted" />
    </div>
  );
}

export function TypePanelHeader({ metrics }: { metrics: EmailTypeMetrics }) {
  return (
    <div className={`rounded-2xl ${admin.gradientPanel} border p-6`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-violet-700 dark:text-violet-300 uppercase">
            {metrics.label}
          </p>
          <p className={`mt-2 text-3xl font-bold ${admin.heading}`}>
            {formatCount(metrics.delivered)}{" "}
            <span className={`text-lg font-medium ${admin.subtle}`}>delivered</span>
          </p>
          <p className={`mt-1 text-sm ${admin.body}`}>
            {metrics.deliveryRate.toFixed(1)}% delivery · {metrics.openRate.toFixed(1)}% open ·{" "}
            {metrics.clickThroughRate.toFixed(1)}% CTR
          </p>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <p className={`text-xs ${admin.subtle}`}>CTOR</p>
            <p className={`text-xl font-bold ${admin.heading}`}>{metrics.clickToOpenRate.toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className={`text-xs ${admin.subtle}`}>Unsubs</p>
            <p className={`text-xl font-bold ${admin.heading}`}>{metrics.unsubscribeRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RecentSendsTable({
  sends,
  emptyMessage = "No sends recorded yet. Welcome emails appear here after footer signups.",
}: {
  sends: WelcomeSendRow[];
  emptyMessage?: string;
}) {
  if (sends.length === 0) {
    return <p className={`text-sm text-center py-8 ${admin.subtle}`}>{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className={`border-b ${admin.divide}`}>
            <th className={`text-left py-2 font-semibold ${admin.label}`}>Recipient</th>
            <th className={`text-left py-2 font-semibold ${admin.label}`}>Status</th>
            <th className={`text-right py-2 font-semibold ${admin.label}`}>Opens</th>
            <th className={`text-right py-2 font-semibold ${admin.label}`}>Clicks</th>
            <th className={`text-right py-2 font-semibold ${admin.label}`}>Sent</th>
          </tr>
        </thead>
        <tbody>
          {sends.map((s) => (
            <tr key={s.id} className={`border-b ${admin.divideSubtle} ${admin.tableRowHover}`}>
              <td className={`py-3 font-medium ${admin.heading}`}>{s.recipientEmail}</td>
              <td className="py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    s.status === "sent"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : s.status === "failed"
                        ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                        : "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {s.status}
                </span>
              </td>
              <td className={`py-3 text-right tabular-nums ${admin.heading}`}>{s.opens}</td>
              <td className={`py-3 text-right tabular-nums ${admin.heading}`}>{s.clicks}</td>
              <td className={`py-3 text-right text-xs tabular-nums ${admin.subtle}`}>
                {new Date(s.sentAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
