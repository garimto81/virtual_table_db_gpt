/**
 * 포커 핸드 로거 v35 - CardSelector 컴포넌트
 * 카드 선택 모달 (홀카드, 보드카드 선택)
 */

import { Card, CardSelectorProps } from '@types/index';
import { Config, DEFAULT_CONFIG } from '@/config';
import { EventBus } from '@/store/EventBus';
import DOMPurify from 'dompurify';

export class CardSelector {
  private element: HTMLElement;
  private config: Config;
  private eventBus: EventBus;
  private isOpen: boolean = false;
  private maxCards: number = 2;
  private selectedCards: Card[] = [];
  private onSelect?: (cards: Card[]) => void;
  private onClose?: () => void;

  // 카드 데이터
  private suits: Card['suit'][] = ['spades', 'hearts', 'diamonds', 'clubs'];
  private ranks: Card['rank'][] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

  constructor(
    container: HTMLElement,
    config: Config,
    eventBus: EventBus,
    options: Partial<CardSelectorProps> = {}
  ) {
    this.config = config;
    this.eventBus = eventBus;
    this.maxCards = options.maxCards || 2;
    this.selectedCards = options.selectedCards ? [...options.selectedCards] : [];
    this.onSelect = options.onSelect;
    this.onClose = options.onClose;

    this.element = this.createElement();
    container.appendChild(this.element);

    this.setupEventListeners();
    
    if (options.isOpen) {
      this.open();
    }
  }

  /**
   * 요소 생성
   */
  private createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'card-selector-modal';
    element.innerHTML = this.getTemplate();
    return element;
  }

  /**
   * 템플릿 반환
   */
  private getTemplate(): string {
    return `
      <div class="modal-backdrop" data-action="close"></div>
      
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">카드 선택</h3>
          <div class="modal-info">
            <span class="selected-count">${this.selectedCards.length}</span>
            <span class="max-count">/ ${this.maxCards}</span>
          </div>
          <button class="btn-close" data-action="close" title="닫기">×</button>
        </div>

        <div class="modal-body">
          <!-- 선택된 카드 미리보기 -->
          <div class="selected-cards-preview">
            <div class="preview-label">선택된 카드:</div>
            <div class="preview-cards">
              ${this.renderSelectedCards()}
            </div>
          </div>

          <!-- 카드 선택 그리드 -->
          <div class="card-grid-container">
            <!-- 수트 헤더 -->
            <div class="suits-header">
              ${this.suits.map(suit => `
                <div class="suit-header ${suit}">
                  <span class="suit-symbol">${this.getSuitSymbol(suit)}</span>
                  <span class="suit-name">${this.getSuitName(suit)}</span>
                </div>
              `).join('')}
            </div>

            <!-- 카드 그리드 -->
            <div class="cards-grid">
              ${this.renderCardGrid()}
            </div>
          </div>

          <!-- 빠른 선택 버튼들 -->
          <div class="quick-select-section">
            <div class="section-title">빠른 선택</div>
            <div class="quick-select-buttons">
              <button class="btn btn-xs btn-secondary" data-action="clear-all">
                모두 지우기
              </button>
              <button class="btn btn-xs btn-secondary" data-action="random-select">
                랜덤 선택
              </button>
              ${this.maxCards === 2 ? `
                <button class="btn btn-xs btn-secondary" data-action="select-pair">
                  페어 선택
                </button>
                <button class="btn btn-xs btn-secondary" data-action="select-suited">
                  수티드 선택
                </button>
              ` : ''}
            </div>
          </div>

          <!-- 검색 및 필터 -->
          <div class="search-filter-section">
            <div class="section-title">검색 및 필터</div>
            <div class="search-controls">
              <input 
                type="text" 
                class="form-input search-input"
                placeholder="카드 검색 (예: AK, suited, pair)"
                data-action="search"
              />
              <div class="filter-buttons">
                <button class="btn btn-xs filter-btn" data-filter="all">전체</button>
                <button class="btn btn-xs filter-btn" data-filter="high">하이카드</button>
                <button class="btn btn-xs filter-btn" data-filter="middle">미들카드</button>
                <button class="btn btn-xs filter-btn" data-filter="low">로우카드</button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" data-action="cancel">
            취소
          </button>
          <button 
            class="btn btn-primary" 
            data-action="confirm"
            ${this.selectedCards.length === 0 ? 'disabled' : ''}
          >
            확인 (${this.selectedCards.length}장)
          </button>
        </div>
      </div>
    `;
  }

  /**
   * 선택된 카드 미리보기 렌더링
   */
  private renderSelectedCards(): string {
    if (this.selectedCards.length === 0) {
      return '<div class="no-cards">선택된 카드가 없습니다</div>';
    }

    return this.selectedCards.map(card => 
      this.renderCard(card, false, 'preview-card')
    ).join('');
  }

  /**
   * 카드 그리드 렌더링
   */
  private renderCardGrid(): string {
    let gridHTML = '';

    this.ranks.forEach(rank => {
      gridHTML += '<div class="rank-row">';
      gridHTML += `<div class="rank-label">${rank}</div>`;
      
      this.suits.forEach(suit => {
        const card: Card = { suit, rank };
        const isSelected = this.isCardSelected(card);
        const isDisabled = this.isCardDisabled(card);
        
        gridHTML += this.renderCard(card, isSelected, 'grid-card', isDisabled);
      });
      
      gridHTML += '</div>';
    });

    return gridHTML;
  }

  /**
   * 카드 렌더링
   */
  private renderCard(
    card: Card, 
    isSelected: boolean = false, 
    extraClass: string = '', 
    isDisabled: boolean = false
  ): string {
    const suitColor = this.getSuitColor(card.suit);
    const suitSymbol = this.getSuitSymbol(card.suit);
    
    return `
      <div 
        class="playing-card ${suitColor} ${extraClass} ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}"
        data-suit="${card.suit}"
        data-rank="${card.rank}"
        data-action="toggle-card"
        title="${this.getCardName(card)}"
      >
        <div class="card-content">
          <div class="card-rank">${card.rank}</div>
          <div class="card-suit">${suitSymbol}</div>
        </div>
        ${isSelected ? '<div class="selection-indicator">✓</div>' : ''}
      </div>
    `;
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    this.element.addEventListener('click', this.handleClick.bind(this));
    this.element.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // 검색 입력
    const searchInput = this.element.querySelector('.search-input');
    searchInput?.addEventListener('input', this.handleSearch.bind(this));

    // 외부 이벤트
    this.eventBus.on('card-selector:open', this.handleExternalOpen.bind(this));
    this.eventBus.on('card-selector:close', this.close.bind(this));
  }

  /**
   * 클릭 이벤트 처리
   */
  private handleClick(event: Event): void {
    const target = event.target as HTMLElement;
    const action = target.dataset.action || target.closest('[data-action]')?.getAttribute('data-action');

    if (!action) return;

    event.preventDefault();
    event.stopPropagation();

    switch (action) {
      case 'close':
      case 'cancel':
        this.close();
        break;

      case 'confirm':
        this.confirm();
        break;

      case 'toggle-card':
        this.toggleCard(target);
        break;

      case 'clear-all':
        this.clearAll();
        break;

      case 'random-select':
        this.randomSelect();
        break;

      case 'select-pair':
        this.selectPair();
        break;

      case 'select-suited':
        this.selectSuited();
        break;

      default:
        if (action.startsWith('filter-')) {
          this.applyFilter(action.replace('filter-', ''));
        }
        break;
    }
  }

  /**
   * 키보드 이벤트 처리
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        break;

      case 'Enter':
        event.preventDefault();
        if (this.selectedCards.length > 0) {
          this.confirm();
        }
        break;

      case 'Delete':
      case 'Backspace':
        event.preventDefault();
        this.clearAll();
        break;
    }
  }

  /**
   * 검색 처리
   */
  private handleSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value.toLowerCase().trim();

    this.searchCards(query);
  }

  /**
   * 외부 열기 이벤트 처리
   */
  private handleExternalOpen(data: any): void {
    if (data.maxCards !== undefined) {
      this.maxCards = data.maxCards;
    }
    if (data.selectedCards) {
      this.selectedCards = [...data.selectedCards];
    }
    this.open();
  }

  /**
   * 카드 토글
   */
  private toggleCard(element: HTMLElement): void {
    const suit = element.dataset.suit as Card['suit'];
    const rank = element.dataset.rank as Card['rank'];

    if (!suit || !rank) return;

    const card: Card = { suit, rank };

    if (this.isCardSelected(card)) {
      this.deselectCard(card);
    } else {
      this.selectCard(card);
    }
  }

  /**
   * 카드 선택
   */
  private selectCard(card: Card): void {
    if (this.isCardSelected(card)) return;
    
    if (this.selectedCards.length >= this.maxCards) {
      this.eventBus.emit('toast:show', {
        type: 'warning',
        message: `최대 ${this.maxCards}장까지 선택할 수 있습니다.`
      });
      return;
    }

    this.selectedCards.push(card);
    this.updateDisplay();

    // 사운드 재생
    if (this.config.getSetting('soundEffects')) {
      this.playSelectSound();
    }

    if (this.config.isDebugMode) {
      console.log('[CardSelector] 카드 선택:', card);
    }
  }

  /**
   * 카드 선택 해제
   */
  private deselectCard(card: Card): void {
    const index = this.selectedCards.findIndex(c => 
      c.suit === card.suit && c.rank === card.rank
    );

    if (index !== -1) {
      this.selectedCards.splice(index, 1);
      this.updateDisplay();

      if (this.config.isDebugMode) {
        console.log('[CardSelector] 카드 선택 해제:', card);
      }
    }
  }

  /**
   * 모두 지우기
   */
  private clearAll(): void {
    this.selectedCards = [];
    this.updateDisplay();

    this.eventBus.emit('toast:show', {
      type: 'info',
      message: '모든 카드가 선택 해제되었습니다.'
    });
  }

  /**
   * 랜덤 선택
   */
  private randomSelect(): void {
    this.clearAll();

    const allCards: Card[] = [];
    this.suits.forEach(suit => {
      this.ranks.forEach(rank => {
        allCards.push({ suit, rank });
      });
    });

    // Fisher-Yates 셔플
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }

    // 필요한 수만큼 선택
    this.selectedCards = allCards.slice(0, this.maxCards);
    this.updateDisplay();

    this.eventBus.emit('toast:show', {
      type: 'success',
      message: `${this.maxCards}장의 카드가 랜덤으로 선택되었습니다.`
    });
  }

  /**
   * 페어 선택 (2장만 가능)
   */
  private selectPair(): void {
    if (this.maxCards !== 2) return;

    this.clearAll();

    // 랜덤 랭크 선택
    const randomRank = this.ranks[Math.floor(Math.random() * this.ranks.length)];
    
    // 해당 랭크의 두 카드를 랜덤으로 선택
    const rankCards = this.suits.map(suit => ({ suit, rank: randomRank }));
    const shuffled = rankCards.sort(() => Math.random() - 0.5);
    
    this.selectedCards = shuffled.slice(0, 2);
    this.updateDisplay();

    this.eventBus.emit('toast:show', {
      type: 'success',
      message: `${randomRank} 페어가 선택되었습니다.`
    });
  }

  /**
   * 수티드 선택 (2장만 가능)
   */
  private selectSuited(): void {
    if (this.maxCards !== 2) return;

    this.clearAll();

    // 랜덤 수트 선택
    const randomSuit = this.suits[Math.floor(Math.random() * this.suits.length)];
    
    // 해당 수트의 두 카드를 랜덤으로 선택
    const suitCards = this.ranks.map(rank => ({ suit: randomSuit, rank }));
    const shuffled = suitCards.sort(() => Math.random() - 0.5);
    
    this.selectedCards = shuffled.slice(0, 2);
    this.updateDisplay();

    const suitName = this.getSuitName(randomSuit);
    this.eventBus.emit('toast:show', {
      type: 'success',
      message: `${suitName} 수티드 카드가 선택되었습니다.`
    });
  }

  /**
   * 필터 적용
   */
  private applyFilter(filter: string): void {
    let filteredRanks: Card['rank'][] = [];

    switch (filter) {
      case 'all':
        filteredRanks = this.ranks;
        break;
      case 'high':
        filteredRanks = ['A', 'K', 'Q', 'J', 'T'];
        break;
      case 'middle':
        filteredRanks = ['9', '8', '7', '6'];
        break;
      case 'low':
        filteredRanks = ['5', '4', '3', '2'];
        break;
    }

    this.highlightCards(filteredRanks);
    
    // 필터 버튼 상태 업데이트
    this.element.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
  }

  /**
   * 카드 검색
   */
  private searchCards(query: string): void {
    if (!query) {
      this.clearHighlight();
      return;
    }

    const matchingCards: Card[] = [];

    // 특별한 검색어 처리
    if (query === 'pair') {
      // 현재 선택된 카드들 중 페어 찾기
      const ranks = this.selectedCards.map(c => c.rank);
      const pairRanks = ranks.filter((rank, index) => ranks.indexOf(rank) !== index);
      pairRanks.forEach(rank => {
        this.suits.forEach(suit => {
          matchingCards.push({ suit, rank });
        });
      });
    } else if (query === 'suited') {
      // 같은 수트 카드들
      const suits = [...new Set(this.selectedCards.map(c => c.suit))];
      suits.forEach(suit => {
        this.ranks.forEach(rank => {
          matchingCards.push({ suit, rank });
        });
      });
    } else {
      // 일반 텍스트 검색
      this.suits.forEach(suit => {
        this.ranks.forEach(rank => {
          const cardName = `${rank}${suit}`.toLowerCase();
          const displayName = this.getCardName({ suit, rank }).toLowerCase();
          
          if (cardName.includes(query) || displayName.includes(query)) {
            matchingCards.push({ suit, rank });
          }
        });
      });
    }

    this.highlightSpecificCards(matchingCards);
  }

  /**
   * 카드 하이라이트
   */
  private highlightCards(ranks: Card['rank'][]): void {
    this.element.querySelectorAll('.playing-card').forEach(card => {
      const rank = (card as HTMLElement).dataset.rank;
      card.classList.toggle('highlighted', ranks.includes(rank as Card['rank']));
    });
  }

  /**
   * 특정 카드들 하이라이트
   */
  private highlightSpecificCards(cards: Card[]): void {
    this.element.querySelectorAll('.playing-card').forEach(cardElement => {
      const suit = (cardElement as HTMLElement).dataset.suit as Card['suit'];
      const rank = (cardElement as HTMLElement).dataset.rank as Card['rank'];
      
      const isHighlighted = cards.some(card => 
        card.suit === suit && card.rank === rank
      );
      
      cardElement.classList.toggle('highlighted', isHighlighted);
    });
  }

  /**
   * 하이라이트 지우기
   */
  private clearHighlight(): void {
    this.element.querySelectorAll('.playing-card').forEach(card => {
      card.classList.remove('highlighted');
    });
  }

  /**
   * 디스플레이 업데이트
   */
  private updateDisplay(): void {
    // 선택된 카드 미리보기 업데이트
    const previewContainer = this.element.querySelector('.preview-cards');
    if (previewContainer) {
      previewContainer.innerHTML = this.renderSelectedCards();
    }

    // 카운터 업데이트
    const selectedCount = this.element.querySelector('.selected-count');
    if (selectedCount) {
      selectedCount.textContent = this.selectedCards.length.toString();
    }

    // 확인 버튼 상태 업데이트
    const confirmBtn = this.element.querySelector('[data-action="confirm"]') as HTMLButtonElement;
    if (confirmBtn) {
      confirmBtn.disabled = this.selectedCards.length === 0;
      confirmBtn.textContent = `확인 (${this.selectedCards.length}장)`;
    }

    // 그리드의 선택 상태 업데이트
    this.element.querySelectorAll('.playing-card').forEach(cardElement => {
      const suit = (cardElement as HTMLElement).dataset.suit as Card['suit'];
      const rank = (cardElement as HTMLElement).dataset.rank as Card['rank'];
      
      if (suit && rank) {
        const isSelected = this.isCardSelected({ suit, rank });
        cardElement.classList.toggle('selected', isSelected);
        
        const indicator = cardElement.querySelector('.selection-indicator');
        if (isSelected && !indicator) {
          const indicatorDiv = document.createElement('div');
          indicatorDiv.className = 'selection-indicator';
          indicatorDiv.textContent = '✓';
          cardElement.appendChild(indicatorDiv);
        } else if (!isSelected && indicator) {
          indicator.remove();
        }
      }
    });
  }

  /**
   * 유틸리티 메서드들
   */
  private isCardSelected(card: Card): boolean {
    return this.selectedCards.some(c => 
      c.suit === card.suit && c.rank === card.rank
    );
  }

  private isCardDisabled(card: Card): boolean {
    // 현재는 비활성화된 카드가 없음
    return false;
  }

  private getSuitSymbol(suit: Card['suit']): string {
    const symbols = {
      'spades': '♠',
      'hearts': '♥',
      'diamonds': '♦',
      'clubs': '♣'
    };
    return symbols[suit];
  }

  private getSuitName(suit: Card['suit']): string {
    const names = {
      'spades': '스페이드',
      'hearts': '하트',
      'diamonds': '다이아몬드',
      'clubs': '클럽'
    };
    return names[suit];
  }

  private getSuitColor(suit: Card['suit']): string {
    return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
  }

  private getCardName(card: Card): string {
    const rankNames = {
      'A': '에이스', 'K': '킹', 'Q': '퀸', 'J': '잭', 'T': '텐',
      '9': '나인', '8': '에잇', '7': '세븐', '6': '식스', '5': '파이브',
      '4': '포', '3': '쓰리', '2': '투'
    };
    
    return `${this.getSuitName(card.suit)} ${rankNames[card.rank]}`;
  }

  private playSelectSound(): void {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('[CardSelector] 사운드 재생 실패:', error);
    }
  }

  /**
   * 공개 메서드들
   */
  public open(): void {
    this.isOpen = true;
    this.element.classList.add('open');
    
    // 포커스 설정
    const dialog = this.element.querySelector('.modal-dialog') as HTMLElement;
    if (dialog) {
      dialog.focus();
    }

    // body 스크롤 방지
    document.body.style.overflow = 'hidden';

    this.updateDisplay();

    this.eventBus.emit('card-selector:opened');
  }

  public close(): void {
    this.isOpen = false;
    this.element.classList.remove('open');
    
    // body 스크롤 복원
    document.body.style.overflow = '';

    this.onClose?.();
    this.eventBus.emit('card-selector:closed');
  }

  public confirm(): void {
    if (this.selectedCards.length === 0) {
      this.eventBus.emit('toast:show', {
        type: 'warning',
        message: '최소 1장의 카드를 선택하세요.'
      });
      return;
    }

    const selectedCards = [...this.selectedCards];
    
    this.onSelect?.(selectedCards);
    this.eventBus.emit('card-selector:confirmed', { cards: selectedCards });
    
    this.close();

    if (this.config.isDebugMode) {
      console.log('[CardSelector] 카드 선택 완료:', selectedCards);
    }
  }

  public setMaxCards(maxCards: number): void {
    this.maxCards = maxCards;
    
    // 현재 선택된 카드가 제한을 초과하면 자르기
    if (this.selectedCards.length > maxCards) {
      this.selectedCards = this.selectedCards.slice(0, maxCards);
    }
    
    this.updateDisplay();
  }

  public setSelectedCards(cards: Card[]): void {
    this.selectedCards = cards.slice(0, this.maxCards);
    this.updateDisplay();
  }

  public getSelectedCards(): Card[] {
    return [...this.selectedCards];
  }

  /**
   * 컴포넌트 제거
   */
  public destroy(): void {
    // 이벤트 리스너 제거
    this.eventBus.off('card-selector:open', this.handleExternalOpen);
    this.eventBus.off('card-selector:close', this.close);

    // body 스타일 복원
    document.body.style.overflow = '';

    // 요소 제거
    this.element.remove();
  }
}