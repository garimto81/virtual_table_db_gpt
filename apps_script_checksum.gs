// Virtual Table DB - Checksum Enhanced Version v4.0.0
// Day 2: Checksum 기능이 추가된 Google Apps Script

// ========================================
// 1. 기본 설정
// ========================================
const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Checksum 캐시 (메모리 캐시)
const checksumCache = CacheService.getScriptCache();

// ========================================
// 2. Checksum 생성 함수
// ========================================

/**
 * 데이터의 MD5 checksum 생성
 * @param {Array} data - 2차원 배열 데이터
 * @return {string} - Base64 인코딩된 checksum
 */
function generateChecksum(data) {
  try {
    // 데이터를 JSON 문자열로 변환
    const dataString = JSON.stringify(data);

    // MD5 해시 생성
    const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, dataString);

    // Base64 인코딩
    const checksum = Utilities.base64Encode(hash);

    console.log(`✅ Checksum 생성: ${checksum.substring(0, 10)}...`);
    return checksum;
  } catch (error) {
    console.error('❌ Checksum 생성 오류:', error);
    throw error;
  }
}

/**
 * 특정 범위의 checksum 생성
 * @param {string} range - A1 표기법 범위 (예: "E:E")
 * @return {Object} - range와 checksum 포함
 */
function getRangeChecksum(range) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const dataSheet = sheet.getSheetByName('Virtual_Table_Play');

    if (!dataSheet) {
      throw new Error('Virtual_Table_Play 시트를 찾을 수 없습니다');
    }

    const rangeData = dataSheet.getRange(range).getValues();
    const checksum = generateChecksum(rangeData);

    return {
      range: range,
      checksum: checksum,
      timestamp: new Date().toISOString(),
      rowCount: rangeData.length,
      cellCount: rangeData.length * (rangeData[0] ? rangeData[0].length : 0)
    };
  } catch (error) {
    console.error(`❌ 범위 ${range} checksum 생성 오류:`, error);
    throw error;
  }
}

/**
 * 전체 시트의 checksum만 반환 (경량 체크)
 * @return {Object} - checksum과 메타데이터
 */
function getChecksumOnly() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const dataSheet = sheet.getSheetByName('Virtual_Table_Play');

    if (!dataSheet) {
      throw new Error('Virtual_Table_Play 시트를 찾을 수 없습니다');
    }

    const data = dataSheet.getDataRange().getValues();
    const checksum = generateChecksum(data);

    // 캐시에 저장 (5분간)
    checksumCache.put('lastChecksum', checksum, 300);

    return {
      checksum: checksum,
      timestamp: new Date().toISOString(),
      rowCount: data.length,
      columnCount: data[0] ? data[0].length : 0,
      cached: false
    };
  } catch (error) {
    console.error('❌ Checksum 조회 오류:', error);
    throw error;
  }
}

/**
 * Checksum과 함께 데이터 반환
 * @param {string} clientChecksum - 클라이언트의 현재 checksum
 * @return {Object} - checksum과 데이터 또는 변경 없음 표시
 */
function getDataWithChecksum(clientChecksum) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const dataSheet = sheet.getSheetByName('Virtual_Table_Play');

    if (!dataSheet) {
      throw new Error('Virtual_Table_Play 시트를 찾을 수 없습니다');
    }

    const data = dataSheet.getDataRange().getValues();
    const currentChecksum = generateChecksum(data);

    // Checksum 비교
    if (clientChecksum && clientChecksum === currentChecksum) {
      console.log('✅ 데이터 변경 없음 - checksum 일치');
      return {
        changed: false,
        checksum: currentChecksum,
        timestamp: new Date().toISOString(),
        message: 'No changes detected'
      };
    }

    console.log('📦 데이터 변경 감지 - 전체 데이터 전송');

    // 데이터 변경됨 - 전체 데이터 반환
    return {
      changed: true,
      checksum: currentChecksum,
      timestamp: new Date().toISOString(),
      data: data,
      rowCount: data.length,
      columnCount: data[0] ? data[0].length : 0
    };
  } catch (error) {
    console.error('❌ 데이터 조회 오류:', error);
    throw error;
  }
}

/**
 * 다중 범위 checksum 반환
 * @return {Object} - 여러 범위의 checksum
 */
function getMultiRangeChecksums() {
  try {
    const ranges = {
      handStatus: 'E:E',     // 핸드 완료 상태
      amounts: 'F:J',        // 금액 관련 열
      metadata: 'A:D',       // 메타데이터
      fullSheet: null        // 전체 시트
    };

    const checksums = {};

    // 각 범위별 checksum 생성
    for (const [key, range] of Object.entries(ranges)) {
      if (range) {
        checksums[key] = getRangeChecksum(range);
      } else {
        // 전체 시트 checksum
        checksums[key] = getChecksumOnly();
      }
    }

    return {
      checksums: checksums,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ 다중 범위 checksum 오류:', error);
    throw error;
  }
}

// ========================================
// 3. CORS 응답 생성
// ========================================
function createCorsResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========================================
// 4. HTTP 메소드 핸들러
// ========================================

// GET 요청 처리
function doGet(e) {
  console.log('📥 GET 요청 수신:', JSON.stringify(e));

  const action = e.parameter.action;

  try {
    let response;

    switch(action) {
      case 'getChecksum':
        response = getChecksumOnly();
        break;

      case 'getMultiChecksum':
        response = getMultiRangeChecksums();
        break;

      case 'getFullData':
        const clientChecksum = e.parameter.checksum;
        response = getDataWithChecksum(clientChecksum);
        break;

      default:
        // 서비스 상태 확인
        response = {
          status: 'ok',
          method: 'GET',
          time: new Date().toISOString(),
          version: 'v4.0.0',
          service: 'Virtual Table Sheet with Checksum',
          features: [
            'Checksum Generation',
            'Conditional Data Loading',
            'Multi-Range Checksums',
            'Cache Support'
          ],
          message: 'Checksum 서비스가 정상 작동 중입니다'
        };
    }

    return createCorsResponse(response);

  } catch (error) {
    console.error('❌ GET 처리 오류:', error);
    return createCorsResponse({
      status: 'error',
      message: error.toString()
    });
  }
}

// POST 요청 처리
function doPost(e) {
  console.log('📥 POST 요청 수신');

  try {
    // 요청 데이터 파싱
    let requestData = {};

    if (e.postData && e.postData.contents) {
      try {
        requestData = JSON.parse(e.postData.contents);
      } catch (parseError) {
        console.log('⚠️ JSON 파싱 실패, text/plain으로 처리');
        requestData = JSON.parse(e.postData.contents.toString());
      }
    }

    console.log('📋 요청 데이터:', JSON.stringify(requestData));

    const action = requestData.action || e.parameter.action;
    let response;

    switch(action) {
      case 'getIncrementalUpdate':
        // Day 3에서 구현 예정
        response = {
          status: 'pending',
          message: 'Incremental updates will be implemented in Day 3'
        };
        break;

      case 'updateSheet':
        response = updateSheetData(requestData);
        break;

      default:
        response = {
          status: 'error',
          message: 'Unknown action: ' + action
        };
    }

    return createCorsResponse(response);

  } catch (error) {
    console.error('❌ POST 처리 오류:', error);
    return createCorsResponse({
      status: 'error',
      message: error.toString()
    });
  }
}

// ========================================
// 5. 기존 시트 업데이트 함수 (호환성 유지)
// ========================================

function updateSheetData(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const dataSheet = sheet.getSheetByName('Virtual_Table_Play');

    if (!dataSheet) {
      throw new Error('Virtual_Table_Play 시트를 찾을 수 없습니다');
    }

    // 데이터 업데이트
    if (data.row && data.column && data.value !== undefined) {
      const range = dataSheet.getRange(data.row, data.column);
      range.setValue(data.value);

      // 새로운 checksum 생성
      const newChecksum = getChecksumOnly();

      return {
        status: 'success',
        message: '데이터 업데이트 완료',
        newChecksum: newChecksum.checksum,
        timestamp: new Date().toISOString()
      };
    }

    return {
      status: 'error',
      message: '유효하지 않은 데이터'
    };

  } catch (error) {
    console.error('❌ 시트 업데이트 오류:', error);
    return {
      status: 'error',
      message: error.toString()
    };
  }
}

// ========================================
// 6. 테스트 함수
// ========================================

function testChecksumFunctions() {
  console.log('=== Checksum 기능 테스트 시작 ===');

  // 1. 전체 checksum 테스트
  const checksumOnly = getChecksumOnly();
  console.log('1. Checksum Only:', checksumOnly);

  // 2. 동일 데이터 checksum 확인
  const checksum2 = getChecksumOnly();
  console.log('2. 동일 데이터 checksum 일치:', checksumOnly.checksum === checksum2.checksum);

  // 3. 데이터와 함께 조회
  const dataWithChecksum = getDataWithChecksum(null);
  console.log('3. 데이터 포함 조회:', {
    changed: dataWithChecksum.changed,
    dataSize: dataWithChecksum.data ? dataWithChecksum.data.length : 0
  });

  // 4. 변경 없음 확인
  const noChange = getDataWithChecksum(dataWithChecksum.checksum);
  console.log('4. 변경 없음 확인:', noChange.changed === false);

  // 5. 다중 범위 checksum
  const multiChecksums = getMultiRangeChecksums();
  console.log('5. 다중 범위 checksums:', Object.keys(multiChecksums.checksums));

  console.log('=== 테스트 완료 ===');
}

// ========================================
// 7. 성능 벤치마크
// ========================================

function benchmarkChecksum() {
  const iterations = 10;
  let totalTime = 0;

  console.log(`=== Checksum 성능 벤치마크 (${iterations}회) ===`);

  for (let i = 0; i < iterations; i++) {
    const start = new Date().getTime();
    getChecksumOnly();
    const elapsed = new Date().getTime() - start;
    totalTime += elapsed;
    console.log(`  반복 ${i + 1}: ${elapsed}ms`);
  }

  console.log(`평균 시간: ${(totalTime / iterations).toFixed(2)}ms`);
  console.log('=== 벤치마크 완료 ===');
}