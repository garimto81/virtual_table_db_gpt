import { parseCsvText } from '../utils/csv.js';

const DEFAULT_TIMEOUT_MS = 30000;
const EXACT_THRESHOLD = 5; // seconds
const CLOSE_THRESHOLD = 30; // seconds
const MAX_THRESHOLD = 180; // seconds (±3분)

export function createTimeMatcher({ fetchImpl = fetch, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  async function findClosestRow({ timestamp, virtualSheetUrl, toleranceSeconds = MAX_THRESHOLD, signal } = {}) {
    if (!virtualSheetUrl) {
      throw new Error('virtualSheetUrl이 필요합니다');
    }
    const targetSeconds = normalizeTimestamp(timestamp);
    if (!Number.isFinite(targetSeconds)) {
      throw new Error('유효한 타임스탬프가 필요합니다');
    }

    const csvUrl = toCsvUrl(virtualSheetUrl);
    const controller = mergeAbortController(signal, timeoutMs);

    try {
      const text = await fetchCsvWithFallback(csvUrl, fetchImpl, controller.signal);
      const rows = parseCsvText(text);
      const match = locateClosestRow(rows, targetSeconds, toleranceSeconds);
      if (!match) {
        return null;
      }
      return {
        rowNumber: match.rowIndex,
        matchedTime: match.matchedTime,
        timeDiff: match.diffSeconds,
        accuracy: match.accuracy,
        rawRow: match.row
      };
    } finally {
      controller.abort();
    }
  }

  return {
    findClosestRow
  };
}

function mergeAbortController(parentSignal, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error('시간 매칭 타임아웃 (30초)')), timeoutMs);
  if (parentSignal) {
    parentSignal.addEventListener('abort', () => controller.abort(parentSignal.reason), { once: true });
  }
  controller.abort = ((original) => (reason) => {
    clearTimeout(timeoutId);
    if (!controller.signal.aborted) {
      original.call(controller, reason);
    }
  })(controller.abort);
  return controller;
}

async function fetchCsvWithFallback(url, fetchImpl, signal) {
  try {
    const res = await fetchImpl(url, { signal, headers: { 'Cache-Control': 'no-cache' } });
    if (!res.ok) {
      throw new Error(`CSV 요청 실패: ${res.status} ${res.statusText}`);
    }
    return await res.text();
  } catch (error) {
    // 간단한 CORS 우회
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const res = await fetchImpl(proxyUrl, { signal, headers: { 'Cache-Control': 'no-cache' } });
    if (!res.ok) {
      throw error;
    }
    return await res.text();
  }
}

function locateClosestRow(rows, targetSeconds, toleranceSeconds) {
  if (!rows || rows.length === 0) return null;
  let best = null;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const timeCell = findTimeCell(row);
    if (!timeCell) continue;
    const cellSeconds = parseTimeString(timeCell);
    if (!Number.isFinite(cellSeconds)) continue;
    const diff = Math.abs(cellSeconds - targetSeconds);
    if (diff > toleranceSeconds) continue;
    const accuracy = diff <= EXACT_THRESHOLD ? 'exact' : diff <= CLOSE_THRESHOLD ? 'close' : 'approx';
    if (!best || diff < best.diffSeconds) {
      best = {
        rowIndex: i + 1,
        diffSeconds: diff,
        matchedTime: timeCell,
        accuracy,
        row
      };
      if (diff === 0) break;
    }
  }
  return best;
}

function findTimeCell(row) {
  if (!row) return null;
  // 우선순위: B열(인덱스 1) → C열(인덱스 2)
  const cells = [row[1], row[2], row[0]];
  return cells.find(cell => parseTimeString(cell) !== null);
}

function parseTimeString(value) {
  if (!value) return null;
  let str = String(value).trim();
  if (!str) return null;
  // Unix timestamp
  if (/^\d{9,}$/.test(str)) {
    return Number(str);
  }
  // HH:MM[:SS]
  const match = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match) {
    const h = Number(match[1]);
    const m = Number(match[2]);
    const s = match[3] ? Number(match[3]) : 0;
    return h * 3600 + m * 60 + s;
  }
  // HH시 MM분 [SS초]
  const kor = str.match(/^(\d{1,2})\s*시\s*(\d{1,2})\s*분(?:\s*(\d{1,2})\s*초)?$/);
  if (kor) {
    const h = Number(kor[1]);
    const m = Number(kor[2]);
    const s = kor[3] ? Number(kor[3]) : 0;
    return h * 3600 + m * 60 + s;
  }
  // M/D HH:MM 형식 → HH:MM만 사용
  const md = str.match(/^(\d{1,2})\/\d{1,2}\s+(\d{1,2}):(\d{2})$/);
  if (md) {
    const h = Number(md[2]);
    const m = Number(md[3]);
    return h * 3600 + m * 60;
  }
  return null;
}

function normalizeTimestamp(timestamp) {
  if (timestamp === undefined || timestamp === null) return NaN;
  const num = Number(timestamp);
  if (Number.isFinite(num)) {
    // 이미 초 단위라고 가정 (원본 CSV가 epoch seconds)
    return num;
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return NaN;
  return Math.floor(date.getTime() / 1000);
}

function toCsvUrl(url) {
  if (!url) return url;
  if (url.includes('output=csv')) {
    return url;
  }
  const published = url.match(/\/spreadsheets\/d\/e\/(2PACX-[^/]+)/);
  const gidMatch = url.match(/[?#&]gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : '0';
  if (published) {
    return `https://docs.google.com/spreadsheets/d/e/${published[1]}/pub?gid=${gid}&single=true&output=csv`;
  }
  const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (idMatch) {
    return `https://docs.google.com/spreadsheets/d/${idMatch[1]}/export?format=csv&gid=${gid}`;
  }
  return url;
}
