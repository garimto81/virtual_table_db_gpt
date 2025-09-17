# Pre-Refactor Status Summary

## Code Snapshot & Tagging
- Reference repository: `garimto81/virtual_table_db_claude` @ commit `ac940c5b0f08586a8205d5e393912703cbd7f7ab`.
- Current documentation repo tag: `snapshot/pre-refactor` (points to commit 46c8a08).
- Refactor working branch created: `refactor/main-structure` (remote-tracking).

## Google Sheets Layout (현행)
- **Main/Virtual Sheet (gid=561799849)**
  - B열: Cyprus time string used for ±3분 매칭.
  - C열: Seoul time string (백업용 타임존).
  - D열: 핸드 번호 (`HAND12345`).
  - E열: 작업 상태(계획상 `미완료`/`복사완료` 저장 예정이나 현재는 파일명으로 사용).
  - F열: 파일명 (실제 영상 파일명).
  - H열: AI 분석 요약 (Gemini or fallback).
  - I열: 업데이트 타임스탬프.
- **Index Sheet (gid=1354012271)**
  - A열: 핸드 번호.
  - B/C열: 시작/종료 행 번호.
  - D열: 최근 작업 시간.
  - E열: 카메라/파일명 참조 필드.
  - 이후 열: 마지막 스트리트, 최근 액션, 작업 상태 등 메타 정보.

## Apps Script Deployment (v3.4.4)
- Entry points: `doGet`, `doPost` with actions `updateSheet`, `updateHand`, `analyzeHand`, `updateIndex`, `test`.
- `updateSheet` 업데이트 필드: D, E, F, H, I열 (status 값 미적용 상태).
- `updateIndexSheet`는 Index A열 검색 후 E열을 갱신.
- Gemini API 호출: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent` (API 키는 Script Properties).
- 현재 배포 접근: 웹앱(모든 사용자) + text/plain JSON 허용.

## Outstanding Gaps Before Refactor
- E열 status 저장 로직 미구현 → Apps Script 수정 필요.
- `verifyUpdate` 액션 미구현 → 프론트 버튼 상태 검증 실패.
- CSV URL 다중 하드코딩 (hand/index/type) → 설정화 필요.
- Progress modal cancel flag 전파 실패 (`findClosestVirtualRow`).
- AI 분석 시 `analyzeHandWithAI` 인자 타입 불일치.
- Notification/Popup 로직 분산 및 캐시 초기화 중복.

## Next-Step Artifacts
- Sample CSV provided in `samples/virtual_table_index_sample.csv` and `samples/virtual_table_hand_sample.csv` for local tests.
- Health-check checklist draft: `docs/healthcheck_checklist.md` (see repo).
