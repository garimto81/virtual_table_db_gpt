# 🚨 CORS 오류 즉시 해결 가이드

## 현재 상황
- **코드**: ✅ 정상 (수정 불필요)
- **문제**: 배포 설정 또는 URL 불일치

## 🔧 30초 해결법

### Step 1: Apps Script 배포 확인
```
1. https://script.google.com 접속
2. 프로젝트 열기
3. 배포 > 배포 관리
4. 활성 배포 확인
```

### Step 2: 배포 설정 수정
현재 배포의 **편집** 버튼 클릭:
```
✅ 실행: 나
✅ 액세스: 모든 사용자  ← 가장 중요!
✅ 설명: (선택사항)
```
**업데이트** 클릭

### Step 3: URL 확인
배포 관리에서 URL 복사:
- 형식: `https://script.google.com/macros/s/.../exec`
- `/dev`가 아닌 `/exec`로 끝나야 함

### Step 4: index.html 업데이트
```javascript
const CONFIG = {
  SHEET_UPDATE_SCRIPT_URL: '복사한_URL_여기에_붙여넣기'
};
```

## 🧪 작동 테스트

### 브라우저 콘솔(F12)에서:
```javascript
// 1. GET 테스트
fetch('YOUR_SCRIPT_URL')
  .then(r => r.json())
  .then(console.log);

// 2. POST 테스트  
fetch('YOUR_SCRIPT_URL', {
  method: 'POST',
  body: JSON.stringify({
    action: 'analyzeHand',
    handNumber: 'TEST_001'
  })
})
.then(r => r.json())
.then(console.log);
```

### 예상 결과:
```json
{
  "status": "ok",
  "version": "v1.1",
  "service": "Virtual Table Sheet Updater"
}
```

## ⚠️ 자주 하는 실수

### ❌ 잘못된 설정:
- 액세스: "나만" 또는 "특정 사용자"
- URL: `/dev` 사용
- 비활성화된 배포

### ✅ 올바른 설정:
- 액세스: "모든 사용자"
- URL: `/exec` 사용
- 활성 상태 배포

## 🆘 그래도 안 되면?

### 옵션 A: 새 배포 생성
```
1. 배포 > 새 배포
2. 웹 앱 선택
3. 액세스: 모든 사용자
4. 배포
5. 새 URL로 index.html 업데이트
```

### 옵션 B: 권한 재설정
```
1. Google 계정 로그아웃/로그인
2. Apps Script 권한 재승인
3. 시트 공유 설정 확인
```

### 옵션 C: 캐시 문제
```
1. 브라우저 캐시 삭제
2. 시크릿 모드로 테스트
3. 다른 브라우저 사용
```

## 📊 체크리스트

- [ ] Apps Script 배포 상태: **활성**
- [ ] 액세스 권한: **모든 사용자**
- [ ] URL 형식: `/exec`로 끝남
- [ ] index.html의 URL과 일치
- [ ] GET 요청 시 JSON 응답 확인

---
최종 확인: 2025-01-11