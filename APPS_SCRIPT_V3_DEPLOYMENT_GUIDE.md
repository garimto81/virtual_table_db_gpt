# 📚 Apps Script v3 배포 가이드

## 🎯 목적
ContentService.addHeader 오류를 해결한 Apps Script v3를 배포하여 CORS 문제를 완전히 해결합니다.

## 📋 준비사항
- Google 계정
- Google Apps Script 접근 권한
- `apps_script_v3_working.gs` 파일

## 🚀 배포 단계

### Step 1: Google Apps Script 프로젝트 생성

1. **https://script.google.com** 접속
2. **새 프로젝트** 클릭
3. 프로젝트 이름을 **"Virtual Table DB v3"**로 변경

### Step 2: 코드 복사

1. 기본 `Code.gs` 파일의 모든 내용 삭제
2. `apps_script_v3_working.gs` 파일의 전체 내용 복사 (647줄)
3. Apps Script 에디터에 붙여넣기
4. **저장** (Ctrl+S 또는 Command+S)

### Step 3: Gemini API 키 설정 (선택사항)

AI 분석 기능을 사용하려면:

1. **프로젝트 설정** (톱니바퀴 아이콘) 클릭
2. **스크립트 속성** 스크롤
3. **스크립트 속성 추가** 클릭
4. 다음 정보 입력:
   - **속성**: `GEMINI_API_KEY`
   - **값**: 실제 Gemini API 키
5. **스크립트 속성 저장** 클릭

### Step 4: 웹 앱으로 배포

1. **배포** > **새 배포** 클릭
2. **유형 선택** 옆 톱니바퀴 → **웹 앱** 선택
3. 다음과 같이 설정:
   - **설명**: "Virtual Table DB v3.0 - CORS 수정"
   - **실행 사용자**: "나"
   - **액세스 권한**: **"모든 사용자"** ⚠️ 중요!
4. **배포** 클릭
5. 권한 요청 화면이 나타나면:
   - **액세스 승인** 클릭
   - Google 계정 선택
   - **고급** 클릭
   - **Virtual Table DB v3(안전하지 않음)으로 이동** 클릭
   - **허용** 클릭

### Step 5: 배포 URL 복사

1. 배포 완료 후 나타나는 **웹 앱 URL** 복사
   - 형식: `https://script.google.com/macros/s/[배포ID]/exec`
2. 이 URL을 안전한 곳에 저장

## ✅ 배포 확인

### 방법 1: 브라우저에서 직접 테스트

1. 복사한 배포 URL을 브라우저 주소창에 입력
2. 다음과 같은 JSON 응답이 표시되면 성공:
```json
{
  "status": "ok",
  "method": "GET",
  "version": "v3.0",
  "service": "Virtual Table Sheet Updater",
  "message": "서비스가 정상 작동 중입니다"
}
```

### 방법 2: 웹 앱에서 테스트

1. https://garimto81.github.io/virtual_table_db_claude/ 접속
2. **설정** 버튼 클릭
3. **Apps Script URL** 필드에 새 배포 URL 입력
4. **저장** 클릭
5. **Apps Script 연결 테스트** 버튼 클릭
6. "연결 성공!" 메시지 확인

## 🔧 문제 해결

### 권한 오류가 발생하는 경우

1. **배포 관리**에서 설정 확인:
   - "액세스 권한"이 **"모든 사용자"**인지 확인
   - "실행 사용자"가 **"나"**인지 확인

### CORS 오류가 계속 발생하는 경우

1. 브라우저 캐시 완전 삭제:
   - Chrome: 설정 > 개인정보 및 보안 > 인터넷 사용 기록 삭제
   - 전체 기간 선택
   - 캐시된 이미지 및 파일 체크
   - 삭제

2. 개발자 도구 콘솔에서:
```javascript
// LocalStorage 초기화
localStorage.clear();
location.reload();
```

### 시트 접근 권한 오류

1. Google Sheets 문서가 공유되어 있는지 확인
2. Apps Script 프로젝트가 시트에 접근할 권한이 있는지 확인

## 📊 v3 주요 개선사항

### 1. ContentService 문법 수정
- ❌ 이전: `output.addHeader()` (더 이상 지원되지 않음)
- ✅ 현재: Apps Script 기본 CORS 처리

### 2. 간소화된 응답 생성
```javascript
function createCorsResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 3. 기존 기능 100% 호환
- Virtual 시트 업데이트 (D, E, F, H, I열)
- Index 시트 업데이트
- AI 분석 (Gemini API)
- 레거시 API 지원

## 🔍 테스트 시나리오

### 1. 기본 연결 테스트
- GET 요청으로 서비스 상태 확인
- 버전 정보 및 기능 목록 확인

### 2. 시트 업데이트 테스트
```javascript
{
  "action": "updateSheet",
  "sheetUrl": "시트URL",
  "rowNumber": 2,
  "filename": "test.mp4",
  "handNumber": "12345"
}
```

### 3. AI 분석 테스트
```javascript
{
  "action": "analyzeHand",
  "handNumber": "12345",
  "filename": "hand_12345.mp4"
}
```

## 📝 배포 후 체크리스트

- [ ] 배포 URL이 `/exec`로 끝나는지 확인
- [ ] 브라우저에서 GET 요청 테스트 완료
- [ ] 웹 앱에서 연결 테스트 완료
- [ ] 실제 시트 업데이트 테스트 완료
- [ ] 에러 로그 확인 (Apps Script 에디터 > 실행 > 로그)

## 🆘 지원

문제가 계속되는 경우:
1. Apps Script 에디터에서 **실행** > **로그** 확인
2. 브라우저 개발자 도구 콘솔 확인
3. GitHub Issues에 문제 보고

---

**최종 업데이트**: 2025-01-11
**버전**: v3.0
**작성자**: Virtual Table DB Team