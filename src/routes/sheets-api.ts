/**
 * Google Sheets API 라우터
 * 기존 Apps Script 호출을 대체하는 RESTful API 엔드포인트
 */

import { Router, Request, Response } from 'express';
import GoogleSheetsService from '../services/google-sheets';
import * as path from 'path';

const router = Router();

// Google Sheets 서비스 인스턴스 생성
const createSheetsService = () => {
  const credentialsPath = process.env.GOOGLE_SHEETS_CREDENTIALS_PATH ||
                         path.join(process.cwd(), 'credentials', 'credentials.json');
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID || '';

  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEETS_ID 환경변수가 설정되지 않았습니다');
  }

  return new GoogleSheetsService({
    credentialsPath,
    spreadsheetId
  });
};

/**
 * 연결 테스트 - 기존 Apps Script의 GET 요청 대체
 */
router.get('/test', async (_req: Request, res: Response) => {
  try {
    const sheetsService = createSheetsService();
    const result = await sheetsService.testConnection();

    return res.json({
      status: 'ok',
      method: 'GET',
      time: new Date().toISOString(),
      version: 'v4.0.0-direct-api',
      service: 'Virtual Table Sheets API',
      features: ['Direct Google Sheets API', 'Service Account Auth', 'Secure Server-side'],
      message: '서비스가 정상 작동 중입니다 (Direct API)',
      result
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'connection_test_failed',
      details: error.message,
      service: 'Virtual Table Sheets API'
    });
  }
});

/**
 * 시트 업데이트 - 기존 Apps Script handleSheetUpdate 대체
 */
router.post('/update', async (req: Request, res: Response) => {
  try {
    const {
      sheetName = 'Virtual',  // 기본 시트명
      rowNumber,
      handNumber,
      filename,
      aiAnalysis,
      status,
      timestamp,
      indexSheetName
    } = req.body;

    // 필수 데이터 검증
    if (!rowNumber || isNaN(parseInt(rowNumber))) {
      return res.status(400).json({
        status: 'error',
        message: '유효한 행 번호가 필요합니다'
      });
    }

    if (!filename || !filename.trim()) {
      return res.status(400).json({
        status: 'error',
        message: '파일명이 필요합니다'
      });
    }

    const sheetsService = createSheetsService();

    // 메인 시트 업데이트
    const result = await sheetsService.updateSheet(sheetName, {
      rowNumber: parseInt(rowNumber),
      handNumber,
      filename,
      aiAnalysis,
      status,
      timestamp
    });

    // Index 시트 업데이트 (옵션)
    let indexResult = null;
    if (indexSheetName && handNumber) {
      try {
        indexResult = await sheetsService.updateIndexSheet(indexSheetName, handNumber, filename);
      } catch (indexError) {
        console.warn('Index 시트 업데이트 실패:', indexError);
        // Index 실패해도 메인 작업은 성공으로 처리
      }
    }

    return res.json({
      ...result,
      data: {
        ...result.data,
        indexUpdate: indexResult
      }
    });

  } catch (error: any) {
    console.error('❌ 시트 업데이트 API 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message,
      details: '시트 접근 권한을 확인하세요'
    });
  }
});

/**
 * 일괄 상태 확인 - 기존 Apps Script handleBatchVerify 대체
 */
router.post('/batch-verify', async (req: Request, res: Response) => {
  try {
    const { sheetName = 'Virtual', rows } = req.body;

    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({
        status: 'error',
        message: 'rows 배열이 필요합니다'
      });
    }

    const sheetsService = createSheetsService();
    const result = await sheetsService.batchVerify(sheetName, rows);

    return res.json(result);

  } catch (error: any) {
    console.error('❌ 일괄 확인 API 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * 핸드 상태 확인 - 기존 Apps Script handleGetHandStatus 대체
 */
router.post('/hand-status', async (req: Request, res: Response) => {
  try {
    const { sheetName = 'Virtual', handNumber, handTime } = req.body;

    if (!handNumber || !handTime) {
      return res.status(400).json({
        status: 'error',
        message: 'handNumber와 handTime이 필요합니다'
      });
    }

    const sheetsService = createSheetsService();
    const result = await sheetsService.getHandStatus(sheetName, handNumber, handTime);

    return res.json(result);

  } catch (error: any) {
    console.error('❌ 핸드 상태 확인 API 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * 스프레드시트 정보 조회
 */
router.get('/info', async (_req: Request, res: Response) => {
  try {
    const sheetsService = createSheetsService();
    const result = await sheetsService.getSpreadsheetInfo();

    return res.json(result);

  } catch (error: any) {
    console.error('❌ 스프레드시트 정보 조회 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * 행 데이터 조회
 */
router.get('/row/:sheetName/:rowNumber', async (req: Request, res: Response) => {
  try {
    const { sheetName, rowNumber } = req.params;

    if (!rowNumber || isNaN(parseInt(rowNumber))) {
      return res.status(400).json({
        status: 'error',
        message: '유효한 행 번호가 필요합니다'
      });
    }

    const sheetsService = createSheetsService();
    const rowData = await sheetsService.getRowData(sheetName, parseInt(rowNumber));

    return res.json({
      status: 'success',
      data: {
        sheetName,
        rowNumber: parseInt(rowNumber),
        values: rowData,
        columns: {
          A: rowData[0] || '',  // ID/번호
          B: rowData[1] || '',  // 시간
          C: rowData[2] || '',  // 기타
          D: rowData[3] || '',  // 핸드 번호
          E: rowData[4] || '',  // 상태
          F: rowData[5] || '',  // 파일명
          G: rowData[6] || '',  // 기타
          H: rowData[7] || '',  // AI 분석
          I: rowData[8] || ''   // 업데이트 시간
        }
      }
    });

  } catch (error: any) {
    console.error('❌ 행 데이터 조회 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * 레거시 호환성 - 기존 Apps Script 형식 지원
 */
router.post('/legacy', async (req: Request, res: Response) => {
  try {
    const { action, ...data } = req.body;

    console.log(`📥 레거시 요청: ${action}`);

    const sheetsService = createSheetsService();

    switch (action) {
      case 'updateSheet':
        const updateResult = await sheetsService.updateSheet(data.sheetName || 'Virtual', {
          rowNumber: data.rowNumber,
          handNumber: data.handNumber,
          filename: data.filename,
          aiAnalysis: data.aiAnalysis,
          status: data.status,
          timestamp: data.timestamp
        });
        return res.json(updateResult);

      case 'batchVerify':
        const batchResult = await sheetsService.batchVerify(
          data.sheetName || 'Virtual',
          data.rows
        );
        return res.json(batchResult);

      case 'getHandStatus':
        const statusResult = await sheetsService.getHandStatus(
          data.sheetName || 'Virtual',
          data.handNumber,
          data.handTime
        );
        return res.json(statusResult);

      case 'test':
        const testResult = await sheetsService.testConnection();
        return res.json({
          status: 'success',
          message: 'Direct API 연결 성공!',
          timestamp: new Date().toISOString(),
          version: 'v4.0.0-direct',
          result: testResult
        });

      default:
        return res.status(400).json({
          status: 'error',
          message: `알 수 없는 액션: ${action}`,
          availableActions: ['updateSheet', 'batchVerify', 'getHandStatus', 'test']
        });
    }

  } catch (error: any) {
    console.error('❌ 레거시 API 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;