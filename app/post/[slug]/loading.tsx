function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800 ${className ?? ""}`} />;
}

export default function PostLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero — matches PostPageView / PostListContent (no mesh gradients) */}
      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Pulse className="h-10 w-40 rounded-full" />
              <Pulse className="h-5 w-44" />
            </div>
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-7">
                <Pulse className="h-4 w-36" />
                <Pulse className="h-4 w-48" />
                <Pulse className="h-12 w-full max-w-3xl rounded-2xl sm:h-14" />
                <Pulse className="h-5 w-full max-w-2xl" />
                <div className="flex gap-2">
                  <Pulse className="h-7 w-20 rounded-full" />
                  <Pulse className="h-7 w-24 rounded-full" />
                </div>
                <div className="flex flex-wrap items-center gap-4 border-t border-zinc-100 pt-6 dark:border-zinc-800/90">
                  <Pulse className="h-14 w-14 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Pulse className="h-4 w-36" />
                    <Pulse className="h-3 w-52" />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <Pulse className="aspect-[16/10] w-full rounded-xl lg:min-h-[260px]" />
                  <Pulse className="mx-auto mt-3 h-3 w-48" />
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

      <section className="sticky top-16 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Pulse className="h-12 w-full max-w-md rounded-xl" />
            <Pulse className="h-5 w-32" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 space-y-8 lg:col-span-8">
            <Pulse className="h-24 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800" />
            <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:p-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="space-y-2">
                  <div
                    className="h-4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"
                    style={{ width: i % 3 === 0 ? "85%" : "100%" }}
                  />
                  <div
                    className="h-4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"
                    style={{ width: i % 2 === 0 ? "95%" : "100%" }}
                  />
                  <div className="h-4 w-[70%] animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-200 pt-10 dark:border-zinc-800">
              <Pulse className="mb-6 h-8 w-56" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <Pulse className="h-36 w-full rounded-none sm:h-40" />
                    <div className="space-y-2 p-4">
                      <Pulse className="h-3 w-24" />
                      <Pulse className="h-4 w-full" />
                      <Pulse className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-8 lg:col-span-4">
            {[1, 2, 3, 4, 5].map((panel) => (
              <div
                key={panel}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
              >
                <Pulse className="h-6 w-48 border-b border-zinc-100 pb-3 dark:border-zinc-800" />
                <div className="mt-4 space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800/90">
                  {[1, 2, 3, 4, 5].map((row) => (
                    <div key={row} className="flex gap-3 py-3.5 first:pt-0">
                      <Pulse className="h-8 w-8 shrink-0 rounded-lg" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Pulse className="h-4 w-full" />
                        <Pulse className="h-3 w-20" />
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
