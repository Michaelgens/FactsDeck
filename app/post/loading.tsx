export default function PostListLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-950">
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-amber-800 dark:from-dark-900 dark:via-dark-850 dark:to-dark-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="h-10 w-48 bg-white/20 rounded-xl mb-6 animate-pulse" />
          <div className="text-center max-w-4xl mx-auto">
            <div className="h-4 w-56 bg-white/20 rounded mx-auto mb-6 animate-pulse" />
            <div className="h-12 sm:h-14 md:h-16 bg-white/20 rounded-2xl max-w-2xl mx-auto mb-6 animate-pulse" />
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-24 bg-white/20 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-dark-900/50 border-b border-slate-200 dark:border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 max-w-md h-12 bg-slate-200 dark:bg-dark-800 rounded-xl animate-pulse" />
            <div className="flex gap-2">
              <div className="h-10 w-36 bg-slate-200 dark:bg-dark-800 rounded-xl animate-pulse" />
              <div className="h-10 w-28 bg-slate-200 dark:bg-dark-800 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="h-5 w-48 bg-slate-200 dark:bg-dark-800 rounded mb-6 animate-pulse" />
            <div className="space-y-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-dark-900/50 rounded-xl border border-slate-200 dark:border-purple-500/30 flex flex-col md:flex-row overflow-hidden"
                >
                  <div className="md:w-1/3 h-48 md:min-h-[200px] bg-slate-200 dark:bg-dark-800 animate-pulse" />
                  <div className="md:w-2/3 p-6 space-y-3">
                    <div className="h-6 w-20 bg-slate-200 dark:bg-dark-800 rounded-full animate-pulse" />
                    <div className="h-6 w-full bg-slate-200 dark:bg-dark-800 rounded animate-pulse" />
                    <div className="h-4 w-[80%] bg-slate-200 dark:bg-dark-800 rounded animate-pulse" />
                    <div className="flex items-center gap-4 pt-2">
                      <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-dark-800 animate-pulse" />
                      <div className="h-4 w-32 bg-slate-200 dark:bg-dark-800 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-dark-900/50 rounded-xl p-6 border border-slate-200 dark:border-purple-500/30">
              <div className="h-6 w-40 bg-slate-200 dark:bg-dark-800 rounded mb-4 animate-pulse" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex gap-3 p-3">
                    <div className="h-9 w-9 rounded-lg bg-slate-200 dark:bg-dark-800 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 w-full bg-slate-200 dark:bg-dark-800 rounded animate-pulse" />
                      <div className="h-3 w-12 bg-slate-200 dark:bg-dark-800 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-dark-900/50 rounded-xl p-6 border border-slate-200 dark:border-purple-500/30">
              <div className="h-6 w-32 bg-slate-200 dark:bg-dark-800 rounded mb-4 animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-slate-200 dark:bg-dark-800 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
