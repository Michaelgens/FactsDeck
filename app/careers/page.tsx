import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Telescope,
  Orbit,
  Lightbulb,
  HeartHandshake,
  Rocket,
  Mail,
  Compass,
  CheckCircle,
  Briefcase,
} from "lucide-react";
import { absoluteUrl } from "../lib/seo";

const canonical = absoluteUrl("/careers");
const LAST_UPDATED = "March 9, 2026";

export const metadata: Metadata = {
  title: { absolute: "Careers | Facts Deck" },
  description:
    "Build the future of financial education with Facts Deck. No open roles right now—learn how we work, what we value, and how to stay on our radar.",
  keywords: [
    "Facts Deck careers",
    "finance media jobs",
    "remote editorial",
    "fintech careers",
  ],
  alternates: { canonical },
  openGraph: {
    title: "Careers | Facts Deck",
    description:
      "We’re assembling a crew for clearer money stories—culture, craft, and how to stay on our radar.",
    url: canonical,
    siteName: "Facts Deck",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers | Facts Deck",
    description: "Facts Deck careers: mission, culture, and staying in orbit—no listings yet, lots of signal.",
  },
  robots: { index: true, follow: true },
};

const signals = [
  {
    icon: Telescope,
    title: "Explainers who obsess over footnotes",
    blurb:
      "You get joy from turning a dense IRS paragraph or fund prospectus into something a friend would actually read.",
  },
  {
    icon: Orbit,
    title: "Product minds who respect the math",
    blurb:
      "You ship interfaces where sliders and disclaimers feel honest—not flashy charts that oversell certainty.",
  },
  {
    icon: Lightbulb,
    title: "Researchers who cite before they speculate",
    blurb: "You’d rather link to the primary source than win the take. Curiosity beats hot takes.",
  },
  {
    icon: HeartHandshake,
    title: "Humans who design for everyone’s wallet",
    blurb: "You think about renters, gig workers, and first-gen investors—not only the spreadsheet crowd.",
  },
];

const cardSurface =
  "rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-colors hover:border-blue-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800/80";

const iconWrap =
  "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-200/90 bg-orange-50 text-blue-700 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-cyan-300";

function SectionHeading({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-12 max-w-3xl">
      <p className="text-xs font-semibold tracking-widest text-orange-800/80 dark:text-cyan-400/90">{kicker}</p>
      <div className="mt-3">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl dark:text-zinc-100">
            {title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function CareersPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Ambient layers */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[4rem_4rem] dark:bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[42rem] w-[min(90rem,200%)] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-200/35 via-orange-100/15 to-transparent blur-3xl dark:from-emerald-950/50 dark:via-blue-950/30 dark:to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-[28rem] right-[-10%] h-96 w-96 rounded-full bg-orange-100/30 blur-3xl dark:bg-cyan-950/25"
        aria-hidden
      />
      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="hidden sm:inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-orange-50 hover:text-blue-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-300"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              Back to home
            </Link>

            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                <Briefcase className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-emerald-400" />
                No open roles today
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                <CheckCircle className="h-3.5 w-3.5 shrink-0 text-orange-600 dark:text-cyan-400" />
                Updated {LAST_UPDATED}
              </span>
            </div>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold tracking-widest text-orange-800/80 dark:text-cyan-400/90">
                CAREERS
              </p>
              <h1 className="mt-3 font-display text-4xl font-bold leading-[1.08] text-balance sm:text-5xl md:text-6xl">
                <span className="bg-gradient-to-r from-sky-700 via-indigo-700 to-violet-700 bg-clip-text text-transparent dark:from-emerald-300 dark:via-cyan-300 dark:to-sky-300">Careers at Facts Deck</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-300">
                We build clear, sourced financial education—without the hype. We don&apos;t have roles posted today, but we
                keep a high-signal inbox for people who care about craft and readers.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="mailto:careers@factsdeck.com?subject=Future%20at%20Facts%20Deck"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:shadow-white/5 dark:hover:bg-zinc-100"
                >
                  <Mail className="h-5 w-5 shrink-0" aria-hidden />
                  careers@factsdeck.com
                </a>
                <Link
                  href="#how-we-work"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                >
                  How we work
                </Link>
                <Link
                  href="#signals"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                >
                  Profiles we seek
                </Link>
              </div>

              <p className="mt-6 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                Reaching out? Include what you want to build and one or two links that show your craft.
              </p>
            </div>

            <aside className="lg:col-span-5">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs font-semibold tracking-widest text-orange-800/90 dark:text-cyan-400/90">
                  AT A GLANCE
                </p>
                <ul className="mt-4 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-emerald-400" />
                    Editorial accuracy and independence are non-negotiable—see About.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500 dark:bg-cyan-400" />
                    New listings will appear here and on our channels when we post.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-emerald-400" />
                    We&apos;d rather wait for fit than hire fast and misalign.
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl bg-white px-4 py-16 dark:bg-zinc-950 sm:px-6 lg:px-8">
        <section id="hiring" className="mb-20 scroll-mt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className={`${iconWrap} mx-auto mb-6`}>
              <Rocket className="h-7 w-7" aria-hidden />
            </div>
            <p className="text-xs font-semibold tracking-widest text-orange-800/80 dark:text-cyan-400/90">OPEN ROLES</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-zinc-900 md:text-4xl dark:text-zinc-100">
              The deck is still being shuffled
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
              Startups that teach finance don&apos;t win by hiring fast—they win by hiring{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">right</span>. We&apos;d rather leave chairs
              empty than fill them with misaligned energy. When we post roles, they&apos;ll live here. Until then, treat
              this page as a <span className="font-medium text-zinc-800 dark:text-zinc-200">signal booster</span> for
              kindred spirits.
            </p>
          </div>
        </section>

        <section id="how-we-work" className="mb-20 scroll-mt-24 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-14 sm:px-8 lg:px-10 dark:border-zinc-800 dark:bg-zinc-900">
          <SectionHeading
            kicker="CULTURE"
            title="How we work"
            description="Principles that show up in our About page and in how we ship articles and tools."
          />

          <div className="mx-auto max-w-3xl space-y-4">
            <div className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <span className="font-mono text-sm font-bold tabular-nums text-blue-800 dark:text-emerald-300">01</span>
              <p className="text-zinc-600 dark:text-zinc-300">
                <strong className="text-zinc-900 dark:text-zinc-100">Editorial gravity.</strong> Accuracy, sourcing, and
                independence aren&apos;t slogans—they&apos;re spelled out on our About page for a reason.
              </p>
            </div>
            <div className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <span className="font-mono text-sm font-bold tabular-nums text-orange-600 dark:text-cyan-400">02</span>
              <p className="text-zinc-600 dark:text-zinc-300">
                <strong className="text-zinc-900 dark:text-zinc-100">Tools with humility.</strong> Calculators should
                educate, not imply false precision. We label uncertainty where it belongs.
              </p>
            </div>
            <div className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <span className="font-mono text-sm font-bold tabular-nums text-blue-800 dark:text-emerald-300">03</span>
              <p className="text-zinc-600 dark:text-zinc-300">
                <strong className="text-zinc-900 dark:text-zinc-100">Async-friendly, human at the core.</strong> Deep work
                wins; meetings are for decisions, not theater.
              </p>
            </div>
          </div>
        </section>

        <section id="signals" className="mb-20 scroll-mt-24">
          <SectionHeading
            kicker="PROFILES"
            title="Constellations we’re curious about"
            description="Not job descriptions—gravitational pulls. If several of these feel like you, we’d love a note for the future."
          />

          <div className="grid gap-6 sm:grid-cols-2">
            {signals.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className={`${cardSurface} p-6`}>
                  <div className={`${iconWrap} mb-5`}>
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{s.blurb}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center shadow-sm md:p-12 dark:border-zinc-800 dark:bg-zinc-900">
          <div className={`${iconWrap} mx-auto mb-6`}>
            <Mail className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="font-display text-2xl font-bold text-zinc-900 md:text-3xl dark:text-zinc-100">
            Stay on the trajectory
          </h2>
          <p className="mx-auto my-3 max-w-lg text-zinc-600 dark:text-zinc-300">
            Send a short hello: who you are, what you&apos;d want to build at Facts Deck, and a link or two that shows your
            craft. We read everything; we reply when there&apos;s a clear next step—even if that&apos;s &quot;let&apos;s
            reconnect in six months.&quot;
          </p>
          <a
            href="mailto:careers@factsdeck.com?subject=Hello%20from%20orbit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:shadow-white/5 dark:hover:bg-zinc-100 mt-2"
          >
            <Mail className="h-5 w-5 shrink-0" aria-hidden />
            careers@factsdeck.com
          </a>
          <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
            No automated keyword filters—just humans, coffee, and inbox discipline.
          </p>
        </section>

        <p className="mt-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link
            href="/contact"
            className="font-medium text-blue-800 underline-offset-4 hover:underline dark:text-cyan-300"
          >
            General contact
          </Link>
          {" · "}
          <Link
            href="/about"
            className="font-medium text-blue-800 underline-offset-4 hover:underline dark:text-cyan-300"
          >
            About &amp; editorial
          </Link>
          {" · "}
          <Link
            href="/post"
            className="font-medium text-blue-800 underline-offset-4 hover:underline dark:text-cyan-300"
          >
            Read the site
          </Link>
        </p>
      </div>
    </div>
  );
}
