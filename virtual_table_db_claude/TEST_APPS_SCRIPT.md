# 🧪 Apps Script URL 테스트 가이드

## 📍 현재 URL
```
https://script.google.com/macros/s/AKfycbwrBlDp1XX8Iq-nKNk_kib5Evss9QQSWh4MRwf_QB5h5nxWUtnrvoHUbFN0MtvdgR2XCA/exec
```

## 🔍 테스트 방법

### 1. 브라우저 직접 접속 테스트

1. 위 URL을 브라우저 주소창에 복사/붙여넣기
2. 엔터 키 누르기
3. 결과 확인:

#### ✅ 정상인 경우
```json
{
  "status": "ok",
  "method": "GET",
  "version": "v3.0",
  "service": "Virtual Table Sheet Updater",
  "message": "서비스가 정상 작동 중입니다"
}
```

#### ❌ 오류 케이스별 해결 방법

##### 1. "승인 필요" 또는 "권한 없음" 오류
```
Google hasn't verified this app
또는
Authorization Required
```
**해결:**
- Apps Script 배포 설정에서 "액세스: 모든 사용자" 재설정
- 배포 관리 > 편집 > 액세스: "모든 사용자" > 배포

##### 2. "스크립트 함수를 찾을 수 없습니다" 오류
```
Script function not found: doGet
```
**해결:**
- Apps Script 코드가 제대로 저장되지 않음
- 코드 다시 복사/붙여넣기 후 저장 (Ctrl+S)

##### 3. 404 또는 "페이지를 찾을 수 없음"
**해결:**
- URL이 잘못됨
- 배포 관리에서 정확한 URL 다시 복사

##### 4. CORS 오류 (콘솔에서만 표시)
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
**해결:**
- "액세스: 모든 사용자" 설정 확인
- 배포 재생성 필요

---

## 🛠️ 브라우저 콘솔 테스트

### F12 개발자 도구 콘솔에서:

```javascript
// 1. 기본 테스트
fetch('https://script.google.com/macros/s/AKfycbwrBlDp1XX8Iq-nKNk_kib5Evss9QQSWh4MRwf_QB5h5nxWUtnrvoHUbFN0MtvdgR2XCA/exec')
  .then(response => {
    console.log('상태 코드:', response.status);
    console.log('상태 텍스트:', response.statusText);
    return response.text();
  })
  .then(data => {
    try {
      const json = JSON.parse(data);
      console.log('✅ JSON 응답:', json);
    } catch {
      console.log('❌ HTML 응답 (오류):', data.substring(0, 200));
    }
  })
  .catch(error => {
    console.error('❌ 네트워크 오류:', error);
  });

// 2. CORS 테스트
fetch('https://script.google.com/macros/s/AKfycbwrBlDp1XX8Iq-nKNk_kib5Evss9QQSWh4MRwf_QB5h5nxWUtnrvoHUbFN0MtvdgR2XCA/exec', {
  mode: 'cors',
  method: 'GET'
})
  .then(r => r.json())
  .then(data => console.log('CORS 테스트 성공:', data))
  .catch(err => console.error('CORS 오류:', err));
```

---

## 🔧 Apps Script 재배포 단계

### 완전 새 배포 (권장)

1. **https://script.google.com** 접속
2. 프로젝트 열기
3. **배포** > **배포 관리**
4. 현재 배포 **삭제** (휴지통 아이콘)
5. **배포** > **새 배포**
6. 설정:
   - 유형: **웹 앱**
   - 설명: "Virtual Table DB v3.1"
   - 실행: **"나"**
   - 액세스: **"모든 사용자"**
7. **배포** 클릭
8. 새 URL 복사

---

## 📝 웹 앱에서 설정

### LocalStorage 완전 초기화 후 재설정

```javascript
// F12 콘솔에서 실행
// 1. 모든 설정 초기화
localStorage.clear();
sessionStorage.clear();

// 2. 새 URL 직접 설정
localStorage.setItem('apps_script_url', 'https://script.google.com/macros/s/AKfycbwrBlDp1XX8Iq-nKNk_kib5Evss9QQSWh4MRwf_QB5h5nxWUtnrvoHUbFN0MtvdgR2XCA/exec');
localStorage.setItem('sheet_update_script_url', 'https://script.google.com/macros/s/AKfycbwrBlDp1XX8Iq-nKNk_kib5Evss9QQSWh4MRwf_QB5h5nxWUtnrvoHUbFN0MtvdgR2XCA/exec');

// 3. 페이지 새로고침
location.reload();
```

---

## ⚠️ 일반적인 문제와 해결

### 1. 이전 URL 캐시
- 브라우저가 이전 URL을 기억하고 있을 수 있음
- 해결: 위의 LocalStorage 초기화 실행

### 2. 배포 설정 오류
- "액세스: 나만"으로 설정된 경우
- 해결: "모든 사용자"로 변경 후 재배포

### 3. 코드 저장 안 됨
- Ctrl+S를 누르지 않고 배포한 경우
- 해결: 코드 저장 후 재배포

### 4. 프로젝트 권한 문제
- Google 계정 권한 문제
- 해결: 다른 브라우저나 시크릿 모드에서 테스트

---

## 🎯 디버깅 체크리스트

- [ ] 브라우저에서 URL 직접 접속 시 JSON 응답 확인
- [ ] Apps Script 배포 설정에서 "액세스: 모든 사용자" 확인
- [ ] 코드가 저장되었는지 확인 (Ctrl+S)
- [ ] URL이 정확히 `/exec`로 끝나는지 확인
- [ ] 브라우저 캐시 삭제 (Ctrl+Shift+Delete)
- [ ] LocalStorage 초기화
- [ ] 다른 브라우저에서 테스트

---

## 📞 오류 보고 시 필요 정보

1. 브라우저 직접 접속 시 표시되는 내용
2. F12 콘솔의 오류 메시지
3. Apps Script 배포 설정 스크린샷
4. 네트워크 탭의 응답 내용

---

최종 업데이트: 2025-01-11