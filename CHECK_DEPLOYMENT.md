# 🔍 Apps Script 배포 문제 해결

## 1단계: 현재 배포 상태 확인

### Apps Script 에디터에서:
1. https://script.google.com 접속
2. 해당 프로젝트 열기
3. **배포** > **배포 관리** 클릭

### 확인사항:
- ✅ **활성 배포**가 있는지
- ✅ 배포 URL이 index.html의 URL과 일치하는지
- ✅ **액세스** 설정이 "모든 사용자"인지
- ✅ **상태**가 "활성"인지

## 2단계: 배포 URL 테스트

브라우저 주소창에 직접 입력:
```
https://script.google.com/macros/s/AKfycbyiop6JQBJyRk2pNsPvrCo8Q2HJ2CB-tqwBeb17SYqrmz1C_xZWVi0wzXio2v3mzC76mQ/exec
```

### 예상 결과:
- ✅ JSON 응답이 나와야 함
- ❌ "승인 필요" → 권한 문제
- ❌ "찾을 수 없음" → URL 변경됨
- ❌ 빈 페이지 → 배포 비활성화

## 3단계: 재배포 (권장)

### 기존 배포 수정:
1. **배포 관리** > 연필 아이콘 클릭
2. 설정 확인:
   ```
   버전: 새 버전
   설명: (현재 날짜 추가)
   실행: 나
   액세스: 모든 사용자 ← 중요!
   ```
3. **업데이트** 클릭

### 완전 새 배포:
1. 기존 배포 **보관처리**
2. **새 배포** 생성
3. 새 URL로 index.html 업데이트

## 4단계: 대체 솔루션

### 임시 해결책 1: 로컬 테스트
```javascript
// index.html 수정 - CORS 우회
const USE_LOCAL_MODE = true;

if (USE_LOCAL_MODE) {
  // 로컬 저장소만 사용
  localStorage.setItem('hand_' + handNumber, JSON.stringify(data));
} else {
  // Apps Script 호출
  await fetch(CONFIG.SHEET_UPDATE_SCRIPT_URL, {...});
}
```

### 임시 해결책 2: GET 방식 사용
```javascript
// POST 대신 GET 사용
const params = new URLSearchParams({
  action: 'updateSheet',
  handNumber: handData.handNumber,
  // ... 다른 파라미터
});

const url = `${CONFIG.SHEET_UPDATE_SCRIPT_URL}?${params}`;
window.open(url, '_blank'); // 새 탭에서 실행
```

### 임시 해결책 3: 수동 업데이트
1. 데이터를 클립보드에 복사
2. Google Sheets 직접 열기
3. 수동으로 붙여넣기

## 5단계: 영구 해결

### 옵션 A: 소유권 이전
1. Apps Script 프로젝트 공유
2. 새 소유자가 재배포
3. 새 URL로 업데이트

### 옵션 B: 서비스 계정 사용
1. Google Cloud Console에서 서비스 계정 생성
2. Sheets API 직접 사용
3. CORS 문제 완전 회피

### 옵션 C: 백엔드 서버 구축
- Supabase Edge Functions
- Vercel Functions
- Netlify Functions

## 자주 묻는 질문

**Q: 왜 갑자기 안 되나요?**
A: Google Apps Script URL은 다음 경우 변경됩니다:
- 스크립트 재배포
- 프로젝트 소유자 변경
- Google 정책 업데이트
- 30일 이상 미사용 시 자동 비활성화

**Q: 테스트는 어떻게?**
A: 브라우저 콘솔(F12):
```javascript
// 간단 테스트
fetch('YOUR_SCRIPT_URL')
  .then(r => r.text())
  .then(console.log)
  .catch(e => console.error('접근 불가:', e));
```

**Q: 로그는 어디서 보나요?**
A: Apps Script 에디터 > 실행 > 실행 내역

---

최종 업데이트: 2025-01-11