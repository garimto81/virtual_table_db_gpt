# 🔍 시간 매칭 실패 문제 분석 및 해결 체크리스트

## 📊 현상 분석

### 관찰된 패턴
1. **성공 케이스** ✅
   - 11:24 → 행 693 매칭 성공
   - 15:28 → 행 939 매칭 성공

2. **실패 케이스** ❌
   - 19:22, 17:53, 17:27 → 매칭 실패
   - 23:20, 23:11, 23:08, 23:04 → 매칭 실패
   - 22:28, 22:26, 22:21, 22:09, 22:04 → 매칭 실패
   - 21:50 → 매칭 실패

### 패턴 분석 결과
- **성공**: 오전~오후 시간대 (11:24, 15:28)
- **실패**: 저녁~밤 시간대 (17:27 이후 모두 실패)

## 🎯 원인 추론

### 가능성 1: 날짜 경계 문제 (가능성 높음 🔴)
```
추론: 타임스탬프가 다른 날짜를 가리키고 있을 가능성
- Hand 데이터: 오늘 날짜 기준
- Virtual 시트: 어제 날짜 기준
- 또는 그 반대
```

### 가능성 2: 타임존 불일치 (가능성 중간 🟡)
```
추론: 서로 다른 타임존 사용
- Hand 데이터: UTC 또는 다른 타임존
- Virtual 시트: 로컬 시간
```

### 가능성 3: 데이터 범위 제한 (가능성 중간 🟡)
```
추론: Virtual 시트에 특정 시간대 데이터만 존재
- 캐시된 데이터가 일부 시간대만 포함
- CSV 데이터 자체가 불완전
```

### 가능성 4: 타임스탬프 오프셋 (가능성 높음 🔴)
```
추론: 이전에 확인된 4000초 오프셋 문제 재발
- 특정 시간대에만 오프셋 적용
- 일관되지 않은 오프셋 적용
```

## ✅ 원인 확인 체크리스트

### 1️⃣ 타임스탬프 검증
- [ ] **타임스탬프 → 날짜 변환 확인**
  ```javascript
  // 실패한 타임스탬프들의 정확한 날짜 확인
  const timestamps = [1758018149, 1758012781, 1757946013];
  timestamps.forEach(ts => {
    const date = new Date(ts * 1000);
    console.log(`${ts} → ${date.toLocaleString()}`);
  });
  ```

- [ ] **Virtual 시트 날짜 범위 확인**
  ```javascript
  // 캐시된 데이터의 날짜 범위 확인
  const dates = Array.from(sheetDataCache.cache.values())
    .map(row => row.time)
    .filter(time => time);
  console.log('Virtual 시트 시간 범위:', dates.slice(0, 10));
  ```

### 2️⃣ 데이터 일치성 검증
- [ ] **Hand 데이터의 날짜 확인**
- [ ] **Virtual 시트의 날짜 확인**
- [ ] **타임스탬프 기준 날짜 확인**

### 3️⃣ 캐시 상태 검증
- [ ] **캐시 데이터 완전성 확인**
  ```javascript
  console.log('캐시 크기:', sheetDataCache.cache.size);
  console.log('시간 인덱스:', sheetDataCache.timeIndex.size);
  ```

- [ ] **특정 시간대 데이터 존재 확인**
  ```javascript
  // 22시~23시 데이터 존재 여부
  const nightData = Array.from(sheetDataCache.cache.values())
    .filter(row => {
      const hour = parseInt(row.time?.split(':')[0]);
      return hour >= 22 || hour <= 2;
    });
  console.log('밤 시간대 데이터:', nightData.length);
  ```

## 🛠️ 문제 해결 체크리스트

### 단계 1: 즉시 적용 가능한 수정

#### 1.1 날짜 경계 처리 개선
- [ ] **타임스탬프 변환 시 날짜 보정**
  ```javascript
  parseTimeToTimestamp(timeStr) {
    // ... 기존 코드 ...

    // 날짜가 미래인 경우 어제로 설정
    const now = new Date();
    if (today > now) {
      today.setDate(today.getDate() - 1);
    }

    // 날짜가 너무 과거인 경우 오늘로 설정
    const hoursDiff = (now - today) / (1000 * 60 * 60);
    if (hoursDiff > 24) {
      today.setDate(today.getDate() + 1);
    }

    return Math.floor(today.getTime() / 1000);
  }
  ```

#### 1.2 다중 날짜 매칭 시도
- [ ] **오늘, 어제, 내일 날짜로 각각 매칭 시도**
  ```javascript
  findClosestRow(targetTimestamp, tolerance = 180) {
    // 1. 원본 타임스탬프로 시도
    let result = this.tryMatch(targetTimestamp);

    // 2. 하루 전 날짜로 시도
    if (!result) {
      result = this.tryMatch(targetTimestamp - 86400);
    }

    // 3. 하루 후 날짜로 시도
    if (!result) {
      result = this.tryMatch(targetTimestamp + 86400);
    }

    return result;
  }
  ```

### 단계 2: 오프셋 보정 강화

#### 2.1 동적 오프셋 감지
- [ ] **매칭 실패 시 오프셋 자동 계산**
  ```javascript
  detectOffset(targetTime) {
    // Virtual 시트에서 같은 시간 찾기
    const targetHM = targetTime.substring(0, 5); // HH:MM

    for (const [ts, rows] of this.timeIndex) {
      const time = this.timestampToTime(ts);
      if (time.startsWith(targetHM)) {
        const offset = targetTimestamp - ts;
        console.log(`오프셋 감지: ${offset}초`);
        return offset;
      }
    }
    return 0;
  }
  ```

#### 2.2 오프셋 캐싱
- [ ] **감지된 오프셋 저장 및 재사용**
  ```javascript
  class OffsetManager {
    constructor() {
      this.offsets = new Map(); // 시간대별 오프셋 저장
    }

    getOffset(hour) {
      return this.offsets.get(hour) || 0;
    }

    setOffset(hour, offset) {
      this.offsets.set(hour, offset);
    }
  }
  ```

### 단계 3: 알고리즘 개선

#### 3.1 퍼지 매칭 구현
- [ ] **시간만으로 매칭 (날짜 무시)**
  ```javascript
  findByTimeOnly(targetTime) {
    const hm = targetTime.substring(0, 5); // HH:MM

    // 정확한 매칭
    for (const [row, data] of this.cache) {
      if (data.time?.startsWith(hm)) {
        return data;
      }
    }

    // 근사 매칭 (±1분)
    const [h, m] = hm.split(':').map(Number);
    const variants = [
      `${h}:${String(m-1).padStart(2, '0')}`,
      `${h}:${String(m+1).padStart(2, '0')}`
    ];

    for (const variant of variants) {
      for (const [row, data] of this.cache) {
        if (data.time?.startsWith(variant)) {
          return data;
        }
      }
    }

    return null;
  }
  ```

#### 3.2 스마트 폴백 체인
- [ ] **다단계 폴백 전략**
  ```javascript
  findBestMatch(targetTimestamp) {
    const strategies = [
      () => this.exactMatch(targetTimestamp),
      () => this.offsetMatch(targetTimestamp, 4000),
      () => this.dateShiftMatch(targetTimestamp),
      () => this.timeOnlyMatch(targetTimestamp),
      () => this.fuzzyMatch(targetTimestamp, 300)
    ];

    for (const strategy of strategies) {
      const result = strategy();
      if (result) {
        console.log(`매칭 성공: ${strategy.name}`);
        return result;
      }
    }

    return null;
  }
  ```

### 단계 4: 디버깅 및 모니터링

#### 4.1 상세 로깅 추가
- [ ] **매칭 과정 상세 기록**
  ```javascript
  enableDebugMode() {
    this.debugMode = true;
    this.matchingLog = [];
  }

  logMatch(step, success, details) {
    if (this.debugMode) {
      this.matchingLog.push({
        timestamp: Date.now(),
        step,
        success,
        details
      });
    }
  }
  ```

#### 4.2 매칭 통계 수집
- [ ] **성공/실패 패턴 분석**
  ```javascript
  class MatchingStats {
    constructor() {
      this.stats = {
        total: 0,
        success: 0,
        failureByHour: new Map(),
        successByStrategy: new Map()
      };
    }

    record(hour, success, strategy) {
      this.stats.total++;
      if (success) {
        this.stats.success++;
        this.stats.successByStrategy.set(
          strategy,
          (this.stats.successByStrategy.get(strategy) || 0) + 1
        );
      } else {
        this.stats.failureByHour.set(
          hour,
          (this.stats.failureByHour.get(hour) || 0) + 1
        );
      }
    }

    getReport() {
      console.table({
        '성공률': (this.stats.success / this.stats.total * 100).toFixed(1) + '%',
        '실패 시간대': Array.from(this.stats.failureByHour.keys()).join(', '),
        '주요 전략': Array.from(this.stats.successByStrategy.entries())
          .sort((a, b) => b[1] - a[1])[0]?.[0]
      });
    }
  }
  ```

## 📊 검증 체크리스트

### 수정 후 테스트
- [ ] 11:24, 15:28 → 여전히 성공하는지 확인
- [ ] 19:22, 17:53 → 매칭 성공하는지 확인
- [ ] 22:00~23:59 → 밤 시간대 매칭 확인
- [ ] 00:00~02:00 → 자정 넘는 시간 매칭 확인

### 성능 확인
- [ ] 매칭 속도 저하 없는지 확인
- [ ] 메모리 사용량 증가 없는지 확인
- [ ] 폴백 전략이 너무 많이 실행되지 않는지 확인

### 안정성 확인
- [ ] 기존 성공 케이스 영향 없는지 확인
- [ ] 새로운 에러 발생하지 않는지 확인
- [ ] 캐시 무효화 정상 동작하는지 확인

## 🚀 우선순위 실행 계획

### 🔴 최우선 (즉시)
1. 타임스탬프 디버깅 로그 추가
2. Virtual 시트 데이터 범위 확인
3. 날짜 경계 처리 개선

### 🟡 높음 (1시간 내)
1. 다중 날짜 매칭 구현
2. 시간만 매칭 폴백 추가
3. 매칭 통계 수집

### 🟢 보통 (오늘 중)
1. 동적 오프셋 감지
2. 스마트 폴백 체인
3. 상세 모니터링 대시보드

---

**작성일**: 2025-09-18
**목표**: 시간 매칭 성공률 99% 이상 달성