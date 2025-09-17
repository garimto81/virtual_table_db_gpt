import { initializeConfig, loadConfigFile } from './utils/configManager.js';
import { createCsvService } from './services/csvService.js';
import { parseIndexRows } from './services/indexParser.js';
import { buildHandDetail } from './services/handParser.js';
import { renderHandList } from './ui/handList.js';
import { renderHandDetail, clearHandDetail, setHandCount } from './ui/detailPanel.js';
import { setupNotifications, notify } from './ui/notifications.js';
import { appState } from './state/appState.js';
import { createAppsScriptClient } from './services/appsScriptClient.js';

const DEFAULT_CONFIG_URL = 'config/app.config.sample.json';

function resolveConfigUrl() {
  if (typeof window !== 'undefined') {
    if (window.__VTDB_CONFIG_URL) return window.__VTDB_CONFIG_URL;
    const meta = document.querySelector('meta[name="vtdb-config-url"]');
    if (meta && meta.content) return meta.content;
  }
  return DEFAULT_CONFIG_URL;
}

async function bootstrapDashboard() {
  try {
    const baseConfig = await safeLoadConfig(resolveConfigUrl());
    const config = await initializeConfig({}, baseConfig);
    appState.config = config;

    setupNotifications({
      enablePopup: config.features?.enableNotifications,
      enableSound: config.features?.enableSound
    });

    const csvService = createCsvService({ config });
    appState.csvService = csvService;
    appState.appsScriptClient = createAppsScriptClient({ config });

    const indexRows = await csvService.getIndexRows();
    const hands = parseIndexRows(indexRows);
    appState.hands = hands;

    setHandCount(hands.length);
    const handListEl = document.getElementById('hand-list');
    renderHandList({
      container: handListEl,
      hands,
      selectedHandNumber: hands[0]?.handNumber,
      onSelect: (hand) => selectHand(hand)
    });

    if (hands.length) {
      await selectHand(hands[0]);
    } else {
      clearHandDetail();
    }

    attachButtonHandlers();
  } catch (error) {
    console.error('프론트엔드 초기화 실패', error);
    notify('대시보드 초기화에 실패했습니다.', { type: 'error' });
  }
}

async function safeLoadConfig(url) {
  try {
    return await loadConfigFile(url);
  } catch (error) {
    console.warn('기본 구성 파일을 불러올 수 없습니다.', error);
    return {};
  }
}

async function selectHand(handMeta) {
  if (!handMeta) return;
  appState.selectedHand = handMeta;
  renderHandList({
    container: document.getElementById('hand-list'),
    hands: appState.hands,
    selectedHandNumber: handMeta.handNumber,
    onSelect: (hand) => selectHand(hand)
  });

  const handRows = await getHandRows();
  const detail = buildHandDetail(handRows, handMeta);
  renderHandDetail(detail);
}

async function getHandRows() {
  if (appState.handRowsCache) return appState.handRowsCache;
  const rows = await appState.csvService.getHandsRows();
  appState.handRowsCache = rows;
  return rows;
}

function attachButtonHandlers() {
  const completeBtn = document.getElementById('complete-btn');
  const editBtn = document.getElementById('edit-btn');

  if (completeBtn) {
    completeBtn.addEventListener('click', async () => {
      if (!appState.selectedHand) {
        notify('선택된 핸드가 없습니다.', { type: 'warning' });
        return;
      }
      notify('완료 처리 기능은 리팩토링 중입니다.', { type: 'info' });
    });
  }

  if (editBtn) {
    editBtn.addEventListener('click', async () => {
      if (!appState.selectedHand) {
        notify('선택된 핸드가 없습니다.', { type: 'warning' });
        return;
      }
      notify('편집 기능은 리팩토링 중입니다.', { type: 'info' });
    });
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    bootstrapDashboard();
  });
  window.bootstrapDashboard = bootstrapDashboard;
}

export { bootstrapDashboard };
