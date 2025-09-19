# Apps Script 배포 가이드

## 🚨 현재 문제점

API 호출 시 다음 오류 발생:
```
❌ Apps Script 오류: 알 수 없는 액션: getHandStatus
❌ Apps Script 오류: 알 수 없는 액션: batchVerify
```

## 🔍 원인 분석

1. **Apps Script가 최신 버전으로 배포되지 않음**
2. **배포된 버전이 v3.4.4 미만**
3. **URL이 잘못되었거나 권한 문제**

## 🛠️ 해결 방법

### 1단계: Apps Script 코드 확인

현재 `/src/scripts/apps_script.gs` 파일에 다음 액션들이 구현되어 있는지 확인:

```javascript
case 'batchVerify':
  result = handleBatchVerify(requestData);
  break;

case 'getHandStatus':
  result = handleGetHandStatus(requestData);
  break;
```

### 2단계: Apps Script 재배포

1. Google Apps Script 콘솔 접속
2. **배포 > 새 배포** 클릭
3. **유형 선택: 웹 앱**
4. **버전: 새 버전** 선택 (중요!)
5. **실행 권한: 나** 선택
6. **액세스 권한: 모든 사용자** 선택
7. **배포** 클릭
8. **새 URL 복사**

### 3단계: 새 URL 적용

프론트엔드에서 Apps Script URL을 새로 복사한 URL로 교체

### 4단계: 연결 테스트

브라우저 콘솔에서 다음 로그 확인:
```
🔗 Apps Script 연결 테스트 중...
✅ 응답 성공: {status: 'success', version: 'v3.4.4+'}
```

## 🔧 트러블슈팅

### 문제 1: "알 수 없는 액션" 오류
**해결**: Apps Script를 새 버전으로 재배포

### 문제 2: CORS 오류
**해결**: Apps Script에서 CORS 헤더 확인

### 문제 3: 권한 오류
**해결**: Apps Script 실행 권한을 "나"로 설정

## 📋 현재 지원 액션 목록

| 액션명 | 용도 | 버전 |
|--------|------|------|
| `test` | 연결 테스트 | v3.0+ |
| `updateSheet` | 시트 업데이트 | v3.0+ |
| `batchVerify` | 일괄 상태 확인 | v3.4+ |
| `getHandStatus` | 개별 상태 확인 | v3.4+ |
| `verifyUpdate` | 업데이트 검증 | v3.0+ |

## ⚡ 임시 해결책

Apps Script 연결이 안 될 경우, 시스템이 자동으로 **캐시 전용 모드**로 전환됩니다:

```
📊 캐시 전용 모드로 전환
🚀 CSV 파싱 캐시 히트: 1888개 행
```

이 모드에서도 기본적인 기능은 정상 작동합니다.