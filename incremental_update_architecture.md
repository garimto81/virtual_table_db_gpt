# 증분 업데이트 아키텍처 설계

## 1. 개요
전체 데이터 전송 대신 변경된 부분만 전송하여 네트워크 효율성을 극대화

## 2. 핵심 컴포넌트

### 2.1 Delta 추적 시스템

#### Google Apps Script (서버)
```javascript
// 변경 추적을 위한 메모리 캐시
const ChangeTracker = {
  snapshots: new Map(), // 클라이언트별 스냅샷
  maxClients: 100,      // 최대 동시 클라이언트
  ttl: 3600000          // 1시간 TTL
};

/**
 * 클라이언트별 델타 계산
 */
function getIncrementalUpdate(clientId, lastVersion) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = sheet.getSheetByName('Virtual_Table_Play');
  const currentData = dataSheet.getDataRange().getValues();
  const currentVersion = generateVersion(currentData);

  // 클라이언트의 마지막 스냅샷 조회
  const clientSnapshot = ChangeTracker.snapshots.get(clientId);

  if (!clientSnapshot || clientSnapshot.version !== lastVersion) {
    // 전체 동기화 필요
    return {
      type: 'full',
      version: currentVersion,
      data: currentData,
      timestamp: new Date().toISOString()
    };
  }

  // 델타 계산
  const delta = calculateDelta(clientSnapshot.data, currentData);

  // 스냅샷 업데이트
  ChangeTracker.snapshots.set(clientId, {
    version: currentVersion,
    data: currentData,
    timestamp: Date.now()
  });

  return {
    type: 'incremental',
    version: currentVersion,
    delta: delta,
    timestamp: new Date().toISOString()
  };
}

/**
 * 효율적인 델타 계산 알고리즘
 */
function calculateDelta(oldData, newData) {
  const delta = {
    added: [],    // 추가된 행
    modified: [], // 수정된 행
    deleted: []   // 삭제된 행
  };

  const maxRows = Math.max(oldData.length, newData.length);

  for (let i = 0; i < maxRows; i++) {
    if (i >= oldData.length) {
      // 새로운 행 추가됨
      delta.added.push({
        row: i,
        data: newData[i]
      });
    } else if (i >= newData.length) {
      // 행 삭제됨
      delta.deleted.push({
        row: i
      });
    } else if (JSON.stringify(oldData[i]) !== JSON.stringify(newData[i])) {
      // 행 수정됨 - 변경된 셀만 포함
      const changes = getChangedCells(oldData[i], newData[i]);
      if (changes.length > 0) {
        delta.modified.push({
          row: i,
          cells: changes
        });
      }
    }
  }

  return delta;
}

/**
 * 변경된 셀만 추출
 */
function getChangedCells(oldRow, newRow) {
  const changes = [];

  for (let col = 0; col < newRow.length; col++) {
    if (oldRow[col] !== newRow[col]) {
      changes.push({
        col: col,
        value: newRow[col],
        oldValue: oldRow[col] // 디버깅용
      });
    }
  }

  return changes;
}
```

### 2.2 클라이언트 델타 적용 시스템

```javascript
class IncrementalUpdateManager {
  constructor() {
    this.clientId = this.generateClientId();
    this.currentVersion = null;
    this.dataStore = [];
    this.updateQueue = [];
    this.isProcessing = false;
  }

  /**
   * 고유 클라이언트 ID 생성
   */
  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 증분 업데이트 요청
   */
  async fetchUpdate() {
    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getIncrementalUpdate',
          clientId: this.clientId,
          lastVersion: this.currentVersion
        })
      });

      const update = await response.json();
      await this.applyUpdate(update);

      return update;
    } catch (error) {
      console.error('증분 업데이트 실패:', error);
      // 실패 시 전체 동기화 폴백
      return await this.fullSync();
    }
  }

  /**
   * 업데이트 적용
   */
  async applyUpdate(update) {
    if (update.type === 'full') {
      // 전체 데이터 교체
      this.dataStore = update.data;
      this.currentVersion = update.version;
      await this.renderFullTable();
    } else if (update.type === 'incremental') {
      // 델타 적용
      await this.applyDelta(update.delta);
      this.currentVersion = update.version;
    }

    // 성능 메트릭 기록
    this.trackPerformance(update);
  }

  /**
   * 델타를 데이터스토어에 적용
   */
  async applyDelta(delta) {
    // 업데이트 큐에 추가
    this.updateQueue.push(delta);

    if (!this.isProcessing) {
      await this.processUpdateQueue();
    }
  }

  /**
   * 배치 업데이트 처리
   */
  async processUpdateQueue() {
    this.isProcessing = true;

    while (this.updateQueue.length > 0) {
      const delta = this.updateQueue.shift();

      // 삭제된 행 처리 (역순으로 처리)
      for (const deletion of delta.deleted.reverse()) {
        this.dataStore.splice(deletion.row, 1);
        this.removeRowFromDOM(deletion.row);
      }

      // 수정된 행 처리
      for (const modification of delta.modified) {
        for (const cell of modification.cells) {
          this.dataStore[modification.row][cell.col] = cell.value;
          this.updateCellInDOM(modification.row, cell.col, cell.value);
        }
      }

      // 추가된 행 처리
      for (const addition of delta.added) {
        this.dataStore.push(addition.data);
        this.addRowToDOM(addition.data);
      }
    }

    this.isProcessing = false;
  }

  /**
   * DOM 업데이트 최적화
   */
  updateCellInDOM(row, col, value) {
    // RequestAnimationFrame으로 배치 처리
    requestAnimationFrame(() => {
      const cell = document.querySelector(
        `#table-row-${row} > td:nth-child(${col + 1})`
      );

      if (cell) {
        // 변경 애니메이션
        cell.classList.add('cell-updated');
        cell.textContent = value;

        // 애니메이션 제거
        setTimeout(() => {
          cell.classList.remove('cell-updated');
        }, 500);
      }
    });
  }

  /**
   * 행 추가 DOM 업데이트
   */
  addRowToDOM(rowData) {
    const tbody = document.querySelector('#data-table tbody');
    const newRow = document.createElement('tr');
    newRow.id = `table-row-${this.dataStore.length - 1}`;

    rowData.forEach(cellValue => {
      const td = document.createElement('td');
      td.textContent = cellValue;
      newRow.appendChild(td);
    });

    // 부드러운 추가 애니메이션
    newRow.classList.add('row-added');
    tbody.appendChild(newRow);
  }

  /**
   * 행 삭제 DOM 업데이트
   */
  removeRowFromDOM(rowIndex) {
    const row = document.querySelector(`#table-row-${rowIndex}`);
    if (row) {
      row.classList.add('row-deleted');
      setTimeout(() => row.remove(), 300);
    }

    // 인덱스 재정렬
    this.reindexRows();
  }

  /**
   * 행 인덱스 재정렬
   */
  reindexRows() {
    const rows = document.querySelectorAll('#data-table tbody tr');
    rows.forEach((row, index) => {
      row.id = `table-row-${index}`;
    });
  }
}
```

## 3. 압축 및 최적화

### 3.1 델타 압축
```javascript
/**
 * 델타 데이터 압축
 */
function compressDelta(delta) {
  // 연속된 셀 변경을 범위로 압축
  const compressed = {
    m: [], // modified
    a: [], // added
    d: []  // deleted
  };

  // 수정된 행 압축
  if (delta.modified.length > 0) {
    compressed.m = delta.modified.map(mod => ({
      r: mod.row,
      c: mod.cells.map(cell => [cell.col, cell.value])
    }));
  }

  // 추가된 행 압축
  if (delta.added.length > 0) {
    compressed.a = delta.added.map(add => ({
      r: add.row,
      d: add.data
    }));
  }

  // 삭제된 행 압축
  if (delta.deleted.length > 0) {
    compressed.d = delta.deleted.map(del => del.row);
  }

  return compressed;
}

/**
 * 압축 해제
 */
function decompressDelta(compressed) {
  const delta = {
    modified: [],
    added: [],
    deleted: []
  };

  // 수정 압축 해제
  if (compressed.m) {
    delta.modified = compressed.m.map(mod => ({
      row: mod.r,
      cells: mod.c.map(([col, value]) => ({ col, value }))
    }));
  }

  // 추가 압축 해제
  if (compressed.a) {
    delta.added = compressed.a.map(add => ({
      row: add.r,
      data: add.d
    }));
  }

  // 삭제 압축 해제
  if (compressed.d) {
    delta.deleted = compressed.d.map(row => ({ row }));
  }

  return delta;
}
```

### 3.2 바이너리 프로토콜
```javascript
/**
 * Protocol Buffer 스키마 정의
 */
const DeltaProto = `
syntax = "proto3";

message Delta {
  repeated ModifiedRow modified = 1;
  repeated AddedRow added = 2;
  repeated int32 deleted = 3;
}

message ModifiedRow {
  int32 row = 1;
  repeated CellChange cells = 2;
}

message CellChange {
  int32 col = 1;
  string value = 2;
}

message AddedRow {
  int32 row = 1;
  repeated string data = 2;
}
`;
```

## 4. 충돌 해결

### 4.1 버전 충돌 감지
```javascript
class ConflictResolver {
  /**
   * 충돌 감지 및 해결
   */
  async resolveConflict(localChanges, serverChanges) {
    const conflicts = [];

    // 동일한 셀에 대한 변경 감지
    for (const local of localChanges) {
      for (const server of serverChanges) {
        if (local.row === server.row && local.col === server.col) {
          conflicts.push({
            row: local.row,
            col: local.col,
            localValue: local.value,
            serverValue: server.value
          });
        }
      }
    }

    if (conflicts.length > 0) {
      // 충돌 해결 전략
      return await this.applyResolutionStrategy(conflicts);
    }

    return null;
  }

  /**
   * 충돌 해결 전략
   */
  async applyResolutionStrategy(conflicts) {
    // 전략 1: 서버 우선 (기본값)
    // 전략 2: 클라이언트 우선
    // 전략 3: 타임스탬프 기반
    // 전략 4: 사용자 선택

    const strategy = 'server-wins'; // 설정 가능

    switch (strategy) {
      case 'server-wins':
        return conflicts.map(c => ({
          row: c.row,
          col: c.col,
          value: c.serverValue
        }));

      case 'client-wins':
        return conflicts.map(c => ({
          row: c.row,
          col: c.col,
          value: c.localValue
        }));

      case 'merge':
        return this.mergeConflicts(conflicts);

      default:
        return await this.promptUserResolution(conflicts);
    }
  }
}
```

## 5. 웹소켓 통합 (선택적)

```javascript
/**
 * WebSocket 기반 실시간 증분 업데이트
 */
class WebSocketDeltaSync {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.setupHandlers();
  }

  setupHandlers() {
    this.ws.onmessage = (event) => {
      const update = JSON.parse(event.data);

      if (update.type === 'delta') {
        this.applyDelta(update.delta);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.fallbackToPolling();
    };
  }

  /**
   * 델타 전송
   */
  sendDelta(delta) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'delta',
        delta: compressDelta(delta),
        version: this.currentVersion
      }));
    }
  }
}
```

## 6. 성능 벤치마크

### 6.1 측정 지표
```javascript
const PerformanceMetrics = {
  // 데이터 전송량
  dataTransfer: {
    full: 0,      // 전체 데이터 바이트
    incremental: 0 // 증분 데이터 바이트
  },

  // 업데이트 시간
  updateTime: {
    full: [],      // 전체 업데이트 시간
    incremental: [] // 증분 업데이트 시간
  },

  // 효율성
  efficiency: {
    compressionRatio: 0,
    cacheHitRate: 0,
    deltaSize: []
  }
};

/**
 * 성능 측정
 */
function measurePerformance(updateType, startTime, dataSize) {
  const endTime = performance.now();
  const duration = endTime - startTime;

  if (updateType === 'full') {
    PerformanceMetrics.dataTransfer.full += dataSize;
    PerformanceMetrics.updateTime.full.push(duration);
  } else {
    PerformanceMetrics.dataTransfer.incremental += dataSize;
    PerformanceMetrics.updateTime.incremental.push(duration);
  }

  // 압축률 계산
  const compressionRatio =
    PerformanceMetrics.dataTransfer.incremental /
    PerformanceMetrics.dataTransfer.full;

  PerformanceMetrics.efficiency.compressionRatio = compressionRatio;

  return {
    duration,
    dataSize,
    compressionRatio
  };
}
```

## 7. 테스트 시나리오

### 7.1 단위 테스트
```javascript
describe('Incremental Updates', () => {
  test('델타 계산 정확성', () => {
    const oldData = [
      ['A1', 'B1', 'C1'],
      ['A2', 'B2', 'C2']
    ];

    const newData = [
      ['A1', 'B1_modified', 'C1'],
      ['A2', 'B2', 'C2'],
      ['A3', 'B3', 'C3'] // 새 행
    ];

    const delta = calculateDelta(oldData, newData);

    expect(delta.modified).toHaveLength(1);
    expect(delta.modified[0].row).toBe(0);
    expect(delta.modified[0].cells[0].col).toBe(1);
    expect(delta.added).toHaveLength(1);
    expect(delta.deleted).toHaveLength(0);
  });

  test('압축/해제 무손실', () => {
    const original = {
      modified: [{ row: 0, cells: [{ col: 1, value: 'test' }] }],
      added: [{ row: 2, data: ['A', 'B', 'C'] }],
      deleted: [{ row: 5 }]
    };

    const compressed = compressDelta(original);
    const decompressed = decompressDelta(compressed);

    expect(decompressed).toEqual(original);
  });
});
```

### 7.2 통합 테스트
```javascript
describe('E2E Incremental Sync', () => {
  test('다중 클라이언트 동기화', async () => {
    const client1 = new IncrementalUpdateManager();
    const client2 = new IncrementalUpdateManager();

    // Client 1이 변경
    await client1.makeChange(0, 1, 'new_value');

    // Client 2가 업데이트 받음
    const update = await client2.fetchUpdate();

    expect(update.type).toBe('incremental');
    expect(update.delta.modified).toHaveLength(1);
    expect(client2.dataStore[0][1]).toBe('new_value');
  });

  test('네트워크 실패 시 복구', async () => {
    const client = new IncrementalUpdateManager();

    // 네트워크 실패 시뮬레이션
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const update = await client.fetchUpdate();

    // 전체 동기화로 폴백
    expect(update.type).toBe('full');
  });
});
```

## 8. 구현 로드맵

### Week 1: 기본 증분 시스템
- [ ] Delta 계산 알고리즘 구현
- [ ] 클라이언트 적용 로직
- [ ] 기본 테스트

### Week 2: 최적화
- [ ] 압축 알고리즘 적용
- [ ] 배치 업데이트
- [ ] 성능 측정

### Week 3: 고급 기능
- [ ] 충돌 해결
- [ ] WebSocket 통합
- [ ] 프로덕션 배포

## 9. 예상 성능 개선

| 지표 | 현재 | 목표 | 개선율 |
|-----|-----|-----|-------|
| 평균 데이터 전송 | 50KB/요청 | 2KB/요청 | 96% |
| 업데이트 지연 | 500ms | 50ms | 90% |
| CPU 사용률 | 15% | 5% | 67% |
| 메모리 사용 | 100MB | 50MB | 50% |

## 10. 모니터링 대시보드

```html
<div id="incremental-dashboard">
  <h3>증분 업데이트 모니터</h3>
  <canvas id="delta-chart"></canvas>

  <div class="stats">
    <div class="stat">
      <label>델타 크기 평균</label>
      <span id="avg-delta-size">0 KB</span>
    </div>
    <div class="stat">
      <label>압축률</label>
      <span id="compression-ratio">0%</span>
    </div>
    <div class="stat">
      <label>충돌 발생</label>
      <span id="conflict-count">0</span>
    </div>
  </div>
</div>

<script>
// 실시간 차트 업데이트
const deltaChart = new Chart(document.getElementById('delta-chart'), {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: '델타 크기 (KB)',
      data: [],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  }
});
</script>
```