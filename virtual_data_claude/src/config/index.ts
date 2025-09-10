/**
 * 포커 핸드 로거 v35 - 설정 관리
 */

import { EnvConfig, AppSettings } from '@types/index';

// 환경 변수 타입 안전성 확보
declare const process: {
  env: {
    NODE_ENV?: string;
    APP_VERSION?: string;
    GOOGLE_APPS_SCRIPT_URL?: string;
    API_TIMEOUT?: string;
    DEBUG_MODE?: string;
    API_KEY?: string;
    ENCRYPT_SECRET?: string;
    ENABLE_OFFLINE_MODE?: string;
    ENABLE_PWA?: string;
    ENABLE_ANALYTICS?: string;
  }
};

/**
 * 환경 변수 설정 클래스
 */
export class Config {
  private static instance: Config;
  private config: EnvConfig;
  private userSettings: AppSettings;

  private constructor() {
    this.config = this.loadEnvConfig();
    this.userSettings = this.loadUserSettings();
  }

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  /**
   * 설정 로드 (정적 메서드)
   */
  public static async load(): Promise<Config> {
    const instance = Config.getInstance();
    await instance.initialize();
    return instance;
  }

  /**
   * 환경 변수 설정 로드
   */
  private loadEnvConfig(): EnvConfig {
    return {
      NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
      APP_VERSION: process.env.APP_VERSION || '35.0.0',
      GOOGLE_APPS_SCRIPT_URL: process.env.GOOGLE_APPS_SCRIPT_URL,
      API_TIMEOUT: parseInt(process.env.API_TIMEOUT || '30000'),
      DEBUG_MODE: process.env.DEBUG_MODE === 'true'
    };
  }

  /**
   * 사용자 설정 로드
   */
  private loadUserSettings(): AppSettings {
    const defaultSettings: AppSettings = {
      autoSave: true,
      theme: 'dark',
      language: 'ko',
      notifications: true,
      soundEffects: false
    };

    try {
      const stored = localStorage.getItem('userSettings');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultSettings, ...parsed };
      }
    } catch (error) {
      console.warn('[CONFIG] 사용자 설정 로드 실패:', error);
    }

    return defaultSettings;
  }

  /**
   * 초기화
   */
  private async initialize(): Promise<void> {
    // 환경 변수 유효성 검사
    this.validateConfig();

    // 개발 모드에서 디버그 정보 출력
    if (this.config.DEBUG_MODE) {
      console.group('[CONFIG] 설정 정보');
      console.log('환경:', this.config.NODE_ENV);
      console.log('버전:', this.config.APP_VERSION);
      console.log('API URL:', this.config.GOOGLE_APPS_SCRIPT_URL ? '설정됨' : '미설정');
      console.log('디버그 모드:', this.config.DEBUG_MODE);
      console.groupEnd();
    }
  }

  /**
   * 설정 유효성 검사
   */
  private validateConfig(): void {
    const errors: string[] = [];

    // 필수 설정 검사
    if (!this.config.APP_VERSION) {
      errors.push('APP_VERSION이 설정되지 않았습니다.');
    }

    if (this.config.NODE_ENV === 'production' && !this.config.GOOGLE_APPS_SCRIPT_URL) {
      errors.push('프로덕션 환경에서 GOOGLE_APPS_SCRIPT_URL이 필요합니다.');
    }

    if (errors.length > 0) {
      console.error('[CONFIG] 설정 오류:', errors);
      throw new Error(`설정 오류: ${errors.join(', ')}`);
    }
  }

  // Getter 메서드들
  public get env(): EnvConfig {
    return { ...this.config };
  }

  public get settings(): AppSettings {
    return { ...this.userSettings };
  }

  public get isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  public get isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  public get isDebugMode(): boolean {
    return this.config.DEBUG_MODE || false;
  }

  /**
   * 사용자 설정 업데이트
   */
  public async updateSettings(newSettings: Partial<AppSettings>): Promise<void> {
    this.userSettings = { ...this.userSettings, ...newSettings };
    
    try {
      localStorage.setItem('userSettings', JSON.stringify(this.userSettings));
      
      if (this.config.DEBUG_MODE) {
        console.log('[CONFIG] 사용자 설정 업데이트:', newSettings);
      }
    } catch (error) {
      console.error('[CONFIG] 설정 저장 실패:', error);
      throw error;
    }
  }

  /**
   * 특정 설정 값 가져오기
   */
  public getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.userSettings[key];
  }

  /**
   * 환경 변수 값 가져오기
   */
  public getEnv<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }

  /**
   * API URL 가져오기 (보안을 위한 별도 메서드)
   */
  public getApiUrl(): string | undefined {
    // 프로덕션에서는 환경 변수에서, 개발에서는 localStorage에서 가져올 수 있음
    if (this.config.NODE_ENV === 'development') {
      const devUrl = localStorage.getItem('devApiUrl');
      if (devUrl) return devUrl;
    }

    return this.config.GOOGLE_APPS_SCRIPT_URL;
  }

  /**
   * 개발용 API URL 설정
   */
  public setDevApiUrl(url: string): void {
    if (this.config.NODE_ENV === 'development') {
      localStorage.setItem('devApiUrl', url);
    }
  }

  /**
   * 설정 초기화
   */
  public resetSettings(): void {
    localStorage.removeItem('userSettings');
    localStorage.removeItem('devApiUrl');
    this.userSettings = this.loadUserSettings();
  }

  /**
   * 설정 내보내기
   */
  public exportSettings(): string {
    return JSON.stringify({
      userSettings: this.userSettings,
      timestamp: new Date().toISOString(),
      version: this.config.APP_VERSION
    }, null, 2);
  }

  /**
   * 설정 가져오기
   */
  public async importSettings(settingsJson: string): Promise<void> {
    try {
      const imported = JSON.parse(settingsJson);
      
      if (imported.userSettings) {
        await this.updateSettings(imported.userSettings);
      }
      
      console.log('[CONFIG] 설정 가져오기 완료');
    } catch (error) {
      console.error('[CONFIG] 설정 가져오기 실패:', error);
      throw new Error('설정 파일이 유효하지 않습니다.');
    }
  }
}

// 기본 설정 상수
export const DEFAULT_CONFIG = {
  APP_NAME: '포커 핸드 로거',
  APP_VERSION: '35.0.0',
  MAX_PLAYERS: 10,
  MIN_PLAYERS: 2,
  DEFAULT_BLINDS: {
    SMALL: 1,
    BIG: 2
  },
  POSITIONS: ['SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'MP', 'CO', 'BTN'],
  CARD_SUITS: ['hearts', 'diamonds', 'clubs', 'spades'],
  CARD_RANKS: ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'],
  STREETS: ['preflop', 'flop', 'turn', 'river'],
  ACTION_TYPES: ['fold', 'call', 'raise', 'check', 'bet', 'all-in'],
  PLAYER_ROLES: ['winner', 'loser', 'folder', 'spectator']
} as const;

// 타입 안전한 설정 액세스를 위한 유틸리티 함수
export const getConfig = (): Config => Config.getInstance();

export const isFeatureEnabled = (feature: string): boolean => {
  const config = getConfig();
  return config.getSetting(feature as keyof AppSettings) === true;
};