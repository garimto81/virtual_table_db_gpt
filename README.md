# Virtual Table DB v13.3.5

포커 핸드 모니터링 및 분석 시스템

## 🚀 주요 기능

- **실시간 핸드 감지**: SSE를 통한 자동 새 핸드 감지
- **보안 강화**: JWT 인증 시스템 및 RBAC 구현
- **자막 생성**: 키 플레이어 자막 자동 생성
- **Google Sheets 연동**: 실시간 데이터 동기화

## 📂 구조

```
virtual_table_db_claude/
├── index.html          # 메인 애플리케이션
├── sse-client.js       # SSE 클라이언트
├── src/                # 소스 코드
│   ├── modules/        # 모듈화된 컴포넌트
│   └── scripts/        # Apps Script
└── archive/            # 문서 및 도구 아카이브
```

## ⚙️ 설정

1. **Google Sheets**: CSV 형식으로 웹에 게시
2. **Apps Script**: `src/scripts/apps_script.gs` 배포
3. **Gemini API**: 설정 패널에서 API 키 입력

## 🔧 최신 업데이트 (v13.3.5)

- **보안 강화**: TypeScript 기반 보안 서버 구현
- **코드 정리**: Gemini API 제거, 핵심 기능만 유지
- **API 최적화**: Google Sheets 업데이트, 파일명/자막 생성 API
- **TypeScript 완전 지원**: 모든 컴파일 오류 해결

---

**Live Demo**: [GitHub Pages](https://garimto81.github.io/virtual_table_db_claude/)