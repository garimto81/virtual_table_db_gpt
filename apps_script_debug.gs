// 디버그 버전 - 실제 시트 업데이트 확인용

function testDirectSheetUpdate() {
  console.log('🔍 === 직접 시트 업데이트 테스트 시작 ===');
  
  // 테스트할 실제 시트 URL을 여기에 입력하세요
  const TEST_SHEET_URL = 'YOUR_ACTUAL_SHEET_URL_HERE';
  const TEST_ROW = 2;  // 테스트할 행 번호
  
  const testData = {
    sheetUrl: TEST_SHEET_URL,
    rowNumber: TEST_ROW,
    handNumber: 'DEBUG_' + new Date().getTime(),
    filename: 'debug_test_' + new Date().getTime() + '.mp4',
    aiAnalysis: '디버그 테스트 - ' + new Date().toLocaleString('ko-KR'),
    timestamp: new Date().toISOString()
  };
  
  console.log('📋 테스트 데이터:', JSON.stringify(testData, null, 2));
  
  try {
    // 1. 시트 열기 테스트
    console.log('\n1️⃣ 시트 열기 테스트...');
    const sheet = openSheetByUrl(testData.sheetUrl);
    
    if (!sheet) {
      console.error('❌ 시트를 열 수 없습니다!');
      return {
        success: false,
        error: '시트 열기 실패'
      };
    }
    
    console.log('✅ 시트 열기 성공');
    console.log('   - 시트 이름:', sheet.getName());
    console.log('   - 시트 ID:', sheet.getSheetId());
    console.log('   - 최대 행:', sheet.getMaxRows());
    console.log('   - 최대 열:', sheet.getMaxColumns());
    
    // 2. 현재 값 읽기
    console.log('\n2️⃣ 현재 값 읽기...');
    const targetRow = parseInt(testData.rowNumber);
    
    const currentValues = {
      D: sheet.getRange(targetRow, 4).getValue(),  // 핸드 번호
      E: sheet.getRange(targetRow, 5).getValue(),  // 파일명
      F: sheet.getRange(targetRow, 6).getValue(),  // 파일명(호환)
      H: sheet.getRange(targetRow, 8).getValue(),  // AI 분석
      I: sheet.getRange(targetRow, 9).getValue()   // 업데이트 시간
    };
    
    console.log('📖 현재 값들:');
    console.log('   D열 (핸드번호):', currentValues.D || '(비어있음)');
    console.log('   E열 (파일명):', currentValues.E || '(비어있음)');
    console.log('   F열 (파일명):', currentValues.F || '(비어있음)');
    console.log('   H열 (AI분석):', currentValues.H || '(비어있음)');
    console.log('   I열 (시간):', currentValues.I || '(비어있음)');
    
    // 3. 값 쓰기 테스트
    console.log('\n3️⃣ 값 쓰기 테스트...');
    const updates = [];
    
    try {
      // D열: 핸드 번호
      console.log('   D열 쓰기 중...');
      sheet.getRange(targetRow, 4).setValue(testData.handNumber);
      updates.push('D');
      
      // E열: 파일명
      console.log('   E열 쓰기 중...');
      sheet.getRange(targetRow, 5).setValue(testData.filename);
      updates.push('E');
      
      // F열: 파일명 (호환성)
      console.log('   F열 쓰기 중...');
      sheet.getRange(targetRow, 6).setValue(testData.filename);
      updates.push('F');
      
      // H열: AI 분석
      console.log('   H열 쓰기 중...');
      sheet.getRange(targetRow, 8).setValue(testData.aiAnalysis);
      updates.push('H');
      
      // I열: 업데이트 시간
      console.log('   I열 쓰기 중...');
      const updateTime = new Date();
      sheet.getRange(targetRow, 9).setValue(updateTime);
      updates.push('I');
      
      console.log('✅ 모든 값 쓰기 완료:', updates.join(', '));
      
    } catch (writeError) {
      console.error('❌ 값 쓰기 오류:', writeError);
      console.error('   오류 메시지:', writeError.message);
      console.error('   오류 스택:', writeError.stack);
      return {
        success: false,
        error: '값 쓰기 실패',
        details: writeError.toString()
      };
    }
    
    // 4. 변경사항 저장
    console.log('\n4️⃣ 변경사항 저장 중...');
    try {
      SpreadsheetApp.flush();
      console.log('✅ flush() 성공');
    } catch (flushError) {
      console.error('❌ flush() 오류:', flushError);
      return {
        success: false,
        error: 'flush 실패',
        details: flushError.toString()
      };
    }
    
    // 5. 값 재확인
    console.log('\n5️⃣ 업데이트된 값 확인...');
    const newValues = {
      D: sheet.getRange(targetRow, 4).getValue(),
      E: sheet.getRange(targetRow, 5).getValue(),
      F: sheet.getRange(targetRow, 6).getValue(),
      H: sheet.getRange(targetRow, 8).getValue(),
      I: sheet.getRange(targetRow, 9).getValue()
    };
    
    console.log('📗 새로운 값들:');
    console.log('   D열:', newValues.D);
    console.log('   E열:', newValues.E);
    console.log('   F열:', newValues.F);
    console.log('   H열:', newValues.H);
    console.log('   I열:', newValues.I);
    
    // 6. 변경 확인
    console.log('\n6️⃣ 변경 확인...');
    const changes = {
      D: newValues.D === testData.handNumber,
      E: newValues.E === testData.filename,
      F: newValues.F === testData.filename,
      H: newValues.H === testData.aiAnalysis,
      I: newValues.I !== currentValues.I  // 시간은 변경되어야 함
    };
    
    console.log('🔍 변경 성공 여부:');
    console.log('   D열:', changes.D ? '✅ 성공' : '❌ 실패');
    console.log('   E열:', changes.E ? '✅ 성공' : '❌ 실패');
    console.log('   F열:', changes.F ? '✅ 성공' : '❌ 실패');
    console.log('   H열:', changes.H ? '✅ 성공' : '❌ 실패');
    console.log('   I열:', changes.I ? '✅ 성공' : '❌ 실패');
    
    const allSuccess = Object.values(changes).every(v => v === true);
    
    if (allSuccess) {
      console.log('\n🎉 === 모든 테스트 성공! ===');
      return {
        success: true,
        message: '시트 업데이트 성공',
        updatedValues: newValues,
        sheetInfo: {
          name: sheet.getName(),
          id: sheet.getSheetId(),
          row: targetRow
        }
      };
    } else {
      console.log('\n⚠️ === 일부 업데이트 실패 ===');
      return {
        success: false,
        message: '일부 열 업데이트 실패',
        changes: changes,
        currentValues: newValues
      };
    }
    
  } catch (error) {
    console.error('\n❌ === 테스트 중 오류 발생 ===');
    console.error('오류:', error);
    console.error('메시지:', error.message);
    console.error('스택:', error.stack);
    
    return {
      success: false,
      error: error.toString(),
      stack: error.stack
    };
  }
}

// 권한 테스트 함수
function testSheetPermissions() {
  console.log('🔐 === 시트 권한 테스트 ===');
  
  const TEST_SHEET_URL = 'YOUR_ACTUAL_SHEET_URL_HERE';
  
  try {
    // URL에서 ID 추출
    const idMatch = TEST_SHEET_URL.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!idMatch) {
      console.error('❌ 잘못된 URL 형식');
      return false;
    }
    
    const spreadsheetId = idMatch[1];
    console.log('📋 스프레드시트 ID:', spreadsheetId);
    
    // 스프레드시트 열기
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    console.log('✅ 스프레드시트 열기 성공');
    console.log('   이름:', spreadsheet.getName());
    
    // 편집자 목록 확인
    const editors = spreadsheet.getEditors();
    console.log('👥 편집자 수:', editors.length);
    editors.forEach((editor, i) => {
      console.log(`   ${i + 1}. ${editor.getEmail()}`);
    });
    
    // 뷰어 목록 확인
    const viewers = spreadsheet.getViewers();
    console.log('👁️ 뷰어 수:', viewers.length);
    
    // 현재 사용자 확인
    const currentUser = Session.getActiveUser().getEmail();
    console.log('👤 현재 사용자:', currentUser || '(확인 불가)');
    
    // 쓰기 권한 테스트
    console.log('\n📝 쓰기 권한 테스트...');
    try {
      const testSheet = spreadsheet.getSheets()[0];
      const testCell = testSheet.getRange('Z1');
      const originalValue = testCell.getValue();
      
      testCell.setValue('PERMISSION_TEST_' + Date.now());
      SpreadsheetApp.flush();
      
      const newValue = testCell.getValue();
      if (newValue.startsWith('PERMISSION_TEST_')) {
        console.log('✅ 쓰기 권한 있음');
        // 원래 값으로 복원
        testCell.setValue(originalValue);
        SpreadsheetApp.flush();
        return true;
      } else {
        console.log('❌ 쓰기 권한 없음');
        return false;
      }
    } catch (writeError) {
      console.error('❌ 쓰기 권한 없음:', writeError.message);
      return false;
    }
    
  } catch (error) {
    console.error('❌ 권한 테스트 실패:', error);
    console.error('   메시지:', error.message);
    return false;
  }
}

// 시트 URL 분석 함수
function analyzeSheetUrl() {
  const TEST_URL = 'YOUR_ACTUAL_SHEET_URL_HERE';
  
  console.log('🔗 === URL 분석 ===');
  console.log('원본 URL:', TEST_URL);
  
  // ID 추출
  const idMatch = TEST_URL.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (idMatch) {
    console.log('✅ 스프레드시트 ID:', idMatch[1]);
  } else {
    console.log('❌ ID 추출 실패');
  }
  
  // GID 추출
  const gidMatch = TEST_URL.match(/[#&]gid=([0-9]+)/);
  if (gidMatch) {
    console.log('✅ 시트 GID:', gidMatch[1]);
  } else {
    console.log('⚠️ GID 없음 (기본 시트 사용)');
  }
  
  // 실제 시트 확인
  if (idMatch) {
    try {
      const spreadsheet = SpreadsheetApp.openById(idMatch[1]);
      const sheets = spreadsheet.getSheets();
      
      console.log('\n📑 시트 목록:');
      sheets.forEach((sheet, i) => {
        const sheetId = sheet.getSheetId();
        const isTarget = gidMatch && sheetId == gidMatch[1];
        console.log(`   ${i + 1}. "${sheet.getName()}" (GID: ${sheetId}) ${isTarget ? '← 타겟' : ''}`);
      });
      
      if (gidMatch) {
        const targetSheet = sheets.find(s => s.getSheetId() == gidMatch[1]);
        if (targetSheet) {
          console.log('\n✅ 타겟 시트 찾음:', targetSheet.getName());
        } else {
          console.log('\n❌ GID에 해당하는 시트 없음');
        }
      }
      
    } catch (error) {
      console.error('❌ 시트 열기 실패:', error.message);
    }
  }
}