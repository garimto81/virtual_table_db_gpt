# Frontend Refactor Outline (Stage 4.2)

## 목표
- `index.html`에 포함된 5,000+ 라인 스크립트를 모듈 단위(JS ES Modules)로 분리한다.
- CSV 파싱/캐시, 진행률 UI, 알림 처리, 설정 저장 등 공통 기능을 독립 모듈로 재사용한다.
- ES Modules 로더 전환을 준비하여 빌드 없는 구조라도 유지 보수 가능하게 만든다.

## 현재 산출물
- `src/`
  - `app.js`: 대시보드 부트스트랩 (CSV 로드 → 리스트 렌더 → 상세 패널 표시).
  - `services/`: `csvService.js`, `indexParser.js`, `handParser.js`, `appsScriptClient.js` 등 데이터 계층 정리.
  - `utils/`: CSV, config, cards, number 유틸 모듈.
  - `state/`: 전역 상태(`appState`).
  - `ui/`: 리스트/디테일/알림/프로그레스 모듈.
- `demo/index.html`: 모듈 기반 UI 동작 확인용 경량 페이지.
- TODO: `services/appsScriptClient` 실제 호출 구현, `findClosestVirtualRow` 이관, 버튼 핸들러 고도화.

## 로드맵
1. **ESM 로더 이식**
   - `index.html` 하단 `<script type="module">`로 전환.
   - `bootstrapDashboard()`를 호출해 초기화.
2. **데이터 레이어 재작성**
   - `csvService`에 시간 매칭/필터 기능 추가.
   - Apps Script 클라이언트 모듈 분리 (`updateSheet`, `verifyUpdate`).
3. **상태 & UI**
   - 진행률 구조는 `progressBus` 이벤트만 사용하도록 전역 의존성을 제거.
   - 알림/팝업 모듈을 DOM 기반으로 교체, 사운드 로더는 AudioContext 모듈로 추출.
4. **AI 분석/핸드 로직**
   - `analysis/handAnalyzer.js`에서 카드 파싱, 승부 판정, Gemini 호출 프롬프트 생성 담당.
   - 폴백 요약 로직을 pure 함수로 정리해 테스트 작성.
5. **테스트 계획**
   - Vitest 기반으로 `parseCsvText`, `configManager`, `csvService` 캐시 검증.
   - Playwright/DOM 테스트로 진행률/알림 UI 확인.

## 참고 일정
- D1~D2: 로더 전환, 구성 모듈 완성.
- D3~D4: 데이터 서비스 + Apps Script 클라이언트 이식.
- D5~D6: UI 세분화/테스트 코드 초안.

> 본 문서는 4.2 단계의 실제 코딩 작업 전 준비물이며, 구현 시 해당 모듈들을 점진적으로 채워나갑니다.
