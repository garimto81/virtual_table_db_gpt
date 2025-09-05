# 포커 핸드 편집 시스템

온라인 포커 게임의 핸드 히스토리를 편집하고 관리하는 통합 시스템입니다.

## 🎯 주요 기능

### **통합 편집 시스템** (`poker-editor.html`)
하나의 앱에서 모든 작업을 처리할 수 있는 올인원 솔루션:

#### 📊 핸드 편집 기능
- PC 환경에 최적화된 3단 레이아웃
- 핸드 편집 완료 체크박스 (handEdit)
- 편집 시간 자동 기록 (handEditTime)
- 작업 상태 관리 (대기중/진행중/완료/검토필요)
- 테이블별, 상태별 필터링

#### 🔔 실시간 모니터링
- 새로운 핸드 자동 감지
- 데스크톱 알림 & 사운드 알림
- 실시간 로그 표시
- 조절 가능한 확인 간격 (5초/10초/30초)

#### 💾 데이터 관리
- Google Sheets와 실시간 동기화
- 핸드 데이터 상세 보기
- 편집 노트 작성
- 자동 새로고침 기능

## 📁 파일 구조

```
virtual_table_db_gpt/
├── index.html              # 메인 랜딩 페이지
├── poker-editor.html       # 통합 편집 시스템
├── apps-script/
│   └── Code.gs            # Google Apps Script 백엔드
└── README.md              # 프로젝트 문서
```

## 🚀 시작하기

### 1. Google Sheets 설정
1. Google Sheets에서 다음 시트 생성:
   - `Hand`: 핸드 로우 데이터
   - `Index`: 핸드 인덱스 (17개 열)
   - `Type`: 플레이어 정보

### 2. Apps Script 배포
1. `apps-script/Code.gs` 코드를 Google Apps Script에 복사
2. SHEET_ID를 자신의 스프레드시트 ID로 변경
3. 웹 앱으로 배포 (누구나 액세스 가능)

### 3. 프론트엔드 설정
1. 각 HTML 파일의 URL 설정 업데이트:
   - `CSV_HAND_URL`: Hand 시트 CSV 게시 URL
   - `CSV_INDEX_URL`: Index 시트 CSV 게시 URL
   - `APPS_SCRIPT_URL`: 배포된 Apps Script URL

## 💻 사용 방법

### 핸드 입력 (모바일/태블릿)
1. `index.html` 열기
2. 테이블 선택 → 플레이어 선택
3. 블라인드 설정 → 카드 입력
4. 액션 기록 → 승자 선택
5. "시트 전송" 클릭

### 후반 편집 (PC)
1. `editor.html` 열기
2. 왼쪽 리스트에서 핸드 선택
3. 상세 정보 확인 및 편집
4. "편집 완료 체크" 클릭
5. 자동으로 handEditTime 기록

### 실시간 모니터링
1. `notification-worker.html` 열기
2. "모니터링 시작" 클릭
3. 새 핸드 추가시 자동 알림
4. 설정에서 알림 방식 선택

## 📊 데이터 구조

### Index 시트 (17개 열)
| 열 | 필드명 | 설명 |
|---|--------|------|
| A | handNumber | 핸드 번호 |
| B | startRow | 시작 행 |
| C | endRow | 종료 행 |
| D | handUpdatedAt | 업데이트 날짜 |
| E | **handEdit** | 편집 완료 체크박스 |
| F | **handEditTime** | 편집 완료 시간 |
| G | label | 레이블 |
| H | table | 테이블명 |
| I | tableUpdatedAt | 테이블 업데이트 시간 |
| J | Cam | 캠 정보 |
| K-N | CamFile | 캠 파일 정보 |
| O | lastStreet | 마지막 스트리트 |
| P | lastAction | 마지막 액션 |
| Q | workStatus | 작업 상태 |

## 🔔 알림 기능

### 지원 알림 방식
- **사운드 알림**: 기본 비프음
- **데스크톱 알림**: 브라우저 알림 (권한 필요)
- **자동 편집기 열기**: 새 핸드시 editor.html 자동 열기

### 폴링 간격 설정
- 5초, 10초(기본), 30초, 1분 선택 가능

## 🛠 기술 스택

- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **통신**: REST API (CORS 우회를 위한 form-urlencoded)

## 📝 라이선스

이 프로젝트는 개인 사용 목적으로 제작되었습니다.

## 👤 작성자

garimto81

---

최종 업데이트: 2025-09-02