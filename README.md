# Virtual Table DB - Poker Hand Monitoring System v11.3.9

## 📋 프로젝트 개요
AI 기반 포커 핸드 모니터링 및 분석 시스템으로 Google Sheets와 연동하여 실시간 핸드 데이터를 관리합니다.

### 🚀 최신 버전: v11.3.9
- Apps Script getHandStatus 액션 추가로 CSV 캐싱 우회
- 실시간 E열 상태 확인 기능 구현
- Virtual 시트와 Hand 시트 명확히 구분
- CSV 캐싱 문제 근본적 해결

## 🗂️ 폴더 구조
```
virtual_table_db_claude/
├── index.html              # 메인 애플리케이션 (264KB)
├── apps_script.gs          # Google Apps Script 코드
├── button_protocol.html    # 버튼 프로토콜 문서
├── docs/                   # 문서 폴더
│   ├── CHECKLIST.md       # 개발 체크리스트
│   ├── fixit.md           # 버그 수정 로그
│   └── README.md          # 프로젝트 문서
├── test_archive/          # 테스트 파일 아카이브
│   ├── test_edit_process.html
│   ├── test_fix.html
│   ├── test_page_refresh.html
│   ├── test_phase3.html
│   └── test_refresh_optimization.html
└── .github/workflows/     # GitHub Actions 설정
```

## 📊 핵심 기능

### 1. **Phase 1-3 최적화 시스템**
- **Phase 1**: 일괄 처리 API (폴백 지원)
- **Phase 2**: 스마트 캐싱 시스템
- **Phase 3**: 적응형 새로고침 관리

### 2. **핸드 상태 관리**
| 상태 | 의미 | UI 표시 |
|------|------|---------|
| 빈 값/null | 미처리 | 🔴 편집 가능 |
| 미완료 | 편집 완료, 승인 대기 | 🟡 완료 가능 |
| 복사완료 | 모든 처리 완료 | 🟢 완료됨 |

### 3. **버튼 동작 로직**
- **편집 버튼**: 핸드를 "미완료" 상태로 변경
- **완료 버튼**: 핸드를 "복사완료" 상태로 변경

## 🔧 설정 방법

### 1. Google Sheets 연동
1. Google Sheets 파일 생성
2. 파일 → 웹에 게시 → CSV 형식 선택
3. 생성된 CSV URL을 설정에 입력

### 2. Apps Script 설정
1. `apps_script.gs` 코드를 Google Apps Script에 복사
2. 웹 앱으로 배포
3. 배포 URL을 설정에 입력

### 3. Gemini API 설정
1. Google AI Studio에서 API 키 발급
2. 설정에 API 키 입력

## 🎯 최근 해결된 문제들

### v11.3.x 시리즈
- ✅ 새로고침 후 "미완료" 상태가 "편집 가능"으로 잘못 표시되는 문제
- ✅ Virtual 시트 매칭 시 E열 상태값 누락 문제
- ✅ CSV 파싱 시 따옴표 포함 문제
- ✅ 콘솔 스팸 방지

### 성능 개선
- API 호출 95% 감소 (20회 → 1회)
- 응답 시간 10배 향상 (3-5초 → 0.5초)
- 캐시 적중률 80% 이상

## 📝 개발 노트

### 캐시 시스템
- TTL: 5분
- 최대 크기: 1000행
- 이진 검색으로 O(log n) 성능

### 디버깅 팁
```javascript
// 개발자 콘솔에서 캐시 상태 확인
console.log(sheetDataCache.getStats());

// Virtual 시트 매칭 디버그
console.log(`🔍 [디버그] E열 원본: "${cols[4]}" → 파싱 후: "${status}"`);
```

## 🚦 테스트 방법

1. **편집 → 새로고침 테스트**
   - 편집 버튼 클릭 → F5 → 같은 핸드 선택
   - 완료 버튼이 활성화되어야 함

2. **성능 테스트**
   - 개발자 콘솔에서 캐시 적중/미스 확인
   - API 호출 횟수 모니터링

## 📞 문의
- GitHub Issues: [프로젝트 이슈 트래커]
- 버전 히스토리: git log 참조

---
최종 업데이트: 2025-09-17 | Version 11.3.9