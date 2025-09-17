var HandlerUpdateSheet = (function() {
  function handle(payload) {
    try {
      validatePayload(payload);
      var sheet = CoreSheets.openSheetByUrl(payload.sheetUrl);
      var row = parseInt(payload.rowNumber, 10);
      applyUpdates(sheet, row, payload);
      return CoreResponses.success({ rowNumber: row }, '시트 업데이트 완료');
    } catch (error) {
      CoreLogging.error('updateSheet 실패', error);
      return CoreResponses.error(error.message || 'updateSheet 실패', { statusCode: 400 });
    }
  }

  function validatePayload(payload) {
    if (!payload.sheetUrl) throw new Error('sheetUrl 필요');
    if (!payload.rowNumber) throw new Error('rowNumber 필요');
    if (!payload.filename) throw new Error('filename 필요');
  }

  function applyUpdates(sheet, rowNumber, payload) {
    if (payload.handNumber) {
      sheet.getRange(rowNumber, 4).setValue(payload.handNumber);
    }
    if (payload.status) {
      sheet.getRange(rowNumber, 5).setValue(payload.status);
    }
    sheet.getRange(rowNumber, 6).setValue(payload.filename);
    if (payload.aiAnalysis) {
      sheet.getRange(rowNumber, 8).setValue(payload.aiAnalysis);
    }
    sheet.getRange(rowNumber, 9).setValue(new Date());
  }

  return {
    handle: handle
  };
})();
