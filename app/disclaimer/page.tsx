import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  Scale,
  FileText,
  Eye,
  Lock,
  CheckCircle,
  Info,
  Calendar,
  Building,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";
import { absoluteUrl } from "../lib/seo";

const canonical = absoluteUrl("/disclaimer");
const LAST_UPDATED = "March 9, 2026";

export const metadata: Metadata = {
  title: { absolute: "Disclaimer | Facts Deck" },
  description:
    "Important legal information for Facts Deck: educational content only, no personalized advice, limitations of liability, affiliate disclosures, and how this relates to our editorial standards.",
  keywords: [
    "Facts Deck disclaimer",
    "legal disclaimer",
    "not financial advice",
    "affiliate disclosure",
    "terms of use",
  ],
  alternates: { canonical },
  openGraph: {
    title: "Disclaimer | Facts Deck",
    description:
      "Read Facts Deck’s disclaimer: general education only, risks, third-party links, and affiliate transparency.",
    url: canonical,
    siteName: "Facts Deck",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Disclaimer | Facts Deck",
    description: "Educational use only, risk warnings, and legal limitations for Facts Deck.",
  },
  robots: { index: true, follow: true },
};

const disclaimerSections = [
  {
    icon: FileText,
    title: "Educational Content Only",
    content:
      "The information on Facts Deck is for general education and information only—the same scope described in our About page under “No Individual Investment Advice.” It is not personalized financial, investment, tax, or legal advice. Consult a qualified professional who knows your situation before you act.",
  },
  {
    icon: Scale,
    title: "No Professional Relationship",
    content:
      "Reading our content or using our tools does not create a professional relationship between you and Facts Deck or any of our contributors. We are not acting as your financial advisor, investment advisor, or fiduciary. Any decisions you make based on our content are your sole responsibility.",
  },
  {
    icon: AlertTriangle,
    title: "Investment Risk Warning",
    content:
      "All investments carry risk, including the potential loss of principal. Past performance does not guarantee future results. The value of investments can go down as well as up, and you may not get back the amount you originally invested. Before making any investment decisions, you should carefully consider your financial situation, investment objectives, and risk tolerance.",
  },
  {
    icon: Eye,
    title: "Accuracy and Timeliness",
    content:
      "While we strive to provide accurate and up-to-date information, we cannot guarantee the completeness, accuracy, or timeliness of all content. Financial markets and regulations change rapidly, and information that was accurate when published may become outdated. Always verify information with current sources.",
  },
];

const legalSections = [
  {
    title: "Limitation of Liability",
    content:
      "Facts Deck, its owners, employees, and contributors shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from the use of our website, content, or tools. This includes, but is not limited to, financial losses, investment losses, or any other damages resulting from reliance on our information.",
  },
  {
    title: "Third-Party Content and Links",
    content:
      "Our website may contain links to third-party websites or reference third-party content. We do not endorse, control, or assume responsibility for the content, privacy policies, or practices of any third-party websites. You acknowledge and agree that we shall not be responsible for any damage or loss caused by your use of any third-party content or services.",
  },
  {
    title: "Affiliate Relationships",
    content:
      "Facts Deck may participate in affiliate or partner programs, as explained on our About page (Product Recommendations). When we do, we disclose those relationships near relevant pages. Compensation does not buy favorable coverage: editorial picks and rankings follow the criteria we publish, and we do not accept payment for undisclosed endorsements. Affiliate relationships do not change our commitment to accurate, sourced content.",
  },
  {
    title: "User-Generated Content",
    content:
      "Comments, reviews, and other user-generated content on our platform represent the opinions of individual users and do not reflect the views of Facts Deck. We do not verify the accuracy of user-generated content and are not responsible for any decisions made based on such content.",
  },
];

const complianceInfo = [
  {
    title: "Disclosure & laws",
    description:
      "We aim to follow applicable rules for financial content and advertising disclosures. Specifics depend on your jurisdiction; this site is operated for educational purposes.",
    icon: Building,
  },
  {
    title: "Privacy",
    description:
      "How we collect and use personal data is set out in our Privacy Policy and is consistent with the transparency commitments on our About page.",
    icon: Lock,
  },
  {
    title: "Editorial standards",
    description:
      "Our fact-checking, corrections, sourcing, and independence policies are described on the About page and guide how we publish—not personalized advice.",
    icon: CheckCircle,
  },
  {
    title: "Regular review",
    description:
      "We review this disclaimer periodically and update the “last updated” date when material changes are made.",
    icon: Calendar,
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

export default function DisclaimerPage() {
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
                <Calendar className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-emerald-400" />
                Updated {LAST_UPDATED}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                <Shield className="h-3.5 w-3.5 shrink-0 text-orange-600 dark:text-cyan-400" />
                Educational use only
              </span>
            </div>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold tracking-widest text-orange-800/80 dark:text-cyan-400/90">
                LEGAL &amp; DISCLOSURES
              </p>
              <h1 className="mt-3 font-display text-4xl font-bold leading-[1.08] text-balance sm:text-5xl md:text-6xl">
                <span className="bg-gradient-to-r from-sky-700 via-indigo-700 to-violet-700 bg-clip-text text-transparent dark:from-emerald-300 dark:via-cyan-300 dark:to-sky-300">Legal Disclaimer</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-300">
                How <span className="font-medium text-zinc-800 dark:text-zinc-200">Facts Deck</span> scopes its content and
                tools: limitations, risks, and transparency—so you know what this site is, and isn&apos;t.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="#key-disclaimers"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:shadow-white/5 dark:hover:bg-zinc-100"
                >
                  Key disclaimers
                </Link>
                <Link
                  href="#legal-terms"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                >
                  Legal terms
                </Link>
                <Link
                  href="#risk"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                >
                  Risk disclosure
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                >
                  Contact us
                </Link>
              </div>

              <p className="mt-6 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                Editorial standards and affiliate transparency: see{" "}
                <Link href="/about" className="font-medium text-blue-800 underline-offset-4 hover:underline dark:text-cyan-300">
                  About
                </Link>
                . Data practices:{" "}
                <Link href="/privacy" className="font-medium text-blue-800 underline-offset-4 hover:underline dark:text-cyan-300">
                  Privacy Policy
                </Link>
                .
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
                    General education—not personalized advice or a client relationship.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500 dark:bg-cyan-400" />
                    Markets and rules change; verify material facts with primary sources.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-emerald-400" />
                    By using the site, you agree to this disclaimer (see full terms below).
                  </li>
                </ul>
              </div>

              <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                <div className="flex items-start gap-3">
                  <div className={iconWrap}>
                    <AlertTriangle className="h-5 w-5" aria-hidden />
                  </div>
                  <p>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">Important:</span> Using Facts Deck means
                    you&apos;ve read and accept this page. Last updated {LAST_UPDATED}.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl bg-white px-4 py-16 dark:bg-zinc-950 sm:px-6 lg:px-8">
        <section id="key-disclaimers" className="mb-20 scroll-mt-24">
          <SectionHeading
            kicker="SCOPE"
            title="Key disclaimers"
            description="Essential information about the nature and limitations of our content, tools, and your relationship with Facts Deck."
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {disclaimerSections.map((section, index) => (
              <div key={index} className={cardSurface}>
                <div className={`${iconWrap} mb-6`}>
                  <section.icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-100 md:text-2xl">
                  {section.title}
                </h3>
                <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-300">{section.content}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="legal-terms" className="mb-20 scroll-mt-24">
          <SectionHeading
            kicker="TERMS"
            title="Legal terms and conditions"
            description="Detailed terms governing use of Facts Deck’s website, content, and tools. Read alongside our Privacy Policy where personal data is involved."
          />

          <div className="space-y-4">
            {legalSections.map((section, index) => (
              <div key={index} className={cardSurface}>
                <h3 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-100 md:text-2xl">
                  {section.title}
                </h3>
                <p className="mt-4 leading-relaxed text-zinc-600 dark:text-zinc-300">{section.content}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-14 sm:px-8 lg:px-10 dark:border-zinc-800 dark:bg-zinc-900">
          <SectionHeading
            kicker="RELATED POLICIES"
            title="Compliance & standards"
            description="How this disclaimer connects to our Privacy Policy, About page, and periodic review—not a substitute for jurisdiction-specific legal advice."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {complianceInfo.map((item, index) => (
              <div
                key={index}
                className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className={`${iconWrap} mx-auto mb-5`}>
                  <item.icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="risk" className="mb-20 scroll-mt-24">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 md:p-12 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <div className={`${iconWrap} mx-auto mb-6`}>
                <AlertTriangle className="h-7 w-7" aria-hidden />
              </div>
              <p className="text-xs font-semibold tracking-widest text-orange-800/80 dark:text-cyan-400/90">RISK NOTICE</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-zinc-900 md:text-4xl dark:text-zinc-100">
                Investment risk disclosure
              </h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-300">
                General notice only—not personalized advice tailored to your situation.
              </p>
            </div>

            <div className="mx-auto max-w-5xl space-y-6 text-zinc-700 dark:text-zinc-200">
              <p className="text-center text-lg leading-relaxed md:text-left">
                <strong className="text-zinc-900 dark:text-zinc-100">All investments involve risk.</strong> Values can
                fluctuate; past performance does not guarantee future results. You may lose some or all of your capital.
              </p>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100">Market risks</h3>
                  <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-orange-500 dark:bg-cyan-400" />
                      Market volatility and price fluctuations
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-orange-500 dark:bg-cyan-400" />
                      Economic and political factors
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-orange-500 dark:bg-cyan-400" />
                      Interest rate changes
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-orange-500 dark:bg-cyan-400" />
                      Currency exchange rate risks
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100">Investment risks</h3>
                  <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-orange-500 dark:bg-cyan-400" />
                      Company-specific risks
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-orange-500 dark:bg-cyan-400" />
                      Sector and industry risks
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-orange-500 dark:bg-cyan-400" />
                      Liquidity risks
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-orange-500 dark:bg-cyan-400" />
                      Inflation and purchasing power risks
                    </li>
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">Reminder</p>
                <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                  Before investing, consider your objectives, horizon, and risk tolerance. Seek a qualified professional when
                  you need advice tailored to you.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm md:p-12 dark:border-zinc-800 dark:bg-zinc-950">
          <div className={`${iconWrap} mx-auto mb-6`}>
            <Info className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="font-display text-3xl font-bold text-zinc-900 dark:text-zinc-100">Questions about this disclaimer?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-zinc-600 dark:text-zinc-300">
            For clarification on these terms or how they apply to your use of the site, reach out—we&apos;ll respond as we
            can, without providing individualized legal or investment advice here.
          </p>

          <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <Link
              href="/contact"
              className="inline-flex h-12 gap-2 items-center justify-center rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:shadow-white/5 dark:hover:bg-zinc-100"
            >
              <Phone className="h-4 w-4" aria-hidden />
              Contact us
            </Link>
            <Link
              href="/privacy"
              className="inline-flex gap-2 h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
              Privacy Policy
            </Link>
            <Link
              href="/about#editorial-guidelines"
              className="inline-flex gap-2 h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
              Editorial standards
            </Link>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <Mail className="mx-auto mb-3 h-6 w-6 text-blue-600 dark:text-emerald-400" aria-hidden />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Email</h3>
              <p className="mt-1 font-medium text-zinc-800 dark:text-zinc-200">legal@factsdeck.com</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <Phone className="mx-auto mb-3 h-6 w-6 text-orange-600 dark:text-cyan-400" aria-hidden />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Phone</h3>
              <p className="mt-1 font-medium text-zinc-800 dark:text-zinc-200">+1 (555) 123-LEGAL</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900 col-span-2 mx-auto md:col-span-1 md:mx-0">
              <Building className="mx-auto mb-3 h-6 w-6 text-blue-600 dark:text-emerald-400" aria-hidden />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Office</h3>
              <p className="mt-1 font-medium text-zinc-800 dark:text-zinc-200">Legal &amp; Compliance, NY</p>
            </div>
          </div>

          <div className="mt-10 space-y-1 text-sm text-zinc-500 dark:text-zinc-400">
            <p>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Last updated:</span> {LAST_UPDATED}
            </p>
            <p>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Effective:</span> {LAST_UPDATED}
            </p>
            <p>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Version:</span> 2.1
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
