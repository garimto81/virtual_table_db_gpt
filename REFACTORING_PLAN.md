# Virtual Table DB 리팩토링 계획서

## 1. 개요
- **목표**: Virtual Table DB Claude 프로젝트의 프론트엔드와 Google Apps Script 백엔드를 구조화하고, 데이터 파이프라인을 안정화하여 유지보수성과 확장성을 높인다.
- **범위**: `index.html` 기반 대시보드, `apps_script.gs` 백엔드, CSV/Sheets 연동 구성, 배포 및 운영 지원 도구.
- **기간**: 3주 (준비 3일, 구현 12일, 안정화 6일, 회고 3일)
- **성과물**: 리팩토링된 코드, 자동화된 점검 스크립트, 업데이트된 문서 세트.

## 2. 주요 이슈 요약
1. **진행률 UI 중복 정의**: `updateProgress` 함수 중복으로 진행 바 UI가 동작하지 않음.
2. **AI 분석 호출 오류**: `analyzeHandWithAI`가 잘못된 인자를 받아 항상 실패하며 오류 시 `handData` 스코프 문제로 예외 재발생.
3. **Apps Script 액션 불일치**: 프론트엔드는 `verifyUpdate`를 기대하지만 백엔드는 미구현.
4. **시트 상태 컬럼 미반영**: 프론트엔드에서 `status`를 보내도 Apps Script가 E열에 파일명을 덮어써 워크플로우 상태가 기록되지 않음.
5. **프로그레스 취소 플래그**: `isAborted` 스코프 문제로 취소가 반영되지 않음.
6. **하드코딩된 리소스 URL**: CSV/Apps Script/Type 시트 URL이 코드에 상수로 박혀 맞춤형 배포가 어려움.
7. **Index 시트 라우팅 정확도 부족**: 부분 문자열 일치로 오검증 가능성 존재.
8. **로그 및 예외 처리 난잡**: 운영 환경에서도 디버그 로그가 과도하며 예외 메시지가 일관되지 않음.

## 3. 리팩토링 원칙
- **모듈화**: 데이터 접근, 뷰 렌더링, 서비스 호출 로직을 분리해 테스트 가능하도록 개선.
- **구성 분리**: 모든 외부 리소스 URL과 키는 설정 모듈 및 저장소(localStorage)로 단일화.
- **API 계약 명확화**: 프론트엔드와 Apps Script 간 JSON 스키마를 명시하고 변경 시 버전 태그 필수.
- **관측성 확보**: 주요 작업(시트 업데이트, AI 호출, CSV 로드)에 대해 상태 팝업/로그/리턴 값 통일.
- **테스트 우선**: 핵심 로직(시간 매칭, 상태 업데이트, AI 분석 폴백)을 단위 테스트 혹은 시뮬레이터로 검증.

## 4. 세부 작업 계획

### 4.1 준비 단계 (D-3)
- [x] 현행 코드 스냅샷 저장 및 버전 태깅.
- [x] 기존 Google Sheets 구조, Apps Script 배포 상태 정리.
- [x] 리팩토링 브랜치(`refactor/main-structure`) 생성.
- [x] 헬스 체크용 샘플 CSV/시트 준비.

### 4.2 프론트엔드 리팩토링 (D1~D6)
1. **구조 분할** (`src/` 디렉터리 신설)
   - [x] `src/` 기본 디렉터리 구성 및 `app.js` 부트스트랩 스켈레톤 추가 (2025-09-17)
   - [x] `services/`, `ui/`, `utils/`, `state/` 하위 구조 초안 정의
   - [ ] ES Module 로더를 `index.html`에 적용
2. **데이터 서비스 개선**
   - [x] `services/csvService.js` 캐시 포함 스텁 작성
   - [x] `utils/csv.js` 공통 파서 분리
   - [x] Apps Script API 클라이언트 분리 (`services/appsScriptClient.js`)
3. **상태 관리 및 UI**
   - [x] 진행률 버스(`state/progressBus.js`) 및 `ui/progress.js` 스켈레톤 구성
   - [x] 알림 관리자(`ui/notifications.js`) 초안 작성
   - [x] 상세 UI 컴포넌트 분리 (`ui/handList.js`, `ui/detailPanel.js`)
4. **AI 분석 워크플로우**
   - [ ] `analyzeHandWithAI` 모듈화 기초 코드 이식
   - [ ] 폴백 요약 pure 함수 정의 및 테스트
   - [ ] Gemini 호출 옵션/모델 설정 모듈화
5. **시간 매칭 & 완료 프로세스**
   - [ ] `findClosestVirtualRow` 리팩토링 및 AbortController 통합
   - [ ] 진행 상태 이벤트 매핑 (`progressBus.emit`) 치환
   - [ ] `status` 응답 검증 UX 정비
6. **설정 & 검증 UI**
   - [x] `configManager`로 설정 병합 로직 초안 작성
   - [ ] 설정 모달 컴포넌트 분리 및 검증 문구 재설계
   - [ ] Apps Script/Gemini 테스트 카드화

### 4.3 백엔드(Apps Script) 리팩토링 (D4~D10)
1. **프로젝트 구조 개선**
   - [x] 모듈 디렉터리 및 스켈레톤 생성 (`apps_script/src`, `core`, `handlers`, `routers`)
   - [x] 공통 유틸(CoreResponses/CoreLogging/CoreSheets) 스텁 작성
   - [ ] 기존 `apps_script.gs` 로직 모듈로 이관 및 CLASP 구성
2. **API 액션 정합성**
   - [x] `verifyUpdate` 핸들러 스텁과 응답 스키마 정의
   - [x] `updateSheet` 핸들러에 status/E열 분리 로직 초안
   - [ ] 실제 시트 업데이트 로직/검증 로깅 강화
3. **데이터 검증 & 에러 처리**
   - [x] Dispatcher JSON 파싱 및 알 수 없는 액션 에러 응답 정리
   - [ ] `openSheetByUrl` 예외 핸들링/테스트 케이스 확장
   - [ ] 로그 레벨별 출력 규칙/경고 메시지 정비
4. **테스트 코드**
   - [x] `test/SheetUpdate.test.gs` 스텁 작성
   - [x] `test/VerifyUpdate.test.gs` 스텁 작성
   - [x] `test/AnalysisFallback.test.gs` 스텁 작성
   - [ ] CI/로컬 실행 가이드 및 목킹 전략 문서화

### 4.4 구성 및 배포 (D8~D12)
- [x] `.env.example`, `config/app.config.sample.json`, schema 초안 작성
- [x] GitHub Pages 빌드 스크립트(`scripts/build-pages.mjs`) 및 npm 스크립트 초안
- [ ] 버전 정보(`APP_VERSION`, `BUILD_TIME`) 자동화 스크립트 추가
- [ ] 배포 체크리스트 문서화 (`docs/DEPLOYMENT_CHECKLIST.md`)

### 4.5 안정화 및 QA (D12~D18)
- [ ] CSV 업로드, 시트 업데이트, AI 분석, 완료 처리에 대한 통합 시나리오 테스트.
- [ ] 브라우저 호환성(Chrome/Edge) 수동 검증.
- [ ] 로그/Alert 정상 작동 확인, 운영 모드에서 디버그 로그 최소화.
- [ ] 사용자 피드백 수집 및 수정 라운드.

### 4.6 문서화 & 회고 (D18~D21)
- [ ] README, PROJECT_DOCUMENTATION, TROUBLESHOOTING 최신화.
- [ ] 리팩토링 결과 보고서 및 Next Step 제안 작성.
- [ ] 팀 회고 미팅 정리 및 백로그 갱신.

## 5. 일정 요약 (Gantt 개요)
- **준비**: D-3 ~ D0
- **프론트엔드**: D1 ~ D6
- **백엔드**: D4 ~ D10 (프론트 작업과 병행)
- **설정/배포**: D8 ~ D12
- **안정화/QA**: D12 ~ D18
- **문서/회고**: D18 ~ D21

## 6. 리스크 및 대응
| 리스크 | 영향 | 대응 전략 |
| --- | --- | --- |
| Google Sheets 권한 변경으로 API 실패 | 높음 | 자동 권한 체크 + 실패 시 UX 가이드 제공 |
| Gemini API 한도 초과 | 중간 | 폴백 분석 강화, 호출 횟수 제한, 캐시 도입 |
| 모듈 분리 후 레거시 기능 누락 | 높음 | 단계별 브랜치 병합 & 통합 테스트 스크립트 실행 |
| 일정 지연 | 중간 | 주간 점검 미팅, 우선순위 조정 |

## 7. 기대 효과
- 유지보수가 용이한 모듈 구조 확보.
- 실시간 작업 현황 및 상태 체크 기능 정상화.
- 다양한 배포 시나리오에서 재사용 가능한 설정 체계 구축.
- AI 분석 실패 시 안정적인 폴백과 사용자 안내 제공.
- 문서와 코드가 일치하는 운영 가이드라인 정립.

## 8. 후속 제안
- 장기적으로는 React/Vite 기반 SPA 전환 및 Tailwind 빌드 파이프라인 도입 검토.
- Apps Script 대안으로 Cloud Run + Firestore 구조 매핑 검토.
- 실시간 알림(WebSocket/SignalR) 도입을 위한 이벤트 스트림 설계 연구.

---
문의나 피드백은 이슈 트래커 혹은 Slack 채널을 사용해주세요.
