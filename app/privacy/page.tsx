import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
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
} from "lucide-react";
import { absoluteUrl } from "../lib/seo";

const canonical = absoluteUrl("/privacy");

export const metadata: Metadata = {
  title: { absolute: "FactsDeck | Privacy Policy" },
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
    title: "FactsDeck | Privacy Policy",
    description:
      "Facts Deck’s privacy policy: what we collect, how we use it, your rights, cookies, and how to contact us.",
    url: canonical,
    siteName: "Facts Deck",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FactsDeck | Privacy Policy",
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
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Eye,
    title: "How We Use Your Information",
    content:
      "We use the information we collect to provide, maintain, and improve our services, send you technical notices and support messages, respond to your comments and questions, and communicate with you about products, services, and events. We may also use your information for research and analytics purposes.",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Shield,
    title: "Information Sharing",
    content:
      "We do not sell your personal information to data brokers or marketing lists. We may share information with trusted service providers (for example hosting, email delivery, or analytics) who process data on our behalf under contract and only for the purposes we describe. We may also disclose information when required by law or to protect our rights and users. Where we use affiliate or partner technologies, we align disclosures with our editorial standards described on our About page.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Lock,
    title: "Data Security",
    content:
      "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, so we cannot guarantee absolute security.",
    color: "from-red-500 to-red-600",
  },
];

const dataTypes = [
  {
    category: "Account Information",
    items: ["Name and email address", "Profile information", "Account preferences", "Subscription status"],
    icon: User,
    color: "from-blue-500 to-blue-600",
  },
  {
    category: "Usage Data",
    items: ["Pages visited and time spent", "Articles read and bookmarked", "Search queries", "Device and browser information"],
    icon: Eye,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    category: "Communication Data",
    items: ["Contact form submissions", "Email communications", "Support ticket information", "Newsletter preferences"],
    icon: Mail,
    color: "from-purple-500 to-purple-600",
  },
  {
    category: "Technical Data",
    items: ["IP address and location", "Device identifiers", "Browser type and version", "Operating system"],
    icon: Settings,
    color: "from-orange-500 to-orange-600",
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
    icon: Shield,
  },
  {
    title: "Security measures",
    description:
      "We use technical and organizational measures appropriate to our size and risk to protect personal information. No online service can guarantee perfect security; see our Data Security section.",
    icon: Lock,
  },
  {
    title: "Transparency",
    description:
      "Our approach to trust and editorial independence—including how we handle affiliate disclosures—is summarized on our About page and is consistent with how we describe data use here.",
    icon: CheckCircle,
  },
];

export default function PrivacyPage() {
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
              <Lock className="h-6 w-6 text-emerald-400" />
              <span className="text-purple-100 dark:text-purple-200 text-sm font-medium">
                Privacy-focused • Transparent • Educational platform
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance">
              Privacy <span className="gradient-text">Policy</span>
            </h1>

            <p className="text-xl text-purple-100 dark:text-purple-200 leading-relaxed max-w-3xl mx-auto mb-8">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information when you use Facts Deck.
            </p>

            <div className="bg-purple-500/20 dark:bg-emerald-500/20 border border-purple-400/30 dark:border-emerald-400/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <CheckCircle className="h-6 w-6 text-purple-400 dark:text-emerald-400" />
                <span className="font-bold text-lg">Privacy Commitment</span>
              </div>
              <p className="text-purple-100 dark:text-emerald-100">
                Last updated: March 9, 2026 • We do not sell your personal information to data brokers; see
                sharing and affiliate disclosures below and on our{" "}
                <Link href="/about" className="underline font-semibold hover:text-white">
                  About
                </Link>{" "}
                page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Privacy Principles */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-purple-200 mb-6">Our Privacy Principles</h2>
            <p className="text-xl text-slate-600 dark:text-purple-200 leading-relaxed max-w-3xl mx-auto">
              We believe in transparency, user control, and responsible data handling in everything we do.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {privacySections.map((section, index) => (
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

        {/* Data We Collect */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-purple-200 mb-6">Types of Data We Collect</h2>
            <p className="text-xl text-slate-600 dark:text-purple-200 leading-relaxed max-w-3xl mx-auto">
              Here&apos;s a detailed breakdown of the information we collect and why we need it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dataTypes.map((dataType, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-dark-900/50 dark:border-purple-500/30 rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${dataType.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  <dataType.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-purple-200 mb-6 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                  {dataType.category}
                </h3>
                <ul className="space-y-3">
                  {dataType.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-purple-200 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-purple-200 mb-6">Your Privacy Rights</h2>
            <p className="text-xl text-slate-600 dark:text-purple-200 leading-relaxed max-w-3xl mx-auto">
              You have full control over your personal information. Here&apos;s what you can do.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {userRights.map((right, index) => (
              <div
                key={index}
                className="group text-center bg-white dark:bg-dark-900/50 dark:border-purple-500/30 rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <right.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-purple-200 mb-4 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                  {right.title}
                </h3>
                <p className="text-slate-600 dark:text-purple-200 leading-relaxed mb-6">{right.description}</p>
                <button
                  type="button"
                  className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-xl font-semibold hover:bg-purple-200 dark:hover:bg-emerald-900/30 hover:text-purple-700 dark:hover:text-emerald-400 transition-colors text-sm"
                >
                  {right.action}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Cookie Policy */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-purple-200 mb-6">Cookie Policy</h2>
            <p className="text-xl text-slate-600 dark:text-purple-200 leading-relaxed max-w-3xl mx-auto">
              We use cookies to enhance your experience and provide personalized content.
            </p>
          </div>

          <div className="space-y-6">
            {cookieTypes.map((cookie, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-dark-900/50 dark:border-purple-500/30 rounded-2xl p-8 shadow-lg border border-slate-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <Cookie className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-xl text-slate-900 dark:text-purple-200 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                        {cookie.type}
                      </h3>
                      <p className="text-slate-600 dark:text-purple-200">{cookie.purpose}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {cookie.required ? (
                      <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-sm font-semibold">
                        Required
                      </span>
                    ) : (
                      <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-sm font-semibold">
                        Optional
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cookie.examples.map((example, exampleIndex) => (
                    <span
                      key={exampleIndex}
                      className="bg-slate-100 dark:bg-dark-850/50 text-slate-600 dark:text-purple-300 px-3 py-1 rounded-lg text-sm"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance Standards */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-purple-200 mb-6">
              Compliance &amp; standards
            </h2>
            <p className="text-xl text-slate-600 dark:text-purple-200 leading-relaxed max-w-3xl mx-auto">
              We describe our privacy practices honestly. This section is not a guarantee of certification or audit
              outcome; it summarizes how we aim to align with common laws and expectations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {complianceStandards.map((standard, index) => (
              <div
                key={index}
                className="group text-center bg-white dark:bg-dark-900/50 dark:border-purple-500/30 rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <standard.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-purple-200 mb-4 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                  {standard.title}
                </h3>
                <p className="text-slate-600 dark:text-purple-200 leading-relaxed">{standard.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Data Retention */}
        <section className="mb-20">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-dark-900 dark:to-purple-900/20 rounded-3xl p-8 md:p-12 border border-blue-200 dark:border-purple-500/30">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Database className="h-10 w-10 text-white" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-400 mb-6">Data Retention Policy</h2>
            </div>

            <div className="max-w-4xl mx-auto space-y-6 text-blue-700 dark:text-blue-300">
              <p className="text-lg leading-relaxed">
                <strong>We only keep your data as long as necessary.</strong> Different types of information are retained for different periods based on legal requirements and business needs.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/50 dark:bg-dark-850/50 p-6 rounded-2xl">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-purple-200 mb-4">Account Data</h3>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-purple-200">
                    <li>• Active accounts: Retained while active</li>
                    <li>• Inactive accounts: 3 years</li>
                    <li>• Deleted accounts: 30 days</li>
                    <li>• Legal holds: As required</li>
                  </ul>
                </div>

                <div className="bg-white/50 dark:bg-dark-850/50 p-6 rounded-2xl">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-purple-200 mb-4">Usage Data</h3>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-purple-200">
                    <li>• Analytics data: 26 months</li>
                    <li>• Log files: 12 months</li>
                    <li>• Error reports: 6 months</li>
                    <li>• Performance data: 3 months</li>
                  </ul>
                </div>

                <div className="bg-white/50 dark:bg-dark-850/50 p-6 rounded-2xl">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-purple-200 mb-4">Communication</h3>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-purple-200">
                    <li>• Support tickets: 3 years</li>
                    <li>• Email communications: 2 years</li>
                    <li>• Marketing data: Until unsubscribed</li>
                    <li>• Legal notices: 7 years</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-gradient-to-br from-purple-50 to-white dark:from-dark-900 dark:to-dark-850/50 rounded-3xl p-8 md:p-12 text-center border border-purple-100 dark:border-purple-500/30">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <Info className="h-10 w-10 text-white" />
          </div>
          <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-purple-200 mb-6">Questions About Your Privacy?</h2>
          <p className="text-xl text-slate-600 dark:text-purple-200 mb-8 max-w-2xl mx-auto">
            Our Data Protection Officer is here to help with any privacy-related questions or concerns.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-purple-200 mb-1">Email</h3>
              <p className="text-purple-600 dark:text-purple-400 font-semibold">privacy@factsdeck.com</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-purple-200 mb-1">Phone</h3>
              <p className="text-purple-600 dark:text-purple-400 font-semibold">+1 (555) 123-PRIV</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-purple-200 mb-1">Address</h3>
              <p className="text-purple-600 dark:text-purple-400 font-semibold">Privacy Office, NY</p>
            </div>
          </div>
          <div className="text-sm text-slate-500 dark:text-purple-300 space-y-2">
            <p><strong>Last Updated:</strong> March 9, 2026</p>
            <p><strong>Effective Date:</strong> March 9, 2026</p>
            <p><strong>Version:</strong> 3.0</p>
          </div>
        </section>
      </div>
    </div>
  );
}
