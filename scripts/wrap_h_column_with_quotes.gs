/**
 * H열 데이터 큰따옴표 처리 스크립트 (1회용)
 *
 * 목적: CSV 멀티라인 문제 해결을 위해 H열(8번째 열)의 모든 데이터를
 *      큰따옴표로 감싸서 RFC 4180 표준을 준수하도록 변환
 *
 * 작성일: 2025-09-18
 * 버전: 1.0.0
 */

// ========================================
// 🎯 메인 실행 함수
// ========================================

/**
 * H열 데이터를 큰따옴표로 감싸는 메인 함수
 * 실행 전 반드시 백업을 만들어주세요!
 */
function wrapHColumnWithQuotes() {
  try {
    // 설정
    const SHEET_NAME = 'Virtual'; // 시트 이름 (필요시 수정)
    const START_ROW = 4;          // 시작 행 (4행부터)
    const COLUMN_H = 8;           // H열 (8번째 열)

    // 시트 가져오기
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error(`시트 "${SHEET_NAME}"를 찾을 수 없습니다.`);
    }

    // UI 사용 가능 여부 체크
    let ui = null;
    let userConfirmed = false;

    try {
      ui = SpreadsheetApp.getUi();
      const response = ui.alert(
        '⚠️ H열 데이터 변환 확인',
        `이 작업은 ${SHEET_NAME} 시트의 H열 데이터를 모두 큰따옴표로 감쌉니다.\n\n` +
        `✅ 시작 전 체크리스트:\n` +
        `1. 시트 백업을 만드셨나요?\n` +
        `2. 현재 시트가 "${SHEET_NAME}"가 맞나요?\n` +
        `3. 4행부터 처리하는 것이 맞나요?\n\n` +
        `계속하시겠습니까?`,
        ui.ButtonSet.YES_NO
      );

      if (response !== ui.Button.YES) {
        console.log('작업이 사용자에 의해 취소되었습니다.');
        return;
      }
      userConfirmed = true;
    } catch (e) {
      // UI를 사용할 수 없는 경우 (예: 스크립트 편집기에서 실행)
      console.log('⚠️ UI를 사용할 수 없습니다. 확인 없이 진행합니다.');
      console.log('💡 팁: Google Sheets에서 "🔧 H열 처리" 메뉴를 사용하면 확인 대화상자가 표시됩니다.');
      userConfirmed = true; // UI 없이 진행
    }

    // 마지막 행 찾기
    const lastRow = sheet.getLastRow();
    if (lastRow < START_ROW) {
      if (ui) {
        ui.alert(`데이터가 없습니다. (마지막 행: ${lastRow})`);
      } else {
        console.log(`데이터가 없습니다. (마지막 행: ${lastRow})`);
      }
      return;
    }

    // H열 데이터 가져오기
    const range = sheet.getRange(START_ROW, COLUMN_H, lastRow - START_ROW + 1, 1);
    const values = range.getValues();

    console.log(`📊 처리 시작: ${values.length}개 행`);

    // 처리 통계
    let processedCount = 0;
    let skippedCount = 0;
    let multilineCount = 0;

    // 각 셀 처리
    const processedValues = values.map((row, index) => {
      const cellValue = row[0];
      const rowNum = START_ROW + index;

      // 빈 셀은 건너뛰기
      if (cellValue === null || cellValue === undefined || cellValue === '') {
        skippedCount++;
        return [cellValue];
      }

      // 이미 큰따옴표로 시작하고 끝나는 경우 건너뛰기
      const stringValue = String(cellValue);
      if (stringValue.startsWith('"') && stringValue.endsWith('"')) {
        console.log(`행 ${rowNum}: 이미 큰따옴표로 묶여있음 - 건너뜀`);
        skippedCount++;
        return [cellValue];
      }

      // 멀티라인 확인
      if (stringValue.includes('\n') || stringValue.includes('\r')) {
        multilineCount++;
        console.log(`행 ${rowNum}: 멀티라인 데이터 발견`);
      }

      // 큰따옴표 처리
      // 1. 내부의 큰따옴표를 이스케이프 ("" → """")
      let processedValue = stringValue.replace(/"/g, '""');

      // 2. 전체를 큰따옴표로 감싸기
      processedValue = `"${processedValue}"`;

      processedCount++;
      console.log(`행 ${rowNum}: 처리 완료`);

      return [processedValue];
    });

    // 처리된 데이터 다시 쓰기
    if (processedCount > 0) {
      range.setValues(processedValues);

      // 결과 보고
      const message =
        `✅ H열 데이터 변환 완료!\n\n` +
        `📊 처리 결과:\n` +
        `• 전체 행: ${values.length}개\n` +
        `• 처리됨: ${processedCount}개\n` +
        `• 건너뜀: ${skippedCount}개\n` +
        `• 멀티라인: ${multilineCount}개\n\n` +
        `💡 다음 단계:\n` +
        `1. 변환된 데이터 확인\n` +
        `2. CSV로 다시 게시\n` +
        `3. 웹 애플리케이션에서 테스트`;

      if (ui) {
        ui.alert('성공', message, ui.ButtonSet.OK);
      } else {
        console.log(message);
      }

      // 로그 기록
      console.log('========================================');
      console.log('H열 데이터 변환 완료');
      console.log(`처리된 행: ${processedCount}`);
      console.log(`건너뛴 행: ${skippedCount}`);
      console.log(`멀티라인 데이터: ${multilineCount}`);
      console.log('========================================');

    } else {
      ui.alert('정보', '처리할 데이터가 없습니다.', ui.ButtonSet.OK);
    }

  } catch (error) {
    console.error('오류 발생:', error);
    SpreadsheetApp.getUi().alert(
      '오류',
      `작업 중 오류가 발생했습니다:\n${error.message}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

// ========================================
// 🔧 유틸리티 함수
// ========================================

/**
 * 변환 전 미리보기 (테스트용)
 * 실제 변경 없이 어떻게 변환될지 확인
 */
function previewHColumnTransformation() {
  try {
    const SHEET_NAME = 'Virtual';
    const START_ROW = 4;
    const COLUMN_H = 8;
    const PREVIEW_COUNT = 10; // 처음 10개만 미리보기

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error(`시트 "${SHEET_NAME}"를 찾을 수 없습니다.`);
    }

    const lastRow = Math.min(sheet.getLastRow(), START_ROW + PREVIEW_COUNT - 1);
    if (lastRow < START_ROW) {
      console.log('미리볼 데이터가 없습니다.');
      return;
    }

    const range = sheet.getRange(START_ROW, COLUMN_H, lastRow - START_ROW + 1, 1);
    const values = range.getValues();

    console.log('========================================');
    console.log('H열 변환 미리보기 (처음 10개)');
    console.log('========================================');

    values.forEach((row, index) => {
      const cellValue = row[0];
      const rowNum = START_ROW + index;

      if (cellValue === null || cellValue === undefined || cellValue === '') {
        console.log(`행 ${rowNum}: [빈 셀] → [변경 없음]`);
        return;
      }

      const stringValue = String(cellValue);

      // 변환 로직
      let processedValue = stringValue;
      if (!stringValue.startsWith('"') || !stringValue.endsWith('"')) {
        processedValue = `"${stringValue.replace(/"/g, '""')}"`;

        // 멀티라인 표시
        const hasMultiline = stringValue.includes('\n') || stringValue.includes('\r');
        const multilineTag = hasMultiline ? ' [멀티라인]' : '';

        console.log(`행 ${rowNum}${multilineTag}:`);
        console.log(`  원본: ${stringValue.substring(0, 50)}${stringValue.length > 50 ? '...' : ''}`);
        console.log(`  변환: ${processedValue.substring(0, 50)}${processedValue.length > 50 ? '...' : ''}`);
      } else {
        console.log(`행 ${rowNum}: [이미 큰따옴표] → [변경 없음]`);
      }
    });

    console.log('========================================');
    console.log('미리보기 완료');
    console.log('실제 변환하려면 wrapHColumnWithQuotes() 실행');
    console.log('========================================');

  } catch (error) {
    console.error('미리보기 오류:', error);
  }
}

/**
 * 변환 결과 되돌리기 (복구용)
 * 큰따옴표를 제거하여 원래 상태로 복구
 */
function unwrapHColumnQuotes() {
  try {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      '⚠️ H열 큰따옴표 제거 확인',
      '이 작업은 H열의 큰따옴표를 모두 제거합니다.\n\n' +
      '정말 실행하시겠습니까?',
      ui.ButtonSet.YES_NO
    );

    if (response !== ui.Button.YES) {
      ui.alert('작업이 취소되었습니다.');
      return;
    }

    const SHEET_NAME = 'Virtual';
    const START_ROW = 4;
    const COLUMN_H = 8;

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const lastRow = sheet.getLastRow();

    if (lastRow < START_ROW) {
      ui.alert('데이터가 없습니다.');
      return;
    }

    const range = sheet.getRange(START_ROW, COLUMN_H, lastRow - START_ROW + 1, 1);
    const values = range.getValues();

    let restoredCount = 0;

    const restoredValues = values.map((row, index) => {
      const cellValue = row[0];

      if (cellValue === null || cellValue === undefined || cellValue === '') {
        return [cellValue];
      }

      const stringValue = String(cellValue);

      // 큰따옴표로 시작하고 끝나는 경우만 처리
      if (stringValue.startsWith('"') && stringValue.endsWith('"')) {
        // 바깥쪽 큰따옴표 제거
        let restoredValue = stringValue.slice(1, -1);

        // 이스케이프된 큰따옴표 복원 ("" → ")
        restoredValue = restoredValue.replace(/""/g, '"');

        restoredCount++;
        return [restoredValue];
      }

      return [cellValue];
    });

    if (restoredCount > 0) {
      range.setValues(restoredValues);
      ui.alert('완료', `${restoredCount}개 셀의 큰따옴표가 제거되었습니다.`, ui.ButtonSet.OK);
    } else {
      ui.alert('정보', '제거할 큰따옴표가 없습니다.', ui.ButtonSet.OK);
    }

  } catch (error) {
    console.error('복구 오류:', error);
    SpreadsheetApp.getUi().alert('오류', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// ========================================
// 📊 통계 및 분석 함수
// ========================================

/**
 * H열 데이터 통계 분석
 */
function analyzeHColumnData() {
  try {
    const SHEET_NAME = 'Virtual';
    const START_ROW = 4;
    const COLUMN_H = 8;

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const lastRow = sheet.getLastRow();

    if (lastRow < START_ROW) {
      console.log('분석할 데이터가 없습니다.');
      return;
    }

    const range = sheet.getRange(START_ROW, COLUMN_H, lastRow - START_ROW + 1, 1);
    const values = range.getValues();

    let stats = {
      total: values.length,
      empty: 0,
      withQuotes: 0,
      withoutQuotes: 0,
      multiline: 0,
      maxLength: 0,
      avgLength: 0,
      totalLength: 0
    };

    values.forEach((row) => {
      const cellValue = row[0];

      if (cellValue === null || cellValue === undefined || cellValue === '') {
        stats.empty++;
        return;
      }

      const stringValue = String(cellValue);

      if (stringValue.startsWith('"') && stringValue.endsWith('"')) {
        stats.withQuotes++;
      } else {
        stats.withoutQuotes++;
      }

      if (stringValue.includes('\n') || stringValue.includes('\r')) {
        stats.multiline++;
      }

      stats.totalLength += stringValue.length;
      stats.maxLength = Math.max(stats.maxLength, stringValue.length);
    });

    stats.avgLength = stats.total > 0 ? Math.round(stats.totalLength / (stats.total - stats.empty)) : 0;

    console.log('========================================');
    console.log('H열 데이터 분석 결과');
    console.log('========================================');
    console.log(`전체 행: ${stats.total}`);
    console.log(`빈 셀: ${stats.empty}`);
    console.log(`큰따옴표 있음: ${stats.withQuotes}`);
    console.log(`큰따옴표 없음: ${stats.withoutQuotes}`);
    console.log(`멀티라인: ${stats.multiline}`);
    console.log(`최대 길이: ${stats.maxLength}`);
    console.log(`평균 길이: ${stats.avgLength}`);
    console.log('========================================');

    return stats;

  } catch (error) {
    console.error('분석 오류:', error);
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
  ui.createMenu('🔧 H열 처리')
    .addItem('📊 데이터 분석', 'analyzeHColumnData')
    .addItem('👀 변환 미리보기 (10개)', 'previewHColumnTransformation')
    .addSeparator()
    .addItem('✅ H열 큰따옴표 추가', 'wrapHColumnWithQuotes')
    .addItem('❌ H열 큰따옴표 제거', 'unwrapHColumnQuotes')
    .addToUi();
}