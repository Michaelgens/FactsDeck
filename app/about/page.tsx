import type { Metadata } from "next";
import type { ElementType } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Globe,
  Heart,
  Star,
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
} from "lucide-react";
import { SITE_URL, absoluteUrl } from "../lib/seo";

const canonical = absoluteUrl("/about");

export const metadata: Metadata = {
  title: { absolute: "FactsDeck | About Us" },
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
    title: "FactsDeck | About Us",
    description:
      "Who we are, how we edit and fact-check, and how we stay independent—Facts Deck’s About page.",
    url: canonical,
    siteName: "Facts Deck",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FactsDeck | About Us",
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
    bio: "Financial analyst with 10+ years in finance. Passionate about democratizing financial education.",
    expertise: ["Investment Strategy", "Market Analysis", "Financial Planning"],
    social: { linkedin: "#", twitter: "#" },
  },
  {
    name: "Emma Rodriguez",
    role: "Head of Content",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300",
    bio: "Award-winning financial journalist and CFA charterholder. Making complex finance simple for everyone.",
    expertise: ["Financial Writing", "Research", "Education"],
    social: { linkedin: "#", twitter: "#" },
  },
  {
    name: "David Kim",
    role: "Head of Research",
    image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300",
    bio: "PhD in Economics from MIT. Specializes in market research and cryptocurrency analysis.",
    expertise: ["Economic Research", "Cryptocurrency", "Market Trends"],
    social: { linkedin: "#", twitter: "#" },
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
    color: "from-red-500 to-pink-500",
  },
  {
    icon: Shield,
    title: "Trust & Transparency",
    description:
      "Providing unbiased, accurate information with complete transparency about our sources and methodologies.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "Continuously innovating to create better tools and content that serve our community's evolving needs.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Users,
    title: "Community Focus",
    description:
      "Building a supportive community where everyone can learn, share, and grow their financial knowledge together.",
    color: "from-purple-500 to-indigo-500",
  },
];

const achievements = [
  { number: "2.5M+", label: "Monthly Readers", icon: Users },
  { number: "5,000+", label: "Articles Published", icon: BookOpen },
  { number: "5+", label: "Financial Tools", icon: Calculator },
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
      name: "FactsDeck | About Us",
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
    <section id={section.id} aria-labelledby={`heading-${section.id}`}>
      <div className="flex items-start gap-4 mb-6">
        <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Icon className="h-6 w-6 text-white" aria-hidden />
        </div>
        <h2
          id={`heading-${section.id}`}
          className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-purple-200 pt-1"
        >
          {section.title}
        </h2>
      </div>
      <div>
        {section.paragraphs.map((p, i) => (
          <p
            key={i}
            className="text-gray-600 dark:text-purple-200/95 leading-relaxed text-lg mb-4 last:mb-0"
          >
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-dark-950 dark:to-dark-900">
        <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-accent-800 dark:from-dark-900 dark:via-purple-900 dark:to-accent-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent dark:from-black/50" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-72 h-72 bg-purple-400/20 dark:bg-purple-400/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 dark:bg-accent-400/30 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center glass-effect text-white px-6 py-3 rounded-2xl font-bold hover:bg-white/20 transition-all duration-300 backdrop-blur-lg border border-white/30 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back
              </Link>
            </div>

            <header className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-2 mb-6">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-purple-100 dark:text-purple-200 text-sm font-medium">
                  Trusted financial education
                </span>
              </div>

              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance">
                About <span className="gradient-text">Facts Deck</span>
              </h1>

              <p className="text-xl text-purple-100 dark:text-purple-100 leading-relaxed max-w-3xl mx-auto mb-8">
                We help people understand money with clear articles, tools, and editorial standards built
                on accuracy, sourcing, and independence—so you can learn with confidence.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  href="/contact"
                  className="group bg-white text-purple-600 px-8 py-4 rounded-2xl font-bold hover:bg-purple-50 transition-all duration-300 flex items-center justify-center shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105"
                >
                  <Mail className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                  Contact Us
                </Link>
                <Link
                  href="#our-mission"
                  className="group glass-effect text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all duration-300 backdrop-blur-lg border border-white/30 flex items-center justify-center hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Our mission
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto pb-4">
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold">2025</div>
                  <div className="text-sm text-purple-200 dark:text-purple-200">Founded</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold">2.5M+</div>
                  <div className="text-sm text-purple-200 dark:text-purple-200">Readers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold">150+</div>
                  <div className="text-sm text-purple-200 dark:text-purple-200">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold">4.9★</div>
                  <div className="text-sm text-purple-200 dark:text-purple-200">Rating</div>
                </div>
              </div>
            </header>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col-reverse lg:flex-row gap-10 lg:gap-12 items-start">
            <aside className="w-full lg:w-60 xl:w-64 shrink-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:order-none">
              <nav
                className="rounded-xl border border-gray-200 dark:border-purple-500/30 bg-purple-50/70 dark:bg-dark-800/80 p-4 shadow-sm"
                aria-label="On this page"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-purple-400 mb-3">
                  On this page
                </p>
                <ul className="space-y-0.5 text-sm border-t border-gray-200/80 dark:border-purple-500/20 pt-3">
                  {sidebarNav.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="block rounded-lg px-2 py-2 text-gray-700 dark:text-purple-200/95 hover:bg-purple-100/80 dark:hover:bg-purple-900/40 hover:text-purple-800 dark:hover:text-white transition-colors leading-snug"
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

              <section id="our-mission" aria-labelledby="heading-our-mission">
                <h2
                  id="heading-our-mission"
                  className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-purple-200 mb-6 text-center"
                >
                  Our Mission
                </h2>
                <p className="text-xl text-gray-600 dark:text-purple-200 leading-relaxed max-w-4xl mx-auto text-center mb-12">
                  To make financial literacy accessible to everyone by providing clear, actionable, and unbiased
                  financial education. We believe that everyone deserves the knowledge and tools to build a secure
                  financial future.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {missionFeatures.map((feature, index) => (
                    <div key={index} className="text-center group">
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-display font-bold text-xl text-gray-900 dark:text-purple-200 mb-4 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-purple-200 leading-relaxed group-hover:scale-[1.02] transition-transform duration-300">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section id="our-values" aria-labelledby="heading-our-values">
                <div className="text-center mb-12">
                  <h2
                    id="heading-our-values"
                    className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-purple-200 mb-6"
                  >
                    Our Values
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-purple-200 leading-relaxed max-w-3xl mx-auto">
                    These core values guide everything we do and shape how we serve our community.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {values.map((value, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gradient-to-br dark:from-dark-800 dark:to-purple-900/50 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-purple-500/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
                    >
                      <div
                        className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                      >
                        <value.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-display font-bold text-2xl text-gray-900 dark:text-purple-200 mb-4 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                        {value.title}
                      </h3>
                      <p className="text-gray-600 dark:text-purple-200 leading-relaxed text-lg">
                        {value.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section id="our-impact" aria-labelledby="heading-our-impact">
                <div className="text-center mb-12">
                  <h2
                    id="heading-our-impact"
                    className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-purple-200 mb-6"
                  >
                    Our Impact
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-purple-200 leading-relaxed max-w-3xl mx-auto">
                    Numbers that reflect our commitment to serving the global financial education community.
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="text-center group bg-white dark:bg-gradient-to-br dark:from-dark-800 dark:to-purple-900/50 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-purple-500/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <achievement.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-purple-200 mb-2 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                        {achievement.number}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-purple-200">{achievement.label}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section id="our-journey" aria-labelledby="heading-our-journey">
                <div className="text-center mb-12">
                  <h2
                    id="heading-our-journey"
                    className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-purple-200 mb-6"
                  >
                    Our Journey
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-purple-200 leading-relaxed max-w-3xl mx-auto">
                    From a simple idea to a global platform serving millions of users worldwide.
                  </p>
                </div>
                <div className="relative max-w-3xl mx-auto">
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-500 to-accent-500 rounded-full hidden sm:block" />
                  <div className="space-y-12">
                    {timeline.map((item, index) => (
                      <div
                        key={index}
                        className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 ${
                          index % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                        }`}
                      >
                        <div
                          className={`w-full sm:w-[calc(50%-2rem)] ${
                            index % 2 === 0 ? "sm:pr-8 sm:text-right" : "sm:pl-8 sm:text-left"
                          }`}
                        >
                          <div className="bg-white dark:bg-gradient-to-br dark:from-dark-800 dark:to-purple-900/50 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-purple-500/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="text-purple-600 dark:text-purple-400 font-bold text-lg mb-2">
                              {item.year}
                            </div>
                            <h3 className="font-display font-bold text-xl text-gray-900 dark:text-purple-200 mb-3">
                              {item.title}
                            </h3>
                            <p className="text-gray-600 dark:text-purple-200 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <div className="relative z-10 w-14 h-14 shrink-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <item.icon className="h-7 w-7 text-white" />
                        </div>
                        <div className="hidden sm:block sm:w-[calc(50%-2rem)]" />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <div className="space-y-16">
                {editorialPolicySections.map((section) => (
                  <PolicyBlock key={section.id} section={section} />
                ))}
              </div>

              <section
                className="mt-8"
                id="meet-our-senior-management-team"
                aria-labelledby="heading-senior-team"
              >
                <div className="text-center mb-16">
                  <h2
                    id="heading-senior-team"
                    className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-purple-200 mb-6"
                  >
                    Meet Our Senior Management Team
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-purple-200 leading-relaxed max-w-3xl mx-auto">
                    Leaders across editorial, technology, and research guiding Facts Deck&apos;s mission to make
                    financial education accessible and trustworthy.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                  {teamMembers.map((member, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gradient-to-br dark:from-dark-800 dark:to-purple-900/50 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-purple-500/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center group"
                    >
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-full object-cover mx-auto mb-6 border-4 border-white dark:border-purple-500/50 shadow-lg"
                      />
                      <h3 className="font-display font-bold text-xl text-gray-900 dark:text-purple-200 mb-2">
                        {member.name}
                      </h3>
                      <p className="text-purple-600 dark:text-purple-400 font-semibold mb-4 group-hover:text-gray-600 dark:group-hover:text-emerald-400 transition-colors">
                        {member.role}
                      </p>
                      <p className="text-gray-600 dark:text-purple-200 text-sm leading-relaxed mb-4">
                        {member.bio}
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center mb-4">
                        {member.expertise.map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="bg-purple-100 text-purple-600 dark:bg-yellow-900/30 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-center space-x-3">
                        <a
                          href={member.social.linkedin}
                          className="text-gray-600 dark:text-white hover:text-purple-500 dark:hover:text-emerald-400 transition-colors"
                          aria-label={`${member.name} on LinkedIn`}
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                        <a
                          href={member.social.twitter}
                          className="text-gray-600 dark:text-white hover:text-purple-500 dark:hover:text-emerald-400 transition-colors"
                          aria-label={`${member.name} on X`}
                        >
                          <Twitter className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section
                id="get-in-touch"
                className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-dark-800 dark:to-purple-900/50 rounded-3xl p-8 md:p-12"
                aria-labelledby="heading-contact"
              >
                <div className="text-center mb-12">
                  <h2
                    id="heading-contact"
                    className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-purple-200 mb-6"
                  >
                    Get In Touch
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-purple-200 leading-relaxed max-w-3xl mx-auto">
                    Have questions, suggestions, or want to partner with us? We&apos;d love to hear from you.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Mail className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-gray-900 dark:text-purple-200 mb-3">
                      Email Us
                    </h3>
                    <p className="text-gray-600 dark:text-purple-200 mb-2">General inquiries</p>
                    <p className="text-purple-600 dark:text-purple-400 font-semibold">hello@factsdeck.com</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Phone className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-gray-900 dark:text-purple-200 mb-3">
                      Call Us
                    </h3>
                    <p className="text-gray-600 dark:text-purple-200 mb-2">Business hours: 9AM - 6PM EST</p>
                    <p className="text-purple-600 dark:text-purple-400 font-semibold">+44 *** *** ****</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <MapPin className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-gray-900 dark:text-purple-200 mb-3">
                      Visit Us
                    </h3>
                    <p className="text-gray-600 dark:text-purple-200 mb-2">Belfast, NI, UK</p>
                    <p className="text-purple-600 dark:text-purple-400 font-semibold">********</p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex justify-center space-x-6 mb-8">
                    <a
                      href="#"
                      className="text-gray-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-emerald-400 transition-colors transform hover:scale-110"
                      aria-label="Facebook"
                    >
                      <Facebook className="h-8 w-8" />
                    </a>
                    <a
                      href="#"
                      className="text-gray-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-emerald-400 transition-colors transform hover:scale-110"
                      aria-label="X"
                    >
                      <Twitter className="h-8 w-8" />
                    </a>
                    <a
                      href="#"
                      className="text-gray-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-emerald-400 transition-colors transform hover:scale-110"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="h-8 w-8" />
                    </a>
                    <a
                      href="#"
                      className="text-gray-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-emerald-400 transition-colors transform hover:scale-110"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-8 w-8" />
                    </a>
                  </div>

                  <Link
                    href="/contact"
                    className="inline-flex items-center bg-gradient-to-r from-purple-600 to-accent-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-purple-700 hover:to-accent-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Start Your Journey
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
