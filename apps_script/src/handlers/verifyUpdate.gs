var HandlerVerifyUpdate = (function() {
  function handle(payload) {
    try {
      if (!payload.sheetUrl) throw new Error('sheetUrl 필요');
      if (!payload.rowNumber) throw new Error('rowNumber 필요');
      var row = parseInt(payload.rowNumber, 10);
      var sheet = CoreSheets.openSheetByUrl(payload.sheetUrl);
      var values = sheet.getRange(row, 1, 1, 10).getValues()[0];
      return CoreResponses.success({
        columnD: values[3],
        columnE: values[4],
        columnF: values[5],
        columnH: values[7],
        columnI: values[8]
      }, '검증 완료');
    } catch (error) {
      CoreLogging.error('verifyUpdate 실패', error);
      return CoreResponses.error(error.message || 'verifyUpdate 실패', { statusCode: 400 });
    }
  }

  return {
    handle: handle
  };
})();
