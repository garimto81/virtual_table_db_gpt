# Frontend Migration Plan

## 목표
기존 `index.html` 내 5,000여 라인의 스크립트를 ES Module 기반 구조(`src/`)와 완전히 연결해, 목록/상세/버튼/알림/시간 매칭 로직을 모듈 단위로 관리한다.

## 1단계: 기본 부트스트랩 적용
- `index.html` 하단 `<script>` 블록을 제거하고 `<script type="module" src="./src/app.js"></script>` 로 교체.
- `<meta name="vtdb-config-url" content="...">` 또는 `window.__VTDB_CONFIG_URL`로 구성 파일 경로 설정.
- 새 모듈이 로딩되면 `hand-list`, `hand-number`, `community-cards` 등 기존 DOM 구조가 그대로 작동한다.

## 2단계: 데이터/상태 이관
- `loadIndexData` → `csvService.getIndexRows()` + `parseIndexRows` (완료).
- `loadHandData` → `buildHandDetail` (rows 캐시 + 상세 파서) (완료).
- `completedHandsManager`, `recentHandsBuffer` 등 로컬 상태 → `state/` 디렉터리 확장 필요.

## 3단계: 버튼 / 워크플로우 복원
- `complete-btn` → `appsScriptClient.updateSheet` + 시간 매칭(`findClosestVirtualRow`) 모듈화 필요.
- `edit-btn` → status `미완료` 업데이트 + progress UI 연결 필요.
- `verifyUpdate` → `appsScriptClient.verifyUpdate` 사용하여 버튼 상태 갱신.

## 4단계: 시간 매칭 & 진행률
- `findClosestVirtualRow` 함수 이관 → `services/timeMatcher.js` 완료 (AbortController 적용).
- 진행률 모달/알림 → `ui/progress.js`, `ui/notifications.js` 확장.
- 취소 플래그(`AbortController`) 포함하여 긴 작업 제어.

## 5단계: AI 분석 & Gemini 연동
- `analyzeHandWithAI` → `services/analysis/handAnalyzer.js` 모듈 도입.
- `apps_script`의 `analyzeHand` 액션과 일치하는 요청/응답 스키마 정의.
- 폴백 요약/프롬프트 생성 함수 분리 후 테스트 작성.

## 6단계: 테스트 & 검증
- `demo/index.html`로 모듈 로딩 Smoke Test (샘플 CSV/구성 사용).
- 실제 `index.html` 적용 후, 4.5 QA 계획(핸드 선택/완료/verifyUpdate)을 순차 수행.

## 남은 과제 요약
| 범주 | 현황 | 후속 조치 |
| ---- | ---- | ---- |
| ES Module 로더 | `demo`에서 동작, 본 `index.html` 미적용 | inline script 제거 및 모듈 호출 적용 |
| 시간 매칭 | 미이관 | `services/timeMatcher.js` 구현 후 완료/편집 플로우 연결 |
| Apps Script 인터랙션 | 스텁만 존재 | 스테이징 웹앱 URL 설정, 성공/실패 핸들링 구현 |
| 알림/진행률 | 기본 로그 수준 | DOM 기반 팝업/모달 구현, 음원 연결 |
| 로컬 스토리지 마이그레이션 | 일부만 반영 | `configManager` 확장, masterHandList/버퍼 저장 이관 |

> 본 문서에 따라 `index.html`을 모듈 기반으로 전환하고 남은 기능을 순차적으로 이관합니다.
