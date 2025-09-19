# 📋 Google Apps Script SSE 구현 계획서

## 🎯 프로젝트 개요
**목표**: 자동 새로고침 없이 Google Apps Script의 Server-Sent Events(SSE)를 통해 실시간으로 새 핸드를 감지하고 UI에 추가

**핵심 기능**:
- Google Sheets에 새 핸드 추가 시 자동 감지
- SSE를 통한 실시간 푸시 알림
- 페이지 새로고침 없이 DOM 업데이트
- 알림 및 사운드 효과

## 🏗️ 아키텍처

```
[Google Sheets]
    ↓ (새 행 추가)
[Apps Script Trigger]
    ↓ (onChange/onEdit)
[SSE Endpoint]
    ↓ (Server-Sent Events)
[Browser EventSource]
    ↓ (실시간 수신)
[UI Update]
```

## 📦 구현 컴포넌트

### 1. Google Apps Script (서버)
- **SSE 엔드포인트**: 새 핸드 이벤트 스트리밍
- **변경 감지**: onChange 트리거로 시트 변경 감지
- **이벤트 큐**: 새 핸드 정보 임시 저장
- **클라이언트 관리**: 연결된 클라이언트 추적

### 2. index.html (클라이언트)
- **EventSource 연결**: SSE 엔드포인트 구독
- **이벤트 핸들러**: 새 핸드 이벤트 처리
- **DOM 업데이트**: 핸드 목록에 동적 추가
- **재연결 로직**: 연결 끊김 시 자동 재연결

### 3. 데이터 흐름
1. Google Sheets에 새 핸드 데이터 추가
2. Apps Script onChange 트리거 발동
3. 새 핸드 정보를 이벤트 큐에 저장
4. SSE 연결된 클라이언트에게 이벤트 전송
5. 브라우저에서 이벤트 수신 및 UI 업데이트

## 🚀 구현 체크리스트

### Phase 1: Apps Script 서버 구현

#### 1.1 기본 SSE 엔드포인트
- [ ] doGet() 함수로 SSE 응답 헤더 설정
- [ ] text/event-stream Content-Type 설정
- [ ] CORS 헤더 설정
- [ ] Keep-alive 메시지 구현

#### 1.2 시트 변경 감지
- [ ] onChange 트리거 함수 작성
- [ ] 새 핸드 판별 로직 구현
- [ ] 핸드 정보 추출 (번호, 시간, 테이블 등)
- [ ] PropertiesService로 이벤트 큐 관리

#### 1.3 이벤트 스트리밍
- [ ] 이벤트 큐에서 데이터 읽기
- [ ] SSE 포맷으로 이벤트 전송
- [ ] 이벤트 ID 관리
- [ ] 하트비트 메시지 구현

### Phase 2: 클라이언트 구현

#### 2.1 EventSource 연결
- [ ] EventSource 객체 생성
- [ ] SSE URL 설정 (Apps Script Web App URL)
- [ ] 연결 상태 관리
- [ ] 에러 핸들링

#### 2.2 이벤트 처리
- [ ] onmessage 핸들러 구현
- [ ] 새 핸드 데이터 파싱
- [ ] 중복 체크 로직
- [ ] 이벤트 타입별 처리

#### 2.3 UI 업데이트
- [ ] 핸드 엘리먼트 동적 생성
- [ ] 목록에 추가 (prepend)
- [ ] 애니메이션 효과
- [ ] 알림 표시

#### 2.4 재연결 로직
- [ ] 연결 끊김 감지
- [ ] 자동 재연결 (exponential backoff)
- [ ] 연결 상태 UI 표시
- [ ] 수동 재연결 버튼

### Phase 3: 통합 및 최적화

#### 3.1 데이터 동기화
- [ ] 초기 로드 시 기존 데이터 로드
- [ ] SSE로 받은 데이터와 병합
- [ ] masterHandList 업데이트
- [ ] localStorage 동기화

#### 3.2 성능 최적화
- [ ] 이벤트 디바운싱
- [ ] 메모리 관리 (오래된 이벤트 정리)
- [ ] 연결 풀링
- [ ] 배치 업데이트

#### 3.3 안정성
- [ ] 네트워크 에러 처리
- [ ] 타임아웃 관리
- [ ] 폴백 메커니즘 (SSE 실패 시)
- [ ] 로깅 및 모니터링

### Phase 4: 테스트 및 배포

#### 4.1 단위 테스트
- [ ] Apps Script 함수 테스트
- [ ] EventSource 연결 테스트
- [ ] 이벤트 파싱 테스트
- [ ] UI 업데이트 테스트

#### 4.2 통합 테스트
- [ ] 전체 플로우 테스트
- [ ] 다중 클라이언트 테스트
- [ ] 장시간 연결 테스트
- [ ] 에러 시나리오 테스트

#### 4.3 배포
- [ ] Apps Script 배포 (새 버전)
- [ ] index.html 업데이트
- [ ] 환경 변수 설정
- [ ] 문서화

## 📝 코드 예시

### Apps Script (서버)
```javascript
// SSE 엔드포인트
function doGet(e) {
  if (e.parameter.mode === 'sse') {
    return ContentService
      .createTextOutput(getSSEStream())
      .setMimeType(ContentService.MimeType.TEXT)
      .addHeader('Content-Type', 'text/event-stream')
      .addHeader('Cache-Control', 'no-cache')
      .addHeader('Access-Control-Allow-Origin', '*');
  }
}

// 이벤트 스트림 생성
function getSSEStream() {
  const events = getNewHandEvents();
  let output = '';

  events.forEach(event => {
    output += `id: ${event.id}\n`;
    output += `event: newHand\n`;
    output += `data: ${JSON.stringify(event.data)}\n\n`;
  });

  // Keep-alive
  output += `: heartbeat\n\n`;

  return output;
}

// 시트 변경 감지
function onSheetChange(e) {
  const newHand = detectNewHand(e);
  if (newHand) {
    addToEventQueue(newHand);
  }
}
```

### index.html (클라이언트)
```javascript
class SSEHandDetector {
  constructor() {
    this.eventSource = null;
    this.reconnectTimeout = 1000;
  }

  connect() {
    const sseUrl = `${APPS_SCRIPT_URL}?mode=sse`;
    this.eventSource = new EventSource(sseUrl);

    this.eventSource.onopen = () => {
      console.log('✅ SSE 연결 성공');
      this.updateConnectionStatus('connected');
      this.reconnectTimeout = 1000;
    };

    this.eventSource.addEventListener('newHand', (e) => {
      const handData = JSON.parse(e.data);
      this.handleNewHand(handData);
    });

    this.eventSource.onerror = () => {
      console.error('❌ SSE 연결 오류');
      this.reconnect();
    };
  }

  handleNewHand(handData) {
    // 중복 체크
    if (masterHandList.has(handData.handNumber)) return;

    // 마스터 리스트에 추가
    masterHandList.set(handData.handNumber, handData);

    // UI 업데이트
    this.addHandToUI(handData);

    // 알림
    showNotification(`새 핸드 #${handData.handNumber} 추가됨!`);
    playSound('notification');
  }

  addHandToUI(handData) {
    const handElement = createHandElement(handData);
    handElement.classList.add('new-hand-animation');
    document.querySelector('.hands-container').prepend(handElement);
  }

  reconnect() {
    this.updateConnectionStatus('reconnecting');
    setTimeout(() => {
      this.connect();
      this.reconnectTimeout = Math.min(this.reconnectTimeout * 2, 30000);
    }, this.reconnectTimeout);
  }
}

// 초기화
const sseDetector = new SSEHandDetector();
sseDetector.connect();
```

## 🎯 예상 결과

### 장점
- ✅ 실시간 새 핸드 감지
- ✅ 페이지 새로고침 불필요
- ✅ 서버 부하 최소화
- ✅ 사용자 경험 향상

### 단점
- ⚠️ Apps Script 실행 시간 제한 (6분)
- ⚠️ 동시 연결 수 제한
- ⚠️ 네트워크 의존성

## 📅 타임라인

| Phase | 작업 | 예상 시간 |
|-------|------|-----------|
| Phase 1 | Apps Script 서버 구현 | 2-3시간 |
| Phase 2 | 클라이언트 구현 | 2-3시간 |
| Phase 3 | 통합 및 최적화 | 1-2시간 |
| Phase 4 | 테스트 및 배포 | 1시간 |
| **총계** | | **6-9시간** |

## 🔧 필요 리소스

1. Google Apps Script 프로젝트
2. Google Sheets (데이터 소스)
3. Apps Script Web App URL
4. CORS 설정
5. 테스트 환경

## 📚 참고 자료

- [Apps Script Web Apps](https://developers.google.com/apps-script/guides/web)
- [Server-Sent Events MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)

---

**작성일**: 2025-09-19
**버전**: v1.0.0
**담당**: Development Team