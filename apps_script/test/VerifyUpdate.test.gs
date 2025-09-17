function testVerifyUpdateReturnsColumns() {
  const sheetMock = {
    getRange: function(row, col, numRows, numCols) {
      return {
        getValues: function() {
          return [[ 'a', 'b', 'c', 'HAND1234', '복사완료', 'HAND1234_Alex.mp4', '', '요약', new Date().toISOString() ]];
        }
      };
    }
  };
  globalThis.CoreSheets = { openSheetByUrl: () => sheetMock };
  const response = HandlerVerifyUpdate.handle({ sheetUrl: 'mock', rowNumber: 10 });
  console.log(JSON.stringify(response.getContent ? JSON.parse(response.getContent()) : response));
}
