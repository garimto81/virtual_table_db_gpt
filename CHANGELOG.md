# Changelog

All notable changes to this project will be documented in this file.

## [8.7.0] - 2025-09-06

### Added
- 개선된 Virtual 시트 매칭 알고리즘
- ±3분 범위 검색 시스템
- 후보 분석 및 대안 매칭 정보 제공
- 자정 넘나드는 시간 처리 로직
- 종합적인 에러 처리 및 복구 메커니즘

### Changed
- UTC → KST 시간대 변환 로직 개선
- Virtual 시트 매칭 정확도 대폭 향상 (테스트에서 100% 성공률 달성)
- 매칭 실패 시 상세한 오류 메시지 제공
- 로그 시스템에 후보 정보 및 시간 차이 상세 표시

### Fixed
- "Cannot read properties of undefined (reading 'join')" 에러 해결
- Virtual 시트 매칭 실패 시 애플리케이션 크래시 방지
- 완료된 핸드가 자동 새로고침 후 사라지는 문제 해결

### Technical Details
- 테스트 스크립트로 5개 시간대에서 완벽한 매칭 검증
- Promise.all과 개별 catch로 안정성 보장
- 캐시 무력화를 위한 타임스탬프 추가
- CSV 파싱 및 데이터 검증 로직 강화

## [8.6.0] - 2025-09-05

### Added
- 키 플레이어 식별 시스템
- 자동 파일명 생성 기능
- 로그 시스템 추가

### Changed
- 사용자 인터페이스 개선
- 핸드 분석 정확도 향상

## Previous Versions
- 8.5.x: 기본 포커 핸드 모니터링 기능
- 8.4.x: AI 분석 시스템 통합
- 8.3.x: Google Sheets 연동
- 8.2.x: 실시간 모니터링 구현
- 8.1.x: 초기 웹 인터페이스
- 8.0.x: 프로젝트 시작