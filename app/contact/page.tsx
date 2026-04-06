"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  CheckCircle,
  Shield,
  Loader2,
  MessageCircle,
  HelpCircle,
} from "lucide-react";

const LAST_UPDATED = "March 9, 2026";

const contactMethods = [
  {
    icon: Mail,
    title: "Email support",
    description: "Detailed responses; attach context when helpful.",
    contact: "hello@factsdeck.com",
    responseTime: "Within 24 hours",
    available: "24/7 inbox",
  },
  {
    icon: Phone,
    title: "Phone support",
    description: "Speak with our team during business hours.",
    contact: "+22 *** *** ****",
    responseTime: "Same day",
    available: "9AM – 6PM EST",
  },
  {
    icon: MapPin,
    title: "Office",
    description: "Visits by appointment.",
    contact: "Belfast, NI, UK",
    responseTime: "By appointment",
    available: "Mon – Fri",
  },
];

const departments = [
  { name: "General Inquiries", email: "hello@factsdeck.com" },
  { name: "Editorial Team", email: "editorial@factsdeck.com" },
  { name: "Technical Support", email: "tech@factsdeck.com" },
  { name: "Business Partnerships", email: "partnerships@factsdeck.com" },
  { name: "Press & Media", email: "press@factsdeck.com" },
  { name: "Careers", email: "careers@factsdeck.com" },
];

const faqs = [
  {
    question: "How can I contribute an article to Facts Deck?",
    answer:
      "We welcome contributions from finance experts and writers. Please send your pitch to editorial@factsdeck.com with your credentials and article outline.",
  },
  {
    question: "Do you offer personalized financial advice?",
    answer:
      "We provide educational content only. For personalized advice, we recommend consulting with a qualified financial advisor.",
  },
  {
    question: "How often is your content updated?",
    answer: "We publish new articles daily and update existing content regularly to ensure accuracy and relevance.",
  },
  {
    question: "Can I use your calculators for commercial purposes?",
    answer: "Our tools are for personal use only. For commercial licensing, please contact partnerships@factsdeck.com.",
  },
];

const officeHours = [
  { day: "Monday – Friday", hours: "9:00 AM – 6:00 PM EST" },
  { day: "Saturday", hours: "10:00 AM – 4:00 PM EST" },
  { day: "Sunday", hours: "Closed" },
  { day: "Holidays", hours: "Limited hours" },
];

const cardSurface =
  "rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-colors hover:border-blue-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800/80";

const iconWrap =
  "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-200/90 bg-orange-50 text-blue-700 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-cyan-300";

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/25 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/25";

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

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    department: "General Inquiries",
    message: "",
    priority: "normal",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
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
                <MessageCircle className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-emerald-400" />
                Support-first routing
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
                GET IN TOUCH
              </p>
              <h1 className="mt-3 font-display text-4xl font-bold leading-[1.08] text-balance sm:text-5xl md:text-6xl">
                <span className="text-blue-800 dark:text-emerald-300">Contact</span>{" "}
                <span className="text-orange-600 dark:text-cyan-400">Facts Deck</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-300">
                Editorial pitches, partnerships, technical support, press, or general questions. Choose a channel below or
                send a message—we route to the right team.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="#send-message"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  Send a message
                </Link>
                <Link
                  href="#methods"
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-orange-50 hover:text-blue-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-emerald-950/40 dark:hover:text-cyan-300"
                >
                  Contact methods
                </Link>
                <Link
                  href="#faq"
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:border-zinc-300 hover:text-blue-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-cyan-300"
                >
                  FAQ
                </Link>
              </div>

              <p className="mt-6 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                Policies:{" "}
                <Link href="/privacy" className="font-medium text-blue-800 underline-offset-4 hover:underline dark:text-cyan-300">
                  Privacy
                </Link>
                {" · "}
                <Link href="/disclaimer" className="font-medium text-blue-800 underline-offset-4 hover:underline dark:text-cyan-300">
                  Disclaimer
                </Link>
                {" · "}
                <Link href="/about" className="font-medium text-blue-800 underline-offset-4 hover:underline dark:text-cyan-300">
                  About
                </Link>
              </p>
            </div>

            <aside className="lg:col-span-5">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/35">
                <p className="text-xs font-semibold tracking-widest text-orange-800/90 dark:text-cyan-400/90">
                  TYPICAL RESPONSES
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Email</p>
                    <p className="mt-1 text-lg font-semibold text-blue-800 dark:text-emerald-300">≤ 24h</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Phone</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Business hours</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Press</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">1–2 days</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Partnerships</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">2–3 days</p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                  Estimates only; actual timing varies by volume and request type.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <section id="methods" className="mb-20 scroll-mt-24">
          <SectionHeading
            kicker="CHANNELS"
            title="How to reach us"
            description="Pick the channel that fits your question. For fastest routing, use the form and select a department."
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {contactMethods.map((method, index) => (
              <div key={index} className={`${cardSurface} flex flex-col p-6 text-center md:text-left`}>
                <div className={`${iconWrap} mx-auto mb-6 md:mx-0`}>
                  <method.icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-100">{method.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{method.description}</p>
                <div className="mt-4 space-y-1 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{method.contact}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Response: {method.responseTime}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{method.available}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="send-message" className="mb-20 scroll-mt-24">
          <SectionHeading
            kicker="WRITE TO US"
            title="Send a message"
            description="We read every submission. Please avoid sharing sensitive account passwords or full card numbers in this form."
          />

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-950">
                {isSubmitted ? (
                  <div className="py-10 text-center">
                    <div className={`${iconWrap} mx-auto mb-6`}>
                      <CheckCircle className="h-7 w-7" aria-hidden />
                    </div>
                    <h3 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-100">Message sent</h3>
                    <p className="mx-auto mt-2 max-w-md text-zinc-600 dark:text-zinc-300">
                      Thanks for reaching out. We&apos;ll get back to you as soon as we can.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsSubmitted(false)}
                      className="mt-8 inline-flex items-center justify-center rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Full name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className={inputClass}
                          placeholder="Your full name"
                          autoComplete="name"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className={inputClass}
                          placeholder="you@email.com"
                          autoComplete="email"
                          inputMode="email"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Department
                        </label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className={inputClass}
                        >
                          {departments.map((d) => (
                            <option key={d.name} value={d.name}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Priority
                        </label>
                        <select name="priority" value={formData.priority} onChange={handleInputChange} className={inputClass}>
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">Subject *</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className={inputClass}
                        placeholder="Brief summary of your inquiry"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">Message *</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className={`${inputClass} resize-none`}
                        placeholder="Details, links, or context that help us help you…"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-8 py-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" aria-hidden />
                          Send message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className={cardSurface}>
                <div className="mb-6 flex items-center gap-3">
                  <div className={iconWrap}>
                    <Clock className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100">Office hours</h3>
                </div>
                <div className="space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800">
                  {officeHours.map((schedule, index) => (
                    <div key={index} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{schedule.day}</span>
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/35">
                <div className="mb-4 flex items-center gap-3">
                  <div className={iconWrap}>
                    <Shield className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100">Urgent & security</h3>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  For urgent technical issues or security concerns, call our hotline (no account PINs or passwords by phone).
                </p>
                <p className="mt-3 font-semibold text-zinc-900 dark:text-zinc-100">+44 *** *** ****</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Escalation line — 24/7</p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex gap-3">
                  <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-emerald-400" aria-hidden />
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    Prefer email? You can also reach{" "}
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">hello@factsdeck.com</span> directly—same
                    routing as the form.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-zinc-50/90 px-4 py-14 sm:px-8 lg:px-10 dark:border-zinc-800 dark:bg-zinc-900/25">
          <SectionHeading
            kicker="FAQ"
            title="Frequently asked questions"
            description="Quick answers to common questions. If you need something specific, use the form above or email the department that fits."
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {faqs.map((faq, index) => (
              <div key={index} className={`${cardSurface} p-6`}>
                <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100">{faq.question}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
