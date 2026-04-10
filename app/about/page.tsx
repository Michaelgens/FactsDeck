import type { Metadata } from "next";
import type { ElementType } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Globe,
  Heart,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Zap,
  FileCheck,
  BookOpen,
  RefreshCw,
  Link2,
  Package,
  Scale,
  AlertTriangle,
  Sparkles,
  HeartHandshake,
  Users,
  Shield,
  Lightbulb,
  TrendingUp,
  Calculator,
  Trophy,
  Rocket,
  Brain,
  Target,
  CheckCircle,
  Info,
} from "lucide-react";
import { SITE_URL, absoluteUrl } from "../lib/seo";
import { proxiedImageSrc } from "../lib/image-proxy";

const canonical = absoluteUrl("/about");
const LAST_UPDATED = "March 9, 2026";

export const metadata: Metadata = {
  title: { absolute: "About Us | Facts Deck" },
  description:
    "Learn who Facts Deck is and how we work: editorial standards, fact-checking, corrections, sourcing, independence, and our commitment to impartial financial education.",
  keywords: [
    "Facts Deck",
    "about Facts Deck",
    "editorial guidelines",
    "fact checking",
    "corrections policy",
    "financial education",
    "independent journalism",
  ],
  alternates: { canonical },
  openGraph: {
    title: "About Us | Facts Deck",
    description:
      "Who we are, how we edit and fact-check, and how we stay independent—Facts Deck’s About page.",
    url: canonical,
    siteName: "Facts Deck",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Facts Deck",
    description:
      "Editorial standards, fact-checking, corrections, sourcing, and independence at Facts Deck.",
  },
  robots: { index: true, follow: true },
};

const teamMembers = [
  {
    name: "Michael Genesis II",
    role: "CEO & Founder",
    image: "/first.jpeg",
  },
  {
    name: "Emma Rodriguez",
    role: "Head of Content",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300",
  },
  {
    name: "David Kim",
    role: "Head of Research",
    image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300",
  },
];

const policySections: {
  id: string;
  title: string;
  icon: ElementType;
  paragraphs: string[];
}[] = [
  {
    id: "who-we-are",
    title: "Who We Are",
    icon: Globe,
    paragraphs: [
      "Facts Deck is a personal finance education platform. We publish articles, explainers, and tools that help readers understand money—investing, credit, housing, taxes, and everyday budgeting—without jargon where we can help it.",
      "Our mission is to make trustworthy financial knowledge easier to find and use. We combine rigorous editing with practical calculators and clear takeaways so readers can ask better questions and make more informed decisions for themselves.",
      "We are independent of any single bank, broker, or lender. Commercial relationships, when they exist, are disclosed and do not determine what we publish.",
    ],
  },
  {
    id: "editorial-guidelines",
    title: "Editorial Guidelines",
    icon: BookOpen,
    paragraphs: [
      "We aim for content that is accurate, original, and useful. Every piece should have a clear reader benefit: a definition, a framework, a comparison, or a step-by-step overview—not empty hype or vague promises.",
      "Writers and editors follow a defined review path: substantive edit for clarity and structure, compliance with our sourcing standards, and update or refresh when rates, rules, or products change in ways that affect the advice in the article.",
      "If you believe an article is outdated, unclear, or missing context, please contact us through our contact page. We take reader feedback seriously.",
    ],
  },
  {
    id: "fact-checking",
    title: "Fact Checking",
    icon: FileCheck,
    paragraphs: [
      "Claims about rates, laws, fees, and product terms are checked against primary or authoritative sources—issuer documentation, government portals, regulator materials, or peer-reviewed research where applicable.",
      "Editors review articles for internal consistency and for alignment with cited sources. Complex or fast-moving topics may receive an additional review from a subject-matter reviewer or fact-checking workflow before publication.",
      "We distinguish between news reporting, educational explanation, and opinion. When we cite statistics or studies, we prefer transparent methodology and recent data, and we say so when figures are estimates or illustrative.",
    ],
  },
  {
    id: "corrections-policy",
    title: "Corrections Policy",
    icon: RefreshCw,
    paragraphs: [
      "When we identify a factual error—whether reported by a reader or found in review—we correct it promptly and note the correction on the page when the change is material to the reader’s understanding.",
      "Corrections are labeled clearly (for example, as an editor’s note or correction line) so the fix is transparent. Minor typos or formatting issues may be fixed without a notice when they do not change meaning.",
      "To report a possible error, use the contact options on our site and include the article URL and a short description of what you believe is wrong. We aim to acknowledge legitimate reports in a timely manner.",
    ],
  },
  {
    id: "sourcing",
    title: "Sourcing",
    icon: Link2,
    paragraphs: [
      "We rely on primary sources whenever possible: government datasets, regulatory filings, issuer disclosures, academic papers, and original interviews. Secondary reporting is used to add context, not as a substitute for verifying the underlying fact.",
      "Data points and notable claims should be traceable to a credible source. We name institutions, dates, and document types where that helps readers evaluate reliability.",
      "We seek diverse and authoritative voices—across gender, background, and geography—when selecting experts and examples, so our sourcing reflects the breadth of people who use personal finance information.",
    ],
  },
  {
    id: "product-recommendations",
    title: "Product Recommendations",
    icon: Package,
    paragraphs: [
      "When we review or compare financial products, we explain how we evaluated them (fees, features, eligibility, customer experience, and how they fit typical use cases). Rankings and “best of” lists describe our criteria so readers can judge fit for themselves.",
      "Facts Deck may participate in affiliate or partner programs on some pages. When we do, we disclose those relationships near the relevant recommendations. Compensation does not buy placement in our editorial judgments: our writers and editors assign scores and picks based on the same criteria we publish.",
      "Readers should always read issuer terms before applying or signing—our summaries are educational, not a substitute for the official agreement.",
    ],
  },
  {
    id: "independence-impartiality",
    title: "Independence & Impartiality",
    icon: Scale,
    paragraphs: [
      "Commercial teams do not dictate editorial coverage. Sponsored or branded content, when we run it, is labeled distinctly from editorial articles so readers can tell what is paid promotion.",
      "Our editorial staff make decisions about topics, tone, and conclusions. If a conflict of interest arises for a writer or editor—financial or personal—we recuse, disclose, or reassign work to protect reader trust.",
      "We do not accept payment in exchange for positive reviews or undisclosed endorsements. Gifts or travel that could create appearance issues are declined or disclosed according to our internal policy.",
    ],
  },
  {
    id: "no-investment-advice",
    title: "No Individual Investment Advice",
    icon: AlertTriangle,
    paragraphs: [
      "Nothing on Facts Deck is personalized investment, tax, or legal advice. Articles and tools are for general education and illustration; they do not know your full financial picture, risk tolerance, or jurisdiction.",
      "Before you invest, borrow, or make a major financial decision, consult a qualified professional who can review your specific situation. Past performance and hypothetical projections are not guarantees of future results.",
      "Regulatory rules and product terms change. Always verify current conditions with official sources or a licensed advisor.",
    ],
  },
  {
    id: "originality",
    title: "Originality",
    icon: Sparkles,
    paragraphs: [
      "We publish original writing, analysis, and data visualization produced by or for Facts Deck. When we summarize or quote others, we attribute clearly and respect copyright and fair-use norms.",
      "Plagiarism and unattributed reuse are not acceptable. AI-assisted drafting may be used as a tool under human editorial control; final accountability for accuracy and originality rests with our editors and named authors.",
      "We correct attribution gaps if they are identified after publication.",
    ],
  },
  {
    id: "diversity-inclusion",
    title: "Diversity & Inclusion",
    icon: HeartHandshake,
    paragraphs: [
      "We believe personal finance content should speak to a wide range of readers—different incomes, family structures, abilities, and life stages. That includes inclusive language, accessible explanations, and examples that do not assume a single cultural default.",
      "We work to include diverse experts and sources in our reporting and to cover topics that matter to underserved communities, including access to banking, credit, housing, and retirement.",
      "We welcome feedback on how we can represent our audience more fairly and will update content when thoughtful readers point out gaps or insensitive framing.",
    ],
  },
];

const whoWeAreSection = policySections[0];
const editorialPolicySections = policySections.slice(1);

const missionFeatures = [
  {
    icon: BookOpen,
    title: "Expert Content",
    description: "In-depth articles written by financial professionals and industry experts.",
  },
  {
    icon: Calculator,
    title: "Financial Tools",
    description: "Comprehensive calculators and planners for all your financial needs.",
  },
  {
    icon: TrendingUp,
    title: "Market Insights",
    description: "Real-time market data and analysis to keep you informed.",
  },
  {
    icon: Shield,
    title: "Unbiased Reviews",
    description: "Honest, transparent reviews of financial products and services.",
  },
];

const values = [
  {
    icon: Heart,
    title: "Accessibility First",
    description:
      "Making financial education accessible to everyone, regardless of their background or experience level.",
  },
  {
    icon: Shield,
    title: "Trust & Transparency",
    description:
      "Providing unbiased, accurate information with complete transparency about our sources and methodologies.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "Continuously innovating to create better tools and content that serve our community's evolving needs.",
  },
  {
    icon: Users,
    title: "Community Focus",
    description:
      "Building a supportive community where everyone can learn, share, and grow their financial knowledge together.",
  },
];

const achievements = [
  { number: "2.5M+", label: "Monthly Readers", icon: Users },
  { number: "5,000+", label: "Articles Published", icon: BookOpen },
  { number: "10+", label: "Financial Tools", icon: Calculator },
  { number: "99%", label: "User Satisfaction", icon: Trophy },
];

const timeline = [
  {
    year: "2020",
    title: "The Beginning",
    description:
      "Facts Deck was founded with a mission to democratize financial education and make it accessible to everyone.",
    icon: Rocket,
  },
  {
    year: "2021",
    title: "First Million Readers",
    description:
      "Reached our first million monthly readers, establishing ourselves as a trusted source for financial information.",
    icon: Users,
  },
  {
    year: "2022",
    title: "Tool Launch",
    description:
      "Launched our suite of financial calculators and planning tools, helping users make informed decisions.",
    icon: Calculator,
  },
  {
    year: "2023",
    title: "Global Expansion",
    description:
      "Expanded to serve readers in over 150 countries with localized content and multi-language support.",
    icon: Globe,
  },
  {
    year: "2024",
    title: "AI Integration",
    description:
      "Integrated AI-powered personalization to deliver customized financial insights and recommendations.",
    icon: Brain,
  },
  {
    year: "2025",
    title: "The Future",
    description:
      "Continuing to innovate with new features, partnerships, and educational initiatives to serve our growing community.",
    icon: Target,
  },
];

const sidebarNav: { href: string; label: string }[] = [
  { href: "#who-we-are", label: "Who We Are" },
  { href: "#our-mission", label: "Our Mission" },
  { href: "#our-values", label: "Our Values" },
  { href: "#our-impact", label: "Our Impact" },
  { href: "#our-journey", label: "Our Journey" },
  { href: "#editorial-guidelines", label: "Editorial Guidelines" },
  { href: "#fact-checking", label: "Fact Checking" },
  { href: "#corrections-policy", label: "Corrections Policy" },
  { href: "#sourcing", label: "Sourcing" },
  { href: "#product-recommendations", label: "Product Recommendations" },
  { href: "#independence-impartiality", label: "Independence & Impartiality" },
  { href: "#no-investment-advice", label: "No Individual Investment Advice" },
  { href: "#originality", label: "Originality" },
  { href: "#diversity-inclusion", label: "Diversity & Inclusion" },
  { href: "#meet-our-senior-management-team", label: "Meet Our Senior Management Team" },
  { href: "#get-in-touch", label: "Get In Touch" },
];

const cardSurface =
  "rounded-2xl border border-zinc-200 bg-white shadow-sm transition-colors hover:border-blue-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800/80";

const iconWrap =
  "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-200/90 bg-orange-50 text-blue-700 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-cyan-300";

function SectionHeading({
  kicker,
  title,
  description,
  align = "left",
  id,
}: {
  kicker: string;
  title: string;
  description: string;
  align?: "left" | "center";
  id?: string;
}) {
  return (
    <div className={`mb-12 max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <p className="text-xs font-semibold tracking-widest text-orange-800/80 dark:text-cyan-400/90">{kicker}</p>
      <div className="mt-3">
        <h2
          id={id}
          className="font-display text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl dark:text-zinc-100"
        >
          {title}
        </h2>
        <p
          className={`mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-300 ${
            align === "center" ? "mx-auto max-w-3xl" : ""
          }`}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: "Facts Deck",
      url: SITE_URL,
      description:
        "Personal finance education: articles, tools, and editorial standards focused on accuracy and independence.",
    },
    {
      "@type": "AboutPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: "About Us | Facts Deck",
      description:
        "About Facts Deck: who we are, editorial guidelines, fact-checking, corrections, sourcing, independence, and diversity commitments.",
      isPartOf: { "@id": `${SITE_URL}#website` },
      about: { "@id": `${SITE_URL}#organization` },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      url: SITE_URL,
      name: "Facts Deck",
      publisher: { "@id": `${SITE_URL}#organization` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "About Us",
          item: canonical,
        },
      ],
    },
  ],
};

function PolicyBlock({
  section,
}: {
  section: {
    id: string;
    title: string;
    icon: ElementType;
    paragraphs: string[];
  };
}) {
  const Icon = section.icon;
  return (
    <section id={section.id} className="scroll-mt-24" aria-labelledby={`heading-${section.id}`}>
      <div className="mb-6 flex items-start gap-4">
        <div className={iconWrap}>
          <Icon className="h-6 w-6" aria-hidden />
        </div>
        <h2
          id={`heading-${section.id}`}
          className="font-display pt-1 text-2xl font-bold text-zinc-900 md:text-3xl dark:text-zinc-100"
        >
          {section.title}
        </h2>
      </div>
      <div className="border-b border-zinc-200 pb-16 dark:border-zinc-800">
        {section.paragraphs.map((p, i) => (
          <p key={i} className="mb-4 text-lg leading-relaxed text-zinc-600 last:mb-0 dark:text-zinc-300">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }} />
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
                  <BookOpen className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-emerald-400" />
                  Editorial standards
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0 text-orange-600 dark:text-cyan-400" />
                  Updated {LAST_UPDATED}
                </span>
              </div>
            </div>

            <header className="mt-10 grid items-start gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="text-xs font-semibold tracking-widest text-orange-800/80 dark:text-cyan-400/90">ABOUT</p>
                <h1 className="mt-3 font-display text-4xl font-bold leading-[1.08] text-balance sm:text-5xl md:text-6xl">
                  <span className="bg-gradient-to-r from-sky-700 via-indigo-700 to-violet-700 bg-clip-text text-transparent dark:from-emerald-300 dark:via-cyan-300 dark:to-sky-300">About Facts Deck</span>
            </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-300">
                  Clear articles, tools, and published standards—built on accuracy, sourcing, and independence so you can
                  learn with confidence.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href="#get-in-touch"
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:shadow-white/5 dark:hover:bg-zinc-100"
                  >
                    Get in touch
                  </Link>
              <Link
                    href="#editorial-guidelines"
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
              >
                    Editorial guidelines
              </Link>
              <Link
                    href="/tools"
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
              >
                    Explore tools
              </Link>
            </div>

                <p className="mt-6 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Legal:{" "}
                  <Link href="/privacy" className="font-medium text-blue-800 underline-offset-4 hover:underline dark:text-cyan-300">
                    Privacy
                  </Link>
                  {" · "}
                  <Link
                    href="/disclaimer"
                    className="font-medium text-blue-800 underline-offset-4 hover:underline dark:text-cyan-300"
                  >
                    Disclaimer
                  </Link>
                </p>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-xs font-semibold tracking-widest text-orange-800/90 dark:text-cyan-400/90">
                    AT A GLANCE
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Founded</p>
                      <p className="mt-1 text-lg font-semibold text-blue-800 dark:text-emerald-300">2025</p>
              </div>
                    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Readers</p>
                      <p className="mt-1 text-lg font-semibold text-orange-600 dark:text-cyan-400">2.5M+</p>
              </div>
                    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Countries</p>
                      <p className="mt-1 text-lg font-semibold text-blue-800 dark:text-emerald-300">150+</p>
              </div>
                    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Rating</p>
                      <p className="mt-1 text-lg font-semibold text-orange-600 dark:text-cyan-400">4.9★</p>
          </div>
        </div>
                </div>
              </div>
            </header>
          </div>
        </section>

        <div className="mx-auto max-w-7xl bg-white px-4 py-16 dark:bg-zinc-950 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse items-start gap-10 lg:flex-row lg:gap-12">
            <aside className="hidden md:block w-full shrink-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:w-60 lg:overflow-y-auto xl:w-64">
              <nav
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                aria-label="On this page"
              >
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  On this page
                </p>
                <ul className="space-y-0.5 border-t border-zinc-200 pt-3 text-sm dark:border-zinc-800">
                  {sidebarNav.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="block rounded-lg px-2 py-2 leading-snug text-zinc-700 transition-colors hover:bg-orange-50 hover:text-blue-800 dark:text-zinc-200 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-300"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <div className="min-w-0 flex-1 space-y-20 max-w-4xl">
              <PolicyBlock section={whoWeAreSection} />

              <section id="our-mission" className="scroll-mt-24" aria-labelledby="heading-our-mission">
                <SectionHeading
                  id="heading-our-mission"
                  kicker="MISSION"
                  title="Our mission"
                  align="center"
                  description="To make financial literacy accessible with clear, actionable, unbiased education—so everyone has the knowledge and tools to build a more secure future."
                />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {missionFeatures.map((feature, index) => (
                    <div key={index} className={`${cardSurface} p-6 text-center`}>
                      <div className={`${iconWrap} mx-auto mb-4`}>
                        <feature.icon className="h-6 w-6" aria-hidden />
                      </div>
                      <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

              <section id="our-values" className="scroll-mt-24" aria-labelledby="heading-our-values">
                <SectionHeading
                  id="heading-our-values"
                  kicker="VALUES"
                  title="What we stand for"
                  align="center"
                  description="Principles that guide how we serve readers and build the site."
                />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {values.map((value, index) => (
                    <div key={index} className={`${cardSurface} p-8`}>
                      <div className={`${iconWrap} mb-5`}>
                        <value.icon className="h-6 w-6" aria-hidden />
                      </div>
                      <h3 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-100">{value.title}</h3>
                      <p className="mt-3 text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">{value.description}</p>
          </div>
                  ))}
                </div>
              </section>

              <section id="our-impact" className="scroll-mt-24" aria-labelledby="heading-our-impact">
                <SectionHeading
                  id="heading-our-impact"
                  kicker="IMPACT"
                  title="By the numbers"
                  align="center"
                  description="A snapshot of scale and engagement—illustrative of our commitment to the community."
                />
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className={`${cardSurface} p-6 text-center`}>
                      <div className={`${iconWrap} mx-auto mb-4`}>
                        <achievement.icon className="h-6 w-6" aria-hidden />
                </div>
                      <div className="text-2xl font-bold text-blue-800 dark:text-emerald-300">{achievement.number}</div>
                      <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{achievement.label}</div>
              </div>
            ))}
          </div>
        </section>

              <section id="our-journey" className="scroll-mt-24" aria-labelledby="heading-our-journey">
                <SectionHeading
                  id="heading-our-journey"
                  kicker="JOURNEY"
                  title="Our journey"
                  align="center"
                  description="Milestones from launch to today—how we’ve grown the platform and the product."
                />
                <div className="mx-auto max-w-3xl space-y-4">
              {timeline.map((item, index) => (
                <div
                      key={item.year}
                      className={`${cardSurface} p-6`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                        <div className={iconWrap}>
                          <item.icon className="h-6 w-6 shrink-0" aria-hidden />
                        </div>
                        <div>
                          <p className="text-xs font-semibold tracking-widest text-orange-800/90 dark:text-cyan-400/90">
                        {item.year}
                          </p>
                          <h3 className="font-display mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                            {item.title}
                          </h3>
                          <p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-300">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
          </div>
        </section>

              <div className="space-y-16">
                {editorialPolicySections.map((section) => (
                  <PolicyBlock key={section.id} section={section} />
                ))}
          </div>

              <section
                id="meet-our-senior-management-team"
                className="scroll-mt-24"
                aria-labelledby="heading-senior-team"
              >
                <SectionHeading
                  id="heading-senior-team"
                  kicker="TEAM"
                  title="Senior leadership"
                  align="center"
                  description="Editorial, technology, and research leaders guiding Facts Deck’s mission—accessible, trustworthy financial education."
                />
                <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-3">
                  {teamMembers.map((member, index) => (
                    <div key={index} className={`${cardSurface} p-6 text-center`}>
                <Image
                        src={proxiedImageSrc(member.image)}
                  alt={member.name}
                  width={96}
                  height={96}
                        className="mx-auto mb-6 h-24 w-24 rounded-full border-4 border-white object-cover shadow-sm dark:border-zinc-800"
                      />
                      <h3 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-100">{member.name}</h3>
                      <p className="mb-4 font-semibold text-zinc-700 transition-colors dark:text-zinc-300">{member.role}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section
                id="get-in-touch"
                className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-zinc-50 p-8 md:p-12 dark:border-zinc-800 dark:bg-zinc-900"
                aria-labelledby="heading-contact"
              >
                <div className={`${iconWrap} mx-auto mb-6`}>
                  <Info className="h-7 w-7" aria-hidden />
                </div>
                <h2
                  id="heading-contact"
                  className="text-center font-display text-3xl font-bold text-zinc-900 md:text-4xl dark:text-zinc-100"
                >
                  Get in touch
            </h2>
                <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-zinc-600 dark:text-zinc-300">
                  Questions, ideas, or partnerships—we read what you send and route it to the right team.
                </p>

                <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-zinc-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-950">
                    <Mail className="mx-auto mb-3 h-6 w-6 text-blue-600 dark:text-emerald-400" aria-hidden />
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Email</h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">General inquiries</p>
                    <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">hello@factsdeck.com</p>
              </div>
                  <div className="rounded-xl border border-zinc-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-950">
                    <Phone className="mx-auto mb-3 h-6 w-6 text-orange-600 dark:text-cyan-400" aria-hidden />
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Phone</h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">9AM – 6PM EST</p>
                    <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">+44 *** *** ****</p>
            </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900 col-span-2 mx-auto md:col-span-1 md:mx-0 text-center">
                    <MapPin className="mx-auto mb-3 h-6 w-6 text-blue-600 dark:text-emerald-400" aria-hidden />
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Office</h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">By appointment</p>
                    <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">Belfast, NI, UK</p>
            </div>
          </div>

                <div className="mt-10 flex justify-center space-x-3">
              <a
                href="#"
                    className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-orange-50 hover:text-blue-700 dark:text-zinc-400 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-300"
                    aria-label="Facebook"
              >
                    <Facebook className="h-7 w-7" />
              </a>
              <a
                href="#"
                    className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-orange-50 hover:text-blue-700 dark:text-zinc-400 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-300"
                    aria-label="X"
              >
                    <Twitter className="h-7 w-7" />
              </a>
              <a
                href="#"
                    className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-orange-50 hover:text-blue-700 dark:text-zinc-400 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-300"
                    aria-label="LinkedIn"
              >
                    <Linkedin className="h-7 w-7" />
              </a>
              <a
                href="#"
                    className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-orange-50 hover:text-blue-700 dark:text-zinc-400 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-300"
                    aria-label="Instagram"
              >
                    <Instagram className="h-7 w-7" />
              </a>
            </div>

                <div className="mt-10 text-center">
            <Link
              href="/contact"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:shadow-white/5 dark:hover:bg-zinc-100"
            >
                    <Zap className="h-5 w-5" aria-hidden />
                    Open contact page
            </Link>
          </div>
        </section>
      </div>
    </div>
        </div>
      </div>
    </>
  );
}
