// CSV service responsible for fetching and caching published Google Sheets CSV feeds.
import { parseCsvText } from '../utils/csv.js';

export function createCsvService({ config, fetchImpl = fetch, cacheTtlMs = 15000 } = {}) {
  const cache = new Map();

  function resolveUrl(kind) {
    const urls = config.urls || {};
    switch (kind) {
      case 'hands':
        return urls.handsCsv || config.CSV_HAND_URL || config.csvHandUrl;
      case 'index':
        return urls.indexCsv || config.CSV_INDEX_URL || config.csvIndexUrl;
      case 'type':
        return urls.typeCsv || config.TYPE_CSV_URL || config.csvTypeUrl;
      default:
        throw new Error('Unknown CSV kind: ' + kind);
    }
  }

  async function fetchCsv(kind) {
    const url = resolveUrl(kind);
    if (!url) {
      throw new Error(`CSV URL(${kind})이 설정되지 않았습니다.`);
    }
    const cacheKey = `${kind}:${url}`;
    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < cacheTtlMs) {
      return cached.data;
    }
    const response = await fetchImpl(url, { headers: { 'Cache-Control': 'no-cache' } });
    if (!response.ok) {
      throw new Error(`CSV fetch failed (${kind}): ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    const rows = parseCsvText(text);
    cache.set(cacheKey, { timestamp: now, data: rows });
    return rows;
  }

  return {
    async getHandsRows() {
      return fetchCsv('hands');
    },
    async getIndexRows() {
      return fetchCsv('index');
    },
    async getTypeRows() {
      return fetchCsv('type');
    },
    clearCache() {
      cache.clear();
    }
  };
}
