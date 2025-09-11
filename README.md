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
- **현재 버전**: v9.6.0
- **최종 업데이트**: 2025-01-11

## 🐛 문제 해결
CORS 오류, 캐시 문제, 행 번호 불일치 등의 해결 방법은 문서를 참조하세요.

## 📞 지원
- GitHub Issues: [Report Issue](https://github.com/garimto81/virtual_table_db_claude/issues)
- 문서: [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)

---
© 2025 Virtual Table DB Team