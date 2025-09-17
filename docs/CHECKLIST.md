# 🔧 Virtual Table DB 문제 해결 체크리스트

## 📌 시스템 점검 체크리스트

### 1️⃣ 초기 설정 확인
- [ ] **브라우저 확인**
  - Chrome/Edge/Firefox 최신 버전 사용
  - JavaScript 활성화 상태
  - 팝업 차단 해제

- [ ] **로컬 서버 실행**
  ```bash
  cd virtual_table_db_claude
  python -m http.server 8080
  ```
  - http://localhost:8080/index.html 접속
  - 파일 직접 실행(file://) 금지

- [ ] **캐시 초기화**
  - Ctrl + Shift + R (강제 새로고침)
  - 개발자 도구 > Application > Clear Storage

### 2️⃣ Google Sheets 연동 확인

- [ ] **Google Sheets 권한**
  - 시트 편집 권한 확인
  - 공유 설정: "링크가 있는 모든 사용자" 또는 특정 사용자
  - 웹에 게시 활성화 (파일 > 웹에 게시)

- [ ] **시트 URL 형식**
  - 정확한 URL 형식: `https://docs.google.com/spreadsheets/d/[ID]/edit#gid=[GID]`
  - CSV 게시 URL 자동 변환 확인

- [ ] **데이터 형식 검증**
  - B열: 시간 형식 (HH:MM:SS 또는 HH:MM)
  - E열: 상태 값 (빈값, "미완료", "복사완료")
  - F열: 파일명
  - H열: AI 분석 결과

### 3️⃣ Apps Script 설정 확인

- [ ] **배포 설정**
  - 웹 앱으로 배포
  - 액세스 권한: "모든 사용자"
  - 실행 권한: "나"
  - 새 버전 배포 시 URL 변경 확인

- [ ] **URL 설정**
  - 설정 > Apps Script URL 입력
  - 형식: `https://script.google.com/macros/s/[SCRIPT_ID]/exec`
  - 테스트 연결 버튼으로 확인

- [ ] **권한 문제**
  - Apps Script 실행 권한 승인
  - Google 계정 로그인 상태
  - 시트 편집 권한 재확인

### 4️⃣ 주요 기능 오류 해결

#### 🔴 CORS 오류
- [ ] 로컬 서버 실행 여부 확인
- [ ] http:// 프로토콜 사용 (file:// 금지)
- [ ] 프록시 서버 자동 전환 확인

#### 🔴 Virtual 시트 매칭 팝업 문제
- [ ] 버전 v10.2.2 이상 확인
- [ ] 자동 팝업 비활성화 확인
- [ ] 수동 매칭 시에만 팝업 표시

#### 🔴 편집 버튼 오류
- [ ] Apps Script URL 설정 확인
- [ ] CONFIG.SHEET_UPDATE_SCRIPT_URL 값 확인
- [ ] 브라우저 콘솔 에러 메시지 확인

#### 🔴 데이터 로드 실패
- [ ] CSV URL 접근 가능 여부
- [ ] 네트워크 연결 상태
- [ ] Google Sheets 웹 게시 상태

### 5️⃣ AI 기능 설정

- [ ] **Gemini API 키**
  - 설정 > Gemini API 키 입력
  - 형식: AIza로 시작하는 39자 문자열
  - API 할당량 확인

- [ ] **AI 분석 오류**
  - API 키 유효성 확인
  - 네트워크 연결 상태
  - 일일 할당량 초과 여부

### 6️⃣ 디버깅 도구 활용

- [ ] **브라우저 개발자 도구**
  - F12 > Console 탭
  - 빨간색 오류 메시지 확인
  - 네트워크 탭에서 실패한 요청 확인

- [ ] **디버그 버튼 사용**
  - 시트 업데이트 디버그
  - Apps Script 연결 테스트
  - Gemini API 테스트

- [ ] **로그 확인**
  ```javascript
  // Console에서 실행
  console.log('Apps Script URL:', getAppsScriptUrl());
  console.log('Sheet URL:', getSheetUrl());
  console.log('Config:', CONFIG);
  ```

## 🚨 긴급 문제 해결

### 문제: "Apps Script URL이 설정되지 않았습니다"
1. [ ] 설정 메뉴 열기
2. [ ] Apps Script URL 필드 확인
3. [ ] 올바른 URL 입력
4. [ ] 저장 버튼 클릭
5. [ ] 페이지 새로고침

### 문제: "시트 업데이트 실패"
1. [ ] Apps Script 로그 확인 (Apps Script 편집기 > 실행 > 로그)
2. [ ] 시트 권한 확인
3. [ ] 행 번호 매칭 확인
4. [ ] 데이터 형식 검증

### 문제: "Virtual 시트 매칭 실패"
1. [ ] B열 시간 형식 확인
2. [ ] 타겟 시간 ±3분 범위 내 데이터 존재 확인
3. [ ] CSV 데이터 로드 성공 여부
4. [ ] 시트 URL 정확성 확인

## 📊 상태 확인 명령어

### localStorage 확인
```javascript
// 저장된 설정 확인
localStorage.getItem('main_sheet_url')
localStorage.getItem('sheet_update_script_url')
localStorage.getItem('gemini_api_key')
```

### 현재 설정 확인
```javascript
// CONFIG 객체 확인
console.table(CONFIG)

// 함수 테스트
await testAppsScriptConnection()
await loadIndexData()
```

### 네트워크 요청 확인
```javascript
// 개발자 도구 > Network 탭
// Failed 요청 필터링
// CORS 오류 확인
```

## ✅ 최종 점검 사항

- [ ] 모든 설정 저장 완료
- [ ] 테스트 연결 성공
- [ ] 데이터 로드 정상
- [ ] 편집/완료 버튼 작동
- [ ] AI 분석 기능 정상
- [ ] Virtual 시트 매칭 정상
- [ ] 자동 새로고침 작동

## 📞 추가 지원

문제가 지속되는 경우:
1. 브라우저 콘솔 전체 로그 캡처
2. 네트워크 탭 스크린샷
3. 설정 값 확인
4. GitHub Issues에 상세 내용 제출

---
*최종 업데이트: 2025-09-17 | 버전: v10.2.2*