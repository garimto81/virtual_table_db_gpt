# ⚡ Quick Setup Guide

## 🚀 빠른 시작 가이드

Direct API 전환이 완료되었습니다! 이제 다음 단계만 따라하면 바로 사용할 수 있습니다.

---

## 📋 **필수 준비사항 (5분 소요)**

### 1️⃣ **환경 파일 설정**
```bash
# .env 파일 생성
cp .env.example .env
```

**`.env` 파일을 열어서 다음 값들을 설정하세요:**
```env
# 🔑 필수: Google Sheets ID (스프레드시트 URL에서 추출)
GOOGLE_SHEETS_ID=1abcdefg_example_sheet_id_hijklmnop

# 🔑 필수: Gemini API 키
GEMINI_API_KEY=AIzaSy_your_gemini_api_key_here

# 📁 파일 경로 (기본값 사용 가능)
GOOGLE_SHEETS_CREDENTIALS_PATH=./credentials/credentials.json

# 🌐 서버 설정 (기본값 사용 가능)
NODE_ENV=development
PORT=3000
```

### 2️⃣ **Google Service Account 설정**

1. **Google Cloud Console 접속**: https://console.cloud.google.com
2. **새 프로젝트 생성** 또는 기존 프로젝트 선택
3. **API 라이브러리**에서 `Google Sheets API` 활성화
4. **서비스 계정** 생성:
   - IAM 및 관리자 → 서비스 계정
   - 새 서비스 계정 만들기
   - 역할: Editor 또는 Viewer
5. **JSON 키 다운로드**:
   - 서비스 계정 → 키 → 키 추가 → JSON
   - `credentials/credentials.json`로 저장

### 3️⃣ **스프레드시트 권한 부여**
```
Service Account 이메일을 복사해서
Google Sheets 파일의 "공유" 버튼으로
편집자 권한 부여
```

---

## 🎮 **실행 및 테스트 (2분 소요)**

### 1️⃣ **자동 검증 실행**
```bash
# 설정이 올바른지 확인
node run-verification.js
```

### 2️⃣ **개발 서버 시작**
```bash
# 서버 실행
npm run dev
```

**✅ 성공 시 다음 메시지들이 출력됩니다:**
```
╔════════════════════════════════════════╗
║   Virtual Table DB Server              ║
║   🔒 Phase 1: 보안 강화 완료           ║
║   Version: v13.3.4-stable             ║
║   Port: 3000                           ║
║   URL: http://localhost:3000           ║
╚════════════════════════════════════════╝
```

### 3️⃣ **웹 인터페이스 테스트**
1. 브라우저에서 `http://localhost:3000/index.html` 접속
2. 개발자 콘솔 확인 (F12)
3. 다음 메시지들이 보이면 성공:
   ```
   📊 Google Sheets Direct API Client 로드 완료
   🔐 Gemini API 키: 서버 환경변수에서 로드
   ✅ 기존 Apps Script 호출이 새 Direct API로 자동 변환됩니다.
   ```

---

## 🧪 **API 연결 테스트 (1분 소요)**

### 브라우저 콘솔에서 테스트:
```javascript
// 1. 연결 테스트
await window.sheetsAPI.testConnection()

// 2. 스프레드시트 정보
await window.sheetsAPI.getSpreadsheetInfo()

// 3. 특정 행 데이터 조회 (예: 2번째 행)
await window.sheetsAPI.getRowData('Virtual', 2)
```

### REST API 직접 테스트:
```bash
# 연결 테스트
curl http://localhost:3000/api/sheets/test

# 스프레드시트 정보
curl http://localhost:3000/api/sheets/info
```

---

## 🎯 **핵심 기능 확인**

### ✅ **Direct API 작동 확인**
- [ ] localStorage에 API 키 저장 안됨 (보안 강화)
- [ ] 서버 환경변수에서 API 키 로드
- [ ] Google Sheets API v4 직접 호출
- [ ] 기존 코드와 완벽 호환

### ✅ **레거시 호환성 확인**
```javascript
// 기존 Apps Script 스타일 호출도 작동함
await window.legacySheetsAPI.callAppsScript('test', {})
```

### ✅ **보안 강화 확인**
- [ ] API 키가 브라우저에 저장되지 않음
- [ ] HTTPS 강제, CORS 설정, Rate Limiting 적용
- [ ] JWT 인증 시스템 준비됨

---

## 🚨 **문제 해결**

### 🔧 **일반적인 오류들**

#### 1. "Credentials 파일을 찾을 수 없습니다"
```bash
# credentials.json 파일 위치 확인
ls -la credentials/credentials.json

# 경로가 잘못된 경우 .env에서 수정:
GOOGLE_SHEETS_CREDENTIALS_PATH=./credentials/credentials.json
```

#### 2. "스프레드시트에 접근할 수 없습니다"
- Service Account 이메일을 스프레드시트에 공유했는지 확인
- GOOGLE_SHEETS_ID가 올바른지 확인

#### 3. "Gemini API 키 오류"
```bash
# API 키 길이 확인 (39자)
echo $GEMINI_API_KEY | wc -c

# .env 파일에 따옴표 없이 설정:
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 🔍 **상세 검증**
문제가 있으면 전체 체크리스트 실행:
```bash
# 상세 검증 체크리스트 확인
cat VERIFICATION_CHECKLIST.md
```

---

## 🎉 **설정 완료!**

모든 단계가 완료되면 다음 기능들을 사용할 수 있습니다:

- ✅ **보안 강화된 Google Sheets 연동**
- ✅ **AI 기반 포커 핸드 분석**
- ✅ **실시간 데이터 동기화**
- ✅ **레거시 코드 완벽 호환**

---

*🕐 총 소요시간: 약 8분*
*📖 상세 문서: VERIFICATION_CHECKLIST.md 참조*