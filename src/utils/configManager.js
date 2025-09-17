// Central configuration loader that replaces scattered CONFIG usage in index.html.
const DEFAULTS = {
  urls: {
    handsCsv: '',
    indexCsv: '',
    typeCsv: '',
    appsScript: '',
  },
  mainSheetUrl: '',
  enableNotifications: true,
  enableSound: true,
};

export async function initializeConfig(overrides = {}) {
  const persisted = readFromLocalStorage();
  const config = mergeDeep(DEFAULTS, persisted, overrides);
  writeToLocalStorage(config);
  return config;
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
