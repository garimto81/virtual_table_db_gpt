/**
 * 포커 핸드 로거 v35 - StorageService
 * 로컬 스토리지 관리 서비스
 */

import { IStorageService, AppError } from '@types/index';

export class StorageService implements IStorageService {
  private prefix: string;
  private compressionEnabled: boolean;
  private encryptionEnabled: boolean;
  private encryptionKey?: string;

  constructor(
    prefix: string = 'poker-logger-',
    options: {
      compression?: boolean;
      encryption?: boolean;
      encryptionKey?: string;
    } = {}
  ) {
    this.prefix = prefix;
    this.compressionEnabled = options.compression || false;
    this.encryptionEnabled = options.encryption || false;
    this.encryptionKey = options.encryptionKey;
    
    this.initializeStorage();
  }

  /**
   * 스토리지 초기화
   */
  private initializeStorage(): void {
    try {
      // 스토리지 지원 여부 확인
      this.checkStorageSupport();
      
      // 저장 공간 정리 (필요시)
      this.cleanupExpiredItems();
      
    } catch (error) {
      console.warn('[StorageService] 스토리지 초기화 실패:', error);
    }
  }

  /**
   * 스토리지 지원 여부 확인
   */
  private checkStorageSupport(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      throw new AppError(
        '로컬 스토리지가 지원되지 않거나 비활성화되어 있습니다.',
        'STORAGE_NOT_SUPPORTED',
        500
      );
    }
  }

  /**
   * 항목 저장
   */
  async setItem<T>(key: string, value: T, options?: {
    ttl?: number;
    compress?: boolean;
    encrypt?: boolean;
  }): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      
      // 데이터 준비
      const dataToStore = {
        value,
        timestamp: Date.now(),
        ttl: options?.ttl,
        version: '1.0'
      };

      let serializedData = JSON.stringify(dataToStore);

      // 압축 적용
      if (this.compressionEnabled || options?.compress) {
        serializedData = await this.compress(serializedData);
      }

      // 암호화 적용
      if ((this.encryptionEnabled || options?.encrypt) && this.encryptionKey) {
        serializedData = await this.encrypt(serializedData);
      }

      // 크기 검사 (5MB 제한)
      if (serializedData.length > 5 * 1024 * 1024) {
        throw new AppError(
          '저장할 데이터가 너무 큽니다 (최대 5MB).',
          'DATA_TOO_LARGE',
          413
        );
      }

      localStorage.setItem(fullKey, serializedData);

      // 메타데이터 업데이트
      this.updateMetadata(key, {
        size: serializedData.length,
        lastModified: Date.now(),
        compressed: this.compressionEnabled || options?.compress || false,
        encrypted: (this.encryptionEnabled || options?.encrypt) && !!this.encryptionKey
      });

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      // 저장 공간 부족 오류 처리
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        await this.handleStorageFull(key);
        // 재시도
        return this.setItem(key, value, options);
      }

      throw new AppError(
        `데이터 저장에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        'STORAGE_SET_FAILED',
        500
      );
    }
  }

  /**
   * 항목 가져오기
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key);
      let rawData = localStorage.getItem(fullKey);

      if (rawData === null) {
        return null;
      }

      // 암호화 해제
      if ((this.encryptionEnabled) && this.encryptionKey) {
        try {
          rawData = await this.decrypt(rawData);
        } catch (error) {
          console.warn(`[StorageService] 복호화 실패 (${key}):`, error);
          // 복호화에 실패하면 null 반환
          return null;
        }
      }

      // 압축 해제
      if (this.compressionEnabled) {
        try {
          rawData = await this.decompress(rawData);
        } catch (error) {
          console.warn(`[StorageService] 압축 해제 실패 (${key}):`, error);
          // 압축 해제에 실패하면 원본 데이터로 시도
        }
      }

      const parsedData = JSON.parse(rawData);

      // TTL 검사
      if (parsedData.ttl && Date.now() > parsedData.timestamp + parsedData.ttl) {
        await this.removeItem(key);
        return null;
      }

      return parsedData.value;

    } catch (error) {
      if (error instanceof SyntaxError) {
        console.warn(`[StorageService] 잘못된 JSON 데이터 (${key}):`, error);
        await this.removeItem(key); // 잘못된 데이터 제거
        return null;
      }

      throw new AppError(
        `데이터 로드에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        'STORAGE_GET_FAILED',
        500
      );
    }
  }

  /**
   * 항목 제거
   */
  async removeItem(key: string): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      localStorage.removeItem(fullKey);
      this.removeMetadata(key);
    } catch (error) {
      throw new AppError(
        `데이터 삭제에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        'STORAGE_REMOVE_FAILED',
        500
      );
    }
  }

  /**
   * 모든 항목 제거
   */
  async clear(): Promise<void> {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // 메타데이터도 정리
      localStorage.removeItem(this.getMetadataKey());

    } catch (error) {
      throw new AppError(
        '스토리지 정리에 실패했습니다.',
        'STORAGE_CLEAR_FAILED',
        500
      );
    }
  }

  /**
   * 키 존재 여부 확인
   */
  async hasItem(key: string): Promise<boolean> {
    const fullKey = this.getFullKey(key);
    return localStorage.getItem(fullKey) !== null;
  }

  /**
   * 모든 키 목록 반환
   */
  async keys(): Promise<string[]> {
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ''));
      }
    }
    
    return keys;
  }

  /**
   * 스토리지 사용량 정보 반환
   */
  async getStorageInfo(): Promise<{
    used: number;
    total: number;
    available: number;
    items: number;
  }> {
    let used = 0;
    let items = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        const value = localStorage.getItem(key);
        if (value) {
          used += key.length + value.length;
          items++;
        }
      }
    }

    // 대략적인 총 용량 (브라우저마다 다름, 일반적으로 5-10MB)
    const total = 5 * 1024 * 1024; // 5MB로 추정
    const available = total - used;

    return { used, total, available, items };
  }

  /**
   * 백업 생성
   */
  async createBackup(): Promise<string> {
    try {
      const backup: { [key: string]: any } = {};
      const keys = await this.keys();

      for (const key of keys) {
        const value = await this.getItem(key);
        if (value !== null) {
          backup[key] = value;
        }
      }

      return JSON.stringify({
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: backup
      }, null, 2);

    } catch (error) {
      throw new AppError(
        '백업 생성에 실패했습니다.',
        'BACKUP_FAILED',
        500
      );
    }
  }

  /**
   * 백업 복원
   */
  async restoreBackup(backupData: string, options?: {
    overwrite?: boolean;
    selective?: string[];
  }): Promise<void> {
    try {
      const backup = JSON.parse(backupData);
      
      if (!backup.data || typeof backup.data !== 'object') {
        throw new Error('유효하지 않은 백업 형식입니다.');
      }

      const keysToRestore = options?.selective || Object.keys(backup.data);

      for (const key of keysToRestore) {
        if (backup.data[key] !== undefined) {
          const exists = await this.hasItem(key);
          
          if (!exists || options?.overwrite) {
            await this.setItem(key, backup.data[key]);
          }
        }
      }

    } catch (error) {
      throw new AppError(
        `백업 복원에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        'RESTORE_FAILED',
        500
      );
    }
  }

  /**
   * 압축 (간단한 LZ 압축 시뮬레이션)
   */
  private async compress(data: string): Promise<string> {
    try {
      // 실제 환경에서는 pako 라이브러리 등을 사용
      // 여기서는 간단한 압축 시뮬레이션
      return btoa(encodeURIComponent(data));
    } catch (error) {
      console.warn('[StorageService] 압축 실패:', error);
      return data;
    }
  }

  /**
   * 압축 해제
   */
  private async decompress(data: string): Promise<string> {
    try {
      return decodeURIComponent(atob(data));
    } catch (error) {
      console.warn('[StorageService] 압축 해제 실패:', error);
      return data;
    }
  }

  /**
   * 암호화 (간단한 XOR 암호화)
   */
  private async encrypt(data: string): Promise<string> {
    if (!this.encryptionKey) return data;

    try {
      // 실제 환경에서는 crypto-js 라이브러리 등을 사용
      // 여기서는 간단한 XOR 암호화
      let encrypted = '';
      const key = this.encryptionKey;
      
      for (let i = 0; i < data.length; i++) {
        const keyChar = key[i % key.length];
        const encrypted_char = String.fromCharCode(data.charCodeAt(i) ^ keyChar.charCodeAt(0));
        encrypted += encrypted_char;
      }
      
      return btoa(encrypted);
    } catch (error) {
      console.warn('[StorageService] 암호화 실패:', error);
      return data;
    }
  }

  /**
   * 복호화
   */
  private async decrypt(data: string): Promise<string> {
    if (!this.encryptionKey) return data;

    try {
      const encrypted = atob(data);
      let decrypted = '';
      const key = this.encryptionKey;
      
      for (let i = 0; i < encrypted.length; i++) {
        const keyChar = key[i % key.length];
        const decrypted_char = String.fromCharCode(encrypted.charCodeAt(i) ^ keyChar.charCodeAt(0));
        decrypted += decrypted_char;
      }
      
      return decrypted;
    } catch (error) {
      console.warn('[StorageService] 복호화 실패:', error);
      return data;
    }
  }

  /**
   * 저장 공간 부족 처리
   */
  private async handleStorageFull(newKey: string): Promise<void> {
    console.warn('[StorageService] 저장 공간 부족, 정리 중...');

    // LRU (Least Recently Used) 방식으로 오래된 데이터 제거
    const metadata = this.getMetadata();
    const sortedItems = Object.entries(metadata)
      .sort(([, a], [, b]) => a.lastModified - b.lastModified)
      .slice(0, Math.ceil(Object.keys(metadata).length * 0.2)); // 20% 제거

    for (const [key] of sortedItems) {
      if (key !== newKey) { // 새로 저장할 키는 제외
        await this.removeItem(key);
      }
    }
  }

  /**
   * 만료된 항목 정리
   */
  private async cleanupExpiredItems(): Promise<void> {
    try {
      const keys = await this.keys();
      
      for (const key of keys) {
        const item = await this.getItem(key);
        if (item === null) {
          // TTL이 만료되어 null이 반환된 경우, removeItem에서 이미 처리됨
        }
      }
    } catch (error) {
      console.warn('[StorageService] 만료된 항목 정리 실패:', error);
    }
  }

  /**
   * 메타데이터 관리
   */
  private getMetadataKey(): string {
    return `${this.prefix}__metadata__`;
  }

  private getMetadata(): { [key: string]: any } {
    try {
      const metadata = localStorage.getItem(this.getMetadataKey());
      return metadata ? JSON.parse(metadata) : {};
    } catch (error) {
      return {};
    }
  }

  private updateMetadata(key: string, info: any): void {
    try {
      const metadata = this.getMetadata();
      metadata[key] = { ...metadata[key], ...info };
      localStorage.setItem(this.getMetadataKey(), JSON.stringify(metadata));
    } catch (error) {
      console.warn('[StorageService] 메타데이터 업데이트 실패:', error);
    }
  }

  private removeMetadata(key: string): void {
    try {
      const metadata = this.getMetadata();
      delete metadata[key];
      localStorage.setItem(this.getMetadataKey(), JSON.stringify(metadata));
    } catch (error) {
      console.warn('[StorageService] 메타데이터 제거 실패:', error);
    }
  }

  /**
   * 전체 키 생성
   */
  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * 암호화 키 설정
   */
  public setEncryptionKey(key: string): void {
    this.encryptionKey = key;
  }

  /**
   * 압축 활성화/비활성화
   */
  public setCompression(enabled: boolean): void {
    this.compressionEnabled = enabled;
  }

  /**
   * 암호화 활성화/비활성화
   */
  public setEncryption(enabled: boolean): void {
    this.encryptionEnabled = enabled;
  }

  /**
   * 스토리지 통계 반환
   */
  public async getStats(): Promise<any> {
    const info = await this.getStorageInfo();
    const metadata = this.getMetadata();

    return {
      ...info,
      compressionEnabled: this.compressionEnabled,
      encryptionEnabled: this.encryptionEnabled,
      metadataItems: Object.keys(metadata).length,
      prefix: this.prefix
    };
  }
}