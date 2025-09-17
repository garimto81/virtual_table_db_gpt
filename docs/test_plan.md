# Stabilization & QA Checklist (Stage 4.5)

## 목표 시나리오
1. CSV 인덱스 로드 → 핸드 선택 → 상세 패널 표시.
2. 완료 버튼 플로우: 시간 매칭 → AI 분석 → Apps Script updateSheet.
3. 편집 버튼 플로우: 상태 `미완료` 업데이트.
4. 알림/팝업 작동(새 핸드 알림, 진행률 표시).
5. `verifyUpdate` 호출을 통한 버튼 상태 갱신.

## 테스트 계획
- **Front-end**:
  - 테스트 데이터: `samples/virtual_table_index_sample.csv`, `samples/virtual_table_hand_sample.csv`.
  - 브라우저: Chrome 최신 버전 (데스크톱).
  - 절차: 로컬 서버(또는 GitHub Pages 스테이징)에서 UI 기능 확인, 개발자 도구 네트워크 탭으로 Apps Script 응답 검증.
- **Apps Script**:
  - 액션: `updateSheet`, `verifyUpdate`, `updateIndex`.
  - 환경: 스테이징 시트/Apps Script 웹 앱(테스트용).
  - 도구: curl 또는 `scripts/app_script_tests.http` (추가 예정).

## TODO
- [ ] 프론트엔드 모듈 완성 및 UI 동작 점검.
- [ ] Apps Script 모듈 기능 구현 및 스테이징 환경 준비.
- [ ] 통합 테스트(프론트 + 백엔드) 수행.
- [ ] 테스트 결과 정리 (`docs/test_reports/2025-09-17-integrated.md`).

> 현재는 체크리스트 수립 단계이며, 실제 테스트 실행은 기능 이관 완료 후 진행합니다.
