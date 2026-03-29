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
  ExternalLink,
  Calendar,
  Building,
  Phone,
} from "lucide-react";
import { absoluteUrl } from "../lib/seo";

const canonical = absoluteUrl("/disclaimer");

export const metadata: Metadata = {
  title: { absolute: "FactsDeck | Disclaimer" },
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
    title: "FactsDeck | Disclaimer",
    description:
      "Read Facts Deck’s disclaimer: general education only, risks, third-party links, and affiliate transparency.",
    url: canonical,
    siteName: "Facts Deck",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FactsDeck | Disclaimer",
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
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Scale,
    title: "No Professional Relationship",
    content:
      "Reading our content or using our tools does not create a professional relationship between you and Facts Deck or any of our contributors. We are not acting as your financial advisor, investment advisor, or fiduciary. Any decisions you make based on our content are your sole responsibility.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: AlertTriangle,
    title: "Investment Risk Warning",
    content:
      "All investments carry risk, including the potential loss of principal. Past performance does not guarantee future results. The value of investments can go down as well as up, and you may not get back the amount you originally invested. Before making any investment decisions, you should carefully consider your financial situation, investment objectives, and risk tolerance.",
    color: "from-red-500 to-red-600",
  },
  {
    icon: Eye,
    title: "Accuracy and Timeliness",
    content:
      "While we strive to provide accurate and up-to-date information, we cannot guarantee the completeness, accuracy, or timeliness of all content. Financial markets and regulations change rapidly, and information that was accurate when published may become outdated. Always verify information with current sources.",
    color: "from-emerald-500 to-emerald-600",
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

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-950">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-amber-800 dark:from-dark-900 dark:via-dark-850 dark:to-dark-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-400/20 dark:bg-purple-400/30 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 dark:bg-amber-400/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link
            href="/"
            className="inline-flex items-center glass-effect text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all duration-300 mb-8"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Link>

          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Shield className="h-6 w-6 text-amber-400" />
              <span className="text-purple-100 dark:text-purple-200 text-sm font-medium">Legal Protection • Transparency • Compliance</span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance">
              Legal <span className="gradient-text">Disclaimer</span>
            </h1>

            <p className="text-xl text-purple-100 dark:text-purple-200 leading-relaxed max-w-3xl mx-auto mb-8">
              Important legal information about the use of Facts Deck&apos;s content, tools, and services. Please read carefully before using our platform.
            </p>

            <div className="bg-amber-500/20 dark:bg-amber-500/20 border border-amber-400/30 dark:border-amber-400/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-amber-400" />
                <span className="font-bold text-lg">Important Notice</span>
              </div>
              <p className="text-amber-100 dark:text-amber-100">This disclaimer was last updated on March 9, 2026. By using Facts Deck, you agree to these terms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Key Disclaimers */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-purple-200 mb-6">Key Disclaimers</h2>
            <p className="text-xl text-slate-600 dark:text-purple-200 leading-relaxed max-w-3xl mx-auto">
              Essential information about the nature and limitations of our content and services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {disclaimerSections.map((section, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-dark-900/50 dark:border-purple-500/30 rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${section.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  <section.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-purple-200 mb-4 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                  {section.title}
                </h3>
                <p className="text-slate-600 dark:text-purple-200 leading-relaxed text-lg">{section.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Legal Terms */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-purple-200 mb-6">Legal Terms and Conditions</h2>
            <p className="text-xl text-slate-600 dark:text-purple-200 leading-relaxed max-w-3xl mx-auto">
              Detailed legal terms governing your use of Facts Deck&apos;s platform and services.
            </p>
          </div>

          <div className="space-y-8">
            {legalSections.map((section, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-dark-900/50 dark:border-purple-500/30 rounded-2xl p-8 shadow-lg border border-slate-200 transition-all duration-300 hover:-translate-y-1"
              >
                <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-purple-200 mb-6 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                  {section.title}
                </h3>
                <p className="text-slate-600 dark:text-purple-200 leading-relaxed text-lg">{section.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance & Standards */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-purple-200 mb-6">
              Compliance &amp; standards
            </h2>
            <p className="text-xl text-slate-600 dark:text-purple-200 leading-relaxed max-w-3xl mx-auto">
              How this disclaimer fits with our About page policies and your Privacy Policy rights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {complianceInfo.map((item, index) => (
              <div
                key={index}
                className="group text-center bg-white dark:bg-dark-900/50 dark:border-purple-500/30 rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-purple-200 mb-4 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-purple-200 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Investment Risk Disclosure */}
        <section className="mb-20">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-3xl p-8 md:p-12 border border-red-200 dark:border-red-500/30">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-10 w-10 text-white" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-red-700 dark:text-red-400 mb-6">Investment Risk Disclosure</h2>
            </div>

            <div className="max-w-4xl mx-auto space-y-6 text-red-700 dark:text-red-300">
              <p className="text-lg leading-relaxed">
                <strong>All investments involve risk.</strong> The value of investments can fluctuate, and past performance is not indicative of future results. You may lose some or all of your invested capital.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/50 dark:bg-red-900/20 p-6 rounded-2xl">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-red-200 mb-4">Market Risks</h3>
                  <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
                    <li>• Market volatility and price fluctuations</li>
                    <li>• Economic and political factors</li>
                    <li>• Interest rate changes</li>
                    <li>• Currency exchange rate risks</li>
                  </ul>
                </div>

                <div className="bg-white/50 dark:bg-red-900/20 p-6 rounded-2xl">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-red-200 mb-4">Investment Risks</h3>
                  <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
                    <li>• Company-specific risks</li>
                    <li>• Sector and industry risks</li>
                    <li>• Liquidity risks</li>
                    <li>• Inflation and purchasing power risks</li>
                  </ul>
                </div>
              </div>

              <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-2xl border border-red-300 dark:border-red-500/50">
                <p className="font-bold text-lg text-red-800 dark:text-red-200 mb-2">Important Reminder:</p>
                <p className="text-red-700 dark:text-red-300">
                  Before making any investment decisions, carefully consider your financial situation, investment objectives, and risk tolerance. Consult with a qualified financial advisor if you need personalized advice.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-gradient-to-br from-purple-50 to-white dark:from-dark-900 dark:to-dark-850/50 rounded-3xl p-8 md:p-12 text-center border border-purple-100 dark:border-purple-500/30">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <Info className="h-10 w-10 text-white" />
          </div>
          <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-purple-200 mb-6">Questions About This Disclaimer?</h2>
          <p className="text-xl text-slate-600 dark:text-purple-200 mb-8 max-w-2xl mx-auto">
            If you have any questions about this disclaimer or need clarification on any terms, please don&apos;t hesitate to contact our legal team.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center mb-8">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-xl font-bold hover:from-purple-700 hover:to-purple-800 transition-all duration-300"
            >
              <Phone className="mr-2 h-5 w-5" />
              Contact Us
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center justify-center border-2 border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400 px-8 py-4 rounded-xl font-bold hover:bg-purple-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:border-emerald-600 dark:hover:text-white transition-all duration-300"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              View Privacy Policy
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center border-2 border-slate-300 dark:border-purple-500/50 text-slate-700 dark:text-purple-200 px-8 py-4 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-purple-900/40 transition-all duration-300"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Editorial standards (About)
            </Link>
          </div>
          <div className="text-sm text-slate-500 dark:text-purple-300 space-y-2">
            <p><strong>Last Updated:</strong> March 9, 2026</p>
            <p><strong>Effective Date:</strong> March 9, 2026</p>
            <p><strong>Version:</strong> 2.1</p>
          </div>
        </section>
      </div>
    </div>
  );
}
