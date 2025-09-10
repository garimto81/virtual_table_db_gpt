/**
 * 포커 핸드 로거 v35 - ApiService
 * Google Apps Script 통신 서비스
 */

import { IApiService, ApiResponse, SheetData, HandData } from '@types/index';
import { Config } from '@/config';
import { EventBus } from '@/store/EventBus';
import DOMPurify from 'dompurify';

export class ApiService implements IApiService {
  private config: Config;
  private eventBus: EventBus;
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number = 3;
  private retryDelay: number = 1000;

  constructor(config: Config, eventBus: EventBus) {
    this.config = config;
    this.eventBus = eventBus;
    this.baseUrl = this.config.getApiUrl() || '';
    this.timeout = this.config.getEnv('API_TIMEOUT') || 30000;
  }

  /**
   * Google Sheets로 데이터 전송
   */
  async sendToSheet(data: SheetData): Promise<ApiResponse> {
    try {
      if (!this.baseUrl) {
        throw new Error('API URL이 설정되지 않았습니다.');
      }

      // 데이터 유효성 검사
      this.validateSheetData(data);

      // 민감한 데이터 검사 및 정제
      const sanitizedData = this.sanitizeData(data);

      const requestData = {
        action: 'addHandData',
        data: sanitizedData,
        timestamp: new Date().toISOString(),
        version: this.config.getEnv('APP_VERSION')
      };

      const response = await this.makeRequest(requestData);

      if (response.status === 'success') {
        this.eventBus.emit('api:send-success', { data: sanitizedData });
        
        // 캐시 업데이트
        this.updateLocalCache(sanitizedData);
      }

      return response;

    } catch (error) {
      console.error('[ApiService] 데이터 전송 실패:', error);
      
      this.eventBus.emit('api:send-error', { 
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });

      return {
        status: 'error',
        message: error instanceof Error ? error.message : '데이터 전송에 실패했습니다.'
      };
    }
  }

  /**
   * 초기 데이터 가져오기
   */
  async getInitialData(): Promise<ApiResponse> {
    try {
      if (!this.baseUrl) {
        // 오프라인 모드에서는 로컬 캐시 데이터 반환
        return this.getOfflineData();
      }

      const requestData = {
        action: 'getInitialData',
        timestamp: new Date().toISOString()
      };

      const response = await this.makeRequest(requestData);

      if (response.status === 'success') {
        // 로컬 캐시에 저장
        await this.cacheData(response.data);
        
        this.eventBus.emit('api:data-loaded', { data: response.data });
      }

      return response;

    } catch (error) {
      console.error('[ApiService] 초기 데이터 로드 실패:', error);
      
      // 오류 발생 시 캐시된 데이터로 대체
      const offlineData = await this.getOfflineData();
      if (offlineData.status === 'success') {
        return offlineData;
      }

      return {
        status: 'error',
        message: error instanceof Error ? error.message : '초기 데이터 로드에 실패했습니다.'
      };
    }
  }

  /**
   * 연결 상태 확인
   */
  async validateConnection(): Promise<boolean> {
    try {
      if (!this.baseUrl) {
        return false;
      }

      const requestData = {
        action: 'ping',
        timestamp: new Date().toISOString()
      };

      const response = await this.makeRequest(requestData, 5000); // 5초 타임아웃
      return response.status === 'success';

    } catch (error) {
      console.warn('[ApiService] 연결 확인 실패:', error);
      return false;
    }
  }

  /**
   * 특정 테이블의 플레이어 데이터 가져오기
   */
  async getTablePlayers(tableId: string): Promise<ApiResponse> {
    try {
      const requestData = {
        action: 'getTablePlayers',
        tableId: DOMPurify.sanitize(tableId),
        timestamp: new Date().toISOString()
      };

      return await this.makeRequest(requestData);
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : '플레이어 데이터 로드 실패'
      };
    }
  }

  /**
   * 마지막 핸드 번호 가져오기
   */
  async getLastHandNumber(): Promise<ApiResponse> {
    try {
      const requestData = {
        action: 'getLastHandNumber',
        timestamp: new Date().toISOString()
      };

      return await this.makeRequest(requestData);
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : '마지막 핸드 번호 조회 실패'
      };
    }
  }

  /**
   * HTTP 요청 수행
   */
  private async makeRequest(data: any, customTimeout?: number): Promise<ApiResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), customTimeout || this.timeout);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('응답이 JSON 형식이 아닙니다.');
      }

      const result = await response.json();
      
      // 응답 데이터 검증
      this.validateApiResponse(result);

      return result;

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('요청 시간이 초과되었습니다.');
        }
        throw error;
      }

      throw new Error('알 수 없는 네트워크 오류가 발생했습니다.');
    }
  }

  /**
   * 재시도 로직이 포함된 요청
   */
  private async makeRequestWithRetry(data: any): Promise<ApiResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await this.makeRequest(data);
        
        // 성공 시 반환
        if (response.status === 'success') {
          return response;
        }

        // 서버 오류인 경우 재시도
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
          continue;
        }

        return response;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('알 수 없는 오류');
        
        if (attempt < this.retryAttempts) {
          console.warn(`[ApiService] 요청 실패 (${attempt}/${this.retryAttempts}):`, error);
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    throw lastError || new Error('모든 재시도 시도가 실패했습니다.');
  }

  /**
   * 데이터 유효성 검사
   */
  private validateSheetData(data: SheetData): void {
    if (!data.handNumber || data.handNumber <= 0) {
      throw new Error('유효한 핸드 번호가 필요합니다.');
    }

    if (!data.tableId || data.tableId.trim() === '') {
      throw new Error('테이블 ID가 필요합니다.');
    }

    if (!data.timestamp) {
      throw new Error('타임스탬프가 필요합니다.');
    }

    if (data.pot < 0) {
      throw new Error('팟 크기는 0 이상이어야 합니다.');
    }
  }

  /**
   * API 응답 유효성 검사
   */
  private validateApiResponse(response: any): void {
    if (!response || typeof response !== 'object') {
      throw new Error('유효하지 않은 응답 형식입니다.');
    }

    if (!['success', 'error'].includes(response.status)) {
      throw new Error('응답 상태가 유효하지 않습니다.');
    }

    if (response.status === 'error' && !response.message) {
      throw new Error('오류 응답에 메시지가 없습니다.');
    }
  }

  /**
   * 데이터 정제 (XSS 방지)
   */
  private sanitizeData(data: SheetData): SheetData {
    return {
      handNumber: data.handNumber,
      timestamp: DOMPurify.sanitize(data.timestamp),
      tableId: DOMPurify.sanitize(data.tableId),
      winner: DOMPurify.sanitize(data.winner),
      loser: DOMPurify.sanitize(data.loser),
      pot: data.pot,
      actions: DOMPurify.sanitize(data.actions),
      notes: data.notes ? DOMPurify.sanitize(data.notes) : undefined
    };
  }

  /**
   * 오프라인 데이터 가져오기
   */
  private async getOfflineData(): Promise<ApiResponse> {
    try {
      const cachedData = localStorage.getItem('offline-data');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        return {
          status: 'success',
          data: parsedData,
          message: '오프라인 데이터를 사용합니다.'
        };
      }

      return {
        status: 'success',
        data: {
          playerData: {},
          handNumbers: [],
          tables: []
        },
        message: '빈 데이터로 시작합니다.'
      };

    } catch (error) {
      return {
        status: 'error',
        message: '오프라인 데이터 로드에 실패했습니다.'
      };
    }
  }

  /**
   * 데이터 캐싱
   */
  private async cacheData(data: any): Promise<void> {
    try {
      localStorage.setItem('offline-data', JSON.stringify(data));
      localStorage.setItem('cache-timestamp', new Date().toISOString());
    } catch (error) {
      console.warn('[ApiService] 캐시 저장 실패:', error);
    }
  }

  /**
   * 로컬 캐시 업데이트
   */
  private updateLocalCache(data: SheetData): void {
    try {
      const cachedData = localStorage.getItem('offline-data');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        
        // 핸드 번호 추가
        if (!parsedData.handNumbers.includes(data.handNumber)) {
          parsedData.handNumbers.push(data.handNumber);
          parsedData.handNumbers.sort((a: number, b: number) => b - a);
        }

        // 테이블 ID 추가
        if (!parsedData.tables.includes(data.tableId)) {
          parsedData.tables.push(data.tableId);
        }

        localStorage.setItem('offline-data', JSON.stringify(parsedData));
      }
    } catch (error) {
      console.warn('[ApiService] 로컬 캐시 업데이트 실패:', error);
    }
  }

  /**
   * 지연 함수
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * API URL 업데이트
   */
  public updateApiUrl(url: string): void {
    this.baseUrl = DOMPurify.sanitize(url);
    
    if (this.config.isDebugMode) {
      console.log('[ApiService] API URL 업데이트:', this.baseUrl);
    }
  }

  /**
   * 타임아웃 설정
   */
  public setTimeout(timeout: number): void {
    this.timeout = Math.max(5000, Math.min(60000, timeout)); // 5초~60초 사이로 제한
  }

  /**
   * 재시도 설정
   */
  public setRetryConfig(attempts: number, delay: number): void {
    this.retryAttempts = Math.max(1, Math.min(5, attempts)); // 1~5회로 제한
    this.retryDelay = Math.max(500, Math.min(5000, delay)); // 0.5초~5초로 제한
  }

  /**
   * 연결 상태 모니터링
   */
  public startConnectionMonitoring(interval: number = 30000): void {
    setInterval(async () => {
      const isConnected = await this.validateConnection();
      
      this.eventBus.emit('api:connection-status', {
        connected: isConnected,
        timestamp: new Date()
      });
    }, interval);
  }

  /**
   * 캐시 정리
   */
  public clearCache(): void {
    try {
      localStorage.removeItem('offline-data');
      localStorage.removeItem('cache-timestamp');
      
      this.eventBus.emit('api:cache-cleared');
      
      if (this.config.isDebugMode) {
        console.log('[ApiService] 캐시가 정리되었습니다.');
      }
    } catch (error) {
      console.warn('[ApiService] 캐시 정리 실패:', error);
    }
  }

  /**
   * 통계 정보 반환
   */
  public getStats(): any {
    return {
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      retryAttempts: this.retryAttempts,
      retryDelay: this.retryDelay,
      cacheTimestamp: localStorage.getItem('cache-timestamp')
    };
  }
}