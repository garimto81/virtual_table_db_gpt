# Claude Code 작업 규칙 및 가이드라인

## 📌 현재 프로젝트 상태 (2025-01-09 업데이트)

### Virtual Table DB Claude 프로젝트
- **버전**: v9.3.0
- **위치**: `C:\claude\virtual_table_db_claude_new\`
- **상태**: ✅ 모든 기능 정상 작동
- **최근 수정**:
  - 시분초 표기 문제 해결 (getHours/getMinutes/getSeconds 체이닝 수정)
  - 카드 문양 심볼 표시 (♠♥♦♣) - 이미 구현되어 있음 확인
  - 3줄 요약 간략화 (플레이어 vs 플레이어, 보드, 팟 정보만)

### 개발 환경 설정
```bash
# 로컬 테스트 서버 실행
cd C:\claude\virtual_table_db_claude_new
python -m http.server 8080
# 브라우저: http://localhost:8080/index.html
```

### 주요 파일 위치
- **메인 애플리케이션**: `index.html` (3700+ 줄)
- **README**: `README.md` (프로젝트 문서)
- **패키지 정보**: `package.json` (v1.5.0)

### 현재 작동 기능
1. **포커 핸드 모니터링**: CSV 파일에서 핸드 데이터 로드
2. **Virtual 시트 매칭**: 시간 기반 자동 매칭 (B열 Cyprus 시간 기준)
3. **AI 분석**: 직접 계산 기반 핸드 분석 (API 의존성 제거)
4. **시트 업데이트**: Apps Script 통한 자동 업데이트
5. **카드 표시**: 심볼(♠♥♦♣) 사용한 시각적 표현

---

## 📌 기본 규칙

### 1. Subagents와 MCP 적극 활용
- 복잡한 작업은 항상 적절한 subagent에게 위임
- 단순 작업도 MCP를 통해 자동화 고려
- 작업 시작 전 사용 가능한 도구 확인

### 2. 언어 설정
- **모든 응답은 한글로 작성**
- 코드 주석도 가능한 한글로 작성
- 기술 용어는 한글(영문) 형식 사용

### 3. 프로젝트 관리 원칙
- 프로젝트 간 충돌 방지를 위해 독립적 환경 유지
- 공통 모듈 수정 시 영향도 분석 필수
- 각 프로젝트별 README 최신 상태 유지

### 4. 단계적 사고 프로세스
- 복잡한 작업은 하위 작업으로 분해
- TodoWrite로 작업 계획 수립
- 각 단계별 적절한 subagent 할당

### 5. MCP 선택 가이드
- 작업 특성 분석 후 최적 MCP 선택
- 여러 MCP 조합 활용 고려
- 효율성과 정확성 균형 유지

## 🚀 주요 Subagents 활용 가이드

### 백엔드 개발
- `backend-architect`: API 설계, 데이터베이스 스키마
- `python-pro`: 고급 Python 기능 구현
- `deployment-engineer`: 배포 및 CI/CD 설정

### 프론트엔드 개발
- `frontend-developer`: Next.js/React 개발
- `typescript-expert`: TypeScript 타입 시스템
- `graphql-architect`: GraphQL 스키마 설계

### 데이터 및 AI
- `data-scientist`: 데이터 분석 및 SQL
- `ml-engineer`: ML 파이프라인 구축
- `ai-engineer`: LLM 통합 및 RAG 시스템

### 인프라 및 운영
- `cloud-architect`: 클라우드 인프라 설계
- `devops-troubleshooter`: 운영 이슈 해결
- `database-optimizer`: DB 성능 최적화

### 품질 관리
- `test-automator`: 테스트 코드 작성
- `security-auditor`: 보안 검토
- `code-reviewer`: 코드 품질 검토

## 📁 프로젝트별 주의사항

### Archive-MAM
- OpenCV 버전 호환성 확인
- 대용량 비디오 처리 시 메모리 관리
- Docker 환경에서 GUI 관련 이슈 주의

### poker-trend
- YouTube API 할당량 관리
- Gemini API 키 보안
- 일일 스케줄러 충돌 방지

### slack-report-automation
- Slack 권한 스코프 확인
- 타임존 설정 주의
- GitHub Actions 시크릿 관리

### superclaude
- 설치 경로 충돌 방지
- 플러그인 의존성 관리
- 버전 호환성 확인

## 🛠️ 자주 사용하는 명령어

```bash
# 테스트 실행
python aiden_test_advanced.py

# Docker 컨테이너 관리
docker-compose up -d
docker-compose logs -f

# 가상환경 활성화
python -m venv venv
venv\Scripts\activate  # Windows

# 의존성 설치
pip install -r requirements.txt
npm install
```

## 🔌 유용한 MCP 목록

### Supabase MCP
- 프로젝트 관리: `list_projects`, `get_project`
- 데이터베이스: `execute_sql`, `apply_migration`
- 보안 검사: `get_advisors`

### Context7 MCP
- 라이브러리 문서: `resolve-library-id`, `get-library-docs`
- 최신 버전 확인 및 마이그레이션 가이드

### Exa MCP
- 웹 검색: `web_search_exa`
- 기업 리서치: `company_research_exa`
- 심층 분석: `deep_researcher_start`

### GitHub MCP
- 저장소 검색: `search_repositories`
- 이슈 관리: `create_issue`, `update_issue`
- PR 생성: `create_pull_request`

## 📋 작업 흐름 예시

### 새 기능 개발 시
1. TodoWrite로 작업 계획 수립
2. `backend-architect`로 API 설계
3. `test-automator`로 테스트 작성
4. 구현 후 `code-reviewer`로 검토
5. `deployment-engineer`로 배포 설정

### 버그 수정 시
1. `devops-troubleshooter`로 원인 분석
2. `debugger`로 상세 디버깅
3. 수정 후 `test-automator`로 테스트
4. `security-auditor`로 보안 검토

### 성능 최적화 시
1. `performance-engineer`로 병목 지점 분석
2. `database-optimizer`로 쿼리 최적화
3. `python-pro` 또는 `typescript-expert`로 코드 개선
4. 테스트 및 모니터링 설정

## 🔄 정기 점검 사항

### 일일
- [ ] 모든 테스트 통과 확인
- [ ] API 할당량 확인
- [ ] 로그 이상 징후 점검

### 주간
- [ ] 의존성 업데이트 확인
- [ ] 보안 취약점 스캔
- [ ] 백업 상태 확인

### 월간
- [ ] 전체 프로젝트 문서 업데이트
- [ ] 성능 지표 분석
- [ ] 비용 최적화 검토

## 🔧 필수 작업 프로세스

### ⚠️ **모든 수정 작업 시 필수 수행 사항**

#### 1. **버전 관리**
- 수정할 때마다 **반드시** 버전 업데이트 처리
- 시맨틱 버저닝 적용: `MAJOR.MINOR.PATCH`
  - **MAJOR**: 호환되지 않는 API 변경
  - **MINOR**: 기능 추가 (하위 호환)
  - **PATCH**: 버그 수정 (하위 호환)
- HTML 파일 내 버전 정보 동기화
- 커밋 메시지에 버전 정보 포함

#### 2. **완전한 테스트 수행**
- 수정할 때마다 **반드시** 완벽한 테스트 실행
- 다음 테스트 항목 필수 확인:
  - [ ] 기본 기능 동작 테스트
  - [ ] 새로 추가된 기능 테스트
  - [ ] 기존 기능 회귀 테스트
  - [ ] 오류 상황 처리 테스트
  - [ ] 다양한 브라우저에서 테스트
  - [ ] 모바일 환경 테스트 (해당 시)
- 테스트 실패 시 **절대 배포 금지**
- 모든 테스트 통과 후에만 다음 단계 진행

#### 3. **문서 업데이트**
- 수정할 때마다 **반드시** README.md 파일 업데이트
- 다음 내용 필수 업데이트:
  - [ ] 버전 히스토리 추가
  - [ ] 새로운 기능 설명
  - [ ] 변경된 API 또는 사용법
  - [ ] 알려진 이슈 또는 해결된 버그
  - [ ] 설치 및 설정 가이드 (변경 시)
  - [ ] 스크린샷 또는 예시 (UI 변경 시)
- 문서와 코드의 일치성 확인

## 💡 팁과 모범 사례

1. **병렬 처리**: 여러 도구를 동시에 호출하여 작업 시간 단축
2. **컨텍스트 관리**: 큰 파일은 부분적으로 읽어 토큰 절약
3. **에러 처리**: 항상 예외 상황 고려하여 안정적인 코드 작성
4. **문서화**: 코드 작성과 동시에 문서 업데이트
5. **테스트 우선**: TDD 접근 방식으로 품질 보장
6. **버전 관리**: 모든 변경 사항에 대해 적절한 버전 업데이트
7. **완전한 검증**: 배포 전 모든 기능 완전 테스트

## 📞 도움말 및 참고 자료

- Claude Code 문서: https://docs.anthropic.com/en/docs/claude-code
- 피드백 제출: https://github.com/anthropics/claude-code/issues
- 프로젝트 마스터 플랜: [PROJECT_MASTER_PLAN.md](./PROJECT_MASTER_PLAN.md)

---

이 문서는 지속적으로 업데이트됩니다.
최종 수정일: 2025-09-08

## 📋 체크리스트 템플릿

### 🔄 **매 수정 작업 시 확인 사항**
```
□ 버전 업데이트 완료 (HTML 파일 내 버전 정보 동기화)
□ 기본 기능 테스트 완료
□ 새 기능 테스트 완료  
□ 회귀 테스트 완료
□ 오류 상황 테스트 완료
□ 브라우저 호환성 테스트 완료
□ README.md 업데이트 완료
□ 버전 히스토리 추가 완료
□ 커밋 메시지에 버전 정보 포함
□ 모든 테스트 통과 확인
```

### ⚠️ **배포 전 최종 점검**
```
□ 로컬 환경에서 완전 동작 확인
□ 프로덕션 환경 테스트 완료
□ 문서와 코드 일치성 확인
□ 백업 및 롤백 계획 수립
□ 모니터링 설정 확인
```