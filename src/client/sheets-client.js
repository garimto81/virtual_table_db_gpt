/**
 * 클라이언트 사이드 Google Sheets API 클라이언트
 * 기존 Apps Script 호출을 새로운 Direct API 호출로 대체
 */

class SheetsAPIClient {
  constructor(config = {}) {
    this.config = {
      baseUrl: config.baseUrl || '/api/sheets',
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      debug: config.debug || false,
      ...config
    };

    this.isConnected = false;
    this.lastError = null;
  }

  /**
   * API 연결 테스트
   */
  async testConnection() {
    try {
      const response = await this.makeRequest('GET', '/test');

      this.isConnected = response.status === 'ok';
      this.lastError = null;

      if (this.config.debug) {
        console.log('✅ Sheets API 연결 테스트 성공:', response);
      }

      return response;
    } catch (error) {
      this.isConnected = false;
      this.lastError = error.message;

      console.error('❌ Sheets API 연결 테스트 실패:', error);
      throw error;
    }
  }

  /**
   * 시트 업데이트 - 기존 Apps Script updateSheet 대체
   */
  async updateSheet(data) {
    try {
      const {
        sheetName = 'Virtual',
        rowNumber,
        handNumber,
        filename,
        aiAnalysis,
        status,
        timestamp,
        indexSheetName
      } = data;

      if (this.config.debug) {
        console.log('🔄 시트 업데이트 요청:', {
          sheetName,
          rowNumber,
          handNumber,
          filename: filename?.substring(0, 50) + '...',
          status
        });
      }

      const payload = {
        sheetName,
        rowNumber,
        handNumber,
        filename,
        aiAnalysis,
        status,
        timestamp,
        indexSheetName
      };

      const response = await this.makeRequest('POST', '/update', payload);

      if (this.config.debug) {
        console.log('✅ 시트 업데이트 완료:', response);
      }

      return response;
    } catch (error) {
      console.error('❌ 시트 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 일괄 상태 확인 - 기존 Apps Script batchVerify 대체
   */
  async batchVerify(sheetName, rows) {
    try {
      if (this.config.debug) {
        console.log(`🚀 일괄 상태 확인: ${rows.length}개 행`);
      }

      const payload = { sheetName, rows };
      const response = await this.makeRequest('POST', '/batch-verify', payload);

      if (this.config.debug) {
        console.log('✅ 일괄 확인 완료:', response.performance);
      }

      return response;
    } catch (error) {
      console.error('❌ 일괄 확인 실패:', error);
      throw error;
    }
  }

  /**
   * 핸드 상태 확인 - 기존 Apps Script getHandStatus 대체
   */
  async getHandStatus(sheetName, handNumber, handTime) {
    try {
      if (this.config.debug) {
        console.log(`🔍 핸드 상태 확인: ${handNumber} (${handTime})`);
      }

      const payload = { sheetName, handNumber, handTime };
      const response = await this.makeRequest('POST', '/hand-status', payload);

      return response;
    } catch (error) {
      console.error('❌ 핸드 상태 확인 실패:', error);
      throw error;
    }
  }

  /**
   * 스프레드시트 정보 조회
   */
  async getSpreadsheetInfo() {
    try {
      const response = await this.makeRequest('GET', '/info');
      return response;
    } catch (error) {
      console.error('❌ 스프레드시트 정보 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 특정 행 데이터 조회
   */
  async getRowData(sheetName, rowNumber) {
    try {
      const response = await this.makeRequest('GET', `/row/${sheetName}/${rowNumber}`);
      return response;
    } catch (error) {
      console.error('❌ 행 데이터 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 레거시 호환성 - 기존 Apps Script 액션 형식 지원
   */
  async legacyAction(action, data) {
    try {
      if (this.config.debug) {
        console.log(`📥 레거시 액션: ${action}`);
      }

      const payload = { action, ...data };
      const response = await this.makeRequest('POST', '/legacy', payload);

      return response;
    } catch (error) {
      console.error(`❌ 레거시 액션 실패 (${action}):`, error);
      throw error;
    }
  }

  /**
   * HTTP 요청 생성 및 실행
   */
  async makeRequest(method, endpoint, data = null, attempt = 1) {
    try {
      const url = `${this.config.baseUrl}${endpoint}`;

      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(this.config.timeout)
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      // 재시도 로직
      if (attempt < this.config.retryAttempts && this.shouldRetry(error)) {
        console.warn(`⚠️ 요청 실패 (${attempt}/${this.config.retryAttempts}), 재시도 중...`);

        await this.sleep(this.config.retryDelay * attempt);
        return this.makeRequest(method, endpoint, data, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * 재시도 여부 판단
   */
  shouldRetry(error) {
    // 네트워크 오류 또는 5xx 서버 오류인 경우 재시도
    return error.name === 'TypeError' ||
           error.message.includes('fetch') ||
           error.message.includes('500') ||
           error.message.includes('502') ||
           error.message.includes('503') ||
           error.message.includes('504');
  }

  /**
   * 지연 함수
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 연결 상태 확인
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      lastError: this.lastError,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 디버그 모드 토글
   */
  setDebug(enabled) {
    this.config.debug = enabled;
    console.log(`🐛 Sheets API 디버그 모드: ${enabled ? '활성화' : '비활성화'}`);
  }
}

// 전역으로 사용할 수 있는 인스턴스 생성
window.SheetsAPIClient = SheetsAPIClient;

// 기본 인스턴스 생성
window.sheetsAPI = new SheetsAPIClient({
  debug: window.location.hostname === 'localhost' // 로컬에서만 디버그 모드
});

// 기존 코드 호환성을 위한 래퍼 함수들
window.legacySheetsAPI = {
  /**
   * 기존 Apps Script 호출 방식을 새 API로 변환
   */
  async callAppsScript(action, data) {
    console.warn('⚠️ 레거시 Apps Script 호출이 새 Direct API로 변환됩니다.');
    return await window.sheetsAPI.legacyAction(action, data);
  },

  /**
   * 시트 업데이트 (기존 함수명 유지)
   */
  async updateHandInSheet(handData) {
    return await window.sheetsAPI.updateSheet(handData);
  },

  /**
   * 상태 확인 (기존 함수명 유지)
   */
  async verifySheetUpdate(sheetUrl, rowNumber) {
    // sheetUrl에서 시트명 추출 (간단한 방법)
    const sheetName = 'Virtual'; // 기본값

    const rowData = await window.sheetsAPI.getRowData(sheetName, rowNumber);
    return {
      status: 'success',
      data: {
        row: rowNumber,
        columnE: rowData.data.columns.E,
        columnF: rowData.data.columns.F,
        columnH: rowData.data.columns.H
      }
    };
  }
};

console.log('📊 Google Sheets Direct API Client 로드 완료');
console.log('✅ 기존 Apps Script 호출이 새 Direct API로 자동 변환됩니다.');