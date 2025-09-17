# 🚀 Virtual Table DB 성능 최적화 개발 계획서

## 📌 프로젝트 개요
**목표**: 시트 상태 확인을 개별 API 호출에서 일괄 처리로 전환하여 성능 최대 10배 향상
**현재 버전**: v10.2.2
**목표 버전**: v11.0.0

---

## 🎯 핵심 문제점 및 해결 방안

### 현재 문제점
| 문제 | 영향 | 우선순위 |
|------|------|----------|
| 핸드별 개별 API 호출 | 10개 핸드 = 20+ API 호출 | 🔴 긴급 |
| 중복 시트 매칭 | 동일 데이터 반복 조회 | 🔴 긴급 |
| 순차적 처리 | UI 응답 지연 (3-5초) | 🟡 높음 |
| 캐싱 없음 | 불필요한 네트워크 트래픽 | 🟡 높음 |

### 해결 방안
1. **일괄 처리 API**: 한 번의 호출로 모든 핸드 상태 확인
2. **스마트 캐싱**: 5분간 시트 데이터 메모리 캐싱
3. **병렬 처리**: Promise.all()로 동시 실행
4. **인덱싱**: 시간 기반 빠른 검색

---

## 📋 개발 체크리스트

### 🔥 Phase 1: 즉시 적용 (2시간)

#### A. 일괄 상태 확인 API
- [ ] Apps Script에 `batchVerifyStatus` 엔드포인트 추가
- [ ] 여러 행 번호를 배열로 받아 한 번에 처리
- [ ] E열 상태를 객체로 반환
- [ ] 에러 처리 및 로깅

```javascript
// Apps Script 예시
function batchVerifyStatus(rows) {
  const results = {};
  rows.forEach(row => {
    results[row] = sheet.getRange(row, 5).getValue();
  });
  return results;
}
```

#### B. 프론트엔드 일괄 처리
- [ ] `checkAllHandsStatus()` 함수 구현
- [ ] 가시적인 핸드만 선택적 업데이트
- [ ] UI 일괄 업데이트 로직
- [ ] 로딩 상태 표시

```javascript
// Frontend 예시
async function checkAllHandsStatus(handNumbers) {
  const timestamps = await Promise.all(
    handNumbers.map(getHandTimestamp)
  );
  const rows = await findMatchingRows(timestamps);
  return await batchVerifyStatus(rows);
}
```

### 🚀 Phase 2: 단기 개선 (1일)

#### A. 캐싱 시스템
- [ ] `SheetDataCache` 클래스 구현
- [ ] TTL (Time To Live) 5분 설정
- [ ] 자동 갱신 메커니즘
- [ ] 메모리 관리 (최대 1000행)

```javascript
class SheetDataCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5분
    this.lastUpdate = null;
  }

  async refresh() {
    if (Date.now() - this.lastUpdate > this.ttl) {
      await this.loadFullSheet();
    }
  }
}
```

#### B. 인덱싱 시스템
- [ ] 시간 기반 B-Tree 인덱스
- [ ] O(log n) 검색 성능
- [ ] 범위 쿼리 지원 (±3분)
- [ ] 인덱스 자동 업데이트

#### C. 병렬 처리 최적화
- [ ] Promise.all() 적용
- [ ] 동시 실행 제한 (최대 5개)
- [ ] 실패 시 재시도 로직
- [ ] 부분 실패 처리

### 💫 Phase 3: 장기 개선 (1주)

#### A. 실시간 동기화
- [ ] WebSocket 서버 구축
- [ ] 시트 변경 이벤트 구독
- [ ] 실시간 UI 업데이트
- [ ] 연결 복구 메커니즘

#### B. 고급 캐싱
- [ ] IndexedDB 로컬 저장소
- [ ] Service Worker 백그라운드 동기화
- [ ] 오프라인 모드 완벽 지원
- [ ] 델타 업데이트

#### C. 성능 모니터링
- [ ] Performance API 통합
- [ ] 응답 시간 측정
- [ ] 병목 지점 자동 감지
- [ ] 사용자별 성능 리포트

---

## 📊 성능 목표 및 측정 지표

### 목표 지표
| 지표 | 현재 | 목표 | 개선율 |
|------|------|------|--------|
| 10개 핸드 로드 시간 | 3-5초 | 0.5초 | 10x |
| API 호출 횟수 | 20+ | 1-2 | 95% 감소 |
| 메모리 사용량 | 50MB | 30MB | 40% 감소 |
| 첫 화면 로딩 | 2초 | 0.8초 | 60% 개선 |

### 측정 방법
```javascript
// 성능 측정 코드
const perfMeasure = {
  start: performance.now(),

  measure(label) {
    const duration = performance.now() - this.start;
    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    return duration;
  }
};
```

---

## 🗓️ 개발 일정

### Day 1 (4시간)
- [x] 09:00 - 요구사항 분석 및 계획 수립
- [ ] 10:00 - Apps Script 일괄 API 개발
- [ ] 11:00 - Frontend 일괄 처리 구현
- [ ] 12:00 - 초기 테스트 및 디버깅

### Day 2 (6시간)
- [ ] 09:00 - 캐싱 시스템 구현
- [ ] 11:00 - 인덱싱 시스템 개발
- [ ] 14:00 - 병렬 처리 최적화
- [ ] 16:00 - 통합 테스트

### Day 3-5 (선택적)
- [ ] WebSocket 실시간 동기화
- [ ] 고급 캐싱 메커니즘
- [ ] 성능 모니터링 대시보드

---

## 🧪 테스트 계획

### 단위 테스트
- [ ] 일괄 API 응답 검증
- [ ] 캐시 TTL 동작
- [ ] 인덱스 검색 정확도
- [ ] 에러 처리

### 통합 테스트
- [ ] 100개 핸드 동시 로드
- [ ] 네트워크 끊김 시나리오
- [ ] 시트 권한 변경
- [ ] API 할당량 초과

### 성능 테스트
- [ ] 1000개 핸드 벤치마크
- [ ] 메모리 누수 체크
- [ ] CPU 사용률 모니터링
- [ ] 네트워크 대역폭 측정

---

## 🚨 위험 요소 및 대응 방안

| 위험 | 확률 | 영향 | 대응 방안 |
|------|------|------|-----------|
| API 할당량 초과 | 중 | 높음 | 지수 백오프 재시도 |
| 캐시 동기화 문제 | 낮음 | 중간 | 수동 새로고침 버튼 |
| 메모리 부족 | 낮음 | 높음 | LRU 캐시 전략 |
| 네트워크 지연 | 중 | 중간 | 타임아웃 및 폴백 |

---

## 📝 구현 예시 코드

### 1. Apps Script - 일괄 처리
```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  if (data.action === 'batchVerify') {
    const sheet = SpreadsheetApp.openByUrl(data.sheetUrl).getActiveSheet();
    const results = {};

    // 일괄 처리로 성능 향상
    const values = sheet.getRange(1, 1, sheet.getMaxRows(), 8).getValues();

    data.rows.forEach(rowNum => {
      if (rowNum > 0 && rowNum <= values.length) {
        results[rowNum] = {
          status: values[rowNum - 1][4], // E열
          filename: values[rowNum - 1][5], // F열
          analysis: values[rowNum - 1][7]  // H열
        };
      }
    });

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: results
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 2. Frontend - 캐싱 관리자
```javascript
class SheetDataManager {
  constructor() {
    this.cache = new Map();
    this.timeIndex = new Map();
    this.ttl = 5 * 60 * 1000;
    this.lastUpdate = 0;
  }

  async ensureFresh() {
    if (Date.now() - this.lastUpdate > this.ttl) {
      await this.refreshCache();
    }
  }

  async refreshCache() {
    console.log('🔄 캐시 갱신 시작...');
    const data = await this.fetchFullSheet();

    // 시간 인덱스 구축
    data.forEach((row, index) => {
      const time = this.parseTime(row.time);
      if (time) {
        this.timeIndex.set(time, index);
      }
    });

    this.cache = new Map(data.map(row => [row.rowNumber, row]));
    this.lastUpdate = Date.now();
    console.log('✅ 캐시 갱신 완료:', this.cache.size, '행');
  }

  async checkMultipleHands(handNumbers) {
    await this.ensureFresh();

    const results = {};
    for (const handNum of handNumbers) {
      const timestamp = await getHandTimestamp(handNum);
      const row = this.findClosestRow(timestamp);
      if (row) {
        results[handNum] = row.status;
      }
    }

    return results;
  }

  findClosestRow(targetTime, tolerance = 180) {
    // O(log n) 이진 검색
    const times = Array.from(this.timeIndex.keys()).sort();
    let left = 0, right = times.length - 1;
    let closest = null;
    let minDiff = Infinity;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const diff = Math.abs(times[mid] - targetTime);

      if (diff < minDiff && diff <= tolerance) {
        minDiff = diff;
        closest = times[mid];
      }

      if (times[mid] < targetTime) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return closest ? this.cache.get(this.timeIndex.get(closest)) : null;
  }
}

// 전역 인스턴스
const sheetManager = new SheetDataManager();
```

### 3. UI 일괄 업데이트
```javascript
async function updateAllHandsUI() {
  const startTime = performance.now();

  // 화면에 보이는 핸드만 처리
  const visibleHands = Array.from(document.querySelectorAll('.hand-item'))
    .filter(el => isElementInViewport(el))
    .map(el => parseInt(el.dataset.handNumber));

  if (visibleHands.length === 0) return;

  console.log(`🔍 ${visibleHands.length}개 핸드 상태 확인 중...`);

  // 일괄 상태 확인
  const statuses = await sheetManager.checkMultipleHands(visibleHands);

  // UI 일괄 업데이트
  requestAnimationFrame(() => {
    for (const [handNum, status] of Object.entries(statuses)) {
      updateButtonState(handNum, status);
    }

    const duration = performance.now() - startTime;
    console.log(`✅ UI 업데이트 완료: ${duration.toFixed(0)}ms`);
  });
}

// 뷰포트 체크
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
}
```

---

## ✅ 완료 기준

### Phase 1 완료 (필수)
- [ ] 10개 핸드 로드 시간 < 1초
- [ ] API 호출 90% 감소
- [ ] 에러율 < 1%

### Phase 2 완료 (권장)
- [ ] 캐시 적중률 > 80%
- [ ] 메모리 사용량 < 40MB
- [ ] 응답 시간 편차 < 200ms

### Phase 3 완료 (선택)
- [ ] 실시간 동기화 지연 < 100ms
- [ ] 오프라인 모드 100% 작동
- [ ] 성능 대시보드 구축

---

## 📞 문의 및 지원

- **기술 문의**: GitHub Issues
- **긴급 지원**: 개발팀 Slack 채널
- **문서**: /docs/performance-optimization.md

---

*최종 업데이트: 2025-09-17 | 버전: v10.2.2 → v11.0.0 (계획)*