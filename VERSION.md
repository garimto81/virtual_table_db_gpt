# 📋 버전 관리 가이드

## 현재 버전
**v8.6.0** (2025-09-05)

## 버전 체계 (Semantic Versioning)

### 형식: `vX.Y.Z`

- **X (Major)**: 주요 변경사항, 호환성이 깨지는 변경
- **Y (Minor)**: 새로운 기능 추가, 기존 기능 개선
- **Z (Patch)**: 버그 수정, 작은 개선사항

### 업데이트 규칙

#### Major 버전 업데이트 (X.0.0)
- [ ] 전체 구조 변경
- [ ] API 호환성 깨짐
- [ ] 데이터베이스 스키마 주요 변경
- [ ] UI/UX 전면 개편

#### Minor 버전 업데이트 (0.Y.0)
- [ ] 새로운 기능 추가
- [ ] 기존 기능 개선
- [ ] 새로운 매칭 알고리즘
- [ ] AI 통합 기능
- [ ] 성능 최적화

#### Patch 버전 업데이트 (0.0.Z)
- [ ] 버그 수정
- [ ] 오타 수정
- [ ] 작은 UI 개선
- [ ] 로그 메시지 수정
- [ ] 주석 업데이트

## 버전 히스토리

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

### v8.5.0
- 🔄 RecentHandsBuffer 추가
- 💾 MasterHandList 구현

### v8.4.0
- 🚀 초기 릴리즈
- 📊 기본 모니터링 기능
- 🔗 Google Sheets 연동

## 업데이트 체크리스트

수정 시 다음 위치의 버전을 모두 업데이트:

1. **HTML 파일 상단 주석**
   ```html
   <!--
     Version: X.Y.Z
     Last Updated: YYYY-MM-DD
   -->
   ```

2. **<title> 태그**
   ```html
   <title>포커 핸드 모니터링 vX.Y.Z - 설명</title>
   ```

3. **JavaScript 상수**
   ```javascript
   const VERSION = 'X.Y.Z';
   ```

4. **콘솔 로그**
   ```javascript
   console.log('🚀 포커 핸드 모니터링 시스템 vX.Y.Z');
   ```

5. **README.md**
   - 버전 배지 업데이트
   - 버전 히스토리 추가

## 자동화 스크립트

```javascript
// 버전 업데이트 헬퍼 함수
function updateVersion(type = 'patch') {
  const current = 'X.Y.Z'.split('.');
  
  switch(type) {
    case 'major':
      current[0]++;
      current[1] = 0;
      current[2] = 0;
      break;
    case 'minor':
      current[1]++;
      current[2] = 0;
      break;
    case 'patch':
      current[2]++;
      break;
  }
  
  return current.join('.');
}
```

## 커밋 메시지 규칙

```
<type>: <description> (vX.Y.Z)

- feat: 새로운 기능 (minor)
- fix: 버그 수정 (patch)
- docs: 문서 수정 (patch)
- style: 코드 스타일 (patch)
- refactor: 코드 리팩토링 (minor)
- perf: 성능 개선 (minor)
- test: 테스트 추가 (patch)
- chore: 기타 변경 (patch)
```

## 예시

```bash
# Minor 업데이트 (새 기능)
feat: Virtual 시트 자동 업데이트 기능 추가 (v8.8.0)

# Patch 업데이트 (버그 수정)
fix: CSV 파싱 오류 수정 (v8.7.1)

# Major 업데이트 (구조 변경)
refactor: 전체 아키텍처 React 기반으로 변경 (v9.0.0)
```