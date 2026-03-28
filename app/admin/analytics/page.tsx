import Link from "next/link";
import {
  BarChart3,
  ExternalLink,
  Layout,
  Users,
  Globe,
  Monitor,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-dark-100">
          Analytics
        </h1>
        <p className="text-slate-600 dark:text-purple-300 mt-1">
          Page views, visitors, and traffic from Vercel Web Analytics
        </p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-dark-800/50 border border-slate-200 dark:border-purple-500/30 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-accent-500 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-dark-100">
                Vercel Web Analytics
              </h2>
              <p className="text-sm text-slate-500 dark:text-purple-400">
                Real traffic data from your deployment
              </p>
            </div>
          </div>
          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:opacity-90 transition-opacity"
          >
            Open Vercel Dashboard
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              name: "Page views",
              desc: "Total page loads",
              icon: Layout,
              color: "from-purple-500 to-purple-600",
            },
            {
              name: "Visitors",
              desc: "Unique visitors",
              icon: Users,
              color: "from-accent-500 to-accent-600",
            },
            {
              name: "Top pages",
              desc: "Most visited routes",
              icon: BarChart3,
              color: "from-emerald-500 to-emerald-600",
            },
            {
              name: "Referrers",
              desc: "Traffic sources",
              icon: Globe,
              color: "from-amber-500 to-amber-600",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="p-5 rounded-xl bg-slate-50 dark:bg-dark-900/50 border border-slate-200/50 dark:border-purple-500/20"
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="font-semibold text-slate-900 dark:text-dark-100">
                  {item.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-purple-400">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-dark-900/50 border border-slate-200/50 dark:border-purple-500/20 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
              <Monitor className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 dark:text-dark-100 mb-2">
                View analytics in Vercel
              </h3>
              <p className="text-slate-600 dark:text-purple-300 text-sm mb-4">
                Go to your Vercel project → Analytics tab to see page views,
                unique visitors, top pages, referrers, countries, devices, and
                more. Data is collected via the <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-dark-800 text-sm">@vercel/analytics</code> package
                (already added to your layout).
              </p>
              <p className="text-slate-500 dark:text-purple-400 text-xs">
                Ensure Web Analytics is enabled in your Vercel project settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
