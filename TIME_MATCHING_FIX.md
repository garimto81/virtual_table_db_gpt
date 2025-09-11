# 🕒 시간 매칭 오차 해결 가이드

## 🔍 발견된 문제점들

### 1. **시간대 변환 오류** ✅ 수정완료
- **문제**: Seoul 시간대 변환 로직이 잘못되어 시간이 틀리게 계산됨
- **원인**: `seoulTime = new Date(targetTime * 1000 + (seoulOffset + localOffset) * 60 * 1000)`
- **해결**: 시간대 변환 제거, 로컬 시간 직접 사용

### 2. **CSV 행 번호 오프셋**
- **문제**: CSV 파일의 실제 행 번호와 코드에서 계산하는 행 번호 불일치
- **원인**: 
  - CSV 파일 상단에 빈 줄이 있을 수 있음
  - 헤더 행 처리 방식 차이
  - 행 인덱스 계산: `rowIndex = i + 1` (0-based를 1-based로 변환)

### 3. **시간 허용 오차 범위**
- **현재 설정**: 
  - 정확 매칭: 5초 이내
  - 근사 매칭: 30초 이내
  - 근사치: 30초 이상

## 🛠️ 수정 사항

### 1. 시간대 변환 제거 (완료)
```javascript
// 이전 (오류)
const seoulTime = new Date(targetTime * 1000 + (seoulOffset + localOffset) * 60 * 1000);

// 수정 후
const targetDate = new Date(targetTime * 1000);
const targetHours = targetDate.getHours();
const targetMinutes = targetDate.getMinutes();
const targetSeconds = targetDate.getSeconds();
```

### 2. CSV 행 번호 정확도 개선 (추가 수정 필요)
```javascript
// 현재 코드
rowIndex = i + 1;  // 배열 인덱스(0-based)를 행 번호(1-based)로 변환

// 권장 수정
// CSV 파일의 실제 구조 확인 필요:
// - 헤더가 있는지 확인
// - 빈 줄이 있는지 확인
// - 실제 데이터 시작 행 확인
```

### 3. 시간 매칭 허용 오차 조정 권장
```javascript
// 현재
if (minDiff <= 5) {  // 5초 이내
  accuracy = 'exact';
} else if (minDiff <= 30) {  // 30초 이내
  accuracy = 'close';
} else {
  accuracy = 'approximate';
}

// 권장 (더 넓은 허용 범위)
if (minDiff <= 10) {  // 10초 이내
  accuracy = 'exact';
} else if (minDiff <= 60) {  // 1분 이내
  accuracy = 'close';
} else if (minDiff <= 180) {  // 3분 이내
  accuracy = 'approximate';
} else {
  accuracy = 'far';
}
```

## 📊 디버깅 방법

### 1. CSV 파일 구조 확인
```javascript
// 브라우저 콘솔에서 실행
fetch('YOUR_CSV_URL')
  .then(r => r.text())
  .then(text => {
    const lines = text.split('\n');
    console.log('총 라인 수:', lines.length);
    console.log('처음 10줄:');
    lines.slice(0, 10).forEach((line, i) => {
      console.log(`라인 ${i}: "${line}"`);
    });
  });
```

### 2. 시간 매칭 디버깅
```javascript
// 콘솔 로그 확인 사항
console.log('타겟 시간:', targetHours, ':', targetMinutes, ':', targetSeconds);
console.log('CSV 시간:', hours, ':', minutes, ':', seconds);
console.log('시간 차이(초):', diff);
console.log('행 번호:', rowIndex);
```

## ✅ 권장 조치

1. **즉시 적용**: 시간대 변환 제거 (완료)
2. **확인 필요**: CSV 파일 실제 구조 확인
3. **선택 사항**: 시간 매칭 허용 오차 범위 조정

## 🔄 테스트 방법

1. 브라우저 캐시 완전 삭제 (Ctrl+Shift+Delete)
2. 페이지 새로고침 (Ctrl+F5)
3. 개발자 도구 콘솔 열기 (F12)
4. 핸드 처리 후 콘솔 로그 확인:
   - "시간 분석 시작" 메시지 확인
   - 타겟 시간과 매칭된 시간 비교
   - 행 번호 정확도 확인

---
최종 업데이트: 2025-01-11