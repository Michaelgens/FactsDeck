export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-950">
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-amber-800 dark:from-dark-900 dark:via-dark-850 dark:to-dark-900 text-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="h-5 w-24 bg-white/20 rounded-full mx-auto mb-6 animate-pulse" />
            <div className="h-14 sm:h-20 md:h-24 bg-white/20 rounded-2xl mb-4 sm:mb-6 max-w-2xl mx-auto animate-pulse" />
            <div className="h-6 bg-white/20 rounded-lg max-w-xl mx-auto mb-8 animate-pulse" />
            <div className="flex justify-center gap-4 mb-12">
              <div className="h-12 w-40 bg-white/20 rounded-2xl animate-pulse" />
              <div className="h-12 w-40 bg-white/20 rounded-2xl animate-pulse" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-white/20 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="lg:col-span-3 space-y-10">
            <section>
              <div className="flex justify-between mb-6">
                <div className="h-8 w-48 bg-slate-200 dark:bg-dark-800 rounded-lg animate-pulse" />
                <div className="h-6 w-20 bg-slate-200 dark:bg-dark-800 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white dark:bg-dark-900/50 rounded-2xl border border-slate-200 dark:border-purple-500/30 overflow-hidden">
                    <div className="h-48 bg-slate-200 dark:bg-dark-800 animate-pulse" />
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-dark-800 animate-pulse" />
                        <div className="space-y-1">
                          <div className="h-4 w-24 bg-slate-200 dark:bg-dark-800 rounded animate-pulse" />
                          <div className="h-3 w-20 bg-slate-200 dark:bg-dark-800 rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="h-5 w-full bg-slate-200 dark:bg-dark-800 rounded mb-3 animate-pulse" />
                      <div className="h-4 w-3/4 bg-slate-200 dark:bg-dark-800 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex justify-between mb-6">
                <div className="h-8 w-40 bg-slate-200 dark:bg-dark-800 rounded-lg animate-pulse" />
                <div className="h-10 w-32 bg-slate-200 dark:bg-dark-800 rounded-lg animate-pulse" />
              </div>
              <div className="space-y-4 md:space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-dark-900/50 rounded-2xl border border-slate-200 dark:border-purple-500/30 flex flex-col md:flex-row overflow-hidden"
                  >
                    <div className="md:w-1/3 h-48 md:min-h-[200px] bg-slate-200 dark:bg-dark-800 animate-pulse" />
                    <div className="md:w-2/3 p-6 space-y-3">
                      <div className="h-6 w-20 bg-slate-200 dark:bg-dark-800 rounded-full animate-pulse" />
                      <div className="h-6 w-full bg-slate-200 dark:bg-dark-800 rounded animate-pulse" />
                      <div className="h-4 w-4/5 bg-slate-200 dark:bg-dark-800 rounded animate-pulse" />
                      <div className="flex gap-4 pt-2">
                        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-dark-800 animate-pulse" />
                        <div className="space-y-1">
                          <div className="h-4 w-28 bg-slate-200 dark:bg-dark-800 rounded animate-pulse" />
                          <div className="h-3 w-20 bg-slate-200 dark:bg-dark-800 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-dark-900/50 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-purple-500/30">
              <div className="h-5 w-32 bg-slate-200 dark:bg-dark-800 rounded mb-6 animate-pulse" />
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-dark-800 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 w-full bg-slate-200 dark:bg-dark-800 rounded animate-pulse" />
                      <div className="h-3 w-16 bg-slate-200 dark:bg-dark-800 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-dark-900/50 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-purple-500/30">
              <div className="h-5 w-28 bg-slate-200 dark:bg-dark-800 rounded mb-6 animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
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
