# Checksum 기반 변경 감지 시스템 설계

## 1. 개요
현재 10초마다 전체 데이터를 가져오는 방식에서 Checksum을 활용한 효율적인 변경 감지 시스템으로 전환

## 2. 아키텍처

### 2.1 Google Apps Script (서버)
```javascript
// Checksum 생성 함수
function generateChecksum(data) {
  // MD5 해시를 사용한 빠른 체크섬 생성
  const dataString = JSON.stringify(data);
  const checksum = Utilities.computeDigest(
    Utilities.DigestAlgorithm.MD5,
    dataString
  );
  return Utilities.base64Encode(checksum);
}

// 데이터와 체크섬 반환
function getDataWithChecksum() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = sheet.getSheetByName('Virtual_Table_Play');
  const data = dataSheet.getDataRange().getValues();

  return {
    checksum: generateChecksum(data),
    timestamp: new Date().toISOString(),
    data: data // 체크섬이 변경된 경우에만 포함
  };
}

// 체크섬만 반환 (경량 체크)
function getChecksumOnly() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = sheet.getSheetByName('Virtual_Table_Play');
  const data = dataSheet.getDataRange().getValues();

  return {
    checksum: generateChecksum(data),
    timestamp: new Date().toISOString()
  };
}
```

### 2.2 클라이언트 (JavaScript)
```javascript
class ChecksumManager {
  constructor() {
    this.lastChecksum = null;
    this.lastData = null;
    this.pollInterval = 3000; // 3초 (활성 상태)
    this.inactiveInterval = 15000; // 15초 (비활성 상태)
    this.lastActivity = Date.now();
  }

  async checkForUpdates() {
    try {
      // 1. 체크섬만 먼저 확인
      const checksumResponse = await this.fetchChecksum();

      // 2. 체크섬이 변경된 경우에만 전체 데이터 가져오기
      if (checksumResponse.checksum !== this.lastChecksum) {
        console.log('데이터 변경 감지됨');
        const fullData = await this.fetchFullData();
        this.lastChecksum = checksumResponse.checksum;
        this.lastData = fullData;
        this.updateUI(fullData);
        return true;
      }

      return false;
    } catch (error) {
      console.error('체크섬 확인 실패:', error);
      throw error;
    }
  }

  async fetchChecksum() {
    const startTime = performance.now();
    const response = await fetch(APPS_SCRIPT_URL + '?action=getChecksum');
    const data = await response.json();
    const endTime = performance.now();

    // 성능 모니터링
    if (window.performanceMonitor) {
      window.performanceMonitor.trackApiCall(
        'checksum',
        endTime - startTime,
        JSON.stringify(data).length
      );
    }

    return data;
  }

  async fetchFullData() {
    const startTime = performance.now();
    const response = await fetch(APPS_SCRIPT_URL + '?action=getFullData');
    const data = await response.json();
    const endTime = performance.now();

    // 성능 모니터링
    if (window.performanceMonitor) {
      window.performanceMonitor.trackApiCall(
        'fullData',
        endTime - startTime,
        JSON.stringify(data).length
      );
    }

    return data;
  }
}
```

## 3. 체크섬 최적화 전략

### 3.1 셀 범위별 체크섬
```javascript
// 특정 범위만 체크섬 생성 (예: 편집 상태 열)
function getRangeChecksum(range) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = sheet.getSheetByName('Virtual_Table_Play');
  const rangeData = dataSheet.getRange(range).getValues();

  return {
    range: range,
    checksum: generateChecksum(rangeData),
    timestamp: new Date().toISOString()
  };
}

// 다중 범위 체크섬
function getMultiRangeChecksums() {
  const ranges = {
    handStatus: 'E:E',  // 핸드 완료 상태
    amounts: 'F:J',     // 금액 관련 열
    metadata: 'A:D'     // 메타데이터
  };

  const checksums = {};
  for (const [key, range] of Object.entries(ranges)) {
    checksums[key] = getRangeChecksum(range);
  }

  return checksums;
}
```

### 3.2 증분 체크섬
```javascript
// 행 단위 체크섬 저장
const rowChecksums = new Map();

function getIncrementalUpdates(clientChecksums) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = sheet.getSheetByName('Virtual_Table_Play');
  const allData = dataSheet.getDataRange().getValues();

  const updates = [];

  allData.forEach((row, index) => {
    const rowChecksum = generateChecksum(row);
    const clientRowChecksum = clientChecksums[index];

    if (rowChecksum !== clientRowChecksum) {
      updates.push({
        row: index,
        data: row,
        checksum: rowChecksum
      });
    }
  });

  return {
    updates: updates,
    fullChecksum: generateChecksum(allData),
    timestamp: new Date().toISOString()
  };
}
```

## 4. 구현 단계

### Phase 1: 기본 체크섬 (Week 1)
- [ ] Apps Script에 체크섬 생성 함수 추가
- [ ] 클라이언트에 체크섬 비교 로직 구현
- [ ] 성능 모니터링 통합

### Phase 2: 범위별 체크섬 (Week 2)
- [ ] 특정 열/범위 체크섬 구현
- [ ] 우선순위 기반 업데이트
- [ ] 부분 업데이트 UI 적용

### Phase 3: 증분 업데이트 (Week 3)
- [ ] 행 단위 체크섬 시스템
- [ ] 변경된 행만 전송
- [ ] 클라이언트 측 데이터 병합

## 5. 성능 목표

### 현재 (Before)
- API 호출: 8,640회/일 (10초마다)
- 데이터 전송: ~50MB/일
- 평균 지연: 500ms

### 목표 (After)
- API 호출: <500회/일 (94% 감소)
- 데이터 전송: <5MB/일 (90% 감소)
- 평균 지연: <100ms (80% 개선)

## 6. 에러 처리

```javascript
class ChecksumErrorHandler {
  constructor() {
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  async handleChecksumMismatch() {
    // 체크섬 불일치 시 전체 데이터 재동기화
    console.warn('체크섬 불일치 감지, 전체 동기화 시작');
    this.retryCount++;

    if (this.retryCount > this.maxRetries) {
      // 강제 리프레시
      window.location.reload();
    }

    return await this.forceFullSync();
  }

  async forceFullSync() {
    // 캐시 초기화 및 전체 데이터 새로 로드
    localStorage.removeItem('lastChecksum');
    localStorage.removeItem('cachedData');

    const fullData = await fetchFullData();
    localStorage.setItem('lastChecksum', fullData.checksum);
    localStorage.setItem('cachedData', JSON.stringify(fullData.data));

    return fullData;
  }
}
```

## 7. 테스트 시나리오

### 7.1 체크섬 정확성 테스트
```javascript
describe('Checksum Validation', () => {
  test('동일 데이터는 같은 체크섬 생성', () => {
    const data1 = [[1, 2, 3], [4, 5, 6]];
    const data2 = [[1, 2, 3], [4, 5, 6]];

    expect(generateChecksum(data1)).toBe(generateChecksum(data2));
  });

  test('다른 데이터는 다른 체크섬 생성', () => {
    const data1 = [[1, 2, 3]];
    const data2 = [[1, 2, 4]];

    expect(generateChecksum(data1)).not.toBe(generateChecksum(data2));
  });
});
```

### 7.2 성능 테스트
```javascript
describe('Performance Tests', () => {
  test('체크섬 생성 시간 < 10ms', async () => {
    const largeData = Array(1000).fill([1, 2, 3, 4, 5]);
    const start = performance.now();
    generateChecksum(largeData);
    const end = performance.now();

    expect(end - start).toBeLessThan(10);
  });

  test('체크섬 전송 크기 < 1KB', () => {
    const checksumData = { checksum: 'abc123', timestamp: new Date() };
    const size = JSON.stringify(checksumData).length;

    expect(size).toBeLessThan(1024);
  });
});
```

## 8. 모니터링 대시보드

```html
<div id="checksum-dashboard">
  <h3>Checksum 성능 지표</h3>
  <div class="metrics">
    <div class="metric">
      <label>체크섬 호출</label>
      <span id="checksum-calls">0</span>
    </div>
    <div class="metric">
      <label>데이터 호출</label>
      <span id="data-calls">0</span>
    </div>
    <div class="metric">
      <label>캐시 적중률</label>
      <span id="cache-hit-rate">0%</span>
    </div>
    <div class="metric">
      <label>평균 응답 시간</label>
      <span id="avg-response">0ms</span>
    </div>
  </div>
</div>
```

## 9. 마이그레이션 계획

### Week 1
1. 성능 모니터 배포 및 기준선 측정
2. Apps Script에 체크섬 엔드포인트 추가
3. 클라이언트 체크섬 매니저 구현

### Week 2
1. A/B 테스트 시작 (10% 사용자)
2. 성능 메트릭 비교
3. 점진적 롤아웃 (50% → 100%)

### Week 3
1. 전체 사용자 적용
2. 구 폴링 방식 제거
3. 최종 성능 리포트

## 10. 롤백 계획

```javascript
// 기능 플래그로 즉시 롤백 가능
const FEATURE_FLAGS = {
  useChecksum: true,  // false로 변경 시 기존 방식 사용
  checksumEndpoint: 'v2',
  fallbackEnabled: true
};

if (FEATURE_FLAGS.useChecksum) {
  // 체크섬 방식
  await checksumManager.checkForUpdates();
} else {
  // 기존 폴링 방식
  await legacyPolling();
}
```