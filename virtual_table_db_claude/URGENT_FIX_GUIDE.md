# 🚨 긴급 오류 해결 가이드

## ⚠️ 현재 발생 중인 오류들

### 1. **finalAnalysis is not defined** ❌
- **원인**: Google Apps Script가 아직 업데이트되지 않음
- **해결**: 새 코드를 Apps Script에 배포해야 함

### 2. **유효한 행 번호가 필요합니다** ❌
- **원인**: Virtual 시트 매칭 실패
- **해결**: CSV URL 및 데이터 확인 필요

---

## 🔥 즉시 해결 방법

### Step 1: Google Apps Script 재배포 (최우선!)

1. **https://script.google.com** 접속
2. 기존 프로젝트 열기
3. 모든 코드 삭제 (Ctrl+A → Delete)
4. 아래 GitHub에서 최신 코드 복사:
   ```
   https://raw.githubusercontent.com/garimto81/virtual_table_db_claude/master/apps_script_final.gs
   ```
5. 붙여넣기 (Ctrl+V)
6. 저장 (Ctrl+S)
7. **배포** > **배포 관리**
8. 현재 배포 옆 **편집** (연필 아이콘) 클릭
9. **버전**: "새 버전" 선택
10. **설명**: "finalAnalysis 오류 수정"
11. **배포** 클릭
12. 배포 URL 확인 (변경되지 않음)

### Step 2: 브라우저 캐시 완전 제거

```javascript
// 브라우저 콘솔(F12)에서 실행
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

### Step 3: Virtual 시트 URL 확인

1. 설정에서 **Virtual 시트 URL (읽기)** 확인
2. URL이 올바른 CSV 형식인지 확인:
   - 끝이 `output=csv`로 끝나야 함
   - 예: `https://docs.google.com/.../pub?gid=0&single=true&output=csv`

### Step 4: 수동 행 번호 입력 (임시 해결책)

Virtual 시트 매칭이 실패하는 경우:

1. Google Sheets에서 직접 행 번호 확인
2. 브라우저 콘솔에서:
```javascript
// 수동으로 행 번호 설정 (예: 735행)
window.currentMatchedRowData = {
  row: 735,  // 실제 행 번호로 변경
  isExactMatch: true,
  formattedTime: '12:06:00'
};
console.log('✅ 행 번호 수동 설정 완료:', 735);
```

---

## 📋 체크리스트

### Apps Script 배포 확인
- [ ] Apps Script 에디터에서 최신 코드 복사/붙여넣기
- [ ] 저장 완료
- [ ] 새 버전으로 재배포
- [ ] "액세스: 모든 사용자" 확인

### 브라우저 설정
- [ ] 캐시 완전 삭제
- [ ] localStorage 초기화
- [ ] 페이지 강제 새로고침 (Ctrl+F5)

### Virtual 시트 설정
- [ ] CSV URL 형식 확인
- [ ] URL 끝에 `output=csv` 있는지 확인
- [ ] 실제로 CSV 데이터가 나오는지 브라우저에서 확인

---

## 🔍 디버깅 명령어

### 1. Apps Script 연결 테스트
```javascript
// 브라우저 콘솔에서
fetch(localStorage.getItem('apps_script_url') || CONFIG.SHEET_UPDATE_SCRIPT_URL)
  .then(r => r.json())
  .then(data => console.log('Apps Script 응답:', data))
  .catch(err => console.error('연결 실패:', err));
```

### 2. Virtual 시트 데이터 확인
```javascript
// 브라우저 콘솔에서
const url = document.getElementById('virtual-sheet-url').value;
fetch(url)
  .then(r => r.text())
  .then(text => {
    const lines = text.split('\n');
    console.log('CSV 라인 수:', lines.length);
    console.log('처음 5줄:', lines.slice(0, 5));
  });
```

### 3. 현재 설정 확인
```javascript
// 브라우저 콘솔에서
console.log('Apps Script URL:', localStorage.getItem('apps_script_url'));
console.log('Virtual Sheet URL:', localStorage.getItem('virtual_sheet_url'));
console.log('Write Sheet URL:', localStorage.getItem('write_sheet_url'));
```

---

## ⚡ 긴급 연락

문제가 계속되면:
1. Apps Script 에디터에서 **보기** > **로그** 확인
2. 브라우저 콘솔 전체 오류 캡처
3. GitHub Issues에 보고

---

## 🎯 근본 원인

**GitHub 코드 업데이트 ≠ Apps Script 배포**

- GitHub의 `apps_script_final.gs`는 단순 백업용
- 실제 실행은 Google Apps Script 서버에서
- **반드시 수동으로 코드 복사/붙여넣기 후 재배포 필요**

---

최종 업데이트: 2025-01-11 (v9.6.1)