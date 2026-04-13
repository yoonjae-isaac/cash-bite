import type { NewsItem } from '../../domain/news/types';

const NEWS_CACHE_KEY = 'cashbite-news-cache';
const NEWS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface NewsCache {
  items: NewsItem[];
  fetchedAt: number;
}

function loadCache(): NewsCache | null {
  try {
    const raw = localStorage.getItem(NEWS_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as NewsCache;
  } catch {
    return null;
  }
}

function saveCache(items: NewsItem[]): void {
  try {
    localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ items, fetchedAt: Date.now() }));
  } catch {
    // localStorage quota exceeded — ignore
  }
}

/** Returns how many milliseconds remain until the cache expires (0 if expired/missing). */
export function newsRemainingCacheTTL(): number {
  const cache = loadCache();
  if (!cache) return 0;
  const remaining = NEWS_CACHE_TTL - (Date.now() - cache.fetchedAt);
  return remaining > 0 ? remaining : 0;
}

export async function fetchMarketNews(apiKey: string, force = false): Promise<NewsItem[]> {
  if (!force) {
    const cache = loadCache();
    if (cache && Date.now() - cache.fetchedAt < NEWS_CACHE_TTL) {
      return cache.items;
    }
  }

  const res = await fetch(
    `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`
  );
  if (!res.ok) throw new Error(`Finnhub news HTTP ${res.status}`);

  const data = (await res.json()) as NewsItem[];

  // Filter out items without headline and limit to 25
  const items = data
    .filter((n) => n.headline && n.url)
    .slice(0, 25);

  saveCache(items);
  return items;
}
