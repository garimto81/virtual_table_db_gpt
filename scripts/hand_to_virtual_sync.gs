/**
 * Hand 시트 → Virtual 시트 자동 동기화 스크립트
 *
 * 목적: Hand 시트에 있지만 Virtual 시트에 없는 데이터를 자동으로 등록
 *
 * 작성일: 2025-09-18
 * 버전: 1.0.0
 */

// ========================================
// 🔄 동기화 함수
// ========================================

/**
 * Hand 시트의 특정 핸드를 Virtual 시트에 등록
 * 클라이언트에서 호출하는 API 함수
 */
function registerToVirtual(params) {
  try {
    const handNumber = params.handNumber;
    const timestamp = params.timestamp;
    const data = params.data || {};

    console.log(`📝 Virtual 시트 등록 요청: 핸드 #${handNumber}`);

    // Virtual 시트 가져오기
    const virtualSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Virtual');
    if (!virtualSheet) {
      throw new Error('Virtual 시트를 찾을 수 없습니다');
    }

    // 이미 존재하는지 확인
    const existingRow = findHandInVirtual(virtualSheet, handNumber);
    if (existingRow > 0) {
      console.log(`ℹ️ 핸드 #${handNumber}는 이미 Virtual 시트에 존재 (행 ${existingRow})`);
      return {
        success: true,
        message: '이미 존재함',
        row: existingRow
      };
    }

    // 새 행 추가
    const lastRow = virtualSheet.getLastRow();
    const newRow = lastRow + 1;

    // 데이터 준비 (Virtual 시트 형식에 맞게)
    const rowData = [
      handNumber,                          // A열: 핸드 번호
      data.time || '',                      // B열: 시간
      '',                                    // C열: 플레이어 (선택사항)
      '',                                    // D열: 액션 (선택사항)
      '',                                    // E열: 상태 (초기값 빈 값)
      '',                                    // F열: 예비
      '',                                    // G열: 예비
      JSON.stringify(data) || ''            // H열: 상세 데이터 (JSON)
    ];

    // 행 추가
    virtualSheet.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);

    console.log(`✅ Virtual 시트에 핸드 #${handNumber} 등록 완료 (행 ${newRow})`);

    return {
      success: true,
      message: '등록 완료',
      row: newRow,
      data: rowData
    };

  } catch (error) {
    console.error('Virtual 시트 등록 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Virtual 시트에서 핸드 번호로 행 찾기
 */
function findHandInVirtual(sheet, handNumber) {
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();

  // 4행부터 검색 (헤더 제외)
  for (let i = 3; i < values.length; i++) {
    if (values[i][0] == handNumber) {  // A열이 핸드 번호
      return i + 1; // 행 번호 (1-based)
    }
  }

  return -1; // 찾지 못함
}

/**
 * Hand 시트와 Virtual 시트 전체 동기화
 * 일괄 처리용 (수동 실행 또는 스케줄)
 */
function syncAllHandsToVirtual() {
  try {
    console.log('========================================');
    console.log('🔄 Hand → Virtual 전체 동기화 시작');
    console.log('========================================');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const handSheet = ss.getSheetByName('Hand');
    const virtualSheet = ss.getSheetByName('Virtual');

    if (!handSheet || !virtualSheet) {
      throw new Error('Hand 또는 Virtual 시트를 찾을 수 없습니다');
    }

    // Hand 시트 데이터 가져오기
    const handData = handSheet.getDataRange().getValues();
    const virtualData = virtualSheet.getDataRange().getValues();

    // Virtual 시트의 핸드 번호 목록 생성 (빠른 검색용)
    const virtualHandNumbers = new Set();
    for (let i = 3; i < virtualData.length; i++) {  // 4행부터
      const handNum = virtualData[i][0];
      if (handNum) {
        virtualHandNumbers.add(String(handNum));
      }
    }

    console.log(`📊 현재 상태:`);
    console.log(`   Hand 시트: ${handData.length - 3}개 데이터`);
    console.log(`   Virtual 시트: ${virtualHandNumbers.size}개 데이터`);

    // 누락된 핸드 찾기 및 추가
    let addedCount = 0;
    const newRows = [];

    for (let i = 3; i < handData.length; i++) {  // 4행부터
      const handNumber = handData[i][0];  // A열: 핸드 번호
      const timestamp = handData[i][1];    // B열: 타임스탬프

      if (!handNumber) continue;

      // Virtual 시트에 없는 경우만 추가
      if (!virtualHandNumbers.has(String(handNumber))) {
        const time = timestamp ? new Date(timestamp).toTimeString().slice(0, 5) : '';

        // 17시 이후 데이터 확인
        const hour = parseInt(time.split(':')[0]);
        if (hour >= 17) {
          console.log(`🌙 17시 이후 데이터 발견: 핸드 #${handNumber} (${time})`);
        }

        const newRow = [
          handNumber,           // A열
          time,                 // B열
          handData[i][2] || '', // C열
          handData[i][3] || '', // D열
          '',                   // E열 (상태 - 초기값 빈 값)
          '',                   // F열
          '',                   // G열
          handData[i][7] || ''  // H열
        ];

        newRows.push(newRow);
        addedCount++;
      }
    }

    // 새 데이터 일괄 추가
    if (newRows.length > 0) {
      const lastRow = virtualSheet.getLastRow();
      virtualSheet.getRange(lastRow + 1, 1, newRows.length, 8).setValues(newRows);

      console.log('✅ 동기화 완료:');
      console.log(`   추가된 핸드: ${addedCount}개`);

      // 17시 이후 데이터 통계
      const after17 = newRows.filter(row => {
        const hour = parseInt(row[1].split(':')[0]);
        return hour >= 17 || hour <= 3;
      });
      console.log(`   17시 이후 데이터: ${after17.length}개`);

    } else {
      console.log('ℹ️ 추가할 새 데이터가 없습니다.');
    }

    console.log('========================================');

    return {
      success: true,
      added: addedCount,
      total: virtualHandNumbers.size + addedCount
    };

  } catch (error) {
    console.error('전체 동기화 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 특정 시간대의 핸드만 동기화
 * @param {number} startHour - 시작 시간 (예: 17)
 * @param {number} endHour - 종료 시간 (예: 23)
 */
function syncHandsByTimeRange(startHour = 17, endHour = 23) {
  try {
    console.log(`⏰ ${startHour}시 ~ ${endHour}시 데이터 동기화 시작`);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const handSheet = ss.getSheetByName('Hand');
    const virtualSheet = ss.getSheetByName('Virtual');

    const handData = handSheet.getDataRange().getValues();
    const virtualData = virtualSheet.getDataRange().getValues();

    // Virtual 시트의 핸드 번호 세트
    const virtualHandNumbers = new Set();
    for (let i = 3; i < virtualData.length; i++) {
      if (virtualData[i][0]) {
        virtualHandNumbers.add(String(virtualData[i][0]));
      }
    }

    const newRows = [];

    for (let i = 3; i < handData.length; i++) {
      const handNumber = handData[i][0];
      const timestamp = handData[i][1];

      if (!handNumber || !timestamp) continue;

      const time = new Date(timestamp).toTimeString().slice(0, 5);
      const hour = parseInt(time.split(':')[0]);

      // 지정된 시간대만 처리
      if (hour >= startHour && hour <= endHour) {
        if (!virtualHandNumbers.has(String(handNumber))) {
          const newRow = [
            handNumber,
            time,
            handData[i][2] || '',
            handData[i][3] || '',
            '',  // 상태
            '',
            '',
            handData[i][7] || ''
          ];

          newRows.push(newRow);
          console.log(`   추가: 핸드 #${handNumber} (${time})`);
        }
      }
    }

    if (newRows.length > 0) {
      const lastRow = virtualSheet.getLastRow();
      virtualSheet.getRange(lastRow + 1, 1, newRows.length, 8).setValues(newRows);
      console.log(`✅ ${newRows.length}개 핸드 추가 완료`);
    }

    return {
      success: true,
      added: newRows.length
    };

  } catch (error) {
    console.error('시간대별 동기화 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Virtual 시트 데이터 검증 및 정리
 */
function validateVirtualSheet() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Virtual');
    const data = sheet.getDataRange().getValues();

    let stats = {
      total: 0,
      withTime: 0,
      withoutTime: 0,
      after17: 0,
      duplicates: []
    };

    const handNumbers = new Map();

    for (let i = 3; i < data.length; i++) {
      const handNumber = data[i][0];
      const time = data[i][1];

      if (!handNumber) continue;

      stats.total++;

      // 시간 데이터 확인
      if (time) {
        stats.withTime++;
        const hour = parseInt(time.split(':')[0]);
        if (hour >= 17 || hour <= 3) {
          stats.after17++;
        }
      } else {
        stats.withoutTime++;
      }

      // 중복 확인
      if (handNumbers.has(handNumber)) {
        stats.duplicates.push({
          handNumber: handNumber,
          rows: [handNumbers.get(handNumber), i + 1]
        });
      }
      handNumbers.set(handNumber, i + 1);
    }

    console.log('📊 Virtual 시트 검증 결과:');
    console.log(`   전체: ${stats.total}개`);
    console.log(`   시간 있음: ${stats.withTime}개`);
    console.log(`   시간 없음: ${stats.withoutTime}개`);
    console.log(`   17시 이후: ${stats.after17}개`);
    console.log(`   중복: ${stats.duplicates.length}개`);

    if (stats.duplicates.length > 0) {
      console.log('⚠️ 중복된 핸드:');
      stats.duplicates.forEach(dup => {
        console.log(`   핸드 #${dup.handNumber}: 행 ${dup.rows.join(', ')}`);
      });
    }

    return stats;

  } catch (error) {
    console.error('검증 오류:', error);
    return null;
  }
}

// ========================================
// 📋 메뉴 추가 (선택사항)
// ========================================

/**
 * 스프레드시트 열릴 때 메뉴 추가
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();

  // 기존 메뉴가 있으면 추가
  try {
    ui.createMenu('🔄 동기화')
      .addItem('📊 Virtual 시트 검증', 'validateVirtualSheet')
      .addItem('🔄 전체 동기화 (Hand → Virtual)', 'syncAllHandsToVirtual')
      .addItem('🌙 17-23시 데이터만 동기화', 'sync17to23Hours')
      .addSeparator()
      .addItem('🧹 중복 제거', 'removeDuplicates')
      .addToUi();
  } catch (e) {
    // 메뉴 추가 실패 시 무시
  }
}

/**
 * 17-23시 데이터 동기화 (메뉴용)
 */
function sync17to23Hours() {
  syncHandsByTimeRange(17, 23);
}

/**
 * Virtual 시트 중복 제거
 */
function removeDuplicates() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Virtual');
    const data = sheet.getDataRange().getValues();

    const seen = new Set();
    const toDelete = [];

    for (let i = data.length - 1; i >= 3; i--) {  // 아래에서부터 확인
      const handNumber = data[i][0];
      if (handNumber && seen.has(String(handNumber))) {
        toDelete.push(i + 1);  // 행 번호
      }
      seen.add(String(handNumber));
    }

    if (toDelete.length > 0) {
      // 아래에서부터 삭제
      toDelete.forEach(row => {
        sheet.deleteRow(row);
      });
      console.log(`✅ ${toDelete.length}개 중복 행 제거`);
    } else {
      console.log('ℹ️ 중복된 행이 없습니다');
    }

  } catch (error) {
    console.error('중복 제거 오류:', error);
  }
}