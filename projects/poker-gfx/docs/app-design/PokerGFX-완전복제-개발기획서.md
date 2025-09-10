# PokerGFX 완전 복제 개발 기획서

## 📚 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [시스템 아키텍처](#2-시스템-아키텍처)
3. [핵심 컴포넌트 상세 설계](#3-핵심-컴포넌트-상세-설계)
4. [데이터 플로우 및 논리 구조](#4-데이터-플로우-및-논리-구조)
5. [사용자 워크플로우](#5-사용자-워크플로우)
6. [기술 구현 명세](#6-기술-구현-명세)
7. [개발 로드맵](#7-개발-로드맵)

---

## 1. 프로젝트 개요

### 🎯 프로젝트 목표

**기존 PokerGFX의 모든 기능을 완전히 복제**하여 동일한 수준의 전문적인 포커 방송 솔루션을 개발합니다. 이는 혁신이나 개선이 아닌, 검증된 시스템의 **정확한 복제**를 목표로 합니다.

### 📋 PokerGFX란 무엇인가?

PokerGFX는 전문적인 포커 방송을 위한 완전 통합 솔루션입니다:

```
┌─────────────────────────────────────────────────────────┐
│                  PokerGFX 시스템                        │
├─────────────────────────────────────────────────────────┤
│  RFID Reader → Cards Detection → Graphics Engine        │
│       ↓              ↓               ↓                  │
│  USB 3.0      Real-time Data    Video Overlay           │
│                      ↓               ↓                  │
│              Action Tracker    Streaming Output         │
└─────────────────────────────────────────────────────────┘
```

### 🏗️ 시스템 구성 요소

#### 1. 하드웨어 컴포넌트
- **RFID Reader**: USB 3.0 연결, 전용 전원, WiFi 옵션
- **RFID 카드**: 52장 전용 덱, 개별 등록 필요
- **비디오 캡처**: 최대 16개 소스 (라이선스별 차이)
- **고성능 PC**: Windows 전용, GPU 가속 필수

#### 2. 소프트웨어 컴포넌트
- **PokerGFX Server**: 메인 애플리케이션 (C++/C#)
- **Action Tracker**: 별도 Windows 앱
- **Studio**: 포스트 프로덕션 (Pro 이상)
- **MultiGFX**: 다중 출력 동기화

### 📊 라이선스별 기능 구분

| 기능 | Basic | Pro | Enterprise |
|------|-------|-----|------------|
| 비디오 소스 | 4개 | 8개 | 16개 |
| RFID 지원 | ✓ | ✓ | ✓ |
| Action Tracker | ✓ | ✓ | ✓ |
| Studio | ✗ | ✓ | ✓ |
| 플레이어 사진 | ✗ | ✓ | ✓ |
| 지연시간 | 30분 | 60분 | 60분 |
| API 접근 | ✗ | ✗ | ✓ |
| NDI 출력 | ✗ | ✗ | ✓ |

---

## 2. 시스템 아키텍처

### 🏛️ 전체 시스템 구조

```
┌─────────────────────────────────────────────────────────────┐
│                     물리적 하드웨어 계층                      │
├─────────────────────────────────────────────────────────────┤
│  RFID Reader  │  Video Capture  │  Audio Input  │  Network   │
│   (USB 3.0)   │   (HDMI/SDI)    │   (Line/Mic)  │  (Gigabit) │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     운영체제 계층                            │
├─────────────────────────────────────────────────────────────┤
│           Windows 10/11 (64-bit)                           │
│       DirectShow • DirectX • WinAPI                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   PokerGFX Server                           │
├─────────────────────────────────────────────────────────────┤
│  RFID Manager  │  Video Engine  │  Graphics Engine          │
│  Game Logic    │  Stream Output │  Network Server           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      외부 연결                              │
├─────────────────────────────────────────────────────────────┤
│  Action Tracker │  OBS Studio   │  Streaming Platforms      │
│  (네트워크)      │  (WebSocket)   │  (RTMP/WebRTC)           │
└─────────────────────────────────────────────────────────────┘
```

### 🔧 핵심 아키텍처 원칙

#### 1. **Windows 네이티브 아키텍처**
- C++/C# 혼합 개발
- DirectX 11/12 GPU 가속
- WinAPI 시스템 통합
- .NET Framework 4.8+

#### 2. **실시간 처리 파이프라인**
```
RFID Data → Game State → Graphics Render → Video Composite → Stream Output
    ↓           ↓             ↓              ↓              ↓
  100ms      16ms         16ms          16ms          33ms
```

#### 3. **모듈형 설계**
- 각 기능을 독립적 DLL로 분리
- 플러그인 아키텍처 지원
- 라이선스별 모듈 활성화
- 런타임 기능 확장

### 🗃️ 데이터베이스 구조

```sql
-- 게임 상태 테이블
CREATE TABLE GameState (
    id INTEGER PRIMARY KEY,
    table_name VARCHAR(100),
    game_type VARCHAR(50),
    small_blind DECIMAL(10,2),
    big_blind DECIMAL(10,2),
    created_at TIMESTAMP
);

-- 플레이어 정보
CREATE TABLE Players (
    id INTEGER PRIMARY KEY,
    game_id INTEGER,
    seat_number INTEGER,
    player_name VARCHAR(100),
    chip_count DECIMAL(12,2),
    is_active BOOLEAN,
    photo_path VARCHAR(255),
    country_code VARCHAR(3)
);

-- 카드 데이터
CREATE TABLE Cards (
    id INTEGER PRIMARY KEY,
    rfid_tag VARCHAR(50) UNIQUE,
    rank VARCHAR(2),
    suit VARCHAR(10),
    deck_id INTEGER,
    registered_at TIMESTAMP
);

-- 핸드 히스토리
CREATE TABLE Hands (
    id INTEGER PRIMARY KEY,
    game_id INTEGER,
    hand_number INTEGER,
    dealer_position INTEGER,
    pot_size DECIMAL(12,2),
    board_cards VARCHAR(50),
    started_at TIMESTAMP,
    ended_at TIMESTAMP
);
```

---

## 3. 핵심 컴포넌트 상세 설계

### 🎯 컴포넌트 1: RFID 관리자

#### 📝 역할과 책임
RFID Reader와의 통신을 관리하고 카드 데이터를 실시간으로 처리합니다.

#### 🔧 기술 구현

```cpp
// RFIDManager.h
class RFIDManager {
public:
    struct CardData {
        std::string rfidTag;
        std::string rank;
        std::string suit;
        int position;
        double timestamp;
        double signalStrength;
    };

    enum ConnectionStatus {
        DISCONNECTED,
        CONNECTING,
        CONNECTED,
        ERROR
    };

private:
    // USB 연결 관리
    HANDLE m_deviceHandle;
    std::thread m_readerThread;
    std::queue<CardData> m_cardQueue;
    std::mutex m_queueMutex;
    
    // 캘리브레이션 데이터
    std::vector<CalibrationPoint> m_playerPositions;
    std::vector<CalibrationPoint> m_boardPositions;
    
    // 카드 등록 데이터베이스
    std::unordered_map<std::string, CardInfo> m_registeredCards;

public:
    // 연결 관리
    bool Connect();
    void Disconnect();
    ConnectionStatus GetStatus();
    
    // 캘리브레이션
    bool StartCalibration();
    void AddCalibrationPoint(int seatNumber, double x, double y);
    bool SaveCalibration();
    bool LoadCalibration();
    
    // 카드 등록
    bool RegisterDeck(const std::vector<CardInfo>& cards);
    bool CheckDeck();
    
    // 실시간 감지
    void StartReading();
    void StopReading();
    std::vector<CardData> GetDetectedCards();
    
    // 이벤트 콜백
    void SetCardDetectedCallback(std::function<void(CardData)> callback);
    void SetConnectionStatusCallback(std::function<void(ConnectionStatus)> callback);

private:
    void ReaderThreadFunction();
    bool ProcessRFIDData(const uint8_t* data, size_t length);
    CardData ParseCardData(const uint8_t* data);
    bool ValidateCardData(const CardData& card);
};
```

#### 📊 상태 관리 다이어그램

```
초기화 → USB 연결 → 펌웨어 확인 → 캘리브레이션 로드 → 카드 DB 로드 → 대기
   ↓         ↓          ↓             ↓              ↓           ↓
오류시    시간초과     버전불일치      실패시          실패시       감지시작
재시도    재연결      업데이트요청    캘리브레이션     덱등록      카드이벤트
```

### 🎯 컴포넌트 2: 게임 로직 엔진

#### 📝 역할과 책임
포커 게임의 모든 룰과 상태를 관리하고, 액션 처리 및 결과 계산을 담당합니다.

#### 🔧 기술 구현

```cpp
// GameEngine.h
class GameEngine {
public:
    enum GameType {
        HOLDEM_NO_LIMIT,
        HOLDEM_LIMIT,
        HOLDEM_POT_LIMIT,
        OMAHA_POT_LIMIT,
        OMAHA_HI_LO,
        STUD_7_CARD,
        RAZZ,
        MIXED_GAMES
    };

    enum BettingRound {
        PREFLOP,
        FLOP,
        TURN,
        RIVER,
        SHOWDOWN
    };

    enum PlayerAction {
        FOLD,
        CHECK,
        CALL,
        RAISE,
        ALL_IN,
        SIT_OUT
    };

    struct Player {
        int seatNumber;
        std::string name;
        double chipStack;
        std::vector<Card> holeCards;
        PlayerAction lastAction;
        double currentBet;
        bool isActive;
        bool hasActed;
        std::string photoPath;
        std::string countryCode;
    };

    struct HandData {
        int handNumber;
        int dealerPosition;
        std::vector<Player> players;
        std::vector<Card> boardCards;
        std::vector<Pot> pots;
        BettingRound currentRound;
        double totalPot;
        Player* activePlayer;
        std::vector<ActionHistory> actions;
    };

private:
    GameType m_gameType;
    HandData m_currentHand;
    std::vector<Player> m_players;
    std::mt19937 m_randomEngine;
    
    // 베팅 구조
    double m_smallBlind;
    double m_bigBlind;
    double m_ante;
    
    // 게임 설정
    bool m_runItTwice;
    bool m_allowStraddle;
    int m_maxPlayers;

public:
    // 게임 설정
    void SetGameType(GameType type);
    void SetBlinds(double small, double big, double ante = 0);
    void AddPlayer(const Player& player);
    void RemovePlayer(int seatNumber);
    
    // 핸드 관리
    bool StartNewHand();
    void DealCards();
    void SetPlayerCards(int seatNumber, const std::vector<Card>& cards);
    void SetBoardCards(const std::vector<Card>& cards);
    
    // 액션 처리
    bool ProcessAction(int seatNumber, PlayerAction action, double amount = 0);
    bool CanPerformAction(int seatNumber, PlayerAction action);
    double GetMinRaise();
    double GetCallAmount(int seatNumber);
    
    // 게임 상태
    BettingRound GetCurrentRound();
    Player* GetActivePlayer();
    std::vector<Pot> CalculatePots();
    bool IsHandComplete();
    
    // 특수 상황
    void HandleAllIn(int seatNumber);
    void CreateSidePot();
    void HandleRunItTwice();
    void ShowCards(int seatNumber);
    
    // 이벤트
    void SetActionCallback(std::function<void(ActionEvent)> callback);
    void SetHandCompleteCallback(std::function<void(HandResult)> callback);

private:
    void AdvanceBettingRound();
    void DetermineWinners();
    void AwardPots();
    bool IsBettingRoundComplete();
    void MoveToNextPlayer();
    void ValidateGameState();
};
```

### 🎯 컴포넌트 3: 그래픽 렌더링 엔진

#### 📝 역할과 책임
실시간으로 게임 정보를 시각화하고 방송용 오버레이를 생성합니다.

#### 🔧 기술 구현

```cpp
// GraphicsEngine.h
class GraphicsEngine {
public:
    struct RenderSettings {
        int outputWidth;
        int outputHeight;
        int framerate;
        bool enableAlpha;
        bool enable4K;
        std::string skinName;
    };

    struct PlayerGraphics {
        Vector2 position;
        Vector2 size;
        std::string name;
        double chipCount;
        std::vector<Card> cards;
        PlayerAction lastAction;
        double actionAmount;
        bool isActive;
    };

    struct GraphicsContext {
        ID3D11Device* device;
        ID3D11DeviceContext* context;
        IDXGISwapChain* swapChain;
        ID3D11RenderTargetView* renderTarget;
        ID3D11Texture2D* alphaTexture;
    };

private:
    GraphicsContext m_d3dContext;
    RenderSettings m_settings;
    
    // 렌더링 리소스
    std::unordered_map<std::string, ID3D11Texture2D*> m_textures;
    std::unordered_map<std::string, ID3D11ShaderResourceView*> m_shaderViews;
    std::vector<std::unique_ptr<Sprite>> m_sprites;
    
    // 애니메이션 시스템
    AnimationManager m_animationManager;
    ParticleSystem m_particles;
    
    // 폰트 및 텍스트
    std::unique_ptr<DirectWrite> m_textRenderer;
    std::unordered_map<std::string, FontData> m_fonts;

public:
    // 초기화
    bool Initialize(HWND hwnd, const RenderSettings& settings);
    void Shutdown();
    
    // 렌더링 제어
    void BeginFrame();
    void EndFrame();
    void Present();
    void Clear(const Color& color);
    
    // 그래픽 요소 렌더링
    void RenderPlayers(const std::vector<PlayerGraphics>& players);
    void RenderBoard(const std::vector<Card>& cards, BettingRound round);
    void RenderPot(double amount, const std::vector<double>& sidePots);
    void RenderActions(const std::vector<ActionIndicator>& actions);
    void RenderStatistics(const PlayerStats& stats);
    
    // 스킨 시스템
    bool LoadSkin(const std::string& skinName);
    void SetSkinParameter(const std::string& key, const Variant& value);
    
    // 애니메이션
    void StartCardAnimation(const Card& card, AnimationType type);
    void StartPotAnimation(double fromAmount, double toAmount);
    void StartPlayerElimination(int seatNumber);
    
    // 출력 제어
    void SetOutputFormat(OutputFormat format);
    void EnableAlphaChannel(bool enable);
    ID3D11Texture2D* GetOutputTexture();

private:
    void CreateDeviceResources();
    void CreateRenderTarget();
    void LoadShaders();
    void LoadTextures();
    void SetupBlendStates();
};
```

### 🎯 컴포넌트 4: Action Tracker 클라이언트

#### 📝 역할과 책임
별도 Windows 애플리케이션으로 베팅 액션을 입력하고 메인 서버와 통신합니다.

#### 🔧 기술 구현

```cpp
// ActionTracker.h (Windows Forms 애플리케이션)
public ref class ActionTrackerForm : public System::Windows::Forms::Form {
private:
    // 네트워크 통신
    System::Net::Sockets::TcpClient^ tcpClient;
    System::IO::NetworkStream^ networkStream;
    System::Threading::Thread^ messageListener;
    
    // UI 컨트롤
    array<System::Windows::Forms::Button^>^ seatButtons;
    System::Windows::Forms::Panel^ actionPanel;
    System::Windows::Forms::Label^ potLabel;
    System::Windows::Forms::Label^ boardLabel;
    System::Windows::Forms::NumericUpDown^ betAmount;
    
    // 게임 상태
    GameState currentGameState;
    int activeSeat;
    bool isConnected;

public:
    ActionTrackerForm() {
        InitializeComponent();
        SetupNetworking();
        SetupEventHandlers();
    }

    // 연결 관리
    void ConnectToServer(String^ ipAddress, int port);
    void Disconnect();
    void OnConnectionLost();
    
    // 게임 상태 업데이트
    void UpdateGameState(GameState^ state);
    void UpdatePlayerInfo(int seat, PlayerInfo^ info);
    void UpdateBoard(array<Card^>^ cards);
    void UpdatePot(double amount);
    
    // 액션 처리
    void ProcessPlayerAction(int seat, PlayerAction action, double amount);
    void SendActionToServer(ActionData^ action);
    void ValidateAction(PlayerAction action, double amount);
    
    // UI 이벤트 핸들러
    void OnSeatButton_Click(Object^ sender, EventArgs^ e);
    void OnActionButton_Click(Object^ sender, EventArgs^ e);
    void OnBetAmount_ValueChanged(Object^ sender, EventArgs^ e);

private:
    void InitializeComponent();
    void SetupSeatLayout();
    void SetupActionButtons();
    void UpdateSeatDisplay(int seat);
    void ShowActionButtons(int seat);
    void HideActionButtons();
    
    // 네트워크 메시지 처리
    void MessageListenerThread();
    void ProcessIncomingMessage(String^ message);
    void SendMessage(String^ message);
    
    // 유효성 검사
    bool CanPlayerAct(int seat);
    bool IsValidRaise(double amount);
    double GetMinRaise();
    double GetMaxRaise(int seat);
};
```

---

## 4. 데이터 플로우 및 논리 구조

### 🔄 전체 데이터 플로우

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ RFID Reader │───▶│ Card Parser │───▶│ Game Engine │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Action Tracker│◀──│Network Layer│◀───│Game State   │
└─────────────┘    └─────────────┘    │Manager      │
                                      └─────────────┘
                                              │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Stream Output│◀───│Graphics     │◀───│Render       │
└─────────────┘    │Engine       │    │Queue        │
                   └─────────────┘    └─────────────┘
```

### 📊 상세 프로세스 흐름

#### 1. **카드 감지 프로세스**

```
RFID 신호 수신
     ↓
신호 강도 확인 (>-60dBm)
     ↓
RFID 태그 파싱
     ↓
등록된 카드 DB 조회
     ↓
위치 정보 매핑 (캘리브레이션 데이터)
     ↓
중복 감지 필터링 (200ms 윈도우)
     ↓
게임 엔진으로 전송
```

#### 2. **게임 상태 업데이트 프로세스**

```cpp
// 게임 상태 업데이트 로직
void GameEngine::ProcessCardDetection(const CardData& cardData) {
    // 1. 카드 유효성 검증
    if (!ValidateCard(cardData)) {
        LogError("Invalid card detected: " + cardData.rfidTag);
        return;
    }
    
    // 2. 게임 단계별 처리
    switch (m_currentHand.currentRound) {
        case BettingRound::PREFLOP:
            ProcessHoleCard(cardData);
            break;
        case BettingRound::FLOP:
        case BettingRound::TURN:
        case BettingRound::RIVER:
            ProcessBoardCard(cardData);
            break;
        default:
            // 핸드 완료 후 감지된 카드는 무시
            break;
    }
    
    // 3. UI 업데이트 이벤트 발생
    NotifyCardUpdate(cardData);
    
    // 4. 그래픽 렌더링 큐에 추가
    m_renderQueue.push(CreateCardRenderEvent(cardData));
}
```

#### 3. **액션 처리 프로세스**

```cpp
// Action Tracker에서 서버로 액션 전송
void ActionTrackerForm::ProcessPlayerAction(int seatNumber, PlayerAction action, double amount) {
    // 1. 클라이언트 사이드 유효성 검사
    if (!ValidateAction(seatNumber, action, amount)) {
        ShowError("Invalid action");
        return;
    }
    
    // 2. 액션 데이터 구성
    ActionMessage message;
    message.playerId = seatNumber;
    message.action = action;
    message.amount = amount;
    message.timestamp = GetCurrentTimestamp();
    message.handNumber = currentGameState.handNumber;
    
    // 3. 서버로 전송
    SendActionToServer(message);
    
    // 4. UI 임시 업데이트 (서버 응답 대기)
    UpdatePlayerDisplay(seatNumber, action, amount);
}

// 서버에서 액션 처리
bool GameEngine::ProcessAction(int seatNumber, PlayerAction action, double amount) {
    // 1. 서버 사이드 검증
    Player* player = GetPlayer(seatNumber);
    if (!player || !CanPlayerAct(player)) {
        return false;
    }
    
    // 2. 액션별 처리
    switch (action) {
        case PlayerAction::FOLD:
            player->isActive = false;
            player->holeCards.clear(); // 보안상 카드 숨김
            break;
            
        case PlayerAction::CALL:
            amount = GetCallAmount(seatNumber);
            player->chipStack -= amount;
            player->currentBet += amount;
            m_currentHand.totalPot += amount;
            break;
            
        case PlayerAction::RAISE:
            if (amount < GetMinRaise()) return false;
            player->chipStack -= amount;
            player->currentBet = amount;
            m_currentHand.totalPot += amount;
            m_currentBet = amount;
            break;
            
        case PlayerAction::ALL_IN:
            amount = player->chipStack;
            player->chipStack = 0;
            player->currentBet += amount;
            m_currentHand.totalPot += amount;
            HandleAllIn(seatNumber);
            break;
    }
    
    // 3. 게임 상태 업데이트
    player->lastAction = action;
    player->hasActed = true;
    
    // 4. 다음 플레이어로 액션 이동
    AdvanceAction();
    
    // 5. 베팅 라운드 완료 체크
    if (IsBettingRoundComplete()) {
        AdvanceBettingRound();
    }
    
    // 6. 모든 클라이언트에 업데이트 브로드캐스트
    BroadcastGameState();
    
    return true;
}
```

### 🎨 그래픽 렌더링 파이프라인

```
게임 상태 변경
     ↓
렌더 이벤트 생성
     ↓
렌더 큐에 추가
     ↓
프레임 시작 (60 FPS)
     ↓
이벤트 처리 (배치)
     ↓
DirectX 렌더링
     ↓
포스트 프로세싱
     ↓
출력 버퍼로 복사
     ↓
스트림/녹화 출력
```

---

## 5. 사용자 워크플로우

### 👤 사용자별 워크플로우 상세 가이드

#### 🔧 관리자 (방송 운영자) 워크플로우

**1단계: 시스템 초기 설정**
```
시작 → PokerGFX Server 실행 → 라이선스 확인 → RFID Reader 연결 확인
  ↓
USB 연결 상태 체크 → 전원 공급 확인 → 드라이버 설치 상태 점검
  ↓
연결 성공 시: 녹색 표시등 → 실패 시: 빨간색 + 오류 메시지
```

**2단계: 테이블 캘리브레이션**
```
Settings → RFID → Calibrate Table
  ↓
캘리브레이션 마법사 시작
  ↓
각 좌석별 카드 배치 (1번 좌석부터 시계방향)
  ↓
"Detect" 버튼 클릭 → RFID 신호 강도 확인 → 위치 저장
  ↓
보드 위치 설정 (Flop, Turn, River 각각)
  ↓
캘리브레이션 완료 → 데이터 자동 저장
```

**3단계: 카드 덱 등록**
```
새 덱 준비 (52장, 조커 제거)
  ↓
Settings → RFID → Register Deck
  ↓
덱 이름 입력 (예: "Red Deck #1")
  ↓
카드 하나씩 RFID Reader에 올리기
  ↓
시스템이 자동으로 Rank + Suit 인식
  ↓
진행 상황 표시 (1/52, 2/52, ...)
  ↓
52장 완료 → 중복/누락 카드 체크 → 저장
```

**4단계: 비디오 소스 설정**
```
Sources 탭 클릭
  ↓
Add Source → USB Camera/Capture Card/NDI 선택
  ↓
각 소스별 설정:
- Resolution: 1920x1080 or 3840x2160
- Frame Rate: 30fps or 60fps
- Audio: Enable/Disable
  ↓
프리뷰 확인 → 모든 카메라 테스트
```

**5단계: 스트리밍 설정**
```
Outputs 탭 클릭
  ↓
Streaming → Platform 선택 (Twitch/YouTube/Custom)
  ↓
Stream Key 입력
  ↓
비트레이트 설정 (6000 kbps 권장)
  ↓
Test Connection → 연결 성공 확인
```

#### 🎮 딜러 워크플로우

**게임 시작 전 준비**
```
덱 셔플 → Action Tracker "CHECK" 버튼 → 52장 전체 확인
  ↓
누락/중복 카드 있으면: 카드 교체 → 재확인
  ↓
모든 카드 OK → "New Hand" 버튼 클릭
```

**핸드 진행**
```
카드 딜링 → RFID 자동 감지 → 화면에 카드 표시 확인
  ↓
Action Tracker에서 플레이어 액션 입력
  ↓
Flop/Turn/River 딜링 → 보드 카드 자동 인식
  ↓
쇼다운 시 카드 공개 → 승자 자동 계산
```

#### 📱 Action Tracker 운영자 워크플로우

**연결 설정**
```
Action Tracker 앱 실행
  ↓
Server IP 입력 (예: 192.168.1.100)
  ↓
Connect 버튼 클릭 → 연결 상태 확인 (녹색 = 연결됨)
```

**게임 중 액션 입력**
```
현재 액션할 플레이어 확인 (강조 표시)
  ↓
플레이어 액션 선택:
- FOLD: 즉시 처리
- CHECK: 현재 베팅이 0일 때만
- CALL: 콜 금액 자동 계산
- RAISE: 금액 입력 필요
- ALL-IN: 전체 스택 자동 계산
  ↓
확인 버튼 클릭 → 서버로 전송 → 다음 플레이어로 이동
```

**특수 상황 처리**
```
Run It Twice:
메뉴 → Run It Twice → 첫 번째 리버 딜 → "Board 2" 선택 → 두 번째 리버 딜

Straddle:
해당 플레이어 선택 → 메뉴 → Straddle → 금액 입력 → 액션 순서 자동 조정

Chop:
관련 플레이어들 선택 → 메뉴 → Chop Pot → 팟 자동 분할
```

---

## 6. 기술 구현 명세

### 💻 개발 환경 및 도구

#### 핵심 기술 스택
```yaml
언어:
  - C++17 (메인 서버)
  - C# .NET 4.8 (Action Tracker)
  - DirectX 11/12 (그래픽)
  - SQL Server Express (데이터베이스)

개발도구:
  - Visual Studio 2022 Professional
  - Windows SDK 10.0.22000
  - DirectX SDK
  - Git for version control

라이브러리:
  - Boost 1.80+ (C++ 유틸리티)
  - JSON for Modern C++ (데이터 직렬화)
  - OpenCV 4.6+ (이미지 처리)
  - FFmpeg 5.0+ (비디오 처리)
  - WebSocket++ (네트워크)
```

#### 프로젝트 구조
```
PokerGFX/
├── Server/                 # 메인 서버 (C++)
│   ├── Core/              # 핵심 엔진
│   ├── RFID/              # RFID 관리
│   ├── Graphics/          # 렌더링 엔진
│   ├── Network/           # 네트워크 통신
│   └── Plugins/           # 확장 모듈
├── ActionTracker/         # Action Tracker (C#)
│   ├── UI/                # Windows Forms
│   ├── Network/           # TCP 클라이언트
│   └── Game/              # 게임 로직
├── Studio/                # 포스트 프로덕션 (C++)
│   ├── Timeline/          # 타임라인 에디터
│   ├── Renderer/          # 비디오 렌더러
│   └── Effects/           # 특수 효과
├── Common/                # 공통 라이브러리
│   ├── Protocol/          # 통신 프로토콜
│   ├── Utils/             # 유틸리티
│   └── Data/              # 데이터 구조
└── Resources/             # 리소스 파일
    ├── Skins/             # 그래픽 스킨
    ├── Fonts/             # 폰트 파일
    └── Images/            # 이미지 에셋
```

### 🔌 RFID 시스템 구현

#### USB 통신 프로토콜
```cpp
// RFID 통신 프로토콜 구현
class RFIDProtocol {
private:
    static const uint8_t PACKET_HEADER = 0xAA;
    static const uint8_t PACKET_FOOTER = 0x55;
    
    enum CommandType {
        CMD_GET_VERSION = 0x01,
        CMD_START_READING = 0x02,
        CMD_STOP_READING = 0x03,
        CMD_CALIBRATE = 0x04,
        CMD_GET_STATUS = 0x05
    };
    
    struct PacketHeader {
        uint8_t header;
        uint8_t command;
        uint16_t length;
        uint32_t timestamp;
    };
    
    struct CardDataPacket {
        PacketHeader header;
        char rfidTag[16];
        float positionX;
        float positionY;
        int8_t signalStrength;
        uint8_t checksum;
        uint8_t footer;
    };

public:
    bool SendCommand(CommandType cmd, const void* data = nullptr, size_t dataSize = 0);
    bool ReceiveData(CardDataPacket& packet);
    bool ValidatePacket(const CardDataPacket& packet);
    uint8_t CalculateChecksum(const void* data, size_t size);
};

// USB 디바이스 연결 관리
class USBManager {
private:
    HANDLE m_deviceHandle;
    OVERLAPPED m_readOverlapped;
    OVERLAPPED m_writeOverlapped;
    
public:
    bool OpenDevice(const std::wstring& devicePath);
    void CloseDevice();
    bool WriteData(const void* data, size_t size);
    bool ReadData(void* buffer, size_t bufferSize, size_t& bytesRead);
    bool IsDeviceConnected();
    
private:
    std::wstring FindRFIDDevice();
    bool SetupOverlappedIO();
};
```

#### 캘리브레이션 시스템
```cpp
// 테이블 캘리브레이션 구현
class TableCalibration {
public:
    struct CalibrationPoint {
        int seatNumber;
        float x, y;          // 물리적 좌표
        float signalStrength; // 신호 강도
        bool isValid;
    };
    
    struct CalibrationData {
        std::vector<CalibrationPoint> playerSeats;
        std::vector<CalibrationPoint> boardPositions;
        CalibrationPoint dealerPosition;
        CalibrationPoint muckArea;
        float tableRadius;
        DateTime calibrationDate;
    };

private:
    CalibrationData m_calibration;
    RFIDManager* m_rfidManager;
    
public:
    bool StartCalibration();
    bool CalibratePosition(int seatNumber);
    bool SetBoardPositions();
    bool ValidateCalibration();
    bool SaveCalibration(const std::string& filename);
    bool LoadCalibration(const std::string& filename);
    
    // 실시간 위치 매핑
    int MapPositionToSeat(float x, float y);
    bool IsPositionOnBoard(float x, float y);
    
private:
    float CalculateDistance(const CalibrationPoint& p1, const CalibrationPoint& p2);
    bool IsValidSignalStrength(float strength);
    void OptimizePositions(); // 신호 강도 기반 위치 최적화
};
```

### 🎮 게임 엔진 상세 구현

#### 포커 룰 엔진
```cpp
// 포커 핸드 평가 시스템
class HandEvaluator {
public:
    enum HandRank {
        HIGH_CARD = 0,
        PAIR = 1,
        TWO_PAIR = 2,
        THREE_OF_KIND = 3,
        STRAIGHT = 4,
        FLUSH = 5,
        FULL_HOUSE = 6,
        FOUR_OF_KIND = 7,
        STRAIGHT_FLUSH = 8,
        ROYAL_FLUSH = 9
    };
    
    struct HandValue {
        HandRank rank;
        std::vector<int> kickers;
        int numericValue; // 비교용 숫자값
    };

public:
    HandValue EvaluateHand(const std::vector<Card>& cards);
    HandValue GetBestHand(const std::vector<Card>& holeCards, 
                         const std::vector<Card>& boardCards);
    int CompareHands(const HandValue& hand1, const HandValue& hand2);
    std::string GetHandDescription(const HandValue& hand);

private:
    bool IsStraight(const std::vector<Card>& cards);
    bool IsFlush(const std::vector<Card>& cards);
    std::vector<int> GetRankCounts(const std::vector<Card>& cards);
    int CalculateNumericValue(const HandValue& hand);
};

// 팟 계산 및 사이드팟 관리
class PotManager {
public:
    struct Pot {
        double amount;
        std::vector<int> eligiblePlayers;
        bool isMainPot;
        std::string description;
    };

private:
    std::vector<Pot> m_pots;
    double m_totalPot;
    
public:
    void AddBet(int playerId, double amount);
    void CreateSidePot(int allInPlayerId);
    std::vector<Pot> CalculatePots(const std::vector<Player>& players);
    void AwardPot(const Pot& pot, int winnerId);
    void SplitPot(const Pot& pot, const std::vector<int>& winnerIds);
    
private:
    void RecalculateAllPots();
    bool IsPlayerEligible(int playerId, const Pot& pot);
};
```

### 🎨 그래픽 시스템 상세 구현

#### DirectX 렌더링 파이프라인
```cpp
// DirectX 11 렌더링 시스템
class D3D11Renderer {
private:
    // DirectX 객체들
    ID3D11Device* m_device;
    ID3D11DeviceContext* m_context;
    IDXGISwapChain* m_swapChain;
    ID3D11RenderTargetView* m_renderTargetView;
    ID3D11DepthStencilView* m_depthStencilView;
    
    // 상수 버퍼
    ID3D11Buffer* m_constantBuffer;
    ID3D11Buffer* m_vertexBuffer;
    ID3D11Buffer* m_indexBuffer;
    
    // 셰이더
    ID3D11VertexShader* m_vertexShader;
    ID3D11PixelShader* m_pixelShader;
    ID3D11InputLayout* m_inputLayout;
    
    // 블렌드 상태
    ID3D11BlendState* m_alphaBlendState;
    ID3D11BlendState* m_opaqueBlendState;

public:
    bool Initialize(HWND hwnd, int width, int height);
    void Shutdown();
    
    void BeginFrame();
    void EndFrame();
    void Present();
    
    // 기본 렌더링
    void RenderQuad(const Rect& destRect, ID3D11ShaderResourceView* texture);
    void RenderText(const std::string& text, const Vector2& position, 
                   const Color& color, const Font& font);
    
    // 카드 렌더링
    void RenderCard(const Card& card, const Transform& transform, bool faceUp);
    void RenderCardBack(const Transform& transform);
    
    // 효과 렌더링
    void RenderGlow(const Vector2& center, float radius, const Color& color);
    void RenderParticles(const std::vector<Particle>& particles);

private:
    bool CreateDeviceAndSwapChain(HWND hwnd, int width, int height);
    bool CreateRenderTargetView();
    bool LoadShaders();
    bool CreateBuffers();
    void SetupBlendStates();
};

// 스킨 시스템
class SkinManager {
public:
    struct SkinElement {
        std::string name;
        Vector2 position;
        Vector2 size;
        Color color;
        std::string texturePath;
        Font font;
        std::map<std::string, Variant> properties;
    };
    
    struct Skin {
        std::string name;
        std::string version;
        std::map<std::string, SkinElement> elements;
        std::map<std::string, Animation> animations;
    };

private:
    std::map<std::string, Skin> m_skins;
    Skin* m_currentSkin;
    
public:
    bool LoadSkin(const std::string& skinPath);
    void SetActiveSkin(const std::string& skinName);
    SkinElement* GetElement(const std::string& elementName);
    
    // 동적 스킨 수정
    void SetElementProperty(const std::string& element, 
                           const std::string& property, 
                           const Variant& value);
                           
private:
    bool ParseSkinXML(const std::string& xmlPath, Skin& skin);
    void LoadSkinTextures(const Skin& skin);
};
```

### 🌐 네트워크 통신 구현

#### TCP 서버 (메인 서버)
```cpp
// 비동기 TCP 서버
class TCPServer {
public:
    struct ClientInfo {
        SOCKET socket;
        std::string ipAddress;
        ClientType type; // ACTION_TRACKER, STUDIO, API_CLIENT
        DateTime connectTime;
        bool isAuthenticated;
    };

private:
    SOCKET m_listenSocket;
    std::vector<ClientInfo> m_clients;
    std::thread m_acceptThread;
    std::thread m_messageThread;
    std::mutex m_clientsMutex;
    bool m_isRunning;
    
public:
    bool StartServer(int port);
    void StopServer();
    void BroadcastMessage(const std::string& message, ClientType targetType = ALL);
    void SendToClient(int clientId, const std::string& message);
    
    // 이벤트 콜백
    void SetClientConnectedCallback(std::function<void(ClientInfo)> callback);
    void SetMessageReceivedCallback(std::function<void(int, std::string)> callback);

private:
    void AcceptClientThread();
    void MessageHandlerThread();
    void HandleClientMessage(int clientId, const std::string& message);
    bool AuthenticateClient(int clientId, const std::string& credentials);
    void DisconnectClient(int clientId);
};

// 메시지 프로토콜
class MessageProtocol {
public:
    enum MessageType {
        GAME_STATE_UPDATE,
        PLAYER_ACTION,
        CARD_DETECTED,
        HAND_COMPLETE,
        CLIENT_AUTHENTICATION,
        SYSTEM_STATUS
    };
    
    struct Message {
        MessageType type;
        uint32_t timestamp;
        uint32_t sequenceNumber;
        std::string data; // JSON 형식
    };

public:
    std::string SerializeMessage(const Message& msg);
    Message DeserializeMessage(const std::string& data);
    bool ValidateMessage(const Message& msg);

private:
    uint32_t m_sequenceCounter;
    std::string CreateChecksum(const std::string& data);
};
```

#### Action Tracker 클라이언트 (C#)
```csharp
// Action Tracker 네트워크 클라이언트
public class ActionTrackerClient {
    private TcpClient tcpClient;
    private NetworkStream stream;
    private Thread messageListener;
    private bool isConnected;
    
    // 이벤트
    public event EventHandler<GameStateEventArgs> GameStateUpdated;
    public event EventHandler<ConnectionEventArgs> ConnectionChanged;
    
    public async Task<bool> ConnectAsync(string serverIP, int port) {
        try {
            tcpClient = new TcpClient();
            await tcpClient.ConnectAsync(serverIP, port);
            stream = tcpClient.GetStream();
            
            // 인증 메시지 전송
            var authMessage = new AuthenticationMessage {
                ClientType = ClientType.ActionTracker,
                Version = Application.ProductVersion,
                MachineName = Environment.MachineName
            };
            
            await SendMessageAsync(authMessage);
            
            // 메시지 리스너 시작
            messageListener = new Thread(MessageListenerLoop);
            messageListener.Start();
            
            isConnected = true;
            ConnectionChanged?.Invoke(this, new ConnectionEventArgs(true));
            
            return true;
        }
        catch (Exception ex) {
            // 연결 실패 처리
            isConnected = false;
            ConnectionChanged?.Invoke(this, new ConnectionEventArgs(false, ex.Message));
            return false;
        }
    }
    
    public async Task SendActionAsync(PlayerAction action) {
        if (!isConnected) return;
        
        var actionMessage = new ActionMessage {
            PlayerId = action.PlayerId,
            ActionType = action.Type,
            Amount = action.Amount,
            Timestamp = DateTime.UtcNow
        };
        
        await SendMessageAsync(actionMessage);
    }
    
    private void MessageListenerLoop() {
        byte[] buffer = new byte[4096];
        
        while (isConnected) {
            try {
                int bytesRead = stream.Read(buffer, 0, buffer.Length);
                if (bytesRead > 0) {
                    string message = Encoding.UTF8.GetString(buffer, 0, bytesRead);
                    ProcessIncomingMessage(message);
                }
            }
            catch (Exception ex) {
                // 연결 끊김 처리
                HandleDisconnection(ex);
                break;
            }
        }
    }
    
    private void ProcessIncomingMessage(string messageData) {
        try {
            var message = JsonConvert.DeserializeObject<NetworkMessage>(messageData);
            
            switch (message.Type) {
                case MessageType.GameStateUpdate:
                    var gameState = JsonConvert.DeserializeObject<GameState>(message.Data);
                    GameStateUpdated?.Invoke(this, new GameStateEventArgs(gameState));
                    break;
                    
                case MessageType.PlayerAction:
                    // 다른 클라이언트의 액션 처리
                    break;
                    
                case MessageType.SystemStatus:
                    // 시스템 상태 업데이트
                    break;
            }
        }
        catch (Exception ex) {
            // 메시지 파싱 오류 처리
        }
    }
}
```

---

## 7. 개발 로드맵

### 📅 전체 개발 일정 (18개월)

#### Phase 1: 핵심 인프라 구축 (1-4개월)

**Month 1-2: 기반 시스템**
```yaml
주요작업:
  - Visual Studio 프로젝트 구조 설정
  - DirectX 11 렌더링 파이프라인 구현
  - 기본 Windows Forms UI 구성
  - SQLite 데이터베이스 스키마 설계
  - 로깅 및 디버깅 시스템 구축

완료기준:
  - 빈 창에 DirectX 렌더링 성공
  - 기본 네트워크 통신 구현
  - 프로젝트 빌드 자동화 완료
  - 코드 리뷰 프로세스 확립
```

**Month 3-4: RFID 시스템**
```yaml
주요작업:
  - USB 통신 드라이버 구현
  - RFID 데이터 파싱 로직
  - 캘리브레이션 UI 및 로직
  - 카드 등록 시스템
  - 실시간 카드 감지 테스트

완료기준:
  - 52장 카드 등록 성공
  - 테이블 캘리브레이션 완료
  - 실시간 카드 감지 95% 정확도
  - 다중 카드 동시 감지 지원
```

#### Phase 2: 게임 로직 구현 (5-8개월)

**Month 5-6: 포커 엔진**
```yaml
주요작업:
  - Hold'em 게임 룰 구현
  - 핸드 평가 시스템
  - 베팅 라운드 관리
  - 팟 계산 로직
  - 플레이어 상태 관리

완료기준:
  - 완전한 Hold'em 게임 진행
  - 정확한 핸드 랭킹 계산
  - 사이드팟 처리 완료
  - 올인 상황 처리 완료
```

**Month 7-8: Action Tracker**
```yaml
주요작업:
  - Windows Forms UI 완성
  - TCP 클라이언트 구현
  - 실시간 게임 상태 동기화
  - 터치스크린 지원
  - 키보드 단축키 구현

완료기준:
  - 안정적인 네트워크 연결
  - 모든 플레이어 액션 지원
  - 실시간 UI 업데이트
  - 다중 테이블 지원
```

#### Phase 3: 그래픽 시스템 (9-12개월)

**Month 9-10: 기본 그래픽**
```yaml
주요작업:
  - 카드 렌더링 시스템
  - 플레이어 정보 표시
  - 팟 및 베팅 정보
  - 기본 애니메이션
  - 스킨 시스템 기초

완료기준:
  - 모든 게임 요소 시각화
  - 60fps 안정적 렌더링
  - 알파 채널 지원
  - 기본 전환 효과
```

**Month 11-12: 고급 그래픽**
```yaml
주요작업:
  - 고급 애니메이션 시스템
  - 파티클 효과
  - 커스텀 스킨 지원
  - 4K 해상도 지원
  - 성능 최적화

완료기준:
  - 방송 품질 그래픽 출력
  - 다양한 해상도 지원
  - 커스터마이징 가능한 UI
  - 메모리 사용량 최적화
```

#### Phase 4: 방송/스트리밍 기능 (13-15개월)

**Month 13-14: 비디오 출력**
```yaml
주요작업:
  - OBS 연동 (WebSocket)
  - 다중 비디오 소스 지원
  - 스트리밍 플랫폼 연동
  - 녹화 기능
  - 지연 방송 시스템

완료기준:
  - Twitch/YouTube 스트리밍
  - 최대 8개 카메라 지원
  - 보안 지연 시스템 완료
  - HD/4K 녹화 지원
```

**Month 15: 고급 방송 기능**
```yaml
주요작업:
  - ATEM 스위처 제어
  - NDI 입출력 지원
  - 오디오 믹싱
  - 다중 출력 지원
  - 실시간 통계 표시

완료기준:
  - 전문 방송 장비 연동
  - 안정적인 다중 출력
  - 오디오 동기화 완료
  - 실시간 성능 모니터링
```

#### Phase 5: Studio 및 고급 기능 (16-18개월)

**Month 16-17: Studio 구현**
```yaml
주요작업:
  - 포스트 프로덕션 에디터
  - 타임라인 편집기
  - 비디오 렌더링 엔진
  - 핸드 히스토리 편집
  - 배치 처리 시스템

완료기준:
  - 완전한 편집 워크플로우
  - 다양한 출력 포맷 지원
  - 고품질 렌더링
  - 자동화된 처리
```

**Month 18: 최종 완성**
```yaml
주요작업:
  - 종합 테스트 및 버그 수정
  - 성능 최적화
  - 사용자 매뉴얼 작성
  - 설치 프로그램 제작
  - 라이선스 시스템 구현

완료기준:
  - 모든 기능 검증 완료
  - 24시간 연속 안정성 테스트
  - 완전한 문서화
  - 배포 준비 완료
```

### 👥 개발팀 구성

#### 필수 인력 (8명)
```yaml
Tech Lead (1명):
  - 전체 아키텍처 설계
  - 코드 리뷰 및 품질 관리
  - 기술적 의사결정

C++ 개발자 (3명):
  - 메인 서버 개발
  - RFID 시스템 구현
  - 그래픽 엔진 개발

C# 개발자 (2명):
  - Action Tracker 개발
  - Studio 애플리케이션
  - UI/UX 구현

DirectX/Graphics 전문가 (1명):
  - 렌더링 파이프라인
  - 셰이더 프로그래밍
  - 성능 최적화

QA 엔지니어 (1명):
  - 테스트 시나리오 작성
  - 자동화 테스트 구축
  - 버그 추적 및 검증
```

### 💰 예산 계획

#### 총 개발 비용: $2.8M (18개월)
```yaml
인건비: $2.1M (75%)
  - Tech Lead: $200K/년 × 1.5년 = $300K
  - Senior C++: $150K/년 × 1.5년 × 3명 = $675K
  - C# 개발자: $130K/년 × 1.5년 × 2명 = $390K
  - Graphics 전문가: $160K/년 × 1.5년 = $240K
  - QA 엔지니어: $100K/년 × 1.5년 = $150K
  - 프로젝트 관리: $20K/월 × 18개월 = $360K

도구 및 라이선스: $200K (7%)
  - Visual Studio Professional: $45/월 × 8명 × 18개월 = $6.5K
  - DirectX SDK: 무료
  - 3rd party 라이브러리: $50K
  - 테스트 장비: $100K
  - 개발 PC (고사양): $5K × 8대 = $40K

인프라: $150K (5%)
  - 클라우드 서버: $2K/월 × 18개월 = $36K
  - 버전 관리 시스템: $50/월 × 18개월 = $0.9K
  - CI/CD 파이프라인: $100/월 × 18개월 = $1.8K
  - 테스트 환경 구축: $50K
  - 오피스 공간 및 유틸리티: $60K

기타: $350K (13%)
  - 법무 및 특허: $50K
  - 마케팅 및 브랜딩: $100K
  - 사용자 테스트: $50K
  - 예비 비용: $150K
```

---

## 📋 결론

이 기획서는 **PokerGFX의 모든 기능을 완전히 복제**하기 위한 상세한 개발 계획을 제시합니다. 

### ✅ 핵심 달성 목표
1. **100% 기능 동일성**: 원본과 동일한 모든 기능 구현
2. **성능 동등성**: 동일한 수준의 성능과 안정성
3. **사용자 경험**: 기존 사용자가 바로 사용 가능한 인터페이스
4. **기술적 완성도**: 상용 소프트웨어 수준의 품질

### 🎯 성공 지표
- RFID 카드 인식 정확도: 99.5% 이상
- 실시간 렌더링: 60fps 유지
- 네트워크 지연시간: 50ms 이하
- 시스템 안정성: 24시간 연속 작동
- 메모리 사용량: 8GB 이하 (4K 스트리밍 시)

이제 이 기획서를 바탕으로 개발팀은 **실제 구현 가능한 명확한 로드맵**을 가지고 PokerGFX와 동일한 수준의 전문적인 포커 방송 솔루션을 개발할 수 있습니다.