/**
 * Google Sheets API v4 직접 연동 서비스
 * Apps Script를 대체하여 서버 사이드에서 안전하게 Google Sheets 조작
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

interface SheetsConfig {
  credentialsPath: string;
  spreadsheetId: string;
}

interface UpdateRequest {
  rowNumber: number;
  handNumber?: string;
  filename?: string;
  aiAnalysis?: string;
  status?: '미완료' | '복사완료';
  timestamp?: string;
}

// BatchUpdateRequest interface for future use
// interface BatchUpdateRequest {
//   updates: {
//     row: number;
//     values: any[];
//   }[];
// }

export class GoogleSheetsService {
  private sheets: any;
  private auth: any;
  private config: SheetsConfig;

  constructor(config: SheetsConfig) {
    this.config = config;
    this.initializeAuth();
  }

  /**
   * Google Sheets API 인증 초기화
   */
  private async initializeAuth() {
    try {
      // Service Account 키 파일 로드
      const credentialsPath = path.resolve(this.config.credentialsPath);

      if (!fs.existsSync(credentialsPath)) {
        throw new Error(`Credentials 파일을 찾을 수 없습니다: ${credentialsPath}`);
      }

      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

      // JWT 인증 설정
      this.auth = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive.file'
        ]
      });

      // Sheets API 클라이언트 생성
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });

      console.log('✅ Google Sheets API 인증 성공');
    } catch (error) {
      console.error('❌ Google Sheets API 인증 실패:', error);
      throw error;
    }
  }

  /**
   * 연결 테스트
   */
  async testConnection(): Promise<{ status: string; message: string; data?: any }> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.config.spreadsheetId,
      });

      return {
        status: 'success',
        message: '연결 테스트 성공',
        data: {
          title: response.data.properties?.title,
          sheetCount: response.data.sheets?.length,
          spreadsheetId: this.config.spreadsheetId
        }
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: `연결 테스트 실패: ${error.message}`
      };
    }
  }

  /**
   * 시트의 특정 행 데이터 읽기
   */
  async getRowData(sheetName: string, rowNumber: number): Promise<any[]> {
    try {
      const range = `${sheetName}!A${rowNumber}:I${rowNumber}`;

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range: range,
      });

      return response.data.values?.[0] || [];
    } catch (error: any) {
      console.error('행 데이터 읽기 실패:', error);
      throw new Error(`행 데이터 읽기 실패: ${error.message}`);
    }
  }

  /**
   * 시트의 범위 데이터 읽기 (일괄 처리용)
   */
  async getRangeData(sheetName: string, startRow: number, endRow: number): Promise<any[][]> {
    try {
      const range = `${sheetName}!A${startRow}:I${endRow}`;

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range: range,
      });

      return response.data.values || [];
    } catch (error: any) {
      console.error('범위 데이터 읽기 실패:', error);
      throw new Error(`범위 데이터 읽기 실패: ${error.message}`);
    }
  }

  /**
   * 시트 업데이트 (기존 Apps Script handleSheetUpdate 대체)
   */
  async updateSheet(sheetName: string, updateData: UpdateRequest): Promise<any> {
    try {
      const {
        rowNumber,
        handNumber,
        filename,
        aiAnalysis,
        status = '미완료'
      } = updateData;

      console.log(`🔄 시트 업데이트 시작: ${sheetName} 행 ${rowNumber}`);

      // 업데이트할 값들 준비
      const updates: any[] = [];
      const updateTime = new Date().toISOString();

      // D열: 핸드 번호
      if (handNumber) {
        updates.push({
          range: `${sheetName}!D${rowNumber}`,
          values: [[handNumber]]
        });
      }

      // E열: 상태값 (드롭다운 검증)
      if (status === '미완료' || status === '복사완료') {
        updates.push({
          range: `${sheetName}!E${rowNumber}`,
          values: [[status]]
        });
      }

      // F열: 파일명
      if (filename) {
        updates.push({
          range: `${sheetName}!F${rowNumber}`,
          values: [[filename]]
        });
      }

      // H열: AI 분석
      if (aiAnalysis) {
        updates.push({
          range: `${sheetName}!H${rowNumber}`,
          values: [[aiAnalysis]]
        });
      }

      // I열: 업데이트 시간
      updates.push({
        range: `${sheetName}!I${rowNumber}`,
        values: [[updateTime]]
      });

      // 일괄 업데이트 실행
      if (updates.length > 0) {
        await this.sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: this.config.spreadsheetId,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: updates
          }
        });
      }

      console.log(`✅ 시트 업데이트 완료: ${updates.length}개 필드`);

      return {
        status: 'success',
        message: '시트 업데이트 완료',
        data: {
          sheetName,
          rowNumber,
          updatedFields: updates.length,
          filename,
          aiAnalysis: aiAnalysis || '기본 분석',
          updatedAt: updateTime
        }
      };

    } catch (error: any) {
      console.error('❌ 시트 업데이트 오류:', error);
      return {
        status: 'error',
        message: `시트 업데이트 실패: ${error.message}`,
        details: error.code || 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * 일괄 상태 확인 (기존 Apps Script handleBatchVerify 대체)
   */
  async batchVerify(sheetName: string, rows: number[]): Promise<any> {
    try {
      console.log(`🚀 일괄 상태 확인 시작: ${rows.length}개 행`);
      const startTime = Date.now();

      const minRow = Math.min(...rows);
      const maxRow = Math.max(...rows);

      // 범위 데이터를 한 번에 가져오기 (성능 최적화)
      const rangeData = await this.getRangeData(sheetName, minRow, maxRow);

      // 결과 객체 생성
      const results: { [key: number]: any } = {};

      rows.forEach(rowNum => {
        const rowIndex = rowNum - minRow;
        const rowData = rangeData[rowIndex] || [];

        results[rowNum] = {
          row: rowNum,
          time: rowData[1] || '',        // B열: 시간
          status: rowData[4] || '',       // E열: 상태
          filename: rowData[5] || '',     // F열: 파일명
          analysis: rowData[7] || '',     // H열: AI 분석
          lastUpdate: rowData[8] || ''    // I열: 업데이트 시간
        };
      });

      const duration = Date.now() - startTime;
      console.log(`✅ 일괄 확인 완료: ${duration}ms`);

      return {
        status: 'success',
        message: `${rows.length}개 행 일괄 확인 완료`,
        data: results,
        performance: {
          duration,
          rowsChecked: rows.length,
          avgTimePerRow: Math.round(duration / rows.length)
        }
      };

    } catch (error: any) {
      console.error('❌ 일괄 확인 오류:', error);
      return {
        status: 'error',
        message: `일괄 확인 실패: ${error.message}`
      };
    }
  }

  /**
   * 핸드 상태 확인 (타임스탬프 기반 검색)
   */
  async getHandStatus(sheetName: string, handNumber: string, handTime: number): Promise<any> {
    try {
      console.log(`🔍 핸드 상태 확인: ${handNumber} (${handTime})`);

      // B열(시간)과 E열(상태) 데이터 가져오기
      const range = `${sheetName}!B:E`;
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range: range,
      });

      const values = response.data.values || [];
      const targetTime = parseInt(handTime.toString());

      // 타임스탬프로 매칭 (±180초 허용)
      let matchedRow = null;
      let matchedStatus = '';

      for (let i = 0; i < values.length; i++) {
        const timeValue = values[i][0]; // B열
        if (!timeValue) continue;

        let timestamp: number;
        if (typeof timeValue === 'number') {
          timestamp = timeValue;
        } else if (timeValue instanceof Date) {
          timestamp = Math.floor(timeValue.getTime() / 1000);
        } else {
          const parsed = parseInt(timeValue.toString());
          if (!isNaN(parsed)) {
            timestamp = parsed;
          } else {
            continue;
          }
        }

        // 시간 차이 확인 (±180초)
        const timeDiff = Math.abs(timestamp - targetTime);
        if (timeDiff <= 180) {
          matchedRow = i + 1;
          matchedStatus = values[i][3] || ''; // E열
          console.log(`✅ 매칭 성공: 행 ${matchedRow}, 상태: "${matchedStatus}"`);
          break;
        }
      }

      if (!matchedRow) {
        return {
          status: 'not_found',
          message: '해당 핸드를 찾을 수 없습니다',
          handNumber: handNumber,
          searchedTime: targetTime
        };
      }

      // 상태 정규화
      let normalizedStatus = '';
      if (matchedStatus === '미완료' || matchedStatus === '"미완료"') {
        normalizedStatus = '미완료';
      } else if (matchedStatus === '복사완료' || matchedStatus === '"복사완료"') {
        normalizedStatus = '복사완료';
      } else if (!matchedStatus || matchedStatus.trim() === '') {
        normalizedStatus = '';
      } else {
        normalizedStatus = matchedStatus.trim();
      }

      return {
        status: 'success',
        data: {
          handNumber: handNumber,
          row: matchedRow,
          handStatus: normalizedStatus,
          rawStatus: matchedStatus,
          checkedAt: new Date().toISOString()
        }
      };

    } catch (error: any) {
      console.error('❌ 핸드 상태 확인 오류:', error);
      return {
        status: 'error',
        message: `핸드 상태 확인 실패: ${error.message}`
      };
    }
  }

  /**
   * 인덱스 시트 업데이트
   */
  async updateIndexSheet(indexSheetName: string, handNumber: string, filename: string): Promise<any> {
    try {
      console.log(`📝 Index 시트 업데이트: ${handNumber}`);

      // A열에서 핸드 번호 검색
      const range = `${indexSheetName}!A:A`;
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range: range,
      });

      const values = response.data.values || [];
      let foundRow = -1;

      for (let i = 0; i < values.length; i++) {
        const cellValue = values[i][0];
        if (cellValue && cellValue.toString().includes(handNumber)) {
          foundRow = i + 1;
          console.log(`✅ 핸드 번호 발견: 행 ${foundRow}`);
          break;
        }
      }

      if (foundRow === -1) {
        throw new Error(`핸드 번호 "${handNumber}"를 찾을 수 없습니다`);
      }

      // E열에 파일명 업데이트
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.config.spreadsheetId,
        range: `${indexSheetName}!E${foundRow}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[filename]]
        }
      });

      console.log(`✅ Index 시트 E${foundRow} 업데이트: "${filename}"`);

      return {
        sheetName: indexSheetName,
        rowNumber: foundRow,
        handNumber: handNumber,
        filename: filename,
        updatedAt: new Date().toISOString()
      };

    } catch (error: any) {
      console.error('❌ Index 시트 업데이트 오류:', error);
      throw error;
    }
  }

  /**
   * 시트 정보 조회
   */
  async getSpreadsheetInfo(): Promise<any> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.config.spreadsheetId,
      });

      return {
        status: 'success',
        data: {
          title: response.data.properties?.title,
          locale: response.data.properties?.locale,
          timeZone: response.data.properties?.timeZone,
          sheets: response.data.sheets?.map((sheet: any) => ({
            title: sheet.properties?.title,
            sheetId: sheet.properties?.sheetId,
            rowCount: sheet.properties?.gridProperties?.rowCount,
            columnCount: sheet.properties?.gridProperties?.columnCount
          }))
        }
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: `스프레드시트 정보 조회 실패: ${error.message}`
      };
    }
  }
}

export default GoogleSheetsService;