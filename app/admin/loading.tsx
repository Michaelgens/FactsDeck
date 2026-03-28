export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-9 w-48 bg-slate-200 dark:bg-dark-800 rounded-xl" />
        <div className="h-5 w-72 mt-3 bg-slate-100 dark:bg-dark-800/80 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-white dark:bg-dark-800/50 border border-slate-200 dark:border-purple-500/30 p-6"
          >
            <div className="h-4 w-24 bg-slate-200 dark:bg-dark-700 rounded" />
            <div className="h-8 w-16 mt-4 bg-slate-200 dark:bg-dark-700 rounded" />
            <div className="h-12 w-12 mt-4 ml-auto bg-slate-100 dark:bg-dark-700 rounded-xl" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white dark:bg-dark-800/50 border border-slate-200 dark:border-purple-500/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 w-40 bg-slate-200 dark:bg-dark-700 rounded" />
            <div className="h-4 w-16 bg-slate-100 dark:bg-dark-700 rounded" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-dark-700 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-dark-700 rounded" />
                  <div className="h-3 w-20 bg-slate-100 dark:bg-dark-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-dark-800/50 border border-slate-200 dark:border-purple-500/30 p-6">
          <div className="h-6 w-32 mb-6 bg-slate-200 dark:bg-dark-700 rounded" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-14 w-full bg-slate-100 dark:bg-dark-700 rounded-xl"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
