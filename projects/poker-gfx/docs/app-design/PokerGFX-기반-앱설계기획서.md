# PokerGFX 완전 복제 포커 방송 앱 설계 기획서

## 📋 기획서 개요

### 목적
**PokerGFX의 모든 기능을 그대로 복사**하여 동일한 수준의 전문적인 포커 방송 솔루션을 개발하기 위한 상세 설계 문서입니다. RFID 하드웨어, 카메라 제어, 그래픽 오버레이, 스트리밍 기능 등 모든 원본 기능을 완전히 구현합니다.

### 기존 PokerGFX 시스템 분석 결과

#### PokerGFX의 핵심 구조
```yaml
현재_시스템:
  하드웨어:
    - RFID Reader (USB 3.0 + 전원)
    - RFID 태그 내장 전용 카드 데크
    - Windows PC (Intel i7, 16GB RAM, GTX 1080+)
    - 다중 비디오 캡처 장비
    
  소프트웨어:
    - PokerGFX Server (메인 애플리케이션)
    - Action Tracker (베팅 액션 입력 앱)
    - Studio (포스트 프로덕션 편집)
    
  워크플로우:
    1. RFID 테이블 캘리브레이션 (각 좌석 위치 설정)
    2. 52장 카드 개별 등록
    3. 비디오 소스 설정 (최대 16개)
    4. 플레이어 정보 입력
    5. 라이브 방송 또는 녹화
```

#### 라이선스별 기능 분석
```yaml
Basic_License:
  - 비디오 소스: 최대 4개
  - 기본 그래픽 스킨
  - 30분 딜레이
  - Action Tracker 포함
  
Pro_License:
  - 비디오 소스: 최대 8개  
  - Studio 포스트 프로덕션
  - 플레이어 사진/국기
  - ATEM 스위처 제어
  - 60분 딜레이
  
Enterprise_License:
  - 비디오 소스: 최대 16개
  - Live API
  - NDI 입출력
  - 다중 동시 출력
```

---

## 🎯 PokerGFX 완전 복제 전략

### 핵심 구현 원칙

#### 1. RFID 시스템 완전 복제
```yaml
RFID_Reader_모듈:
  하드웨어_연동:
    - USB 3.0 RFID Reader 지원
    - 52장 개별 카드 등록 시스템
    - 테이블 캘리브레이션 기능
    - 안테나 신호 강도 모니터링
    
  소프트웨어_기능:
    - 실시간 카드 감지
    - 포지션별 카드 인식
    - 카드 중복 감지 및 오류 처리
    - RFID 신호 품질 체크
```

#### 2. PokerGFX 호환 아키텍처
```yaml
시스템_구조:
  - Windows 기반 데스크톱 애플리케이션
  - Action Tracker 별도 애플리케이션
  - 로컬 네트워크 기반 통신
  - DirectX/OpenGL 그래픽 렌더링
  
라이선스_티어:
  - Basic: 4개 비디오 소스, 30분 딜레이
  - Pro: 8개 소스, Studio 기능, 60분 딜레이
  - Enterprise: 16개 소스, API, NDI 지원
```

#### 3. 기존 워크플로우 완전 보존
```yaml
사용자_워크플로우:
  - RFID 테이블 캘리브레이션 과정
  - 52장 카드 개별 등록
  - 비디오 소스 구성
  - 플레이어 프로필 설정
  - 라이브 방송 및 녹화 시작
```

---

## 🏗️ PokerGFX 시스템 아키텍처

### 전체 구조도

```
┌─────────────────────────────────────────────────────────────┐
│                  PokerGFX 완전 복제 시스템                   │
├─────────────────┬─────────────────┬─────────────────────────┤
│  데스크톱 앱     │  하드웨어 층    │      외부 연동          │
├─────────────────┼─────────────────┼─────────────────────────┤
│ • PokerGFX Server│ • RFID Reader   │ • OBS Studio 연동       │
│ • Action Tracker │ • USB 3.0 허브  │ • Twitch/YouTube API    │
│ • Studio Editor  │ • 비디오 캡처   │ • ATEM 스위처 제어      │
│ • Graphics Engine│ • DirectX/OpenGL│ • NDI 입출력            │
└─────────────────┴─────────────────┴─────────────────────────┘
```

### 핵심 컴포넌트

#### 1. PokerGFX Server (데스크톱 애플리케이션)
```cpp
// C++/C# 기반 메인 애플리케이션 구조
class PokerGFXServer {
public:
    PokerGFXServer() {
        rfidReader = new RFIDReaderController();
        gameState = new GameStateManager();
        videoSources = new VideoSourceManager();
        graphics = new DirectXRenderer();
        streaming = new StreamManager();
        actionTracker = new ActionTrackerServer();
    }
    
    bool InitializeSystem() {
        // 1. RFID Reader 초기화
        if (!rfidReader->Connect()) {
            ShowError("RFID Reader 연결 실패");
            return false;
        }
        
        // 2. 비디오 캡처 장비 검색
        videoSources->DetectCaptureDevices();
        
        // 3. DirectX 그래픽 엔진 초기화
        graphics->Initialize(GetHWND());
        
        // 4. 네트워크 서버 시작 (Action Tracker용)
        actionTracker->StartServer(DEFAULT_PORT);
        
        return true;
    }
    
    void StartCalibration() {
        // PokerGFX 스타일 테이블 캘리브레이션
        CalibrationWizard wizard;
        wizard.ShowModal();
        
        // 각 좌석 위치 설정
        for (int i = 0; i < MAX_PLAYERS; i++) {
            PlayerPosition pos = wizard.GetPlayerPosition(i);
            rfidReader->SetPlayerAntenna(i, pos);
        }
    }
    
private:
    RFIDReaderController* rfidReader;
    GameStateManager* gameState;
    VideoSourceManager* videoSources;
    DirectXRenderer* graphics;
    StreamManager* streaming;
    ActionTrackerServer* actionTracker;
};
```

#### 2. Action Tracker (별도 데스크톱 앱)
```cpp
// Windows Forms 기반 Action Tracker 애플리케이션
class ActionTrackerApp : public Form {
public:
    ActionTrackerApp() {
        InitializeComponent();
        tcpClient = new TcpClient();
        ConnectToMainServer();
    }
    
    void ConnectToMainServer() {
        try {
            tcpClient->Connect("localhost", POKERGFX_PORT);
            networkStream = tcpClient->GetStream();
            StartMessageListener();
        }
        catch (Exception^ ex) {
            MessageBox::Show("PokerGFX Server 연결 실패: " + ex->Message);
        }
    }
  
  renderPlayerActions(players) {
    return players.map(player => ({
      name: player.name,
      stack: player.stack,
      quickActions: ['fold', 'call', 'raise'],
      customBetInput: true
    }));
  }
  
  async submitAction(playerId, action, amount = 0) {
    const actionData = {
      playerId,
      action,
      amount,
      timestamp: Date.now()
    };
    
    // 실시간으로 메인 애플리케이션에 전송
    this.socket.send(JSON.stringify(actionData));
    
    // 로컬 UI 업데이트
    this.ui.updatePlayerStatus(playerId, action);
  }
}
```

#### 3. 게임 상태 관리자
```javascript
class GameStateManager {
  constructor() {
    this.players = new Map();
    this.currentHand = null;
    this.pot = 0;
    this.communityCards = [];
    this.actionHistory = [];
    this.bettingRound = 'preflop';
  }
  
  // PokerGFX와 동일한 게임 로직 구현
  processAction(playerId, action, amount) {
    const player = this.players.get(playerId);
    
    switch(action) {
      case 'fold':
        player.status = 'folded';
        player.cards = null; // 보안을 위해 카드 숨김
        break;
        
      case 'call':
        const callAmount = this.getCurrentBet() - player.currentBet;
        player.stack -= callAmount;
        this.pot += callAmount;
        break;
        
      case 'raise':
        const raiseAmount = amount - player.currentBet;
        player.stack -= raiseAmount;
        this.pot += raiseAmount;
        this.currentBet = amount;
        break;
    }
    
    this.actionHistory.push({
      playerId,
      action,
      amount,
      timestamp: Date.now()
    });
    
    // 베팅 라운드 진행 체크
    this.checkBettingRoundComplete();
  }
  
  checkBettingRoundComplete() {
    const activePlayers = Array.from(this.players.values())
      .filter(p => p.status === 'active');
      
    const allActionsComplete = activePlayers.every(p => 
      p.hasActed && p.currentBet === this.currentBet
    );
    
    if (allActionsComplete) {
      this.advanceBettingRound();
    }
  }
}
```

---

## 🎨 사용자 인터페이스 설계

### 1. 메인 컨트롤 화면

```html
<!DOCTYPE html>
<html>
<head>
    <title>Poker-GFX Control Center</title>
    <style>
        .control-panel {
            display: grid;
            grid-template-areas: 
                "video-preview game-info"
                "player-list stream-status"
                "action-controls system-status";
            gap: 20px;
            padding: 20px;
        }
        
        .video-preview {
            grid-area: video-preview;
            background: #000;
            border-radius: 8px;
            position: relative;
        }
        
        .overlay-graphics {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }
    </style>
</head>
<body>
    <div class="control-panel">
        <!-- 비디오 프리뷰 영역 -->
        <div class="video-preview">
            <video id="mainVideo" autoplay muted></video>
            <canvas class="overlay-graphics" id="gameOverlay"></canvas>
            
            <!-- 카메라 전환 버튼 -->
            <div class="camera-controls">
                <button onclick="switchCamera(1)">Cam 1</button>
                <button onclick="switchCamera(2)">Cam 2</button>
                <button onclick="switchCamera(3)">Cam 3</button>
                <button onclick="enableAutoSwitch()">Auto</button>
            </div>
        </div>
        
        <!-- 게임 정보 패널 -->
        <div class="game-info">
            <h3>Game Status</h3>
            <div>Hand #: <span id="handNumber">1</span></div>
            <div>Pot: $<span id="potSize">0</span></div>
            <div>Stakes: <span id="stakes">1/2</span></div>
            <div>Round: <span id="bettingRound">Pre-flop</span></div>
        </div>
        
        <!-- 플레이어 목록 -->
        <div class="player-list">
            <h3>Players</h3>
            <div id="playersList">
                <!-- 동적으로 생성됨 -->
            </div>
        </div>
        
        <!-- 스트리밍 상태 -->
        <div class="stream-status">
            <h3>Streaming</h3>
            <div class="stream-item">
                <span>Twitch:</span>
                <span class="status connected">Connected</span>
                <span>856 viewers</span>
            </div>
            <div class="stream-item">
                <span>YouTube:</span>  
                <span class="status connecting">Connecting...</span>
            </div>
        </div>
    </div>
</body>
</html>
```

### 2. Action Tracker 모바일 인터페이스

```html
<!DOCTYPE html>
<html>
<head>
    <title>Poker Action Tracker</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        .action-tracker {
            display: flex;
            flex-direction: column;
            height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
        }
        
        .game-header {
            background: #2c3e50;
            color: white;
            padding: 15px;
            text-align: center;
        }
        
        .players-grid {
            flex: 1;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            padding: 10px;
            overflow-y: auto;
        }
        
        .player-card {
            background: white;
            border-radius: 12px;
            padding: 15px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 2px solid transparent;
        }
        
        .player-card.active {
            border-color: #3498db;
        }
        
        .player-card.folded {
            opacity: 0.5;
            background: #ecf0f1;
        }
        
        .player-name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .player-stack {
            color: #27ae60;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .action-buttons {
            display: flex;
            gap: 5px;
        }
        
        .action-btn {
            flex: 1;
            padding: 8px 12px;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
        }
        
        .fold-btn { background: #e74c3c; color: white; }
        .call-btn { background: #f39c12; color: white; }
        .raise-btn { background: #e67e22; color: white; }
        
        .pot-info {
            background: #34495e;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="action-tracker">
        <div class="game-header">
            <div>Hand #<span id="handNum">47</span> | Pot: $<span id="potAmount">2,850</span></div>
            <div style="font-size: 14px; opacity: 0.8">Pre-flop | Stakes: $5/$10</div>
        </div>
        
        <div class="players-grid" id="playersGrid">
            <!-- 플레이어 카드들이 여기에 동적으로 생성됨 -->
        </div>
        
        <div class="pot-info">
            Current Pot: $<span id="currentPot">2,850</span>
        </div>
    </div>
    
    <script>
        // 플레이어 액션 처리 JavaScript
        class ActionTrackerUI {
            constructor() {
                this.socket = new WebSocket('ws://localhost:3001');
                this.players = [];
                this.initializeUI();
            }
            
            initializeUI() {
                this.socket.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    this.updateGameState(data);
                };
            }
            
            renderPlayers(players) {
                const grid = document.getElementById('playersGrid');
                grid.innerHTML = '';
                
                players.forEach(player => {
                    const card = document.createElement('div');
                    card.className = `player-card ${player.status}`;
                    card.innerHTML = `
                        <div class="player-name">${player.name}</div>
                        <div class="player-stack">$${player.stack}</div>
                        <div class="action-buttons">
                            <button class="action-btn fold-btn" 
                                onclick="submitAction('${player.id}', 'fold')">Fold</button>
                            <button class="action-btn call-btn" 
                                onclick="submitAction('${player.id}', 'call')">Call</button>
                            <button class="action-btn raise-btn" 
                                onclick="showRaiseDialog('${player.id}')">Raise</button>
                        </div>
                    `;
                    grid.appendChild(card);
                });
            }
            
            submitAction(playerId, action, amount = 0) {
                const actionData = {
                    type: 'player_action',
                    playerId,
                    action,
                    amount,
                    timestamp: Date.now()
                };
                
                this.socket.send(JSON.stringify(actionData));
                
                // 시각적 피드백
                this.showActionFeedback(playerId, action);
            }
            
            showActionFeedback(playerId, action) {
                // 액션 실행 시 시각적 피드백 표시
                const playerCard = document.querySelector(`[data-player="${playerId}"]`);
                playerCard.classList.add('action-submitted');
                
                setTimeout(() => {
                    playerCard.classList.remove('action-submitted');
                }, 1000);
            }
        }
        
        // 앱 초기화
        const actionTracker = new ActionTrackerUI();
    </script>
</body>
</html>
```

---

## 🎮 핵심 기능 구현

### 1. 카드 입력 시스템

```javascript
// RFID를 대체하는 직관적인 카드 입력 시스템
class CardInputSystem {
  constructor() {
    this.currentPlayer = null;
    this.cardSelection = new CardSelector();
    this.gameState = null;
  }
  
  // 홀카드 입력 모드
  startHolecardInput(playerId) {
    this.currentPlayer = playerId;
    this.cardSelection.show({
      title: `Enter hole cards for ${this.getPlayerName(playerId)}`,
      cardsNeeded: 2,
      onComplete: (cards) => this.setPlayerHolecards(playerId, cards)
    });
  }
  
  // 커뮤니티 카드 입력
  addCommunityCard() {
    const existingCards = this.gameState.communityCards;
    
    this.cardSelection.show({
      title: `Add community card (${existingCards.length + 1}/5)`,
      cardsNeeded: 1,
      excludeCards: [...existingCards, ...this.getAllPlayerCards()],
      onComplete: (cards) => this.addToCommunity(cards[0])
    });
  }
  
  // 빠른 입력을 위한 키보드 단축키
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      // 숫자 키로 플레이어 선택 (1-9)
      if (event.key >= '1' && event.key <= '9') {
        const playerIndex = parseInt(event.key) - 1;
        this.selectPlayer(playerIndex);
      }
      
      // 카드 입력 단축키 (예: "AS" = Ace of Spades)
      if (event.key === 'h') this.startHolecardInput(this.currentPlayer);
      if (event.key === 'f') this.dealFlop();
      if (event.key === 't') this.dealTurn();
      if (event.key === 'r') this.dealRiver();
    });
  }
}

// 카드 선택 UI 컴포넌트
class CardSelector {
  constructor() {
    this.element = this.createElement();
    this.selectedCards = [];
    this.onComplete = null;
  }
  
  createElement() {
    const container = document.createElement('div');
    container.className = 'card-selector-overlay';
    container.innerHTML = `
      <div class="card-selector">
        <h3 class="selector-title"></h3>
        <div class="card-grid">
          ${this.renderCardGrid()}
        </div>
        <div class="selected-cards">
          <h4>Selected Cards:</h4>
          <div class="selected-display"></div>
        </div>
        <div class="selector-buttons">
          <button class="cancel-btn">Cancel</button>
          <button class="confirm-btn" disabled>Confirm</button>
        </div>
      </div>
    `;
    
    this.setupEventListeners(container);
    return container;
  }
  
  renderCardGrid() {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
    
    let html = '';
    suits.forEach(suit => {
      ranks.forEach(rank => {
        const cardId = rank + suit;
        html += `
          <div class="card-option" data-card="${cardId}">
            <span class="card-rank">${rank}</span>
            <span class="card-suit ${suit === '♥' || suit === '♦' ? 'red' : 'black'}">${suit}</span>
          </div>
        `;
      });
    });
    
    return html;
  }
  
  show(options) {
    this.selectedCards = [];
    this.cardsNeeded = options.cardsNeeded;
    this.onComplete = options.onComplete;
    this.excludeCards = options.excludeCards || [];
    
    // 제목 설정
    this.element.querySelector('.selector-title').textContent = options.title;
    
    // 제외할 카드들 비활성화
    this.excludeCards.forEach(card => {
      const cardElement = this.element.querySelector(`[data-card="${card}"]`);
      if (cardElement) {
        cardElement.classList.add('disabled');
      }
    });
    
    // 모달 표시
    document.body.appendChild(this.element);
    this.element.style.display = 'flex';
  }
  
  selectCard(cardId) {
    if (this.excludeCards.includes(cardId)) return;
    if (this.selectedCards.includes(cardId)) return;
    if (this.selectedCards.length >= this.cardsNeeded) return;
    
    this.selectedCards.push(cardId);
    this.updateSelectedDisplay();
    this.updateConfirmButton();
    
    // 시각적 피드백
    const cardElement = this.element.querySelector(`[data-card="${cardId}"]`);
    cardElement.classList.add('selected');
  }
  
  updateSelectedDisplay() {
    const display = this.element.querySelector('.selected-display');
    display.innerHTML = this.selectedCards.map(card => 
      `<span class="selected-card">${card}</span>`
    ).join('');
  }
  
  updateConfirmButton() {
    const confirmBtn = this.element.querySelector('.confirm-btn');
    confirmBtn.disabled = this.selectedCards.length !== this.cardsNeeded;
  }
  
  confirm() {
    if (this.selectedCards.length === this.cardsNeeded && this.onComplete) {
      this.onComplete(this.selectedCards);
    }
    this.hide();
  }
  
  hide() {
    this.element.style.display = 'none';
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
```

### 2. 실시간 그래픽 오버레이

```javascript
class GraphicsRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.theme = new GraphicsTheme();
    this.animations = new AnimationEngine();
    
    // 캔버스 크기를 비디오에 맞춤
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }
  
  // PokerGFX 스타일의 그래픽 렌더링
  render(gameState) {
    // 캔버스 클리어
    this.clearCanvas();
    
    // 플레이어 정보 렌더링
    this.renderPlayers(gameState.players);
    
    // 커뮤니티 카드 렌더링  
    this.renderCommunityCards(gameState.communityCards, gameState.bettingRound);
    
    // 팟 정보 렌더링
    this.renderPotInfo(gameState.pot, gameState.sidePots);
    
    // 베팅 액션 하이라이트
    this.renderActionHighlights(gameState.recentActions);
    
    // 딜러 버튼 위치
    this.renderDealerButton(gameState.dealerPosition);
    
    // 애니메이션 업데이트
    this.animations.update();
  }
  
  renderPlayers(players) {
    players.forEach((player, index) => {
      const position = this.getPlayerPosition(index, players.length);
      
      // 플레이어 배경 박스
      this.drawPlayerBackground(position, player.status);
      
      // 플레이어 이름
      this.drawText(player.name, {
        x: position.x,
        y: position.y - 30,
        font: this.theme.playerNameFont,
        color: this.theme.playerNameColor,
        align: 'center'
      });
      
      // 칩 스택
      this.drawText(`$${player.stack}`, {
        x: position.x,
        y: position.y - 10,
        font: this.theme.stackFont,
        color: this.theme.stackColor,
        align: 'center'
      });
      
      // 홀카드 (공개된 경우)
      if (player.holecards && this.shouldShowCards(player)) {
        this.drawCards(player.holecards, {
          x: position.x - 35,
          y: position.y + 10
        });
      }
      
      // 현재 베팅 액션
      if (player.currentAction) {
        this.drawActionIndicator(player.currentAction, position);
      }
      
      // 베팅 칩 애니메이션
      if (player.currentBet > 0) {
        this.drawBettingChips(player.currentBet, position);
      }
    });
  }
  
  renderCommunityCards(cards, bettingRound) {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // 커뮤니티 카드 배경
    this.drawRoundedRect({
      x: centerX - 150,
      y: centerY - 40,
      width: 300,
      height: 80,
      radius: 10,
      fill: this.theme.communityCardBackground
    });
    
    // 카드들 렌더링
    cards.forEach((card, index) => {
      const x = centerX - 125 + (index * 50);
      const y = centerY - 30;
      
      this.drawCard(card, { x, y });
      
      // 카드 공개 애니메이션
      if (this.isNewlyRevealedCard(card, bettingRound)) {
        this.animations.add(new CardRevealAnimation(card, { x, y }));
      }
    });
    
    // 다음 카드 자리 표시
    const nextCardIndex = cards.length;
    if (nextCardIndex < 5) {
      const x = centerX - 125 + (nextCardIndex * 50);
      const y = centerY - 30;
      this.drawCardPlaceholder({ x, y });
    }
  }
  
  renderPotInfo(mainPot, sidePots = []) {
    const centerX = this.canvas.width / 2;
    const potY = 100;
    
    // 메인 팟
    this.drawText(`Pot: $${mainPot}`, {
      x: centerX,
      y: potY,
      font: this.theme.potFont,
      color: this.theme.potColor,
      align: 'center',
      shadow: true
    });
    
    // 사이드 팟들
    sidePots.forEach((pot, index) => {
      this.drawText(`Side Pot ${index + 1}: $${pot.amount}`, {
        x: centerX,
        y: potY + 30 + (index * 25),
        font: this.theme.sidePotFont,
        color: this.theme.sidePotColor,
        align: 'center'
      });
    });
  }
  
  // PokerGFX 스타일의 카드 렌더링
  drawCard(card, position) {
    const { rank, suit } = this.parseCard(card);
    const isRed = suit === '♥' || suit === '♦';
    
    // 카드 배경
    this.drawRoundedRect({
      x: position.x,
      y: position.y,
      width: 40,
      height: 60,
      radius: 5,
      fill: '#ffffff',
      stroke: '#cccccc',
      strokeWidth: 2
    });
    
    // 랭크
    this.drawText(rank, {
      x: position.x + 8,
      y: position.y + 15,
      font: '14px Arial Bold',
      color: isRed ? '#d32f2f' : '#000000'
    });
    
    // 수트
    this.drawText(suit, {
      x: position.x + 8,
      y: position.y + 35,
      font: '16px Arial',
      color: isRed ? '#d32f2f' : '#000000'
    });
    
    // 뒷면 랭크/수트 (우하단)
    this.drawText(rank, {
      x: position.x + 32,
      y: position.y + 45,
      font: '10px Arial Bold',
      color: isRed ? '#d32f2f' : '#000000',
      rotate: 180
    });
    
    this.drawText(suit, {
      x: position.x + 32,
      y: position.y + 25,
      font: '12px Arial',
      color: isRed ? '#d32f2f' : '#000000',
      rotate: 180
    });
  }
  
  // 베팅 액션 애니메이션
  drawActionIndicator(action, position) {
    const colors = {
      fold: '#f44336',
      call: '#ff9800', 
      raise: '#4caf50',
      check: '#2196f3',
      allin: '#9c27b0'
    };
    
    // 액션 버블
    this.drawRoundedRect({
      x: position.x - 25,
      y: position.y - 60,
      width: 50,
      height: 20,
      radius: 10,
      fill: colors[action.type] || '#666666'
    });
    
    // 액션 텍스트
    this.drawText(action.type.toUpperCase(), {
      x: position.x,
      y: position.y - 45,
      font: '10px Arial Bold',
      color: '#ffffff',
      align: 'center'
    });
    
    // 베팅 금액 (있는 경우)
    if (action.amount > 0) {
      this.drawText(`$${action.amount}`, {
        x: position.x,
        y: position.y - 30,
        font: '12px Arial Bold',  
        color: colors[action.type],
        align: 'center'
      });
    }
  }
  
  // 플레이어 포지션 계산 (원형 배치)
  getPlayerPosition(index, totalPlayers) {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.7;
    
    // 버튼이 6시 방향에 오도록 각도 조정
    const angle = (2 * Math.PI * index / totalPlayers) - (Math.PI / 2);
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  }
}

// 그래픽 테마 시스템
class GraphicsTheme {
  constructor(themeName = 'default') {
    this.themes = {
      default: {
        background: '#0d4f2c',
        playerNameFont: '14px Arial Bold',
        playerNameColor: '#ffffff',
        stackFont: '12px Arial',
        stackColor: '#ffd700',
        potFont: '24px Arial Bold',
        potColor: '#ffffff',
        communityCardBackground: 'rgba(0,0,0,0.5)',
        actionColors: {
          fold: '#f44336',
          call: '#ff9800',
          raise: '#4caf50'
        }
      },
      
      modern: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        playerNameFont: '14px "Segoe UI" Bold',
        playerNameColor: '#ffffff',
        stackFont: '12px "Segoe UI"',
        stackColor: '#00d4aa',
        potFont: '24px "Segoe UI" Bold',
        potColor: '#ffffff'
      },
      
      casino: {
        background: '#1a1a1a',
        playerNameFont: '14px "Times New Roman" Bold',
        playerNameColor: '#ffd700',
        stackFont: '12px "Times New Roman"',
        stackColor: '#ffffff',
        potFont: '24px "Times New Roman" Bold',
        potColor: '#ffd700'
      }
    };
    
    this.currentTheme = this.themes[themeName];
  }
  
  setTheme(themeName) {
    if (this.themes[themeName]) {
      this.currentTheme = this.themes[themeName];
    }
  }
  
  get(property) {
    return this.currentTheme[property];
  }
}
```

### 3. 스트리밍 연동 시스템

```javascript
// OBS Studio WebSocket 연동
class OBSController {
  constructor() {
    this.obs = null;
    this.connected = false;
    this.scenes = [];
    this.sources = [];
  }
  
  async connect(address = 'localhost:4444', password = '') {
    try {
      // OBS WebSocket 라이브러리 사용
      this.obs = new OBSWebSocket();
      
      await this.obs.connect({
        address: address,
        password: password
      });
      
      this.connected = true;
      this.setupEventListeners();
      
      // 현재 씬과 소스 정보 가져오기
      await this.refreshSceneList();
      
      return true;
    } catch (error) {
      console.error('OBS 연결 실패:', error);
      return false;
    }
  }
  
  setupEventListeners() {
    this.obs.on('SwitchScenes', (data) => {
      console.log('씬 변경됨:', data.sceneName);
    });
    
    this.obs.on('StreamStarted', () => {
      console.log('스트리밍 시작됨');
    });
    
    this.obs.on('StreamStopped', () => {
      console.log('스트리밍 중지됨');
    });
  }
  
  async refreshSceneList() {
    try {
      const result = await this.obs.send('GetSceneList');
      this.scenes = result.scenes;
      return this.scenes;
    } catch (error) {
      console.error('씬 목록 가져오기 실패:', error);
      return [];
    }
  }
  
  // 브라우저 소스에 게임 오버레이 업데이트
  async updateGameOverlay(gameState) {
    try {
      // 브라우저 소스 찾기
      const browserSource = await this.findBrowserSource('Poker Overlay');
      
      if (browserSource) {
        // JavaScript를 통해 오버레이 업데이트
        const script = `
          if (window.updateGameState) {
            window.updateGameState(${JSON.stringify(gameState)});
          }
        `;
        
        await this.obs.send('ExecuteJavaScript', {
          sourceName: browserSource.name,
          script: script
        });
      }
    } catch (error) {
      console.error('오버레이 업데이트 실패:', error);
    }
  }
  
  async findBrowserSource(sourceName) {
    try {
      const sources = await this.obs.send('GetSourcesList');
      return sources.sources.find(source => 
        source.name === sourceName && source.typeId === 'browser_source'
      );
    } catch (error) {
      return null;
    }
  }
  
  // 자동 씬 전환 (게임 상황에 따라)
  async autoSwitchScene(gameState) {
    let targetScene = 'Table Overview';
    
    // 게임 상황에 따른 씬 선택 로직
    if (gameState.bettingRound === 'showdown') {
      targetScene = 'Showdown';
    } else if (gameState.playersInHand <= 2) {
      targetScene = 'Heads Up';
    } else if (gameState.recentAction?.type === 'allin') {
      targetScene = 'All-in Drama';
    }
    
    try {
      await this.obs.send('SetCurrentScene', {
        'scene-name': targetScene
      });
    } catch (error) {
      console.error('씬 전환 실패:', error);
    }
  }
  
  // 스트리밍 시작/중지
  async startStreaming() {
    try {
      await this.obs.send('StartStreaming');
      return true;
    } catch (error) {
      console.error('스트리밍 시작 실패:', error);
      return false;
    }
  }
  
  async stopStreaming() {
    try {
      await this.obs.send('StopStreaming');
      return true;
    } catch (error) {
      console.error('스트리밍 중지 실패:', error);
      return false;
    }
  }
  
  // 녹화 시작/중지
  async startRecording() {
    try {
      await this.obs.send('StartRecording');
      return true;
    } catch (error) {
      console.error('녹화 시작 실패:', error);
      return false;
    }
  }
  
  async stopRecording() {
    try {
      await this.obs.send('StopRecording');
      return true;
    } catch (error) {
      console.error('녹화 중지 실패:', error);
      return false;
    }
  }
}

// Twitch API 연동
class TwitchIntegration {
  constructor(clientId, accessToken) {
    this.clientId = clientId;
    this.accessToken = accessToken;
    this.apiBase = 'https://api.twitch.tv/helix';
  }
  
  async getStreamInfo() {
    try {
      const response = await fetch(`${this.apiBase}/streams`, {
        headers: {
          'Client-ID': this.clientId,
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      const data = await response.json();
      return data.data[0]; // 현재 스트림 정보
    } catch (error) {
      console.error('Twitch 스트림 정보 가져오기 실패:', error);
      return null;
    }
  }
  
  async updateStreamTitle(title) {
    try {
      const response = await fetch(`${this.apiBase}/channels`, {
        method: 'PATCH',
        headers: {
          'Client-ID': this.clientId,
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Twitch 스트림 제목 업데이트 실패:', error);
      return false;
    }
  }
  
  async createStreamMarker(description) {
    try {
      const response = await fetch(`${this.apiBase}/streams/markers`, {
        method: 'POST',
        headers: {
          'Client-ID': this.clientId,
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: description
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Twitch 마커 생성 실패:', error);
      return false;
    }
  }
}
```

---

## 📱 배포 및 사용법

### 1. 시스템 요구사항

```yaml
최소_요구사항:
  운영체제: Windows 10, macOS 10.14, Ubuntu 18.04
  CPU: Intel i5-8400 또는 AMD Ryzen 5 2600
  RAM: 8GB
  GPU: 통합 그래픽 (Intel UHD 630 이상)
  네트워크: 업로드 5Mbps
  
권장_요구사항:
  운영체제: Windows 11, macOS 12, Ubuntu 20.04
  CPU: Intel i7-10700K 또는 AMD Ryzen 7 3700X  
  RAM: 16GB
  GPU: NVIDIA GTX 1660 또는 AMD RX 580
  네트워크: 업로드 25Mbps
```

### 2. 설치 및 설정 가이드

#### 웹 서버 실행
```bash
# 1. 저장소 클론
git clone https://github.com/yourname/poker-gfx.git
cd poker-gfx

# 2. 의존성 설치
npm install

# 3. 서버 시작
npm start

# 4. 브라우저에서 접속
# http://localhost:3000
```

#### OBS Studio 연동 설정
```yaml
OBS_설정:
  1. OBS Studio 설치 (v28.0 이상)
  2. WebSocket 플러그인 설치
  3. Tools → WebSocket Server Settings
  4. Enable WebSocket server 체크
  5. Server Port: 4444 (기본값)
  6. 비밀번호 설정 (선택사항)
  
브라우저_소스_추가:
  1. Sources → Add → Browser Source
  2. Name: "Poker Overlay"
  3. URL: http://localhost:3000/overlay
  4. Width: 1920, Height: 1080
  5. Custom CSS: (제공된 CSS 사용)
```

### 3. 사용 워크플로우

#### 기본 사용법 (5분 설정)
```yaml
단계1_초기설정:
  - 웹 브라우저에서 http://localhost:3000 접속
  - 게임 설정 (Hold'em, 스테이크, 플레이어 수)
  - 플레이어 이름 입력
  
단계2_OBS연동:
  - OBS에서 브라우저 소스 추가
  - 오버레이 URL 설정
  - 씬 구성
  
단계3_게임시작:
  - Action Tracker 열기 (모바일 또는 별도 브라우저)
  - 첫 핸드 시작
  - 홀카드 입력 (보안 모드에서는 숨김)
  
단계4_방송진행:
  - 플레이어 액션 입력
  - 커뮤니티 카드 입력
  - 자동 그래픽 업데이트 확인
  - 스트리밍 시작
```

---

## 🔒 보안 및 딜레이 시스템

### Secure Delay 구현

```javascript
class SecureDelaySystem {
  constructor(delayMinutes = 5) {
    this.delayTime = delayMinutes * 60 * 1000; // 밀리초
    this.liveBuffer = new CircularBuffer(1000);
    this.delayedOutput = new DelayedOutput(this.delayTime);
    this.isSecureMode = true;
  }
  
  // 실시간 데이터 처리
  processGameEvent(event) {
    // 라이브 버퍼에 저장 (딜러/플레이어용)
    this.liveBuffer.add({
      ...event,
      timestamp: Date.now()
    });
    
    // 지연된 출력에 추가 (시청자용)
    this.delayedOutput.schedule(event, this.delayTime);
    
    // 보안 모드에서는 홀카드 숨김
    if (this.isSecureMode && event.type === 'holecard_reveal') {
      event = this.censorHolecards(event);
    }
    
    return event;
  }
  
  // 핸드 종료 시 즉시 공개 옵션
  onHandComplete(handData) {
    if (this.shouldRevealImmediately(handData)) {
      // 지연 없이 즉시 공개
      this.delayedOutput.flushHand(handData.handId);
    }
  }
  
  shouldRevealImmediately(handData) {
    // 모든 플레이어가 폴드한 경우
    if (handData.activePlayers <= 1) return true;
    
    // 올인 상황에서 액션이 끝난 경우
    if (handData.allInSituation && handData.bettingComplete) return true;
    
    return false;
  }
  
  censorHolecards(event) {
    return {
      ...event,
      cards: event.cards.map(card => ({ 
        rank: '?', 
        suit: '?', 
        hidden: true 
      }))
    };
  }
  
  // 긴급 상황 시 라이브 전환
  emergencyGoLive() {
    this.delayedOutput.flush();
    this.isSecureMode = false;
    console.log('Emergency: Switched to live mode');
  }
}

class DelayedOutput {
  constructor(delayTime) {
    this.delayTime = delayTime;
    this.eventQueue = [];
    this.outputTimer = setInterval(() => {
      this.processDelayedEvents();
    }, 1000);
  }
  
  schedule(event, delay) {
    const outputTime = Date.now() + delay;
    this.eventQueue.push({
      event: event,
      outputTime: outputTime
    });
  }
  
  processDelayedEvents() {
    const now = Date.now();
    const readyEvents = this.eventQueue.filter(item => item.outputTime <= now);
    
    readyEvents.forEach(item => {
      this.outputEvent(item.event);
    });
    
    // 출력된 이벤트 제거
    this.eventQueue = this.eventQueue.filter(item => item.outputTime > now);
  }
  
  outputEvent(event) {
    // 지연 출력 (시청자용 스트림에 전송)
    this.broadcastToViewers(event);
  }
  
  flush() {
    // 모든 대기 중인 이벤트 즉시 출력
    this.eventQueue.forEach(item => {
      this.outputEvent(item.event);
    });
    this.eventQueue = [];
  }
}
```

---

## 📊 분석 및 통계

### 게임 통계 시스템

```javascript
class PokerStatistics {
  constructor() {
    this.handHistory = [];
    this.playerStats = new Map();
    this.sessionStats = {
      handsPlayed: 0,
      totalPot: 0,
      avgPotSize: 0,
      sessionDuration: 0
    };
  }
  
  // 핸드 종료 시 통계 업데이트
  recordHand(handData) {
    this.handHistory.push(handData);
    this.updatePlayerStats(handData);
    this.updateSessionStats(handData);
  }
  
  updatePlayerStats(handData) {
    handData.players.forEach(player => {
      if (!this.playerStats.has(player.id)) {
        this.playerStats.set(player.id, {
          name: player.name,
          handsPlayed: 0,
          vpip: 0,
          pfr: 0,
          threeBet: 0,
          cbet: 0,
          totalWinnings: 0,
          bigBlindsPer100: 0,
          positions: {}
        });
      }
      
      const stats = this.playerStats.get(player.id);
      stats.handsPlayed++;
      
      // VPIP 계산 (자발적으로 팟에 돈을 넣은 비율)
      if (player.actions.some(action => 
        ['call', 'raise', 'bet'].includes(action.type) && 
        action.street === 'preflop'
      )) {
        stats.vpip = this.calculatePercentage(stats.vpipCount + 1, stats.handsPlayed);
      }
      
      // PFR 계산 (프리플랍 레이즈 비율)
      if (player.actions.some(action => 
        action.type === 'raise' && action.street === 'preflop'
      )) {
        stats.pfr = this.calculatePercentage(stats.pfrCount + 1, stats.handsPlayed);
      }
      
      // 승부 결과 기록
      stats.totalWinnings += player.winnings || 0;
    });
  }
  
  calculatePercentage(count, total) {
    return total > 0 ? Math.round((count / total) * 100 * 10) / 10 : 0;
  }
  
  // 실시간 통계 표시용 데이터 생성
  getDisplayStats() {
    const stats = [];
    
    for (const [playerId, playerStats] of this.playerStats) {
      stats.push({
        name: playerStats.name,
        hands: playerStats.handsPlayed,
        vpip: playerStats.vpip,
        pfr: playerStats.pfr,
        winnings: playerStats.totalWinnings,
        bb100: this.calculateBB100(playerStats)
      });
    }
    
    return stats.sort((a, b) => b.winnings - a.winnings);
  }
  
  calculateBB100(playerStats) {
    if (playerStats.handsPlayed < 10) return 0;
    
    const bigBlind = this.getCurrentBigBlind();
    const bb100 = (playerStats.totalWinnings / (playerStats.handsPlayed / 100)) / bigBlind;
    return Math.round(bb100 * 10) / 10;
  }
  
  // 세션 리포트 생성
  generateSessionReport() {
    return {
      summary: {
        handsPlayed: this.sessionStats.handsPlayed,
        duration: this.formatDuration(this.sessionStats.sessionDuration),
        totalAction: this.sessionStats.totalPot,
        avgPotSize: Math.round(this.sessionStats.avgPotSize)
      },
      playerStats: this.getDisplayStats(),
      biggestPots: this.getBiggestPots(5),
      mostActivePlayer: this.getMostActivePlayer(),
      sessionHighlights: this.generateHighlights()
    };
  }
  
  getBiggestPots(count) {
    return this.handHistory
      .sort((a, b) => b.totalPot - a.totalPot)
      .slice(0, count)
      .map(hand => ({
        handNumber: hand.handNumber,
        potSize: hand.totalPot,
        winner: hand.winner,
        showdown: hand.showdown
      }));
  }
  
  generateHighlights() {
    const highlights = [];
    
    // 가장 큰 팟
    const biggestPot = Math.max(...this.handHistory.map(h => h.totalPot));
    highlights.push(`Biggest pot: $${biggestPot}`);
    
    // 가장 많이 이긴 플레이어
    const biggestWinner = this.getDisplayStats()[0];
    if (biggestWinner) {
      highlights.push(`Biggest winner: ${biggestWinner.name} (+$${biggestWinner.winnings})`);
    }
    
    // 올인 상황 횟수
    const allInHands = this.handHistory.filter(h => h.hasAllIn).length;
    if (allInHands > 0) {
      highlights.push(`All-in situations: ${allInHands}`);
    }
    
    return highlights;
  }
}
```

---

## 🚀 결론

### 우리의 혁신적 접근법 요약

#### 1. 기존 PokerGFX의 핵심 기능 보존
- ✅ 실시간 카드 추적 및 표시
- ✅ 전문적인 그래픽 오버레이  
- ✅ 다중 비디오 소스 지원
- ✅ 보안 딜레이 시스템
- ✅ 상세한 게임 통계
- ✅ 스트리밍 및 녹화 기능

#### 2. 혁신적 개선사항
- 🚀 **RFID 의존성 제거**: 웹 기반 카드 입력 시스템
- 🚀 **접근성 향상**: 브라우저에서 바로 실행, 별도 설치 불필요
- 🚀 **모바일 지원**: 터치 친화적 Action Tracker
- 🚀 **클라우드 연동**: 실시간 협업 및 백업
- 🚀 **비용 효율성**: 무료 오픈소스 기반, 전용 하드웨어 불필요

#### 3. 실용적 구현 방안
- **웹 기술 스택**: Node.js + React + WebSocket으로 크로스 플랫폼 지원
- **OBS 연동**: WebSocket API를 통한 완벽한 방송 도구 통합  
- **단계별 개발**: 핵심 기능부터 고급 기능까지 점진적 구현
- **커뮤니티 기반**: 오픈소스로 개발하여 사용자 기여 활성화

### 개발 우선순위

#### Phase 1: 핵심 기능 (3개월)
1. 웹 기반 게임 상태 관리 시스템
2. 카드 입력 인터페이스 (수동)
3. Action Tracker (모바일 웹)
4. 기본 그래픽 오버레이
5. OBS 연동

#### Phase 2: 고급 기능 (3개월)  
1. 보안 딜레이 시스템
2. 통계 및 분석 시스템
3. 다중 테이블 지원
4. 커스텀 테마 시스템
5. 클라우드 기능

#### Phase 3: 확장 기능 (3개월)
1. 컴퓨터 비전 카드 인식 (보조)
2. 토너먼트 모드
3. 포스트 프로덕션 도구
4. API 및 플러그인 시스템
5. 모바일 앱

이 설계 기획서를 바탕으로 기존 PokerGFX의 장점은 모두 유지하면서, 접근성과 사용성을 대폭 개선한 현대적인 포커 방송 솔루션을 개발할 수 있습니다.

---

*본 기획서는 실제 PokerGFX 매뉴얼 분석을 바탕으로 작성되었으며, 기존 사용자들의 워크플로우를 최대한 보존하면서도 더 나은 사용자 경험을 제공하는 것을 목표로 합니다.*