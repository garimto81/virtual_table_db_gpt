// Lightweight CSV service scaffold. Real implementation will move logic out of index.html.
import { parseCsvText } from '../utils/csv.js';

export function createCsvService({ config, fetchImpl = fetch, cacheTtlMs = 15000 } = {}) {
  const cache = new Map();

  function buildCacheKey(url) {
    return `${url}`;
  }

  async function fetchCsv(url) {
    const cacheKey = buildCacheKey(url);
    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < cacheTtlMs) {
      return cached.data;
    }

    const response = await fetchImpl(url, { headers: { 'Cache-Control': 'no-cache' } });
    if (!response.ok) {
      throw new Error(`CSV fetch failed: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    const data = parseCsvText(text);
    cache.set(cacheKey, { timestamp: now, data });
    return data;
  }

  return {
    async getHandsCsv() {
      return fetchCsv(config.urls.handsCsv);
    },
    async getIndexCsv() {
      return fetchCsv(config.urls.indexCsv);
    },
    async getTypeCsv() {
      return fetchCsv(config.urls.typeCsv);
    },
    clearCache() {
      cache.clear();
    }
  };
}
