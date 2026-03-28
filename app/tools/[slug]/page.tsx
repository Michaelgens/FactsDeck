import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Wrench,
  Sparkles,
  ArrowLeft,
  BookOpen,
  Calculator,
} from "lucide-react";
import { quickTools } from "../../lib/site-config";

const SLUG_TO_NAME: Record<string, string> = Object.fromEntries(
  quickTools.map((t) => [t.name.toLowerCase().replace(/\s+/g, "-"), t.name])
);

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateStaticParams() {
  return quickTools.map((tool) => ({
    slug: tool.name.toLowerCase().replace(/\s+/g, "-"),
  }));
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const toolName = SLUG_TO_NAME[slug] ?? slugToTitle(slug);

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-dark-950 dark:to-dark-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-accent-600/10 dark:from-purple-900/30 dark:to-accent-900/30" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent-400/20 dark:bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-emerald-400 font-semibold transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="relative inline-flex mb-8">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-purple-500 to-accent-600 flex items-center justify-center shadow-2xl shadow-purple-500/25 dark:shadow-purple-900/50 animate-pulse">
            <Calculator className="h-12 w-12 md:h-16 md:w-16 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-amber-400 dark:bg-amber-500 flex items-center justify-center shadow-lg">
            <Wrench className="h-6 w-6 text-amber-900" />
          </div>
        </div>

        <h1 className="font-display text-2xl md:text-4xl font-bold text-gray-900 dark:text-purple-100 mb-4">
          <span className="text-purple-600 dark:text-purple-400">{toolName}</span>
          <br />
          is on its way
        </h1>

        <p className="text-lg text-gray-600 dark:text-purple-200 leading-relaxed mb-8 max-w-lg mx-auto">
          We&apos;re polishing our calculators and tools to give you the best experience. 
          This one isn&apos;t ready yet — but our team is hard at work bringing it to life.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/post"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-accent-600 text-white px-6 py-4 rounded-2xl font-bold hover:from-purple-700 hover:to-accent-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <BookOpen className="h-5 w-5" />
            Explore Articles
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border-2 border-purple-600 dark:border-purple-500 text-purple-600 dark:text-purple-400 px-6 py-4 rounded-2xl font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        <div className="bg-white/80 dark:bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-purple-500/30 text-left">
          <p className="text-sm font-semibold text-gray-700 dark:text-purple-200 mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Coming soon
          </p>
          <p className="text-gray-600 dark:text-purple-300 text-sm leading-relaxed">
            In the meantime, browse our guides and expert insights to plan your finances. 
            We&apos;ll have powerful tools ready for you soon — stay tuned.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-purple-500/20">
          <p className="text-xs text-gray-500 dark:text-purple-400 mb-4">
            Other tools we&apos;re building
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {quickTools
              .filter((t) => t.name !== toolName)
              .slice(0, 4)
              .map((tool) => (
                <span
                  key={tool.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-purple-300 text-xs font-medium"
                >
                  {tool.name}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
