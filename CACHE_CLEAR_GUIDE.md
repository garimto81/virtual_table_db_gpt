# 🚨 CORS 오류 완전 해결 가이드

## 문제 원인
**브라우저가 이전 Apps Script URL을 캐시/LocalStorage에서 계속 사용 중**

- 이전 URL (작동 안 함): `AKfycbyiop6JQBJyRk2pNsPvrCo8Q2HJ2CB-tqwBeb17SYqrmz1C_xZWVi0wzXio2v3mzC76mQ`
- 새 URL (정상): `AKfycbxz6Vg7Hzb87PBDD2DcKwsRoN_MvzVa2BQpthLn6TTsdku-BSZcDdubXlD0h1KP9wEIEA`

## ✅ 즉시 해결 방법

### 방법 1: 브라우저 콘솔에서 직접 수정 (가장 빠름)

1. **F12** 눌러서 개발자 도구 열기
2. **Console** 탭 선택
3. 다음 코드 실행:

```javascript
// LocalStorage 완전 초기화
localStorage.clear();

// 새 URL 강제 설정
localStorage.setItem('sheet_update_script_url', 'https://script.google.com/macros/s/AKfycbxz6Vg7Hzb87PBDD2DcKwsRoN_MvzVa2BQpthLn6TTsdku-BSZcDdubXlD0h1KP9wEIEA/exec');

// 확인
console.log('✅ 새 URL 설정 완료:', localStorage.getItem('sheet_update_script_url'));

// 페이지 새로고침
location.reload();
```

### 방법 2: 강력 새로고침 (캐시 무시)

**Windows/Linux:**
- `Ctrl + Shift + R`
- 또는 `Ctrl + F5`

**Mac:**
- `Cmd + Shift + R`

### 방법 3: 시크릿 모드 사용

1. **시크릿/프라이빗 창** 열기
   - Chrome: `Ctrl/Cmd + Shift + N`
   - Firefox: `Ctrl/Cmd + Shift + P`
   - Edge: `Ctrl/Cmd + Shift + N`

2. https://garimto81.github.io/virtual_table_db_claude/ 접속

3. 설정 버튼 클릭 후 URL 입력:
```
https://script.google.com/macros/s/AKfycbxz6Vg7Hzb87PBDD2DcKwsRoN_MvzVa2BQpthLn6TTsdku-BSZcDdubXlD0h1KP9wEIEA/exec
```

### 방법 4: 브라우저 데이터 완전 삭제

**Chrome:**
1. 설정 > 개인정보 및 보안 > 인터넷 사용 기록 삭제
2. 시간 범위: **전체**
3. 체크 항목:
   - ✅ 쿠키 및 기타 사이트 데이터
   - ✅ 캐시된 이미지 및 파일
4. **인터넷 사용 기록 삭제** 클릭

## 🔍 현재 상태 확인 방법

브라우저 콘솔(F12)에서:

```javascript
// 현재 저장된 URL 확인
console.log('LocalStorage URL:', localStorage.getItem('sheet_update_script_url'));
console.log('CONFIG URL:', CONFIG?.SHEET_UPDATE_SCRIPT_URL);

// 전체 LocalStorage 내용 확인
console.log('전체 LocalStorage:', localStorage);
```

## 🛠️ 영구 해결책

### index.html 수정 (캐시 무시 강제)

```javascript
// 설정 로드 시 새 URL 강제 적용
window.addEventListener('load', () => {
  // 이전 URL이 저장되어 있으면 삭제
  const oldUrl = 'AKfycbyiop6JQBJyRk2pNsPvrCo8Q2HJ2CB-tqwBeb17SYqrmz1C_xZWVi0wzXio2v3mzC76mQ';
  const savedUrl = localStorage.getItem('sheet_update_script_url');
  
  if (savedUrl && savedUrl.includes(oldUrl)) {
    console.log('⚠️ 이전 URL 감지, 새 URL로 교체');
    const newUrl = 'https://script.google.com/macros/s/AKfycbxz6Vg7Hzb87PBDD2DcKwsRoN_MvzVa2BQpthLn6TTsdku-BSZcDdubXlD0h1KP9wEIEA/exec';
    localStorage.setItem('sheet_update_script_url', newUrl);
    CONFIG.SHEET_UPDATE_SCRIPT_URL = newUrl;
  }
});
```

## 📋 체크리스트

- [ ] LocalStorage 초기화 완료
- [ ] 새 URL 설정 확인
- [ ] 강력 새로고침 실행
- [ ] 시크릿 모드에서 테스트
- [ ] 정상 작동 확인

## ⚡ 빠른 테스트

브라우저 콘솔에서:

```javascript
// 새 URL로 즉시 테스트
fetch('https://script.google.com/macros/s/AKfycbxz6Vg7Hzb87PBDD2DcKwsRoN_MvzVa2BQpthLn6TTsdku-BSZcDdubXlD0h1KP9wEIEA/exec')
  .then(r => r.json())
  .then(d => console.log('✅ 성공:', d))
  .catch(e => console.error('❌ 실패:', e));
```

## 🔄 자동 URL 업데이트 스크립트

북마크에 추가하여 사용:

```javascript
javascript:(function(){
  localStorage.clear();
  const newUrl = 'https://script.google.com/macros/s/AKfycbxz6Vg7Hzb87PBDD2DcKwsRoN_MvzVa2BQpthLn6TTsdku-BSZcDdubXlD0h1KP9wEIEA/exec';
  localStorage.setItem('sheet_update_script_url', newUrl);
  alert('✅ URL 업데이트 완료! 페이지를 새로고침합니다.');
  location.reload();
})();
```

---
최종 업데이트: 2025-01-11