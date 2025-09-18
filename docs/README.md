# 📚 Virtual Table DB 문서 가이드

## 🎯 프로젝트 개요
**Virtual Table DB v12.3.0** - AI 기반 포커 핸드 모니터링 및 분석 시스템

### 📋 필수 문서 (읽기 권장 순서)

#### 1️⃣ **프로젝트 시작**
- **[../README.md](../README.md)** - 📋 메인 프로젝트 소개 및 최신 변경사항

#### 2️⃣ **시스템 이해**
- **[HAND_VIRTUAL_PROCESS.md](./HAND_VIRTUAL_PROCESS.md)** - 🎯 Hand/Virtual 시트 워크플로우 (필수!)

#### 3️⃣ **기술 해결책**
- **[CSV_MULTILINE_SOLUTION.md](./CSV_MULTILINE_SOLUTION.md)** - 📊 CSV 멀티라인 문제 해결 (RFC 4180)
- **[H_COLUMN_QUOTES_GUIDE.md](./H_COLUMN_QUOTES_GUIDE.md)** - 🔧 H열 큰따옴표 처리 실행 가이드

#### 4️⃣ **개발/디버깅**
- **[INTEGRATED_CHECKLIST.md](./INTEGRATED_CHECKLIST.md)** - ✅ 통합 개발 체크리스트
- **[TIME_MATCHING_DEBUG.md](./TIME_MATCHING_DEBUG.md)** - 🔍 시간 매칭 디버깅 가이드

---

## 🗂️ 문서 구조

### 📁 **사용자 가이드**
- `HAND_VIRTUAL_PROCESS.md` - 워크플로우 이해
- `H_COLUMN_QUOTES_GUIDE.md` - 실행 가이드

### 📁 **기술 문서**
- `CSV_MULTILINE_SOLUTION.md` - 기술적 해결책
- `TIME_MATCHING_DEBUG.md` - 디버깅 방법

### 📁 **개발 관리**
- `INTEGRATED_CHECKLIST.md` - 작업 진행 상황

---

## 🚨 중요 알림

### ⚠️ 읽지 마세요 (구버전/중복):
- ~~`CHECKLIST.md`~~ → `INTEGRATED_CHECKLIST.md` 사용
- ~~`timestamp_fix_solution.md`~~ → `TIME_MATCHING_DEBUG.md` 사용
- ~~`TIME_MATCHING_IMPROVEMENT.md`~~ → `TIME_MATCHING_DEBUG.md` 사용
- ~~`CRITICAL_ISSUES_ANALYSIS.md`~~ → 해결됨

### 🔥 긴급 문제 해결:
1. **17시 이후 데이터 안 보임** → `TIME_MATCHING_DEBUG.md` 참고
2. **CSV 멀티라인 오류** → `CSV_MULTILINE_SOLUTION.md` 참고
3. **편집/완료 버튼 문제** → `INTEGRATED_CHECKLIST.md` 참고

---

## 📞 도움말

### 💡 빠른 해결책:
```
❓ 시간 매칭 실패 → TIME_MATCHING_DEBUG.md
❓ CSV 파싱 오류 → CSV_MULTILINE_SOLUTION.md
❓ Hand/Virtual 이해 → HAND_VIRTUAL_PROCESS.md
❓ 개발 진행 상황 → INTEGRATED_CHECKLIST.md
```

### 🔧 스크립트 위치:
- **H열 처리**: `../scripts/wrap_h_column_with_quotes.gs`
- **Hand/Virtual 동기화**: `../scripts/hand_to_virtual_sync.gs`

---

**최종 업데이트**: 2025-09-18 | 버전: v12.3.0