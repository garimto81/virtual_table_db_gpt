// Virtual Table DB - Google Apps Script (v9.5.0 호환)
// 기존 로직 유지하면서 CORS 및 호환성 개선

// ========================================
// 1. 기본 설정 및 상수
// ========================================
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'; // Gemini API 키 설정 필요
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// ========================================
// 2. HTTP 요청 처리 (CORS 지원)
// ========================================
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    console.log('요청 받음:', e);
    
    // CORS 헤더 설정
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    };
    
    // OPTIONS 요청 처리 (CORS preflight)
    if (e.postData && e.postData.type === 'application/x-www-form-urlencoded') {
      // FormData로 전송된 경우
      const payload = e.parameter.payload ? JSON.parse(e.parameter.payload) : {};
      return processAction(payload, headers);
    } else if (e.postData) {
      // JSON으로 전송된 경우
      const payload = JSON.parse(e.postData.contents);
      return processAction(payload, headers);
    } else if (e.parameter.action) {
      // GET 파라미터로 전송된 경우
      return processAction(e.parameter, headers);
    } else {
      // 기본 응답
      return createResponse({
        success: true,
        message: 'Apps Script 준비 완료',
        version: '9.5.0'
      }, headers);
    }
  } catch (error) {
    console.error('요청 처리 오류:', error);
    return createResponse({
      success: false,
      error: error.toString()
    }, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    });
  }
}

// ========================================
// 3. 액션 처리 라우터
// ========================================
function processAction(payload, headers) {
  console.log('액션 처리:', payload.action);
  
  try {
    switch(payload.action) {
      case 'updateSheet':
      case 'updateHand':  // 이전 버전 호환성
        return handleSheetUpdate(payload, headers);
        
      case 'analyzeHand':
        return handleAnalyzeHand(payload, headers);
        
      case 'updateIndex':
        return handleUpdateIndex(payload, headers);
        
      default:
        return createResponse({
          success: false,
          error: '알 수 없는 액션: ' + payload.action
        }, headers);
    }
  } catch (error) {
    console.error('액션 처리 오류:', error);
    return createResponse({
      success: false,
      error: error.toString()
    }, headers);
  }
}

// ========================================
// 4. 시트 업데이트 처리 (기존 로직 유지)
// ========================================
function handleSheetUpdate(payload, headers) {
  try {
    console.log('시트 업데이트 시작:', payload);
    
    // 필수 필드 검증
    if (!payload.sheetUrl || !payload.rowNumber) {
      return createResponse({
        success: false,
        error: '필수 정보가 누락되었습니다 (sheetUrl, rowNumber)'
      }, headers);
    }
    
    // 시트 열기
    const sheet = openSheetByUrl(payload.sheetUrl);
    if (!sheet) {
      return createResponse({
        success: false,
        error: '시트를 열 수 없습니다: ' + payload.sheetUrl
      }, headers);
    }
    
    // 행 번호 검증 (Apps Script는 1부터 시작)
    const rowNumber = parseInt(payload.rowNumber);
    if (isNaN(rowNumber) || rowNumber < 2) {  // 헤더 행 제외
      return createResponse({
        success: false,
        error: '유효하지 않은 행 번호: ' + payload.rowNumber
      }, headers);
    }
    
    // D열(핸드번호), E열(파일명), F열(AI분석) 업데이트
    const updates = [];
    
    if (payload.handNumber) {
      sheet.getRange(rowNumber, 4).setValue(payload.handNumber);  // D열
      updates.push('핸드번호');
    }
    
    if (payload.filename) {
      sheet.getRange(rowNumber, 5).setValue(payload.filename);    // E열
      updates.push('파일명');
    }
    
    if (payload.aiAnalysis || payload.aiSummary) {  // 두 이름 모두 지원
      const analysis = payload.aiAnalysis || payload.aiSummary;
      sheet.getRange(rowNumber, 6).setValue(analysis);           // F열
      updates.push('AI분석');
    }
    
    // 타임스탬프 업데이트 (선택적)
    if (payload.timestamp) {
      sheet.getRange(rowNumber, 7).setValue(payload.timestamp);  // G열
      updates.push('타임스탬프');
    }
    
    console.log('업데이트 완료:', updates.join(', '));
    
    return createResponse({
      success: true,
      status: 'success',
      message: '시트 업데이트 성공',
      updatedFields: updates,
      rowNumber: rowNumber
    }, headers);
    
  } catch (error) {
    console.error('시트 업데이트 오류:', error);
    return createResponse({
      success: false,
      error: '시트 업데이트 중 오류: ' + error.toString()
    }, headers);
  }
}

// ========================================
// 5. Gemini AI 분석 (기존 로직 유지)
// ========================================
function handleAnalyzeHand(payload, headers) {
  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
      return createResponse({
        success: false,
        error: 'Gemini API 키가 설정되지 않았습니다'
      }, headers);
    }
    
    const handData = payload.handData;
    if (!handData) {
      return createResponse({
        success: false,
        error: '핸드 데이터가 제공되지 않았습니다'
      }, headers);
    }
    
    // Gemini API 호출
    const prompt = `포커 핸드 분석: ${JSON.stringify(handData)}
    
    다음 형식으로 3줄 요약을 제공해주세요:
    1. 플레이어들의 핸드와 액션
    2. 보드 진행 상황
    3. 결과와 승자`;
    
    const geminiResponse = UrlFetchApp.fetch(GEMINI_API_URL + '?key=' + GEMINI_API_KEY, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });
    
    const result = JSON.parse(geminiResponse.getContentText());
    const analysis = result.candidates[0].content.parts[0].text;
    
    return createResponse({
      success: true,
      analysis: analysis
    }, headers);
    
  } catch (error) {
    console.error('Gemini 분석 오류:', error);
    return createResponse({
      success: false,
      error: 'AI 분석 중 오류: ' + error.toString()
    }, headers);
  }
}

// ========================================
// 6. 인덱스 시트 업데이트 (기존 로직 유지)
// ========================================
function handleUpdateIndex(payload, headers) {
  try {
    // 기존 updateIndexSheet 함수 호출
    const result = updateIndexSheet(
      payload.handNumber,
      payload.timestamp,
      payload.players,
      payload.winner,
      payload.pot
    );
    
    return createResponse({
      success: true,
      result: result
    }, headers);
    
  } catch (error) {
    console.error('인덱스 업데이트 오류:', error);
    return createResponse({
      success: false,
      error: '인덱스 업데이트 중 오류: ' + error.toString()
    }, headers);
  }
}

// ========================================
// 7. 기존 함수들 (호환성 유지)
// ========================================
function updateIndexSheet(handNumber, timestamp, players, winner, pot) {
  // 기존 로직 그대로 유지
  const indexSheetUrl = 'YOUR_INDEX_SHEET_URL';  // 설정 필요
  
  try {
    const sheet = openSheetByUrl(indexSheetUrl);
    if (!sheet) {
      throw new Error('인덱스 시트를 열 수 없습니다');
    }
    
    // 새 행 추가
    const lastRow = sheet.getLastRow();
    const newRow = lastRow + 1;
    
    // 데이터 삽입
    sheet.getRange(newRow, 1).setValue(handNumber);
    sheet.getRange(newRow, 2).setValue(timestamp);
    sheet.getRange(newRow, 3).setValue(players);
    sheet.getRange(newRow, 4).setValue(winner);
    sheet.getRange(newRow, 5).setValue(pot);
    
    return {
      success: true,
      row: newRow
    };
    
  } catch (error) {
    console.error('인덱스 시트 업데이트 오류:', error);
    throw error;
  }
}

// ========================================
// 8. 유틸리티 함수들
// ========================================
function openSheetByUrl(url) {
  try {
    // URL에서 스프레드시트 ID 추출
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      console.error('유효하지 않은 시트 URL:', url);
      return null;
    }
    
    const spreadsheetId = match[1];
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    
    // gid가 있으면 특정 시트 선택
    const gidMatch = url.match(/[#&]gid=([0-9]+)/);
    if (gidMatch) {
      const gid = parseInt(gidMatch[1]);
      const sheets = spreadsheet.getSheets();
      for (let sheet of sheets) {
        if (sheet.getSheetId() === gid) {
          return sheet;
        }
      }
    }
    
    // 기본적으로 첫 번째 시트 반환
    return spreadsheet.getSheets()[0];
    
  } catch (error) {
    console.error('시트 열기 오류:', error);
    return null;
  }
}

function createResponse(data, headers) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
}

// ========================================
// 9. 테스트 함수
// ========================================
function testSheetUpdate() {
  const testPayload = {
    action: 'updateSheet',
    sheetUrl: 'YOUR_SHEET_URL',  // 테스트용 시트 URL
    rowNumber: 2,
    handNumber: 'TEST-001',
    filename: 'test.csv',
    aiAnalysis: '테스트 분석 결과',
    timestamp: new Date().toISOString()
  };
  
  const result = handleSheetUpdate(testPayload, {});
  console.log('테스트 결과:', result);
}

// ========================================
// 10. 배포 설정 안내
// ========================================
/**
 * 배포 방법:
 * 1. Apps Script 에디터에서 이 코드 복사
 * 2. GEMINI_API_KEY 설정 (필요한 경우)
 * 3. 배포 > 새 배포
 * 4. 유형: 웹 앱
 * 5. 설명: Virtual Table DB v9.5.0
 * 6. 실행: 나
 * 7. 액세스 권한: 모든 사용자
 * 8. 배포 클릭
 * 9. 생성된 URL을 index.html의 SHEET_UPDATE_SCRIPT_URL에 입력
 * 
 * 주의사항:
 * - 코드 수정 후 반드시 "새 배포" 또는 "배포 관리"에서 버전 업데이트
 * - CORS 오류 발생 시 브라우저 캐시 삭제 후 재시도
 * - 시트 권한 확인 (Apps Script 실행 계정이 시트 편집 권한 필요)
 */