/** Types and email body builders for mortgage summary emails (server + client payload). */

import { absoluteUrl } from "./seo";

export type MortgageSummaryPayload = {
  homePrice: number;
  downPercent: number;
  loanAmount: number;
  rate: number;
  termYears: number;
  monthlyPI: number;
  pitiFirstMonth: number;
  totalInterest: number;
  totalPmi: number;
  payoffMonths: number;
  ltv: number;
  extraMonthly: number;
  propertyTaxPercent: number;
  insuranceYearly: number;
  hoaMonthly: number;
  generatedAt: string;
};

const MAX = {
  homePrice: 500_000_000,
  loanAmount: 500_000_000,
  rate: 50,
  termYears: 50,
  money: 1e12,
  months: 1200,
  percent: 100,
};

function fmtMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtPct(n: number): string {
  return `${n.toFixed(2)}%`;
}

export function validateMortgageSummaryPayload(
  raw: unknown
): { ok: true; summary: MortgageSummaryPayload } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Invalid summary" };
  const o = raw as Record<string, unknown>;

  const num = (k: string, min: number, max: number): number | null => {
    const v = o[k];
    if (typeof v !== "number" || !Number.isFinite(v)) return null;
    if (v < min || v > max) return null;
    return v;
  };

  const homePrice = num("homePrice", 0, MAX.homePrice);
  const downPercent = num("downPercent", 0, MAX.percent);
  const loanAmount = num("loanAmount", 0, MAX.loanAmount);
  const rate = num("rate", 0, MAX.rate);
  const termYears = num("termYears", 1, MAX.termYears);
  const monthlyPI = num("monthlyPI", 0, MAX.money);
  const pitiFirstMonth = num("pitiFirstMonth", 0, MAX.money);
  const totalInterest = num("totalInterest", 0, MAX.money);
  const totalPmi = num("totalPmi", 0, MAX.money);
  const payoffMonths = num("payoffMonths", 1, MAX.months);
  const ltv = num("ltv", 0, 200);
  const extraMonthly = num("extraMonthly", 0, MAX.money);
  const propertyTaxPercent = num("propertyTaxPercent", 0, MAX.percent);
  const insuranceYearly = num("insuranceYearly", 0, MAX.money);
  const hoaMonthly = num("hoaMonthly", 0, MAX.money);

  const generatedAt = o.generatedAt;
  if (typeof generatedAt !== "string" || generatedAt.length > 40) {
    return { ok: false, error: "Invalid summary" };
  }
  const t = Date.parse(generatedAt);
  if (!Number.isFinite(t)) return { ok: false, error: "Invalid summary" };

  if (
    homePrice == null ||
    downPercent == null ||
    loanAmount == null ||
    rate == null ||
    termYears == null ||
    monthlyPI == null ||
    pitiFirstMonth == null ||
    totalInterest == null ||
    totalPmi == null ||
    payoffMonths == null ||
    ltv == null ||
    extraMonthly == null ||
    propertyTaxPercent == null ||
    insuranceYearly == null ||
    hoaMonthly == null
  ) {
    return { ok: false, error: "Invalid summary" };
  }

  return {
    ok: true,
    summary: {
      homePrice,
      downPercent,
      loanAmount,
      rate,
      termYears,
      monthlyPI,
      pitiFirstMonth,
      totalInterest,
      totalPmi,
      payoffMonths,
      ltv,
      extraMonthly,
      propertyTaxPercent,
      insuranceYearly,
      hoaMonthly,
      generatedAt,
    },
  };
}

export function buildMortgageSummaryPlainText(summary: MortgageSummaryPayload): string {
  const lines = [
    "Facts Deck — Mortgage calculation summary",
    "",
    `Generated: ${summary.generatedAt}`,
    "",
    "Inputs",
    `  Home price: ${fmtMoney(summary.homePrice)}`,
    `  Down payment: ${summary.downPercent.toFixed(2)}%`,
    `  Loan amount: ${fmtMoney(summary.loanAmount)}`,
    `  Interest rate: ${fmtPct(summary.rate)}`,
    `  Term: ${summary.termYears} years`,
    `  Property tax (annual % of value): ${fmtPct(summary.propertyTaxPercent)}`,
    `  Homeowners insurance (yearly): ${fmtMoney(summary.insuranceYearly)}`,
    `  HOA (monthly): ${fmtMoney(summary.hoaMonthly)}`,
    `  Extra principal (monthly): ${fmtMoney(summary.extraMonthly)}`,
    "",
    "Results (estimates)",
    `  LTV: ${summary.ltv.toFixed(2)}%`,
    `  Principal & interest (monthly): ${fmtMoney(summary.monthlyPI)}`,
    `  PITI (first month, incl. escrow & PMI if applicable): ${fmtMoney(summary.pitiFirstMonth)}`,
    `  Total interest (scheduled): ${fmtMoney(summary.totalInterest)}`,
    `  Total PMI (scheduled): ${fmtMoney(summary.totalPmi)}`,
    `  Payoff: ${summary.payoffMonths} months`,
    "",
    "Educational estimates only — not financial, tax, or legal advice.",
    absoluteUrl("/tools/mortgage-calculator"),
  ];
  return lines.join("\n");
}

export function buildMortgageSummaryHtml(summary: MortgageSummaryPayload): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;color:#475569;">${esc(label)}</td><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#0f172a;">${esc(value)}</td></tr>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#334155;background:#f8fafc;padding:24px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;border:1px solid #e2e8f0;">
    <h1 style="font-size:18px;margin:0 0 16px;color:#7c3aed;">Facts Deck — Mortgage summary</h1>
    <p style="font-size:13px;color:#64748b;margin:0 0 16px;">Generated ${esc(summary.generatedAt)}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${row("Home price", fmtMoney(summary.homePrice))}
      ${row("Down payment", `${summary.downPercent.toFixed(2)}%`)}
      ${row("Loan amount", fmtMoney(summary.loanAmount))}
      ${row("Rate", fmtPct(summary.rate))}
      ${row("Term", `${summary.termYears} years`)}
      ${row("LTV", `${summary.ltv.toFixed(2)}%`)}
      ${row("P&I (monthly)", fmtMoney(summary.monthlyPI))}
      ${row("PITI (1st month)", fmtMoney(summary.pitiFirstMonth))}
      ${row("Total interest", fmtMoney(summary.totalInterest))}
      ${row("Total PMI", fmtMoney(summary.totalPmi))}
      ${row("Payoff", `${summary.payoffMonths} months`)}
    </table>
    <p style="font-size:12px;color:#94a3b8;margin-top:20px;">Educational estimates only — not financial, tax, or legal advice.</p>
    <p style="font-size:12px;"><a href="${esc(absoluteUrl("/tools/mortgage-calculator"))}" style="color:#7c3aed;">Open the calculator</a></p>
  </div>
</body></html>`;
}
