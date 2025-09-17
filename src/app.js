import { initializeConfig, loadConfigFile } from './utils/configManager.js';
import { createCsvService } from './services/csvService.js';
import { parseIndexRows } from './services/indexParser.js';
import { buildHandDetail } from './services/handParser.js';
import { createTimeMatcher } from './services/timeMatcher.js';
import { buildFallbackSummary } from './services/analysis/fallback.js';
import { renderHandList } from './ui/handList.js';
import { renderHandDetail, clearHandDetail, setHandCount } from './ui/detailPanel.js';
import { setupNotifications, notify } from './ui/notifications.js';
import { showProgress, hideProgress, updateProgressMessage, updateProgressPercent } from './ui/progress.js';
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
    showProgress('구성 로드 중...', 5);
    const baseConfig = await safeLoadConfig(resolveConfigUrl());
    const config = await initializeConfig({}, baseConfig);
    appState.config = config;

    setupNotifications({
      enablePopup: config.features?.enableNotifications,
      enableSound: config.features?.enableSound
    });

    const csvService = createCsvService({ config });
    const timeMatcher = createTimeMatcher();
    const appsScriptClient = createAppsScriptClient({ config });

    appState.csvService = csvService;
    appState.timeMatcher = timeMatcher;
    appState.appsScriptClient = appsScriptClient;

    updateProgressMessage('핸드 목록 불러오는 중...');
    updateProgressPercent(25);
    const indexRows = await csvService.getIndexRows();
    const hands = parseIndexRows(indexRows);
    appState.hands = hands;

    setHandCount(hands.length);
    renderHandList({
      container: document.getElementById('hand-list'),
      hands,
      selectedHandNumber: hands[0]?.handNumber,
      onSelect: (hand) => selectHand(hand)
    });

    if (hands.length) {
      updateProgressMessage('핸드 상세 구성 중...');
      updateProgressPercent(45);
      await selectHand(hands[0]);
    } else {
      clearHandDetail();
    }

    await refreshButtonStates();
    attachButtonHandlers();
    hideProgress();
  } catch (error) {
    console.error('프론트엔드 초기화 실패', error);
    hideProgress();
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
  await refreshButtonStates(detail);
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
    showProgress('완료 처리 준비 중...', 10);
    const detail = await loadSelectedHandDetail();
    updateProgressMessage('시간 매칭 중...');
    updateProgressPercent(35);
    const match = await matchHand(detail);
    if (!match?.rowNumber) {
      notify('시간 매칭에 실패했습니다.', { type: 'error' });
      return;
    }
    updateProgressMessage('Apps Script에 완료 상태 전송 중...');
    updateProgressPercent(65);
    const payload = {
      sheetUrl: appState.config.mainSheetUrl,
      rowNumber: match.rowNumber,
      handNumber: detail.number,
      filename: `${detail.number}_${Date.now()}.mp4`,
      status: '복사완료',
      aiAnalysis: buildFallbackSummary(detail)
    };
    const result = await appState.appsScriptClient.updateSheet(payload);
    if (result.status === 'success') {
      updateProgressMessage('검증 중...');
      updateProgressPercent(85);
      await refreshButtonStates(detail);
      notify('완료 처리 성공 ✅', { type: 'success' });
    } else {
      notify(`완료 처리 실패: ${result.message || '알 수 없는 오류'}`, { type: 'error' });
    }
  } catch (error) {
    console.error('handleCompleteClick error', error);
    notify(error.message || '완료 처리 중 오류가 발생했습니다.', { type: 'error' });
  } finally {
    hideProgress();
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
    showProgress('편집 상태 업데이트 준비 중...', 10);
    const detail = await loadSelectedHandDetail();
    updateProgressMessage('시간 매칭 중...');
    updateProgressPercent(35);
    const match = await matchHand(detail);
    if (!match?.rowNumber) {
      notify('시간 매칭에 실패했습니다.', { type: 'error' });
      return;
    }
    updateProgressMessage('Apps Script에 편집 상태 전송 중...');
    updateProgressPercent(65);
    const payload = {
      sheetUrl: appState.config.mainSheetUrl,
      rowNumber: match.rowNumber,
      handNumber: detail.number,
      filename: detail.meta?.camFiles?.[0] || `${detail.number}.mp4`,
      status: '미완료',
      aiAnalysis: buildFallbackSummary(detail)
    };
    const result = await appState.appsScriptClient.updateSheet(payload);
    if (result.status === 'success') {
      updateProgressMessage('검증 중...');
      updateProgressPercent(85);
      await refreshButtonStates(detail);
      notify('편집 상태로 업데이트되었습니다.', { type: 'success' });
    } else {
      notify(`편집 업데이트 실패: ${result.message || '알 수 없는 오류'}`, { type: 'error' });
    }
  } catch (error) {
    console.error('handleEditClick error', error);
    notify(error.message || '편집 처리 중 오류가 발생했습니다.', { type: 'error' });
  } finally {
    hideProgress();
    toggleButtons(false);
  }
}

async function matchHand(detail) {
  if (!appState.timeMatcher) return null;
  return appState.timeMatcher.findClosestRow({
    timestamp: detail.timestamp || detail.meta?.handUpdatedAt,
    virtualSheetUrl: appState.config.mainSheetUrl
  });
}

async function loadSelectedHandDetail() {
  const handRows = await getHandRows();
  return buildHandDetail(handRows, appState.selectedHand);
}

async function refreshButtonStates(detail) {
  const editBtn = document.getElementById('edit-btn');
  const completeBtn = document.getElementById('complete-btn');
  if (!editBtn || !completeBtn) return;
  if (!appState.appsScriptClient || !appState.config?.mainSheetUrl) {
    applyButtonStatus('default');
    return;
  }
  try {
    const sourceDetail = detail || await loadSelectedHandDetail();
    const match = await matchHand(sourceDetail);
    if (!match?.rowNumber) {
      applyButtonStatus('default');
      return;
    }
    const response = await appState.appsScriptClient.verifyUpdate({
      sheetUrl: appState.config.mainSheetUrl,
      rowNumber: match.rowNumber
    });
    const status = response?.data?.columnE || 'default';
    applyButtonStatus(status);
  } catch (error) {
    console.warn('버튼 상태 확인 실패', error);
    applyButtonStatus('default');
  }
}

function applyButtonStatus(status) {
  const editBtn = document.getElementById('edit-btn');
  const completeBtn = document.getElementById('complete-btn');
  if (!editBtn || !completeBtn) return;
  switch (status) {
    case '미완료':
      editBtn.disabled = true;
      editBtn.textContent = '편집';
      completeBtn.disabled = false;
      completeBtn.textContent = '완료';
      break;
    case '복사완료':
      editBtn.disabled = true;
      editBtn.textContent = '편집';
      completeBtn.disabled = true;
      completeBtn.textContent = '완료';
      break;
    default:
      editBtn.disabled = false;
      editBtn.textContent = '편집';
      completeBtn.disabled = true;
      completeBtn.textContent = '완료';
  }
}

function toggleButtons(disabled) {
  const editBtn = document.getElementById('edit-btn');
  const completeBtn = document.getElementById('complete-btn');
  if (editBtn) editBtn.disabled = disabled;
  if (completeBtn) completeBtn.disabled = disabled;
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    bootstrapDashboard();
  });
  window.bootstrapDashboard = bootstrapDashboard;
}

export { bootstrapDashboard };
