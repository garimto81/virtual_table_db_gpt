import { initializeConfig, loadConfigFile } from './utils/configManager.js';
import { createCsvService } from './services/csvService.js';
import { parseIndexRows } from './services/indexParser.js';
import { buildHandDetail } from './services/handParser.js';
import { createTimeMatcher } from './services/timeMatcher.js';
import { buildFallbackSummary } from './services/analysis/fallback.js';
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
    const timeMatcher = createTimeMatcher();
    appState.csvService = csvService;
    appState.appsScriptClient = createAppsScriptClient({ config });
    appState.timeMatcher = timeMatcher;

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
    completeBtn.addEventListener('click', handleCompleteClick);
  }

  if (editBtn) {
    editBtn.addEventListener('click', handleEditClick);
  }
}

async function handleCompleteClick() {
  if (!appState.selectedHand) {
    notify('선택된 핸드가 없습니다.', { type: 'warning' });
    return;
  }
  try {
    toggleButtons(true);
    const detail = await loadSelectedHandDetail();
    const match = await appState.timeMatcher.findClosestRow({
      timestamp: detail.timestamp || detail.meta?.handUpdatedAt,
      virtualSheetUrl: appState.config.mainSheetUrl
    });
    const rowNumber = match?.rowNumber || detail.meta?.startRow;
    if (!rowNumber) {
      notify('시간 매칭에 실패했습니다.', { type: 'error' });
      return;
    }
    const payload = {
      sheetUrl: appState.config.mainSheetUrl,
      rowNumber,
      handNumber: detail.number,
      filename: `${detail.number}_${Date.now()}.mp4`,
      status: '복사완료',
      aiAnalysis: buildFallbackSummary(detail)
    };
    const result = await appState.appsScriptClient.updateSheet(payload);
    if (result.status === 'success') {
      notify('완료 처리 성공 ✅', { type: 'success' });
    } else {
      notify(`완료 처리 실패: ${result.message || '알 수 없는 오류'}`, { type: 'error' });
    }
  } catch (error) {
    console.error('handleCompleteClick error', error);
    notify(error.message || '완료 처리 중 오류가 발생했습니다.', { type: 'error' });
  } finally {
    toggleButtons(false);
  }
}

async function handleEditClick() {
  if (!appState.selectedHand) {
    notify('선택된 핸드가 없습니다.', { type: 'warning' });
    return;
  }
  try {
    toggleButtons(true);
    const detail = await loadSelectedHandDetail();
    const match = await appState.timeMatcher.findClosestRow({
      timestamp: detail.timestamp || detail.meta?.handUpdatedAt,
      virtualSheetUrl: appState.config.mainSheetUrl
    });
    const rowNumber = match?.rowNumber || detail.meta?.startRow;
    if (!rowNumber) {
      notify('시간 매칭에 실패했습니다.', { type: 'error' });
      return;
    }
    const payload = {
      sheetUrl: appState.config.mainSheetUrl,
      rowNumber,
      handNumber: detail.number,
      filename: detail.meta?.camFiles?.[0] || `${detail.number}.mp4`,
      status: '미완료',
      aiAnalysis: buildFallbackSummary(detail)
    };
    const result = await appState.appsScriptClient.updateSheet(payload);
    if (result.status === 'success') {
      notify('편집 상태로 업데이트되었습니다.', { type: 'success' });
    } else {
      notify(`편집 업데이트 실패: ${result.message || '알 수 없는 오류'}`, { type: 'error' });
    }
  } catch (error) {
    console.error('handleEditClick error', error);
    notify(error.message || '편집 처리 중 오류가 발생했습니다.', { type: 'error' });
  } finally {
    toggleButtons(false);
  }
}

function toggleButtons(loading) {
  const completeBtn = document.getElementById('complete-btn');
  const editBtn = document.getElementById('edit-btn');
  if (completeBtn) {
    completeBtn.disabled = loading;
    completeBtn.textContent = loading ? '처리 중...' : '완료';
  }
  if (editBtn) {
    editBtn.disabled = loading;
    editBtn.textContent = loading ? '처리 중...' : '편집';
  }
}

async function loadSelectedHandDetail() {
  const handRows = await getHandRows();
  return buildHandDetail(handRows, appState.selectedHand);
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    bootstrapDashboard();
  });
  window.bootstrapDashboard = bootstrapDashboard;
}

export { bootstrapDashboard };
