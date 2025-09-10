# Apps Script 통합 가이드 (v9.5.0)

## 📋 개요
Virtual Table DB 시스템과 Google Apps Script 통합을 위한 상세 가이드입니다.
기존 Apps Script 로직을 유지하면서 CORS 문제를 해결하고 호환성을 개선했습니다.

## 🔧 주요 개선사항

### 1. CORS 지원 강화
- 모든 응답에 CORS 헤더 자동 추가
- OPTIONS 요청 (preflight) 지원
- FormData와 JSON 요청 모두 처리 가능

### 2. 호환성 개선
- `updateSheet`와 `updateHand` 액션 모두 지원 (이전 버전 호환)
- `aiAnalysis`와 `aiSummary` 필드 모두 인식
- `rowNumber`와 `virtualRow` 모두 처리 가능

### 3. 오류 처리 강화
- 상세한 오류 메시지
- 필수 필드 검증
- 시트 접근 권한 확인

## 📝 설치 및 배포 방법

### Step 1: Apps Script 프로젝트 생성
1. [Google Apps Script](https://script.google.com) 접속
2. 새 프로젝트 생성
3. `apps_script_updated.gs` 내용 복사하여 붙여넣기

### Step 2: API 키 설정 (선택사항)
```javascript
const GEMINI_API_KEY = 'YOUR_ACTUAL_API_KEY'; // Gemini AI 사용 시
```

### Step 3: 웹 앱으로 배포
1. **배포** > **새 배포** 클릭
2. 설정:
   - **유형**: 웹 앱
   - **설명**: Virtual Table DB v9.5.0
   - **실행**: 나
   - **액세스 권한**: 모든 사용자
3. **배포** 클릭
4. 생성된 URL 복사

### Step 4: index.html에 URL 설정
```javascript
const CONFIG = {
  // ... 다른 설정들
  SHEET_UPDATE_SCRIPT_URL: '생성된_APPS_SCRIPT_URL'
};
```

## 🔄 데이터 흐름

### index.html → Apps Script
```javascript
// index.html에서 전송하는 데이터 구조
{
  action: 'updateSheet',
  sheetUrl: 'Google Sheets URL',
  rowNumber: 5,  // Virtual 시트의 행 번호
  handNumber: '12345',
  filename: 'poker_data.csv',
  aiAnalysis: '3줄 요약 내용',
  timestamp: '2025-01-09T10:30:00Z'
}
```

### Apps Script → Google Sheets
- **D열**: 핸드 번호
- **E열**: 파일명
- **F열**: AI 분석 (3줄 요약)
- **G열**: 타임스탬프 (선택사항)

## 🛠️ 문제 해결

### CORS 오류가 계속 발생하는 경우
1. Apps Script 재배포
   - 배포 관리 > 편집 > 버전 번호 증가
2. 브라우저 캐시 삭제
   - Chrome: F12 > Network 탭 > Disable cache 체크
3. URL 확인
   - 최신 배포 URL 사용 여부 확인

### "시트를 열 수 없습니다" 오류
1. 시트 권한 확인
   - Apps Script 실행 계정이 시트 편집 권한 필요
2. 시트 URL 형식 확인
   - 올바른 형식: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=GID`

### 업데이트가 반영되지 않는 경우
1. 올바른 행 번호 확인
   - Apps Script는 1부터 시작 (헤더 포함)
   - 데이터는 보통 2행부터 시작
2. 시트 구조 확인
   - D, E, F열이 올바른 위치에 있는지 확인

## 📊 테스트 방법

### Apps Script 내부 테스트
```javascript
function testSheetUpdate() {
  const testPayload = {
    action: 'updateSheet',
    sheetUrl: '실제_시트_URL',
    rowNumber: 2,
    handNumber: 'TEST-001',
    filename: 'test.csv',
    aiAnalysis: '테스트 분석',
    timestamp: new Date().toISOString()
  };
  
  const result = handleSheetUpdate(testPayload, {});
  console.log('테스트 결과:', result);
}
```

### 브라우저 콘솔 테스트
```javascript
// F12 > Console에서 실행
fetch('APPS_SCRIPT_URL', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    action: 'updateSheet',
    sheetUrl: 'YOUR_SHEET_URL',
    rowNumber: 2,
    handNumber: 'BROWSER-TEST',
    filename: 'browser_test.csv',
    aiAnalysis: '브라우저 테스트'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## 🔐 보안 고려사항

### 권한 관리
- Apps Script 실행 권한을 신뢰할 수 있는 계정으로 제한
- 시트 편집 권한 최소화

### API 키 보호
- Gemini API 키는 환경 변수나 별도 설정 파일 사용 권장
- 공개 저장소에 API 키 노출 금지

### 데이터 검증
- 입력 데이터 유효성 검사
- SQL 인젝션 방지 (시트 작업 시)

## 📈 성능 최적화

### 배치 업데이트
여러 셀을 한 번에 업데이트:
```javascript
// 개선 전
sheet.getRange(row, 4).setValue(value1);
sheet.getRange(row, 5).setValue(value2);

// 개선 후
sheet.getRange(row, 4, 1, 2).setValues([[value1, value2]]);
```

### 캐싱 활용
```javascript
// 시트 객체 캐싱
const sheetCache = {};
function getCachedSheet(url) {
  if (!sheetCache[url]) {
    sheetCache[url] = openSheetByUrl(url);
  }
  return sheetCache[url];
}
```

## 🔄 버전 관리

### 현재 버전
- **Frontend (index.html)**: v9.5.0
- **Apps Script**: v9.5.0 호환

### 업데이트 시 주의사항
1. 버전 호환성 확인
2. 테스트 환경에서 먼저 검증
3. 점진적 롤아웃

## 📞 지원 및 문의

### 일반적인 문제
- CORS 오류: 배포 설정 재확인
- 권한 오류: 시트 공유 설정 확인
- 데이터 누락: 필드명 일치 여부 확인

### 디버깅 팁
1. Apps Script 로그 확인
   - 보기 > 실행 내역
2. 브라우저 콘솔 로그 확인
   - F12 > Console
3. 네트워크 요청 확인
   - F12 > Network

## 🎯 체크리스트

배포 전 확인사항:
- [ ] Apps Script URL이 index.html에 정확히 입력됨
- [ ] 시트 URL이 올바른 형식임
- [ ] Apps Script 실행 권한이 "모든 사용자"로 설정됨
- [ ] 시트 편집 권한이 Apps Script 실행 계정에 부여됨
- [ ] CORS 헤더가 올바르게 설정됨
- [ ] 테스트 데이터로 정상 작동 확인
- [ ] 오류 처리 로직 검증 완료

---

*마지막 업데이트: 2025-01-09*
*버전: 9.5.0*