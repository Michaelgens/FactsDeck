"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileUp,
  FlaskConical,
  Loader2,
  Mail,
  UserPlus,
  Zap,
} from "lucide-react";
import type { EmailFunnelType } from "@/app/lib/email-funnel-types";
import type { PromotionTemplate } from "@/app/lib/promotion-campaign-types";
import type { WeeklyBriefTemplate } from "@/app/lib/weekly-brief-types";
import type { SubscriberImportReport, AdminTestSendReport } from "@/app/lib/email-test-types";
import { parseEmailList } from "@/app/lib/email-test-utils";
import {
  importAndSendAdminTestEmails,
  importSubscribersFromList,
  sendAdminTestEmails,
} from "@/app/lib/email-test-actions";
import { formatCount } from "@/app/lib/admin";
import { admin } from "../../components/admin-theme";
import { AdminPanel } from "../../components/admin-ui";

type Accent = "violet" | "purple" | "emerald";

const ACCENT_STYLES: Record<
  Accent,
  { btn: string; ring: string; badge: string; stat: string }
> = {
  violet: {
    btn: "bg-violet-600 hover:opacity-90 text-white",
    ring: "focus:ring-violet-500",
    badge: "bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300",
    stat: "text-violet-600 dark:text-violet-400",
  },
  purple: {
    btn: "bg-purple-600 dark:bg-violet-600 hover:opacity-90 text-white",
    ring: "focus:ring-purple-500",
    badge: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
    stat: "text-purple-600 dark:text-violet-400",
  },
  emerald: {
    btn: "bg-emerald-600 hover:opacity-90 text-white",
    ring: "focus:ring-emerald-500",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    stat: "text-emerald-600 dark:text-emerald-400",
  },
};

const TYPE_LABELS: Record<EmailFunnelType, string> = {
  welcome: "Welcome",
  promotion: "Promotion",
  "weekly-brief": "Weekly brief",
};

type Props = {
  emailType: EmailFunnelType;
  accent?: Accent;
  promotionTemplate?: PromotionTemplate;
  weeklyBriefTemplate?: WeeklyBriefTemplate;
};

export default function EmailTestLab({
  emailType,
  accent = "purple",
  promotionTemplate,
  weeklyBriefTemplate,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [inputMode, setInputMode] = useState<"paste" | "csv">("paste");
  const [raw, setRaw] = useState("");
  const [importing, setImporting] = useState(false);
  const [sending, setSending] = useState(false);
  const [combo, setCombo] = useState(false);
  const [importReport, setImportReport] = useState<SubscriberImportReport | null>(null);
  const [sendReport, setSendReport] = useState<AdminTestSendReport | null>(null);

  const styles = ACCENT_STYLES[accent];
  const parsed = useMemo(() => parseEmailList(raw), [raw]);
  const label = TYPE_LABELS[emailType];

  function handleCsvFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRaw(String(reader.result || ""));
      setInputMode("paste");
    };
    reader.readAsText(file);
  }

  async function runImport() {
    setImporting(true);
    setImportReport(null);
    setSendReport(null);
    const res = await importSubscribersFromList(raw);
    setImportReport(res);
    setImporting(false);
  }

  async function runSend() {
    setSending(true);
    setSendReport(null);
    const res = await sendAdminTestEmails(emailType, raw, {
      promotionTemplate,
      weeklyBriefTemplate,
    });
    setSendReport(res);
    setSending(false);
  }

  async function runImportAndSend() {
    setCombo(true);
    setImportReport(null);
    setSendReport(null);
    const res = await importAndSendAdminTestEmails(emailType, raw, {
      promotionTemplate,
      weeklyBriefTemplate,
    });
    setImportReport(res.import);
    setSendReport(res.send);
    setCombo(false);
  }

  const busy = importing || sending || combo;

  return (
    <AdminPanel
      title="Test lab"
      description={`Paste emails to verify ${label.toLowerCase()} delivery and optionally add new subscribers`}
      action={
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles.badge}`}
        >
          <FlaskConical className="h-3.5 w-3.5" />
          Max 25 test sends / run
        </span>
      }
    >
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setInputMode("paste")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            inputMode === "paste" ? styles.btn : `border ${admin.divide} ${admin.subtle}`
          }`}
        >
          Comma or line list
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${admin.divide} ${admin.subtle} hover:bg-slate-50 dark:hover:bg-zinc-800`}
        >
          <FileUp className="h-3.5 w-3.5" />
          Upload CSV
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt,text/csv,text/plain"
          className="hidden"
          onChange={(e) => handleCsvFile(e.target.files?.[0])}
        />
      </div>

      <textarea
        rows={4}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder="you@company.com, editor@test.com&#10;reviewer@example.org"
        className={`w-full rounded-xl px-4 py-3 text-sm font-mono ${admin.input} focus:ring-2 ${styles.ring}`}
      />

      {parsed.valid.length > 0 || parsed.invalid.length > 0 ? (
        <div className={`mt-3 flex flex-wrap gap-3 text-xs ${admin.subtle}`}>
          <span>
            <strong className={styles.stat}>{formatCount(parsed.valid.length)}</strong> valid
          </span>
          {parsed.duplicateInInput > 0 ? (
            <span>
              <strong>{formatCount(parsed.duplicateInInput)}</strong> duplicate in paste (collapsed)
            </span>
          ) : null}
          {parsed.invalid.length > 0 ? (
            <span className="text-amber-600 dark:text-amber-400">
              <strong>{formatCount(parsed.invalid.length)}</strong> invalid
            </span>
          ) : null}
        </div>
      ) : null}

      {parsed.valid.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {parsed.valid.slice(0, 6).map((e) => (
            <span
              key={e}
              className={`inline-block max-w-[200px] truncate rounded-md px-2 py-0.5 text-xs font-mono ${styles.badge}`}
            >
              {e}
            </span>
          ))}
          {parsed.valid.length > 6 ? (
            <span className={`text-xs py-0.5 ${admin.subtle}`}>+{parsed.valid.length - 6} more</span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || parsed.valid.length === 0}
          onClick={runSend}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 ${styles.btn}`}
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          Send {label} test
        </button>
        <button
          type="button"
          disabled={busy || parsed.valid.length === 0}
          onClick={runImport}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border disabled:opacity-50 ${admin.divide} hover:bg-slate-50 dark:hover:bg-zinc-800`}
        >
          {importing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          Add to subscribers
        </button>
        <button
          type="button"
          disabled={busy || parsed.valid.length === 0}
          onClick={runImportAndSend}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border disabled:opacity-50 border-dashed ${admin.divide} hover:bg-slate-50 dark:hover:bg-zinc-800`}
        >
          {combo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          Import &amp; send
        </button>
      </div>

      <p className={`mt-3 text-xs ${admin.subtle}`}>
        <strong>Add to subscribers</strong> only inserts emails not already in Supabase (unique per
        address). Duplicates in the database are reported, never re-inserted.
      </p>

      {importReport ? <ImportReportCard report={importReport} accent={accent} /> : null}
      {sendReport ? <SendReportCard report={sendReport} label={label} /> : null}
    </AdminPanel>
  );
}

function ImportReportCard({
  report,
  accent,
}: {
  report: SubscriberImportReport;
  accent: Accent;
}) {
  const statColor = ACCENT_STYLES[accent].stat;

  return (
    <div
      className={`mt-5 rounded-xl border p-4 ${
        report.ok
          ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/25"
          : "border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/25"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        {report.ok ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        ) : (
          <AlertCircle className="h-5 w-5 text-amber-600" />
        )}
        <p className={`font-semibold text-sm ${admin.heading}`}>Subscriber import report</p>
      </div>

      {report.error ? <p className="text-sm text-red-700 dark:text-red-300 mb-3">{report.error}</p> : null}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="Parsed tokens" value={report.parsedTokens} />
        <StatBox label="Valid emails" value={report.validCount} highlight={statColor} />
        <StatBox
          label="Newly added"
          value={report.newlyAdded}
          highlight="text-emerald-600 dark:text-emerald-400"
        />
        <StatBox
          label="Already subscribed"
          value={report.alreadySubscribed}
          highlight="text-amber-600 dark:text-amber-400"
        />
        <StatBox label="Dupes in paste" value={report.duplicateInInput} />
        <StatBox label="Invalid format" value={report.invalidCount} />
      </div>

      {report.duplicateEmails.length > 0 ? (
        <div className="mt-3">
          <p className={`text-xs font-semibold mb-1 ${admin.label}`}>
            Skipped — already in Supabase ({report.alreadySubscribed})
          </p>
          <p className={`text-xs font-mono break-all ${admin.subtle}`}>
            {report.duplicateEmails.join(", ")}
            {report.alreadySubscribed > report.duplicateEmails.length
              ? ` … +${report.alreadySubscribed - report.duplicateEmails.length} more`
              : ""}
          </p>
        </div>
      ) : report.ok && report.newlyAdded === 0 && report.validCount > 0 ? (
        <p className={`mt-3 text-xs ${admin.subtle}`}>
          All valid addresses were already subscribers — nothing new to insert.
        </p>
      ) : null}

      {report.addedEmails.length > 0 ? (
        <div className="mt-3">
          <p className={`text-xs font-semibold mb-1 ${admin.label}`}>Newly added</p>
          <p className={`text-xs font-mono break-all ${admin.subtle}`}>
            {report.addedEmails.join(", ")}
            {report.newlyAdded > report.addedEmails.length
              ? ` … +${report.newlyAdded - report.addedEmails.length} more`
              : ""}
          </p>
        </div>
      ) : null}

      {report.invalidSamples.length > 0 ? (
        <div className="mt-3">
          <p className={`text-xs font-semibold mb-1 ${admin.label}`}>Invalid samples</p>
          <p className={`text-xs font-mono ${admin.subtle}`}>{report.invalidSamples.join(", ")}</p>
        </div>
      ) : null}
    </div>
  );
}

function SendReportCard({ report, label }: { report: AdminTestSendReport; label: string }) {
  return (
    <div
      className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
        report.ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100"
          : "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100"
      }`}
    >
      {report.ok ? (
        <p>
          {label} test: <strong>{report.sent}</strong> delivered
          {report.failed > 0 ? (
            <>
              , <strong>{report.failed}</strong> failed
            </>
          ) : null}
          .
        </p>
      ) : null}
      {report.error ? <p>{report.error}</p> : null}
      {report.failures.length > 0 ? (
        <ul className="mt-2 text-xs font-mono list-disc pl-4 space-y-0.5">
          {report.failures.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function StatBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: string;
}) {
  return (
    <div className={`rounded-lg border px-3 py-2 ${admin.divide} bg-white/50 dark:bg-zinc-900/50`}>
      <p className={`text-[10px] font-bold uppercase tracking-wider ${admin.subtle}`}>{label}</p>
      <p className={`text-lg font-bold tabular-nums ${highlight || admin.heading}`}>{value}</p>
    </div>
  );
}
