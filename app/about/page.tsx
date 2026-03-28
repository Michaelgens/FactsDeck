import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Users,
  Target,
  Globe,
  Heart,
  Lightbulb,
  Shield,
  TrendingUp,
  BookOpen,
  Calculator,
  Star,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Zap,
  Rocket,
  Brain,
  Trophy,
} from "lucide-react";

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
    name: "Michael Chen",
    role: "Chief Technology Officer",
    image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300",
    bio: "Tech entrepreneur and former fintech executive. Building the future of financial education platforms.",
    expertise: ["Fintech", "Product Strategy", "Data Analytics"],
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
  { number: "50+", label: "Financial Tools", icon: Calculator },
  { number: "4.9★", label: "User Rating", icon: Star },
  { number: "150+", label: "Countries Reached", icon: Globe },
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

const features = [
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

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-dark-950 dark:to-dark-900">
      {/* Hero Section */}
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

          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-purple-100 dark:text-purple-200 text-sm font-medium">
                Trusted by millions worldwide
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance">
              About <span className="gradient-text">Facts Deck</span>
            </h1>

            <p className="text-xl text-purple-100 dark:text-purple-100 leading-relaxed max-w-3xl mx-auto mb-8">
              We&apos;re on a mission to democratize financial education and empower everyone to make informed
              financial decisions. From beginners to experts, we provide the knowledge and tools you need to
              succeed.
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
                href="#newsletter"
                className="group glass-effect text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all duration-300 backdrop-blur-lg border border-white/30 flex items-center justify-center hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105"
              >
                <Users className="mr-2 h-5 w-5" />
                Join Community
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
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
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission Statement */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-purple-200 mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-gray-600 dark:text-purple-200 leading-relaxed max-w-4xl mx-auto">
              To make financial literacy accessible to everyone by providing clear, actionable, and unbiased
              financial education. We believe that everyone deserves the knowledge and tools to build a secure
              financial future.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-display font-bold text-xl text-gray-900 dark:text-purple-200 mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-purple-200 leading-relaxed group-hover:scale-110 transition-transform duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-purple-200 mb-6">
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

        {/* Achievements */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-purple-200 mb-6">
              Our Impact
            </h2>
            <p className="text-xl text-gray-600 dark:text-purple-200 leading-relaxed max-w-3xl mx-auto">
              Numbers that reflect our commitment to serving the global financial education community.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
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

        {/* Timeline */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-purple-200 mb-6">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 dark:text-purple-200 leading-relaxed max-w-3xl mx-auto">
              From a simple idea to a global platform serving millions of users worldwide.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-500 to-accent-500 rounded-full" />
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                >
                  <div
                    className={`group w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}
                  >
                    <div className="bg-white dark:bg-gradient-to-br dark:from-dark-800 dark:to-purple-900/50 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-purple-500/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                      <div className="text-purple-600 dark:text-purple-400 font-bold text-lg mb-2">
                        {item.year}
                      </div>
                      <h3 className="font-display font-bold text-xl text-gray-900 dark:text-purple-200 mb-3 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 dark:text-purple-200 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-purple-200 mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-purple-200 leading-relaxed max-w-3xl mx-auto">
              Our diverse team of financial experts, technologists, and educators working to make finance
              accessible for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a
                    href={member.social.twitter}
                    className="text-gray-600 dark:text-white hover:text-purple-500 dark:hover:text-emerald-400 transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-dark-800 dark:to-purple-900/50 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-purple-200 mb-6">
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
              >
                <Facebook className="h-8 w-8" />
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-emerald-400 transition-colors transform hover:scale-110"
              >
                <Twitter className="h-8 w-8" />
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-emerald-400 transition-colors transform hover:scale-110"
              >
                <Linkedin className="h-8 w-8" />
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-emerald-400 transition-colors transform hover:scale-110"
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
  );
}
