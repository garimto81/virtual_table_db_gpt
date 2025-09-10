/**
 * 포커 핸드 로거 v35 - PlayerCard 컴포넌트
 * 플레이어 상세 정보 표시 및 관리
 */

import { Player, PlayerRole, Position, HoleCards, Card, PlayerCardProps } from '@types/index';
import { Config } from '@/config';
import { EventBus } from '@/store/EventBus';
import DOMPurify from 'dompurify';

export class PlayerCard {
  private element: HTMLElement;
  private config: Config;
  private eventBus: EventBus;
  private player: Player;
  private isSelected: boolean = false;
  private isEditing: boolean = false;

  constructor(
    container: HTMLElement,
    player: Player,
    config: Config,
    eventBus: EventBus
  ) {
    this.config = config;
    this.eventBus = eventBus;
    this.player = { ...player };
    
    this.element = this.createElement();
    container.appendChild(this.element);
    
    this.setupEventListeners();
    this.render();
  }

  /**
   * 요소 생성
   */
  private createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'player-card';
    element.dataset.playerId = this.player.id;
    return element;
  }

  /**
   * 렌더링
   */
  private render(): void {
    this.element.innerHTML = this.isEditing ? this.getEditTemplate() : this.getDisplayTemplate();
    this.updateCardClasses();
  }

  /**
   * 표시 템플릿
   */
  private getDisplayTemplate(): string {
    const roleColor = this.getRoleColor(this.player.role);
    const stackFormatted = this.formatStack(this.player.stack);
    const positionBadge = this.player.position ? this.getPositionBadge(this.player.position) : '';

    return `
      <div class="player-card-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="player-avatar ${roleColor}">
              ${this.getPlayerIcon(this.player.role)}
            </div>
            <div>
              <h3 class="player-name">${DOMPurify.sanitize(this.player.name)}</h3>
              <div class="player-meta">
                ${positionBadge}
                <span class="stack-amount">${stackFormatted}</span>
              </div>
            </div>
          </div>
          <div class="player-actions">
            <button class="btn-icon btn-edit" title="편집" data-action="edit">
              ✏️
            </button>
            <button class="btn-icon btn-remove" title="제거" data-action="remove">
              🗑️
            </button>
          </div>
        </div>
      </div>

      <div class="player-card-body">
        <!-- 홀카드 영역 -->
        <div class="hole-cards-section">
          <label class="section-label">홀카드</label>
          <div class="hole-cards ${this.player.holeCards ? 'has-cards' : ''}">
            ${this.renderHoleCards()}
          </div>
          <button class="btn btn-xs btn-secondary set-cards-btn" data-action="set-cards">
            카드 설정
          </button>
        </div>

        <!-- 역할 선택 -->
        <div class="role-section">
          <label class="section-label">역할</label>
          <div class="role-buttons">
            ${this.getRoleButtons()}
          </div>
        </div>

        <!-- 통계 정보 -->
        <div class="stats-section">
          <label class="section-label">통계</label>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">VPIP</span>
              <span class="stat-value">${this.player.vpip || 0}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">PFR</span>
              <span class="stat-value">${this.player.pfr || 0}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">AF</span>
              <span class="stat-value">${this.player.af || 0}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">핸드</span>
              <span class="stat-value">${this.player.totalHands || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 선택 상태 오버레이 -->
      ${this.isSelected ? '<div class="selection-overlay">선택됨</div>' : ''}
    `;
  }

  /**
   * 편집 템플릿
   */
  private getEditTemplate(): string {
    return `
      <div class="player-card-edit">
        <div class="edit-header">
          <h3>플레이어 편집</h3>
          <div class="edit-actions">
            <button class="btn btn-xs btn-primary" data-action="save">저장</button>
            <button class="btn btn-xs btn-secondary" data-action="cancel">취소</button>
          </div>
        </div>

        <div class="edit-form">
          <!-- 기본 정보 -->
          <div class="form-group">
            <label class="form-label">이름 *</label>
            <input 
              type="text" 
              class="form-input" 
              id="edit-name"
              value="${DOMPurify.sanitize(this.player.name)}"
              placeholder="플레이어 이름"
              maxlength="20"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">포지션</label>
            <select class="form-select" id="edit-position">
              <option value="">포지션 선택</option>
              ${this.getPositionOptions()}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">스택 *</label>
            <input 
              type="number" 
              class="form-input" 
              id="edit-stack"
              value="${this.player.stack}"
              min="0"
              step="0.01"
              placeholder="스택 크기"
              required
            />
          </div>

          <!-- 통계 정보 -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">VPIP (%)</label>
              <input 
                type="number" 
                class="form-input" 
                id="edit-vpip"
                value="${this.player.vpip || ''}"
                min="0"
                max="100"
                placeholder="0-100"
              />
            </div>
            <div class="form-group">
              <label class="form-label">PFR (%)</label>
              <input 
                type="number" 
                class="form-input" 
                id="edit-pfr"
                value="${this.player.pfr || ''}"
                min="0"
                max="100"
                placeholder="0-100"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Aggression Factor</label>
              <input 
                type="number" 
                class="form-input" 
                id="edit-af"
                value="${this.player.af || ''}"
                min="0"
                step="0.1"
                placeholder="0.0"
              />
            </div>
            <div class="form-group">
              <label class="form-label">총 핸드 수</label>
              <input 
                type="number" 
                class="form-input" 
                id="edit-hands"
                value="${this.player.totalHands || ''}"
                min="0"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    // 카드 클릭 (선택)
    this.element.addEventListener('click', this.handleCardClick.bind(this));
    
    // 액션 버튼
    this.element.addEventListener('click', this.handleActionClick.bind(this));
    
    // 역할 버튼
    this.element.addEventListener('click', this.handleRoleClick.bind(this));
    
    // 키보드 이벤트
    this.element.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * 카드 클릭 처리
   */
  private handleCardClick(event: Event): void {
    if (this.isEditing) return;

    const target = event.target as HTMLElement;
    if (target.closest('.player-actions') || target.closest('.role-buttons')) return;

    event.preventDefault();
    event.stopPropagation();

    this.toggleSelection();
  }

  /**
   * 액션 클릭 처리
   */
  private handleActionClick(event: Event): void {
    const target = event.target as HTMLElement;
    const action = target.dataset.action;
    
    if (!action) return;

    event.preventDefault();
    event.stopPropagation();

    switch (action) {
      case 'edit':
        this.startEditing();
        break;
      case 'remove':
        this.handleRemove();
        break;
      case 'save':
        this.saveEdit();
        break;
      case 'cancel':
        this.cancelEdit();
        break;
      case 'set-cards':
        this.handleSetCards();
        break;
    }
  }

  /**
   * 역할 클릭 처리
   */
  private handleRoleClick(event: Event): void {
    const target = event.target as HTMLElement;
    const role = target.dataset.role as PlayerRole;
    
    if (!role || this.isEditing) return;

    event.preventDefault();
    event.stopPropagation();

    this.setRole(role);
  }

  /**
   * 키보드 이벤트 처리
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (this.isEditing) {
      if (event.key === 'Enter') {
        this.saveEdit();
      } else if (event.key === 'Escape') {
        this.cancelEdit();
      }
    } else {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        this.handleRemove();
      } else if (event.key === 'e' || event.key === 'E') {
        this.startEditing();
      }
    }
  }

  /**
   * 선택 상태 토글
   */
  private toggleSelection(): void {
    this.isSelected = !this.isSelected;
    this.updateCardClasses();
    
    this.eventBus.emit('player:selection-changed', {
      playerId: this.player.id,
      selected: this.isSelected,
      player: this.player
    });

    if (this.config.isDebugMode) {
      console.log('[PlayerCard] 선택 상태 변경:', this.player.name, this.isSelected);
    }
  }

  /**
   * 역할 설정
   */
  private setRole(role: PlayerRole): void {
    // 같은 역할이면 제거
    if (this.player.role === role) {
      this.player.role = undefined;
    } else {
      this.player.role = role;
    }

    this.render();
    
    this.eventBus.emit('player:role-changed', {
      playerId: this.player.id,
      role: this.player.role,
      player: this.player
    });
  }

  /**
   * 편집 시작
   */
  private startEditing(): void {
    this.isEditing = true;
    this.render();
    
    // 이름 입력 필드에 포커스
    const nameInput = this.element.querySelector('#edit-name') as HTMLInputElement;
    if (nameInput) {
      nameInput.focus();
      nameInput.select();
    }
  }

  /**
   * 편집 저장
   */
  private saveEdit(): void {
    const nameInput = this.element.querySelector('#edit-name') as HTMLInputElement;
    const positionSelect = this.element.querySelector('#edit-position') as HTMLSelectElement;
    const stackInput = this.element.querySelector('#edit-stack') as HTMLInputElement;
    const vpipInput = this.element.querySelector('#edit-vpip') as HTMLInputElement;
    const pfrInput = this.element.querySelector('#edit-pfr') as HTMLInputElement;
    const afInput = this.element.querySelector('#edit-af') as HTMLInputElement;
    const handsInput = this.element.querySelector('#edit-hands') as HTMLInputElement;

    // 유효성 검사
    const name = DOMPurify.sanitize(nameInput?.value.trim() || '');
    const stack = parseFloat(stackInput?.value || '0');

    if (!name) {
      this.showEditError('이름을 입력하세요.');
      nameInput?.focus();
      return;
    }

    if (stack < 0) {
      this.showEditError('스택은 0 이상이어야 합니다.');
      stackInput?.focus();
      return;
    }

    // 데이터 업데이트
    const updatedPlayer: Player = {
      ...this.player,
      name,
      position: (positionSelect?.value as Position) || undefined,
      stack,
      vpip: vpipInput?.value ? parseInt(vpipInput.value) : undefined,
      pfr: pfrInput?.value ? parseInt(pfrInput.value) : undefined,
      af: afInput?.value ? parseFloat(afInput.value) : undefined,
      totalHands: handsInput?.value ? parseInt(handsInput.value) : undefined
    };

    this.player = updatedPlayer;
    this.isEditing = false;
    this.render();

    this.eventBus.emit('player:updated', {
      playerId: this.player.id,
      player: this.player
    });

    this.eventBus.emit('toast:show', {
      type: 'success',
      message: `${this.player.name} 정보가 업데이트되었습니다.`
    });
  }

  /**
   * 편집 취소
   */
  private cancelEdit(): void {
    this.isEditing = false;
    this.render();
  }

  /**
   * 플레이어 제거
   */
  private handleRemove(): void {
    if (confirm(`${this.player.name}을(를) 제거하시겠습니까?`)) {
      this.eventBus.emit('player:removed', {
        playerId: this.player.id,
        player: this.player
      });

      this.destroy();

      this.eventBus.emit('toast:show', {
        type: 'info',
        message: `${this.player.name}이(가) 제거되었습니다.`
      });
    }
  }

  /**
   * 카드 설정 처리
   */
  private handleSetCards(): void {
    this.eventBus.emit('card-selector:open', {
      playerId: this.player.id,
      maxCards: 2,
      selectedCards: this.player.holeCards ? [this.player.holeCards.card1, this.player.holeCards.card2] : []
    });
  }

  /**
   * 홀카드 렌더링
   */
  private renderHoleCards(): string {
    if (!this.player.holeCards) {
      return `
        <div class="empty-cards">
          <div class="empty-card">?</div>
          <div class="empty-card">?</div>
        </div>
      `;
    }

    return `
      <div class="cards">
        ${this.renderCard(this.player.holeCards.card1)}
        ${this.renderCard(this.player.holeCards.card2)}
      </div>
    `;
  }

  /**
   * 카드 렌더링
   */
  private renderCard(card: Card): string {
    const suitSymbol = this.getSuitSymbol(card.suit);
    const suitColor = this.getSuitColor(card.suit);

    return `
      <div class="playing-card ${suitColor}">
        <div class="card-rank">${card.rank}</div>
        <div class="card-suit">${suitSymbol}</div>
      </div>
    `;
  }

  /**
   * 역할 버튼들 렌더링
   */
  private getRoleButtons(): string {
    const roles: { role: PlayerRole; label: string; icon: string }[] = [
      { role: 'winner', label: '승자', icon: '🏆' },
      { role: 'loser', label: '패자', icon: '💸' },
      { role: 'folder', label: '폴드', icon: '🙅' },
      { role: 'spectator', label: '구경', icon: '👀' }
    ];

    return roles.map(({ role, label, icon }) => `
      <button 
        class="role-btn ${this.player.role === role ? 'active' : ''}"
        data-role="${role}"
        title="${label}"
      >
        <span class="role-icon">${icon}</span>
        <span class="role-label">${label}</span>
      </button>
    `).join('');
  }

  /**
   * 포지션 옵션들 렌더링
   */
  private getPositionOptions(): string {
    const positions: Position[] = ['SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'MP', 'CO', 'BTN'];
    
    return positions.map(pos => `
      <option value="${pos}" ${this.player.position === pos ? 'selected' : ''}>${pos}</option>
    `).join('');
  }

  /**
   * 유틸리티 메서드들
   */
  private getRoleColor(role?: PlayerRole): string {
    switch (role) {
      case 'winner': return 'role-winner';
      case 'loser': return 'role-loser';
      case 'folder': return 'role-folder';
      case 'spectator': return 'role-spectator';
      default: return 'role-neutral';
    }
  }

  private getPlayerIcon(role?: PlayerRole): string {
    switch (role) {
      case 'winner': return '🏆';
      case 'loser': return '💸';
      case 'folder': return '🙅';
      case 'spectator': return '👀';
      default: return '👤';
    }
  }

  private getPositionBadge(position: Position): string {
    return `<span class="position-badge position-${position.toLowerCase()}">${position}</span>`;
  }

  private formatStack(stack: number): string {
    if (stack >= 1000000) {
      return `${(stack / 1000000).toFixed(1)}M`;
    } else if (stack >= 1000) {
      return `${(stack / 1000).toFixed(1)}K`;
    }
    return stack.toFixed(2);
  }

  private getSuitSymbol(suit: Card['suit']): string {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
    }
  }

  private getSuitColor(suit: Card['suit']): string {
    return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
  }

  private updateCardClasses(): void {
    this.element.className = `player-card ${this.isSelected ? 'selected' : ''} ${this.isEditing ? 'editing' : ''}`;
    
    if (this.player.role) {
      this.element.classList.add(`role-${this.player.role}`);
    }
  }

  private showEditError(message: string): void {
    this.eventBus.emit('toast:show', {
      type: 'error',
      message
    });
  }

  /**
   * 공개 메서드들
   */
  public updatePlayer(player: Partial<Player>): void {
    this.player = { ...this.player, ...player };
    this.render();
  }

  public setSelected(selected: boolean): void {
    this.isSelected = selected;
    this.updateCardClasses();
  }

  public getPlayer(): Player {
    return { ...this.player };
  }

  public setHoleCards(cards: [Card, Card]): void {
    this.player.holeCards = {
      card1: cards[0],
      card2: cards[1]
    };
    this.render();
    
    this.eventBus.emit('player:cards-updated', {
      playerId: this.player.id,
      holeCards: this.player.holeCards
    });
  }

  /**
   * 컴포넌트 제거
   */
  public destroy(): void {
    this.element.remove();
  }
}