import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Telescope,
  Orbit,
  Lightbulb,
  HeartHandshake,
  Rocket,
  Mail,
  Compass,
  Stars,
} from "lucide-react";
import { absoluteUrl } from "../lib/seo";

const canonical = absoluteUrl("/careers");

export const metadata: Metadata = {
  title: { absolute: "FactsDeck | Careers" },
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
    title: "FactsDeck | Careers",
    description:
      "We’re assembling a crew for clearer money stories—culture, craft, and how to wave from the launchpad.",
    url: canonical,
    siteName: "Facts Deck",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FactsDeck | Careers",
    description: "Facts Deck careers: mission, culture, and staying in orbit—no listings yet, lots of signal.",
  },
  robots: { index: true, follow: true },
};

const signals = [
  {
    icon: Telescope,
    title: "Explainers who obsess over footnotes",
    blurb: "You get joy from turning a dense IRS paragraph or fund prospectus into something a friend would actually read.",
  },
  {
    icon: Orbit,
    title: "Product minds who respect the math",
    blurb: "You ship interfaces where sliders and disclaimers feel honest—not flashy charts that oversell certainty.",
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

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-dark-950 dark:via-slate-900 dark:to-purple-950/40">
      <section className="relative overflow-hidden border-b border-purple-200/40 dark:border-purple-500/20 bg-gradient-to-br from-indigo-950 via-purple-900 to-amber-950/80 text-white">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="absolute bottom-10 right-[15%] w-96 h-96 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,42rem)] h-[min(90vw,42rem)] rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_50%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <Link
            href="/"
            className="inline-flex items-center glass-effect text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all duration-300 mb-8"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Link>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest text-amber-200/90 mb-6">
              <Stars className="h-3.5 w-3.5" />
              Launchpad, not job board
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 text-balance leading-tight">
              Careers at{" "}
              <span className="bg-gradient-to-r from-amber-200 via-white to-violet-200 bg-clip-text text-transparent">
                Facts Deck
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/85 leading-relaxed max-w-2xl mx-auto mb-8">
              We&apos;re building a place where money makes sense—without the hype. There are{" "}
              <strong className="text-white">no open roles posted today</strong>, but the mission is very much in
              motion. This page is our open frequency: who we are, how we work, and how to stay in orbit.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="mailto:careers@factsdeck.com?subject=Future%20at%20Facts%20Deck"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-purple-900 font-bold hover:bg-amber-100 transition-colors shadow-lg"
              >
                <Mail className="h-5 w-5" />
                Ping the launchpad
              </a>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-white/40 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                <Compass className="h-5 w-5" />
                Read our standards
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 space-y-16">
        <section className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 mb-4">
            <Rocket className="h-8 w-8" />
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            The deck is still being shuffled
          </h2>
          <p className="text-slate-600 dark:text-purple-200/90 leading-relaxed text-lg">
            Startups that teach finance don&apos;t win by hiring fast—they win by hiring{" "}
            <em className="text-purple-700 dark:text-purple-300 not-italic font-semibold">right</em>. We&apos;d
            rather leave chairs empty than fill them with misaligned energy. When we post roles, they&apos;ll
            live here and on our channels. Until then, consider this a{" "}
            <span className="text-purple-600 dark:text-emerald-400 font-medium">signal booster</span> for kindred
            spirits.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            How we work (the short version)
          </h2>
          <ul className="mt-4 space-y-3 text-slate-600 dark:text-purple-200/90">
            <li className="flex gap-3">
              <span className="text-purple-500 font-mono font-bold">01</span>
              <span>
                <strong className="text-slate-800 dark:text-white">Editorial gravity.</strong> Accuracy, sourcing,
                and independence aren&apos;t slogans—they&apos;re in our About page for a reason.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-500 font-mono font-bold">02</span>
              <span>
                <strong className="text-slate-800 dark:text-white">Tools with humility.</strong> Calculators should
                educate, not imply false precision. We label uncertainty where it belongs.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-500 font-mono font-bold">03</span>
              <span>
                <strong className="text-slate-800 dark:text-white">Async-friendly, human at the core.</strong> Deep
                work wins; meetings are for decisions, not theater.
              </span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Constellations we&apos;re curious about
          </h2>
          <p className="text-center text-slate-600 dark:text-purple-200/85 mb-10 max-w-xl mx-auto">
            Not job descriptions—just gravitational pulls. If several of these feel like you, we&apos;d love a
            note for the future.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {signals.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="rounded-2xl border border-slate-200 dark:border-purple-500/25 bg-slate-50/80 dark:bg-dark-900/50 p-6 hover:border-purple-300 dark:hover:border-purple-500/40 transition-colors"
                >
                  <Icon className="h-8 w-8 text-purple-600 dark:text-emerald-400 mb-3" />
                  <h3 className="font-display font-bold text-slate-900 dark:text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-purple-200/85 leading-relaxed">{s.blurb}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-700 dark:from-purple-800 dark:to-indigo-950 text-white p-8 md:p-10 text-center shadow-xl shadow-purple-500/20">
          <h2 className="font-display text-2xl font-bold mb-3">Stay on the trajectory</h2>
          <p className="text-white/90 leading-relaxed mb-6 max-w-lg mx-auto">
            Send a short hello: who you are, what you&apos;d want to build at Facts Deck, and a link or two that
            shows your craft. We read everything; we reply when there&apos;s a clear next step—even if that step
            is &quot;let&apos;s reconnect in six months.&quot;
          </p>
          <a
            href="mailto:careers@factsdeck.com?subject=Hello%20from%20orbit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-purple-800 font-bold hover:bg-amber-100 transition-colors"
          >
            <Mail className="h-5 w-5" />
            careers@factsdeck.com
          </a>
          <p className="text-xs text-white/70 mt-6">
            No automated keyword filters—just humans, coffee, and inbox discipline.
          </p>
        </section>

        <p className="text-center text-sm text-slate-500 dark:text-purple-400/80">
          <Link href="/contact" className="text-purple-600 dark:text-emerald-400 hover:underline font-medium">
            General contact
          </Link>
          {" · "}
          <Link href="/about" className="text-purple-600 dark:text-emerald-400 hover:underline font-medium">
            About &amp; editorial
          </Link>
        </p>
      </div>
    </div>
  );
}
