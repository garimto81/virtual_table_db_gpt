function testUpdateSheetWritesStatusAndFilename() {
  const sheetMock = new MockSheet();
  const payload = {
    sheetUrl: 'https://docs.google.com/spreadsheets/d/mock/exec?gid=0',
    rowNumber: 5,
    filename: 'HAND1234_AlexKim.mp4',
    status: '복사완료',
    aiAnalysis: '테스트'
  };
  globalThis.CoreSheets = { openSheetByUrl: () => sheetMock };
  const response = HandlerUpdateSheet.handle(payload);
  console.log(JSON.stringify(response.getContent ? JSON.parse(response.getContent()) : response));
}

function MockSheet() {
  this.values = {};
  this.getRange = function(row, col) {
    const key = row + ':' + col;
    return {
      setValue: value => {
        this.values[key] = value;
      }
    };
  };
}
