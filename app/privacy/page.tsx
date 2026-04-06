import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Database,
  Cookie,
  Globe,
  Settings,
  Bell,
  Download,
  Trash2,
  CheckCircle,
  Info,
  User,
  Mail,
  Phone,
  Building,
  Shield,
} from "lucide-react";
import { absoluteUrl } from "../lib/seo";

const canonical = absoluteUrl("/privacy");
const LAST_UPDATED = "March 9, 2026";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy | Facts Deck" },
  description:
    "How Facts Deck collects, uses, and protects personal information when you use our site, newsletters, and tools—aligned with our commitment to transparency and reader trust.",
  keywords: [
    "Facts Deck privacy",
    "privacy policy",
    "data protection",
    "cookies",
    "GDPR",
    "CCPA",
  ],
  alternates: { canonical },
  openGraph: {
    title: "Privacy Policy | Facts Deck",
    description:
      "Facts Deck’s privacy policy: what we collect, how we use it, your rights, cookies, and how to contact us.",
    url: canonical,
    siteName: "Facts Deck",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Facts Deck",
    description: "How Facts Deck handles personal data and respects your privacy choices.",
  },
  robots: { index: true, follow: true },
};

const privacySections = [
  {
    icon: Database,
    title: "Information We Collect",
    content:
      "We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us. This includes your name, email address, and any other information you choose to provide. We also automatically collect certain information about your device and how you interact with our services.",
  },
  {
    icon: Info,
    title: "How We Use Your Information",
    content:
      "We use the information we collect to provide, maintain, and improve our services, send you technical notices and support messages, respond to your comments and questions, and communicate with you about products, services, and events. We may also use your information for research and analytics purposes.",
  },
  {
    icon: CheckCircle,
    title: "Information Sharing",
    content:
      "We do not sell your personal information to data brokers or marketing lists. We may share information with trusted service providers (for example hosting, email delivery, or analytics) who process data on our behalf under contract and only for the purposes we describe. We may also disclose information when required by law or to protect our rights and users. Where we use affiliate or partner technologies, we align disclosures with our editorial standards described on our About page.",
  },
  {
    icon: Settings,
    title: "Data Security",
    content:
      "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, so we cannot guarantee absolute security.",
  },
];

const dataTypes = [
  {
    category: "Account Information",
    items: ["Name and email address", "Profile information", "Account preferences", "Subscription status"],
    icon: User,
  },
  {
    category: "Usage Data",
    items: ["Pages visited and time spent", "Articles read and bookmarked", "Search queries", "Device and browser information"],
    icon: Database,
  },
  {
    category: "Communication Data",
    items: ["Contact form submissions", "Email communications", "Support ticket information", "Newsletter preferences"],
    icon: Mail,
  },
  {
    category: "Technical Data",
    items: ["IP address and location", "Device identifiers", "Browser type and version", "Operating system"],
    icon: Settings,
  },
];

const userRights = [
  { title: "Access Your Data", description: "Request a copy of the personal information we hold about you.", icon: Download, action: "Request Data Export" },
  { title: "Correct Your Data", description: "Update or correct any inaccurate personal information.", icon: Settings, action: "Update Information" },
  { title: "Delete Your Data", description: "Request deletion of your personal information from our systems.", icon: Trash2, action: "Delete Account" },
  { title: "Control Communications", description: "Manage your email preferences and notification settings.", icon: Bell, action: "Manage Preferences" },
];

const cookieTypes = [
  { type: "Essential Cookies", purpose: "Required for basic website functionality and security", examples: ["Authentication", "Security", "Load balancing"], required: true },
  { type: "Analytics Cookies", purpose: "Help us understand how visitors interact with our website", examples: ["Page views", "User behavior", "Performance metrics"], required: false },
  { type: "Preference Cookies", purpose: "Remember your settings and preferences", examples: ["Theme selection", "Language preference", "Layout choices"], required: false },
  { type: "Marketing Cookies", purpose: "Used to deliver relevant advertisements and track campaigns", examples: ["Ad targeting", "Campaign tracking", "Social media integration"], required: false },
];

const complianceStandards = [
  {
    title: "GDPR-aligned practices",
    description:
      "Where we process data of individuals in the EEA, UK, or Switzerland, we aim to apply GDPR principles: lawful bases, transparency, access, rectification, erasure, and portability where applicable.",
    icon: Globe,
  },
  {
    title: "CCPA / CPRA awareness",
    description:
      "California residents may have additional rights (e.g., to know, delete, and opt out of certain sales or sharing). Contact us to exercise those rights; we describe our practices in good faith and update this policy when our processing changes.",
    icon: CheckCircle,
  },
  {
    title: "Security measures",
    description:
      "We use technical and organizational measures appropriate to our size and risk to protect personal information. No online service can guarantee perfect security; see our Data Security section.",
    icon: Settings,
  },
  {
    title: "Transparency",
    description:
      "Our approach to trust and editorial independence—including how we handle affiliate disclosures—is summarized on our About page and is consistent with how we describe data use here.",
    icon: CheckCircle,
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

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Hero — flat, no gradients; brand accents match Header/Footer */}
      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-orange-50 hover:text-blue-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-300"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              Back to home
            </Link>

            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200">
                <CheckCircle className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-emerald-400" />
                Updated {LAST_UPDATED}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                <Shield className="h-3.5 w-3.5 shrink-0 text-orange-600 dark:text-cyan-400" />
                We don’t sell personal information
              </span>
            </div>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold tracking-widest text-orange-800/80 dark:text-cyan-400/90">
                TRUST &amp; PRIVACY
              </p>
              <h1 className="mt-3 font-display text-4xl font-bold leading-[1.08] text-balance sm:text-5xl md:text-6xl">
                <span className="text-blue-800 dark:text-emerald-300">Privacy</span>{" "}
                <span className="text-orange-600 dark:text-cyan-400">Policy</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-300">
                Plain-language summary of what we collect, why we use it, and the choices you have across{" "}
                <span className="font-medium text-zinc-800 dark:text-zinc-200">Facts Deck</span> articles, tools, and email.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="#what-we-collect"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  What we collect
                </Link>
                <Link
                  href="#your-rights"
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-orange-50 hover:text-blue-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-emerald-950/40 dark:hover:text-cyan-300"
                >
                  Your rights
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-orange-50 hover:text-blue-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-emerald-950/40 dark:hover:text-cyan-300"
                >
                  Contact privacy
                </Link>
              </div>

              <p className="mt-6 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                Editorial and affiliate transparency: see our{" "}
                <Link href="/about" className="font-medium text-blue-800 underline-offset-4 hover:underline dark:text-cyan-300">
                  About
                </Link>{" "}
                page.
              </p>
            </div>

            <aside className="lg:col-span-5">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/35">
                <p className="text-xs font-semibold tracking-widest text-orange-800/90 dark:text-cyan-400/90">
                  AT A GLANCE
                </p>
                <ul className="mt-4 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-emerald-400" />
                    No sale of personal data to data brokers.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500 dark:bg-cyan-400" />
                    Vendors process data only under contract and for disclosed purposes.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-emerald-400" />
                    You can request access, correction, or deletion where applicable.
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Principles */}
        <section className="mb-20">
          <SectionHeading
            kicker="PRINCIPLES"
            title="How we think about privacy"
            description="Transparency, proportionality, and control—consistent with how we build reader trust across the site."
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {privacySections.map((section, index) => (
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

        {/* Data */}
        <section id="what-we-collect" className="mb-20 scroll-mt-24 rounded-2xl border border-zinc-200 bg-zinc-50/90 px-4 py-14 sm:px-8 lg:px-10 dark:border-zinc-800 dark:bg-zinc-900/25">
          <SectionHeading
            kicker="DATA INVENTORY"
            title="Types of data we collect"
            description="A practical breakdown of categories—not an exhaustive legal annex. Specific fields depend on what you choose to share and which features you use."
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {dataTypes.map((dataType, index) => (
              <div key={index} className={`${cardSurface} bg-white dark:bg-zinc-950`}>
                <div className={`${iconWrap} mb-6`}>
                  <dataType.icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-100 md:text-2xl">
                  {dataType.category}
                </h3>
                <ul className="mt-5 space-y-3">
                  {dataType.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500 dark:bg-cyan-400" />
                      <span className="leading-relaxed text-zinc-600 dark:text-zinc-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Rights */}
        <section id="your-rights" className="mb-20 scroll-mt-24">
          <SectionHeading
            kicker="YOUR CHOICES"
            title="Privacy rights & requests"
            description="Depending on where you live, you may have statutory rights. These actions describe what you can ask for in principle—fulfillment depends on verification and applicable law."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {userRights.map((right, index) => (
              <div
                key={index}
                className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className={`${iconWrap} mx-auto mb-5`}>
                  <right.icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100">{right.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {right.description}
                </p>
                <button
                  type="button"
                  className="mt-6 inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-800 shadow-sm transition-colors hover:bg-orange-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-cyan-300 dark:hover:bg-emerald-950/50"
                >
                  {right.action}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Cookies */}
        <section className="mb-20">
          <SectionHeading
            kicker="COOKIES & SIMILAR TECH"
            title="Cookie policy"
            description="We use cookies and similar technologies where needed to run the site, remember preferences, and understand aggregate usage."
          />

          <div className="space-y-4">
            {cookieTypes.map((cookie, index) => (
              <div key={index} className={cardSurface}>
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className={iconWrap}>
                      <Cookie className="h-6 w-6" aria-hidden />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100 md:text-xl">
                        {cookie.type}
                      </h3>
                      <p className="mt-1 text-zinc-600 dark:text-zinc-300">{cookie.purpose}</p>
                    </div>
                  </div>
                  {cookie.required ? (
                    <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-blue-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white dark:bg-emerald-600">
                      Required
                    </span>
                  ) : (
                    <span className="inline-flex w-fit shrink-0 items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                      Optional
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {cookie.examples.map((example, exampleIndex) => (
                    <span
                      key={exampleIndex}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance */}
        <section className="mb-20 rounded-2xl border border-zinc-200 bg-zinc-50/90 px-4 py-14 sm:px-8 lg:px-10 dark:border-zinc-800 dark:bg-zinc-900/25">
          <SectionHeading
            kicker="GOVERNANCE"
            title="Compliance & standards"
            description="We describe our privacy practices honestly. This section is not a guarantee of certification or audit outcome; it summarizes how we aim to align with common laws and expectations."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {complianceStandards.map((standard, index) => (
              <div
                key={index}
                className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className={`${iconWrap} mx-auto mb-5`}>
                  <standard.icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100">{standard.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{standard.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Retention */}
        <section className="mb-20">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 md:p-12 dark:border-zinc-800 dark:bg-zinc-900/35">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <div className={`${iconWrap} mx-auto mb-6`}>
                <Database className="h-7 w-7" aria-hidden />
              </div>
              <p className="text-xs font-semibold tracking-widest text-orange-800/80 dark:text-cyan-400/90">RETENTION</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-zinc-900 md:text-4xl dark:text-zinc-100">
                Data retention
              </h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-300">
                We keep data only as long as needed for legitimate business purposes, legal obligations, and security.
              </p>
            </div>

            <div className="mx-auto max-w-5xl space-y-6 text-zinc-700 dark:text-zinc-200">
              <p className="text-center text-lg leading-relaxed md:text-left">
                <strong className="text-zinc-900 dark:text-zinc-100">Retention varies by category.</strong> Periods below
                are illustrative targets and may be extended when law or security requires.
              </p>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100">Account data</h3>
                  <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <li>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">Active:</span> while active
                    </li>
                    <li>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">Inactive:</span> up to 3 years
                    </li>
                    <li>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">Deleted:</span> up to 30 days
                    </li>
                    <li>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">Legal holds:</span> as required
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100">Usage data</h3>
                  <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <li>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">Analytics:</span> up to 26 months
                    </li>
                    <li>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">Logs:</span> up to 12 months
                    </li>
                    <li>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">Errors:</span> up to 6 months
                    </li>
                    <li>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">Performance:</span> up to 3 months
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100">Communication</h3>
                  <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <li>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">Support:</span> up to 3 years
                    </li>
                    <li>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">Email:</span> up to 2 years
                    </li>
                    <li>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">Marketing:</span> until opt-out
                    </li>
                    <li>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">Legal notices:</span> up to 7 years
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm md:p-12 dark:border-zinc-800 dark:bg-zinc-950">
          <div className={`${iconWrap} mx-auto mb-6`}>
            <Info className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="font-display text-3xl font-bold text-zinc-900 dark:text-zinc-100">Questions about privacy?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-zinc-600 dark:text-zinc-300">
            Reach the team responsible for privacy inquiries. We respond as promptly as we can, subject to verification.
          </p>
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
              <Mail className="mx-auto mb-3 h-6 w-6 text-blue-600 dark:text-emerald-400" aria-hidden />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Email</h3>
              <p className="mt-1 font-medium text-zinc-800 dark:text-zinc-200">privacy@factsdeck.com</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
              <Phone className="mx-auto mb-3 h-6 w-6 text-orange-600 dark:text-cyan-400" aria-hidden />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Phone</h3>
              <p className="mt-1 font-medium text-zinc-800 dark:text-zinc-200">+1 (555) 123-PRIV</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
              <Building className="mx-auto mb-3 h-6 w-6 text-blue-600 dark:text-emerald-400" aria-hidden />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Office</h3>
              <p className="mt-1 font-medium text-zinc-800 dark:text-zinc-200">Privacy Office, NY</p>
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
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Version:</span> 3.0
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
