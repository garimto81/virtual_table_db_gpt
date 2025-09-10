/**
 * 포커 핸드 로거 v35 - HandInfoCard 컴포넌트
 * 핸드 정보 관리 (핸드 번호, 테이블 선택, 블라인드 등)
 */

import { HandInfoCardProps, Player, ValidationResult } from '@types/index';
import { Config } from '@/config';
import { EventBus } from '@/store/EventBus';
import DOMPurify from 'dompurify';

export class HandInfoCard {
  private element: HTMLElement;
  private config: Config;
  private eventBus: EventBus;
  private handNumber: number = 1;
  private tableId: string = '';
  private availableTables: string[] = [];
  private players: Player[] = [];

  constructor(
    container: HTMLElement,
    config: Config,
    eventBus: EventBus
  ) {
    this.config = config;
    this.eventBus = eventBus;
    this.element = this.createElement();
    container.appendChild(this.element);
    
    this.setupEventListeners();
    this.loadInitialData();
  }

  /**
   * 요소 생성
   */
  private createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'hand-info-card';
    element.innerHTML = this.getTemplate();
    return element;
  }

  /**
   * 템플릿 반환
   */
  private getTemplate(): string {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 핸드 번호 입력 -->
        <div class="form-group">
          <label for="hand-number" class="form-label">
            핸드 번호
            <span class="text-red-400 ml-1">*</span>
          </label>
          <div class="flex items-center gap-2">
            <input 
              type="number" 
              id="hand-number"
              class="form-input flex-1"
              min="1"
              max="999999"
              value="${this.handNumber}"
              placeholder="핸드 번호 입력"
              data-testid="hand-number-input"
            />
            <button 
              id="hand-number-auto" 
              class="btn btn-icon"
              title="자동 설정"
              data-testid="auto-hand-number"
            >
              🔄
            </button>
          </div>
          <div class="form-help">
            현재 진행 중인 핸드 번호를 입력하세요
          </div>
        </div>

        <!-- 테이블 선택 -->
        <div class="form-group">
          <label for="table-select" class="form-label">
            테이블 선택
            <span class="text-red-400 ml-1">*</span>
          </label>
          <div class="flex items-center gap-2">
            <select 
              id="table-select"
              class="form-select flex-1"
              data-testid="table-select"
            >
              <option value="" disabled selected>테이블 선택</option>
              ${this.availableTables.map(table => 
                `<option value="${table}" ${table === this.tableId ? 'selected' : ''}>${table}</option>`
              ).join('')}
            </select>
            <button 
              id="table-refresh" 
              class="btn btn-icon"
              title="테이블 목록 새로고침"
              data-testid="refresh-tables"
            >
              🔄
            </button>
          </div>
          <div class="form-help">
            현재 게임 중인 테이블을 선택하세요
          </div>
        </div>

        <!-- 블라인드 정보 -->
        <div class="form-group">
          <label class="form-label">블라인드</label>
          <div class="flex items-center gap-2">
            <div class="flex-1">
              <input 
                type="number" 
                id="small-blind"
                class="form-input w-full"
                min="0.01"
                step="0.01"
                value="1"
                placeholder="SB"
                data-testid="small-blind"
              />
              <div class="text-xs text-gray-400 mt-1">스몰 블라인드</div>
            </div>
            <div class="text-gray-500">/</div>
            <div class="flex-1">
              <input 
                type="number" 
                id="big-blind"
                class="form-input w-full"
                min="0.02"
                step="0.01"
                value="2"
                placeholder="BB"
                data-testid="big-blind"
              />
              <div class="text-xs text-gray-400 mt-1">빅 블라인드</div>
            </div>
          </div>
        </div>

        <!-- 플레이어 수 정보 -->
        <div class="form-group">
          <label class="form-label">플레이어 정보</label>
          <div class="bg-gray-800 rounded-lg p-3">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-gray-400">전체 플레이어:</span>
              <span class="text-white font-medium" id="total-players">${this.players.length}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-400">핸드 참여:</span>
              <span class="text-amber-400 font-medium" id="active-players">0</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 유효성 검사 메시지 -->
      <div id="validation-messages" class="mt-4 space-y-2 hidden">
        <!-- 동적으로 추가되는 메시지들 -->
      </div>

      <!-- 액션 버튼 -->
      <div class="flex gap-2 mt-4">
        <button 
          id="validate-hand" 
          class="btn btn-secondary flex-1"
          data-testid="validate-hand"
        >
          <span class="mr-2">✓</span>
          유효성 검사
        </button>
        <button 
          id="clear-hand" 
          class="btn btn-outline flex-1"
          data-testid="clear-hand"
        >
          <span class="mr-2">🗑️</span>
          정보 초기화
        </button>
      </div>
    `;
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    // 핸드 번호 변경
    const handNumberInput = this.element.querySelector('#hand-number') as HTMLInputElement;
    handNumberInput?.addEventListener('input', this.handleHandNumberChange.bind(this));
    handNumberInput?.addEventListener('blur', this.validateHandNumber.bind(this));

    // 자동 핸드 번호 설정
    const autoHandBtn = this.element.querySelector('#hand-number-auto');
    autoHandBtn?.addEventListener('click', this.handleAutoHandNumber.bind(this));

    // 테이블 선택
    const tableSelect = this.element.querySelector('#table-select') as HTMLSelectElement;
    tableSelect?.addEventListener('change', this.handleTableChange.bind(this));

    // 테이블 새로고침
    const tableRefreshBtn = this.element.querySelector('#table-refresh');
    tableRefreshBtn?.addEventListener('click', this.handleTableRefresh.bind(this));

    // 블라인드 변경
    const smallBlindInput = this.element.querySelector('#small-blind') as HTMLInputElement;
    const bigBlindInput = this.element.querySelector('#big-blind') as HTMLInputElement;
    
    smallBlindInput?.addEventListener('input', this.handleBlindChange.bind(this));
    bigBlindInput?.addEventListener('input', this.handleBlindChange.bind(this));

    // 유효성 검사
    const validateBtn = this.element.querySelector('#validate-hand');
    validateBtn?.addEventListener('click', this.handleValidate.bind(this));

    // 초기화
    const clearBtn = this.element.querySelector('#clear-hand');
    clearBtn?.addEventListener('click', this.handleClear.bind(this));

    // 외부 이벤트 리스닝
    this.eventBus.on('players:updated', this.handlePlayersUpdate.bind(this));
    this.eventBus.on('tables:updated', this.handleTablesUpdate.bind(this));
    this.eventBus.on('hand:auto-increment', this.handleAutoIncrement.bind(this));
  }

  /**
   * 핸드 번호 변경 처리
   */
  private handleHandNumberChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value);

    if (value && value > 0) {
      this.handNumber = value;
      this.eventBus.emit('hand:number-changed', { handNumber: value });
      
      if (this.config.isDebugMode) {
        console.log('[HandInfoCard] 핸드 번호 변경:', value);
      }
    }
  }

  /**
   * 핸드 번호 유효성 검사
   */
  private validateHandNumber(): void {
    const input = this.element.querySelector('#hand-number') as HTMLInputElement;
    const value = parseInt(input.value);

    if (!value || value <= 0) {
      this.showValidationError('hand-number', '유효한 핸드 번호를 입력하세요 (1 이상)');
      return;
    }

    this.clearValidationError('hand-number');
  }

  /**
   * 자동 핸드 번호 설정
   */
  private async handleAutoHandNumber(): Promise<void> {
    try {
      // 최근 핸드 번호를 가져와서 +1
      const response = await this.eventBus.emit('data:get-last-hand');
      if (response && response.handNumber) {
        const nextHand = response.handNumber + 1;
        this.setHandNumber(nextHand);
        
        this.eventBus.emit('toast:show', {
          type: 'success',
          message: `핸드 번호가 자동으로 설정되었습니다: #${nextHand}`
        });
      }
    } catch (error) {
      console.error('[HandInfoCard] 자동 핸드 번호 설정 실패:', error);
      this.eventBus.emit('toast:show', {
        type: 'error',
        message: '자동 핸드 번호 설정에 실패했습니다.'
      });
    }
  }

  /**
   * 테이블 변경 처리
   */
  private handleTableChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const tableId = DOMPurify.sanitize(select.value);

    if (tableId) {
      this.tableId = tableId;
      this.eventBus.emit('table:changed', { tableId });
      
      // 해당 테이블의 플레이어 정보 로드
      this.loadTablePlayers(tableId);

      if (this.config.isDebugMode) {
        console.log('[HandInfoCard] 테이블 변경:', tableId);
      }
    }
  }

  /**
   * 테이블 목록 새로고침
   */
  private async handleTableRefresh(): Promise<void> {
    try {
      const response = await this.eventBus.emit('data:get-tables');
      if (response && response.tables) {
        this.availableTables = response.tables;
        this.updateTableSelect();
        
        this.eventBus.emit('toast:show', {
          type: 'success',
          message: '테이블 목록이 새로고침되었습니다.'
        });
      }
    } catch (error) {
      console.error('[HandInfoCard] 테이블 새로고침 실패:', error);
      this.eventBus.emit('toast:show', {
        type: 'error',
        message: '테이블 목록 새로고침에 실패했습니다.'
      });
    }
  }

  /**
   * 블라인드 변경 처리
   */
  private handleBlindChange(): void {
    const smallBlind = parseFloat((this.element.querySelector('#small-blind') as HTMLInputElement)?.value || '0');
    const bigBlind = parseFloat((this.element.querySelector('#big-blind') as HTMLInputElement)?.value || '0');

    // 유효성 검사
    if (smallBlind >= bigBlind) {
      this.showValidationError('blinds', '빅 블라인드는 스몰 블라인드보다 커야 합니다.');
      return;
    }

    this.clearValidationError('blinds');
    
    this.eventBus.emit('blinds:changed', {
      small: smallBlind,
      big: bigBlind
    });
  }

  /**
   * 유효성 검사 처리
   */
  private handleValidate(): void {
    const validation = this.validateAllData();
    this.displayValidationResults(validation);

    if (validation.valid) {
      this.eventBus.emit('toast:show', {
        type: 'success',
        message: '모든 핸드 정보가 유효합니다!'
      });
    }
  }

  /**
   * 초기화 처리
   */
  private handleClear(): void {
    if (confirm('핸드 정보를 초기화하시겠습니까?')) {
      this.resetForm();
      this.eventBus.emit('hand:cleared');
      
      this.eventBus.emit('toast:show', {
        type: 'info',
        message: '핸드 정보가 초기화되었습니다.'
      });
    }
  }

  /**
   * 플레이어 업데이트 처리
   */
  private handlePlayersUpdate(data: { players: Player[] }): void {
    this.players = data.players;
    this.updatePlayerCount();
  }

  /**
   * 테이블 업데이트 처리
   */
  private handleTablesUpdate(data: { tables: string[] }): void {
    this.availableTables = data.tables;
    this.updateTableSelect();
  }

  /**
   * 자동 증가 처리
   */
  private handleAutoIncrement(): void {
    this.setHandNumber(this.handNumber + 1);
  }

  /**
   * 초기 데이터 로드
   */
  private async loadInitialData(): Promise<void> {
    try {
      // 테이블 목록 로드
      const tablesResponse = await this.eventBus.emit('data:get-tables');
      if (tablesResponse?.tables) {
        this.availableTables = tablesResponse.tables;
        this.updateTableSelect();
      }

      // 마지막 핸드 번호 로드
      const lastHandResponse = await this.eventBus.emit('data:get-last-hand');
      if (lastHandResponse?.handNumber) {
        this.setHandNumber(lastHandResponse.handNumber + 1);
      }

    } catch (error) {
      console.error('[HandInfoCard] 초기 데이터 로드 실패:', error);
    }
  }

  /**
   * 테이블 플레이어 로드
   */
  private async loadTablePlayers(tableId: string): Promise<void> {
    try {
      const response = await this.eventBus.emit('data:get-table-players', { tableId });
      if (response?.players) {
        this.players = response.players;
        this.updatePlayerCount();
      }
    } catch (error) {
      console.error('[HandInfoCard] 테이블 플레이어 로드 실패:', error);
    }
  }

  /**
   * 핸드 번호 설정
   */
  public setHandNumber(handNumber: number): void {
    this.handNumber = handNumber;
    const input = this.element.querySelector('#hand-number') as HTMLInputElement;
    if (input) {
      input.value = handNumber.toString();
    }
    this.eventBus.emit('hand:number-changed', { handNumber });
  }

  /**
   * 테이블 선택 업데이트
   */
  private updateTableSelect(): void {
    const select = this.element.querySelector('#table-select') as HTMLSelectElement;
    if (!select) return;

    // 기존 옵션 제거 (첫 번째 옵션 제외)
    while (select.children.length > 1) {
      select.removeChild(select.lastChild!);
    }

    // 새 옵션 추가
    this.availableTables.forEach(table => {
      const option = document.createElement('option');
      option.value = table;
      option.textContent = table;
      if (table === this.tableId) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  }

  /**
   * 플레이어 수 업데이트
   */
  private updatePlayerCount(): void {
    const totalElement = this.element.querySelector('#total-players');
    const activeElement = this.element.querySelector('#active-players');

    if (totalElement) {
      totalElement.textContent = this.players.length.toString();
    }

    if (activeElement) {
      const activePlayers = this.players.filter(p => p.role && p.role !== 'spectator').length;
      activeElement.textContent = activePlayers.toString();
    }
  }

  /**
   * 모든 데이터 유효성 검사
   */
  private validateAllData(): ValidationResult {
    const errors: string[] = [];

    // 핸드 번호 검사
    if (!this.handNumber || this.handNumber <= 0) {
      errors.push('유효한 핸드 번호를 입력하세요.');
    }

    // 테이블 검사
    if (!this.tableId) {
      errors.push('테이블을 선택하세요.');
    }

    // 블라인드 검사
    const smallBlind = parseFloat((this.element.querySelector('#small-blind') as HTMLInputElement)?.value || '0');
    const bigBlind = parseFloat((this.element.querySelector('#big-blind') as HTMLInputElement)?.value || '0');

    if (smallBlind <= 0 || bigBlind <= 0) {
      errors.push('블라인드 값은 0보다 커야 합니다.');
    }

    if (smallBlind >= bigBlind) {
      errors.push('빅 블라인드는 스몰 블라인드보다 커야 합니다.');
    }

    // 플레이어 검사
    if (this.players.length < 2) {
      errors.push('최소 2명의 플레이어가 필요합니다.');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * 유효성 검사 결과 표시
   */
  private displayValidationResults(validation: ValidationResult): void {
    const container = this.element.querySelector('#validation-messages');
    if (!container) return;

    container.innerHTML = '';

    if (validation.errors && validation.errors.length > 0) {
      container.classList.remove('hidden');
      
      validation.errors.forEach(error => {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-error text-sm';
        errorDiv.innerHTML = `
          <span class="mr-2">⚠️</span>
          ${DOMPurify.sanitize(error)}
        `;
        container.appendChild(errorDiv);
      });
    } else {
      container.classList.add('hidden');
    }
  }

  /**
   * 유효성 검사 오류 표시
   */
  private showValidationError(field: string, message: string): void {
    const input = this.element.querySelector(`#${field}`) as HTMLInputElement;
    if (input) {
      input.classList.add('error');
      
      // 기존 오류 메시지 제거
      const existingError = input.parentElement?.querySelector('.error-message');
      if (existingError) {
        existingError.remove();
      }

      // 새 오류 메시지 추가
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message text-red-400 text-xs mt-1';
      errorDiv.textContent = message;
      input.parentElement?.appendChild(errorDiv);
    }
  }

  /**
   * 유효성 검사 오류 제거
   */
  private clearValidationError(field: string): void {
    const input = this.element.querySelector(`#${field}`) as HTMLInputElement;
    if (input) {
      input.classList.remove('error');
      
      const errorMessage = input.parentElement?.querySelector('.error-message');
      if (errorMessage) {
        errorMessage.remove();
      }
    }
  }

  /**
   * 폼 초기화
   */
  private resetForm(): void {
    // 핸드 번호 유지 (자동 증가)
    const currentHand = this.handNumber;
    this.setHandNumber(currentHand);

    // 테이블 선택 초기화
    const tableSelect = this.element.querySelector('#table-select') as HTMLSelectElement;
    if (tableSelect) {
      tableSelect.selectedIndex = 0;
    }
    this.tableId = '';

    // 블라인드 기본값 설정
    const smallBlindInput = this.element.querySelector('#small-blind') as HTMLInputElement;
    const bigBlindInput = this.element.querySelector('#big-blind') as HTMLInputElement;
    
    if (smallBlindInput) smallBlindInput.value = '1';
    if (bigBlindInput) bigBlindInput.value = '2';

    // 유효성 검사 메시지 제거
    this.element.querySelector('#validation-messages')?.classList.add('hidden');
    
    // 모든 오류 상태 제거
    this.element.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    this.element.querySelectorAll('.error-message').forEach(el => el.remove());
  }

  /**
   * 현재 데이터 반환
   */
  public getData() {
    const smallBlind = parseFloat((this.element.querySelector('#small-blind') as HTMLInputElement)?.value || '1');
    const bigBlind = parseFloat((this.element.querySelector('#big-blind') as HTMLInputElement)?.value || '2');

    return {
      handNumber: this.handNumber,
      tableId: this.tableId,
      blinds: {
        small: smallBlind,
        big: bigBlind
      },
      players: this.players,
      timestamp: new Date()
    };
  }

  /**
   * 컴포넌트 제거
   */
  public destroy(): void {
    // 이벤트 리스너 제거
    this.eventBus.off('players:updated', this.handlePlayersUpdate);
    this.eventBus.off('tables:updated', this.handleTablesUpdate);
    this.eventBus.off('hand:auto-increment', this.handleAutoIncrement);

    // 요소 제거
    this.element.remove();
  }
}