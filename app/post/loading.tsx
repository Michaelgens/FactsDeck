function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800 ${className ?? ""}`} />;
}

export default function PostListLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero — matches PostListContent: clean border, no decorative gradients */}
      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between gap-4">
              <Pulse className="h-10 w-36 rounded-xl" />
              <Pulse className="h-5 w-24" />
            </div>
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <Pulse className="h-4 w-40" />
                <Pulse className="mt-3 h-12 w-full max-w-xl rounded-2xl sm:h-14" />
                <Pulse className="mt-4 h-5 w-full max-w-lg" />
              </div>
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <Pulse className="h-4 w-32" />
                  <Pulse className="mt-4 h-9 w-full rounded-lg" />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Pulse key={i} className="h-10 w-28 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky toolbar skeleton */}
      <section className="sticky top-16 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Pulse className="h-12 w-full max-w-md rounded-xl" />
            <div className="flex flex-wrap gap-2">
              <Pulse className="h-10 w-40 rounded-xl" />
              <Pulse className="h-10 w-32 rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <Pulse className="mb-8 h-4 w-56" />
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/90">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex flex-col gap-5 px-4 py-7 sm:flex-row sm:gap-8 sm:px-6">
                    <Pulse className="aspect-[5/3] w-full shrink-0 rounded-lg sm:w-48" />
                    <div className="min-w-0 flex-1 space-y-3">
                      <Pulse className="h-4 w-20 rounded-full" />
                      <Pulse className="h-6 w-full" />
                      <Pulse className="h-4 w-full" />
                      <Pulse className="h-4 w-2/3" />
                      <div className="flex gap-4 pt-2">
                        <Pulse className="h-8 w-8 rounded-full" />
                        <Pulse className="h-4 w-40" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-10 flex justify-center gap-2">
              <Pulse className="h-10 w-24 rounded-xl" />
              <Pulse className="h-10 w-10 rounded-xl" />
              <Pulse className="h-10 w-24 rounded-xl" />
            </div>
          </div>

          <aside className="space-y-8 lg:col-span-4">
            {[1, 2, 3, 4].map((panel) => (
              <div
                key={panel}
                className="border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
              >
                <Pulse className="h-6 w-48 border-b border-zinc-100 pb-3 dark:border-zinc-800" />
                <div className="mt-4 space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800/90">
                  {[1, 2, 3, 4, 5].map((row) => (
                    <div key={row} className="flex gap-3 py-3.5 first:pt-0">
                      <Pulse className="h-8 w-8 shrink-0 rounded-lg" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Pulse className="h-4 w-full" />
                        <Pulse className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}
