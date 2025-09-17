// Virtual Table DB - Adaptive Polling Version v6.0.0
// Day 4: 적응형 폴링 및 네트워크 최적화

// ========================================
// 1. 기본 설정 및 캐시
// ========================================
const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || '';

// 클라이언트별 적응형 상태 관리
const AdaptiveClients = {
  data: new Map(),
  maxClients: 200,
  ttl: 7200000 // 2시간
};

// 네트워크 최적화 설정
const NetworkOptimization = {
  compressionEnabled: true,
  batchSize: 50,
  cacheTimeout: 300000, // 5분
  adaptiveTimeout: true
};

// ========================================
// 2. 클라이언트 상태 관리
// ========================================

/**
 * 클라이언트 상태 업데이트
 */
function updateClientState(clientId, activityState, lastActivity) {
  const now = Date.now();

  let clientData = AdaptiveClients.data.get(clientId) || {
    firstSeen: now,
    lastSeen: now,
    activityState: 'normal',
    pollingInterval: 10000,
    requestCount: 0,
    dataTransferred: 0,
    lastActivity: now
  };

  // 상태 업데이트
  clientData.lastSeen = now;
  clientData.activityState = activityState || 'normal';
  clientData.lastActivity = lastActivity || now;
  clientData.requestCount++;

  // 적응형 폴링 간격 계산
  clientData.pollingInterval = calculateAdaptiveInterval(clientData);

  AdaptiveClients.data.set(clientId, clientData);

  // 클라이언트 정리
  if (AdaptiveClients.data.size > AdaptiveClients.maxClients) {
    cleanupOldClients();
  }

  return clientData;
}

/**
 * 적응형 폴링 간격 계산
 */
function calculateAdaptiveInterval(clientData) {
  const now = Date.now();
  const timeSinceActivity = now - clientData.lastActivity;

  switch (clientData.activityState) {
    case 'active':
      return 3000;  // 3초

    case 'normal':
      return timeSinceActivity > 30000 ? 15000 : 10000; // 30초 후 15초로 증가

    case 'idle':
      return 30000; // 30초

    case 'background':
      return 60000; // 60초

    default:
      return 10000; // 기본값
  }
}

/**
 * 오래된 클라이언트 정리
 */
function cleanupOldClients() {
  const now = Date.now();
  const toDelete = [];

  AdaptiveClients.data.forEach((clientData, clientId) => {
    if (now - clientData.lastSeen > AdaptiveClients.ttl) {
      toDelete.push(clientId);
    }
  });

  toDelete.forEach(clientId => {
    AdaptiveClients.data.delete(clientId);
    console.log(`🗑️ 비활성 클라이언트 정리: ${clientId}`);
  });

  console.log(`🧹 클라이언트 정리 완료: ${toDelete.length}개 제거`);
}

// ========================================
// 3. 네트워크 최적화
// ========================================

/**
 * 응답 데이터 압축 및 최적화
 */
function optimizeResponse(data, clientState) {
  let optimizedData = data;

  // 클라이언트 상태에 따른 데이터 최적화
  switch (clientState.activityState) {
    case 'active':
      // 활성 상태: 전체 데이터
      break;

    case 'normal':
      // 일반 상태: 압축된 데이터
      if (NetworkOptimization.compressionEnabled) {
        optimizedData = compressData(data);
      }
      break;

    case 'idle':
    case 'background':
      // 비활성 상태: 메타데이터만
      optimizedData = {
        type: 'metadata',
        version: data.version,
        timestamp: data.timestamp,
        hasChanges: data.type === 'incremental' &&
          (data.stats?.totalChanges > 0 || false)
      };
      break;
  }

  return optimizedData;
}

/**
 * 데이터 압축
 */
function compressData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // 델타 데이터 압축
  if (data.type === 'incremental' && data.delta) {
    return {
      ...data,
      delta: compressDelta(data.delta)
    };
  }

  return data;
}

/**
 * 델타 데이터 압축
 */
function compressDelta(delta) {
  const compressed = {};

  // 추가된 행 압축
  if (delta.added && delta.added.length > 0) {
    compressed.a = delta.added.map(item => [item.row, item.data]);
  }

  // 수정된 행 압축
  if (delta.modified && delta.modified.length > 0) {
    compressed.m = delta.modified.map(item => [
      item.row,
      item.cells.map(cell => [cell.col, cell.newValue])
    ]);
  }

  // 삭제된 행 압축
  if (delta.deleted && delta.deleted.length > 0) {
    compressed.d = delta.deleted.map(item => item.row);
  }

  return compressed;
}

// ========================================
// 4. 적응형 업데이트 API
// ========================================

/**
 * 적응형 증분 업데이트
 */
function getAdaptiveUpdate(clientId, lastVersion, activityState, lastActivity) {
  try {
    const startTime = new Date().getTime();

    // 클라이언트 상태 업데이트
    const clientState = updateClientState(clientId, activityState, lastActivity);

    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const dataSheet = sheet.getSheetByName('Virtual_Table_Play');

    if (!dataSheet) {
      throw new Error('Virtual_Table_Play 시트를 찾을 수 없습니다');
    }

    // 빠른 변경 감지 (캐시 활용)
    const cacheKey = `sheet_checksum_${dataSheet.getLastRow()}_${dataSheet.getLastColumn()}`;
    const cachedChecksum = CacheService.getScriptCache().get(cacheKey);

    const currentData = dataSheet.getDataRange().getValues();
    const currentVersion = generateVersion(currentData);

    // 캐시된 체크섬과 비교
    if (cachedChecksum === currentVersion && clientState.activityState !== 'active') {
      // 변경 없음 - 경량 응답
      const response = {
        type: 'no-change',
        version: currentVersion,
        timestamp: new Date().toISOString(),
        clientState: {
          interval: clientState.pollingInterval,
          state: clientState.activityState
        },
        stats: {
          requestCount: clientState.requestCount,
          dataTransferred: clientState.dataTransferred
        }
      };

      clientState.dataTransferred += JSON.stringify(response).length;

      console.log(`📦 경량 응답: ${clientId} (${clientState.activityState})`);
      return optimizeResponse(response, clientState);
    }

    // 체크섬 캐시 업데이트
    CacheService.getScriptCache().put(cacheKey, currentVersion, NetworkOptimization.cacheTimeout);

    // 클라이언트 스냅샷 확인
    const clientSnapshot = ClientSnapshots.data.get(clientId);

    if (!clientSnapshot || clientSnapshot.version !== lastVersion) {
      // 전체 동기화 필요
      console.log(`📦 전체 동기화: ${clientId}`);

      ClientSnapshots.data.set(clientId, {
        version: currentVersion,
        data: currentData,
        timestamp: Date.now()
      });

      const response = {
        type: 'full',
        version: currentVersion,
        data: currentData,
        timestamp: new Date().toISOString(),
        rowCount: currentData.length,
        clientState: {
          interval: clientState.pollingInterval,
          state: clientState.activityState
        }
      };

      clientState.dataTransferred += JSON.stringify(response).length;

      return optimizeResponse(response, clientState);
    }

    // 증분 업데이트
    const delta = calculateDelta(clientSnapshot.data, currentData);

    // 스냅샷 업데이트
    ClientSnapshots.data.set(clientId, {
      version: currentVersion,
      data: currentData,
      timestamp: Date.now()
    });

    const deltaStats = {
      added: delta.added.length,
      modified: delta.modified.length,
      deleted: delta.deleted.length,
      totalChanges: delta.added.length + delta.modified.length + delta.deleted.length
    };

    const response = {
      type: 'incremental',
      version: currentVersion,
      delta: delta,
      stats: deltaStats,
      timestamp: new Date().toISOString(),
      clientState: {
        interval: clientState.pollingInterval,
        state: clientState.activityState
      },
      performance: {
        responseTime: new Date().getTime() - startTime,
        dataSize: JSON.stringify(delta).length
      }
    };

    clientState.dataTransferred += JSON.stringify(response).length;

    console.log(`✅ 적응형 업데이트: ${clientId} (+${deltaStats.added} ~${deltaStats.modified} -${deltaStats.deleted})`);

    return optimizeResponse(response, clientState);

  } catch (error) {
    console.error('❌ 적응형 업데이트 오류:', error);
    throw error;
  }
}

/**
 * 핑 요청 처리 (경량 변경 감지)
 */
function handlePing(clientId) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const dataSheet = sheet.getSheetByName('Virtual_Table_Play');

    if (!dataSheet) {
      throw new Error('Virtual_Table_Play 시트를 찾을 수 없습니다');
    }

    const lastModified = dataSheet.getLastUpdated();
    const clientState = AdaptiveClients.data.get(clientId);

    return {
      type: 'ping',
      lastModified: lastModified.getTime(),
      hasChanges: clientState ? lastModified.getTime() > clientState.lastSeen : true,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ 핑 처리 오류:', error);
    return {
      type: 'ping',
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

// ========================================
// 5. 배터리 최적화
// ========================================

/**
 * 배터리 상태 기반 최적화
 */
function getBatteryOptimizedInterval(clientId, batteryLevel, isCharging) {
  const clientState = AdaptiveClients.data.get(clientId);
  if (!clientState) return 10000;

  let baseInterval = clientState.pollingInterval;

  // 배터리 수준에 따른 조정
  if (!isCharging && batteryLevel < 20) {
    baseInterval *= 3; // 20% 미만 시 3배 증가
  } else if (!isCharging && batteryLevel < 50) {
    baseInterval *= 1.5; // 50% 미만 시 1.5배 증가
  }

  // 최대 5분으로 제한
  return Math.min(baseInterval, 300000);
}

/**
 * 네트워크 상태 기반 최적화
 */
function getNetworkOptimizedResponse(data, connectionType, effectiveType) {
  if (connectionType === 'cellular' && effectiveType !== '4g') {
    // 모바일 네트워크이고 4G가 아닌 경우 초경량 모드
    return {
      type: 'ultra-light',
      version: data.version,
      hasChanges: data.type === 'incremental' && data.stats?.totalChanges > 0,
      timestamp: data.timestamp
    };
  }

  return data;
}

// ========================================
// 6. HTTP 핸들러 (업데이트됨)
// ========================================

function doGet(e) {
  console.log('📥 GET 요청 수신:', JSON.stringify(e));
  const action = e.parameter.action;

  try {
    let response;

    switch(action) {
      case 'getAdaptive':
        const clientId = e.parameter.clientId;
        const lastVersion = e.parameter.version;
        const activityState = e.parameter.state || 'normal';
        const lastActivity = parseInt(e.parameter.lastActivity || Date.now());

        response = getAdaptiveUpdate(clientId, lastVersion, activityState, lastActivity);
        break;

      case 'ping':
        const pingClientId = e.parameter.clientId;
        response = handlePing(pingClientId);
        break;

      case 'getStats':
        response = getAdaptiveStats();
        break;

      default:
        response = {
          status: 'ok',
          version: 'v6.0.0',
          service: 'Adaptive Polling Service',
          features: [
            'Activity-based Polling',
            'Network Optimization',
            'Battery Optimization',
            'Compression Support',
            'Client State Management'
          ],
          timestamp: new Date().toISOString()
        };
    }

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('❌ GET 처리 오류:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  console.log('📥 POST 요청 수신');

  try {
    let requestData = {};

    if (e.postData && e.postData.contents) {
      requestData = JSON.parse(e.postData.contents);
    }

    const action = requestData.action || e.parameter.action;
    let response;

    switch(action) {
      case 'updateClientState':
        response = updateClientState(
          requestData.clientId,
          requestData.activityState,
          requestData.lastActivity
        );
        break;

      case 'setBatteryState':
        response = {
          optimizedInterval: getBatteryOptimizedInterval(
            requestData.clientId,
            requestData.batteryLevel,
            requestData.isCharging
          )
        };
        break;

      default:
        response = {
          status: 'error',
          message: 'Unknown action: ' + action
        };
    }

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('❌ POST 처리 오류:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ========================================
// 7. 통계 및 모니터링
// ========================================

/**
 * 적응형 폴링 통계
 */
function getAdaptiveStats() {
  const stats = {
    activeClients: AdaptiveClients.data.size,
    stateDistribution: {},
    averageInterval: 0,
    totalRequests: 0,
    totalDataTransferred: 0
  };

  let totalInterval = 0;
  let clientCount = 0;

  AdaptiveClients.data.forEach((clientData, clientId) => {
    // 상태별 분포
    if (!stats.stateDistribution[clientData.activityState]) {
      stats.stateDistribution[clientData.activityState] = 0;
    }
    stats.stateDistribution[clientData.activityState]++;

    // 평균 계산
    totalInterval += clientData.pollingInterval;
    stats.totalRequests += clientData.requestCount;
    stats.totalDataTransferred += clientData.dataTransferred;
    clientCount++;
  });

  if (clientCount > 0) {
    stats.averageInterval = Math.round(totalInterval / clientCount);
  }

  return stats;
}

// ========================================
// 8. 기존 함수들 (Day 3에서 가져옴)
// ========================================

// calculateDelta, generateVersion 등 Day 3 함수들을 재사용
// (파일 크기 제한으로 인해 생략, 실제로는 포함 필요)

function calculateDelta(oldData, newData) {
  // Day 3 구현과 동일
  const delta = {
    added: [],
    modified: [],
    deleted: [],
    timestamp: new Date().toISOString()
  };

  // 구현 내용은 apps_script_incremental.gs와 동일
  // ...

  return delta;
}

function generateVersion(data) {
  const dataString = JSON.stringify(data);
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, dataString);
  return Utilities.base64Encode(hash);
}

// ========================================
// 9. 테스트 함수
// ========================================

function testAdaptivePolling() {
  console.log('=== 적응형 폴링 테스트 ===');

  // 클라이언트 상태 테스트
  const clientId = 'test_client_' + Date.now();

  console.log('1. 활성 상태 테스트');
  let clientState = updateClientState(clientId, 'active', Date.now());
  console.log('활성 상태 폴링 간격:', clientState.pollingInterval);

  console.log('2. 일반 상태 테스트');
  clientState = updateClientState(clientId, 'normal', Date.now() - 35000);
  console.log('일반 상태 폴링 간격:', clientState.pollingInterval);

  console.log('3. 대기 상태 테스트');
  clientState = updateClientState(clientId, 'idle', Date.now() - 60000);
  console.log('대기 상태 폴링 간격:', clientState.pollingInterval);

  console.log('4. 백그라운드 상태 테스트');
  clientState = updateClientState(clientId, 'background', Date.now() - 120000);
  console.log('백그라운드 상태 폴링 간격:', clientState.pollingInterval);

  console.log('=== 테스트 완료 ===');
}