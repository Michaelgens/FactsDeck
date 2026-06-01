import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Eye,
  MessageCircleQuestion,
  MousePointerClick,
  Trophy,
  UserX,
} from "lucide-react";
import { getContentMetricsInsights, formatRate } from "../../../lib/poll-insights";
import { AdminPageHeader, AdminPanel, KpiCard, AdminAlert } from "../../components/admin-ui";
import { admin } from "../../components/admin-theme";
import ArticlesSubnav from "../../components/ArticlesSubnav";
import AdminContentMetricsTable from "./AdminContentMetricsTable";
import { getAllPostsWithLoadError } from "../../../lib/posts";

export default async function AdminArticleContentPage() {
  const data = await getContentMetricsInsights();
  const { totals, rows, topByCompletion, needsAttention, postsLoadError } = data;

  const { posts } = await getAllPostsWithLoadError();
  const tablePosts = posts
    .filter((p) => p.poll && p.poll.questions.length > 0)
    .map((p) => ({
      id: p.id,
      pollQuestions: p.poll!.questions.map((q) => ({
        prompt: q.prompt,
        kind: q.kind,
        options: q.options.map((o) => ({ label: o.label, votes: o.votes })),
      })),
    }));

  const siteParticipation =
    totals.impressions > 0 ? totals.starts / totals.impressions : null;
  const siteCompletion = totals.starts > 0 ? totals.completions / totals.starts : null;

  return (
    <div>
      <AdminPageHeader
        title="Content metrics"
        description="Article performance and reader poll funnels — impressions, starts, completions, skips, and per-question votes."
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

      {postsLoadError ? (
        <AdminAlert title="Could not load articles" variant="error">
          {postsLoadError}
        </AdminAlert>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KpiCard
          name="Articles with active poll"
          value={`${totals.withActivePoll}`}
          sub={`of ${totals.published} published`}
          icon={MessageCircleQuestion}
          gradient="from-violet-500 to-purple-600"
        />
        <KpiCard
          name="Poll impressions"
          value={totals.impressions.toLocaleString()}
          sub={`${formatRate(siteParticipation)} started · ${formatRate(siteCompletion)} finished`}
          icon={Eye}
          gradient="from-sky-500 to-blue-600"
        />
        <KpiCard
          name="Completions"
          value={totals.completions.toLocaleString()}
          sub={`${totals.starts.toLocaleString()} starts`}
          icon={Trophy}
          gradient="from-amber-500 to-orange-600"
        />
        <KpiCard
          name="Answer votes recorded"
          value={totals.totalAnswerVotes.toLocaleString()}
          sub={`${totals.skips.toLocaleString()} explicit skips`}
          icon={BarChart3}
          gradient="from-emerald-500 to-teal-600"
        />
      </div>

      <div className={`mb-8 rounded-2xl ${admin.calloutSky} border px-5 py-4 text-sm leading-relaxed`}>
        <p className="font-semibold mb-2 flex items-center gap-2">
          <MousePointerClick className="h-4 w-4" />
          How funnel metrics are counted
        </p>
        <ul className="list-disc pl-5 space-y-1 opacity-95">
          <li>
            <strong>Impressions</strong> — poll module shown on the article (once per browser session).
          </li>
          <li>
            <strong>Starts</strong> — reader clicked “Start challenge” or opened the poll from a CTA.
          </li>
          <li>
            <strong>Done</strong> — all five questions answered.
          </li>
          <li>
            <strong>Skipped</strong> — “Not now” on the intro screen.
          </li>
          <li>
            <strong>No action</strong> — saw the poll but did not start or skip (impressions − starts − skips).
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AdminPanel title="Top completion rate" description="Min. 1 start · among articles with poll traffic">
          {topByCompletion.length === 0 ? (
            <p className={`text-sm ${admin.body} py-4`}>No poll starts yet.</p>
          ) : (
            <ul className="space-y-3">
              {topByCompletion.map((r) => (
                <li key={r.id} className="flex justify-between gap-3 text-sm">
                  <Link
                    href={`/admin/articles/${r.id}/edit`}
                    className={`font-semibold truncate ${admin.link}`}
                  >
                    {r.title}
                  </Link>
                  <span className="shrink-0 tabular-nums font-bold text-emerald-700 dark:text-emerald-400">
                    {formatRate(r.completionRate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel
          title="Needs attention"
          description="Active poll + ≥10 impressions but low start or finish rate"
        >
          {needsAttention.length === 0 ? (
            <p className={`text-sm ${admin.body} py-4`}>No articles flagged right now.</p>
          ) : (
            <ul className="space-y-3">
              {needsAttention.map((r) => (
                <li key={r.id} className="text-sm">
                  <Link
                    href={`/admin/articles/${r.id}/edit`}
                    className={`font-semibold ${admin.link}`}
                  >
                    {r.title}
                  </Link>
                  <p className={`text-xs ${admin.subtle} mt-0.5`}>
                    Start {formatRate(r.participationRate)} · Finish {formatRate(r.completionRate)}
                    · <UserX className="inline h-3 w-3" /> {r.passiveCount} no action
                  </p>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>

      <AdminContentMetricsTable rows={rows} posts={tablePosts} />
    </div>
  );
}
