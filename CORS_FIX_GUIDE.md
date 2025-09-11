# 🔧 CORS 오류 해결 가이드

## 🚨 문제 상황
```
Access to fetch at 'https://script.google.com/macros/s/.../exec' 
from origin 'https://garimto81.github.io' has been blocked by CORS policy
```

## ✅ 즉시 해결 방법

### 방법 1: Apps Script 재배포 (권장)

1. **Google Apps Script 열기**
   - https://script.google.com 접속
   - 기존 프로젝트 열기 또는 새 프로젝트 생성

2. **새 코드 복사**
   ```bash
   # apps_script_cors_fixed.gs 파일의 전체 내용을 복사하여 붙여넣기
   ```

3. **배포 설정 (중요!)**
   - 상단 메뉴: **배포** > **배포 관리**
   - **새 배포** 클릭
   - 설정:
     ```
     유형: 웹 앱
     설명: Virtual Table DB v9.5.1 CORS Fixed
     실행: 나
     액세스: 모든 사용자 (중요!)
     ```
   - **배포** 클릭

4. **새 URL 복사**
   - 생성된 URL 복사 (https://script.google.com/macros/s/.../exec)

5. **index.html 업데이트**
   ```javascript
   const CONFIG = {
     // ... 다른 설정
     SHEET_UPDATE_SCRIPT_URL: '새로운_APPS_SCRIPT_URL'
   };
   ```

### 방법 2: 프록시 서버 사용 (임시)

1. **CORS 프록시 추가**
   ```javascript
   // index.html에서 updateSheetData 함수 수정
   async function updateSheetData(handData, matchedRow) {
     const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
     const scriptUrl = CONFIG.SHEET_UPDATE_SCRIPT_URL;
     
     const response = await fetch(proxyUrl + scriptUrl, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'X-Requested-With': 'XMLHttpRequest'
       },
       body: JSON.stringify(payload)
     });
   }
   ```

### 방법 3: JSONP 방식 변경

1. **Apps Script 수정**
   ```javascript
   function doGet(e) {
     const callback = e.parameter.callback;
     const data = processAction(e.parameter);
     
     return ContentService.createTextOutput(
       callback + '(' + JSON.stringify(data) + ')'
     ).setMimeType(ContentService.MimeType.JAVASCRIPT);
   }
   ```

2. **index.html 수정**
   ```javascript
   function updateViaJSONP(data) {
     const script = document.createElement('script');
     const params = new URLSearchParams(data);
     script.src = `${CONFIG.SHEET_UPDATE_SCRIPT_URL}?callback=handleResponse&${params}`;
     document.body.appendChild(script);
   }
   
   window.handleResponse = function(data) {
     console.log('응답:', data);
   };
   ```

## 🔍 배포 체크리스트

### Apps Script 설정 확인
- [ ] **실행 권한**: "나"로 설정
- [ ] **액세스 권한**: "모든 사용자"로 설정
- [ ] **URL 형식**: /exec로 끝나는지 확인 (NOT /dev)
- [ ] **버전**: 새 버전으로 배포했는지 확인

### 권한 확인
- [ ] Google 계정 로그인 상태
- [ ] 시트 편집 권한 있음
- [ ] Apps Script 실행 권한 부여됨

### 테스트 방법
```javascript
// 브라우저 콘솔에서 실행
fetch('YOUR_SCRIPT_URL', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    action: 'test',
    message: 'CORS 테스트'
  })
})
.then(r => r.json())
.then(data => console.log('성공:', data))
.catch(err => console.error('실패:', err));
```

## 🛠️ 고급 해결 방법

### 1. Google Cloud Platform 사용
```javascript
// Cloud Functions로 프록시 생성
exports.corsProxy = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Apps Script 호출
  // ...
};
```

### 2. 서버리스 함수 (Vercel/Netlify)
```javascript
// api/proxy.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const response = await fetch(APPS_SCRIPT_URL, {
    method: req.method,
    headers: req.headers,
    body: JSON.stringify(req.body)
  });
  
  const data = await response.json();
  res.status(200).json(data);
}
```

### 3. Worker 사용 (Cloudflare)
```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const response = await fetch(APPS_SCRIPT_URL, request);
  const newResponse = new Response(response.body, response);
  
  newResponse.headers.set('Access-Control-Allow-Origin', '*');
  return newResponse;
}
```

## 📊 문제 진단

### 1. 네트워크 탭 확인
- F12 > Network 탭
- 실패한 요청 찾기
- Response Headers 확인

### 2. Apps Script 로그 확인
- Apps Script 에디터 > 보기 > 실행 내역
- 오류 메시지 확인

### 3. 콘솔 오류 확인
```javascript
// 상세 오류 로깅
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    console.error('응답 상태:', response.status);
    console.error('응답 헤더:', [...response.headers.entries()]);
  }
} catch (error) {
  console.error('CORS 오류 상세:', {
    message: error.message,
    stack: error.stack,
    url: url,
    origin: window.location.origin
  });
}
```

## 🚀 즉시 작동하는 대안

### 로컬 실행 (CORS 우회)
```bash
# Chrome을 CORS 비활성화 모드로 실행
chrome.exe --user-data-dir="C:/temp" --disable-web-security --disable-features=CrossSiteDocumentBlockingIfIsolating

# 또는 로컬 서버 사용
python -m http.server 8000 --bind 127.0.0.1
```

### GitHub Pages 대신 Vercel 사용
```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

## 💡 영구 해결책

### 1. 전용 백엔드 구축
- Node.js + Express
- Python + FastAPI
- Supabase Edge Functions

### 2. 서버리스 아키텍처
- AWS Lambda
- Google Cloud Functions
- Vercel Functions

### 3. 완전 클라이언트 방식
- Google Sheets API 직접 사용
- OAuth2 인증 구현

## 📞 지원

문제가 계속되면:
1. Apps Script URL 확인
2. 배포 설정 재확인
3. 브라우저 캐시 삭제
4. 다른 브라우저로 테스트

---

**최종 업데이트**: 2025-01-11
**버전**: 9.5.1