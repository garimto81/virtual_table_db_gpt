# Apps Script Refactor Outline (Stage 4.3)

## 현황
- 단일 파일 `apps_script.gs`가 doGet/doPost와 모든 작업 로직을 포함.
- `verifyUpdate` 액션이 없어 프런트 버튼 상태 확인 실패.
- `updateSheet`가 E/F열에 모두 파일명을 기록하여 워크플로우 상태가 누락.

## 목표 변경사항
1. **모듈 구조 도입**
   - `src/core`: 공통 응답, 로깅, 시트 접근.
   - `src/handlers`: 액션별 로직(`updateSheet`, `verifyUpdate`, `analyzeHand`, `updateIndex`).
   - `src/routers`: doPost dispatcher.
2. **API 계약 정리**
   - `updateSheet` 요청 필드: `sheetUrl`, `rowNumber`, `filename`, `status`, `aiAnalysis`, `handNumber`(옵션).
   - 응답: `{ status: 'success', data: { rowNumber } }`.
   - `verifyUpdate`: `sheetUrl`, `rowNumber` → `{ columnD, columnE, columnF, columnH, columnI }`.
3. **로그 & 예외 핸들링 개선**
   - `CoreLogging`을 통해 일관된 로그 포맷을 사용.
   - 오류 발생 시 `statusCode` 포함 JSON 응답 반환.
4. **테스트 스텁 확보**
   - `test/SheetUpdate.test.gs`: status/filename 작성 검증.
   - `test/VerifyUpdate.test.gs`: 열 값 반환.
   - `test/AnalysisFallback.test.gs`: 기본 분석 응답.

## 다음 단계
- 기존 `apps_script.gs` 내용을 모듈 파일로 이전하고 점진적으로 함수 구현을 이식.
- CLASP 프로젝트로 변환해 버전 관리 및 배포 자동화를 마련.
- 실제 Google Sheets/Apps Script 환경에서 smoke test 수행 후 `docs/healthcheck_checklist.md` 업데이트.
