var CoreSheets = (function() {
  function openSheetByUrl(url) {
    if (!url) {
      throw new Error('시트 URL이 필요합니다');
    }
    var match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      throw new Error('올바른 Google Sheets URL이 아닙니다');
    }
    var spreadsheet = SpreadsheetApp.openById(match[1]);
    var gidMatch = url.match(/[?#&]gid=(\d+)/);
    if (gidMatch) {
      var gid = parseInt(gidMatch[1], 10);
      var sheets = spreadsheet.getSheets();
      for (var i = 0; i < sheets.length; i++) {
        if (sheets[i].getSheetId() === gid) {
          return sheets[i];
        }
      }
    }
    return spreadsheet.getSheets()[0];
  }

  return {
    openSheetByUrl: openSheetByUrl
  };
})();
