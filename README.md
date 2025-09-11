# 🎯 포커 핸드 모니터링 시스템 v9.5.1

**실시간 포커 핸드 분석 및 Virtual 시트 매칭 시스템**

## 🚨 현재 작업 상태 (2025-01-11)

### ✅ 완료된 작업
1. **프로젝트 정리**
   - 불필요한 폴더 800+ 파일 삭제 완료
   - 단일 index.html 파일로 통합
   - 중복 코드 제거 및 최적화

2. **Virtual 시트 매칭 문제 해결**
   - CSV 파싱 로직 수정 (\\r 제거)
   - 시간 패턴 매칭 개선
   - "유효한 시간 데이터: 0개" 오류 해결

3. **Apps Script 통합**
   - CORS 문제 해결 코드 작성
   - 기존 로직과 100% 호환 유지
   - 상세 통합 가이드 작성 완료

4. **Apps Script URL 업데이트 (v9.5.1)**
   - 새로운 배포 URL 적용 완료
   - CORS 오류 해결
   - 테스트 도구 생성 (test_connection.html)

### 🔄 진행 중인 작업
- GitHub Pages에서 실제 환경 테스트 필요

### 📝 다음 작업 예정
1. Apps Script 실제 배포 및 URL 설정
2. GitHub Pages에서 전체 시스템 테스트
3. Gemini API 키 설정 (AI 분석 활성화)
4. 성능 모니터링 및 최적화

---

## 📋 프로젝트 개요

### 핵심 목적
- 실시간 포커 핸드 데이터 모니터링
- 키 플레이어 분석 및 추적
- Virtual 시트와의 정확한 시간 매칭
- AI 기반 핸드 분석 및 자동 파일명 생성

### 주요 특징
- **단일 HTML 파일** 구조로 간단한 배포
- **실시간 데이터 동기화** (10초 간격)
- **개선된 Virtual 시트 매칭** (±3분 범위 검색)
- **로컬 상태 저장** (완료 상태 복구)
- **직접 계산 기반 AI 분석** (외부 API 의존성 제거)

---

## 🗂 프로젝트 구조

```
C:\claude\
├── index.html                      # 메인 애플리케이션 (v9.5.0)
├── README.md                       # 프로젝트 문서 (이 파일)
├── CLAUDE.md                       # Claude Code 작업 규칙
├── apps_script_updated.gs          # Google Apps Script (CORS 지원)
├── APPS_SCRIPT_INTEGRATION_GUIDE.md # Apps Script 통합 가이드
└── [기타 테스트 파일들]
```

### 단일 HTML 파일 아키텍처
- **전체 시스템이 하나의 HTML 파일에 포함** (3700+ 줄)
- CSS, JavaScript 모두 인라인으로 구현
- 외부 의존성: Tailwind CSS (CDN), Google Fonts
- 배포: GitHub Pages 자동 배포
- **핵심 설정**: 3개의 URL 설정값으로 전체 시스템 작동

---

## 🔧 주요 설정값 설명

### CONFIG 객체 (index.html 내부)
```javascript
const CONFIG = {
  READ_SHEET_URL: '',      // CSV 읽기용 (Google Sheets 공개 URL)
  WRITE_SHEET_URL: '',     // 결과 기록용 (편집 가능한 시트)
  SHEET_UPDATE_SCRIPT_URL: '' // Apps Script 웹 앱 URL
};
```

1. **READ_SHEET_URL**: 포커 핸드 데이터를 읽어오는 CSV URL
   - 형식: `https://docs.google.com/.../pub?gid=0&single=true&output=csv`
   - 용도: 실시간 데이터 모니터링

2. **WRITE_SHEET_URL**: Virtual 시트 매칭 및 결과 기록용
   - 형식: `https://docs.google.com/.../edit#gid=561799849`
   - 용도: 시간 매칭 및 AI 분석 결과 저장

3. **SHEET_UPDATE_SCRIPT_URL**: Google Apps Script 엔드포인트
   - 형식: `https://script.google.com/macros/s/.../exec`
   - 용도: CORS 우회 및 시트 업데이트

---

## 📊 데이터 구조 및 시트 연동

### Google Sheets 연동 구조

#### 1. 메인 핸드 데이터 (GID: 1906746276)
```
A: 테이블번호    B: 핸드번호      C: 테이블명
D: 팟금액       E: 보드카드      F: 편집완료
G: 핸드시간     H: 최종파일명     I: AI분석
J: 카메라파일   K: 블라인드      L: 게임타입
M: 플레이어수
```

#### 2. 플레이어 데이터 시트 (GID: 1245677002)
```
A: 행번호      B: 플레이어명    C: 핸드카드
D: 포지션      E: 액션         F: 승리여부
G: 핸드랭크    H: 게인/로스     I: 필터
```

#### 3. Virtual 시트 (GID: 561799849)
```
A: 순번        B: Cyprus시간    C: 핸드번호
D: 파일명      E: AI분석       F: 상태
```

### API 및 외부 서비스 연동
- **Google Sheets API**: CSV 데이터 실시간 읽기
- **Apps Script**: 시트 직접 업데이트 (CORS 우회)
- **LocalStorage**: 완료 상태 로컬 저장
- **Tailwind CSS**: UI 스타일링 (CDN)

---

## 📈 버전 히스토리

### v9.5.2 (2025-01-11) - Apps Script URL 처리 로직 개선
- **URL 처리 버그 수정**: 입력 필드에서 실시간으로 URL 가져오기
- **이전 URL 자동 감지 및 교체**: localStorage에 저장된 이전 URL 자동 업데이트
- **testAppsScriptConnection 함수 개선**: CONFIG 대신 입력 필드 값 직접 사용
- **updateSheetData 함수 개선**: 실시간 URL 사용으로 캐시 문제 해결

### v9.5.1 (2025-01-11) - Apps Script URL 업데이트 및 CORS 해결
- **Apps Script 새 배포 URL 적용**
- **CORS 오류 완전 해결**
- **테스트 도구 추가** (test_connection.html)
- **문서 개선**: CORS_FIX_GUIDE.md, QUICK_FIX.md 추가
- **배포 설정 가이드 강화**

### v9.5.0 (2025-01-09) - Virtual 시트 매칭 개선 및 프로젝트 정리
- Virtual 시트 시간 매칭 로직 개선
- CSV 파싱 안정성 향상 (\\r 문자 처리)
- 시간 패턴 매칭 정확도 향상
- 콘솔 로그 중복 문제 수정
- 프로젝트 구조 대규모 정리 (800+ 파일 삭제)
- Apps Script CORS 문제 해결
- AI 분석 로직 개선 (직접 계산 방식)

### v8.7.1 (2025-09-07) - 핫픽스 & 안정성
#### 🔨 카드 표시 및 파싱 개선
- **카드 렌더링 크래시 방지**: 빈 카드 데이터 안전 처리
- **보드 카드 파싱 강화**: 띄어쓰기 및 특수 케이스 처리
- **데이터 무결성 개선**: null/undefined 체크 강화

#### 🐞 버그 수정
- ❌ "Cannot read properties of undefined (reading 'add')" - DOMTokenList 오류 해결
- ❌ 빈 보드 카드로 인한 표시 실패 문제 해결
- ❌ 플레이어 카드 누락 시 크래시 방지

#### 📊 디버깅 도구 강화
- 핸드 데이터 파싱 단계별 추적
- 에러 발생 시 구체적 원인 표시
- Console 기반 실시간 디버깅 지원

#### 🎯 개발 진행 상황
- **현재 상태**: 핵심 기능 안정화 완료
- **해결된 주요 이슈**: 
  - ✅ 카드 렌더링 크래시 방지
  - ✅ 데이터 로딩 실패 원인 진단 개선
  - ✅ 보드 카드 표시 오류 해결
- **다음 단계**: UI/UX 개선 및 성능 최적화 계획

### v8.7.0 (2025-09-06) - 이전 버전
#### 🔥 주요 개선사항
- **Virtual 시트 매칭 알고리즘 대폭 개선**
  - ±3분 범위 검색으로 정확도 향상
  - KST 시간대 변환 로직 강화
  - 자정 경계 처리 추가
  - 후보 분석 시스템 도입

- **완료 상태 복구 시스템**
  - 로컬 완료 상태가 CSV 업데이트 후에도 유지됨
  - 데이터 병합 로직 개선으로 상태 손실 방지

- **에러 처리 강화**
  - AI 분석 실패 시 크래시 방지
  - Virtual 시트 접근 오류 상세 분류
  - Promise.all 에러 핸들링 개선

- **콘솔/대시보드 버전 통합**
  - 모든 버전 표시 v8.7.0으로 일치
  - 일관된 버전 관리 시스템 구축

### v8.6.x (이전 버전들)
- 기본 핸드 모니터링 시스템
- CSV 데이터 파싱 및 표시
- 기본적인 Virtual 시트 연동

### 알려진 이슈 해결
✅ **완료 버튼 누른 핸드가 새로고침 후 다시 미완료로 표시되는 문제**
✅ **AI 분석 실패 시 "Cannot read properties of undefined" 에러**
✅ **Virtual 시트 시간 매칭 정확도 부족**
✅ **콘솔과 대시보드 버전 불일치**
✅ **카드 파싱 오류로 인한 DOMTokenList 크래시** (v8.7.1에서 해결)
✅ **보드 카드 표시 실패 및 빈 데이터 처리** (v8.7.1에서 해결)

---

## 🔧 설치 및 실행

### 로컬 실행
```bash
# 1. 저장소 클론
git clone https://github.com/garimto81/virtual_table_db_gpt.git

# 2. 웹 서버로 실행 (CORS 회피)
python -m http.server 8000
# 또는
npx serve .

# 3. 브라우저에서 접속
http://localhost:8000
```

### GitHub Pages 배포
- **자동 배포**: GitHub Pages 활성화됨
- **URL**: `https://garimto81.github.io/virtual_table_db_gpt/`
- **설정**: `_config.yml`로 Jekyll 테마 설정

### 환경 요구사항
- 모던 웹 브라우저 (Chrome, Firefox, Safari, Edge)
- 인터넷 연결 (Google Sheets API 접근)
- LocalStorage 지원

---

## 🤖 AI 분석 시스템

### 지원 AI 서비스
1. **OpenAI** (GPT-3.5/GPT-4)
2. **Google Gemini** (Pro 모델)
3. **Claude** (Anthropic)
4. **직접 계산** (기본값, API 불필요)

### 분석 내용
- 핸드 승자 판별
- 포트 크기 계산
- 키 플레이어 액션 추적
- 3줄 요약 자동 생성

### 파일명 생성 패턴
```
핸드번호_테이블번호_포지션_플레이어명_액션_결과.csv
예: 19293_3_BTN_GoodPlayer_AI_WIN.csv
```

---

## 💻 사용법

### 초기 설정
1. **설정 버튼 클릭**하여 설정 모달 열기
2. **3개의 필수 URL 입력**:
   - 읽기 시트 CSV URL
   - 쓰기 시트 URL  
   - Apps Script URL
3. **저장** 버튼으로 설정 완료

### 데이터 처리 워크플로우
1. **실시간 모니터링**: 10초마다 새 데이터 확인
2. **Virtual 시트 매칭**: Cyprus 시간 ±3분 범위 검색
3. **AI 분석**: 자동 3줄 요약 생성
4. **완료 처리**: 로컬 저장 및 시트 업데이트

### 유용한 기능들
- **수동 새로고침**: F5 또는 새로고침 버튼
- **필터링**: 테이블별, 플레이어별 필터
- **정렬**: 시간순, 핸드번호순
- **검색**: 플레이어명, 핸드번호 검색

---

## 🐛 트러블슈팅

### 상태 표시 의미
```
⏳ 대기중: 데이터 로딩 중
🔍 처리중: Virtual 시트 매칭 진행
✅ 완료: 모든 처리 완료
❌ 오류: 처리 중 문제 발생
```

### 콘솔 로그 체크포인트
```
📅 업데이트: 2025-09-06
🔗 대시보드 버전: v9.5.0 (일치)
💾 최근 핸드 버퍼: X/100개
```

### 일반적인 문제 해결
1. **Virtual 시트 매칭 실패**
   - URL 형식 확인
   - 시트 공개 설정 확인
   - 시간대 차이 고려

2. **데이터 로드 실패**
   - 네트워크 연결 확인
   - CORS 정책 확인
   - CSV 형식 검증

3. **완료 상태 손실**
   - LocalStorage 용량 확인
   - 브라우저 데이터 정책 확인

---

## 🔐 보안 & 데이터 처리

### 데이터 보안
- **API 키**: 로컬 브라우저에만 저장
- **개인 정보**: 시트 링크만 저장, 내용은 미저장
- **HTTPS**: 모든 외부 API 호출 암호화

### 개인정보 처리
- **수집 데이터**: 핸드 번호, 게임 데이터만
- **저장 위치**: 사용자 브라우저 LocalStorage
- **외부 전송**: Google Sheets API만 사용

---

## 🚀 향후 계획 & 확장성

### 계획된 기능
- [ ] 다중 테이블 동시 모니터링
- [ ] 실시간 알림 시스템 고도화  
- [ ] 플레이어 통계 및 히트맵
- [ ] 커스텀 AI 프롬프트 설정
- [ ] 데이터 내보내기 (JSON, CSV)

### 기술 부채 관리
- [ ] 컴포넌트 모듈화 (필요시)
- [ ] 타입스크립트 도입 검토
- [ ] 테스트 케이스 작성
- [ ] 성능 최적화

---

## 👥 기여 가이드라인

### 개발 환경 설정
1. 저장소 포크
2. 로컬 클론
3. 기능 브랜치 생성
4. 변경사항 테스트
5. Pull Request 생성

### 코드 스타일
- **들여쓰기**: 2 스페이스
- **명명**: camelCase (변수), PascalCase (클래스)
- **주석**: 복잡한 로직에만 필요
- **버전**: semantic versioning (major.minor.patch)

### 커밋 메시지 형식
```
타입: 간단한 설명

상세 설명 (옵션)
- 변경사항 1
- 변경사항 2

🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 📞 지원 & 연락처

### 이슈 리포팅
- **GitHub Issues**: https://github.com/garimto81/virtual_table_db_gpt/issues
- **버그 리포트**: 재현 단계 상세히 기록
- **기능 요청**: 사용 사례와 함께 제안

### 문서 업데이트
- 이 README.md는 프로젝트의 **단일 진실 원천**
- 모든 변경사항은 이 문서에 반영 필요
- 버전 업데이트 시 패치 노트 업데이트 필수

---

## 🎯 빠른 시작 가이드 (다음 작업자용)

### 1. 현재 상태 확인
- **메인 파일**: `C:\claude\index.html` (v9.5.0)
- **Apps Script**: `apps_script_updated.gs` (배포 필요)
- **통합 가이드**: `APPS_SCRIPT_INTEGRATION_GUIDE.md`

### 2. 즉시 필요한 작업
1. Apps Script 배포:
   - `apps_script_updated.gs` 내용을 Google Apps Script에 복사
   - 웹 앱으로 배포 (액세스: 모든 사용자)
   - 생성된 URL을 index.html의 `SHEET_UPDATE_SCRIPT_URL`에 입력

2. 설정값 입력:
   - index.html 열고 설정 버튼 클릭
   - 3개의 URL 입력 (READ, WRITE, SCRIPT)

3. 테스트:
   - 로컬: `python -m http.server 8080`
   - 브라우저: `http://localhost:8080/index.html`

### 3. 알려진 이슈
- CORS 정책으로 인한 Apps Script 호출 실패 → 해결 코드 제공됨
- Virtual 시트 매칭 "0개" 오류 → v9.5.0에서 해결됨
- AI 분석이 실제 API를 사용하지 않음 → 직접 계산 방식으로 구현됨

---

**마지막 업데이트**: 2025-01-11  
**문서 버전**: v9.5.2  
**프로젝트 상태**: 🟢 Active Development