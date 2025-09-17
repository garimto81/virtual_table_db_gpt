// Virtual Table DB - Incremental Update Version v5.0.0
// Day 3: 증분 업데이트 기능이 추가된 Google Apps Script

// ========================================
// 1. 기본 설정 및 캐시
// ========================================
const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || '';

// 클라이언트별 스냅샷 저장 (메모리 캐시)
const ClientSnapshots = {
  data: new Map(),
  maxClients: 100,
  ttl: 3600000 // 1시간
};

// ========================================
// 2. 타임스탬프 관리
// ========================================

/**
 * 데이터에 타임스탬프 추가
 */
function addTimestamps(data) {
  const timestamp = new Date().getTime();
  return data.map((row, index) => {
    // 각 행에 메타데이터 추가
    return {
      rowIndex: index,
      data: row,
      timestamp: timestamp,
      hash: generateRowHash(row)
    };
  });
}

/**
 * 행 단위 해시 생성
 */
function generateRowHash(row) {
  const rowString = JSON.stringify(row);
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, rowString);
  return Utilities.base64Encode(hash).substring(0, 8); // 짧은 해시
}

// ========================================
// 3. 델타 계산 알고리즘
// ========================================

/**
 * 두 데이터셋 간의 델타 계산
 */
function calculateDelta(oldData, newData) {
  const delta = {
    added: [],
    modified: [],
    deleted: [],
    timestamp: new Date().toISOString()
  };

  // 이전 데이터를 해시맵으로 변환
  const oldMap = new Map();
  oldData.forEach((row, index) => {
    oldMap.set(index, {
      data: row,
      hash: generateRowHash(row)
    });
  });

  // 새 데이터를 해시맵으로 변환
  const newMap = new Map();
  newData.forEach((row, index) => {
    newMap.set(index, {
      data: row,
      hash: generateRowHash(row)
    });
  });

  // 변경사항 감지
  // 1. 추가 및 수정 확인
  newMap.forEach((newRow, index) => {
    const oldRow = oldMap.get(index);

    if (!oldRow) {
      // 새로운 행 추가
      delta.added.push({
        row: index,
        data: newRow.data
      });
    } else if (oldRow.hash !== newRow.hash) {
      // 행 수정됨 - 변경된 셀만 포함
      const changes = getChangedCells(oldRow.data, newRow.data);
      if (changes.length > 0) {
        delta.modified.push({
          row: index,
          cells: changes,
          oldHash: oldRow.hash,
          newHash: newRow.hash
        });
      }
    }
  });

  // 2. 삭제 확인
  oldMap.forEach((oldRow, index) => {
    if (!newMap.has(index) || index >= newData.length) {
      delta.deleted.push({
        row: index
      });
    }
  });

  return delta;
}

/**
 * 변경된 셀만 추출
 */
function getChangedCells(oldRow, newRow) {
  const changes = [];
  const maxLength = Math.max(oldRow.length, newRow.length);

  for (let col = 0; col < maxLength; col++) {
    const oldValue = oldRow[col] || '';
    const newValue = newRow[col] || '';

    if (oldValue !== newValue) {
      changes.push({
        col: col,
        oldValue: oldValue,
        newValue: newValue
      });
    }
  }

  return changes;
}

// ========================================
// 4. 증분 업데이트 API
// ========================================

/**
 * 클라이언트별 증분 업데이트 제공
 */
function getIncrementalUpdate(clientId, lastVersion) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const dataSheet = sheet.getSheetByName('Virtual_Table_Play');

    if (!dataSheet) {
      throw new Error('Virtual_Table_Play 시트를 찾을 수 없습니다');
    }

    const currentData = dataSheet.getDataRange().getValues();
    const currentVersion = generateVersion(currentData);

    // 클라이언트 스냅샷 조회
    const clientSnapshot = ClientSnapshots.data.get(clientId);

    // 스냅샷이 없거나 버전이 다른 경우 전체 동기화
    if (!clientSnapshot || clientSnapshot.version !== lastVersion) {
      console.log(`📦 클라이언트 ${clientId}: 전체 동기화 필요`);

      // 새 스냅샷 저장
      ClientSnapshots.data.set(clientId, {
        version: currentVersion,
        data: currentData,
        timestamp: Date.now()
      });

      // 스냅샷 크기 관리
      if (ClientSnapshots.data.size > ClientSnapshots.maxClients) {
        cleanupOldSnapshots();
      }

      return {
        type: 'full',
        version: currentVersion,
        data: currentData,
        timestamp: new Date().toISOString(),
        rowCount: currentData.length,
        message: 'Full synchronization'
      };
    }

    // 델타 계산
    console.log(`🔄 클라이언트 ${clientId}: 델타 계산 중`);
    const delta = calculateDelta(clientSnapshot.data, currentData);

    // 스냅샷 업데이트
    ClientSnapshots.data.set(clientId, {
      version: currentVersion,
      data: currentData,
      timestamp: Date.now()
    });

    // 델타 통계
    const deltaStats = {
      added: delta.added.length,
      modified: delta.modified.length,
      deleted: delta.deleted.length,
      totalChanges: delta.added.length + delta.modified.length + delta.deleted.length
    };

    console.log(`✅ 델타 생성 완료: +${deltaStats.added} ~${deltaStats.modified} -${deltaStats.deleted}`);

    return {
      type: 'incremental',
      version: currentVersion,
      delta: delta,
      stats: deltaStats,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ 증분 업데이트 오류:', error);
    throw error;
  }
}

/**
 * 버전 생성
 */
function generateVersion(data) {
  const dataString = JSON.stringify(data);
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, dataString);
  return Utilities.base64Encode(hash);
}

/**
 * 오래된 스냅샷 정리
 */
function cleanupOldSnapshots() {
  const now = Date.now();
  const toDelete = [];

  ClientSnapshots.data.forEach((snapshot, clientId) => {
    if (now - snapshot.timestamp > ClientSnapshots.ttl) {
      toDelete.push(clientId);
    }
  });

  toDelete.forEach(clientId => {
    ClientSnapshots.data.delete(clientId);
    console.log(`🗑️ 오래된 스냅샷 삭제: ${clientId}`);
  });
}

// ========================================
// 5. 충돌 해결
// ========================================

/**
 * 충돌 감지 및 해결
 */
function resolveConflicts(clientChanges, serverDelta) {
  const conflicts = [];

  // 동일한 셀에 대한 변경 감지
  clientChanges.forEach(clientChange => {
    serverDelta.modified.forEach(serverChange => {
      if (clientChange.row === serverChange.row) {
        // 같은 행의 변경 확인
        clientChange.cells.forEach(clientCell => {
          serverChange.cells.forEach(serverCell => {
            if (clientCell.col === serverCell.col) {
              conflicts.push({
                row: clientChange.row,
                col: clientCell.col,
                clientValue: clientCell.newValue,
                serverValue: serverCell.newValue,
                baseValue: serverCell.oldValue
              });
            }
          });
        });
      }
    });
  });

  // 충돌 해결 전략
  return resolveByStrategy(conflicts, 'server-wins');
}

/**
 * 충돌 해결 전략 적용
 */
function resolveByStrategy(conflicts, strategy) {
  const resolutions = [];

  conflicts.forEach(conflict => {
    let resolution;

    switch (strategy) {
      case 'server-wins':
        resolution = {
          row: conflict.row,
          col: conflict.col,
          value: conflict.serverValue,
          strategy: 'server-wins'
        };
        break;

      case 'client-wins':
        resolution = {
          row: conflict.row,
          col: conflict.col,
          value: conflict.clientValue,
          strategy: 'client-wins'
        };
        break;

      case 'merge':
        // 숫자인 경우 평균, 문자열인 경우 연결
        if (typeof conflict.clientValue === 'number' && typeof conflict.serverValue === 'number') {
          resolution = {
            row: conflict.row,
            col: conflict.col,
            value: (conflict.clientValue + conflict.serverValue) / 2,
            strategy: 'merge-average'
          };
        } else {
          resolution = {
            row: conflict.row,
            col: conflict.col,
            value: `${conflict.clientValue} | ${conflict.serverValue}`,
            strategy: 'merge-concat'
          };
        }
        break;

      default:
        resolution = {
          row: conflict.row,
          col: conflict.col,
          value: conflict.serverValue,
          strategy: 'default-server'
        };
    }

    resolutions.push(resolution);
  });

  return {
    conflicts: conflicts,
    resolutions: resolutions,
    timestamp: new Date().toISOString()
  };
}

// ========================================
// 6. HTTP 핸들러
// ========================================

function doGet(e) {
  console.log('📥 GET 요청 수신:', JSON.stringify(e));
  const action = e.parameter.action;

  try {
    let response;

    switch(action) {
      case 'getIncremental':
        const clientId = e.parameter.clientId;
        const lastVersion = e.parameter.version;
        response = getIncrementalUpdate(clientId, lastVersion);
        break;

      default:
        response = {
          status: 'ok',
          version: 'v5.0.0',
          service: 'Incremental Update Service',
          features: [
            'Delta Calculation',
            'Conflict Resolution',
            'Client Snapshots',
            'Row-level Hashing'
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
      case 'applyDelta':
        response = applyDeltaToSheet(requestData);
        break;

      case 'resolveConflicts':
        response = resolveConflicts(requestData.clientChanges, requestData.serverDelta);
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

/**
 * 델타를 시트에 적용
 */
function applyDeltaToSheet(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const dataSheet = sheet.getSheetByName('Virtual_Table_Play');

    if (!dataSheet) {
      throw new Error('Virtual_Table_Play 시트를 찾을 수 없습니다');
    }

    const delta = data.delta;
    let changeCount = 0;

    // 수정 적용
    if (delta.modified) {
      delta.modified.forEach(mod => {
        mod.cells.forEach(cell => {
          const range = dataSheet.getRange(mod.row + 1, cell.col + 1);
          range.setValue(cell.newValue);
          changeCount++;
        });
      });
    }

    // 추가 적용
    if (delta.added) {
      delta.added.forEach(add => {
        dataSheet.appendRow(add.data);
        changeCount++;
      });
    }

    // 삭제 적용 (역순으로)
    if (delta.deleted) {
      delta.deleted.sort((a, b) => b.row - a.row).forEach(del => {
        dataSheet.deleteRow(del.row + 1);
        changeCount++;
      });
    }

    return {
      status: 'success',
      changes: changeCount,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ 델타 적용 오류:', error);
    return {
      status: 'error',
      message: error.toString()
    };
  }
}

// ========================================
// 7. 테스트 함수
// ========================================

function testIncrementalUpdate() {
  console.log('=== 증분 업데이트 테스트 ===');

  // 테스트 데이터
  const oldData = [
    ['A1', 'B1', 'C1'],
    ['A2', 'B2', 'C2'],
    ['A3', 'B3', 'C3']
  ];

  const newData = [
    ['A1', 'B1_modified', 'C1'],  // 수정
    ['A2', 'B2', 'C2'],            // 변경 없음
    ['A3', 'B3', 'C3'],            // 변경 없음
    ['A4', 'B4', 'C4']             // 추가
  ];

  // 델타 계산
  const delta = calculateDelta(oldData, newData);

  console.log('델타 결과:');
  console.log('- 추가:', delta.added.length);
  console.log('- 수정:', delta.modified.length);
  console.log('- 삭제:', delta.deleted.length);
  console.log('상세:', JSON.stringify(delta, null, 2));

  // 충돌 테스트
  const conflicts = [
    {
      row: 0,
      col: 1,
      clientValue: 'Client_Value',
      serverValue: 'Server_Value',
      baseValue: 'Original_Value'
    }
  ];

  const resolution = resolveByStrategy(conflicts, 'server-wins');
  console.log('충돌 해결:', JSON.stringify(resolution, null, 2));

  console.log('=== 테스트 완료 ===');
}

/**
 * 성능 벤치마크
 */
function benchmarkDelta() {
  console.log('=== 델타 성능 벤치마크 ===');

  // 큰 데이터셋 생성
  const rows = 100;
  const cols = 10;

  const oldData = [];
  const newData = [];

  for (let i = 0; i < rows; i++) {
    const oldRow = [];
    const newRow = [];

    for (let j = 0; j < cols; j++) {
      const value = `R${i}C${j}`;
      oldRow.push(value);
      // 10% 확률로 변경
      newRow.push(Math.random() < 0.1 ? `${value}_mod` : value);
    }

    oldData.push(oldRow);
    newData.push(newRow);
  }

  const startTime = new Date().getTime();
  const delta = calculateDelta(oldData, newData);
  const elapsed = new Date().getTime() - startTime;

  console.log(`데이터 크기: ${rows}x${cols}`);
  console.log(`델타 계산 시간: ${elapsed}ms`);
  console.log(`변경사항: +${delta.added.length} ~${delta.modified.length} -${delta.deleted.length}`);

  console.log('=== 벤치마크 완료 ===');
}