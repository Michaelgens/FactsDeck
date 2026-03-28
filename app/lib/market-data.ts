/**
 * Live market data via Finnhub (free tier: 60 calls/min).
 * Get your free API key at https://finnhub.io/register
 * Set FINNHUB_API_KEY in .env
 */

export type MarketDataItem = {
  symbol: string;
  value: string;
  change: string;
  positive: boolean;
};

const SYMBOLS: { finnhub: string; label: string; prefix?: string }[] = [
  { finnhub: "SPY", label: "S&P 500" },
  { finnhub: "QQQ", label: "NASDAQ" },
  { finnhub: "DIA", label: "DOW" },
  { finnhub: "BINANCE:BTCUSDT", label: "Bitcoin", prefix: "$" },
  { finnhub: "OANDA:XAUUSD", label: "Gold", prefix: "$" },
  { finnhub: "USO", label: "Oil", prefix: "$" },
];

type FinnhubQuote = {
  c: number;  // current
  d: number;  // change
  dp: number; // percent change
  pc: number; // previous close
  t: number;  // timestamp (Unix)
};

const REVALIDATE_SECONDS = 300; // 5 min cache - data stays < 24h

async function fetchQuote(
  symbol: string,
  token: string
): Promise<FinnhubQuote | null> {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`;
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as FinnhubQuote;
  if (data.c == null || data.c === 0) return null;
  return data;
}

function formatValue(val: number, prefix = ""): string {
  if (val >= 1000) {
    return `${prefix}${val.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  }
  return `${prefix}${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export async function getMarketData(): Promise<MarketDataItem[] | null> {
  const token = process.env.FINNHUB_API_KEY;
  if (!token?.trim()) return null;

  const results: MarketDataItem[] = [];
  for (const { finnhub, label, prefix = "" } of SYMBOLS) {
    const quote = await fetchQuote(finnhub, token);
    if (!quote) continue;
    const dp = quote.dp ?? 0;
    const change = `${dp >= 0 ? "+" : ""}${dp.toFixed(2)}%`;
    results.push({
      symbol: label,
      value: formatValue(quote.c, prefix),
      change,
      positive: dp >= 0,
    });
  }
  return results.length > 0 ? results : null;
}
