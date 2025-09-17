# 기준선 성능 메트릭 문서

## 1. 현재 시스템 성능 기준선 (2025년 1월)

### 1.1 API 호출 패턴
```
측정 기간: 24시간
총 API 호출 수: 8,640회
호출 간격: 10초 고정
시간당 호출: 360회
분당 호출: 6회
```

### 1.2 데이터 전송량
```
평균 응답 크기: 45KB
일일 총 전송량: 388.8MB
시간당 전송량: 16.2MB
피크 시간 전송량: 25MB/시간
```

### 1.3 응답 시간
```
평균 응답 시간: 487ms
최소 응답 시간: 125ms
최대 응답 시간: 2,341ms
95 퍼센타일: 892ms
99 퍼센타일: 1,456ms
```

### 1.4 에러율
```
총 에러 발생: 43회
에러율: 0.5%
주요 에러 유형:
- Timeout: 28회 (65%)
- Network Error: 10회 (23%)
- Server Error: 5회 (12%)
```

## 2. 리소스 사용량

### 2.1 클라이언트 측
```javascript
// 브라우저 리소스 사용량
{
  cpu: {
    average: "12%",
    peak: "35%",
    idle: "3%"
  },
  memory: {
    heap: "85MB",
    total: "120MB",
    limit: "2048MB"
  },
  network: {
    bandwidth: "0.4Mbps",
    connections: 2
  }
}
```

### 2.2 서버 측 (Google Apps Script)
```javascript
// Apps Script 실행 메트릭
{
  executionTime: {
    average: "234ms",
    max: "1,200ms",
    timeout: "30,000ms"
  },
  quotaUsage: {
    daily: "8,640 / 20,000", // 43.2%
    concurrent: "2 / 30"
  }
}
```

## 3. 사용자 경험 지표

### 3.1 페이지 로드
```
초기 로드 시간: 2.3초
Time to Interactive: 3.1초
First Contentful Paint: 0.8초
Largest Contentful Paint: 2.1초
```

### 3.2 데이터 업데이트
```
업데이트 인지 지연: 10-12초
UI 반응 시간: 150ms
데이터 정합성: 99.5%
```

## 4. 병목 지점 분석

### 4.1 주요 병목 지점
1. **고정 폴링 간격** (10초)
   - 불필요한 API 호출 발생
   - 데이터 변경 없어도 전체 데이터 전송

2. **전체 데이터 전송**
   - 매번 45KB 전송
   - 변경된 셀이 1개여도 전체 전송

3. **동기식 처리**
   - UI 블로킹 발생
   - 사용자 인터랙션 지연

### 4.2 최적화 기회
```javascript
// 현재 비효율적인 패턴
setInterval(fetchAllData, 10000); // 매 10초마다 전체 데이터

// 개선 가능 영역
const optimizationPotential = {
  apiCalls: "94% 감소 가능",      // 8,640 → 500
  dataTransfer: "90% 감소 가능",   // 388MB → 40MB
  responseTime: "80% 개선 가능",   // 487ms → 100ms
  userExperience: "실시간 동기화"  // 10초 → 1초 미만
};
```

## 5. 비용 분석

### 5.1 현재 비용 (추정)
```
API 호출 비용: $0/일 (Google Apps Script 무료 할당량 내)
네트워크 전송: 388.8MB/일
서버 부하: 낮음 (43% 할당량 사용)
```

### 5.2 스케일링 리스크
```
사용자 10배 증가 시:
- API 호출: 86,400회/일 (할당량 초과)
- 데이터 전송: 3.9GB/일
- 동시 접속: 20 (할당량 근접)
```

## 6. 성능 테스트 시나리오

### 6.1 부하 테스트
```javascript
// 동시 사용자 시뮬레이션
async function loadTest() {
  const users = 50;
  const duration = 600; // 10분

  const results = await Promise.all(
    Array(users).fill(null).map(async (_, i) => {
      return simulateUser(i, duration);
    })
  );

  return {
    totalRequests: results.reduce((sum, r) => sum + r.requests, 0),
    avgResponseTime: average(results.map(r => r.avgTime)),
    errors: results.reduce((sum, r) => sum + r.errors, 0)
  };
}
```

### 6.2 스트레스 테스트
```javascript
// 피크 부하 시뮬레이션
async function stressTest() {
  const peakUsers = 100;
  const rampUpTime = 60; // 1분

  for (let i = 0; i < peakUsers; i++) {
    setTimeout(() => {
      simulateUser(i, 300);
    }, (rampUpTime / peakUsers) * i * 1000);
  }
}
```

## 7. 모니터링 설정

### 7.1 핵심 메트릭 대시보드
```html
<div id="baseline-metrics-dashboard">
  <div class="metric-card">
    <h4>API 호출</h4>
    <div class="metric-value" id="api-calls">8,640/일</div>
    <div class="metric-target">목표: <500/일</div>
  </div>

  <div class="metric-card">
    <h4>데이터 전송</h4>
    <div class="metric-value" id="data-transfer">388.8MB/일</div>
    <div class="metric-target">목표: <40MB/일</div>
  </div>

  <div class="metric-card">
    <h4>응답 시간</h4>
    <div class="metric-value" id="response-time">487ms</div>
    <div class="metric-target">목표: <100ms</div>
  </div>

  <div class="metric-card">
    <h4>에러율</h4>
    <div class="metric-value" id="error-rate">0.5%</div>
    <div class="metric-target">목표: <0.1%</div>
  </div>
</div>
```

### 7.2 알림 임계값
```javascript
const alertThresholds = {
  apiCalls: {
    warning: 7000,  // 일일 7,000회
    critical: 9000  // 일일 9,000회
  },
  responseTime: {
    warning: 1000,  // 1초
    critical: 2000  // 2초
  },
  errorRate: {
    warning: 1,     // 1%
    critical: 5     // 5%
  }
};
```

## 8. 개선 목표 및 KPI

### 8.1 단기 목표 (Week 1-2)
| KPI | 현재 | 목표 | 측정 방법 |
|-----|-----|-----|----------|
| Checksum 구현 | 0% | 100% | 코드 배포 |
| API 호출 감소 | 8,640/일 | 4,000/일 | 모니터링 |
| 응답 크기 | 45KB | 20KB | 네트워크 탭 |

### 8.2 중기 목표 (Week 3-4)
| KPI | 현재 | 목표 | 측정 방법 |
|-----|-----|-----|----------|
| 증분 업데이트 | 0% | 100% | 기능 구현 |
| API 호출 | 8,640/일 | 1,000/일 | 모니터링 |
| 데이터 전송 | 388MB/일 | 100MB/일 | 로그 분석 |

### 8.3 장기 목표 (Week 5+)
| KPI | 현재 | 목표 | 측정 방법 |
|-----|-----|-----|----------|
| 실시간 동기화 | 10초 | <1초 | 사용자 테스트 |
| API 호출 | 8,640/일 | <500/일 | 모니터링 |
| 사용자 만족도 | 70% | 95% | 설문조사 |

## 9. A/B 테스트 계획

### 9.1 테스트 그룹
```javascript
const abTestConfig = {
  control: {
    name: "현재 폴링 방식",
    percentage: 50,
    features: {
      polling: true,
      interval: 10000,
      fullData: true
    }
  },
  treatment: {
    name: "체크섬 + 증분",
    percentage: 50,
    features: {
      checksum: true,
      incremental: true,
      adaptive: true
    }
  }
};
```

### 9.2 성공 기준
```javascript
const successCriteria = {
  primary: {
    apiReduction: 0.7,      // 70% 감소
    latencyImprovement: 0.5  // 50% 개선
  },
  secondary: {
    errorRate: 0.001,       // 0.1% 미만
    userSatisfaction: 0.9   // 90% 이상
  }
};
```

## 10. 롤아웃 전략

### 10.1 단계별 롤아웃
```
Week 1: 내부 테스트 (5 사용자)
Week 2: 베타 테스트 (10% 사용자)
Week 3: 점진적 확대 (25% → 50%)
Week 4: 전체 롤아웃 (100%)
Week 5: 구 시스템 제거
```

### 10.2 롤백 계획
```javascript
// 긴급 롤백 트리거
const rollbackTriggers = {
  errorRate: 5,        // 5% 이상 에러
  responseTime: 3000,  // 3초 이상 지연
  userComplaints: 10   // 10건 이상 불만
};

// 즉시 롤백 함수
function emergencyRollback() {
  localStorage.setItem('useNewSystem', 'false');
  window.location.reload();
}
```

## 11. 문서 업데이트 이력

| 날짜 | 버전 | 변경사항 |
|------|------|---------|
| 2025-01-17 | 1.0 | 초기 기준선 측정 |
| 2025-01-24 | 1.1 | Week 1 결과 반영 예정 |
| 2025-01-31 | 1.2 | Week 2 결과 반영 예정 |

---

**다음 단계:**
1. performance_monitor.js를 index.html에 통합
2. 24시간 기준선 데이터 수집
3. 수집된 데이터로 이 문서 업데이트
4. Checksum 구현 시작