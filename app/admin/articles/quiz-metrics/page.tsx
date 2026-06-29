import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Eye,
  GraduationCap,
  MousePointerClick,
  Rocket,
  Sparkles,
  Trophy,
  UserX,
} from "lucide-react";
import { getQuizMetricsInsights, formatRate } from "../../../lib/quiz-insights";
import { AdminPageHeader, AdminPanel, KpiCard, AdminAlert } from "../../components/admin-ui";
import { admin } from "../../components/admin-theme";
import ArticlesSubnav from "../../components/ArticlesSubnav";
import AdminQuizMetricsTable from "./AdminQuizMetricsTable";
import { getAllPostsWithLoadError } from "../../../lib/posts";

export default async function AdminQuizMetricsPage() {
  const data = await getQuizMetricsInsights();
  const {
    totals,
    rows,
    topByCompletion,
    highIntentLowFinish,
    quizDeserts,
    launchCandidates,
    postsLoadError,
  } = data;

  const { posts } = await getAllPostsWithLoadError();
  const tablePosts = posts
    .filter((p) => p.quiz && p.quiz.questions.length > 0)
    .map((p) => ({
      id: p.id,
      quizQuestions: p.quiz!.questions.map((q) => ({
        prompt: q.prompt,
        correctOptionId: q.correctOptionId,
        options: q.options.map((o) => ({ id: o.id, label: o.label })),
      })),
      resultBands: p.quiz!.resultBands ?? [],
    }));

  const siteParticipation =
    totals.impressions > 0 ? totals.starts / totals.impressions : null;
  const siteCompletion = totals.starts > 0 ? totals.completions / totals.starts : null;

  return (
    <div>
      <AdminPageHeader
        title="Quiz metrics"
        description="Knowledge quiz funnels — who started, who finished, and how many readers earned a score card."
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

      <div className="mb-8 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-orange-50/40 to-white dark:from-amber-950/30 dark:via-orange-950/20 dark:to-zinc-950 dark:border-amber-900/40 px-5 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display font-bold text-lg text-amber-950 dark:text-amber-100">
                Retention scoreboard
              </p>
              <p className="text-sm text-amber-900/80 dark:text-amber-200/80 max-w-xl">
                Every completion means a reader finished all graded quiz questions and received a performance
                band — a signal they engaged deeply with the article.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-center sm:text-right">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Site finish rate
              </p>
              <p className="font-display text-2xl font-bold tabular-nums text-amber-950 dark:text-amber-100">
                {formatRate(siteCompletion)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Score cards earned
              </p>
              <p className="font-display text-2xl font-bold tabular-nums text-amber-950 dark:text-amber-100">
                {totals.scoreCardsEarned.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KpiCard
          name="Articles with active quiz"
          value={`${totals.withActiveQuiz}`}
          sub={`${totals.withoutQuiz} published without one`}
          icon={Brain}
          gradient="from-amber-500 to-orange-600"
        />
        <KpiCard
          name="Quiz impressions"
          value={totals.impressions.toLocaleString()}
          sub={`${formatRate(siteParticipation)} started · ${formatRate(siteCompletion)} finished`}
          icon={Eye}
          gradient="from-yellow-500 to-amber-600"
        />
        <KpiCard
          name="Score cards earned"
          value={totals.scoreCardsEarned.toLocaleString()}
          sub={`${totals.completions.toLocaleString()} full completions`}
          icon={Trophy}
          gradient="from-orange-500 to-red-500"
        />
        <KpiCard
          name="Quiz starts"
          value={totals.starts.toLocaleString()}
          sub={`${totals.skips.toLocaleString()} explicit skips`}
          icon={Sparkles}
          gradient="from-rose-500 to-pink-600"
        />
      </div>

      <div
        className={`mb-8 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/15 px-5 py-4 text-sm leading-relaxed`}
      >
        <p className="font-semibold mb-2 flex items-center gap-2 text-amber-950 dark:text-amber-100">
          <MousePointerClick className="h-4 w-4" />
          How quiz metrics are counted
        </p>
        <ul className="list-disc pl-5 space-y-1 text-amber-950/90 dark:text-amber-100/85">
          <li>
            <strong>Impressions</strong> — quiz module available on the article (once per browser session).
          </li>
          <li>
            <strong>Starts</strong> — reader opened the quiz or chose it from the engagement modal.
          </li>
          <li>
            <strong>Finished</strong> — all quiz questions answered (score card shown).
          </li>
          <li>
            <strong>Score cards</strong> — same as finishes; individual band labels (Expert, Strong, etc.)
            are calculated client-side and not stored server-side.
          </li>
          <li>
            <strong>Skipped</strong> — “Not now” on the quiz intro.
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AdminPanel title="Top finish rate" description="Min. 1 start · among articles with quiz traffic">
          {topByCompletion.length === 0 ? (
            <p className={`text-sm ${admin.body} py-4`}>No quiz starts yet.</p>
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
                  <span className="shrink-0 tabular-nums font-bold text-amber-700 dark:text-amber-400">
                    {formatRate(r.completionRate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel
          title="Started but didn't finish"
          description="≥3 starts and finish rate under 50% — quiz may be too hard or long"
        >
          {highIntentLowFinish.length === 0 ? (
            <p className={`text-sm ${admin.body} py-4`}>No drop-off patterns flagged.</p>
          ) : (
            <ul className="space-y-3">
              {highIntentLowFinish.map((r) => (
                <li key={r.id} className="text-sm">
                  <Link
                    href={`/admin/articles/${r.id}/edit`}
                    className={`font-semibold ${admin.link}`}
                  >
                    {r.title}
                  </Link>
                  <p className={`text-xs ${admin.subtle} mt-0.5`}>
                    {r.analytics.starts} starts · Finish {formatRate(r.completionRate)} ·{" "}
                    {r.scoreCardsEarned} score cards
                  </p>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel
          title="Quiz deserts"
          description="Quiz on, traffic passing by, zero starts (≥15 impressions)"
        >
          {quizDeserts.length === 0 ? (
            <p className={`text-sm ${admin.body} py-4`}>Every active quiz is getting clicks.</p>
          ) : (
            <ul className="space-y-3">
              {quizDeserts.map((r) => (
                <li key={r.id} className="text-sm">
                  <Link
                    href={`/admin/articles/${r.id}/edit`}
                    className={`font-semibold ${admin.link}`}
                  >
                    {r.title}
                  </Link>
                  <p className={`text-xs ${admin.subtle} mt-0.5`}>
                    {r.views.toLocaleString()} views · {r.analytics.impressions} impressions ·{" "}
                    <UserX className="inline h-3 w-3" /> 0 starts
                  </p>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel
          title="Launch candidates"
          description="High-traffic published articles still without a quiz"
        >
          {launchCandidates.length === 0 ? (
            <p className={`text-sm ${admin.body} py-4`}>No high-traffic gaps right now.</p>
          ) : (
            <ul className="space-y-3">
              {launchCandidates.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/articles/${r.id}/edit`}
                      className={`font-semibold ${admin.link}`}
                    >
                      {r.title}
                    </Link>
                    <p className={`text-xs ${admin.subtle} mt-0.5`}>
                      {r.views.toLocaleString()} views · no quiz yet
                    </p>
                  </div>
                  <Rocket className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>

      <AdminQuizMetricsTable rows={rows} posts={tablePosts} />

      <p className={`mt-8 text-sm ${admin.subtle}`}>
        Community poll votes and breakdowns live on{" "}
        <Link href="/admin/articles/content" className={`font-semibold ${admin.link} hover:underline`}>
          Poll metrics →
        </Link>
      </p>
    </div>
  );
}
