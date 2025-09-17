// Central configuration loader that replaces scattered CONFIG usage in index.html.
const DEFAULTS = {
  urls: {
    handsCsv: '',
    indexCsv: '',
    typeCsv: '',
    appsScript: '',
  },
  mainSheetUrl: '',
  features: {
    enableNotifications: true,
    enableSound: true,
    debugMode: false,
  }
};

export async function initializeConfig(overrides = {}, defaults = {}) {
  const persisted = readFromLocalStorage();
  const config = mergeDeep(DEFAULTS, defaults, persisted, overrides);
  writeToLocalStorage(config);
  return config;
}

export async function loadConfigFile(url) {
  if (!url) return {};
  const response = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
  if (!response.ok) {
    throw new Error(`구성 파일을 불러오지 못했습니다: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function readFromLocalStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem('vtdb_config');
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.warn('⚠️ configManager: failed to parse stored config', error);
    return {};
  }
}

function writeToLocalStorage(config) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.setItem('vtdb_config', JSON.stringify(config));
}

function mergeDeep(...sources) {
  const result = {};
  for (const src of sources) {
    if (!src || typeof src !== 'object') continue;
    for (const [key, value] of Object.entries(src)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = mergeDeep(result[key], value);
      } else if (value !== undefined) {
        result[key] = value;
      }
    }
  }
  return result;
}
