"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { createPost, updatePost, type PostFormData } from "../../lib/admin-actions";
import { categories } from "../../lib/site-config";
import type { Post } from "../../lib/types";

const CATEGORY_OPTIONS = [...new Set(categories.map((c) => c.name))];

const defaultForm: PostFormData = {
  title: "",
  excerpt: "",
  category: "Investing",
  imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900&h=500&fit=crop",
  contentUrl: "",
  authorName: "",
  authorTitle: "Writer",
  authorImage: "https://api.dicebear.com/9.x/avataaars/svg?seed=alex",
  authorBio: "",
  authorFollowers: "",
  authorArticles: undefined,
  readTime: "5 min read",
  tags: [],
  featured: false,
  expertPicks: false,
  trending: false,
  guides: false,
};

type PostFormProps = {
  mode: "create" | "edit";
  post?: Post | null;
};

export default function PostForm({ mode, post }: PostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<PostFormData>(
    post
      ? {
          title: post.title,
          excerpt: post.excerpt,
          category: post.category,
          imageUrl: post.image,
          contentUrl: post.contentUrl ?? "",
          authorName: post.author.name,
          authorTitle: post.author.title,
          authorImage: post.author.image,
          authorBio: post.author.bio ?? "",
          authorFollowers: post.author.followers ?? "",
          authorArticles: post.author.articles,
          readTime: post.readTime,
          tags: post.tags,
          featured: post.featured,
          expertPicks: post.expertPicks,
          trending: post.trending,
          guides: post.guides,
        }
      : defaultForm
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "tags"
            ? value.split(",").map((t) => t.trim()).filter(Boolean)
            : value,
    }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm((prev) => ({
      ...prev,
      tags: val.split(",").map((t) => t.trim()).filter(Boolean),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "create") {
        const res = await createPost(form);
        if (res.ok && res.id) {
          router.push(`/admin/articles`);
          router.refresh();
        } else {
          setError(res.error ?? "Failed to create post");
        }
      } else if (post) {
        const res = await updatePost(post.id, form);
        if (res.ok) {
          router.push(`/admin/articles`);
          router.refresh();
        } else {
          setError(res.error ?? "Failed to update post");
        }
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = (key: keyof Pick<PostFormData, "featured" | "expertPicks" | "trending" | "guides">) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const inputClass =
    "w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-purple-500/50 bg-white dark:bg-dark-900 text-slate-900 dark:text-dark-100 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-purple-200 mb-1";

  return (
    <div>
      <Link
        href="/admin/articles"
        className="inline-flex items-center gap-2 text-slate-600 dark:text-purple-300 hover:text-purple-600 dark:hover:text-purple-400 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Articles
      </Link>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <section className="rounded-2xl bg-white dark:bg-dark-800/50 border border-slate-200 dark:border-purple-500/30 p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-dark-100">
            Content
          </h2>
          <div>
            <label htmlFor="title" className={labelClass}>Title</label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={form.title}
              onChange={handleChange}
              className={inputClass}
              placeholder="Article title"
            />
          </div>
          <div>
            <label htmlFor="excerpt" className={labelClass}>Excerpt</label>
            <textarea
              id="excerpt"
              name="excerpt"
              rows={2}
              required
              value={form.excerpt}
              onChange={handleChange}
              className={inputClass}
              placeholder="Short summary"
            />
          </div>
          <div>
            <label htmlFor="category" className={labelClass}>Category</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className={inputClass}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label htmlFor="imageUrl" className={labelClass}>Cover image URL</label>
              <a
                href="https://vercel.com/michaelgens-projects/~/stores/blob/store_kWyLl14fTfZ0EaHj/browser?directory=Images"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Upload to Vercel Blob
              </a>
            </div>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={handleChange}
              className={inputClass}
              placeholder="https://..."
            />
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt="Preview"
                className="mt-2 h-32 w-auto object-cover rounded-xl border border-slate-200 dark:border-purple-500/30"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label htmlFor="contentUrl" className={labelClass}>
                Content (MD file URL)
              </label>
              <a
                href="https://vercel.com/michaelgens-projects/~/stores/blob/store_kWyLl14fTfZ0EaHj/browser?directory=Content"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Upload MD to Vercel Blob
              </a>
            </div>
            <input
              id="contentUrl"
              name="contentUrl"
              type="url"
              value={form.contentUrl}
              onChange={handleChange}
              className={inputClass}
              placeholder="https://xxx.public.blob.vercel-storage.com/article.md"
            />
            <p className="mt-2 text-sm text-slate-500 dark:text-purple-400">
              Upload your .md file to Vercel Blob, then paste the public URL here. The article body will be rendered from this file.
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white dark:bg-dark-800/50 border border-slate-200 dark:border-purple-500/30 p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-dark-100">
            Author
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="authorName" className={labelClass}>Name</label>
              <input
                id="authorName"
                name="authorName"
                type="text"
                required
                value={form.authorName}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="authorTitle" className={labelClass}>Title</label>
              <input
                id="authorTitle"
                name="authorTitle"
                type="text"
                value={form.authorTitle}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="authorImage" className={labelClass}>Avatar URL</label>
            <input
              id="authorImage"
              name="authorImage"
              type="url"
              value={form.authorImage}
              onChange={handleChange}
              className={inputClass}
              placeholder="https://... or select an avatar below"
            />
            <p className="mt-2 text-sm text-slate-600 dark:text-purple-300 mb-2">
              Select an avatar below to load its URL, or paste your own:
            </p>
            <div className="flex flex-wrap gap-4">
              {(
                [
                  { id: "1", url: "https://api.dicebear.com/9.x/avataaars/svg?seed=alex", label: "Alex" },
                  { id: "2", url: "https://api.dicebear.com/9.x/avataaars/svg?seed=jamie", label: "Jamie" },
                  { id: "3", url: "https://api.dicebear.com/9.x/avataaars/svg?seed=sam", label: "Sam" },
                  { id: "4", url: "https://api.dicebear.com/9.x/avataaars/svg?seed=riley", label: "Riley" },
                  { id: "5", url: "https://api.dicebear.com/9.x/avataaars/svg?seed=casey", label: "Casey" },
                  { id: "6", url: "https://api.dicebear.com/9.x/avataaars/svg?seed=blake", label: "Blake" },
                  { id: "7", url: "https://api.dicebear.com/9.x/avataaars/svg?seed=morgan", label: "Morgan" },
                  { id: "8", url: "https://api.dicebear.com/9.x/avataaars/svg?seed=harper", label: "Harper" },
                  { id: "9", url: "https://api.dicebear.com/9.x/avataaars/svg?seed=taylor", label: "Taylor" },
                  { id: "10", url: "https://api.dicebear.com/9.x/avataaars/svg?seed=parker", label: "Parker" },
                ] as const
              ).map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, authorImage: avatar.url }))
                  }
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
                    form.authorImage === avatar.url
                      ? "border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-200 dark:ring-purple-900/50"
                      : "border-slate-200 dark:border-purple-500/30 hover:border-purple-300 hover:bg-slate-50 dark:hover:bg-purple-900/10"
                  }`}
                >
                  <img
                    src={avatar.url}
                    alt={avatar.label}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <span className="text-xs font-medium text-slate-600 dark:text-purple-200">
                    {avatar.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="authorBio" className={labelClass}>Bio</label>
            <textarea
              id="authorBio"
              name="authorBio"
              rows={2}
              value={form.authorBio}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="authorFollowers" className={labelClass}>Followers</label>
              <input
                id="authorFollowers"
                name="authorFollowers"
                type="text"
                value={form.authorFollowers}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. 10K"
              />
            </div>
            <div>
              <label htmlFor="authorArticles" className={labelClass}>Articles count</label>
              <input
                id="authorArticles"
                name="authorArticles"
                type="number"
                min={0}
                value={form.authorArticles ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    authorArticles: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  }))
                }
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white dark:bg-dark-800/50 border border-slate-200 dark:border-purple-500/30 p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-dark-100">
            Metadata
          </h2>
          <div>
            <label htmlFor="readTime" className={labelClass}>Read time</label>
            <input
              id="readTime"
              name="readTime"
              type="text"
              value={form.readTime}
              onChange={handleChange}
              className={inputClass}
              placeholder="5 min read"
            />
          </div>
          <div>
            <label htmlFor="tags" className={labelClass}>Tags (comma-separated)</label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={form.tags.join(", ")}
              onChange={handleTagsChange}
              className={inputClass}
              placeholder="investing, finance, stocks"
            />
          </div>
          <div>
            <span className={labelClass}>Featured on homepage</span>
            <div className="flex flex-wrap gap-3 mt-2">
              {(["featured", "expertPicks", "trending", "guides"] as const).map((key) => {
                const labels: Record<string, string> = {
                  featured: "Featured",
                  expertPicks: "Expert Pick",
                  trending: "Trending",
                  guides: "Popular Guide",
                };
                const colors: Record<string, string> = {
                  featured: "purple",
                  expertPicks: "amber",
                  trending: "orange",
                  guides: "emerald",
                };
                const colorClass: Record<string, string> = {
                  purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
                  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
                  orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
                  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
                };
                const isOn = form[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleFlag(key)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isOn ? colorClass[colors[key]] : "bg-slate-100 text-slate-500 dark:bg-dark-800 dark:text-purple-500"
                    }`}
                  >
                    {labels[key]}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-accent-600 text-white font-bold hover:from-purple-700 hover:to-accent-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Article" : "Save Changes"}
          </button>
          <Link
            href="/admin/articles"
            className="px-6 py-3 rounded-xl border border-slate-300 dark:border-purple-500/50 text-slate-700 dark:text-purple-200 font-medium hover:bg-slate-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
