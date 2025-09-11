# CSV 행 번호 불일치 해결 가이드

## 문제 상황
- CSV에서 12:06 시간이 **730행**에 있음
- 하지만 시스템은 **735행**으로 보고함
- **5행 차이** 발생

## 원인 분석

### 1. CSV 구조 문제
```
[빈 줄] → 행 1
[빈 줄] → 행 2  
[빈 줄] → 행 3
[빈 줄] → 행 4
[헤더] → 행 5
[데이터 시작] → 행 6
```

### 2. 코드 동작
```javascript
// 현재 코드 (index.html 라인 2091)
rowIndex = i + 1;  // 배열 인덱스를 행 번호로 변환
```

## 즉시 해결 방법

### 방법 1: CSV 파일 정리
1. CSV 파일 열기
2. **상단의 빈 줄 모두 삭제**
3. 첫 번째 줄이 헤더인지 확인
4. 저장 후 다시 시도

### 방법 2: 코드 수정 (임시)
index.html 수정:
```javascript
// 라인 2091 근처
// 기존 코드
rowIndex = i + 1;

// 수정 코드 (5행 보정)
rowIndex = i + 1 - 4;  // CSV 상단 빈 줄 4개 보정
```

### 방법 3: 자동 빈 줄 제거 (권장)
index.html에 추가:
```javascript
// CSV 파싱 후 빈 줄 제거
const rows = text.trim()
  .split('\n')
  .map(row => row.trim())
  .filter(row => row.length > 0)  // 빈 줄 제거
  .map(row => row.split(','));
```

## 영구 해결책

### index.html 수정 (라인 1950 근처)
```javascript
// 기존 코드
const response = await fetch(csvUrl);
const text = await response.text();
const rows = text.trim().split('\n').map(row => row.split(','));

// 수정된 코드
const response = await fetch(csvUrl);
const text = await response.text();

// 빈 줄 및 헤더 처리
const allRows = text.trim().split('\n');
const dataRows = [];
let headerFound = false;

for (let i = 0; i < allRows.length; i++) {
  const row = allRows[i].trim();
  
  // 빈 줄 건너뛰기
  if (!row) continue;
  
  // 헤더 감지 (시간 형식이 없는 첫 줄)
  if (!headerFound && !row.match(/\d{1,2}:\d{2}/)) {
    headerFound = true;
    console.log(`📋 헤더 감지 (원본 행 ${i+1}): ${row.substring(0, 50)}...`);
    continue;
  }
  
  // 데이터 행 추가
  dataRows.push(row.split(','));
}

const rows = dataRows;
console.log(`✅ 유효한 데이터 행: ${rows.length}개 (빈 줄 및 헤더 제외)`);
```

## 디버깅 방법

### 브라우저 콘솔에서 확인:
```javascript
// CSV 구조 확인
fetch('YOUR_CSV_URL')
  .then(r => r.text())
  .then(text => {
    const lines = text.split('\n');
    console.log('총 줄 수:', lines.length);
    console.log('처음 10줄:');
    lines.slice(0, 10).forEach((line, i) => {
      console.log(`행 ${i+1}: [${line.length}자] ${line.substring(0, 50)}`);
    });
  });
```

## 체크리스트

- [ ] CSV 파일 상단 빈 줄 확인
- [ ] 헤더 줄 수 확인
- [ ] 실제 데이터 시작 행 확인
- [ ] Google Sheets 설정 확인 (숨겨진 행 없는지)
- [ ] CSV export 설정 확인

## 예상 결과

수정 후:
- CSV 730행 → 시스템 730행 (정확히 일치)
- 행 번호 오프셋 제거
- 정확한 매칭

---
최종 업데이트: 2025-01-11