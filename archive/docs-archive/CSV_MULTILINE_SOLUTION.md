# 📊 CSV 멀티라인 문제 해결 방안

## 🔴 문제 상황
Google Sheets에서 한 셀에 여러 줄이 있을 때:
```
원본 셀: "라인1
라인2
라인3"

CSV 변환 후:
"라인1
라인2
라인3"

파싱 결과: 3개의 별도 행으로 인식
```

## ✅ 해결 방안

### 방안 1: 고급 CSV 파싱 라이브러리 사용 (권장) ⭐

```javascript
// Papa Parse 라이브러리 사용
// <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>

async function loadVirtualSheetWithPapaParse() {
  const csvUrl = convertToCSVUrl(getSheetUrl());
  const response = await fetch(csvUrl);
  const csvText = await response.text();

  // Papa Parse로 정확한 파싱
  const result = Papa.parse(csvText, {
    header: false,        // 헤더 없음
    skipEmptyLines: true, // 빈 줄 건너뛰기
    quotes: true,         // 따옴표 처리
    quoteChar: '"',       // 따옴표 문자
    escapeChar: '"',      // 이스케이프 문자
    dynamicTyping: false, // 타입 자동 변환 비활성화
    delimiter: ','        // 구분자
  });

  console.log('정확한 행 수:', result.data.length);
  return result.data;
}
```

### 방안 2: Apps Script API 직접 사용 (가장 안정적) ⭐⭐

```javascript
// Apps Script 측 코드
function getSheetData() {
  const sheet = SpreadsheetApp.openByUrl(SHEET_URL).getActiveSheet();
  const data = sheet.getDataRange().getValues();

  // JSON으로 변환하여 정확한 데이터 반환
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// 클라이언트 측 코드
async function loadVirtualSheetViaAppsScript() {
  const appsScriptUrl = getAppsScriptUrl();

  const response = await fetch(appsScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: 'getSheetData',
      sheetUrl: getSheetUrl()
    })
  });

  const data = await response.json();
  console.log('정확한 행 수:', data.length);
  return data;
}
```

### 방안 3: 커스텀 CSV 파서 개선

```javascript
function parseCSVAdvanced(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  let prevChar = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // 이스케이프된 따옴표
        currentField += '"';
        i++; // 다음 따옴표 건너뛰기
      } else if (prevChar === ',' || prevChar === '\n' || i === 0) {
        // 필드 시작 따옴표
        inQuotes = true;
      } else if (nextChar === ',' || nextChar === '\n' || i === text.length - 1) {
        // 필드 종료 따옴표
        inQuotes = false;
      } else {
        // 필드 내부의 따옴표
        currentField += char;
      }
    } else if (char === ',' && !inQuotes) {
      // 필드 구분자
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (char === '\n' && !inQuotes) {
      // 행 구분자
      currentRow.push(currentField.trim());
      if (currentRow.some(field => field !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else if (char === '\r') {
      // 캐리지 리턴 무시
      continue;
    } else {
      // 일반 문자
      currentField += char;
    }

    prevChar = char;
  }

  // 마지막 필드와 행 처리
  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(field => field !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}
```

### 방안 4: 데이터 전처리 (Google Sheets 수식)

```javascript
// Google Sheets에 전처리 컬럼 추가
// 새 컬럼에 수식: =SUBSTITUTE(SUBSTITUTE(A1, CHAR(10), "\\n"), CHAR(13), "\\r")

// 줄바꿈을 다른 문자로 치환
function preprocessData(text) {
  // 서버에서 미리 처리
  return text
    .replace(/\r\n/g, '\\n')  // CRLF를 \n으로
    .replace(/\n/g, '\\n')     // LF를 \n으로
    .replace(/\r/g, '\\r');    // CR을 \r로
}

// 클라이언트에서 복원
function restoreLineBreaks(text) {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r');
}
```

### 방안 5: 행 번호 매핑 테이블 사용

```javascript
class RowNumberMapper {
  constructor() {
    this.csvToSheetMap = new Map();  // CSV 행 → Sheet 행
    this.sheetToCsvMap = new Map();  // Sheet 행 → CSV 행
  }

  async buildMapping() {
    // 1. Apps Script로 실제 행 번호 가져오기
    const realRows = await this.getRealRowNumbers();

    // 2. CSV 파싱
    const csvRows = parseCSV(csvText);

    // 3. 매핑 구축
    let csvIndex = 0;
    for (let sheetRow = 1; sheetRow <= realRows.length; sheetRow++) {
      const rowData = realRows[sheetRow - 1];

      // 고유 식별자로 매칭 (예: 타임스탬프, ID 등)
      const identifier = rowData[0]; // A열을 식별자로 사용

      // CSV에서 같은 식별자 찾기
      while (csvIndex < csvRows.length) {
        if (csvRows[csvIndex][0] === identifier) {
          this.csvToSheetMap.set(csvIndex + 1, sheetRow);
          this.sheetToCsvMap.set(sheetRow, csvIndex + 1);
          csvIndex++;
          break;
        }
        csvIndex++;
      }
    }
  }

  getSheetRow(csvRow) {
    return this.csvToSheetMap.get(csvRow) || csvRow;
  }

  getCsvRow(sheetRow) {
    return this.sheetToCsvMap.get(sheetRow) || sheetRow;
  }
}
```

## 🎯 권장 구현 방법

### 즉시 적용 가능한 해결책

```javascript
// SheetDataCache 클래스 수정
class SheetDataCache {
  async refreshCache() {
    try {
      const sheetUrl = getSheetUrl();

      // 방법 1: Papa Parse 사용 (CDN 추가 필요)
      if (typeof Papa !== 'undefined') {
        const response = await fetch(convertToCSVUrl(sheetUrl));
        const csvText = await response.text();

        const result = Papa.parse(csvText, {
          skipEmptyLines: true,
          quotes: true
        });

        this.processRows(result.data);

      // 방법 2: Apps Script JSON API
      } else if (getAppsScriptUrl()) {
        const response = await fetch(getAppsScriptUrl(), {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            action: 'getAllData',
            sheetUrl: sheetUrl
          })
        });

        const data = await response.json();
        this.processRows(data);

      // 방법 3: 개선된 파서
      } else {
        const response = await fetch(convertToCSVUrl(sheetUrl));
        const csvText = await response.text();
        const rows = parseCSVAdvanced(csvText);
        this.processRows(rows);
      }

    } catch (error) {
      console.error('캐시 갱신 실패:', error);
    }
  }

  processRows(rows) {
    this.cache.clear();
    this.timeIndex.clear();
    this.handNumberIndex.clear();

    // 실제 행 수 기준으로 처리
    console.log(`📊 실제 행 수: ${rows.length}개`);

    rows.forEach((row, index) => {
      const rowNum = index + 1;
      const handNumber = row[0];  // A열
      const time = row[1];        // B열
      const status = row[4];      // E열

      // 데이터 검증
      if (time && time.match(/^\d{1,2}:\d{2}/)) {
        this.cache.set(rowNum, {
          row: rowNum,
          handNumber: handNumber,
          time: time,
          status: status || '',
          timestamp: this.parseTimeToTimestamp(time)
        });

        // 인덱스 업데이트
        if (handNumber) {
          this.handNumberIndex.set(handNumber, rowNum);
        }
      }
    });

    console.log(`✅ 캐시 갱신 완료: ${this.cache.size}개 유효 데이터`);
  }
}
```

## 📋 구현 체크리스트

### 단기 해결 (즉시)
- [ ] Papa Parse CDN 추가
- [ ] parseCSVAdvanced 함수로 교체
- [ ] 캐시 갱신 후 행 수 확인

### 중기 해결 (1일)
- [ ] Apps Script getAllData 액션 추가
- [ ] JSON 기반 데이터 전송으로 변경
- [ ] 행 번호 매핑 테이블 구현

### 장기 해결 (1주)
- [ ] Google Sheets API v4 직접 사용
- [ ] 실시간 동기화 시스템 구축
- [ ] 멀티라인 데이터 자동 감지

## 🧪 테스트 코드

```javascript
// 멀티라인 문제 테스트
async function testMultilineParsing() {
  const testCsv = `"핸드1","10:00","설명","","미완료"
"핸드2","11:00","여러
줄로
된 설명","","복사완료"
"핸드3","12:00","정상","",""`;

  // 기존 파서
  const oldResult = parseCSV(testCsv);
  console.log('기존 파서:', oldResult.length, '행');

  // 개선된 파서
  const newResult = parseCSVAdvanced(testCsv);
  console.log('개선 파서:', newResult.length, '행');

  // Papa Parse
  if (typeof Papa !== 'undefined') {
    const papaResult = Papa.parse(testCsv, { skipEmptyLines: true });
    console.log('Papa Parse:', papaResult.data.length, '행');
  }

  // 정답: 3행이어야 함
  console.log('✅ 올바른 결과: 3행');
}

testMultilineParsing();
```

---

**권장 우선순위:**
1. 🥇 **Papa Parse 라이브러리** - 가장 빠르고 안정적
2. 🥈 **Apps Script JSON API** - 가장 정확하지만 API 호출 필요
3. 🥉 **개선된 커스텀 파서** - 외부 의존성 없음

**작성일**: 2025-09-18