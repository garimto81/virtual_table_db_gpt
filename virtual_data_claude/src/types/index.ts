/**
 * 포커 핸드 로거 v35 - TypeScript 타입 정의
 */

// 기본 타입 정의
export type Street = 'preflop' | 'flop' | 'turn' | 'river';
export type PlayerRole = 'winner' | 'loser' | 'folder' | 'spectator';
export type ActionType = 'fold' | 'call' | 'raise' | 'check' | 'bet' | 'all-in';
export type HandType = 'cash' | 'tournament' | 'sit-n-go';
export type Position = 'SB' | 'BB' | 'UTG' | 'MP' | 'CO' | 'BTN' | 'UTG+1' | 'UTG+2';

// 카드 관련 타입
export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
}

export interface HoleCards {
  card1: Card;
  card2: Card;
}

export interface BoardCards {
  flop?: [Card, Card, Card];
  turn?: Card;
  river?: Card;
}

// 플레이어 관련 타입
export interface Player {
  id: string;
  name: string;
  position?: Position;
  stack: number;
  holeCards?: HoleCards;
  role?: PlayerRole;
  vpip?: number;
  pfr?: number;
  af?: number;
  totalHands?: number;
}

export interface PlayerAction {
  playerId: string;
  street: Street;
  action: ActionType;
  amount?: number;
  timestamp: Date;
}

// 핸드 관련 타입
export interface HandData {
  handNumber: number;
  timestamp: Date;
  tableId: string;
  gameType: HandType;
  blinds: {
    small: number;
    big: number;
  };
  players: Player[];
  playersInHand: Player[];
  boardCards: BoardCards;
  actions: PlayerAction[];
  pot: {
    total: number;
    side: number[];
  };
  winner?: Player;
  showdown?: boolean;
  notes?: string;
}

// 상태 관리 타입
export interface AppState {
  currentHandNumber: number;
  selectedTable: string;
  players: Player[];
  playersInHand: Player[];
  currentStreet: Street;
  boardCards: BoardCards;
  actions: PlayerAction[];
  pot: number;
  handHistory: HandData[];
  settings: AppSettings;
  ui: UIState;
}

export interface AppSettings {
  autoSave: boolean;
  theme: 'light' | 'dark';
  language: 'ko' | 'en';
  notifications: boolean;
  soundEffects: boolean;
  googleSheetsUrl?: string;
  apiKey?: string;
}

export interface UIState {
  loading: boolean;
  activeModal?: string;
  selectedPlayer?: string;
  errors: string[];
  notifications: ToastNotification[];
}

// 토스트 알림 타입
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

// API 관련 타입
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: string[];
}

export interface SheetData {
  handNumber: number;
  timestamp: string;
  tableId: string;
  winner: string;
  loser: string;
  pot: number;
  actions: string;
  notes?: string;
}

// 이벤트 타입
export interface EventPayload {
  type: string;
  data?: any;
  timestamp: Date;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
  errors?: string[];
}

// 컴포넌트 Props 타입
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface HandInfoCardProps extends ComponentProps {
  handNumber: number;
  tableId: string;
  onTableChange: (tableId: string) => void;
  onHandNumberChange: (handNumber: number) => void;
}

export interface PlayerCardProps extends ComponentProps {
  player: Player;
  isSelected: boolean;
  onSelect: (player: Player) => void;
  onEdit: (player: Player) => void;
  onRemove: (playerId: string) => void;
}

export interface ActionPadProps extends ComponentProps {
  street: Street;
  availableActions: ActionType[];
  onAction: (action: ActionType, amount?: number) => void;
  disabled?: boolean;
}

export interface CardSelectorProps extends ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (cards: Card[]) => void;
  maxCards?: number;
  selectedCards?: Card[];
}

export interface KeypadProps extends ComponentProps {
  value: number;
  onValueChange: (value: number) => void;
  onConfirm: (value: number) => void;
  onCancel: () => void;
  min?: number;
  max?: number;
}

// 서비스 인터페이스
export interface IApiService {
  sendToSheet(data: SheetData): Promise<ApiResponse>;
  getInitialData(): Promise<ApiResponse>;
  validateConnection(): Promise<boolean>;
}

export interface IStorageService {
  setItem<T>(key: string, value: T): Promise<void>;
  getItem<T>(key: string): Promise<T | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface IValidationService {
  validateHandData(data: HandData): ValidationResult;
  validatePlayerData(player: Player): ValidationResult;
  validateAction(action: PlayerAction): ValidationResult;
}

// 환경 변수 타입
export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  APP_VERSION: string;
  GOOGLE_SHEETS_API_URL?: string;
  GOOGLE_APPS_SCRIPT_URL?: string;
  API_TIMEOUT?: number;
  DEBUG_MODE?: boolean;
}

// 유틸리티 타입
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

// 에러 타입
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 타입 가드
export const isPlayer = (obj: any): obj is Player => {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
};

export const isCard = (obj: any): obj is Card => {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
  return obj && suits.includes(obj.suit) && ranks.includes(obj.rank);
};

export const isValidAction = (action: string): action is ActionType => {
  return ['fold', 'call', 'raise', 'check', 'bet', 'all-in'].includes(action);
};

export const isValidStreet = (street: string): street is Street => {
  return ['preflop', 'flop', 'turn', 'river'].includes(street);
};