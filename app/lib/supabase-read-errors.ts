/** Logging + messages for Supabase read failures (network, PostgREST, etc.) */

export function logSupabaseReadError(context: string, err: unknown) {
  const message =
    err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string"
      ? (err as { message: string }).message
      : err instanceof Error
        ? err.message
        : String(err ?? "unknown");
  const code =
    err && typeof err === "object" && "code" in err && (err as { code?: string }).code != null
      ? String((err as { code?: string }).code)
      : "";
  const lower = `${message} ${code}`.toLowerCase();
  const isLikelyNetwork =
    /fetch failed|network|econnrefused|enotfound|etimedout|socket|aborted|getaddrinfo/.test(lower);
  const logFn = isLikelyNetwork ? console.warn : console.error;
  logFn(
    `[${context}]`,
    message.trim() || "(empty message)",
    code ? `code=${code}` : "",
    isLikelyNetwork
      ? "— Check NEXT_PUBLIC_SUPABASE_URL, network/VPN, firewall, and your Supabase project status."
      : ""
  );
}

export function readErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  if (err instanceof Error) return err.message;
  return String(err ?? "Unknown error");
}
