# 🧪 모듈화된 로직 테스트 가이드

이 디렉토리에는 **기존 index.html에서 분리된 모듈화된 로직만을 독립적으로 테스트**하는 도구들이 포함되어 있습니다.

## 📂 테스트 파일들

### 1. `test-modules-modularized.html` - 웹 브라우저 테스트
**완전한 웹 기반 테스트 인터페이스**

```bash
# 브라우저에서 열기
start test-modules-modularized.html
# 또는
chrome test-modules-modularized.html
```

**기능:**
- 🎮 인터랙티브 테스트 컨트롤 패널
- 📊 실시간 진행도 및 통계
- ⚡ 성능 벤치마크 시각화
- 🔍 상세한 테스트 결과 출력
- 📦 모듈 로드 상태 실시간 확인

### 2. `test-modules-cli.js` - 명령행 테스트
**빠른 CLI 기반 테스트**

```bash
# 기본 테스트 실행
node test-modules-cli.js

# 상세 로그와 함께 실행
node test-modules-cli.js --verbose

# 성능 테스트만 실행
node test-modules-cli.js --performance
```

**기능:**
- 🚀 빠른 실행 (브라우저 불필요)
- 📈 성능 벤치마크 포함
- 🎨 컬러풀한 콘솔 출력
- 📊 성공률 및 통계 제공

## 🧩 테스트 대상 모듈들

### 1. FilenameManager 모듈
```javascript
// 테스트 범위
- generateCustomFilename(handNumber) // 복잡한 파일명 생성
- saveMapping(handNumber, filename)  // O(1) 매핑 저장
- extractHandNumber(filename)        // 패턴 매칭 + 캐시 조회
- batchSaveMappings(items)          // 일괄 처리
- getStats()                        // 통계 정보
```

### 2. AIAnalyzer 모듈
```javascript
// 테스트 범위
- generateFileSummary(analysis)     // AI 요약 생성
- 캐시 시스템 (24시간 TTL)          // 성능 최적화
- getStats()                       // AI 통계
```

### 3. Filename Adapter (호환성 레이어)
```javascript
// 테스트 범위
- window.generateCustomFilename()   // 기존 함수 래퍼
- window.extractHandNumberFromFilename() // deprecated 처리
- 전역 매핑 변수들                   // 하위 호환성
```

## 📊 테스트 항목들

### ✅ 기능 테스트
1. **파일명 생성**
   - 기본 파일명 생성 (VT142_TestHero_AK_TestVillain_QQ...)
   - 캐시 시스템 작동 확인
   - 다른 핸드번호 처리

2. **매핑 시스템**
   - 양방향 매핑 저장/조회
   - 일괄 처리 (10개 항목)
   - 통계 정보 정확성

3. **AI 통합**
   - AI 요약 생성 (3단어 형식)
   - 캐시 시스템 작동
   - AI 모듈 통계

4. **호환성**
   - 기존 deprecated 함수 호출
   - 전역 변수 접근
   - 어댑터 래퍼 작동

### ⚡ 성능 테스트
- **O(1) 조회 성능**: 1000개 파일명 조회
- **캐시 효율성**: <0.01ms 목표
- **메모리 사용량**: 추정치 계산
- **처리량**: 초당 처리 가능 건수

## 🚀 빠른 시작

### 웹 브라우저 테스트
```bash
# 1. 브라우저에서 열기
start test-modules-modularized.html

# 2. "전체 테스트 실행" 버튼 클릭

# 3. 결과 확인
#    - 진행도 바 및 통계
#    - 상세 테스트 결과
#    - 성능 벤치마크
```

### CLI 테스트
```bash
# 1. 기본 테스트 실행
node test-modules-cli.js

# 2. 결과 확인
#    ✅ 통과한 테스트들
#    ❌ 실패한 테스트들
#    📊 최종 통계

# 3. 상세 정보 (옵션)
node test-modules-cli.js --verbose
```

## 📈 예상 결과

### 성공적인 테스트 결과
```
🧪 모듈화된 로직 CLI 테스트 시작

==================================================
🧪 모듈 로드 테스트
==================================================
✅ FilenameManager 모듈 로드
✅ AIAnalyzer 모듈 로드
✅ 호환성 어댑터 로드

==================================================
🧪 파일명 생성 테스트
==================================================
✅ 기본 파일명 생성
✅ 캐시 시스템
✅ 다른 핸드번호

==================================================
🧪 매핑 시스템 테스트
==================================================
✅ 매핑 저장/추출
✅ 일괄 매핑
✅ 매핑 통계

==================================================
🧪 AI 통합 테스트
==================================================
✅ AI 요약 생성
✅ AI 캐시
✅ AI 통계

==================================================
🧪 성능 벤치마크
==================================================
ℹ️  1000개 파일명 성능 테스트 시작...

📊 성능 결과:
   총 시간: 45ms
   평균 시간: 0.0450ms
   초당 처리량: 22,222개/초

✅ 성능 벤치마크

==================================================
🏁 테스트 완료
==================================================
통과: 15/15
실패: 0/15
성공률: 100.0%
실행 시간: 123ms

🎉 모든 테스트 통과!
```

### 성능 목표
- **평균 조회 시간**: <0.1ms (캐시 조회)
- **초당 처리량**: >10,000개/초
- **성공률**: >95%
- **메모리 효율성**: 매핑당 ~100바이트

## 🔧 트러블슈팅

### 모듈 로드 실패
```bash
❌ FilenameManager 모듈 로드
```
**해결책**: 모듈 파일 경로 확인
```bash
# 파일 존재 확인
ls ../src/modules/filename-manager.js
ls ../src/modules/ai-analyzer.js
ls ../src/modules/filename-adapter.js
```

### 성능 저하
```bash
❌ 성능 벤치마크 (평균: 2.5ms)
```
**원인**: 캐시 미스 또는 복잡한 로직
**해결책**:
- 캐시 시스템 확인
- DEBUG_MODE 비활성화
- 매핑 테이블 크기 확인

### AI 테스트 실패
```bash
❌ AI 요약 생성
```
**원인**: 가짜 API 키 또는 분석 데이터 구조
**해결책**: mock 데이터 확인

## 🎯 테스트 커스터마이징

### CLI 테스트 옵션 추가
```javascript
// test-modules-cli.js 수정
const customIterations = 5000; // 성능 테스트 반복 횟수
const customTimeout = 100;     // 타임아웃 설정
```

### 웹 테스트 설정 변경
```javascript
// test-modules-modularized.html에서
const testStorage = {
    'filenamePrefix': 'TEST',     // 다른 접두사 테스트
    'filenameSuffix': '_custom',  // 다른 접미사 테스트
    'useAIForFilename': 'false'   // AI 비활성화 테스트
};
```

## 📞 지원

### 테스트 실패 시
1. **상세 로그 확인**: `--verbose` 옵션 사용
2. **개별 테스트**: 웹 인터페이스에서 단계별 실행
3. **모듈 상태**: 브라우저 콘솔에서 `window.FilenameManager` 확인

### 성능 이슈 시
1. **벤치마크만 실행**: `--performance` 옵션
2. **반복 횟수 조정**: 소스 코드에서 `iterations` 변경
3. **캐시 상태 확인**: `getStats()` 메서드 호출

---

**📝 참고**: 이 테스트들은 **모듈화된 로직만** 독립적으로 검증합니다. 전체 index.html과의 통합 테스트는 별도로 수행해야 합니다.