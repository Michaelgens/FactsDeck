function PulseBar({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800 ${className ?? ""}`} />;
}

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              <PulseBar className="mx-auto h-9 w-56 max-w-full sm:mx-0" />
              <PulseBar className="mt-6 h-4 w-16 sm:mx-0 mx-auto" />
              <PulseBar className="mt-3 h-12 w-full max-w-md sm:mx-0 mx-auto rounded-2xl" />
              <PulseBar className="mt-3 h-12 w-full max-w-lg sm:mx-0 mx-auto rounded-2xl" />
              <PulseBar className="mt-5 h-6 w-full max-w-xl sm:mx-0 mx-auto" />
              <PulseBar className="mt-2 h-6 w-full max-w-lg sm:mx-0 mx-auto" />
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-start justify-center">
                <PulseBar className="h-12 w-full max-w-[200px] rounded-xl sm:w-44" />
                <PulseBar className="h-12 w-full max-w-[200px] rounded-xl sm:w-40" />
                <PulseBar className="h-12 w-full max-w-[200px] rounded-xl sm:w-36" />
              </div>
              <PulseBar className="mt-10 h-3 w-40 sm:mx-0 mx-auto" />
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <PulseBar className="h-5 w-12" />
                    <PulseBar className="mt-2 h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl border border-orange-200/90 bg-orange-50 dark:border-emerald-800/70 dark:bg-emerald-950/50 sm:h-12 sm:w-12" />
                    <div className="space-y-2 text-left">
                      <PulseBar className="h-4 w-28" />
                      <PulseBar className="h-3 w-40" />
                    </div>
                  </div>
                  <PulseBar className="h-4 w-14" />
                </div>
                <div className="space-y-4 p-5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
                    >
                      <PulseBar className="h-5 w-24 rounded-full" />
                      <PulseBar className="mt-3 h-5 w-full" />
                      <PulseBar className="mt-2 h-5 w-4/5 max-w-md" />
                      <div className="mt-3 flex gap-3">
                        <PulseBar className="h-3 w-16" />
                        <PulseBar className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                  <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                      <PulseBar className="h-4 w-16" />
                      <PulseBar className="mt-3 h-3 w-full" />
                      <PulseBar className="mt-2 h-3 w-3/4" />
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                      <PulseBar className="h-4 w-14" />
                      <PulseBar className="mt-3 h-3 w-full" />
                      <PulseBar className="mt-2 h-3 w-3/4" />
                    </div>
                  </div>
                </div>
              </div>
              <PulseBar className="mt-4 h-3 w-full max-w-sm" />
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-t border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-3">
            <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-400/80" />
            <div className="hidden h-5 w-5 shrink-0 animate-pulse rounded bg-zinc-700 sm:block" />
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex gap-4 pr-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex shrink-0 items-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5"
                  >
                    <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-zinc-800/80" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-16 animate-pulse rounded bg-zinc-700/80" />
                      <div className="h-4 w-20 animate-pulse rounded bg-zinc-600/60" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
          <div className="space-y-10 lg:col-span-3">
            <section>
              <div className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                  <PulseBar className="h-3 w-12" />
                  <PulseBar className="h-8 w-48 max-w-full" />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <PulseBar className="h-10 w-full max-w-[180px] rounded-xl sm:w-44" />
                  <PulseBar className="h-5 w-20" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <PulseBar className="h-48 w-full rounded-none" />
                    <div className="p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <PulseBar className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <PulseBar className="h-4 w-24" />
                          <PulseBar className="h-3 w-20" />
                        </div>
                      </div>
                      <PulseBar className="mb-3 h-5 w-full" />
                      <PulseBar className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-6 space-y-2 md:mb-8">
                <PulseBar className="h-3 w-20" />
                <PulseBar className="h-8 w-56 max-w-full" />
              </div>
              <div className="mt-4 -mx-4 flex list-none gap-3 overflow-x-auto pb-3 pl-4 pr-4 sm:-mx-6 sm:gap-4 sm:pl-6 sm:pr-6 lg:mx-0 lg:px-0 [scrollbar-width:thin]">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="w-[min(11rem,calc(100vw-4rem))] shrink-0 sm:w-44"
                  >
                    <div className="h-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                      <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-xl border border-orange-200/90 bg-orange-50 dark:border-emerald-800/70 dark:bg-emerald-950/50" />
                      <PulseBar className="mx-auto h-5 w-24" />
                      <PulseBar className="mx-auto mt-2 h-4 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                  <PulseBar className="h-3 w-24" />
                  <PulseBar className="h-8 w-40 max-w-full" />
                </div>
                <PulseBar className="h-5 w-24" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <PulseBar className="h-12 w-12 rounded-full" />
                      <div className="space-y-1">
                        <PulseBar className="h-4 w-28" />
                        <PulseBar className="h-3 w-36" />
                      </div>
                    </div>
                    <PulseBar className="mb-3 h-6 w-full rounded-full" />
                    <PulseBar className="mb-3 h-5 w-full" />
                    <div className="flex justify-between">
                      <PulseBar className="h-4 w-20" />
                      <PulseBar className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                  <PulseBar className="h-3 w-28" />
                  <PulseBar className="h-8 w-48 max-w-full" />
                </div>
                <PulseBar className="h-5 w-24" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <PulseBar className="h-48 w-full rounded-none" />
                    <div className="p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <PulseBar className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <PulseBar className="h-4 w-24" />
                          <PulseBar className="h-3 w-28" />
                        </div>
                      </div>
                      <PulseBar className="mb-3 h-5 w-full" />
                      <div className="flex justify-between text-sm">
                        <PulseBar className="h-4 w-24" />
                        <PulseBar className="h-4 w-8" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6 sm:space-y-8 lg:col-span-1">
            {[1, 2, 3].map((panel) => (
              <div
                key={panel}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
              >
                <div className="mb-6 space-y-2">
                  <PulseBar className="h-3 w-24" />
                  <PulseBar className="h-6 w-36" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((row) => (
                    <div key={row} className="flex gap-3">
                      <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg border border-orange-200/90 bg-orange-50 dark:border-emerald-800/70 dark:bg-emerald-950/50" />
                      <div className="min-w-0 flex-1 space-y-1">
                        <PulseBar className="h-4 w-full" />
                        <PulseBar className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
                <PulseBar className="mx-auto mt-4 h-5 w-28" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
