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
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as FinnhubQuote;
    if (data.c == null || data.c === 0) return null;
    return data;
  } catch {
    return null;
  }
}

function formatValue(val: number, prefix = ""): string {
  if (val >= 1000) {
    return `${prefix}${val.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  }
  return `${prefix}${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export async function getMarketData(): Promise<MarketDataItem[] | null> {
  const token = process.env.FINNHUB_API_KEY?.trim();
  if (!token) return null;

  try {
    const quotes = await Promise.all(
      SYMBOLS.map(({ finnhub }) => fetchQuote(finnhub, token))
    );

    const results: MarketDataItem[] = [];
    for (let i = 0; i < SYMBOLS.length; i++) {
      const quote = quotes[i];
      if (!quote) continue;
      const { label, prefix = "" } = SYMBOLS[i];
      const dp = quote.dp ?? 0;
      results.push({
        symbol: label,
        value: formatValue(quote.c, prefix),
        change: `${dp >= 0 ? "+" : ""}${dp.toFixed(2)}%`,
        positive: dp >= 0,
      });
    }
    return results.length > 0 ? results : null;
  } catch {
    return null;
  }
}
