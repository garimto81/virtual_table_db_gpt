# 🔍 Direct API 전환 검증 체크리스트

## 📋 검증 절차 가이드

이 체크리스트를 통해 Apps Script → Direct API 전환이 올바르게 완료되었는지 단계별로 확인하세요.

---

## 🏗️ **1단계: 기본 파일 구조 확인**

### [ ] 1.1 핵심 파일 존재 확인
- [ ] `src/services/google-sheets.ts` - Google Sheets API v4 서비스
- [ ] `src/routes/sheets-api.ts` - RESTful API 라우터
- [ ] `src/client/sheets-client.js` - 클라이언트 API 모듈
- [ ] `src/server.ts` - 통합 서버 (보안 강화)

### [ ] 1.2 Credentials 폴더 구조
- [ ] `credentials/.gitignore` - Git 보안 설정
- [ ] `credentials/README.md` - Google Cloud 설정 가이드
- [ ] `credentials/` 폴더가 Git에서 제외되는지 확인

### [ ] 1.3 환경 설정 파일
- [ ] `.env.example` - 환경변수 템플릿
- [ ] `.gitignore`에 `.env` 파일 제외 확인

---

## 🔐 **2단계: 보안 강화 확인**

### [ ] 2.1 localStorage API 키 제거 확인
```bash
# 다음 명령어로 확인:
grep -r "localStorage.*API.*KEY" index.html
```
- [ ] `index.html`에서 localStorage API 키 저장 코드 제거됨
- [ ] `loadAPIKeys()` 함수가 서버 환경변수만 사용하도록 수정됨
- [ ] `saveAPIKeys()` 함수가 비활성화됨 (localStorage 저장 안함)

### [ ] 2.2 AI Analyzer 모듈 보안 확인
```bash
# src/modules/ai-analyzer.js 확인
grep "서버 환경변수" src/modules/ai-analyzer.js
```
- [ ] AI Analyzer에서 localStorage 대신 환경변수 사용

### [ ] 2.3 보안 헤더 및 미들웨어
- [ ] `src/server/security.ts` - Helmet, CORS, Rate Limiting 설정
- [ ] HTTPS 리다이렉트 설정 (프로덕션용)

---

## 📦 **3단계: 패키지 의존성 확인**

### [ ] 3.1 필수 npm 패키지 설치 확인
```bash
npm list --depth=0 | grep -E "(googleapis|axios|jsonwebtoken|helmet|express-rate-limit)"
```
- [ ] `googleapis` - Google Sheets API v4
- [ ] `axios` - HTTP 클라이언트
- [ ] `jsonwebtoken` - JWT 인증
- [ ] `helmet` - 보안 헤더
- [ ] `express-rate-limit` - Rate Limiting

### [ ] 3.2 TypeScript 타입 정의
```bash
npm list --depth=0 | grep -E "@types/(axios|jsonwebtoken|bcryptjs|dompurify|jsdom)"
```
- [ ] 모든 필요한 @types 패키지 설치됨

---

## ⚙️ **4단계: 환경 설정 확인**

### [ ] 4.1 .env 파일 생성 및 설정
```bash
cp .env.example .env
```
**다음 환경변수들이 .env 파일에 설정되었는지 확인:**
- [ ] `GOOGLE_SHEETS_ID=your_spreadsheet_id_here`
- [ ] `GOOGLE_SHEETS_CREDENTIALS_PATH=./credentials/credentials.json`
- [ ] `GEMINI_API_KEY=your_gemini_api_key_here`
- [ ] `NODE_ENV=development`
- [ ] `PORT=3000`

### [ ] 4.2 Google Cloud Console 설정
- [ ] Google Cloud Project 생성됨
- [ ] Google Sheets API 활성화됨
- [ ] Service Account 생성됨
- [ ] Service Account 키(JSON) 다운로드됨
- [ ] `credentials/credentials.json` 파일 배치됨
- [ ] 스프레드시트에 Service Account 이메일 공유 권한 부여됨

---

## 🔧 **5단계: 빌드 및 컴파일 테스트**

### [ ] 5.1 TypeScript 컴파일 테스트
```bash
npx tsc --noEmit
```
- [ ] 컴파일 에러 없음
- [ ] 모든 타입 정의 올바름

### [ ] 5.2 단위 테스트 실행
```bash
npm test
```
- [ ] 모든 테스트 통과
- [ ] 새로운 Google Sheets 서비스 테스트 추가 필요시 작성

### [ ] 5.3 ESLint 및 코드 품질 확인
```bash
npm run lint  # (있을 경우)
```
- [ ] 린트 에러 없음
- [ ] 코드 스타일 일관성 유지

---

## 🚀 **6단계: 서버 구동 및 기능 테스트**

### [ ] 6.1 개발 서버 시작
```bash
npm run dev
```
**확인 사항:**
- [ ] 서버가 포트 3000에서 정상 시작됨
- [ ] 콘솔에 "Virtual Table DB Server" 시작 메시지 출력
- [ ] 보안 기능 활성화 메시지 확인

### [ ] 6.2 API 엔드포인트 테스트
**브라우저 또는 Postman에서 다음 URL들 테스트:**

#### 기본 엔드포인트
- [ ] `GET http://localhost:3000/` - 홈페이지 (API 문서)
- [ ] `GET http://localhost:3000/health` - 헬스체크

#### Google Sheets API 엔드포인트
- [ ] `GET http://localhost:3000/api/sheets/test` - 연결 테스트
- [ ] `POST http://localhost:3000/api/sheets/update` - 시트 업데이트
- [ ] `GET http://localhost:3000/api/sheets/info` - 스프레드시트 정보

---

## 🌐 **7단계: 웹 인터페이스 기능 테스트**

### [ ] 7.1 메인 웹페이지 로드
- [ ] `http://localhost:3000/index.html` 정상 로드
- [ ] 콘솔에 "📊 Google Sheets Direct API Client 로드 완료" 메시지
- [ ] API 키 로드 관련 보안 메시지 확인

### [ ] 7.2 Direct API 연동 테스트
**브라우저 개발자 콘솔에서 확인:**
```javascript
// API 연결 테스트
await window.sheetsAPI.testConnection()

// 스프레드시트 정보 조회
await window.sheetsAPI.getSpreadsheetInfo()
```
- [ ] API 호출이 정상 작동함
- [ ] 에러 없이 응답 받음

### [ ] 7.3 레거시 호환성 테스트
```javascript
// 레거시 함수 호출 테스트
await window.legacySheetsAPI.callAppsScript('test', {})
```
- [ ] 레거시 호출이 새 API로 자동 변환됨
- [ ] 기존 코드가 정상 작동함

---

## 📊 **8단계: 실제 데이터 연동 테스트**

### [ ] 8.1 시트 읽기 테스트
- [ ] Virtual 시트의 데이터 읽기 정상 작동
- [ ] 행별 데이터 조회 기능 확인
- [ ] 캐시 기능 정상 작동

### [ ] 8.2 시트 쓰기 테스트
**테스트용 데이터로 시트 업데이트:**
```javascript
await window.sheetsAPI.updateSheet({
  sheetName: 'Virtual',
  rowNumber: 999,  // 테스트용 행
  handNumber: 'TEST001',
  filename: '테스트파일.mp4',
  status: '미완료'
})
```
- [ ] 데이터 업데이트 정상 작동
- [ ] 스프레드시트에 데이터 반영 확인

### [ ] 8.3 AI 분석 연동 테스트
- [ ] Gemini API 키가 서버에서 로드됨
- [ ] AI 분석 기능이 정상 작동함
- [ ] 분석 결과가 시트에 저장됨

---

## 🛡️ **9단계: 보안 검증**

### [ ] 9.1 API 키 노출 검사
**브라우저 개발자 도구에서 확인:**
- [ ] Network 탭에서 API 키가 노출되지 않음
- [ ] localStorage에 API 키가 저장되지 않음
- [ ] 클라이언트 사이드에서 API 키 접근 불가

### [ ] 9.2 HTTPS 및 보안 헤더 확인
```bash
curl -I http://localhost:3000/
```
- [ ] 적절한 보안 헤더 설정됨
- [ ] CORS 정책 올바르게 설정됨

### [ ] 9.3 Rate Limiting 테스트
- [ ] 과도한 요청 시 429 에러 반환
- [ ] Rate Limit 정책이 올바르게 작동함

---

## 🎯 **10단계: 최종 통합 테스트**

### [ ] 10.1 전체 워크플로우 테스트
1. [ ] 웹페이지 로드
2. [ ] 핸드 데이터 입력
3. [ ] AI 분석 실행
4. [ ] 결과를 시트에 저장
5. [ ] 저장된 데이터 확인

### [ ] 10.2 에러 처리 테스트
- [ ] 네트워크 오류 시 재시도 작동
- [ ] 잘못된 데이터 입력 시 적절한 에러 메시지
- [ ] API 한도 초과 시 graceful 처리

### [ ] 10.3 성능 테스트
- [ ] 페이지 로드 시간 확인
- [ ] API 응답 시간 확인 (< 3초)
- [ ] 대용량 데이터 처리 테스트

---

## 📝 **최종 검증 보고서**

### ✅ **완료된 항목 수**: ___/50

### 🚨 **발견된 이슈들**:
```
[여기에 발견된 문제점들을 기록하세요]

예시:
- [ ] 이슈 1: 설명
- [ ] 이슈 2: 설명
```

### 📋 **다음 단계**:
```
[완료 후 다음에 해야 할 작업들]

예시:
1. 프로덕션 배포 준비
2. 사용자 매뉴얼 작성
3. 모니터링 시스템 구축
```

---

## 🎉 **검증 완료!**

모든 체크리스트 항목이 완료되면, Apps Script → Direct API 전환이 성공적으로 완료된 것입니다!

**🔒 보안 강화 완료**
**⚡ 성능 향상 완료**
**🛠️ 유지보수성 향상 완료**

---

*검증 날짜: ________________*
*검증자: ____________________*
*버전: v4.0.0-direct-api*