var HandlerUpdateIndex = (function() {
  function handle(payload) {
    try {
      if (!payload.sheetUrl) throw new Error('indexSheetUrl 필요');
      if (!payload.handNumber) throw new Error('handNumber 필요');
      var sheet = CoreSheets.openSheetByUrl(payload.sheetUrl);
      var row = findRow(sheet, payload.handNumber);
      if (row < 0) {
        throw new Error('핸드를 찾을 수 없습니다: ' + payload.handNumber);
      }
      if (payload.filename) {
        sheet.getRange(row, 5).setValue(payload.filename);
      }
      return CoreResponses.success({ rowNumber: row }, 'Index 업데이트 완료');
    } catch (error) {
      CoreLogging.error('updateIndex 실패', error);
      return CoreResponses.error(error.message || 'updateIndex 실패', { statusCode: 400 });
    }
  }

  function findRow(sheet, handNumber) {
    var values = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
    for (var i = 0; i < values.length; i++) {
      if (values[i][0] && values[i][0].toString().indexOf(handNumber) !== -1) {
        return i + 1;
      }
    }
    return -1;
  }

  return {
    handle: handle
  };
})();
