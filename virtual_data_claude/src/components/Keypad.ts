/**
 * 포커 핸드 로거 v35 - Keypad 컴포넌트
 * 숫자 입력 키패드 (베팅 금액 입력 등)
 */

import { KeypadProps } from '@types/index';
import { Config } from '@/config';
import { EventBus } from '@/store/EventBus';

export class Keypad {
  private element: HTMLElement;
  private config: Config;
  private eventBus: EventBus;
  private value: number = 0;
  private displayValue: string = '0';
  private onValueChange?: (value: number) => void;
  private onConfirm?: (value: number) => void;
  private onCancel?: () => void;
  private min: number = 0;
  private max: number = Number.MAX_SAFE_INTEGER;
  private decimalPlaces: number = 2;
  private isOpen: boolean = false;

  constructor(
    container: HTMLElement,
    config: Config,
    eventBus: EventBus,
    options: Partial<KeypadProps> = {}
  ) {
    this.config = config;
    this.eventBus = eventBus;
    this.value = options.value || 0;
    this.displayValue = this.formatDisplayValue(this.value);
    this.onValueChange = options.onValueChange;
    this.onConfirm = options.onConfirm;
    this.onCancel = options.onCancel;
    this.min = options.min || 0;
    this.max = options.max || Number.MAX_SAFE_INTEGER;

    this.element = this.createElement();
    container.appendChild(this.element);

    this.setupEventListeners();
    this.open();
  }

  /**
   * 요소 생성
   */
  private createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'keypad-modal';
    element.innerHTML = this.getTemplate();
    return element;
  }

  /**
   * 템플릿 반환
   */
  private getTemplate(): string {
    return `
      <div class="modal-backdrop" data-action="cancel"></div>
      
      <div class="keypad-dialog">
        <div class="keypad-header">
          <h3 class="keypad-title">금액 입력</h3>
          <button class="btn-close" data-action="cancel" title="닫기">×</button>
        </div>

        <!-- 디스플레이 -->
        <div class="keypad-display">
          <div class="display-value" id="display-value">
            ${this.displayValue}
          </div>
          <div class="display-info">
            <span class="currency-symbol">$</span>
            <span class="range-info">
              (${this.formatCurrency(this.min)} - ${this.formatCurrency(this.max)})
            </span>
          </div>
        </div>

        <!-- 키패드 버튼들 -->
        <div class="keypad-buttons">
          <!-- 첫 번째 행 -->
          <div class="keypad-row">
            <button class="keypad-btn memory-btn" data-action="memory-clear" title="메모리 클리어">MC</button>
            <button class="keypad-btn memory-btn" data-action="memory-recall" title="메모리 리콜">MR</button>
            <button class="keypad-btn memory-btn" data-action="memory-plus" title="메모리에 더하기">M+</button>
            <button class="keypad-btn memory-btn" data-action="memory-minus" title="메모리에서 빼기">M-</button>
          </div>

          <!-- 두 번째 행 -->
          <div class="keypad-row">
            <button class="keypad-btn action-btn" data-action="clear-all" title="모두 지우기">C</button>
            <button class="keypad-btn action-btn" data-action="clear-entry" title="입력 지우기">CE</button>
            <button class="keypad-btn action-btn" data-action="backspace" title="백스페이스">⌫</button>
            <button class="keypad-btn operation-btn" data-action="divide" title="나누기">÷</button>
          </div>

          <!-- 세 번째 행 -->
          <div class="keypad-row">
            <button class="keypad-btn number-btn" data-number="7">7</button>
            <button class="keypad-btn number-btn" data-number="8">8</button>
            <button class="keypad-btn number-btn" data-number="9">9</button>
            <button class="keypad-btn operation-btn" data-action="multiply" title="곱하기">×</button>
          </div>

          <!-- 네 번째 행 -->
          <div class="keypad-row">
            <button class="keypad-btn number-btn" data-number="4">4</button>
            <button class="keypad-btn number-btn" data-number="5">5</button>
            <button class="keypad-btn number-btn" data-number="6">6</button>
            <button class="keypad-btn operation-btn" data-action="subtract" title="빼기">-</button>
          </div>

          <!-- 다섯 번째 행 -->
          <div class="keypad-row">
            <button class="keypad-btn number-btn" data-number="1">1</button>
            <button class="keypad-btn number-btn" data-number="2">2</button>
            <button class="keypad-btn number-btn" data-number="3">3</button>
            <button class="keypad-btn operation-btn" data-action="add" title="더하기">+</button>
          </div>

          <!-- 여섯 번째 행 -->
          <div class="keypad-row">
            <button class="keypad-btn number-btn zero-btn" data-number="0">0</button>
            <button class="keypad-btn decimal-btn" data-action="decimal" title="소수점">.</button>
            <button class="keypad-btn equals-btn" data-action="equals" title="계산">=</button>
          </div>
        </div>

        <!-- 빠른 입력 버튼들 -->
        <div class="quick-input-section">
          <div class="section-title">빠른 입력</div>
          <div class="quick-buttons">
            ${this.renderQuickButtons()}
          </div>
        </div>

        <!-- 액션 버튼들 -->
        <div class="keypad-footer">
          <button class="btn btn-secondary" data-action="cancel">
            취소
          </button>
          <button class="btn btn-primary" data-action="confirm">
            확인
          </button>
        </div>
      </div>
    `;
  }

  /**
   * 빠른 입력 버튼들 렌더링
   */
  private renderQuickButtons(): string {
    const quickValues = [
      { label: '1BB', value: 2 },
      { label: '2BB', value: 4 },
      { label: '3BB', value: 6 },
      { label: '5BB', value: 10 },
      { label: '10BB', value: 20 },
      { label: '20BB', value: 40 },
      { label: '50BB', value: 100 },
      { label: '100BB', value: 200 }
    ];

    return quickValues.map(({ label, value }) => `
      <button 
        class="quick-btn"
        data-action="quick-input"
        data-value="${value}"
        title="${label} (${this.formatCurrency(value)})"
      >
        ${label}
      </button>
    `).join('');
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    // 클릭 이벤트
    this.element.addEventListener('click', this.handleClick.bind(this));
    
    // 키보드 이벤트
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // 포커스 트랩
    this.setupFocusTrap();
  }

  /**
   * 포커스 트랩 설정
   */
  private setupFocusTrap(): void {
    const dialog = this.element.querySelector('.keypad-dialog');
    if (!dialog) return;

    const focusableElements = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    });

    // 초기 포커스
    firstElement?.focus();
  }

  /**
   * 클릭 이벤트 처리
   */
  private handleClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    // 숫자 버튼
    const number = target.dataset.number;
    if (number !== undefined) {
      this.inputNumber(number);
      return;
    }

    // 액션 버튼
    const action = target.dataset.action;
    if (action) {
      event.preventDefault();
      this.handleAction(action, target);
    }
  }

  /**
   * 키보드 이벤트 처리
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.isOpen) return;

    const key = event.key;

    // 숫자 키
    if (/^[0-9]$/.test(key)) {
      event.preventDefault();
      this.inputNumber(key);
      return;
    }

    // 액션 키
    switch (key) {
      case 'Enter':
        event.preventDefault();
        this.confirm();
        break;
        
      case 'Escape':
        event.preventDefault();
        this.cancel();
        break;
        
      case 'Backspace':
        event.preventDefault();
        this.backspace();
        break;
        
      case 'Delete':
        event.preventDefault();
        this.clearEntry();
        break;
        
      case '.':
      case ',':
        event.preventDefault();
        this.inputDecimal();
        break;
        
      case '+':
        event.preventDefault();
        this.add();
        break;
        
      case '-':
        event.preventDefault();
        this.subtract();
        break;
        
      case '*':
        event.preventDefault();
        this.multiply();
        break;
        
      case '/':
        event.preventDefault();
        this.divide();
        break;
        
      case '=':
        event.preventDefault();
        this.equals();
        break;
        
      case 'c':
      case 'C':
        event.preventDefault();
        this.clearAll();
        break;
    }
  };

  /**
   * 액션 처리
   */
  private handleAction(action: string, target: HTMLElement): void {
    switch (action) {
      case 'cancel':
        this.cancel();
        break;
        
      case 'confirm':
        this.confirm();
        break;
        
      case 'clear-all':
        this.clearAll();
        break;
        
      case 'clear-entry':
        this.clearEntry();
        break;
        
      case 'backspace':
        this.backspace();
        break;
        
      case 'decimal':
        this.inputDecimal();
        break;
        
      case 'add':
        this.add();
        break;
        
      case 'subtract':
        this.subtract();
        break;
        
      case 'multiply':
        this.multiply();
        break;
        
      case 'divide':
        this.divide();
        break;
        
      case 'equals':
        this.equals();
        break;
        
      case 'quick-input':
        this.quickInput(target);
        break;
        
      case 'memory-clear':
        this.memoryClear();
        break;
        
      case 'memory-recall':
        this.memoryRecall();
        break;
        
      case 'memory-plus':
        this.memoryPlus();
        break;
        
      case 'memory-minus':
        this.memoryMinus();
        break;
    }
  }

  /**
   * 계산기 기능들
   */
  private inputNumber(digit: string): void {
    if (this.displayValue === '0' || this.displayValue === 'Error') {
      this.displayValue = digit;
    } else {
      this.displayValue += digit;
    }
    
    this.updateValue();
    this.updateDisplay();
    this.playKeySound();
  }

  private inputDecimal(): void {
    if (this.displayValue.includes('.')) return;
    
    if (this.displayValue === '0' || this.displayValue === 'Error') {
      this.displayValue = '0.';
    } else {
      this.displayValue += '.';
    }
    
    this.updateDisplay();
    this.playKeySound();
  }

  private backspace(): void {
    if (this.displayValue === 'Error') {
      this.displayValue = '0';
    } else if (this.displayValue.length > 1) {
      this.displayValue = this.displayValue.slice(0, -1);
    } else {
      this.displayValue = '0';
    }
    
    this.updateValue();
    this.updateDisplay();
    this.playKeySound();
  }

  private clearEntry(): void {
    this.displayValue = '0';
    this.updateValue();
    this.updateDisplay();
    this.playKeySound();
  }

  private clearAll(): void {
    this.displayValue = '0';
    this.value = 0;
    this.updateDisplay();
    this.playKeySound();
  }

  // 간단한 계산 기능들 (확장 가능)
  private add(): void {
    const currentValue = parseFloat(this.displayValue);
    this.value = this.value + currentValue;
    this.displayValue = this.formatDisplayValue(this.value);
    this.updateDisplay();
  }

  private subtract(): void {
    const currentValue = parseFloat(this.displayValue);
    this.value = this.value - currentValue;
    this.displayValue = this.formatDisplayValue(this.value);
    this.updateDisplay();
  }

  private multiply(): void {
    const currentValue = parseFloat(this.displayValue);
    this.value = this.value * currentValue;
    this.displayValue = this.formatDisplayValue(this.value);
    this.updateDisplay();
  }

  private divide(): void {
    const currentValue = parseFloat(this.displayValue);
    if (currentValue === 0) {
      this.displayValue = 'Error';
      this.updateDisplay();
      return;
    }
    this.value = this.value / currentValue;
    this.displayValue = this.formatDisplayValue(this.value);
    this.updateDisplay();
  }

  private equals(): void {
    // 현재 표시값을 결과로 설정
    this.updateValue();
    this.updateDisplay();
  }

  private quickInput(target: HTMLElement): void {
    const value = parseFloat(target.dataset.value || '0');
    this.value = value;
    this.displayValue = this.formatDisplayValue(value);
    this.updateDisplay();
    this.playKeySound();
  }

  // 메모리 기능들
  private memoryClear(): void {
    localStorage.removeItem('keypad-memory');
    this.playKeySound();
  }

  private memoryRecall(): void {
    const memory = localStorage.getItem('keypad-memory');
    if (memory) {
      const value = parseFloat(memory);
      this.value = value;
      this.displayValue = this.formatDisplayValue(value);
      this.updateDisplay();
    }
    this.playKeySound();
  }

  private memoryPlus(): void {
    const currentMemory = parseFloat(localStorage.getItem('keypad-memory') || '0');
    const newMemory = currentMemory + this.value;
    localStorage.setItem('keypad-memory', newMemory.toString());
    this.playKeySound();
  }

  private memoryMinus(): void {
    const currentMemory = parseFloat(localStorage.getItem('keypad-memory') || '0');
    const newMemory = currentMemory - this.value;
    localStorage.setItem('keypad-memory', newMemory.toString());
    this.playKeySound();
  }

  /**
   * 값 업데이트
   */
  private updateValue(): void {
    const parsedValue = parseFloat(this.displayValue);
    
    if (isNaN(parsedValue)) {
      this.displayValue = 'Error';
      return;
    }

    // 범위 체크
    if (parsedValue < this.min) {
      this.value = this.min;
      this.displayValue = this.formatDisplayValue(this.min);
    } else if (parsedValue > this.max) {
      this.value = this.max;
      this.displayValue = this.formatDisplayValue(this.max);
    } else {
      this.value = parsedValue;
    }

    this.onValueChange?.(this.value);
  }

  /**
   * 디스플레이 업데이트
   */
  private updateDisplay(): void {
    const displayElement = this.element.querySelector('#display-value');
    if (displayElement) {
      displayElement.textContent = this.displayValue;
    }
  }

  /**
   * 사운드 재생
   */
  private playKeySound(): void {
    if (!this.config.getSetting('soundEffects')) return;

    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 600;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('[Keypad] 사운드 재생 실패:', error);
    }
  }

  /**
   * 유틸리티 메서드들
   */
  private formatDisplayValue(value: number): string {
    if (isNaN(value)) return 'Error';
    
    // 소수점 이하 자릿수 제한
    const formatted = value.toFixed(this.decimalPlaces);
    
    // 불필요한 0 제거
    return formatted.replace(/\.?0+$/, '');
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }

  /**
   * 공개 메서드들
   */
  public open(): void {
    this.isOpen = true;
    this.element.classList.add('open');
    
    // body 스크롤 방지
    document.body.style.overflow = 'hidden';

    this.eventBus.emit('keypad:opened');

    if (this.config.isDebugMode) {
      console.log('[Keypad] 키패드 열림');
    }
  }

  public close(): void {
    this.isOpen = false;
    this.element.classList.remove('open');
    
    // body 스크롤 복원
    document.body.style.overflow = '';

    this.eventBus.emit('keypad:closed');

    if (this.config.isDebugMode) {
      console.log('[Keypad] 키패드 닫힘');
    }
  }

  public confirm(): void {
    if (this.displayValue === 'Error') {
      this.eventBus.emit('toast:show', {
        type: 'error',
        message: '유효하지 않은 값입니다.'
      });
      return;
    }

    this.updateValue();
    
    this.onConfirm?.(this.value);
    this.eventBus.emit('keypad:value-confirmed', { value: this.value });
    
    this.close();

    if (this.config.isDebugMode) {
      console.log('[Keypad] 값 확인됨:', this.value);
    }
  }

  public cancel(): void {
    this.onCancel?.();
    this.eventBus.emit('keypad:cancelled');
    
    this.close();

    if (this.config.isDebugMode) {
      console.log('[Keypad] 취소됨');
    }
  }

  public setValue(value: number): void {
    this.value = Math.max(this.min, Math.min(this.max, value));
    this.displayValue = this.formatDisplayValue(this.value);
    this.updateDisplay();
  }

  public getValue(): number {
    return this.value;
  }

  public setRange(min: number, max: number): void {
    this.min = min;
    this.max = max;
    
    // 현재 값이 범위를 벗어나면 조정
    if (this.value < min) {
      this.setValue(min);
    } else if (this.value > max) {
      this.setValue(max);
    }
  }

  /**
   * 컴포넌트 제거
   */
  public destroy(): void {
    // 이벤트 리스너 제거
    document.removeEventListener('keydown', this.handleKeyDown);

    // body 스타일 복원
    document.body.style.overflow = '';

    // 요소 제거
    this.element.remove();

    if (this.config.isDebugMode) {
      console.log('[Keypad] 키패드 제거됨');
    }
  }
}