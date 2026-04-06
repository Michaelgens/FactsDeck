import type { Post } from "./types";

/** Whether a post is tagged with a given category name */
export function postHasCategory(post: Post, categoryName: string): boolean {
  const list = post.categories?.length ? post.categories : ["General"];
  return list.includes(categoryName);
}

/** Title, excerpt, categories, and tags — for list search */
export function postMatchesSearch(post: Post, term: string): boolean {
  if (!term.trim()) return true;
  const q = term.toLowerCase();
  const hay = [post.title, post.excerpt, ...(post.categories ?? []), ...(post.tags ?? [])]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

/** Non-empty category list for display (any object with categories[]) */
export function categoriesLabelList(categories: string[] | undefined | null): string[] {
  const c = categories?.map((x) => String(x).trim()).filter(Boolean);
  return c?.length ? c : ["General"];
}

export function categoryLabelList(post: Post): string[] {
  return categoriesLabelList(post.categories);
}

type PillsProps = {
  categories: string[];
  variant?: "overlay" | "inline" | "muted";
  className?: string;
  max?: number;
};

/** Compact category chips for cards and article headers */
export function CategoryPills({ categories, variant = "inline", className = "", max }: PillsProps) {
  const list = categories.filter(Boolean);
  const show = max != null ? list.slice(0, max) : list;
  const rest = max != null && list.length > max ? list.length - max : 0;

  const base =
    variant === "overlay"
      ? "bg-zinc-900/95 text-white border border-white/20"
      : variant === "muted"
        ? "bg-zinc-100 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-100"
        : "bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100";

  return (
    <span className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {show.map((c) => (
        <span
          key={c}
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${base}`}
        >
          {c}
        </span>
      ))}
      {rest > 0 && (
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">+{rest}</span>
      )}
    </span>
  );
}
