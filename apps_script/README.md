# Apps Script Refactor Plan (Stage 4.3)

## 목표
- Google Apps Script 코드(`apps_script.gs`)를 모듈 구조로 분할하고 CLASP 혹은 clasp-like 워크플로로 관리합니다.
- 프론트엔드 요구사항(`verifyUpdate` 액션, `status` 컬럼 반영 등)에 맞춰 API 계약을 구체화합니다.
- 테스트 스텁을 마련해 `updateSheet`, `verifyUpdate`, `analyzeHand` 동작을 로컬에서 시뮬레이션합니다.

## 제안 구조
```
apps_script/
├── appsscript.json          # 프로젝트 설정 (샘플)
├── src/
│   ├── main.gs              # doGet/doPost 엔트리
│   ├── routers/dispatcher.gs
│   ├── handlers/
│   │   ├── updateSheet.gs   # status/E열 업데이트 포함
│   │   ├── verifyUpdate.gs  # 새 액션 처리
│   │   ├── analyzeHand.gs
│   │   └── updateIndex.gs
│   └── core/
│       ├── sheets.gs        # 시트 접근 유틸
│       ├── responses.gs     # CORS/JSON 응답 유틸
│       └── logging.gs       # 로그 헬퍼
└── test/
    ├── SheetUpdate.test.gs
    ├── VerifyUpdate.test.gs
    └── AnalysisFallback.test.gs
```

> 현재 저장소에는 스텁 파일만 존재하며, 실제 구현은 기존 `apps_script.gs`에서 점진적으로 이동합니다.

## 예정된 API 변경점
- `verifyUpdate` 액션 추가: `{ action: 'verifyUpdate', sheetUrl, rowNumber }` → `{ status: 'success', data: { columnE, columnF, columnH } }`.
- `updateSheet` 입력 스키마에 `status` 필드를 허용하고, E열에는 상태, F열에는 파일명을 기록하도록 분리.
- 응답 포맷 표준화: 모든 액션은 `{ status, message, data }` 형식을 유지.

## 개발 메모
- CLASP 사용 시 `clasp create --type standalone` 후 `src/`를 push.
- 테스트는 [https://github.com/google/clasp/tree/master/tests](https://github.com/google/clasp/tree/master/tests)를 참고해 `global.SpreadsheetApp` 목을 구성.
- Gemini API 키는 Script Properties(`GEMINI_API_KEY`)에 저장, 테스트에서는 MOCK 응답 사용.
