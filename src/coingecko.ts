import { resolveCoinGeckoId } from "./types.js";

const BASE_URL = "https://api.coingecko.com/api/v3";
const MAX_RETRIES = 3;

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      if (attempt === retries - 1) throw err;
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("unreachable");
}

export interface PriceResult {
  ticker: string;
  coinGeckoId: string;
  usd: number;
  usd24hChange?: number;
}

export async function getPrice(ticker: string): Promise<PriceResult | null> {
  const cgId = resolveCoinGeckoId(ticker);
  if (!cgId) return null;

  try {
    const url = `${BASE_URL}/simple/price?ids=${cgId}&vs_currencies=usd&include_24hr_change=true`;
    const res = await fetchWithRetry(url);
    const data = await res.json() as Record<string, { usd?: number; usd_24h_change?: number }>;
    const coin = data[cgId];
    if (!coin || typeof coin.usd !== "number") return null;

    return {
      ticker: ticker.toUpperCase(),
      coinGeckoId: cgId,
      usd: coin.usd,
      usd24hChange: coin.usd_24h_change,
    };
  } catch {
    return null;
  }
}

export async function getPrices(
  tickers: string[],
): Promise<Map<string, PriceResult>> {
  const results = new Map<string, PriceResult>();
  const ids = tickers
    .map((t) => ({ ticker: t, id: resolveCoinGeckoId(t) }))
    .filter((x): x is { ticker: string; id: string } => x.id !== null);

  if (ids.length === 0) return results;

  const idList = ids.map((x) => x.id).join(",");
  try {
    const url = `${BASE_URL}/simple/price?ids=${idList}&vs_currencies=usd&include_24hr_change=true`;
    const res = await fetchWithRetry(url);
    const data = await res.json() as Record<string, { usd?: number; usd_24h_change?: number }>;

    for (const { ticker, id } of ids) {
      const coin = data[id];
      if (coin && typeof coin.usd === "number") {
        results.set(ticker.toUpperCase(), {
          ticker: ticker.toUpperCase(),
          coinGeckoId: id,
          usd: coin.usd,
          usd24hChange: coin.usd_24h_change,
        });
      }
    }
  } catch {
    // Return empty on failure — callers handle gracefully
  }

  return results;
}

export function isUnknownTicker(ticker: string): boolean {
  return resolveCoinGeckoId(ticker) === null;
}

export function formatPrice(price: number): string {
  if (price >= 1) {
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (price >= 0.01) {
    return `$${price.toFixed(4)}`;
  }
  return `$${price.toFixed(8)}`;
}

export function formatChange(change?: number): string {
  if (change === undefined || change === null) return "";
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}
