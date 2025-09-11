# 🚨 Apps Script CORS 최종 해결 가이드

## 문제 상황
- **증상**: Apps Script 연결 테스트 시 계속 이전 URL 사용
- **원인**: GitHub Pages 캐시 또는 브라우저 캐시

## ✅ 단계별 해결 방법

### Step 1: Apps Script 배포 재확인

1. https://script.google.com 접속
2. 프로젝트 열기
3. **배포** > **배포 관리**
4. 현재 배포 확인:
   - URL이 `AKfycbxz6Vg7Hzb87PBDD2DcKwsRoN...`로 시작하는지 확인
   - **액세스**: "모든 사용자" 확인
   - **상태**: "활성" 확인

### Step 2: GitHub 저장소 확인

1. https://github.com/garimto81/virtual_table_db_claude 접속
2. `index.html` 파일 열기
3. 636행 근처 확인:
   ```javascript
   SHEET_UPDATE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxz6Vg7Hzb87PBDD2DcKwsRoN_MvzVa2BQpthLn6TTsdku-BSZcDdubXlD0h1KP9wEIEA/exec'
   ```

### Step 3: 강제 캐시 제거

#### 방법 A: 브라우저 완전 초기화
1. Chrome 설정 > 개인정보 및 보안
2. 인터넷 사용 기록 삭제
3. 시간 범위: **전체**
4. 체크:
   - ✅ 인터넷 사용 기록
   - ✅ 쿠키 및 기타 사이트 데이터
   - ✅ 캐시된 이미지 및 파일
5. 삭제 클릭

#### 방법 B: 개발자 도구 활용
1. F12 > Network 탭
2. **Disable cache** 체크 ✅
3. F12 창 열어둔 상태로 Ctrl+Shift+R

### Step 4: URL 파라미터 추가

브라우저 주소창에:
```
https://garimto81.github.io/virtual_table_db_claude/?v=20250111&nocache=true
```

### Step 5: 설정 모달에서 직접 입력

1. 페이지에서 **설정** 버튼 클릭
2. **Apps Script URL** 필드 내용 전체 삭제
3. 새 URL 붙여넣기:
   ```
   https://script.google.com/macros/s/AKfycbxz6Vg7Hzb87PBDD2DcKwsRoN_MvzVa2BQpthLn6TTsdku-BSZcDdubXlD0h1KP9wEIEA/exec
   ```
4. **저장** 클릭
5. 페이지 새로고침

## 🔧 스크립트 수동 실행

브라우저 콘솔(F12)에서:

```javascript
// 완전 초기화 및 새 URL 설정
(function fixAppsScript() {
    // 1. 모든 저장된 URL 삭제
    const keysToRemove = [];
    for (let key in localStorage) {
        if (key.includes('url') || key.includes('URL') || key.includes('script')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // 2. 새 URL 설정
    const correctUrl = 'https://script.google.com/macros/s/AKfycbxz6Vg7Hzb87PBDD2DcKwsRoN_MvzVa2BQpthLn6TTsdku-BSZcDdubXlD0h1KP9wEIEA/exec';
    
    // 3. 여러 키에 저장 (호환성)
    localStorage.setItem('sheet_update_script_url', correctUrl);
    localStorage.setItem('apps_script_url', correctUrl);
    localStorage.setItem('SHEET_UPDATE_SCRIPT_URL', correctUrl);
    
    // 4. CONFIG 객체 수정
    if (window.CONFIG) {
        window.CONFIG.SHEET_UPDATE_SCRIPT_URL = correctUrl;
        window.CONFIG.APPS_SCRIPT_URL = correctUrl;
    }
    
    console.log('✅ 설정 완료. 새 URL:', correctUrl);
    
    // 5. 3초 후 자동 새로고침
    setTimeout(() => {
        console.log('페이지 새로고침...');
        location.reload(true);
    }, 3000);
})();
```

## 🚀 대체 방법: 다른 브라우저 사용

1. **다른 브라우저** 사용 (Edge, Firefox 등)
2. https://garimto81.github.io/virtual_table_db_claude/ 접속
3. 설정에서 새 URL 입력

## 📊 확인 방법

성공 시 콘솔에 표시되는 메시지:
```json
{
  "status": "ok",
  "method": "GET",
  "version": "v1.1",
  "service": "Virtual Table Sheet Updater"
}
```

## ⚠️ 그래도 안 되면

### 1. GitHub Actions 강제 재배포
```bash
git commit --allow-empty -m "Force rebuild"
git push
```

### 2. CloudFlare 캐시 퍼지 (사용 중인 경우)
- CloudFlare 대시보드 > Caching > Purge Everything

### 3. 임시 해결책
- 로컬에서 `index.html` 직접 실행
- Python 서버: `python -m http.server 8000`
- 브라우저: http://localhost:8000

---
최종 업데이트: 2025-01-11