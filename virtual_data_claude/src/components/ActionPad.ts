/**
 * 포커 핸드 로거 v35 - ActionPad 컴포넌트
 * 액션 입력 인터페이스 (폴드, 콜, 레이즈, 체크, 베팅, 올인)
 */

import { ActionType, Street, ActionPadProps, PlayerAction } from '@types/index';
import { Config } from '@/config';
import { EventBus } from '@/store/EventBus';
import { Keypad } from './Keypad';
import DOMPurify from 'dompurify';

export class ActionPad {
  private element: HTMLElement;
  private config: Config;
  private eventBus: EventBus;
  private currentStreet: Street = 'preflop';
  private availableActions: ActionType[] = ['fold', 'call', 'raise', 'check', 'bet'];
  private disabled: boolean = false;
  private keypad: Keypad | null = null;
  private currentAction: ActionType | null = null;
  private potSize: number = 0;
  private currentBet: number = 0;
  private actionHistory: PlayerAction[] = [];

  constructor(
    container: HTMLElement,
    config: Config,
    eventBus: EventBus,
    options: Partial<ActionPadProps> = {}
  ) {
    this.config = config;
    this.eventBus = eventBus;
    this.disabled = options.disabled || false;

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
    element.className = 'action-pad';
    return element;
  }

  /**
   * 렌더링
   */
  private render(): void {
    this.element.innerHTML = this.getTemplate();
    this.updateActionStates();
  }

  /**
   * 템플릿 반환
   */
  private getTemplate(): string {
    return `
      <div class="action-pad-header">
        <div class="street-indicator">
          <span class="current-street">${this.getStreetLabel(this.currentStreet)}</span>
          <div class="pot-info">
            <span class="pot-label">팟:</span>
            <span class="pot-amount">${this.formatAmount(this.potSize)}</span>
          </div>
        </div>
        <div class="bet-info ${this.currentBet > 0 ? 'visible' : 'hidden'}">
          <span class="bet-label">현재 베팅:</span>
          <span class="bet-amount">${this.formatAmount(this.currentBet)}</span>
        </div>
      </div>

      <div class="action-buttons-grid">
        ${this.renderActionButtons()}
      </div>

      <!-- 베팅 크기 선택 -->
      <div id="bet-sizing" class="bet-sizing hidden">
        <div class="sizing-header">
          <h4>베팅 크기</h4>
          <button class="btn-close" data-action="close-sizing">×</button>
        </div>
        
        <!-- 프리셋 베팅 버튼들 -->
        <div class="preset-bets">
          ${this.renderPresetBets()}
        </div>

        <!-- 커스텀 베팅 입력 -->
        <div class="custom-bet-input">
          <label class="form-label">커스텀 베팅</label>
          <div class="input-group">
            <input 
              type="number" 
              id="custom-bet-amount"
              class="form-input"
              min="0"
              step="0.01"
              placeholder="금액 입력"
            />
            <button class="btn btn-primary" data-action="custom-bet">
              확인
            </button>
          </div>
        </div>

        <!-- 키패드 버튼 -->
        <div class="keypad-section">
          <button class="btn btn-secondary w-full" data-action="open-keypad">
            🔢 키패드 열기
          </button>
        </div>
      </div>

      <!-- 액션 히스토리 -->
      <div class="action-history">
        <div class="history-header">
          <h5>액션 히스토리</h5>
          <button class="btn btn-xs btn-outline" data-action="clear-history">
            지우기
          </button>
        </div>
        <div class="history-list">
          ${this.renderActionHistory()}
        </div>
      </div>

      <!-- 단축키 도움말 -->
      <div class="shortcuts-help ${this.config.getSetting('showShortcuts') ? '' : 'hidden'}">
        <div class="shortcuts-title">단축키</div>
        <div class="shortcuts-list">
          <div class="shortcut-item">
            <kbd>F</kbd> <span>폴드</span>
          </div>
          <div class="shortcut-item">
            <kbd>C</kbd> <span>콜</span>
          </div>
          <div class="shortcut-item">
            <kbd>R</kbd> <span>레이즈</span>
          </div>
          <div class="shortcut-item">
            <kbd>B</kbd> <span>베팅</span>
          </div>
          <div class="shortcut-item">
            <kbd>K</kbd> <span>체크</span>
          </div>
          <div class="shortcut-item">
            <kbd>A</kbd> <span>올인</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 액션 버튼들 렌더링
   */
  private renderActionButtons(): string {
    const actionConfigs = [
      { action: 'fold', label: '폴드', icon: '🙅', color: 'danger', key: 'F' },
      { action: 'call', label: '콜', icon: '✅', color: 'success', key: 'C' },
      { action: 'raise', label: '레이즈', icon: '📈', color: 'warning', key: 'R' },
      { action: 'check', label: '체크', icon: '✋', color: 'secondary', key: 'K' },
      { action: 'bet', label: '베팅', icon: '💰', color: 'primary', key: 'B' },
      { action: 'all-in', label: '올인', icon: '🎯', color: 'danger', key: 'A' }
    ];

    return actionConfigs.map(({ action, label, icon, color, key }) => {
      const isAvailable = this.availableActions.includes(action as ActionType);
      const isDisabled = this.disabled || !isAvailable;

      return `
        <button 
          class="action-btn action-${action} btn-${color} ${isDisabled ? 'disabled' : ''}"
          data-action="${action}"
          data-key="${key}"
          ${isDisabled ? 'disabled' : ''}
          title="${label} (단축키: ${key})"
        >
          <div class="action-icon">${icon}</div>
          <div class="action-label">${label}</div>
          <div class="action-key">
            <kbd>${key}</kbd>
          </div>
        </button>
      `;
    }).join('');
  }

  /**
   * 프리셋 베팅 버튼들 렌더링
   */
  private renderPresetBets(): string {
    const presets = this.getBetPresets();
    
    return presets.map(({ label, amount, description }) => `
      <button 
        class="preset-bet-btn"
        data-action="preset-bet"
        data-amount="${amount}"
        title="${description}"
      >
        <div class="preset-label">${label}</div>
        <div class="preset-amount">${this.formatAmount(amount)}</div>
      </button>
    `).join('');
  }

  /**
   * 액션 히스토리 렌더링
   */
  private renderActionHistory(): string {
    if (this.actionHistory.length === 0) {
      return '<div class="empty-history">아직 액션이 없습니다</div>';
    }

    return this.actionHistory.slice(-5).map(action => `
      <div class="history-item">
        <div class="history-action ${action.action}">
          ${this.getActionIcon(action.action)} ${this.getActionLabel(action.action)}
        </div>
        <div class="history-amount">
          ${action.amount ? this.formatAmount(action.amount) : ''}
        </div>
        <div class="history-time">
          ${this.formatTime(action.timestamp)}
        </div>
      </div>
    `).join('');
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    // 액션 버튼 클릭
    this.element.addEventListener('click', this.handleClick.bind(this));

    // 키보드 단축키
    document.addEventListener('keydown', this.handleKeyDown.bind(this));

    // 외부 이벤트
    this.eventBus.on('street:changed', this.handleStreetChange.bind(this));
    this.eventBus.on('pot:updated', this.handlePotUpdate.bind(this));
    this.eventBus.on('bet:updated', this.handleBetUpdate.bind(this));
    this.eventBus.on('actions:updated', this.handleActionsUpdate.bind(this));
    
    // 키패드 이벤트
    this.eventBus.on('keypad:value-confirmed', this.handleKeypadConfirmed.bind(this));
  }

  /**
   * 클릭 이벤트 처리
   */
  private handleClick(event: Event): void {
    const target = event.target as HTMLElement;
    const button = target.closest('[data-action]') as HTMLElement;
    
    if (!button) return;

    const action = button.dataset.action;
    if (!action) return;

    event.preventDefault();
    event.stopPropagation();

    this.handleAction(action, button);
  }

  /**
   * 액션 처리
   */
  private handleAction(action: string, button: HTMLElement): void {
    switch (action) {
      case 'fold':
      case 'call':
      case 'check':
        this.executeAction(action as ActionType);
        break;
        
      case 'raise':
      case 'bet':
        this.openBetSizing(action as ActionType);
        break;
        
      case 'all-in':
        this.handleAllIn();
        break;
        
      case 'preset-bet':
        this.handlePresetBet(button);
        break;
        
      case 'custom-bet':
        this.handleCustomBet();
        break;
        
      case 'open-keypad':
        this.openKeypad();
        break;
        
      case 'close-sizing':
        this.closeBetSizing();
        break;
        
      case 'clear-history':
        this.clearHistory();
        break;
    }
  }

  /**
   * 키보드 이벤트 처리
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (this.disabled) return;
    
    // 입력 필드에서는 단축키 비활성화
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    const key = event.key.toLowerCase();
    const actionMap: { [key: string]: ActionType } = {
      'f': 'fold',
      'c': 'call',
      'r': 'raise',
      'k': 'check',
      'b': 'bet',
      'a': 'all-in'
    };

    const action = actionMap[key];
    if (action && this.availableActions.includes(action)) {
      event.preventDefault();
      
      if (action === 'fold' || action === 'call' || action === 'check') {
        this.executeAction(action);
      } else {
        this.currentAction = action;
        this.openBetSizing(action);
      }
    }

    // ESC 키로 베팅 사이징 닫기
    if (event.key === 'Escape') {
      this.closeBetSizing();
    }
  }

  /**
   * 액션 실행
   */
  private executeAction(action: ActionType, amount?: number): void {
    if (this.disabled || !this.availableActions.includes(action)) {
      return;
    }

    const actionData: PlayerAction = {
      playerId: '', // 현재 선택된 플레이어 ID가 필요
      street: this.currentStreet,
      action,
      amount,
      timestamp: new Date()
    };

    // 액션 히스토리에 추가
    this.actionHistory.push(actionData);

    // 이벤트 발생
    this.eventBus.emit('action:executed', actionData);

    // 사운드 재생
    if (this.config.getSetting('soundEffects')) {
      this.playActionSound(action);
    }

    // 베팅 사이징 닫기
    this.closeBetSizing();

    // 렌더링 업데이트
    this.render();

    if (this.config.isDebugMode) {
      console.log('[ActionPad] 액션 실행:', action, amount);
    }
  }

  /**
   * 베팅 사이징 열기
   */
  private openBetSizing(action: ActionType): void {
    this.currentAction = action;
    const betSizing = this.element.querySelector('#bet-sizing');
    if (betSizing) {
      betSizing.classList.remove('hidden');
    }

    // 헤더 업데이트
    const header = betSizing?.querySelector('.sizing-header h4');
    if (header) {
      header.textContent = action === 'raise' ? '레이즈 크기' : '베팅 크기';
    }
  }

  /**
   * 베팅 사이징 닫기
   */
  private closeBetSizing(): void {
    const betSizing = this.element.querySelector('#bet-sizing');
    if (betSizing) {
      betSizing.classList.add('hidden');
    }
    this.currentAction = null;
  }

  /**
   * 올인 처리
   */
  private handleAllIn(): void {
    // 현재 선택된 플레이어의 스택 크기 가져오기
    this.eventBus.emit('player:get-selected-stack', (stackSize: number) => {
      if (stackSize > 0) {
        this.executeAction('all-in', stackSize);
      } else {
        this.eventBus.emit('toast:show', {
          type: 'warning',
          message: '플레이어를 선택하고 스택 정보를 확인하세요.'
        });
      }
    });
  }

  /**
   * 프리셋 베팅 처리
   */
  private handlePresetBet(button: HTMLElement): void {
    const amount = parseFloat(button.dataset.amount || '0');
    if (this.currentAction && amount > 0) {
      this.executeAction(this.currentAction, amount);
    }
  }

  /**
   * 커스텀 베팅 처리
   */
  private handleCustomBet(): void {
    const input = this.element.querySelector('#custom-bet-amount') as HTMLInputElement;
    const amount = parseFloat(input?.value || '0');

    if (!this.currentAction) return;

    if (amount <= 0) {
      this.eventBus.emit('toast:show', {
        type: 'warning',
        message: '유효한 금액을 입력하세요.'
      });
      input?.focus();
      return;
    }

    this.executeAction(this.currentAction, amount);
  }

  /**
   * 키패드 열기
   */
  private openKeypad(): void {
    if (!this.keypad && this.currentAction) {
      const container = document.body;
      this.keypad = new Keypad(container, this.config, this.eventBus, {
        value: 0,
        onValueChange: () => {},
        onConfirm: (value: number) => {
          if (this.currentAction) {
            this.executeAction(this.currentAction, value);
          }
          this.closeKeypad();
        },
        onCancel: () => {
          this.closeKeypad();
        },
        min: 0.01
      });
    }
  }

  /**
   * 키패드 닫기
   */
  private closeKeypad(): void {
    if (this.keypad) {
      this.keypad.destroy();
      this.keypad = null;
    }
  }

  /**
   * 키패드 확인 처리
   */
  private handleKeypadConfirmed(data: { value: number }): void {
    if (this.currentAction) {
      this.executeAction(this.currentAction, data.value);
    }
    this.closeKeypad();
  }

  /**
   * 히스토리 지우기
   */
  private clearHistory(): void {
    this.actionHistory = [];
    this.render();
    
    this.eventBus.emit('toast:show', {
      type: 'info',
      message: '액션 히스토리가 지워졌습니다.'
    });
  }

  /**
   * 외부 이벤트 처리
   */
  private handleStreetChange(data: { street: Street }): void {
    this.currentStreet = data.street;
    this.updateAvailableActions();
    this.render();
  }

  private handlePotUpdate(data: { pot: number }): void {
    this.potSize = data.pot;
    this.render();
  }

  private handleBetUpdate(data: { bet: number }): void {
    this.currentBet = data.bet;
    this.render();
  }

  private handleActionsUpdate(data: { actions: PlayerAction[] }): void {
    this.actionHistory = data.actions;
    this.render();
  }

  /**
   * 유틸리티 메서드들
   */
  private getBetPresets(): Array<{ label: string; amount: number; description: string }> {
    const bb = this.currentBet || 2; // 기본 빅블라인드
    const pot = this.potSize || 4;

    return [
      { label: '1/4 팟', amount: pot * 0.25, description: '팟의 1/4 베팅' },
      { label: '1/2 팟', amount: pot * 0.5, description: '팟의 1/2 베팅' },
      { label: '2/3 팟', amount: pot * 0.67, description: '팟의 2/3 베팅' },
      { label: '팟', amount: pot, description: '팟 사이즈 베팅' },
      { label: '3BB', amount: bb * 3, description: '3 빅블라인드' },
      { label: '5BB', amount: bb * 5, description: '5 빅블라인드' }
    ];
  }

  private updateAvailableActions(): void {
    // 스트리트와 상황에 따라 사용 가능한 액션 업데이트
    const baseActions: ActionType[] = ['fold', 'call', 'raise'];
    
    if (this.currentBet === 0) {
      baseActions.push('check', 'bet');
    }
    
    baseActions.push('all-in');
    
    this.availableActions = baseActions;
  }

  private updateActionStates(): void {
    this.element.querySelectorAll('.action-btn').forEach(button => {
      const action = (button as HTMLElement).dataset.action as ActionType;
      const isAvailable = this.availableActions.includes(action);
      const isDisabled = this.disabled || !isAvailable;

      button.classList.toggle('disabled', isDisabled);
      (button as HTMLButtonElement).disabled = isDisabled;
    });
  }

  private getStreetLabel(street: Street): string {
    const labels = {
      'preflop': '프리플랍',
      'flop': '플랍',
      'turn': '턴',
      'river': '리버'
    };
    return labels[street];
  }

  private getActionLabel(action: ActionType): string {
    const labels = {
      'fold': '폴드',
      'call': '콜',
      'raise': '레이즈',
      'check': '체크',
      'bet': '베팅',
      'all-in': '올인'
    };
    return labels[action];
  }

  private getActionIcon(action: ActionType): string {
    const icons = {
      'fold': '🙅',
      'call': '✅',
      'raise': '📈',
      'check': '✋',
      'bet': '💰',
      'all-in': '🎯'
    };
    return icons[action];
  }

  private formatAmount(amount: number): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toFixed(2);
  }

  private formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  private playActionSound(action: ActionType): void {
    // 액션별 사운드 재생 (Web Audio API 사용)
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 액션별 주파수
      const frequencies = {
        'fold': 200,
        'call': 400,
        'raise': 600,
        'check': 300,
        'bet': 500,
        'all-in': 800
      };

      oscillator.frequency.value = frequencies[action];
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('[ActionPad] 사운드 재생 실패:', error);
    }
  }

  /**
   * 공개 메서드들
   */
  public setStreet(street: Street): void {
    this.currentStreet = street;
    this.updateAvailableActions();
    this.render();
  }

  public setAvailableActions(actions: ActionType[]): void {
    this.availableActions = actions;
    this.updateActionStates();
  }

  public setDisabled(disabled: boolean): void {
    this.disabled = disabled;
    this.updateActionStates();
  }

  public setPot(pot: number): void {
    this.potSize = pot;
    this.render();
  }

  public setBet(bet: number): void {
    this.currentBet = bet;
    this.render();
  }

  public getActionHistory(): PlayerAction[] {
    return [...this.actionHistory];
  }

  /**
   * 컴포넌트 제거
   */
  public destroy(): void {
    // 이벤트 리스너 제거
    document.removeEventListener('keydown', this.handleKeyDown);
    this.eventBus.off('street:changed', this.handleStreetChange);
    this.eventBus.off('pot:updated', this.handlePotUpdate);
    this.eventBus.off('bet:updated', this.handleBetUpdate);
    this.eventBus.off('actions:updated', this.handleActionsUpdate);
    this.eventBus.off('keypad:value-confirmed', this.handleKeypadConfirmed);

    // 키패드 정리
    if (this.keypad) {
      this.keypad.destroy();
    }

    // 요소 제거
    this.element.remove();
  }
}