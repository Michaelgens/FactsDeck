import { Suspense } from "react";
import UnsubscribeForm from "./UnsubscribeForm";

type SearchParams = Promise<{ email?: string }>;

async function UnsubscribeContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const initialEmail = typeof params.email === "string" ? decodeURIComponent(params.email).trim() : "";
  return <UnsubscribeForm initialEmail={initialEmail} />;
}

export default function UnsubscribePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
          Loading…
        </div>
      }
    >
      <UnsubscribeContent searchParams={searchParams} />
    </Suspense>
  );
}
