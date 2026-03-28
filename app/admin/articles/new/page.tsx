import PostForm from "../PostForm";

export default function AdminNewArticlePage() {
  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-dark-100 mb-2">
        New Article
      </h1>
      <p className="text-slate-600 dark:text-purple-300 mb-8">
        Create a new article. Content and metadata are stored in Supabase.
      </p>
      <PostForm mode="create" />
    </div>
  );
}
