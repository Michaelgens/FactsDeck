import { admin } from "./components/admin-theme";

export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className={`h-9 w-48 rounded-xl ${admin.inset}`} />
        <div className={`h-5 w-72 mt-3 rounded-lg ${admin.muted}`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`rounded-2xl ${admin.card} p-6`}>
            <div className={`h-4 w-24 rounded ${admin.inset}`} />
            <div className={`h-8 w-16 mt-4 rounded ${admin.inset}`} />
            <div className={`h-12 w-12 mt-4 ml-auto rounded-xl ${admin.muted}`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`rounded-2xl ${admin.card} p-6`}>
          <div className={`h-6 w-40 rounded mb-6 ${admin.inset}`} />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <div className={`h-10 w-10 rounded-lg shrink-0 ${admin.inset}`} />
                <div className="flex-1 space-y-2">
                  <div className={`h-4 w-3/4 rounded ${admin.inset}`} />
                  <div className={`h-3 w-20 rounded ${admin.muted}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl ${admin.card} p-6`}>
          <div className={`h-6 w-32 mb-6 rounded ${admin.inset}`} />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className={`h-14 w-full rounded-xl ${admin.muted}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
