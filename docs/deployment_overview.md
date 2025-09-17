# Deployment Overview (Stage 4.4)

## 구성 파일
- `config/app.config.sample.json`: 프론트엔드에서 사용할 Google Sheets/Apps Script URL 템플릿 및 기능 플래그.
- `config/app.config.schema.json`: JSON Schema 기반 검증 규칙(추후 CI에서 사용 예정).
- `.env.example`: CLASP, Gemini API 키, 프론트엔드 빌드 경로 등의 환경 변수 템플릿.

## 스크립트
- `npm run build:pages`
  - `scripts/build-pages.mjs` 실행 → 샘플 설정 파일을 `dist/`로 복사해 GitHub Pages 배포 대비.
- `npm run deploy:apps-script`
  - CLASP를 통해 Apps Script 코드를 푸시 및 배포 (추후 CLASP 설정 필요).

## 향후 작업
- 실제 배포 구성 (`dist/` HTML, CSS, JS)을 자동화하는 빌드 파이프라인 추가.
- 버전 정보(`APP_VERSION`, `BUILD_TIME`)를 자동으로 주입하는 스크립트 작성 (`scripts/update-version.mjs` 예정).
- 배포 체크리스트 문서화: GitHub Pages, Apps Script, Sheets 권한, Gemini API 키 등 점검 항목 통합.

## 체크리스트 연계
- `docs/healthcheck_checklist.md`에 구성, API, 시트 권한 검증 항목을 유지하며, 향후 `docs/DEPLOYMENT_CHECKLIST.md`로 확장 계획.

> 4.4 단계는 배포 준비를 위한 템플릿/스크립트 생성까지 완료했으며, 실제 빌드·자동화는 후속 단계에서 다룹니다.
