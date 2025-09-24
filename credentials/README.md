# 🔐 Credentials 설정 가이드

## Google Service Account 설정

### 1. Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. API 및 서비스 > 사용자 인증 정보 이동
4. 서비스 계정 생성
5. 서비스 계정 키 생성 (JSON 형식)

### 2. Google Sheets API 활성화
1. API 및 서비스 > 라이브러리 이동
2. "Google Sheets API" 검색 및 활성화
3. "Google Drive API" 검색 및 활성화 (권한 관리용)

### 3. 서비스 계정 권한 설정
1. Google Sheets에서 서비스 계정 이메일 주소 공유
2. 편집자 권한 부여
3. 또는 뷰어 권한 + API를 통한 편집 권한

### 4. credentials.json 파일 설정
```bash
# 다운로드받은 서비스 계정 키 파일을 credentials 폴더로 복사
cp /path/to/downloaded-key.json ./credentials/credentials.json
```

### 5. 환경 변수 설정 (.env 파일)
```env
# Google Sheets 설정
GOOGLE_SHEETS_CREDENTIALS_PATH=./credentials/credentials.json
GOOGLE_SHEETS_ID=your_spreadsheet_id_here

# Gemini API (옵션)
GEMINI_API_KEY=your_gemini_api_key_here

# 기타 설정
NODE_ENV=development
```

## 보안 주의사항

⚠️ **중요: 절대 credentials.json 파일을 Git에 커밋하지 마세요!**

- credentials.json은 .gitignore에 포함됨
- 실제 키 파일은 로컬에만 보관
- 프로덕션 배포 시 환경변수 또는 보안 스토리지 사용

## 테스트 방법

```bash
# 서버 실행 후 테스트
npm run start
curl -X POST http://localhost:3000/api/sheets/test
```

## 문제 해결

### 1. 권한 오류 (403 Forbidden)
- Google Sheets에 서비스 계정 이메일 주소가 공유되었는지 확인
- 편집자 권한이 있는지 확인

### 2. API 오류 (404 Not Found)
- Google Sheets API가 활성화되었는지 확인
- Spreadsheet ID가 올바른지 확인

### 3. 인증 오류
- credentials.json 파일 경로가 올바른지 확인
- JSON 형식이 올바른지 확인

## 마이그레이션 가이드

### 기존 Apps Script에서 새 방식으로 변경:

**Before (Apps Script):**
```javascript
// Apps Script URL 호출
const response = await fetch(APPS_SCRIPT_URL, {
  method: 'POST',
  body: JSON.stringify({action: 'updateSheet', ...})
});
```

**After (Direct API):**
```javascript
// 직접 Google Sheets API 호출
const response = await fetch('/api/sheets/update', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({spreadsheetId, range, values})
});
```

## 장점

✅ **보안 강화**: 서버 사이드에서 안전한 키 관리
✅ **성능 향상**: 직접 API 호출로 응답 속도 개선
✅ **단순화**: Apps Script 배포 과정 제거
✅ **제어력**: 더 세밀한 API 제어 가능