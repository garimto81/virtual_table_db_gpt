# 🔍 시트 업데이트 디버깅 가이드

## ⚠️ 문제 상황
- 브라우저에서 "시트 업데이트 성공" 메시지가 나타남
- 실제 Google Sheets는 업데이트되지 않음

## 🎯 가능한 원인들

### 1. **Apps Script가 아직 구버전 실행 중**
가장 흔한 원인입니다.

### 2. **시트 권한 문제**
Apps Script가 시트에 접근할 권한이 없을 수 있습니다.

### 3. **잘못된 시트 URL 또는 행 번호**
시트 URL이 잘못되었거나 행 번호가 범위를 벗어났을 수 있습니다.

---

## 🔥 즉시 확인 사항

### Step 1: Apps Script 로그 확인

1. **https://script.google.com** 접속
2. 프로젝트 열기
3. **실행** 메뉴 클릭
4. **실행 기록** 확인
5. 최근 실행 항목 클릭하여 로그 확인

로그에서 확인할 내용:
- "시트 업데이트 시작..." 메시지
- "시트 이름:" 메시지
- 오류 메시지

### Step 2: Apps Script 코드 확인

현재 배포된 코드가 최신인지 확인:

```javascript
// 197-198번 줄 확인 (finalAnalysis 선언 위치)
let finalAnalysis = aiAnalysis;  // try 블록 밖에서 선언
const updateTime = new Date();   // try 블록 밖에서 선언
```

이 부분이 없다면 구버전입니다!

### Step 3: 시트 권한 확인

1. Google Sheets 문서 열기
2. 우측 상단 **공유** 버튼
3. Apps Script 실행 계정이 **편집자** 권한인지 확인

---

## 🛠️ 해결 방법

### 방법 1: Apps Script 완전 재배포

```
1. https://script.google.com 접속
2. 프로젝트 열기
3. 모든 코드 삭제 (Ctrl+A → Delete)
4. 아래 URL에서 최신 코드 복사:
   https://raw.githubusercontent.com/garimto81/virtual_table_db_claude/master/virtual_table_db_claude/apps_script_final.gs
5. 붙여넣기 → 저장 (Ctrl+S)
6. 배포 > 배포 관리
7. 현재 배포 삭제 (휴지통 아이콘)
8. 배포 > 새 배포
9. 유형: 웹 앱
10. 실행: "나"
11. 액세스: "모든 사용자"
12. 배포 → 새 URL 복사
13. 웹 앱 설정에서 새 URL 입력
```

### 방법 2: 테스트 함수 실행

Apps Script 에디터에서:

```javascript
function testSheetUpdate() {
  const testData = {
    action: 'updateSheet',
    sheetUrl: 'YOUR_SHEET_URL',  // 실제 시트 URL 입력
    rowNumber: 2,  // 테스트할 행 번호
    handNumber: 'TEST_' + new Date().getTime(),
    filename: 'test.mp4',
    aiAnalysis: '테스트 분석',
    timestamp: new Date().toISOString()
  };
  
  const result = handleSheetUpdate(testData);
  console.log('테스트 결과:', JSON.stringify(result));
}
```

실행 버튼(▶️) 클릭 후 로그 확인

### 방법 3: 수동 디버깅

브라우저 콘솔(F12)에서:

```javascript
// 1. 현재 설정 확인
console.log('Write Sheet URL:', localStorage.getItem('write_sheet_url'));
console.log('Apps Script URL:', localStorage.getItem('apps_script_url'));

// 2. 직접 테스트
const testPayload = {
  action: 'updateSheet',
  sheetUrl: localStorage.getItem('write_sheet_url'),
  rowNumber: 2,
  handNumber: 'MANUAL_TEST',
  filename: 'manual_test.mp4',
  aiAnalysis: '수동 테스트',
  timestamp: new Date().toISOString()
};

fetch(localStorage.getItem('apps_script_url'), {
  method: 'POST',
  body: JSON.stringify(testPayload),
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('응답:', data))
.catch(err => console.error('오류:', err));
```

---

## 📋 체크리스트

### Apps Script 설정
- [ ] 최신 코드 복사/붙여넣기 완료
- [ ] 저장 완료 (Ctrl+S)
- [ ] 새 버전으로 배포
- [ ] "액세스: 모든 사용자" 설정
- [ ] 배포 URL이 웹 앱에 입력됨

### Google Sheets 설정
- [ ] 시트가 공유되어 있음
- [ ] Apps Script 실행 계정이 편집 권한 보유
- [ ] 시트 URL이 올바름
- [ ] 행 번호가 유효함

### 브라우저 설정
- [ ] 캐시 삭제 완료
- [ ] localStorage 초기화
- [ ] 올바른 Apps Script URL 사용 중

---

## 🔍 고급 디버깅

### Apps Script 실행 권한 재설정

1. Apps Script 에디터에서
2. 설정(톱니바퀴) > 프로젝트 설정
3. "인증되지 않은 앱 실행 허용" 체크
4. 저장

### 완전 초기화

```javascript
// 브라우저 콘솔에서
localStorage.clear();
sessionStorage.clear();
// 페이지 새로고침
location.reload(true);
```

그 다음 설정에서 모든 URL 다시 입력

---

## 💡 중요 팁

**"시트 업데이트 성공" 메시지는 Apps Script가 응답했다는 의미일 뿐, 실제 시트 업데이트 성공을 의미하지 않습니다.**

Apps Script 로그를 반드시 확인하세요!

---

## 🆘 추가 지원

1. Apps Script 로그 전체를 캡처
2. 브라우저 콘솔 오류 캡처
3. 시트 URL과 행 번호 확인
4. GitHub Issues에 보고

---

최종 업데이트: 2025-01-11 (v9.6.2)