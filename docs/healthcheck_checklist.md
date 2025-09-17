# Health Check Checklist (Pre-Refactor)

## Google Sheets
- [ ] Main sheet (`MAIN_SHEET_URL`) 공개 범위: 링크가 있는 사용자(읽기) + Apps Script 계정 편집 권한.
- [ ] Index sheet gid 값 확인 (기본: `1354012271`).
- [ ] Virtual sheet 시간 컬럼(B열) 샘플 5개 수동 확인 (HH:MM 또는 HH:MM:SS 포맷).
- [ ] Apps Script 계정으로 수동 업데이트 테스트 (E/F/H/I열).

## Apps Script Web App
- [ ] 배포 사용자: `나`, 액세스: `모든 사용자`.
- [ ] `doGet` 호출: `curl <SCRIPT_URL>` 결과 `status: ok` 확인.
- [ ] `doPost` `action:test` 호출 시 `status: success` 응답.
- [ ] Script Properties: `GEMINI_API_KEY`, `SHEET_ID_MAIN`, `SHEET_ID_INDEX` 저장 여부 점검.

## Frontend Dashboard
- [ ] `CONFIG` 업데이트 (CSV/Script URL, 알림/사운드 설정).
- [ ] `Debug` 패널에서 단계 1~3 (URL → Script 연결 → 시트 업데이트) 수동 실행.
- [ ] 완료/편집 버튼 로딩 상태 확인 (`verifyUpdate` 응답 필요).

## Local Fixtures
- [ ] `samples/virtual_table_index_sample.csv` 로드하여 parse 정상 여부 확인.
- [ ] `samples/virtual_table_hand_sample.csv` 로드 시 보드/플레이어 섹션 에러 여부 확인.

> 리팩토링 착수 전 위 항목을 모두 만족시키고, 이 문서를 업데이트하여 최신 현황을 유지하세요.
