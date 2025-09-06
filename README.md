# 🎲 Virtual Table DB GPT - 포커 핸드 분석 시스템

온라인 포커 게임의 핸드 히스토리를 체계적으로 관리하고 분석하는 통합 웹 애플리케이션

[![Version](https://img.shields.io/badge/Version-8.6.0-blue)](https://garimto81.github.io/virtual_table_db_gpt/)
[![License](https://img.shields.io/badge/License-Private-red)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Active-green)](https://garimto81.github.io/virtual_table_db_gpt/)
[![Last Updated](https://img.shields.io/badge/Updated-2025--09--05-yellow)]()

## 🌐 Live Demo
**[https://garimto81.github.io/virtual_table_db_gpt/](https://garimto81.github.io/virtual_table_db_gpt/)**

## 🎯 프로젝트 개요

Virtual Table DB GPT는 포커 핸드 데이터를 실시간으로 모니터링하고 분석하는 웹 기반 시스템입니다. Google Sheets를 데이터베이스로 활용하여 핸드 히스토리를 체계적으로 관리하고, AI를 통해 게임 분석을 제공합니다.

### 핵심 가치
- **실시간 모니터링**: 포커 핸드를 실시간으로 추적하고 관리
- **자동화된 분석**: AI 기반 핸드 분석 및 인사이트 제공
- **데이터 통합**: Google Sheets와 완벽한 연동
- **편집 워크플로우**: 체계적인 핸드 편집 완료 프로세스

## 📊 주요 기능

### 1. 포커 핸드 모니터링 시스템 (`poker-monitor.html`)
- **실시간 핸드 추적**: 새로운 핸드 자동 감지 및 알림
- **Virtual 시트 매칭**: 시간 기반 자동 매칭 알고리즘
- **AI 분석 통합**: Gemini/OpenAI/Claude API 지원
- **키 플레이어 식별**: 중요 플레이어 자동 판별
- **로그 시스템**: 모든 처리 과정 실시간 시각화

### 2. 핸드 편집 완료 프로세스
- **자동 파일명 생성**: 핸드번호_플레이어_카드 형식
- **Virtual 시트 업데이트**: 편집 완료 상태 자동 기록
- **시간 매칭**: ±3초 오차 범위 내 정확한 매칭
- **AI 요약**: 3줄 자동 요약 생성

### 3. 데이터 분석 도구
- **시간 분석** (`tools/analyze-hand-times.html`)
- **CSV 분석** (`tools/analyze-csv-file.html`)
- **Virtual 시트 연동** (`tools/fetch-virtual-sheet.html`)
- **행 검색** (`tools/find-exact-row.html`)

## 🛠 기술 스택

### Frontend
- **HTML5 & Vanilla JavaScript**: 순수 웹 기술 사용
- **Tailwind CSS**: 모던한 UI 스타일링
- **Chart.js**: 데이터 시각화

### Backend
- **Google Apps Script**: 서버리스 백엔드
- **Google Sheets API**: 데이터 저장 및 관리

### AI Integration
- **Gemini API**: Google AI 분석
- **OpenAI API**: GPT 기반 분석
- **Claude API**: Anthropic AI 분석

## 📁 프로젝트 구조

```
virtual_table_db_gpt/
├── index.html                  # GitHub Pages 메인 페이지
├── README.md                   # 프로젝트 문서
├── _config.yml                # Jekyll 설정
├── .nojekyll                  # GitHub Pages 설정
├── package.json               # 프로젝트 의존성
├── VERSION.md                 # 버전 관리 문서
├── src/                       # 애플리케이션 소스
│   ├── poker-monitor.html     # 메인 모니터링 시스템
│   ├── index-compact.html     # 모바일 최적화 버전
│   └── setup-gemini.html      # AI 설정 도구
├── tools/                     # 분석 도구들
│   ├── analyze-hand-times.html  # 시간 분석
│   ├── analyze-csv-file.html    # CSV 분석
│   ├── fetch-virtual-sheet.html # Virtual 시트 연동
│   └── find-exact-row.html      # 행 검색 도구
├── backend/                   # 백엔드 코드
│   ├── Code_v56.gs           # 최신 백엔드 (v56)
│   ├── Code.gs               # 메인 백엔드
│   └── test-parse.gs         # 파싱 테스트
└── scripts/                   # 유틸리티 스크립트
    └── version-update.bat    # 버전 업데이트
```

## 🚀 시작하기

### 1. GitHub Pages 접속
```
https://garimto81.github.io/virtual_table_db_gpt/
```

### 2. Google Sheets 설정
1. 새 Google Sheets 생성
2. 필요한 시트 추가:
   - `Hand`: 핸드 로우 데이터
   - `Index`: 핸드 인덱스 (17개 열)
   - `Virtual`: Virtual 테이블 데이터

### 3. Apps Script 배포
1. Google Apps Script 프로젝트 생성
2. `backend/Code_v56.gs` 코드 복사
3. 스프레드시트 ID 설정
4. 웹 앱으로 배포

## 💡 핵심 프로세스

### Virtual 시트 매칭 로직
```javascript
1. CSV 데이터 로드
2. C열(Seoul 시간) 검색
3. HH:MM 형식으로 비교 (초 무시)
4. 가장 가까운 시간 찾기
5. 차이가 3초 이내면 매칭 성공
```

### 데이터 구조 (Index 시트)
| 열 | 필드명 | 설명 |
|---|--------|------|
| A | handNumber | 핸드 번호 |
| B | startRow | 시작 행 |
| C | endRow | 종료 행 |
| D | handUpdatedAt | 업데이트 시간 |
| **E** | **handEdit** | 편집 완료 체크박스 |
| **F** | **handEditTime** | 편집 완료 시간 |
| G-Q | 기타 정보 | 레이블, 테이블, 카메라 등 |

## 📈 버전 히스토리

### v8.7.1 (2025-09-06)
- 📝 프로젝트 정리 및 문서화
- 🔧 불필요한 파일 제거
- 📋 README 전면 재작성

### v8.7.0 (2025-09-06)
- ✨ 로그 시스템 추가
- 🔧 Virtual 시트 매칭 개선
- 📊 처리 과정 시각화

### v8.6.0 (2025-09-05)
- 🎯 키 플레이어 분석 기능
- 📁 자동 파일명 생성
- 🔍 시간 매칭 로직 개선

[전체 버전 히스토리 보기](VERSION.md)

## 🔧 설정

### AI API 설정 (선택사항)
1. 설정 메뉴에서 AI 서비스 선택
2. API 키 입력
3. 로컬 저장소에 안전하게 저장

### 알림 설정
- **사운드 알림**: 새 핸드 감지 시 비프음
- **데스크톱 알림**: 브라우저 알림 (권한 필요)
- **새로고침 간격**: 5초/10초/30초/1분 선택 가능

## 🤝 기여

이 프로젝트는 개인 사용 목적으로 제작되었습니다.
문의사항이나 제안사항은 Issues를 통해 알려주세요.

## 📝 라이선스

Private License - 개인 사용 목적

## 👤 개발자

**garimto81**
- GitHub: [@garimto81](https://github.com/garimto81)
- Repository: [virtual_table_db_gpt](https://github.com/garimto81/virtual_table_db_gpt)

---

<div align="center">
  <sub>Built with ❤️ using Google Apps Script & JavaScript</sub>
  <br>
  <sub>Last Updated: 2025-09-05 | Version: 8.6.0</sub>
</div>