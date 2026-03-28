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
  Building,
  CheckCircle,
  Star,
  Shield,
} from "lucide-react";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get detailed responses to your questions",
    contact: "hello@factsdeck.com",
    responseTime: "Within 24 hours",
    color: "from-blue-500 to-blue-600",
    available: "24/7",
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our experts",
    contact: "+22 *** *** ****",
    responseTime: "Immediate",
    color: "from-emerald-500 to-emerald-600",
    available: "9AM - 6PM EST",
  },
  {
    icon: MapPin,
    title: "Office Visit",
    description: "Meet our team in person",
    contact: "Belfast, NI, UK",
    responseTime: "By appointment",
    color: "from-orange-500 to-orange-600",
    available: "Mon - Fri",
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
    answer: "We provide educational content only. For personalized advice, we recommend consulting with a qualified financial advisor.",
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
  { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM EST" },
  { day: "Saturday", hours: "10:00 AM - 4:00 PM EST" },
  { day: "Sunday", hours: "Closed" },
  { day: "Holidays", hours: "Limited Hours" },
];

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
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
              ))}
              <span className="text-purple-100 dark:text-purple-200 text-sm font-medium">24/7 Support • 98% Satisfaction Rate</span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance">
              Get in <span className="gradient-text">Touch</span>
            </h1>

            <p className="text-xl text-purple-100 dark:text-purple-200 leading-relaxed max-w-3xl mx-auto mb-8">
              Have questions about finance, need help with our tools, or want to partner with us? Our expert team is here to help you succeed on your financial journey.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold">24/7</div>
                <div className="text-sm text-purple-200">Support</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold">&lt;5min</div>
                <div className="text-sm text-purple-200">Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold">99%</div>
                <div className="text-sm text-purple-200">Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold">30+</div>
                <div className="text-sm text-purple-200">Experts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Contact Methods */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-purple-200 mb-6">Choose Your Preferred Contact Method</h2>
            <p className="text-xl text-slate-600 dark:text-purple-200 leading-relaxed max-w-3xl mx-auto">
              We offer multiple ways to get in touch. Pick the method that works best for you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-dark-900/50 dark:border-purple-500/30 rounded-2xl p-6 shadow-lg border border-slate-200 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${method.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <method.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-purple-200 mb-3 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                  {method.title}
                </h3>
                <p className="text-slate-600 dark:text-purple-200 mb-4 leading-relaxed text-sm">{method.description}</p>
                <div className="space-y-2">
                  <p className="font-semibold text-purple-600 dark:text-purple-400">{method.contact}</p>
                  <p className="text-sm text-slate-500 dark:text-purple-300/80">Response: {method.responseTime}</p>
                  <p className="text-sm text-slate-500 dark:text-purple-300/80">Available: {method.available}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form and Sidebar */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-dark-900/50 dark:border-purple-500/30 rounded-2xl p-8 shadow-lg border border-slate-200">
              <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-purple-200 mb-6">Send us a Message</h3>

              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-emerald-500" />
                  </div>
                  <h4 className="font-display text-xl font-bold text-slate-900 dark:text-purple-200 mb-4">Message Sent Successfully!</h4>
                  <p className="text-slate-600 dark:text-purple-200 mb-6">Thank you for contacting us. We&apos;ll get back to you within 24 hours.</p>
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 dark:hover:bg-emerald-600 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-purple-200 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 dark:border-purple-500/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-dark-850/50 dark:text-dark-100"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-purple-200 mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 dark:border-purple-500/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-dark-850/50 dark:text-dark-100"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-purple-200 mb-2">Department</label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-purple-500/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-dark-850/50 dark:text-dark-100"
                      >
                        {departments.map((d) => (
                          <option key={d.name} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-purple-200 mb-2">Priority</label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-purple-500/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-dark-850/50 dark:text-dark-100"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-purple-200 mb-2">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 dark:border-purple-500/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-dark-850/50 dark:text-dark-100"
                      placeholder="Brief description of your inquiry"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-purple-200 mb-2">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-purple-500/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-dark-850/50 dark:text-dark-100 resize-none"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-xl font-bold hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white dark:bg-dark-900/50 dark:border-purple-500/30 rounded-2xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center space-x-2 mb-6">
                <Clock className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-purple-200">Office Hours</h3>
              </div>
              <div className="space-y-3">
                {officeHours.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-purple-500/20 last:border-0">
                    <span className="text-slate-600 dark:text-purple-200 font-medium">{schedule.day}</span>
                    <span className="text-slate-900 dark:text-purple-200 font-semibold">{schedule.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-500/30">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-5 w-5 text-red-500" />
                <h3 className="font-display font-bold text-lg text-red-700 dark:text-red-400">Emergency Support</h3>
              </div>
              <p className="text-sm text-red-600 dark:text-red-300 mb-3">For urgent technical issues or security concerns</p>
              <p className="font-bold text-red-700 dark:text-red-400">+44 *** *** ****</p>
              <p className="text-xs text-red-500 dark:text-red-400 mt-2">Available 24/7</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-purple-200 mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-slate-600 dark:text-purple-200 leading-relaxed max-w-3xl mx-auto">
              Quick answers to common questions. Can&apos;t find what you&apos;re looking for? Contact us directly.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-dark-900/50 dark:border-purple-500/30 rounded-2xl p-6 shadow-lg border border-slate-200 hover:-translate-y-2 transition-all duration-300"
              >
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-purple-200 mb-4 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                  {faq.question}
                </h3>
                <p className="text-slate-600 dark:text-purple-200 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
