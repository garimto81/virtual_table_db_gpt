# 🔧 시트 업데이트 문제 해결 가이드

## 🚨 문제: 시트 업데이트가 안 되는 경우

### 1. **Apps Script 권한 확인**

#### Google Sheets 권한
1. Google Sheets 열기
2. 공유 버튼 클릭
3. Apps Script 서비스 계정에 **편집자** 권한 부여
   - 또는 "링크가 있는 모든 사용자" → "편집자"

#### Apps Script 배포 설정
1. Apps Script 프로젝트 열기
2. 배포 > 배포 관리
3. 설정 확인:
   - 실행: "나"
   - 액세스: "모든 사용자"

### 2. **Apps Script 코드 업데이트**

최신 `apps_script_simple.gs` 사용:
- **v3.3-enhanced 특징**: F열과 H열만 업데이트
- 🔐 권한 자동 진단 기능
- ✅ 실시간 업데이트 검증
- 강화된 오류 처리 및 디버그 로그
- 4가지 액션 지원: updateSheet, test, testPermissions, verifyUpdate

```javascript
// 배포 전 테스트
function testDirectUpdate() {
  const TEST_SHEET_URL = 'YOUR_SHEET_URL_HERE';
  // 실제 URL 입력 후 실행
}
```

### 3. **브라우저에서 디버그**

#### 🔍 디버그 버튼 사용 (v9.8.0 강화 버전)
1. 헤더의 보라색 "🔍 디버그" 버튼 클릭
2. 6단계 자동 진단:
   1️⃣ Google Sheets URL 검증
   2️⃣ Apps Script URL 검증  
   3️⃣ Apps Script 연결 테스트
   4️⃣ 시트 권한 진단 (읽기/쓰기)
   5️⃣ 테스트 데이터 업데이트
   6️⃣ 실제 업데이트 검증 (F열, H열 확인)
3. 각 단계별 성공/실패 즉시 표시
4. 실패 시 구체적인 해결책 제시

#### 콘솔 로그 확인
```javascript
// F12 > Console
// 다음 로그 확인:
📤 전송 데이터: {...}
📊 응답 상태: 200
✅ Apps Script 응답: {...}
```

### 4. **Apps Script 실행 로그 확인**

1. [Google Apps Script](https://script.google.com) 접속
2. 프로젝트 열기
3. 실행 > 실행 로그
4. 오류 메시지 확인

### 5. **일반적인 오류와 해결책**

| 오류 | 원인 | 해결 방법 |
|------|------|----------|
| "시트를 열 수 없습니다" | 잘못된 URL 또는 권한 없음 | URL 확인, 권한 부여 |
| "알 수 없는 액션: unknown" | Apps Script 파싱 실패 | v3.2로 업데이트 |
| "셀 업데이트 실패" | 쓰기 권한 없음 | 편집자 권한 확인 |
| "CORS 오류" | 배포 설정 문제 | "모든 사용자" 액세스 설정 |

### 6. **체크리스트**

#### ✅ 배포 전
- [ ] Google Sheets URL이 올바른가?
- [ ] 시트에 편집 권한이 있는가?
- [ ] Apps Script가 최신 버전(v3.2)인가?

#### ✅ 배포 시
- [ ] 웹 앱으로 배포했는가?
- [ ] "모든 사용자" 액세스 설정했는가?
- [ ] 새 버전으로 배포했는가?

#### ✅ 테스트
- [ ] testDirectUpdate() 함수 실행 성공?
- [ ] 브라우저 디버그 버튼 테스트 성공?
- [ ] F열과 H열에 데이터 입력됨?

### 7. **업데이트되는 열**

| 열 | 설명 | 예시 |
|----|------|------|
| **F열** (6) | 파일명 | `hand_123.mp4` |
| **H열** (8) | AI 분석 | `핸드 #123 분석 결과` |

### 8. **테스트 순서**

1. **Apps Script에서 직접 테스트**
   ```javascript
   function testDirectUpdate() {
     // YOUR_SHEET_URL_HERE를 실제 URL로 변경
     // 실행 > testDirectUpdate
   }
   ```

2. **권한 테스트**
   ```javascript
   function testPermissions() {
     // YOUR_SHEET_URL_HERE를 실제 URL로 변경
     // 실행 > testPermissions
   }
   ```

3. **브라우저에서 테스트**
   - 🔍 디버그 버튼 클릭
   - 테스트할 행 번호 입력 (예: 2)
   - 결과 확인

### 9. **로그 분석**

#### Apps Script 로그 예시 (성공)
```
📥 POST 요청 수신
✅ JSON 파싱 성공
📋 액션: updateSheet
✅ 시트 열기 성공
✅ F열 업데이트 성공
✅ H열 업데이트 성공
✅ 변경사항 저장 완료
```

#### Apps Script 로그 예시 (실패)
```
❌ 시트를 열 수 없음
❌ 권한이 없거나 ID가 잘못되었습니다
```

### 10. **긴급 해결책**

문제가 계속되면:

1. **새 Apps Script 프로젝트 생성**
   - `apps_script_simple.gs` 복사
   - 새로 배포
   - 새 URL로 설정

2. **시트 권한 초기화**
   - 공유 설정 제거
   - 다시 "편집자" 권한 부여

3. **브라우저 캐시 삭제**
   - Ctrl + Shift + Delete
   - 캐시된 이미지 및 파일 삭제
   - 페이지 새로고침

---

## 📞 추가 지원

- GitHub Issues: [Report Issue](https://github.com/garimto81/virtual_table_db_claude/issues)
- 최신 버전 확인: v9.8.0 / Apps Script v3.3-enhanced

## 🆕 v9.8.0 새 기능 활용법

### 강화된 디버깅 시스템
1. **권한 진단**: 시트 읽기/쓰기 권한 자동 확인
2. **실시간 검증**: 업데이트 후 즉시 실제 데이터 확인  
3. **스마트 오류 분석**: 오류 유형별 맞춤 해결책 제시
4. **6단계 완전 진단**: URL → 연결 → 권한 → 업데이트 → 검증 → 완료

### 문제 해결이 더 쉬워진 이유
- ✅ 어느 단계에서 문제가 발생했는지 즉시 확인
- ✅ 실제 시트에 데이터가 들어갔는지 자동 검증
- ✅ 오류별 구체적인 해결책 자동 제시
- ✅ 브라우저 하나에서 모든 진단 완료

최종 업데이트: 2025-09-15