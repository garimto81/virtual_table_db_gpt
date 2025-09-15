// Virtual Table DB - Google Apps Script v3.2 (간소화 버전)
// F열(파일명)과 H열(AI 분석)만 업데이트

// ========================================
// 1. 기본 설정
// ========================================
const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || '';

// ========================================
// 2. CORS 응답 생성
// ========================================
function createCorsResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========================================
// 3. HTTP 메소드 핸들러
// ========================================

// GET 요청 처리
function doGet(e) {
  console.log('📥 GET 요청 수신');
  
  const response = {
    status: 'ok',
    method: 'GET',
    time: new Date().toISOString(),
    version: 'v3.2-simple',
    service: 'Virtual Table Sheet Updater (Simple)',
    message: '서비스가 정상 작동 중입니다',
    cors: 'enabled'
  };
  
  return createCorsResponse(response);
}

// POST 요청 처리
function doPost(e) {
  console.log('📥 POST 요청 수신');
  console.log('📥 Raw postData:', e.postData);
  
  try {
    // 요청 데이터 파싱
    let requestData = {};
    
    // text/plain 처리 (CORS 회피용)
    if (e.postData) {
      console.log('📥 postData type:', e.postData.type);
      console.log('📥 postData contents:', e.postData.contents);
      
      try {
        requestData = JSON.parse(e.postData.contents);
        console.log('✅ JSON 파싱 성공:', JSON.stringify(requestData));
      } catch (parseError) {
        console.error('❌ JSON 파싱 실패:', parseError);
        return createCorsResponse({
          status: 'error',
          message: 'JSON 파싱 실패: ' + parseError.toString(),
          receivedData: e.postData.contents
        });
      }
    }
    
    // 액션 라우팅
    const action = requestData.action || 'unknown';
    console.log('📋 액션:', action);
    
    let result;
    
    switch(action) {
      case 'updateSheet':
        result = handleSheetUpdate(requestData);
        break;
        
      case 'test':
        result = {
          status: 'success',
          message: 'Apps Script 연결 성공!',
          timestamp: new Date().toISOString(),
          version: 'v3.2-simple',
          receivedData: requestData
        };
        break;
        
      default:
        result = {
          status: 'error',
          message: `알 수 없는 액션: ${action}`,
          availableActions: ['updateSheet', 'test']
        };
    }
    
    console.log('📤 응답:', JSON.stringify(result));
    return createCorsResponse(result);
    
  } catch (error) {
    console.error('❌ POST 처리 오류:', error);
    console.error('❌ 오류 스택:', error.stack);
    return createCorsResponse({
      status: 'error',
      message: error.toString(),
      stack: error.stack
    });
  }
}

// ========================================
// 4. 시트 업데이트 핸들러 (간소화)
// ========================================
function handleSheetUpdate(data) {
  console.log('🔄 시트 업데이트 시작...');
  console.log('📋 받은 데이터:', JSON.stringify(data));
  
  try {
    const {
      sheetUrl,
      rowNumber,
      filename,
      aiAnalysis
    } = data;
    
    // 필수 데이터 검증
    if (!sheetUrl) {
      console.error('❌ 시트 URL 없음');
      return {
        status: 'error',
        message: '시트 URL이 필요합니다'
      };
    }
    
    if (!rowNumber || isNaN(parseInt(rowNumber))) {
      console.error('❌ 잘못된 행 번호:', rowNumber);
      return {
        status: 'error',
        message: '유효한 행 번호가 필요합니다'
      };
    }
    
    if (!filename || !filename.trim()) {
      console.error('❌ 파일명 없음');
      return {
        status: 'error',
        message: '파일명이 필요합니다'
      };
    }
    
    console.log(`📊 업데이트 정보:
      - 시트 URL: ${sheetUrl}
      - 행 번호: ${rowNumber}
      - 파일명: ${filename}
      - AI 분석: ${aiAnalysis ? '있음' : '없음'}`);
    
    // 시트 열기
    const sheet = openSheetByUrl(sheetUrl);
    if (!sheet) {
      console.error('❌ 시트를 열 수 없음');
      return {
        status: 'error',
        message: '시트를 열 수 없습니다. URL과 권한을 확인하세요.'
      };
    }
    
    const targetRow = parseInt(rowNumber);
    console.log(`📋 시트 이름: "${sheet.getName()}", 대상 행: ${targetRow}`);
    
    // 시트 권한 확인
    try {
      const testRange = sheet.getRange(1, 1);
      testRange.getValue(); // 읽기 권한 테스트
      console.log('✅ 시트 읽기 권한 확인');
    } catch (permError) {
      console.error('❌ 시트 읽기 권한 없음:', permError);
      return {
        status: 'error',
        message: '시트 읽기 권한이 없습니다'
      };
    }
    
    // 최대 행 수 확인
    const maxRow = sheet.getMaxRows();
    console.log(`📊 현재 최대 행: ${maxRow}`);
    
    if (targetRow > maxRow) {
      // 행 추가
      const rowsToAdd = targetRow - maxRow;
      sheet.insertRowsAfter(maxRow, rowsToAdd);
      console.log(`📝 ${rowsToAdd}개 행 추가`);
    }
    
    // 데이터 업데이트 (F열과 H열만)
    const updates = [];
    const updateTime = new Date();
    
    try {
      // F열 (6번째 열): 파일명
      console.log(`📝 F열(6) 업데이트: "${filename}"`);
      const rangeF = sheet.getRange(targetRow, 6);
      rangeF.setValue(filename);
      updates.push('F열(파일명)');
      console.log('✅ F열 업데이트 성공');
      
      // H열 (8번째 열): AI 분석
      let finalAnalysis = aiAnalysis || `파일: ${filename}\n시간: ${updateTime.toLocaleString('ko-KR')}`;
      console.log(`📝 H열(8) 업데이트: "${finalAnalysis}"`);
      const rangeH = sheet.getRange(targetRow, 8);
      rangeH.setValue(finalAnalysis);
      updates.push('H열(AI분석)');
      console.log('✅ H열 업데이트 성공');
      
      // 변경사항 저장
      SpreadsheetApp.flush();
      console.log('✅ 변경사항 저장 완료');
      
      // 업데이트 확인
      const verifyF = sheet.getRange(targetRow, 6).getValue();
      const verifyH = sheet.getRange(targetRow, 8).getValue();
      console.log('🔍 검증 - F열:', verifyF);
      console.log('🔍 검증 - H열:', verifyH);
      
      if (verifyF !== filename) {
        console.error('⚠️ F열 검증 실패');
      }
      
    } catch (cellError) {
      console.error('❌ 셀 업데이트 오류:', cellError);
      console.error('❌ 오류 상세:', cellError.stack);
      return {
        status: 'error',
        message: `셀 업데이트 실패: ${cellError.toString()}`,
        updates: updates,
        errorDetails: cellError.stack
      };
    }
    
    console.log(`✅ 시트 업데이트 완료: ${updates.join(', ')}`);
    
    return {
      status: 'success',
      message: '시트 업데이트 완료',
      data: {
        sheetName: sheet.getName(),
        rowNumber: targetRow,
        updatedFields: updates,
        filename: filename,
        aiAnalysis: finalAnalysis,
        updatedAt: updateTime.toISOString()
      }
    };
    
  } catch (error) {
    console.error('❌ 시트 업데이트 오류:', error);
    console.error('❌ 오류 스택:', error.stack);
    return {
      status: 'error',
      message: error.toString(),
      details: '시트 접근 권한을 확인하세요',
      errorStack: error.stack
    };
  }
}

// ========================================
// 5. 유틸리티 함수
// ========================================
function openSheetByUrl(url) {
  try {
    console.log('🔗 시트 열기 시도:', url);
    
    // URL에서 시트 ID 추출
    const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!idMatch) {
      console.error('❌ 잘못된 시트 URL 형식');
      return null;
    }
    
    const spreadsheetId = idMatch[1];
    console.log('📋 스프레드시트 ID:', spreadsheetId);
    
    // 스프레드시트 열기
    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      console.log('✅ 스프레드시트 열기 성공');
    } catch (openError) {
      console.error('❌ 스프레드시트 열기 실패:', openError);
      console.error('❌ 권한이 없거나 ID가 잘못되었습니다');
      return null;
    }
    
    // GID가 있으면 해당 시트 선택
    const gidMatch = url.match(/[#&]gid=([0-9]+)/);
    if (gidMatch) {
      const gid = parseInt(gidMatch[1]);
      console.log('📋 GID:', gid);
      
      const sheets = spreadsheet.getSheets();
      for (const sheet of sheets) {
        if (sheet.getSheetId() === gid) {
          console.log('✅ 시트 찾음:', sheet.getName());
          return sheet;
        }
      }
      console.log('⚠️ GID에 해당하는 시트를 찾을 수 없음, 첫 번째 시트 사용');
    }
    
    // GID가 없으면 첫 번째 시트 반환
    const defaultSheet = spreadsheet.getSheets()[0];
    console.log('📋 기본 시트 사용:', defaultSheet.getName());
    return defaultSheet;
    
  } catch (error) {
    console.error('❌ 시트 열기 실패:', error);
    console.error('❌ 오류 상세:', error.stack);
    return null;
  }
}

// ========================================
// 6. 테스트 함수
// ========================================
function testDirectUpdate() {
  console.log('🧪 === 직접 테스트 시작 ===');
  
  // 여기에 실제 시트 URL을 입력하세요
  const TEST_SHEET_URL = 'YOUR_SHEET_URL_HERE';
  
  const testData = {
    action: 'updateSheet',
    sheetUrl: TEST_SHEET_URL,
    rowNumber: 2,
    filename: 'test_' + new Date().getTime() + '.mp4',
    aiAnalysis: '테스트 AI 분석 - ' + new Date().toLocaleString('ko-KR')
  };
  
  console.log('📋 테스트 데이터:', JSON.stringify(testData));
  
  const result = handleSheetUpdate(testData);
  console.log('📊 테스트 결과:', JSON.stringify(result));
  
  return result;
}

function testPermissions() {
  console.log('🔐 === 권한 테스트 ===');
  
  // 여기에 실제 시트 URL을 입력하세요
  const TEST_SHEET_URL = 'YOUR_SHEET_URL_HERE';
  
  try {
    const sheet = openSheetByUrl(TEST_SHEET_URL);
    if (!sheet) {
      console.error('❌ 시트를 열 수 없음');
      return false;
    }
    
    // 읽기 테스트
    const readTest = sheet.getRange(1, 1).getValue();
    console.log('✅ 읽기 권한 있음');
    
    // 쓰기 테스트
    const testValue = 'PERMISSION_TEST_' + Date.now();
    sheet.getRange(1, 1).setValue(testValue);
    SpreadsheetApp.flush();
    
    const verifyValue = sheet.getRange(1, 1).getValue();
    if (verifyValue === testValue) {
      console.log('✅ 쓰기 권한 있음');
      // 원래 값으로 복원
      sheet.getRange(1, 1).setValue(readTest);
      SpreadsheetApp.flush();
      return true;
    } else {
      console.error('❌ 쓰기 권한 없음');
      return false;
    }
    
  } catch (error) {
    console.error('❌ 권한 테스트 실패:', error);
    return false;
  }
}

// ========================================
// 7. 배포 정보
// ========================================
function getDeploymentInfo() {
  return {
    version: '3.2-simple',
    lastUpdated: '2025-09-15',
    description: 'F열과 H열만 업데이트하는 간소화 버전',
    features: [
      'F열(파일명)과 H열(AI분석)만 업데이트',
      '강화된 오류 처리 및 디버깅',
      '권한 검증 추가',
      'text/plain Content-Type 지원'
    ],
    notes: [
      '배포 시 "액세스: 모든 사용자" 설정 필수',
      '시트 편집 권한 필요',
      'F열 = 6번째 열, H열 = 8번째 열'
    ]
  };
}