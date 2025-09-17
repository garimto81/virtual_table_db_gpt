# Repository Guidelines

## Project Structure & Module Organization
- `REFACTORING_PLAN.md` — 텍스트 기반 리팩토링 로드맵.
- 향후 구조 권장 사항: `src/`(프론트엔드 모듈), `apps_script/`(Google Apps Script), `docs/`(가이드), `tools/`(테스트/배포 스크립트).
- 브랜치 전략: 주 작업은 `main`, 대규모 개편은 `refactor/*`, 버그 픽스는 `fix/*` 네이밍을 권장합니다.

## Build, Test, and Development Commands
- 프론트엔드 번들 준비(도입 예정): `npm run build` — ES Module을 하나의 정적 빌드로 묶습니다.
- 로컬 테스트 서버: `npm run dev` — 대시보드를 로컬에서 검수.
- Apps Script 배포: `clasp push && clasp deploy` — Google Apps Script 코드 반영.

## Coding Style & Naming Conventions
- JavaScript: 2-스페이스 인덴트, ES2020 문법 우선, 함수는 `camelCase`, 상수는 `SCREAMING_SNAKE_CASE`.
- Google Apps Script: `camelCase` 함수, 내부 로그는 `console.log('🔍 ...')` 형태로 맥락 표시.
- 파일 네이밍: 기능 기반 (`handService.js`, `progressPanel.js`), 문서 파일은 대문자 스네이크(`API_GUIDE.md`).

## Testing Guidelines
- 프론트엔드 단위 테스트: `npm run test` (Vitest/Jest 권장). 테스트 파일은 `*.spec.js`.
- Apps Script: `npm run test:gas` 또는 `clasp run` 기반 시뮬레이터 활용, `test/` 폴더에 `*.gs` 테스트 스텁.
- 변경 사항은 CSV 파싱, 시간 매칭, 시트 업데이트 흐름을 최소 1회 이상 검증해야 합니다.

## Commit & Pull Request Guidelines
- 커밋 메시지: `<type>: <summary>` (예: `feat: add virtual sheet matcher`). 주요 타입 `feat`, `fix`, `docs`, `refactor`, `test` 사용.
- PR 필수 항목: 요약, 주요 변경점 bullet, 테스트 결과 (`npm run test` / `clasp run`), 관련 이슈 링크.
- 스크린샷 또는 GIF는 UI 변경 시 첨부하고, Apps Script 변경은 주요 로그 스니펫을 기입합니다.

## Security & Configuration Tips
- Google Sheets URL, Gemini 키 등 민감 정보는 `.env`와 Apps Script Properties에 저장하고 저장소에 커밋하지 않습니다.
- 배포 전 `config.sample.json`을 최신 상태로 유지해 신규 기여자가 빠르게 환경을 구성하도록 돕습니다.
