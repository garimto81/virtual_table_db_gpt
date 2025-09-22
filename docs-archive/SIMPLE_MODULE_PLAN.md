# 📦 파일명 및 AI 분석 모듈화 계획 (간단 버전)

## 🎯 모듈화 범위 (3개만)

### 1. 파일명 관리 모듈 ✅ 완료
**파일**: `src/modules/filename-manager.js`
- 파일명 생성 (`generateFilename`)
- 핸드번호 추출 (`extractHandNumber`)
- Map 기반 O(1) 성능

### 2. AI 핸드 분석 모듈 🆕 필요
**파일**: `src/modules/ai-analyzer.js`
```javascript
class AIAnalyzer {
  // 핸드 내용 AI 분석
  async analyzeHand(handNumber) { }

  // Gemini API 호출
  async callGeminiAPI(prompt) { }

  // AI 요약 생성
  async generateAISummary(handData) { }

  // 캐시 관리
  getCached(key) { }
  setCached(key, value) { }
}
```

### 3. 통합 어댑터 ✅ 완료
**파일**: `src/modules/filename-adapter.js`
- 기존 코드와 호환성 유지

## 📋 구현 체크리스트 (1주 내 완료)

### Day 1-2: AI 분석 모듈
- [ ] ai-analyzer.js 생성
- [ ] analyzeHandWithAI 함수 이동
- [ ] generateAIFileSummary 함수 이동
- [ ] Gemini API 관련 로직 이동
- [ ] AI 캐시 시스템 이동

### Day 3: index.html 수정
```html
<!-- 모듈 추가 -->
<script src="src/modules/filename-manager.js"></script>
<script src="src/modules/ai-analyzer.js"></script>
<script src="src/modules/filename-adapter.js"></script>

<script>
  // 기존 함수들 제거 또는 주석 처리
  // - generateCustomFilename (300줄)
  // - extractHandNumberFromFilename (50줄)
  // - analyzeHandWithAI (200줄)
  // 총 550줄 제거 예상
</script>
```

### Day 4-5: 테스트
- [ ] 파일명 생성 테스트
- [ ] 핸드번호 추출 테스트
- [ ] AI 분석 테스트
- [ ] 통합 테스트

## 🎯 예상 결과

### 코드 개선
- **제거**: index.html에서 550줄 제거
- **추가**: 3개 모듈 파일 (각 150-200줄)
- **결과**: 9,300 → 8,750줄 (index.html)

### 성능 개선
- 파일명 추출: O(n) → O(1)
- AI 분석: 캐시로 중복 호출 방지
- 모듈 로딩: 병렬 로드 가능

## ❌ 하지 않을 것들
- 전체 시스템 리팩토링
- UI 컴포넌트 분리
- 상태 관리 모듈화
- 8주 장기 계획

## ✅ 이미 완료된 작업
1. `filename-manager.js` - 파일명 생성/추출
2. `filename-adapter.js` - 호환성 레이어

## 🚀 다음 단계 (즉시 실행)
1. AI 분석 모듈 생성
2. index.html에 3개 스크립트 추가
3. 기존 함수 제거
4. 테스트

**예상 소요 시간**: 3-5일
**위험도**: 낮음 (어댑터로 호환성 보장)