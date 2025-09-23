# 📚 Claude Task 도구 완벽 가이드

> 작성일: 2025-09-23
> 목적: Task 도구의 모든 기능과 사용법 상세 설명

---

## 🎯 Task 도구란?

Task 도구는 Claude가 **특화된 AI 에이전트(Subagent)를 호출**하여 복잡한 작업을 자율적으로 수행하도록 하는 강력한 기능입니다.

### 핵심 개념
- **Subagent**: 특정 분야에 특화된 AI 에이전트
- **자율 실행**: 에이전트가 독립적으로 작업 수행
- **단일 응답**: 에이전트는 한 번만 응답 (대화 불가)
- **병렬 실행**: 여러 에이전트 동시 실행 가능

---

## 🤖 사용 가능한 Subagent 목록

### 1. 개발 관련 에이전트

#### **backend-architect**
```python
# 용도: API 설계, DB 스키마, 백엔드 아키텍처
Task(
    subagent_type="backend-architect",
    description="REST API 설계",
    prompt="""
    사용자 관리 시스템을 위한 RESTful API를 설계하세요.
    - 사용자 CRUD
    - 인증/인가
    - 역할 기반 접근 제어
    OpenAPI 스펙으로 작성하세요.
    """
)
```

#### **frontend-developer**
```python
# 용도: Next.js/React 구현, UI 컴포넌트
Task(
    subagent_type="frontend-developer",
    description="대시보드 UI 구현",
    prompt="""
    Next.js와 shadcn/ui를 사용하여 관리자 대시보드를 구현하세요.
    - 사용자 통계 차트
    - 데이터 테이블
    - 필터링 기능
    """
)
```

#### **typescript-expert**
```python
# 용도: TypeScript 고급 기능, 타입 시스템
Task(
    subagent_type="typescript-expert",
    description="타입 정의 작성",
    prompt="""
    복잡한 제네릭 타입과 조건부 타입을 사용하여
    타입 안전한 이벤트 시스템을 구현하세요.
    """
)
```

#### **python-pro**
```python
# 용도: Python 고급 패턴, 최적화
Task(
    subagent_type="python-pro",
    description="데코레이터 구현",
    prompt="""
    비동기 함수를 지원하는 캐싱 데코레이터를 구현하세요.
    TTL, 메모리 제한, 통계 기능을 포함하세요.
    """
)
```

---

### 2. 데이터베이스 & 백엔드 에이전트

#### **supabase-engineer**
```python
# 용도: Supabase 아키텍처, RLS, 실시간 기능
Task(
    subagent_type="supabase-engineer",
    description="Supabase 설계",
    prompt="""
    다중 테넌트 SaaS를 위한 Supabase 구조를 설계하세요.
    - RLS 정책
    - 실시간 구독
    - Edge Functions
    """
)
```

#### **database-optimizer**
```python
# 용도: 쿼리 최적화, 인덱스 설계
Task(
    subagent_type="database-optimizer",
    description="쿼리 최적화",
    prompt="""
    다음 느린 쿼리를 최적화하세요:
    SELECT * FROM orders WHERE customer_id = ?
    AND status = 'pending' AND created_at > ?

    인덱스 전략과 쿼리 개선안을 제시하세요.
    """
)
```

#### **graphql-architect**
```python
# 용도: GraphQL 스키마, 리졸버, 페더레이션
Task(
    subagent_type="graphql-architect",
    description="GraphQL 스키마",
    prompt="""
    전자상거래 플랫폼을 위한 GraphQL 스키마를 설계하세요.
    - 제품, 카테고리, 리뷰
    - 페이지네이션
    - 필터링/정렬
    """
)
```

---

### 3. 테스트 & 품질 관리 에이전트

#### **test-automator**
```python
# 용도: 포괄적인 테스트 스위트 작성
Task(
    subagent_type="test-automator",
    description="테스트 작성",
    prompt="""
    인증 서비스에 대한 전체 테스트를 작성하세요:
    - 단위 테스트
    - 통합 테스트
    - E2E 테스트
    Jest와 Playwright를 사용하세요.
    """
)
```

#### **playwright-engineer**
```python
# 용도: E2E 테스트, 브라우저 자동화
Task(
    subagent_type="playwright-engineer",
    description="E2E 테스트",
    prompt="""
    Playwright로 체크아웃 프로세스를 테스트하세요:
    - 제품 선택
    - 장바구니 추가
    - 결제 프로세스
    - 주문 확인
    스크린샷과 함께 결과를 보고하세요.
    """
)
```

#### **code-reviewer**
```python
# 용도: 코드 품질 검토, 보안 체크
Task(
    subagent_type="code-reviewer",
    description="코드 리뷰",
    prompt="""
    다음 인증 코드를 검토하세요:
    [코드 내용]

    보안 취약점, 성능 문제, 코드 품질을 점검하세요.
    """
)
```

#### **security-auditor**
```python
# 용도: 보안 취약점 분석, OWASP 검증
Task(
    subagent_type="security-auditor",
    description="보안 감사",
    prompt="""
    API 엔드포인트의 보안을 검토하세요:
    - 인증/인가
    - 입력 검증
    - SQL 인젝션
    - XSS 방어
    """
)
```

---

### 4. DevOps & 인프라 에이전트

#### **deployment-engineer**
```python
# 용도: CI/CD, Docker, Kubernetes
Task(
    subagent_type="deployment-engineer",
    description="CI/CD 구성",
    prompt="""
    GitHub Actions로 CI/CD 파이프라인을 구성하세요:
    - 테스트 자동화
    - Docker 이미지 빌드
    - AWS ECS 배포
    """
)
```

#### **cloud-architect**
```python
# 용도: 클라우드 인프라 설계
Task(
    subagent_type="cloud-architect",
    description="AWS 아키텍처",
    prompt="""
    고가용성 웹 애플리케이션을 위한 AWS 아키텍처를 설계하세요:
    - 멀티 AZ 구성
    - 오토스케일링
    - CDN 설정
    비용 최적화 방안도 포함하세요.
    """
)
```

#### **devops-troubleshooter**
```python
# 용도: 운영 이슈 해결, 로그 분석
Task(
    subagent_type="devops-troubleshooter",
    description="장애 분석",
    prompt="""
    프로덕션 서버에서 메모리 사용량이 급증했습니다.
    다음 로그를 분석하고 원인을 찾아주세요:
    [로그 내용]
    """
)
```

---

### 5. 특수 목적 에이전트

#### **debugger**
```python
# 용도: 버그 원인 분석, 디버깅
Task(
    subagent_type="debugger",
    description="버그 수정",
    prompt="""
    함수가 예상과 다른 결과를 반환합니다:
    입력: [1, 2, 3]
    예상: 6
    실제: null

    원인을 찾고 수정하세요.
    """
)
```

#### **performance-engineer**
```python
# 용도: 성능 최적화, 프로파일링
Task(
    subagent_type="performance-engineer",
    description="성능 개선",
    prompt="""
    API 응답 시간이 3초입니다.
    병목 지점을 찾고 1초 이내로 최적화하세요.
    """
)
```

#### **mobile-developer**
```python
# 용도: React Native/Flutter 개발
Task(
    subagent_type="mobile-developer",
    description="모바일 앱",
    prompt="""
    React Native로 카메라 기능을 구현하세요:
    - 사진 촬영
    - 갤러리 저장
    - 필터 적용
    """
)
```

---

## 💡 Task 도구 사용 패턴

### 1. 단일 에이전트 호출
```python
# 하나의 에이전트에게 작업 위임
result = Task(
    subagent_type="backend-architect",
    description="API 설계",  # 3-5 단어
    prompt="사용자 인증 API를 설계하세요..."  # 상세 지시
)
```

### 2. 병렬 실행 (권장)
```python
# 여러 에이전트 동시 실행 - 성능 최적화
results = [
    Task(
        subagent_type="backend-architect",
        description="API 설계",
        prompt="..."
    ),
    Task(
        subagent_type="frontend-developer",
        description="UI 구현",
        prompt="..."
    ),
    Task(
        subagent_type="test-automator",
        description="테스트 작성",
        prompt="..."
    )
]
# 모든 작업이 동시에 실행됨
```

### 3. 순차적 파이프라인
```python
# 1단계: 설계
design = Task(
    subagent_type="backend-architect",
    description="시스템 설계",
    prompt="마이크로서비스 아키텍처 설계..."
)

# 2단계: 구현
implementation = Task(
    subagent_type="backend-architect",
    description="서비스 구현",
    prompt=f"다음 설계를 기반으로 구현: {design}"
)

# 3단계: 테스트
tests = Task(
    subagent_type="test-automator",
    description="테스트 작성",
    prompt=f"다음 코드에 대한 테스트 작성: {implementation}"
)
```

### 4. 조건부 실행
```python
# 코드 리뷰 후 필요시 보안 감사
review = Task(
    subagent_type="code-reviewer",
    description="코드 리뷰",
    prompt="보안 관련 코드 검토..."
)

if "security concern" in review:
    audit = Task(
        subagent_type="security-auditor",
        description="보안 감사",
        prompt="심층 보안 분석..."
    )
```

---

## 📝 프롬프트 작성 가이드

### 효과적인 프롬프트 구조
```
1. **목표 명시**: 무엇을 달성해야 하는지
2. **컨텍스트 제공**: 배경 정보, 제약 사항
3. **구체적 요구사항**: 명확한 체크리스트
4. **출력 형식**: 원하는 결과 형태
5. **품질 기준**: 성공 기준, 검증 방법
```

### 좋은 프롬프트 예시
```python
prompt = """
목표: 사용자 인증 시스템 구현

컨텍스트:
- Next.js 14 앱 라우터 사용
- PostgreSQL 데이터베이스
- 1만 명 동시 사용자 지원

요구사항:
1. JWT 기반 인증
2. OAuth 2.0 (Google, GitHub)
3. 2FA 지원
4. 세션 관리
5. 비밀번호 재설정

출력:
- 완전한 코드 구현
- 테스트 코드
- API 문서
- 배포 가이드

품질 기준:
- 보안 best practices 준수
- 95% 테스트 커버리지
- 응답 시간 < 200ms
"""
```

---

## ⚠️ 주의사항 및 제한

### 1. 상태 비저장 (Stateless)
- 각 에이전트 호출은 독립적
- 이전 대화 기억 못함
- 한 번의 응답으로 모든 작업 완료해야 함

### 2. 응답 제한
- 에이전트는 단 한 번만 응답
- 추가 질문이나 대화 불가
- 모든 필요 정보를 프롬프트에 포함

### 3. 파일 접근
- 에이전트는 파일 시스템 직접 접근 가능
- 읽기/쓰기/수정 모두 가능
- 결과는 텍스트로만 반환

### 4. 실행 시간
- 복잡한 작업은 시간이 걸릴 수 있음
- 타임아웃 설정 불가
- 병렬 실행으로 시간 단축 권장

---

## 🎯 사용 시나리오별 가이드

### 시나리오 1: 새 기능 개발
```python
# 1. 설계
design = Task("backend-architect", "API 설계", "...")

# 2. 프론트/백 동시 개발
[
    Task("backend-architect", "백엔드 구현", "..."),
    Task("frontend-developer", "프론트 구현", "...")
]

# 3. 테스트
Task("test-automator", "통합 테스트", "...")

# 4. 배포
Task("deployment-engineer", "배포 설정", "...")
```

### 시나리오 2: 버그 수정
```python
# 1. 디버깅
Task("debugger", "원인 분석", "...")

# 2. 수정
Task("backend-architect", "버그 수정", "...")

# 3. 검증
Task("test-automator", "회귀 테스트", "...")
```

### 시나리오 3: 성능 최적화
```python
# 1. 분석
Task("performance-engineer", "병목 분석", "...")

# 2. 최적화
[
    Task("database-optimizer", "DB 최적화", "..."),
    Task("backend-architect", "코드 최적화", "...")
]

# 3. 검증
Task("performance-engineer", "성능 측정", "...")
```

### 시나리오 4: 보안 강화
```python
# 1. 감사
Task("security-auditor", "취약점 스캔", "...")

# 2. 패치
Task("security-auditor", "보안 패치", "...")

# 3. 검증
Task("playwright-engineer", "보안 테스트", "...")
```

---

## 📊 성능 최적화 팁

### 1. 병렬 실행 활용
```python
# ❌ 나쁜 예: 순차 실행 (느림)
task1 = Task(...)
task2 = Task(...)
task3 = Task(...)

# ✅ 좋은 예: 병렬 실행 (빠름)
[Task(...), Task(...), Task(...)]
```

### 2. 작업 세분화
```python
# ❌ 나쁜 예: 하나의 거대한 작업
Task("backend-architect", "전체 시스템 구현", "...")

# ✅ 좋은 예: 작은 단위로 분할
[
    Task("backend-architect", "API 설계", "..."),
    Task("backend-architect", "DB 스키마", "..."),
    Task("backend-architect", "비즈니스 로직", "...")
]
```

### 3. 적절한 에이전트 선택
```python
# ❌ 나쁜 예: 범용 에이전트 사용
Task("general-purpose", "React 컴포넌트", "...")

# ✅ 좋은 예: 전문 에이전트 사용
Task("frontend-developer", "React 컴포넌트", "...")
```

---

## 🔧 트러블슈팅

### 문제 1: 에이전트가 작업을 완료하지 못함
**원인**: 프롬프트가 너무 모호하거나 정보 부족
**해결**: 구체적인 요구사항과 컨텍스트 추가

### 문제 2: 결과가 기대와 다름
**원인**: 잘못된 에이전트 선택
**해결**: 작업에 적합한 전문 에이전트 사용

### 문제 3: 실행 시간이 너무 김
**원인**: 작업이 너무 크거나 복잡
**해결**: 작업을 작게 분할하고 병렬 실행

### 문제 4: 에러 발생
**원인**: 프롬프트 구문 오류 또는 제한 초과
**해결**: 프롬프트 검증 및 단순화

---

## 📚 참고 자료

- [Claude Documentation](https://docs.anthropic.com)
- [Subagent Best Practices](https://docs.anthropic.com/subagents)
- [Task Tool API Reference](https://docs.anthropic.com/task-api)

---

**작성자**: Claude AI Assistant
**버전**: v1.0.0
**최종 수정일**: 2025-09-23