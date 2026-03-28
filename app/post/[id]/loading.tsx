export default function PostLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-dark-950 dark:to-dark-900">
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-accent-800 dark:from-dark-900 dark:via-purple-900 dark:to-accent-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent dark:from-black/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          <div className="h-11 w-40 bg-white/20 rounded-xl mb-6 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex gap-4">
                <div className="h-6 w-20 bg-white/20 rounded-full animate-pulse" />
                <div className="h-6 w-24 bg-white/20 rounded animate-pulse" />
                <div className="h-6 w-16 bg-white/20 rounded animate-pulse" />
              </div>
              <div className="h-10 md:h-14 lg:h-16 w-full max-w-2xl bg-white/20 rounded-2xl animate-pulse" />
              <div className="h-5 w-full max-w-xl bg-white/20 rounded animate-pulse" />
              <div className="flex items-center gap-4 pt-4">
                <div className="h-14 w-14 rounded-full bg-white/20 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
                  <div className="h-3 w-40 bg-white/20 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex gap-6 pt-2">
                <div className="h-4 w-16 bg-white/20 rounded animate-pulse" />
                <div className="h-4 w-16 bg-white/20 rounded animate-pulse" />
                <div className="h-4 w-16 bg-white/20 rounded animate-pulse" />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="h-48 md:h-64 lg:h-80 bg-white/20 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <article className="prose prose-slate dark:prose-invert max-w-none">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="space-y-2">
                    <div
                      className="h-4 bg-slate-200 dark:bg-dark-800 rounded animate-pulse"
                      style={{ width: i % 3 === 0 ? "85%" : "100%" }}
                    />
                    <div
                      className="h-4 bg-slate-200 dark:bg-dark-800 rounded animate-pulse"
                      style={{ width: i % 2 === 0 ? "95%" : "100%" }}
                    />
                    <div
                      className="h-4 bg-slate-200 dark:bg-dark-800 rounded animate-pulse"
                      style={{ width: "70%" }}
                    />
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-dark-900/50 rounded-xl p-6 border border-slate-200 dark:border-purple-500/30">
              <div className="h-6 w-36 bg-slate-200 dark:bg-dark-800 rounded mb-4 animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-dark-800 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 w-full bg-slate-200 dark:bg-dark-800 rounded animate-pulse" />
                      <div className="h-3 w-20 bg-slate-200 dark:bg-dark-800 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-dark-900/50 rounded-xl p-6 border border-slate-200 dark:border-purple-500/30">
              <div className="h-6 w-28 bg-slate-200 dark:bg-dark-800 rounded mb-4 animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-slate-200 dark:bg-dark-800 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-dark-900/50 rounded-xl p-6 border border-slate-200 dark:border-purple-500/30">
              <div className="h-6 w-32 bg-slate-200 dark:bg-dark-800 rounded mb-4 animate-pulse" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-slate-200 dark:bg-dark-800 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
