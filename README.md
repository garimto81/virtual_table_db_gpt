# 🎰 Virtual Table DB Claude

## 📌 프로젝트 개요
포커 핸드 모니터링 시스템 - Google Sheets와 Apps Script를 활용한 실시간 데이터 동기화 시스템

## 🚀 주요 기능
- ✅ 실시간 포커 핸드 추적 및 분석
- ✅ Google Sheets 자동 업데이트
- ✅ AI 기반 핸드 분석 (Gemini API)
- ✅ CSV 파일 시간 매칭 (±3분 범위)
- ✅ 웹 기반 모니터링 대시보드

## 📁 프로젝트 구조
```
virtual_table_db_claude/
├── index.html              # 메인 웹 애플리케이션 (v9.6.0)
├── apps_script_final.gs    # Google Apps Script (최종 버전)
├── PROJECT_DOCUMENTATION.md # 통합 문서
├── README.md               # 프로젝트 개요
├── test_connection.html    # 연결 테스트 도구
└── quick_test.html        # 빠른 테스트 도구
```

## 🛠️ 빠른 시작

### 1. Apps Script 배포
1. [Google Apps Script](https://script.google.com) 접속
2. 새 프로젝트 생성
3. `apps_script_final.gs` 내용 복사/붙여넣기
4. 배포 > 새 배포 > 웹 앱
5. 액세스 권한: "모든 사용자" 설정
6. 배포 URL 복사

### 2. 웹 앱 설정
1. https://garimto81.github.io/virtual_table_db_claude/ 접속
2. 설정 버튼 클릭
3. Apps Script URL 입력
4. 저장 및 테스트

## 📖 문서
자세한 설정, 문제 해결, API 정보는 [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)를 참조하세요.

## 🔧 기술 스택
- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **AI**: Google Gemini API
- **Hosting**: GitHub Pages

## 📊 버전
- **현재 버전**: v9.7.6
- **최종 업데이트**: 2025-09-15

### v9.7.6 업데이트 내용
- 🔍 시트 업데이트 디버그 버튼 추가
- 실시간 시트 업데이트 검증 기능
- HTML 오류 수정 (hand-result 요소 제거 관련)
- 3단계 검증: URL 형식, Apps Script 연결, 실제 업데이트 테스트

### v9.7.5 업데이트 내용
- Apps Script 연결 테스트를 GET에서 POST로 변경
- CORS 오류 해결을 위한 text/plain Content-Type 사용
- 테스트 연결 시 action: 'test' 전송
- Apps Script v3.1 호환성 확보

### v9.7.4 업데이트 내용
- Apps Script text/plain 파싱 로직 개선
- CORS 회피용 text/plain Content-Type 지원
- 요청 타입 및 action 필드 디버그 로그 추가
- '알 수 없는 액션: unknown' 오류 해결

### v9.7.3 업데이트 내용
- 노트 섹션 완전 제거
- 2열 레이아웃으로 단순화 (핸드 목록 + 상세 정보)
- 필수 정보만 표시하여 최대 가독성 확보

### v9.7.2 업데이트 내용
- 결과 탭 제거로 UI 가독성 향상
- 핸드 목록과 핸드 상세 정보만 표시
- 노트 영역 확대로 사용성 개선

### v9.7.1 업데이트 내용
- 무한 알림 루프 문제 해결
- notifiedHands 로드 시 디버그 로그 추가
- 새 알림 트리거 전 기존 알림 확인 로직 추가
- 중복 알림 방지 검증 강화

### v9.7.0 업데이트 내용
- CSV 행 번호 불일치 자동 감지 및 보정
- 실제 위치 기반 데이터 재슬라이싱
- CSV 파싱 오류 방지 로직 강화

### v9.6.8 업데이트 내용
- 모든 버전 표시를 APP_VERSION 상수로 통일
- 동적 버전 업데이트 (HTML, 타이틀, UI)
- 하드코딩된 버전 번호 모두 제거
- 버전 관리 중앙화로 유지보수성 향상

### v9.6.7 업데이트 내용
- 강력한 버전 체크 및 자동 업데이트 시스템 추가
- 버전 변경 시 자동 캐시 초기화 (중요 설정은 보존)
- Tailwind CSS 버전 파라미터 추가
- 빌드 타임스탬프 추가로 정확한 버전 추적

### v9.6.6 업데이트 내용
- CSV BOARD 오타(BO\ARD) 처리 추가
- 보드 카드 개수 기반 스트리트 판단 로직으로 변경
- POT CORRECTION 이벤트 처리 추가
- 카드 문자열 파싱 개선 (Qs2h 형식 지원)
- 플레이어 seat 매핑 정확도 향상

### v9.6.5 업데이트 내용
- 카드 10을 T로 표시하도록 변경
- 입력은 10과 T 둘 다 인식 가능하도록 개선
- 통계 섹션 UI 제거
- 카드 파싱 로직 강화 (대소문자, 숫자 형식 지원)

### v9.6.4 업데이트 내용
- CORS 오류 해결을 위해 Content-Type을 text/plain으로 변경
- Apps Script와의 호환성 개선

### v9.6.3 업데이트 내용
- Apps Script 통신 방식 통일 (JSON)
- POST 요청 일관성 개선
- 새 Apps Script URL 적용

### v9.6.1 업데이트 내용
- 시간 매칭 오차 수정
- Seoul 시간대 변환 로직 제거
- Apps Script 변수 스코프 오류 수정

## 🐛 문제 해결
CORS 오류, 캐시 문제, 행 번호 불일치 등의 해결 방법은 문서를 참조하세요.

## 📞 지원
- GitHub Issues: [Report Issue](https://github.com/garimto81/virtual_table_db_claude/issues)
- 문서: [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)

---
© 2025 Virtual Table DB Team