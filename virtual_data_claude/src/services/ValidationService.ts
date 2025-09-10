/**
 * 포커 핸드 로거 v35 - ValidationService
 * 데이터 검증 서비스
 */

import { 
  IValidationService, 
  ValidationResult, 
  HandData, 
  Player, 
  PlayerAction, 
  Card,
  Street,
  ActionType,
  PlayerRole 
} from '@types/index';
import { DEFAULT_CONFIG } from '@/config';
import DOMPurify from 'dompurify';

export class ValidationService implements IValidationService {
  private readonly MAX_PLAYERS = DEFAULT_CONFIG.MAX_PLAYERS;
  private readonly MIN_PLAYERS = DEFAULT_CONFIG.MIN_PLAYERS;
  private readonly VALID_SUITS = DEFAULT_CONFIG.CARD_SUITS;
  private readonly VALID_RANKS = DEFAULT_CONFIG.CARD_RANKS;
  private readonly VALID_STREETS = DEFAULT_CONFIG.STREETS;
  private readonly VALID_ACTIONS = DEFAULT_CONFIG.ACTION_TYPES;

  /**
   * 핸드 데이터 유효성 검사
   */
  validateHandData(data: HandData): ValidationResult {
    const errors: string[] = [];

    try {
      // 기본 필드 검사
      if (!this.validateHandNumber(data.handNumber)) {
        errors.push('유효한 핸드 번호가 필요합니다 (1 이상의 정수).');
      }

      if (!this.validateTableId(data.tableId)) {
        errors.push('유효한 테이블 ID가 필요합니다.');
      }

      if (!this.validateTimestamp(data.timestamp)) {
        errors.push('유효한 타임스탬프가 필요합니다.');
      }

      // 게임 타입 검사
      if (!['cash', 'tournament', 'sit-n-go'].includes(data.gameType)) {
        errors.push('유효한 게임 타입이 필요합니다.');
      }

      // 블라인드 검사
      const blindsValidation = this.validateBlinds(data.blinds);
      if (!blindsValidation.valid && blindsValidation.errors) {
        errors.push(...blindsValidation.errors);
      }

      // 플레이어 검사
      const playersValidation = this.validatePlayers(data.players);
      if (!playersValidation.valid && playersValidation.errors) {
        errors.push(...playersValidation.errors);
      }

      // 핸드 참여 플레이어 검사
      const participantsValidation = this.validateHandParticipants(data.playersInHand, data.players);
      if (!participantsValidation.valid && participantsValidation.errors) {
        errors.push(...participantsValidation.errors);
      }

      // 보드카드 검사
      const boardValidation = this.validateBoardCards(data.boardCards);
      if (!boardValidation.valid && boardValidation.errors) {
        errors.push(...boardValidation.errors);
      }

      // 액션 검사
      const actionsValidation = this.validateActions(data.actions, data.playersInHand);
      if (!actionsValidation.valid && actionsValidation.errors) {
        errors.push(...actionsValidation.errors);
      }

      // 팟 검사
      const potValidation = this.validatePot(data.pot);
      if (!potValidation.valid && potValidation.errors) {
        errors.push(...potValidation.errors);
      }

      // 승자 검사
      if (data.winner) {
        const winnerValidation = this.validateWinner(data.winner, data.playersInHand);
        if (!winnerValidation.valid && winnerValidation.errors) {
          errors.push(...winnerValidation.errors);
        }
      }

      // 일관성 검사
      const consistencyValidation = this.validateDataConsistency(data);
      if (!consistencyValidation.valid && consistencyValidation.errors) {
        errors.push(...consistencyValidation.errors);
      }

    } catch (error) {
      errors.push(`검증 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * 플레이어 데이터 유효성 검사
   */
  validatePlayerData(player: Player): ValidationResult {
    const errors: string[] = [];

    try {
      // 필수 필드 검사
      if (!this.validatePlayerId(player.id)) {
        errors.push('유효한 플레이어 ID가 필요합니다.');
      }

      if (!this.validatePlayerName(player.name)) {
        errors.push('유효한 플레이어 이름이 필요합니다 (1-20자).');
      }

      // 스택 검사
      if (!this.validateStack(player.stack)) {
        errors.push('유효한 스택 크기가 필요합니다 (0 이상의 숫자).');
      }

      // 포지션 검사 (선택적)
      if (player.position && !this.validatePosition(player.position)) {
        errors.push('유효하지 않은 포지션입니다.');
      }

      // 홀카드 검사 (선택적)
      if (player.holeCards) {
        const cardsValidation = this.validateHoleCards(player.holeCards);
        if (!cardsValidation.valid && cardsValidation.errors) {
          errors.push(...cardsValidation.errors);
        }
      }

      // 역할 검사 (선택적)
      if (player.role && !this.validatePlayerRole(player.role)) {
        errors.push('유효하지 않은 플레이어 역할입니다.');
      }

      // 통계 검사 (선택적)
      if (player.vpip !== undefined && !this.validatePercentage(player.vpip)) {
        errors.push('VPIP는 0-100 사이의 값이어야 합니다.');
      }

      if (player.pfr !== undefined && !this.validatePercentage(player.pfr)) {
        errors.push('PFR은 0-100 사이의 값이어야 합니다.');
      }

      if (player.af !== undefined && !this.validateAggressionFactor(player.af)) {
        errors.push('Aggression Factor는 0 이상의 값이어야 합니다.');
      }

      if (player.totalHands !== undefined && !this.validateHandsCount(player.totalHands)) {
        errors.push('총 핸드 수는 0 이상의 정수여야 합니다.');
      }

    } catch (error) {
      errors.push(`플레이어 검증 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * 액션 유효성 검사
   */
  validateAction(action: PlayerAction): ValidationResult {
    const errors: string[] = [];

    try {
      // 필수 필드 검사
      if (!this.validatePlayerId(action.playerId)) {
        errors.push('유효한 플레이어 ID가 필요합니다.');
      }

      if (!this.validateStreet(action.street)) {
        errors.push('유효한 스트리트가 필요합니다.');
      }

      if (!this.validateActionType(action.action)) {
        errors.push('유효한 액션 타입이 필요합니다.');
      }

      if (!this.validateTimestamp(action.timestamp)) {
        errors.push('유효한 타임스탬프가 필요합니다.');
      }

      // 액션별 금액 검사
      if (['raise', 'bet', 'all-in'].includes(action.action)) {
        if (action.amount === undefined || action.amount <= 0) {
          errors.push(`${action.action} 액션에는 유효한 금액이 필요합니다.`);
        }
      } else if (['fold', 'check'].includes(action.action)) {
        if (action.amount !== undefined) {
          errors.push(`${action.action} 액션에는 금액이 필요하지 않습니다.`);
        }
      }

    } catch (error) {
      errors.push(`액션 검증 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * 개별 유효성 검사 함수들
   */
  private validateHandNumber(handNumber: number): boolean {
    return Number.isInteger(handNumber) && handNumber > 0;
  }

  private validateTableId(tableId: string): boolean {
    const sanitized = DOMPurify.sanitize(tableId);
    return typeof sanitized === 'string' && 
           sanitized.length > 0 && 
           sanitized.length <= 50 &&
           /^[a-zA-Z0-9_-]+$/.test(sanitized);
  }

  private validateTimestamp(timestamp: Date): boolean {
    return timestamp instanceof Date && !isNaN(timestamp.getTime());
  }

  private validateBlinds(blinds: { small: number; big: number }): ValidationResult {
    const errors: string[] = [];

    if (typeof blinds.small !== 'number' || blinds.small <= 0) {
      errors.push('스몰 블라인드는 0보다 큰 숫자여야 합니다.');
    }

    if (typeof blinds.big !== 'number' || blinds.big <= 0) {
      errors.push('빅 블라인드는 0보다 큰 숫자여야 합니다.');
    }

    if (blinds.small >= blinds.big) {
      errors.push('빅 블라인드는 스몰 블라인드보다 커야 합니다.');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  private validatePlayers(players: Player[]): ValidationResult {
    const errors: string[] = [];

    if (!Array.isArray(players)) {
      errors.push('플레이어 목록은 배열이어야 합니다.');
      return { valid: false, errors };
    }

    if (players.length < this.MIN_PLAYERS || players.length > this.MAX_PLAYERS) {
      errors.push(`플레이어는 ${this.MIN_PLAYERS}명에서 ${this.MAX_PLAYERS}명 사이여야 합니다.`);
    }

    // 중복 ID 검사
    const playerIds = players.map(p => p.id);
    const duplicateIds = playerIds.filter((id, index) => playerIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`중복된 플레이어 ID가 있습니다: ${duplicateIds.join(', ')}`);
    }

    // 각 플레이어 검증
    players.forEach((player, index) => {
      const validation = this.validatePlayerData(player);
      if (!validation.valid && validation.errors) {
        validation.errors.forEach(error => {
          errors.push(`플레이어 ${index + 1}: ${error}`);
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  private validateHandParticipants(participants: Player[], allPlayers: Player[]): ValidationResult {
    const errors: string[] = [];

    if (!Array.isArray(participants)) {
      errors.push('핸드 참여자 목록은 배열이어야 합니다.');
      return { valid: false, errors };
    }

    if (participants.length < 2) {
      errors.push('핸드에는 최소 2명의 플레이어가 참여해야 합니다.');
    }

    // 모든 참여자가 플레이어 목록에 있는지 확인
    const allPlayerIds = allPlayers.map(p => p.id);
    participants.forEach(participant => {
      if (!allPlayerIds.includes(participant.id)) {
        errors.push(`참여자 ${participant.name}이(가) 플레이어 목록에 없습니다.`);
      }
    });

    // 역할 검증
    const winners = participants.filter(p => p.role === 'winner');
    const losers = participants.filter(p => p.role === 'loser');

    if (winners.length === 0) {
      errors.push('승자가 지정되지 않았습니다.');
    }

    if (winners.length > 1) {
      errors.push('승자는 한 명만 지정할 수 있습니다.');
    }

    if (losers.length === 0) {
      errors.push('패자가 지정되지 않았습니다.');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  private validateBoardCards(boardCards: any): ValidationResult {
    const errors: string[] = [];

    if (!boardCards || typeof boardCards !== 'object') {
      // 보드카드는 선택적이므로 빈 값 허용
      return { valid: true };
    }

    // 플랍 검사
    if (boardCards.flop) {
      if (!Array.isArray(boardCards.flop) || boardCards.flop.length !== 3) {
        errors.push('플랍은 정확히 3장의 카드여야 합니다.');
      } else {
        boardCards.flop.forEach((card: Card, index: number) => {
          if (!this.validateCard(card)) {
            errors.push(`플랍 카드 ${index + 1}이(가) 유효하지 않습니다.`);
          }
        });
      }
    }

    // 턴 검사
    if (boardCards.turn && !this.validateCard(boardCards.turn)) {
      errors.push('턴 카드가 유효하지 않습니다.');
    }

    // 리버 검사
    if (boardCards.river && !this.validateCard(boardCards.river)) {
      errors.push('리버 카드가 유효하지 않습니다.');
    }

    // 중복 카드 검사
    const allBoardCards: Card[] = [];
    if (boardCards.flop) allBoardCards.push(...boardCards.flop);
    if (boardCards.turn) allBoardCards.push(boardCards.turn);
    if (boardCards.river) allBoardCards.push(boardCards.river);

    const duplicates = this.findDuplicateCards(allBoardCards);
    if (duplicates.length > 0) {
      errors.push('보드카드에 중복된 카드가 있습니다.');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  private validateActions(actions: PlayerAction[], players: Player[]): ValidationResult {
    const errors: string[] = [];

    if (!Array.isArray(actions)) {
      errors.push('액션 목록은 배열이어야 합니다.');
      return { valid: false, errors };
    }

    const playerIds = players.map(p => p.id);

    actions.forEach((action, index) => {
      const validation = this.validateAction(action);
      if (!validation.valid && validation.errors) {
        validation.errors.forEach(error => {
          errors.push(`액션 ${index + 1}: ${error}`);
        });
      }

      // 플레이어 존재 여부 확인
      if (!playerIds.includes(action.playerId)) {
        errors.push(`액션 ${index + 1}: 존재하지 않는 플레이어 ID입니다.`);
      }
    });

    // 액션 순서 검사
    const streetOrder: Street[] = ['preflop', 'flop', 'turn', 'river'];
    let currentStreetIndex = 0;

    for (const action of actions) {
      const streetIndex = streetOrder.indexOf(action.street);
      if (streetIndex < currentStreetIndex) {
        errors.push('액션이 시간순으로 정렬되지 않았습니다.');
        break;
      }
      currentStreetIndex = streetIndex;
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  private validatePot(pot: { total: number; side: number[] }): ValidationResult {
    const errors: string[] = [];

    if (typeof pot.total !== 'number' || pot.total < 0) {
      errors.push('총 팟 크기는 0 이상의 숫자여야 합니다.');
    }

    if (!Array.isArray(pot.side)) {
      errors.push('사이드 팟은 배열이어야 합니다.');
    } else {
      pot.side.forEach((amount, index) => {
        if (typeof amount !== 'number' || amount < 0) {
          errors.push(`사이드 팟 ${index + 1}은(는) 0 이상의 숫자여야 합니다.`);
        }
      });
    }

    // 사이드 팟 합계가 총 팟을 초과하지 않는지 확인
    const sideTotal = pot.side.reduce((sum, amount) => sum + amount, 0);
    if (sideTotal > pot.total) {
      errors.push('사이드 팟의 합계가 총 팟 크기를 초과할 수 없습니다.');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  private validateWinner(winner: Player, participants: Player[]): ValidationResult {
    const errors: string[] = [];

    const participantIds = participants.map(p => p.id);
    if (!participantIds.includes(winner.id)) {
      errors.push('승자는 핸드 참여자 중 한 명이어야 합니다.');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  private validateDataConsistency(data: HandData): ValidationResult {
    const errors: string[] = [];

    // 홀카드와 보드카드 중복 검사
    const allCards: Card[] = [];

    // 플레이어 홀카드 수집
    data.playersInHand.forEach(player => {
      if (player.holeCards) {
        allCards.push(player.holeCards.card1, player.holeCards.card2);
      }
    });

    // 보드카드 수집
    if (data.boardCards.flop) {
      allCards.push(...data.boardCards.flop);
    }
    if (data.boardCards.turn) {
      allCards.push(data.boardCards.turn);
    }
    if (data.boardCards.river) {
      allCards.push(data.boardCards.river);
    }

    const duplicates = this.findDuplicateCards(allCards);
    if (duplicates.length > 0) {
      errors.push('홀카드와 보드카드에 중복된 카드가 있습니다.');
    }

    // 쇼다운 일관성 검사
    if (data.showdown && !data.winner) {
      errors.push('쇼다운이 있는 경우 승자가 지정되어야 합니다.');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  // 헬퍼 메서드들
  private validatePlayerId(id: string): boolean {
    const sanitized = DOMPurify.sanitize(id);
    return typeof sanitized === 'string' && sanitized.length > 0 && sanitized.length <= 50;
  }

  private validatePlayerName(name: string): boolean {
    const sanitized = DOMPurify.sanitize(name);
    return typeof sanitized === 'string' && 
           sanitized.trim().length > 0 && 
           sanitized.length <= 20;
  }

  private validateStack(stack: number): boolean {
    return typeof stack === 'number' && stack >= 0 && Number.isFinite(stack);
  }

  private validatePosition(position: string): boolean {
    return DEFAULT_CONFIG.POSITIONS.includes(position as any);
  }

  private validatePlayerRole(role: PlayerRole): boolean {
    return DEFAULT_CONFIG.PLAYER_ROLES.includes(role as any);
  }

  private validateHoleCards(holeCards: any): ValidationResult {
    const errors: string[] = [];

    if (!holeCards || typeof holeCards !== 'object') {
      errors.push('홀카드는 객체여야 합니다.');
      return { valid: false, errors };
    }

    if (!this.validateCard(holeCards.card1)) {
      errors.push('첫 번째 홀카드가 유효하지 않습니다.');
    }

    if (!this.validateCard(holeCards.card2)) {
      errors.push('두 번째 홀카드가 유효하지 않습니다.');
    }

    // 중복 검사
    if (holeCards.card1 && holeCards.card2 &&
        holeCards.card1.suit === holeCards.card2.suit &&
        holeCards.card1.rank === holeCards.card2.rank) {
      errors.push('홀카드에 같은 카드가 두 장 있을 수 없습니다.');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  private validateCard(card: Card): boolean {
    if (!card || typeof card !== 'object') return false;
    
    return this.VALID_SUITS.includes(card.suit as any) && 
           this.VALID_RANKS.includes(card.rank as any);
  }

  private validateStreet(street: Street): boolean {
    return this.VALID_STREETS.includes(street as any);
  }

  private validateActionType(action: ActionType): boolean {
    return this.VALID_ACTIONS.includes(action as any);
  }

  private validatePercentage(value: number): boolean {
    return typeof value === 'number' && value >= 0 && value <= 100;
  }

  private validateAggressionFactor(value: number): boolean {
    return typeof value === 'number' && value >= 0 && Number.isFinite(value);
  }

  private validateHandsCount(value: number): boolean {
    return Number.isInteger(value) && value >= 0;
  }

  private findDuplicateCards(cards: Card[]): Card[] {
    const seen = new Set<string>();
    const duplicates: Card[] = [];

    for (const card of cards) {
      const cardKey = `${card.suit}-${card.rank}`;
      if (seen.has(cardKey)) {
        duplicates.push(card);
      } else {
        seen.add(cardKey);
      }
    }

    return duplicates;
  }

  /**
   * 배치 검증 (여러 항목 동시 검증)
   */
  public validateBatch(items: any[], validator: (item: any) => ValidationResult): ValidationResult {
    const errors: string[] = [];

    items.forEach((item, index) => {
      const result = validator(item);
      if (!result.valid && result.errors) {
        result.errors.forEach(error => {
          errors.push(`항목 ${index + 1}: ${error}`);
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * 커스텀 검증 규칙 추가
   */
  public addCustomRule(name: string, validator: (value: any) => boolean, message: string): void {
    // 동적 검증 규칙 추가 (확장 가능)
    console.log(`[ValidationService] 커스텀 규칙 추가: ${name}`);
  }
}