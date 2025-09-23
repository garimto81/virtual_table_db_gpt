# 🔒 Virtual Table DB 보안 강화 서버 테스트 가이드

## 🚀 빠른 시작

### 1️⃣ 서버 실행
```bash
# 터미널 1에서 서버 실행
node ./virtual_table_db_claude/start-server.js
```

### 2️⃣ 테스트 방법

#### 방법 1: 브라우저에서 테스트 (추천)
1. 브라우저에서 `test-client.html` 파일 열기
2. 버튼을 클릭하여 각 API 테스트

#### 방법 2: 터미널에서 테스트
```bash
# 터미널 2에서 테스트 스크립트 실행
node ./virtual_table_db_claude/test-server.js
```

#### 방법 3: curl 사용
```bash
# 헬스체크
curl http://localhost:3001/health

# 홈페이지
curl http://localhost:3001/

# API 버전
curl http://localhost:3001/api/version
```

## 📋 테스트 결과 확인 항목

### ✅ 성공해야 하는 테스트
1. **Health Check** - 서버 상태 확인
2. **Home Page** - 메인 페이지 정보
3. **API Version** - 버전 정보
4. **인증 없이 보안 API 접근** - 401 에러 반환

### 🔐 보안 기능 확인
- JWT 인증 시스템
- RBAC (역할 기반 접근 제어)
- API 키 서버 사이드 관리
- XSS/CSRF 방어
- Rate Limiting
- 입력 검증
- 보안 로깅

## 💡 다음 단계

### Phase 1 완료 후:
1. `.env` 파일에 실제 API 키 설정
   ```
   GEMINI_API_KEY=your-actual-api-key
   APPS_SCRIPT_URL=your-actual-script-url
   ```

2. TypeScript 컴파일 및 프로덕션 빌드
   ```bash
   npm run build
   npm start
   ```

3. 실제 인증 토큰 테스트

4. XSS 취약점 클라이언트 코드 수정

## 🎯 마일스톤

- [x] Phase 0: 사전 준비 (2025-09-23 완료)
- [x] Phase 1: 보안 강화 - 서버 사이드 (2025-09-23 완료)
- [ ] Phase 1: 보안 강화 - 클라이언트 사이드
- [ ] Phase 2: 성능 최적화
- [ ] Phase 3: 아키텍처 개선
- [ ] Phase 4: 품질 개선

## 🔧 문제 해결

### 서버가 시작되지 않는 경우
1. 포트 확인 (3001번이 사용 중인지)
2. `.env` 파일 확인
3. 의존성 설치: `npm install`

### 테스트 실패 시
1. 서버 로그 확인
2. 네트워크 탭에서 요청/응답 확인
3. CORS 설정 확인

---

**작성일**: 2025-09-23
**Phase 1 완료**: 보안 강화 서버 사이드 구현 ✅