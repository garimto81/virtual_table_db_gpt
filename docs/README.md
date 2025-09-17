# 🎰 Virtual Table DB Claude

## 📌 프로젝트 개요
포커 핸드 모니터링 시스템 - Google Sheets와 Apps Script를 활용한 실시간 데이터 동기화 시스템

**현재 버전: v10.2.2** (2025-09-17 최종 업데이트)

## 🚀 주요 기능
- ✅ 실시간 포커 핸드 추적 및 분석
- ✅ Google Sheets 자동 업데이트 (F열: 파일명, H열: AI분석)
- ✅ AI 기반 핸드 분석 (Gemini API)
- ✅ CSV 파일 시간 매칭 (±3분 범위)
- ✅ 웹 기반 모니터링 대시보드
- ✅ 오프라인 모드 지원
- ✅ Virtual 시트 자동 매칭

## 📁 프로젝트 구조 (최적화됨)
```
virtual_table_db_claude/
├── index.html         # 메인 웹 애플리케이션 (v10.2.2)
├── apps_script.gs     # Google Apps Script
├── README.md          # 프로젝트 문서
├── _config.yml        # GitHub Pages 설정
└── .gitignore        # Git 제외 설정
```

## 🛠️ 빠른 시작

### 1. Apps Script 배포
1. [Google Apps Script](https://script.google.com) 접속
2. 새 프로젝트 생성
3. `apps_script.gs` 내용 복사/붙여넣기
4. 배포 > 새 배포 > 웹 앱
5. 액세스 권한: "모든 사용자" 설정
6. 배포 URL 복사
7. **중요**: Google Sheets에 편집자 권한 부여

### 2. 로컬 테스트
```bash
# Python HTTP 서버 실행
cd virtual_table_db_claude
python -m http.server 8080

# 브라우저에서 열기
http://localhost:8080/index.html
```

### 3. 설정
1. 설정 버튼 클릭
2. **메인 시트 URL** 입력
3. **Apps Script URL** 입력
4. **Gemini API 키** 입력 (선택사항)
5. 저장 및 테스트

## 🔧 최근 업데이트 (v10.2.2)

### 개선사합 (v10.2.2)
- ✨ 문서 및 체크리스트 업데이트
- 🔧 안정성 개선 및 코드 최적화
- 📄 디버깅 가이드 작성 완료

### 수정된 버그
- ✅ Virtual 시트 매칭 팝업이 자동으로 표시되는 문제
- ✅ Apps Script URL 초기화 오류
- ✅ 편집 버튼 클릭 시 URL 설정 오류

### 개선사항
- 폴더 구조 최적화 (불필요한 파일 제거)
- 성능 향상 및 메모리 사용량 감소
- 오류 처리 개선

## 📊 시스템 요구사항
- Chrome/Edge/Firefox 최신 버전
- Google 계정 (Sheets 편집 권한)
- Python 3.x (로컬 테스트 시)

## 🔗 주요 URL
- **GitHub Repository**: https://github.com/garimto81/virtual_table_db_claude
- **Live Demo**: https://garimto81.github.io/virtual_table_db_claude/

## 📝 문제 해결

### CORS 오류
- 로컬 서버를 통해 실행 (python -m http.server)
- 파일을 직접 열지 말고 http:// 프로토콜 사용

### Apps Script 연결 실패
1. Apps Script가 "모든 사용자" 액세스로 배포되었는지 확인
2. 시트에 편집 권한이 있는지 확인
3. Apps Script URL이 정확한지 확인

### Virtual 시트 매칭 문제
- 시간 형식이 "HH:MM:SS"인지 확인
- B열에 시간 데이터가 있는지 확인

## 🤝 기여
문제를 발견하거나 개선사항이 있다면 GitHub Issues를 통해 알려주세요.

## 📄 라이선스
MIT License

---
*개발: garimto81 | AI 지원: Claude*