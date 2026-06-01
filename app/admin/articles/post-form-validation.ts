import type { PostFormData } from "../../lib/admin-actions";
import { validatePollForAdmin } from "../../lib/poll-types";

export type ArticleFormTab = "content" | "author" | "seo" | "placement" | "poll";

export function validateContentTab(form: PostFormData): string[] {
  const errors: string[] = [];
  if (!form.title.trim()) errors.push("Title is required");
  if (!form.excerpt.trim()) errors.push("Excerpt is required");
  if (!form.categories.length) errors.push("Select at least one category");
  if (!form.imageUrl.trim()) errors.push("Cover image URL is required");
  if (!form.contentUrl.trim() && !(form.bodyMarkdown ?? "").trim()) {
    errors.push("Add article body Markdown or a hosted .md URL");
  }
  return errors;
}

export function validateAuthorTab(form: PostFormData): string[] {
  const errors: string[] = [];
  if (!form.authorName.trim()) errors.push("Author name is required");
  if (!form.authorTitle.trim()) errors.push("Author title is required");
  if (!form.authorImage.trim()) errors.push("Author avatar URL is required");
  if (!(form.authorBio ?? "").trim()) errors.push("Author bio is required");
  return errors;
}

export function validateSeoTab(form: PostFormData): string[] {
  const errors: string[] = [];
  if (!form.readTime.trim()) errors.push("Read time is required (e.g. 5 min read)");
  if (!form.tags.length) errors.push("Add at least one tag");
  return errors;
}

export function validatePlacementTab(visited: boolean): string[] {
  if (!visited) return ["Open the Placement tab and confirm feed flags (all off is OK)"];
  return [];
}

export function validatePollTab(form: PostFormData): string[] {
  return validatePollForAdmin(form.poll ?? null);
}

export function getTabValidation(
  form: PostFormData,
  visitedTabs: Set<ArticleFormTab>
): Record<ArticleFormTab, string[]> {
  return {
    content: validateContentTab(form),
    author: validateAuthorTab(form),
    seo: validateSeoTab(form),
    placement: validatePlacementTab(visitedTabs.has("placement")),
    poll: validatePollTab(form),
  };
}

export function isCreateFormComplete(
  form: PostFormData,
  visitedTabs: Set<ArticleFormTab>
): boolean {
  const v = getTabValidation(form, visitedTabs);
  return (["content", "author", "seo", "placement"] as const).every((t) => v[t].length === 0);
}

/** Poll errors block save when enabled but misconfigured */
export function pollBlocksSave(form: PostFormData): boolean {
  return validatePollTab(form).length > 0;
}
