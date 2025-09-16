# 📚 Virtual Table DB Claude - 통합 프로젝트 문서

## 📋 프로젝트 개요

Virtual Table DB는 포커 핸드 데이터를 CSV 파일에서 읽어와 웹 인터페이스를 통해 관리하고, Google Apps Script를 통해 Google Sheets에 데이터를 업데이트하는 시스템입니다.

### 주요 기능
- CSV 파일 업로드 및 파싱
- 포커 핸드 데이터 검색 및 표시
- AI 기반 핸드 분석 (Gemini API)
- Google Sheets 자동 업데이트
- Virtual 시트와 Index 시트 동기화

### 기술 스택
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Google Apps Script
- **Storage**: Google Sheets, LocalStorage
- **AI**: Google Gemini API

---

## 🚀 설치 및 배포 가이드

### 1. Google Apps Script 설정

#### Step 1: 프로젝트 생성
1. [Google Apps Script](https://script.google.com) 접속
2. **새 프로젝트** 클릭
3. 프로젝트 이름을 **"Virtual Table DB v3"**으로 변경

#### Step 2: 코드 배포
1. `apps_script_v3_working.gs` 파일의 전체 내용을 복사
2. Apps Script 에디터에 붙여넣기 (647줄)
3. **저장** (Ctrl+S 또는 Command+S)

#### Step 3: API 키 설정 (선택사항)
AI 분석 기능을 사용하려면:
1. **프로젝트 설정** (톱니바퀴 아이콘) 클릭
2. **스크립트 속성** > **스크립트 속성 추가**
3. 속성명: `GEMINI_API_KEY`, 값: 실제 Gemini API 키

#### Step 4: 웹 앱 배포
1. **배포** > **새 배포** 클릭
2. **유형**: 웹 앱 선택
3. 설정:
   - **설명**: "Virtual Table DB v3.0 - CORS 수정"
   - **실행 사용자**: "나"
   - **액세스 권한**: **"모든 사용자"** ⚠️ 중요!
4. **배포** 클릭 후 권한 승인

### 2. 웹 애플리케이션 설정

#### GitHub Pages 배포
1. GitHub 저장소에서 Settings > Pages 활성화
2. Source: Deploy from branch (main/master)
3. URL: `https://username.github.io/virtual_table_db_claude/`

#### 설정 파일 업데이트
`index.html`의 CONFIG 객체에서:
```javascript
const CONFIG = {
  SHEET_UPDATE_SCRIPT_URL: '생성된_APPS_SCRIPT_URL'
};
```

### 3. 배포 확인

#### 브라우저 테스트
```javascript
// F12 콘솔에서 실행
fetch('YOUR_SCRIPT_URL')
  .then(r => r.json())
  .then(d => console.log('✅ 성공:', d))
  .catch(e => console.error('❌ 실패:', e));
```

예상 응답:
```json
{
  "status": "ok",
  "method": "GET",
  "version": "v3.0",
  "service": "Virtual Table Sheet Updater",
  "message": "서비스가 정상 작동 중입니다"
}
```

---

## 🛠️ 문제 해결 가이드

### CORS 오류 해결

#### 원인
- Apps Script 배포 설정 문제
- 잘못된 액세스 권한
- 브라우저 캐시 문제

#### 해결 방법

**1단계: Apps Script 설정 확인**
```
배포 관리 > 편집 > 설정 확인:
✅ 실행: 나
✅ 액세스: 모든 사용자 (중요!)
✅ URL: /exec로 끝남 (NOT /dev)
```

**2단계: 브라우저 캐시 삭제**
```
Chrome: Ctrl+Shift+R (강력 새로고침)
또는: 설정 > 개인정보 > 인터넷 사용 기록 삭제 (전체 기간)
```

**3단계: 콘솔에서 강제 설정**
```javascript
// F12 콘솔에서 실행
localStorage.clear();
const newUrl = 'https://script.google.com/macros/s/[배포ID]/exec';
localStorage.setItem('sheet_update_script_url', newUrl);
location.reload();
```

**4단계: 시크릿 모드 테스트**
- 새 시크릿 창에서 웹앱 접속
- 설정에서 새 URL 입력 후 테스트

### 캐시 문제 해결

#### 증상
- 이전 Apps Script URL이 계속 사용됨
- 설정 변경이 반영되지 않음

#### 완전 해결 스크립트
```javascript
// 브라우저 콘솔에서 실행
(function clearCache() {
    // 모든 관련 캐시 삭제
    const keysToRemove = [];
    for (let key in localStorage) {
        if (key.includes('url') || key.includes('script')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // 새 URL 설정
    const correctUrl = 'YOUR_NEW_SCRIPT_URL';
    localStorage.setItem('sheet_update_script_url', correctUrl);
    
    console.log('✅ 캐시 삭제 완료. 페이지 새로고침...');
    setTimeout(() => location.reload(true), 1000);
})();
```

### CSV 행 번호 불일치 문제

#### 원인
- CSV 파일 상단의 빈 줄
- 헤더 행 처리 오류
- Google Sheets와 CSV 행 번호 차이

#### 해결 방법

**방법 1: CSV 파일 정리**
```
1. CSV 파일 열기
2. 상단 빈 줄 모두 삭제
3. 첫 번째 줄이 헤더인지 확인
4. 저장 후 재시도
```

**방법 2: 자동 빈 줄 제거 (코드 수정)**
```javascript
// index.html의 CSV 파싱 부분 수정
const response = await fetch(csvUrl);
const text = await response.text();

// 빈 줄 및 헤더 자동 처리
const allRows = text.trim().split('\n');
const dataRows = allRows
  .map(row => row.trim())
  .filter(row => row.length > 0)  // 빈 줄 제거
  .filter((row, index) => index > 0)  // 헤더 제거
  .map(row => row.split(','));
```

### Apps Script 배포 문제

#### 확인사항
- [ ] 배포 상태가 "활성"인지
- [ ] URL이 `/exec`로 끝나는지
- [ ] 액세스 권한이 "모든 사용자"인지
- [ ] 스크립트에 실행 오류가 없는지

#### 재배포 방법
```
1. 배포 관리 > 연필 아이콘 (편집)
2. 버전: 새 버전 선택
3. 설명: 현재 날짜 추가
4. 업데이트 클릭
```

---

## 🔧 Apps Script 통합 가이드

### 데이터 흐름

#### Frontend → Apps Script
```javascript
// 전송 데이터 구조
{
  action: 'updateSheet',
  sheetUrl: 'Google Sheets URL',
  rowNumber: 5,  // Virtual 시트 행 번호
  handNumber: '12345',
  filename: 'poker_data.csv',
  aiAnalysis: '3줄 요약 내용',
  timestamp: '2025-01-09T10:30:00Z'
}
```

#### Apps Script → Google Sheets
- **D열**: 핸드 번호
- **E열**: 파일명  
- **F열**: AI 분석 (3줄 요약)
- **G열**: 타임스탬프

### 주요 함수

#### handleSheetUpdate (Apps Script)
```javascript
function handleSheetUpdate(payload, e) {
  // 시트 열기
  const sheet = openSheetByUrl(payload.sheetUrl);
  
  // 데이터 업데이트
  sheet.getRange(payload.rowNumber, 4, 1, 4).setValues([[
    payload.handNumber,
    payload.filename,
    payload.aiAnalysis,
    payload.timestamp
  ]]);
}
```

#### updateSheetData (Frontend)
```javascript
async function updateSheetData(handData, matchedRow) {
  const payload = {
    action: 'updateSheet',
    sheetUrl: CONFIG.SHEET_URL,
    rowNumber: matchedRow.index + 2, // 헤더 고려
    handNumber: handData.handNumber,
    filename: CONFIG.csvFilename,
    aiAnalysis: handData.aiSummary
  };
  
  const response = await fetch(CONFIG.SHEET_UPDATE_SCRIPT_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
}
```

### 오류 처리

#### 일반적인 오류들
1. **"시트를 열 수 없습니다"**
   - 시트 권한 확인
   - URL 형식 검증
   - 공유 설정 확인

2. **CORS 오류**
   - 배포 설정 재확인
   - 액세스 권한 변경
   - 브라우저 캐시 삭제

3. **API 할당량 초과**
   - 요청 빈도 조절
   - 배치 처리 구현
   - 오류 재시도 로직

---

## ✅ 테스트 및 검증

### 연결 테스트

#### Apps Script 직접 테스트
```javascript
// Apps Script 에디터에서 실행
function testSheetUpdate() {
  const testPayload = {
    action: 'updateSheet',
    sheetUrl: '실제_시트_URL',
    rowNumber: 2,
    handNumber: 'TEST-001',
    filename: 'test.csv',
    aiAnalysis: '테스트 분석'
  };
  
  const result = handleSheetUpdate(testPayload, {});
  console.log('테스트 결과:', result);
}
```

#### 웹 애플리케이션 테스트
1. **설정** 버튼 클릭
2. **Apps Script 연결 테스트** 클릭
3. "연결 성공!" 메시지 확인
4. 실제 데이터로 시트 업데이트 테스트

### 성능 테스트

#### 대용량 CSV 처리
```javascript
// 성능 측정
console.time('CSV Processing');
// CSV 파싱 코드
console.timeEnd('CSV Processing');
```

#### 메모리 사용량 확인
```javascript
// 브라우저 콘솔에서
console.log('메모리 사용량:', performance.memory);
```

### 디버깅 방법

#### Apps Script 로그 확인
- Apps Script 에디터 > 실행 > 실행 내역
- 오류 메시지 및 스택 트레이스 확인

#### 브라우저 콘솔 모니터링
```javascript
// 상세 로깅 활성화
localStorage.setItem('debug', 'true');
location.reload();
```

#### 네트워크 요청 분석
- F12 > Network 탭
- 실패한 요청의 Response 확인
- Headers 및 Status Code 검토

---

## 📊 체크리스트

### 배포 전 확인사항
- [ ] Apps Script URL이 index.html에 정확히 설정됨
- [ ] Google Sheets URL이 올바른 형식임
- [ ] Apps Script 실행 권한이 "모든 사용자"로 설정됨
- [ ] 시트 편집 권한이 부여됨
- [ ] CORS 헤더가 올바르게 설정됨
- [ ] 테스트 데이터로 정상 작동 확인
- [ ] 에러 핸들링 로직 검증 완료

### 정기 점검사항
- [ ] API 할당량 사용량 확인
- [ ] Apps Script 실행 로그 점검
- [ ] 시트 데이터 무결성 확인
- [ ] 브라우저 호환성 테스트
- [ ] 성능 지표 모니터링

---

## 🚨 응급 처치

### 즉시 해결이 필요한 경우

#### 1. Apps Script 완전 재배포
```
1. 기존 배포 비활성화
2. 새 배포 생성
3. "모든 사용자" 액세스 설정
4. 새 URL로 업데이트
```

#### 2. 로컬 백업 모드 활성화
```javascript
// index.html에 추가
const EMERGENCY_MODE = true;
if (EMERGENCY_MODE) {
  // 모든 데이터를 LocalStorage에만 저장
  console.log('🚨 응급 모드 활성화');
}
```

#### 3. 대안 서비스 사용
- Supabase Edge Functions
- Vercel Serverless Functions
- Netlify Functions

---

## 📞 지원 및 문의

### 문제 보고
1. **GitHub Issues**: 버그 및 기능 요청
2. **로그 수집**: 브라우저 콘솔 및 Apps Script 로그
3. **재현 단계**: 상세한 단계별 설명

### 개발자 연락처
- **프로젝트 저장소**: https://github.com/garimto81/virtual_table_db_claude
- **이슈 트래커**: GitHub Issues 활용

---

**최종 업데이트**: 2025-09-16
**문서 버전**: v1.1
**프로젝트 버전**: v10.1.5