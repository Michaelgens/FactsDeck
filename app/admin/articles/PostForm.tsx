"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Plus,
  X,
  Globe,
  EyeOff,
  FileText,
  User,
  Search,
  LayoutGrid,
  CheckCircle2,
  Circle,
  MessageCircleQuestion,
  Trophy,
} from "lucide-react";
import { createEmptyPoll } from "../../lib/poll-types";
import { createEmptyQuiz } from "../../lib/quiz-types";
import PostPollEditor from "./PostPollEditor";
import PostQuizEditor from "./PostQuizEditor";
import { createPost, updatePost, type PostFormData } from "../../lib/admin-actions";
import { categories } from "../../lib/site-config";
import type { Post } from "../../lib/types";
import {
  type ArticleFormTab,
  getTabValidation,
  isCreateFormComplete,
  pollBlocksSave,
  validatePollTab,
  validateQuizTab,
} from "./post-form-validation";
import { admin } from "../components/admin-theme";

const CATEGORY_OPTIONS = [...new Set(categories.map((c) => c.name))];

const emptyCreateForm: PostFormData = {
  title: "",
  excerpt: "",
  categories: [],
  published: true,
  imageUrl: "",
  contentUrl: "",
  bodyMarkdown: "",
  slug: "",
  authorName: "",
  authorTitle: "",
  authorImage: "",
  authorBio: "",
  authorFollowers: "",
  authorArticles: undefined,
  readTime: "",
  tags: [],
  featured: false,
  expertPicks: false,
  trending: false,
  guides: false,
  poll: createEmptyPoll(),
  quiz: createEmptyQuiz(),
};

type PostFormProps = {
  mode: "create" | "edit";
  post?: Post | null;
};

export default function PostForm({ mode, post }: PostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [activeTab, setActiveTab] = useState<ArticleFormTab>("content");
  const [visitedTabs, setVisitedTabs] = useState<Set<ArticleFormTab>>(() =>
    mode === "edit"
      ? new Set(["content", "author", "seo", "placement", "poll", "quiz"])
      : new Set(["content"])
  );

  const tabs: { id: ArticleFormTab; label: string; icon: typeof FileText }[] = [
    { id: "content", label: "Content", icon: FileText },
    { id: "author", label: "Author", icon: User },
    { id: "seo", label: "SEO & metadata", icon: Search },
    { id: "poll", label: "Reader poll", icon: MessageCircleQuestion },
    { id: "quiz", label: "Knowledge quiz", icon: Trophy },
    { id: "placement", label: "Placement", icon: LayoutGrid },
  ];

  const selectTab = (id: ArticleFormTab) => {
    setActiveTab(id);
    setVisitedTabs((prev) => new Set(prev).add(id));
  };

  const [form, setForm] = useState<PostFormData>(
    post
      ? {
          title: post.title,
          excerpt: post.excerpt,
          categories: post.categories?.length ? post.categories : ["General"],
          published: post.published,
          imageUrl: post.image,
          contentUrl: post.contentUrl ?? "",
          bodyMarkdown: post.content ?? "",
          slug: post.slug ?? "",
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
          poll: post.poll ?? createEmptyPoll(),
          quiz: post.quiz ?? createEmptyQuiz(),
        }
      : emptyCreateForm
  );

  const tabValidation = useMemo(
    () => getTabValidation(form, visitedTabs),
    [form, visitedTabs]
  );

  const createFormComplete = mode === "create"
    ? isCreateFormComplete(form, visitedTabs)
    : true;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleCategory = (name: string) => {
    setForm((prev) => {
      const set = new Set(prev.categories);
      if (set.has(name)) set.delete(name);
      else set.add(name);
      const next = Array.from(set);
      return { ...prev, categories: next.length ? next : ["General"] };
    });
  };

  const addTagsFromString = (raw: string) => {
    const parts = raw
      .split(/[,;\n]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    setForm((prev) => {
      const merged = new Set([...prev.tags, ...parts]);
      return { ...prev, tags: Array.from(merged) };
    });
  };

  const addTagLine = () => {
    const t = tagInput.trim();
    if (!t) return;
    setForm((prev) => (prev.tags.includes(t) ? prev : { ...prev, tags: [...prev.tags, t] }));
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((x) => x !== tag) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create") {
      const order: ArticleFormTab[] = ["content", "author", "seo", "placement"];
      const firstIncomplete = order.find((t) => tabValidation[t].length > 0);
      if (firstIncomplete) {
        selectTab(firstIncomplete);
        setError(
          `Complete all sections before publishing: ${tabValidation[firstIncomplete].join(" · ")}`
        );
        return;
      }
    }

    if (pollBlocksSave(form)) {
      const pollErrors = validatePollTab(form);
      const quizErrors = validateQuizTab(form);
      if (pollErrors.length) {
        selectTab("poll");
        setError(`Fix the reader poll: ${pollErrors.join(" · ")}`);
      } else {
        selectTab("quiz");
        setError(`Fix the knowledge quiz: ${quizErrors.join(" · ")}`);
      }
      return;
    }

    setLoading(true);
    setError(null);
    const payload: PostFormData = {
      ...form,
      categories: form.categories.length ? form.categories : ["General"],
    };
    try {
      if (mode === "create") {
        const res = await createPost(payload);
        if (res.ok && res.id) {
          router.push(`/admin/articles`);
          router.refresh();
        } else {
          setError(res.error ?? "Failed to create post");
        }
      } else if (post) {
        const res = await updatePost(post.id, payload);
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

  const inputClass = `w-full px-4 py-2 rounded-xl ${admin.input} ${admin.focus}`;
  const labelClass = `block text-sm font-medium ${admin.label} mb-1`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <Link
          href="/admin/articles"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-violet-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Articles
        </Link>
        {mode === "edit" && post ? (
          <Link
            href={`/admin/articles/${post.id}/preview`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-emerald-400 hover:underline"
          >
            Preview article
            <ExternalLink className="h-4 w-4" />
          </Link>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {mode === "create" ? (
          <p className="text-sm text-slate-600 dark:text-zinc-400 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/80 px-4 py-3">
            Complete all four tabs before you can save. Each tab shows a checkmark when its required fields are filled.
          </p>
        ) : null}

        <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 sticky top-0 z-10 backdrop-blur-sm">
          {tabs.map(({ id, label, icon: Icon }) => {
            const complete = mode !== "create" || tabValidation[id].length === 0;
            const showEditWarning =
              mode === "edit" && (id === "poll" || id === "quiz") && tabValidation[id].length > 0;
            return (
              <button
                key={id}
                type="button"
                onClick={() => selectTab(id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === id
                    ? "bg-white dark:bg-zinc-800 text-purple-700 dark:text-zinc-200 shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:text-purple-600"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {mode === "create" ? (
                  complete ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-label="Complete" />
                  ) : (
                    <Circle className="h-4 w-4 text-amber-500" aria-label="Incomplete" />
                  )
                ) : showEditWarning ? (
                  <Circle className="h-4 w-4 text-amber-500" aria-label="Needs fixes" />
                ) : null}
              </button>
            );
          })}
        </div>

        {tabValidation[activeTab].length > 0 ? (
          <ul className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl px-4 py-3 list-disc pl-8 space-y-1">
            {tabValidation[activeTab].map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        ) : null}

        {activeTab === "content" && (
        <section className={`rounded-2xl ${admin.card} p-6 space-y-4`}>
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-zinc-100">
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
            <span className={labelClass}>Categories (select all that apply)</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((c) => {
                const on = form.categories.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCategory(c)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                      on
                        ? "bg-purple-600 text-white border-purple-600 shadow-md"
                        : "bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-purple-400"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400">
              Posts can appear under multiple topics; readers filter by any matching label.
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label htmlFor="imageUrl" className={labelClass}>Cover image URL</label>
              <a
                href="https://vercel.com/michaelgens-projects/~/stores/blob/store_kWyLl14fTfZ0EaHj/browser?directory=Images"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-purple-600 dark:text-violet-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Upload to Vercel Blob
              </a>
            </div>
            <input
              id="imageUrl"
              name="imageUrl"
              type="text"
              inputMode="url"
              value={form.imageUrl}
              onChange={handleChange}
              className={inputClass}
              placeholder="https://... or /image-in-public.jpg"
            />
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt="Preview"
                className="mt-2 h-32 w-auto object-cover rounded-xl border border-slate-200 dark:border-zinc-800"
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
                className="inline-flex items-center gap-1.5 text-sm text-purple-600 dark:text-violet-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Upload MD to Vercel Blob
              </a>
            </div>
            <input
              id="contentUrl"
              name="contentUrl"
              type="text"
              inputMode="url"
              value={form.contentUrl}
              onChange={handleChange}
              className={inputClass}
              placeholder="https://xxx.public.blob.vercel-storage.com/article.md"
            />
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
              Paste the blob URL here. Public URLs (<code className="text-xs">*.public.blob.vercel-storage.com</code>)
              work with a normal fetch. Private store URLs need{" "}
              <code className="text-xs">BLOB_READ_WRITE_TOKEN</code> in the server environment. If the URL
              is empty, use the Markdown field below instead.
            </p>
          </div>
          <div>
            <label htmlFor="slug" className={labelClass}>
              URL slug (SEO)
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              value={form.slug}
              onChange={handleChange}
              className={inputClass}
              placeholder="auto from title, e.g. how-to-build-an-emergency-fund"
            />
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
              Public URL: /post/your-slug — leave blank to generate from the title. Letters, numbers, and hyphens only.
            </p>
          </div>
          <div>
            <label htmlFor="bodyMarkdown" className={labelClass}>
              Article body (Markdown, optional)
            </label>
            <textarea
              id="bodyMarkdown"
              name="bodyMarkdown"
              rows={12}
              value={form.bodyMarkdown}
              onChange={handleChange}
              className={inputClass}
              placeholder="Paste Markdown here if you are not using a hosted .md URL above..."
            />
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
              Used when &quot;Content (MD file URL)&quot; is empty. If both are set, the URL is fetched first.
            </p>
          </div>
        </section>
        )}

        {activeTab === "author" && (
        <section className={`rounded-2xl ${admin.card} p-6 space-y-4`}>
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-zinc-100">
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
            <label htmlFor="authorImage" className={labelClass}>Avatar image URL</label>
            <input
              id="authorImage"
              name="authorImage"
              type="text"
              inputMode="url"
              value={form.authorImage}
              onChange={handleChange}
              className={inputClass}
              placeholder="https://... or /first.jpeg (public folder)"
            />
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400 mb-2">
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
                  { id: "11", url: "/first.jpeg", label: "Mike" },
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
                      ? "border-purple-600 dark:border-violet-500 bg-purple-50 dark:bg-violet-500/15 ring-2 ring-purple-200 dark:ring-violet-500/30"
                      : "border-slate-200 dark:border-zinc-800 hover:border-purple-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <img
                    src={avatar.url}
                    alt={avatar.label}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <span className="text-xs font-medium text-slate-600 dark:text-zinc-200">
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
        )}

        {activeTab === "seo" && (
        <section className={`rounded-2xl ${admin.card} p-6 space-y-4`}>
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-zinc-100">
            SEO & metadata
          </h2>
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 p-4 bg-slate-50/80 dark:bg-zinc-800/80">
            <span className={labelClass}>Visibility</span>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, published: true }))}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left border-2 transition-all ${
                  form.published
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100"
                    : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-purple-300"
                }`}
              >
                <Globe className="h-5 w-5 shrink-0" />
                <span>
                  <span className="block font-bold">Published</span>
                  <span className="text-xs opacity-90">Live on the site &amp; in listings</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, published: false }))}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left border-2 transition-all ${
                  !form.published
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100"
                    : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-purple-300"
                }`}
              >
                <EyeOff className="h-5 w-5 shrink-0" />
                <span>
                  <span className="block font-bold">Hidden</span>
                  <span className="text-xs opacity-90">Draft — only visible in admin</span>
                </span>
              </button>
            </div>
          </div>
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
            <span className={labelClass}>Tags — add as many as you need</span>
            <div className="mt-2 flex flex-wrap gap-2 min-h-[2.5rem] p-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-lg bg-purple-100 dark:bg-zinc-800 text-purple-800 dark:text-violet-200 text-sm font-medium border border-transparent dark:border-violet-500/25"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="p-0.5 rounded-md hover:bg-purple-200/80 dark:hover:bg-zinc-700"
                    aria-label={`Remove ${tag}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              {form.tags.length === 0 && (
                <span className="text-sm text-slate-400 dark:text-zinc-500 self-center px-1">
                  No tags yet — add below
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTagLine();
                  }
                }}
                className={inputClass}
                placeholder="Type a tag, press Enter"
              />
              <button
                type="button"
                onClick={addTagLine}
                className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-semibold hover:bg-purple-100 dark:hover:bg-zinc-700"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
            <div className="mt-3">
              <label htmlFor="tagsBulk" className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                Bulk add (comma, semicolon, or newline)
              </label>
              <textarea
                id="tagsBulk"
                rows={2}
                className={`${inputClass} mt-1 font-mono text-sm`}
                placeholder="ETFs; index funds&#10;retirement"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    addTagsFromString(e.target.value);
                    e.target.value = "";
                  }
                }}
              />
            </div>
          </div>
        </section>
        )}

        {activeTab === "poll" && (
        <section className={`rounded-2xl ${admin.card} p-6 space-y-4`}>
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-zinc-100">
            Reader poll
          </h2>
          <PostPollEditor
            poll={form.poll}
            articleTitle={form.title}
            category={form.categories[0]}
            onChange={(poll) => setForm((prev) => ({ ...prev, poll }))}
          />
        </section>
        )}

        {activeTab === "quiz" && (
        <section className={`rounded-2xl ${admin.card} p-6 space-y-4`}>
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-zinc-100">
            Knowledge quiz
          </h2>
          <PostQuizEditor
            quiz={form.quiz}
            articleTitle={form.title}
            category={form.categories[0]}
            onChange={(quiz) => setForm((prev) => ({ ...prev, quiz }))}
          />
        </section>
        )}

        {activeTab === "placement" && (
        <section className={`rounded-2xl ${admin.card} p-6 space-y-4`}>
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-zinc-100">
            Feed placement
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
            Controls where this article appears on <strong>Home</strong>, <strong>/post</strong>, and{" "}
            <strong>article detail</strong> pages. Priority: Featured → Expert Pick → Trending → Guides → Latest.{" "}
            <a href="/admin/articles/placements" className="text-purple-600 dark:text-violet-400 font-semibold hover:underline">
              Full placement guide →
            </a>
          </p>
          <div>
            <span className={labelClass}>Editorial flags</span>
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
                  purple: "bg-purple-100 text-purple-700 dark:bg-violet-500/15 dark:text-violet-300",
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
                      isOn ? colorClass[colors[key]] : "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-500"
                    }`}
                  >
                    {labels[key]}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sticky bottom-0 py-4 bg-slate-50/90 dark:bg-zinc-950/95 backdrop-blur border-t border-slate-200 dark:border-zinc-800 -mx-2 px-2">
          <button
            type="submit"
            disabled={loading || !createFormComplete || pollBlocksSave(form)}
            title={
              mode === "create" && !createFormComplete
                ? "Complete all four tabs first"
                : pollBlocksSave(form)
                  ? "Fix poll or quiz settings"
                  : undefined
            }
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-accent-600 text-white font-bold hover:from-purple-700 hover:to-accent-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? (form.published ? "Create & publish" : "Create (hidden)") : "Save changes"}
          </button>
          {mode === "create" && !createFormComplete ? (
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Finish Content, Author, SEO, and Placement tabs to enable save.
            </p>
          ) : null}
          <Link
            href="/admin/articles"
            className="px-6 py-3 rounded-xl border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-medium hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
