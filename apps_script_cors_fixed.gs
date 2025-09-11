// Virtual Table DB - Google Apps Script (v9.5.1 CORS Fixed)
// CORS 문제 완전 해결 버전

// ========================================
// 1. 기본 설정 및 상수
// ========================================
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'; // Gemini API 키 설정 필요
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// ========================================
// 2. HTTP 요청 처리 (CORS 완전 지원)
// ========================================
function doOptions(e) {
  // OPTIONS 요청을 위한 별도 처리 (CORS Preflight)
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '3600'
    });
}

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    console.log('요청 받음:', JSON.stringify(e));
    
    // OPTIONS 요청 처리
    if (e.postData && e.postData.type === 'text/plain' && e.postData.contents === '') {
      return doOptions(e);
    }
    
    let payload = {};
    
    // 다양한 형식의 요청 처리
    if (e.postData) {
      if (e.postData.type === 'application/json') {
        payload = JSON.parse(e.postData.contents);
      } else if (e.postData.type === 'application/x-www-form-urlencoded') {
        payload = e.parameter.payload ? JSON.parse(e.parameter.payload) : e.parameter;
      } else if (e.postData.type === 'text/plain') {
        try {
          payload = JSON.parse(e.postData.contents);
        } catch {
          payload = { data: e.postData.contents };
        }
      }
    } else if (e.parameter) {
      payload = e.parameter;
    }
    
    // 액션 처리
    const result = processAction(payload);
    
    // CORS 헤더와 함께 응답 반환
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
      .addHeader('Access-Control-Allow-Origin', '*')
      .addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .addHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      
  } catch (error) {
    console.error('요청 처리 오류:', error);
    
    // 에러 응답도 CORS 헤더 포함
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      stack: error.stack
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .addHeader('Access-Control-Allow-Origin', '*')
      .addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .addHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }
}

// ========================================
// 3. 액션 처리 라우터
// ========================================
function processAction(payload) {
  console.log('액션 처리:', payload.action);
  
  try {
    switch(payload.action) {
      case 'updateSheet':
      case 'updateHand':  // 이전 버전 호환성
        return handleSheetUpdate(payload);
        
      case 'analyzeHand':
        return handleAnalyzeHand(payload);
        
      case 'updateIndex':
        return handleUpdateIndex(payload);
        
      case 'test':  // 테스트용
        return {
          success: true,
          message: 'Apps Script 연결 성공!',
          timestamp: new Date().toISOString(),
          receivedData: payload
        };
        
      default:
        return {
          success: false,
          error: '알 수 없는 액션: ' + payload.action,
          availableActions: ['updateSheet', 'updateHand', 'analyzeHand', 'updateIndex', 'test']
        };
    }
  } catch (error) {
    console.error('액션 처리 오류:', error);
    return {
      success: false,
      error: error.toString(),
      stack: error.stack
    };
  }
}

// ========================================
// 4. 시트 업데이트 처리
// ========================================
function handleSheetUpdate(payload) {
  console.log('시트 업데이트 시작:', payload);
  
  // 필수 필드 검증
  if (!payload.sheetUrl) {
    return {
      success: false,
      error: '시트 URL이 필요합니다'
    };
  }
  
  if (!payload.rowNumber && !payload.virtualRow) {
    return {
      success: false,
      error: '행 번호가 필요합니다'
    };
  }
  
  try {
    // 시트 열기
    const sheet = openSheetByUrl(payload.sheetUrl);
    if (!sheet) {
      return {
        success: false,
        error: '시트를 열 수 없습니다'
      };
    }
    
    // 행 번호 처리 (virtualRow 또는 rowNumber 사용)
    const row = payload.rowNumber || payload.virtualRow;
    console.log('업데이트할 행:', row);
    
    // AI 분석 내용 (aiAnalysis 또는 aiSummary 사용)
    const aiContent = payload.aiAnalysis || payload.aiSummary || '';
    
    // 데이터 업데이트
    const updates = [];
    
    // D열: 핸드 번호
    if (payload.handNumber) {
      sheet.getRange(row, 4).setValue(payload.handNumber);
      updates.push('핸드번호');
    }
    
    // E열: 파일명
    if (payload.filename) {
      sheet.getRange(row, 5).setValue(payload.filename);
      updates.push('파일명');
    }
    
    // F열: AI 분석
    if (aiContent) {
      sheet.getRange(row, 6).setValue(aiContent);
      updates.push('AI분석');
    }
    
    // G열: 타임스탬프 (선택사항)
    if (payload.timestamp) {
      sheet.getRange(row, 7).setValue(payload.timestamp);
      updates.push('타임스탬프');
    }
    
    // 변경사항 플러시
    SpreadsheetApp.flush();
    
    return {
      success: true,
      message: '시트 업데이트 완료',
      updatedFields: updates,
      row: row,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('시트 업데이트 오류:', error);
    return {
      success: false,
      error: error.toString(),
      details: '시트 접근 권한을 확인하세요'
    };
  }
}

// ========================================
// 5. AI 분석 처리
// ========================================
function handleAnalyzeHand(payload) {
  console.log('AI 분석 시작:', payload);
  
  if (!payload.handData) {
    return {
      success: false,
      error: '핸드 데이터가 필요합니다'
    };
  }
  
  try {
    // Gemini API 호출
    if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
      // API 키가 설정되지 않은 경우 기본 분석
      return {
        success: true,
        analysis: generateDefaultAnalysis(payload.handData),
        usingDefault: true
      };
    }
    
    const analysis = callGeminiAPI(payload.handData);
    
    return {
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('AI 분석 오류:', error);
    return {
      success: false,
      error: error.toString(),
      analysis: generateDefaultAnalysis(payload.handData)
    };
  }
}

// ========================================
// 6. Index 시트 업데이트
// ========================================
function handleUpdateIndex(payload) {
  console.log('Index 시트 업데이트:', payload);
  
  try {
    const sheet = openSheetByUrl(payload.sheetUrl);
    if (!sheet) {
      return {
        success: false,
        error: 'Index 시트를 열 수 없습니다'
      };
    }
    
    // 새 행 추가
    const lastRow = sheet.getLastRow();
    const newRow = lastRow + 1;
    
    // 데이터 입력
    const rowData = [
      payload.handNumber || '',
      payload.tableName || '',
      payload.filename || '',
      payload.timestamp || new Date().toISOString(),
      payload.status || 'COMPLETED'
    ];
    
    sheet.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);
    SpreadsheetApp.flush();
    
    return {
      success: true,
      message: 'Index 시트 업데이트 완료',
      row: newRow
    };
    
  } catch (error) {
    console.error('Index 업데이트 오류:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ========================================
// 7. 유틸리티 함수들
// ========================================
function openSheetByUrl(url) {
  try {
    console.log('시트 열기 시도:', url);
    
    // URL에서 시트 ID 추출
    const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!idMatch) {
      console.error('잘못된 시트 URL 형식');
      return null;
    }
    
    const spreadsheetId = idMatch[1];
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    
    // GID가 있으면 해당 시트 선택
    const gidMatch = url.match(/[#&]gid=([0-9]+)/);
    if (gidMatch) {
      const gid = parseInt(gidMatch[1]);
      const sheets = spreadsheet.getSheets();
      for (const sheet of sheets) {
        if (sheet.getSheetId() === gid) {
          console.log('시트 찾음:', sheet.getName());
          return sheet;
        }
      }
    }
    
    // GID가 없으면 첫 번째 시트 반환
    console.log('기본 시트 사용');
    return spreadsheet.getSheets()[0];
    
  } catch (error) {
    console.error('시트 열기 실패:', error);
    return null;
  }
}

function generateDefaultAnalysis(handData) {
  // 기본 AI 분석 생성
  const lines = [
    `핸드 #${handData.handNumber || 'N/A'} 분석`,
    `포트 크기: ${handData.potSize || '알 수 없음'}`,
    `승자: ${handData.winner || '확인 필요'}`
  ];
  
  return lines.join('\n');
}

function callGeminiAPI(handData) {
  // Gemini API 호출 로직
  const prompt = `포커 핸드를 3줄로 요약해주세요:\n${JSON.stringify(handData)}`;
  
  const response = UrlFetchApp.fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY
    },
    payload: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  });
  
  const result = JSON.parse(response.getContentText());
  return result.candidates[0].content.parts[0].text;
}

// ========================================
// 8. 테스트 함수
// ========================================
function testCORS() {
  // 브라우저 콘솔에서 테스트할 수 있는 함수
  const testUrl = 'YOUR_WEB_APP_URL_HERE';
  
  console.log('테스트 URL:', testUrl);
  console.log('다음 코드를 브라우저 콘솔에서 실행하세요:');
  console.log(`
fetch('${testUrl}', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    action: 'test',
    message: 'CORS 테스트'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
  `);
}

// ========================================
// 9. 배포 정보
// ========================================
function getDeploymentInfo() {
  return {
    version: '9.5.1',
    lastUpdated: '2025-01-11',
    description: 'CORS 문제 완전 해결 버전',
    author: 'Virtual Table DB Team',
    supportedActions: [
      'updateSheet - Virtual 시트 업데이트',
      'updateHand - 핸드 데이터 업데이트 (레거시)',
      'analyzeHand - AI 분석 실행',
      'updateIndex - Index 시트 업데이트',
      'test - 연결 테스트'
    ]
  };
}