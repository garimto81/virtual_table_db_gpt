# 🔧 Apps Script 연결 테스트 오류 해결 가이드

## 🎯 문제 상황
- Apps Script 재배포 후에도 연결 테스트 실패
- 설정창에서 URL 업데이트 후 테스트 시 오류 발생

## 🔍 가능한 원인들

### 1. **배포 URL 형식 문제** (가장 흔함)
- 잘못된 URL: `https://script.google.com/macros/s/AKfyc.../edit`
- 올바른 URL: `https://script.google.com/macros/s/AKfyc.../exec`
- **끝이 `/exec`로 끝나야 함!**

### 2. **권한 설정 오류**
- "액세스: 나만" → ❌ CORS 오류 발생
- "액세스: 모든 사용자" → ✅ 정상 작동

### 3. **브라우저 캐시**
- 이전 URL이 캐시되어 있을 수 있음

### 4. **배포 활성화 대기**
- 새 배포 후 1-2분 대기 필요

---

## ✅ 즉시 해결 방법

### Step 1: 올바른 배포 URL 확인

1. **https://script.google.com** 접속
2. 프로젝트 열기
3. **배포** > **배포 관리**
4. 현재 배포의 **웹 앱 URL** 복사
   - ⚠️ 반드시 `/exec`로 끝나는 URL이어야 함
   - ❌ 편집 URL (`/edit`)이 아님!

### Step 2: 권한 재확인

배포 관리에서:
- **실행**: "나"
- **액세스**: **"모든 사용자"** (필수!)

### Step 3: 브라우저에서 직접 테스트

1. 복사한 배포 URL을 브라우저 주소창에 입력
2. 엔터 키 누르기
3. 다음과 같은 JSON이 표시되면 정상:

```json
{
  "status": "ok",
  "method": "GET",
  "version": "v3.0",
  "service": "Virtual Table Sheet Updater",
  "message": "서비스가 정상 작동 중입니다"
}
```

오류가 나타나면:
- **"승인 필요"**: 권한 설정 확인
- **"찾을 수 없음"**: URL이 잘못됨
- **HTML 페이지**: `/edit`가 아닌 `/exec` URL 사용

### Step 4: 웹 앱에서 설정

1. 설정 버튼 클릭
2. **Apps Script URL** 필드 완전히 비우기
3. 올바른 `/exec` URL 붙여넣기
4. 저장 클릭
5. **1-2분 대기** (중요!)
6. Apps Script 연결 테스트 클릭

---

## 🛠️ 고급 디버깅

### 브라우저 콘솔에서 직접 테스트

```javascript
// F12 콘솔에서 실행
const testUrl = 'YOUR_EXEC_URL_HERE';  // /exec로 끝나는 URL 입력

fetch(testUrl)
  .then(r => {
    console.log('상태:', r.status);
    return r.json();
  })
  .then(data => {
    console.log('응답:', data);
    if (data.status === 'ok') {
      console.log('✅ 연결 성공!');
    } else {
      console.log('❌ 연결 실패');
    }
  })
  .catch(err => {
    console.error('오류:', err);
    console.log('💡 CORS 오류면 "액세스: 모든 사용자" 설정 확인');
  });
```

### LocalStorage 초기화

```javascript
// 캐시된 URL 제거
localStorage.removeItem('apps_script_url');
localStorage.removeItem('sheet_update_script_url');
location.reload();
```

---

## 📋 체크리스트

### Apps Script 설정
- [ ] 코드가 저장됨 (Ctrl+S)
- [ ] 새 배포 생성됨
- [ ] **"액세스: 모든 사용자"** 설정
- [ ] URL이 `/exec`로 끝남
- [ ] 브라우저에서 직접 접속 시 JSON 응답

### 웹 앱 설정
- [ ] 올바른 `/exec` URL 입력
- [ ] 저장 버튼 클릭
- [ ] 1-2분 대기
- [ ] 캐시 삭제 (Ctrl+F5)

---

## 🚨 자주 하는 실수

### 1. 편집 URL 사용
```
❌ https://script.google.com/macros/s/AKfyc.../edit
✅ https://script.google.com/macros/s/AKfyc.../exec
```

### 2. 이전 배포 URL 사용
- 재배포해도 URL은 동일하게 유지됨
- 하지만 가끔 새 배포 시 URL이 변경될 수 있음
- 항상 최신 URL 확인

### 3. 권한 설정 실수
```
❌ 액세스: "나만" 또는 "특정 사용자"
✅ 액세스: "모든 사용자"
```

---

## 💡 최종 확인

### 성공 시나리오
1. 브라우저에서 URL 직접 접속 → JSON 응답
2. 웹 앱에서 연결 테스트 → "연결 성공!" 알림
3. 시트 업데이트 테스트 → 실제 데이터 업데이트

### 실패 시나리오
- CORS 오류 → 권한 설정 확인
- 404 오류 → URL 확인
- 승인 필요 → 권한 재설정

---

## 🔄 완전 재배포 방법 (최후의 수단)

1. Apps Script에서 현재 배포 **삭제**
2. 프로젝트 이름 변경 (예: "Virtual Table DB v3.1")
3. 코드 다시 복사/붙여넣기
4. 저장
5. **새 배포** 생성
6. 새 URL로 테스트

---

최종 업데이트: 2025-01-11