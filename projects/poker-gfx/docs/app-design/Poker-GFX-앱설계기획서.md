# Poker-GFX 앱 설계 기획서

## 📱 앱 개요

### 앱 이름
**Poker-GFX** - AI 기반 포커 방송 제작 앱

### 핵심 컨셉
"카메라만 연결하면 5분 만에 전문적인 포커 방송이 가능한 직관적인 앱"

### 타겟 사용자
1. **홈 게임 주최자** (40%) - 친구들과의 게임을 방송하고 싶은 일반인
2. **아마추어 스트리머** (35%) - 포커 컨텐츠로 스트리밍하려는 초보자
3. **세미프로 제작자** (20%) - 작은 포커룸이나 클럽 운영자
4. **전문 방송 제작자** (5%) - 토너먼트나 전문 방송 제작진

---

## 🎯 앱의 핵심 가치

### 1. 극도로 간단한 사용법
- **5분 만에 시작**: 카메라 연결 → 테이블 인식 → 방송 시작
- **자동화**: AI가 카드와 게임 상황을 자동으로 인식하고 방송에 표시
- **원클릭 스트리밍**: 복잡한 설정 없이 버튼 하나로 여러 플랫폼 동시 방송

### 2. 전문적인 결과물
- **방송 품질**: TV에서 보는 것 같은 전문적인 그래픽과 연출
- **자동 카메라 워크**: 게임 상황에 맞춰 자동으로 카메라 전환
- **실시간 통계**: 플레이어별 통계와 게임 정보 실시간 표시

### 3. 경제적 접근성
- **저렴한 비용**: 월 $29부터 시작 (기존 솔루션의 1/100 가격)
- **하드웨어 독립성**: 비싼 RFID 장비 없이 일반 카메라만으로 가능

---

## 📋 상세 기능 명세

## 1. 🎥 비디오 입력 및 처리

### 1.1 카메라 지원
```yaml
지원_장비:
  - USB 웹캠 (Logitech C920, C930e 등)
  - DSLR 카메라 (캡처카드 연결)
  - 내장 카메라 (노트북)
  - 스마트폰 카메라 (앱 연동)
  - 전문 캠코더 (HDMI 출력)
  
최대_동시_입력: 4개 카메라
해상도_지원: 720p, 1080p, 4K
프레임레이트: 30fps, 60fps
```

### 1.2 테이블 자동 인식
```yaml
설정_과정:
  1단계: 카메라 연결 확인
  2단계: 테이블 영역 자동 감지
  3단계: 플레이어 좌석 인식 (최대 10명)
  4단계: 카드 영역 설정
  
소요_시간: 평균 2-3분
정확도: 95% 이상
```

### 1.3 실시간 이미지 처리
- **자동 밝기 조절**: 조명 변화에 자동 적응
- **화질 개선**: AI 기반 노이즈 제거 및 선명도 향상
- **색상 보정**: 카드와 칩의 색상을 정확하게 표현

## 2. 🤖 AI 게임 인식 시스템

### 2.1 카드 인식
```yaml
인식_가능한_요소:
  - 홀카드 (각 플레이어)
  - 커뮤니티 카드 (플랍, 턴, 리버)
  - 카드 브랜드: Bicycle, Copag, KEM, Modiano
  - 덱 상태: 새 카드, 사용된 카드 구분

정확도:
  - 일반 조명: 99%
  - 어두운 조명: 95%
  - 반사광 있음: 92%
  
처리_속도: 실시간 (30fps)
```

### 2.2 게임 상태 추적
```yaml
자동_인식_항목:
  - 현재 베팅 라운드 (프리플랍, 플랍, 턴, 리버)
  - 플레이어별 액션 (체크, 콜, 베트, 레이즈, 폴드)
  - 팟 크기 계산
  - 사이드팟 생성
  - 올인 상황
  - 핸드 승부 결과

지원_게임:
  - Texas Hold'em (기본)
  - Omaha (Hi/Lo)
  - Seven Card Stud
  - Five Card Draw (추후 업데이트)
```

### 2.3 칩 카운팅
```yaml
인식_방식:
  - 색상별 칩 구분
  - 스택 높이 계산
  - 베팅 액션 추적
  
지원_칩_세트:
  - 표준 클레이 칩
  - 플라스틱 칩
  - 사용자 정의 칩 (학습 기능)
  
정확도: 90% 이상
```

## 3. 🎨 실시간 그래픽 시스템

### 3.1 플레이어 정보 표시
```yaml
표시_정보:
  기본_정보:
    - 플레이어 이름
    - 현재 칩 스택
    - 포지션 (버튼, SB, BB 등)
    - 현재 액션 상태
    
  통계_정보:
    - VPIP (Voluntarily Put In Pot) %
    - PFR (Pre-Flop Raise) %
    - 승률 통계
    - 세션 손익
    
  시각_요소:
    - 프로필 사진 (선택사항)
    - 국가 국기 (선택사항)
    - 액션 하이라이트 효과
```

### 3.2 게임 정보 오버레이
```yaml
화면_구성_요소:
  상단_바:
    - 게임 제목/토너먼트명
    - 현재 핸드 번호
    - 게임 진행 시간
    
  중앙_영역:
    - 커뮤니티 카드
    - 현재 팟 크기
    - 베팅 액션 히스토리
    
  하단_정보:
    - 블라인드 레벨 (토너먼트)
    - 다음 블라인드까지 시간
    - 참가자 수 / 남은 인원
```

### 3.3 그래픽 테마 시스템
```yaml
기본_테마:
  - Classic (전통적인 녹색 펠트)
  - Modern (심플하고 현대적)
  - Luxury (고급스러운 골드/블랙)
  - Neon (네온사인 스타일)
  - Minimal (최소한의 정보만)
  
커스터마이징:
  - 색상 변경
  - 폰트 선택
  - 로고 삽입
  - 브랜딩 요소 추가
```

## 4. 📡 스트리밍 및 녹화

### 4.1 스트리밍 플랫폼
```yaml
지원_플랫폼:
  - Twitch (기본)
  - YouTube Live
  - Facebook Gaming
  - 아프리카TV
  - 네이버 NOW
  - 커스텀 RTMP 서버
  
동시_스트리밍: 최대 3개 플랫폼 (Pro 버전)
```

### 4.2 화질 및 성능 설정
```yaml
해상도_옵션:
  - 720p (1280x720) - 기본
  - 1080p (1920x1080) - 권장
  - 1440p (2560x1440) - Pro
  - 4K (3840x2160) - Enterprise
  
비트레이트:
  - 자동 조절 (권장)
  - 수동 설정 (고급 사용자)
  - 적응형 비트레이트 (네트워크 상황에 따라)
  
프레임레이트: 30fps, 60fps
```

### 4.3 녹화 기능
```yaml
녹화_형식:
  - MP4 (H.264/H.265)
  - MOV (Apple 호환)
  - AVI (호환성 우선)
  
저장_옵션:
  - 로컬 저장소
  - 클라우드 백업 (Google Drive, Dropbox)
  - 자동 하이라이트 편집
  
품질_설정:
  - 원본 품질 (용량 큼)
  - 압축 품질 (용량 작음)
  - 커스텀 설정
```

## 5. 🔧 지연 방송 (Secure Delay)

### 5.1 홀카드 보안 시스템
```yaml
기능_설명:
  목적: 플레이어의 홀카드가 실시간으로 노출되지 않도록 방송을 지연
  
지연_시간_설정:
  - 30초 (빠른 게임용)
  - 5분 (표준)
  - 15분 (토너먼트)
  - 30분 (하이스테이크)
  - 사용자 정의 (1분-60분)
```

### 5.2 이중 출력 시스템
```yaml
라이브_출력:
  - 딜러/플레이어용 모니터
  - 홀카드 표시됨
  - 실시간 게임 상황
  
지연_출력:
  - 스트리밍/관중용
  - 홀카드 숨김 또는 지연 표시
  - 핸드 종료 후 즉시 공개 옵션
```

### 5.3 응급 상황 대응
```yaml
즉시_라이브_전환:
  - 버튼 하나로 지연 해제
  - 중요한 발표나 응급상황 대응
  - 자동 복구 기능
  
부분_공개_모드:
  - 올인 상황 시 즉시 공개
  - 액션 완료 후 단계적 공개
  - 쇼다운 시 자동 공개
```

---

## 🖥️ 사용자 인터페이스 설계

## 1. 메인 화면 레이아웃

### 1.1 대시보드 (홈 화면)
```
┌─────────────────────────────────────────────────────────────┐
│ 🎮 Poker-GFX                    🔴 LIVE    ⚙️ 설정   ❓ 도움말 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📹 메인 프리뷰 (1920x1080)                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │           [테이블 실시간 영상]                        │    │
│  │                                                     │    │
│  │  👤 Alice    👤 Bob     👤 Charlie                   │    │
│  │  $2,450     $1,820     $3,200                      │    │
│  │                                                     │    │
│  │        🃏 A♠ K♥      🎯 팟: $2,850                   │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
├─────────────────────┬───────────────────────────────────────┤
│ 🎥 카메라 컨트롤      │ 📊 게임 상태                           │
│ ┌─────┬─────┬─────┐  │ 핸드 #: 47                            │
│ │CAM1 │CAM2 │CAM3 │  │ 게임: Hold'em                         │
│ │ 🟢  │ ⚪  │ ⚪  │  │ 스테이크: $5/$10                       │
│ └─────┴─────┴─────┘  │ 진행시간: ⏱️ 02:35:42                  │
│ [🤖 자동] [📱 수동]   │                                      │
├─────────────────────┼───────────────────────────────────────┤
│ 📡 스트리밍 상태      │ 👥 플레이어 관리                       │
│ 🟢 Twitch: 1,247명   │ 1. 👤 Alice    $2,450  [활성]         │
│ 🟢 YouTube: 856명    │ 2. 👤 Bob      $1,820  [폴드]         │
│ 🟡 Facebook: 연결중   │ 3. 👤 Charlie  $3,200  [베팅]         │
│ 📊 품질: 1080p/60fps  │ 4. 💺 [빈 좌석]                      │
└─────────────────────┴───────────────────────────────────────┘
```

### 1.2 빠른 액세스 버튼
```yaml
상단_버튼_바:
  - 🔴 라이브 시작/중지 (가장 크고 눈에 띄게)
  - 📹 녹화 시작/중지
  - 📸 스크린샷 저장
  - ⚙️ 설정 메뉴
  - ❓ 도움말 및 튜토리얼
  
하단_상태_바:
  - 🌐 인터넷 연결 상태
  - 💾 저장 공간 (녹화용)
  - 🔋 노트북 배터리 (해당시)
  - 🎯 AI 인식 상태
```

## 2. 설정 화면

### 2.1 초기 설정 마법사
```yaml
1단계_카메라_설정:
  - 사용 가능한 카메라 자동 감지
  - 테스트 영상으로 화질 확인
  - 권장 설정 자동 적용
  
2단계_테이블_인식:
  - "테이블이 보이도록 카메라를 조정해주세요"
  - 테이블 경계 자동 감지
  - 수동 조정 가능 (드래그로 영역 설정)
  
3단계_플레이어_좌석:
  - "플레이어가 앉을 위치를 표시해주세요"
  - 클릭으로 좌석 위치 지정
  - 자동 감지된 좌석 위치 확인/수정
  
4단계_게임_설정:
  - 게임 종류 선택 (Hold'em, Omaha 등)
  - 스테이크 설정
  - 플레이어 이름 입력
  
5단계_방송_설정:
  - 스트리밍 플랫폼 연결
  - 화질 및 품질 설정
  - 테스트 방송 실행
```

### 2.2 고급 설정 메뉴
```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ 설정                                            [✕] 닫기  │
├─────────────────────────────────────────────────────────────┤
│ 📹 비디오  📡 스트리밍  🎨 그래픽  🔧 고급  ❓ 도움말          │
│                                                             │
│ 📹 비디오 소스                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☑️ USB Camera 1 (Logitech C920)     [테스트] [설정]     │ │
│ │    해상도: 1920x1080, 30fps                            │ │
│ │                                                         │ │
│ │ ☑️ USB Camera 2 (내장 카메라)        [테스트] [설정]     │ │
│ │    해상도: 1280x720, 30fps                             │ │
│ │                                                         │ │
│ │ ☐ HDMI Capture (신호 없음)          [테스트] [설정]     │ │
│ │    상태: 연결되지 않음                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 🤖 AI 인식 설정                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 카드 인식 신뢰도: ████████░░ 85%                        │ │
│ │ [모델 재학습] [사용자 정의 덱 추가]                       │ │
│ │                                                         │ │
│ │ ☑️ 자동 게임 상태 감지                                   │ │
│ │ ☑️ 자동 카메라 전환                                      │ │
│ │ ☑️ 자동 그래픽 업데이트                                  │ │
│ │ ☐ 실험적 기능 (베타)                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 3. 🎨 그래픽 커스터마이징

### 3.1 테마 선택 화면
```yaml
테마_갤러리:
  - 썸네일로 테마 미리보기
  - 실시간 적용으로 즉시 확인
  - 색상, 폰트, 레이아웃 개별 조정
  
커스터마이징_옵션:
  - 색상 팔레트 변경
  - 폰트 스타일 선택
  - 로고 이미지 업로드
  - 배경 이미지 설정
  - 애니메이션 효과 설정
```

### 3.2 실시간 프리뷰
```yaml
편집_모드:
  - 왼쪽: 설정 패널
  - 오른쪽: 실시간 프리뷰
  - 변경사항 즉시 반영
  - 되돌리기/다시하기 기능
```

---

## 📱 모바일 앱 설계

## 1. 모바일 컴패니언 앱

### 1.1 주요 기능
```yaml
원격_제어:
  - 스트리밍 시작/중지
  - 카메라 전환
  - 플레이어 정보 수정
  - 그래픽 테마 변경
  
모니터링:
  - 스트림 상태 확인
  - 시청자 수 실시간 표시
  - 채팅 메시지 알림
  - 시스템 상태 모니터링
  
편의_기능:
  - 빠른 설정 변경
  - 즐겨찾기 설정 저장
  - 푸시 알림
  - 오프라인 모드 (설정 준비)
```

### 1.2 모바일 UI 구성
```
┌─────────────────────────────┐
│  📱 Poker-GFX Remote        │
├─────────────────────────────┤
│                             │
│  🔴 LIVE  👥 1,247          │
│                             │
│  📹 Camera View             │
│  ┌─────────────────────────┐ │
│  │    [메인 방송 화면]      │ │
│  │                         │ │
│  └─────────────────────────┘ │
│                             │
│  🎥 Quick Controls          │
│  ┌───┬───┬───┬───┬───┐      │
│  │C1 │C2 │C3 │C4 │AUTO     │
│  └───┴───┴───┴───┴───┘      │
│                             │
│  👥 Players                 │
│  • Alice    $2,450   [활성] │
│  • Bob      $1,820   [폴드] │
│  • Charlie  $3,200   [베팅] │
│                             │
├─────────────────────────────┤
│ [홈] [제어] [통계] [설정]     │
└─────────────────────────────┘
```

## 2. 스마트폰 카메라 활용

### 2.1 다중 카메라 시스템
```yaml
활용_방안:
  - 메인 PC: 위에서 내려다보는 테이블 전체 뷰
  - 스마트폰1: 딜러 시점 (카드 배분)
  - 스마트폰2: 플레이어 표정 (리액션)
  - 스마트폰3: 칩과 카드 클로즈업
  
연결_방식:
  - WiFi 네트워크를 통한 실시간 스트리밍
  - QR 코드로 간편 연결
  - 자동 동기화 및 품질 조절
```

---

## 🔧 기술 구현 상세

## 1. AI 엔진 구조

### 1.1 컴퓨터 비전 파이프라인
```python
class PokerVisionEngine:
    """
    포커 게임 실시간 비전 처리 시스템
    """
    
    def __init__(self):
        # 카드 감지 모델 (YOLO v8 기반)
        self.card_detector = self.load_card_model()
        
        # 게임 상태 추적 모델
        self.game_tracker = GameStateTracker()
        
        # 플레이어 행동 분석 모델
        self.action_classifier = ActionClassifier()
        
        # 칩 카운팅 모델
        self.chip_counter = ChipCounter()
    
    async def process_frame(self, frame):
        """
        프레임 처리 메인 함수
        - 30fps 실시간 처리 보장
        - GPU 가속 활용
        """
        # 1. 카드 감지 (병렬 처리)
        cards_task = asyncio.create_task(
            self.detect_cards(frame)
        )
        
        # 2. 칩 감지 (병렬 처리)
        chips_task = asyncio.create_task(
            self.count_chips(frame)
        )
        
        # 3. 플레이어 액션 감지
        actions_task = asyncio.create_task(
            self.detect_actions(frame)
        )
        
        # 결과 통합
        cards, chips, actions = await asyncio.gather(
            cards_task, chips_task, actions_task
        )
        
        # 게임 상태 업데이트
        game_state = self.game_tracker.update(
            cards, chips, actions
        )
        
        return game_state
    
    def detect_cards(self, frame):
        """
        카드 감지 상세 구현
        """
        # 전처리: 밝기 조절, 노이즈 제거
        processed_frame = self.preprocess_image(frame)
        
        # YOLO 모델로 카드 위치 감지
        card_boxes = self.card_detector.detect(processed_frame)
        
        cards = []
        for box in card_boxes:
            # 카드 영역 크롭
            card_image = self.crop_card(frame, box)
            
            # 카드 분류 (랭크와 슈트)
            rank, suit = self.classify_card(card_image)
            
            cards.append({
                'rank': rank,
                'suit': suit,
                'position': box,
                'confidence': box.confidence
            })
        
        return cards
```

### 1.2 게임 상태 관리
```python
class GameStateManager:
    """
    포커 게임의 전체 상태를 관리하는 클래스
    """
    
    def __init__(self):
        self.current_hand = None
        self.players = {}
        self.pot = 0
        self.community_cards = []
        self.betting_round = 'preflop'
        self.action_history = []
    
    def update_game_state(self, vision_data):
        """
        비전 데이터를 바탕으로 게임 상태 업데이트
        """
        # 카드 정보 업데이트
        self.update_cards(vision_data.cards)
        
        # 칩 정보 업데이트
        self.update_chips(vision_data.chips)
        
        # 플레이어 액션 감지
        self.detect_player_actions(vision_data.actions)
        
        # 베팅 라운드 진행 체크
        self.check_betting_round_progress()
        
        # 핸드 종료 체크
        if self.is_hand_complete():
            self.finalize_hand()
    
    def detect_player_actions(self, action_data):
        """
        플레이어의 액션을 감지하고 기록
        """
        for player_id, action_info in action_data.items():
            if action_info.action_type in ['fold', 'call', 'raise', 'check']:
                self.record_action(player_id, action_info)
                self.update_pot(action_info.amount)
    
    def generate_graphics_data(self):
        """
        화면에 표시할 그래픽 데이터 생성
        """
        return {
            'players': self.get_player_display_data(),
            'pot': self.pot,
            'community_cards': self.community_cards,
            'betting_round': self.betting_round,
            'action_highlights': self.get_action_highlights()
        }
```

## 2. 실시간 그래픽 렌더링

### 2.1 오버레이 시스템
```javascript
class GraphicsOverlay {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.theme = new ThemeManager();
        this.animations = new AnimationEngine();
    }
    
    render(gameState) {
        // 캔버스 클리어
        this.clearCanvas();
        
        // 배경 렌더링
        this.renderBackground();
        
        // 플레이어 정보 렌더링
        this.renderPlayers(gameState.players);
        
        // 커뮤니티 카드 렌더링
        this.renderCommunityCards(gameState.community_cards);
        
        // 팟 정보 렌더링
        this.renderPotInfo(gameState.pot);
        
        // 액션 하이라이트 렌더링
        this.renderActionHighlights(gameState.action_highlights);
        
        // 애니메이션 효과 적용
        this.animations.update();
    }
    
    renderPlayers(players) {
        players.forEach((player, index) => {
            const position = this.getPlayerPosition(index);
            
            // 플레이어 카드 배경
            this.drawPlayerBackground(position);
            
            // 플레이어 이름
            this.drawText(player.name, position.namePos, {
                font: this.theme.playerNameFont,
                color: this.theme.playerNameColor
            });
            
            // 칩 스택
            this.drawText(`$${player.stack}`, position.stackPos, {
                font: this.theme.stackFont,
                color: this.theme.stackColor
            });
            
            // 현재 액션 표시
            if (player.currentAction) {
                this.drawActionIndicator(player.currentAction, position);
            }
            
            // 홀카드 (공개 시)
            if (player.holeCards && this.shouldShowCards(player)) {
                this.drawCards(player.holeCards, position.cardsPos);
            }
        });
    }
    
    drawCards(cards, position) {
        cards.forEach((card, index) => {
            const cardPos = {
                x: position.x + (index * 40),
                y: position.y
            };
            
            // 카드 배경
            this.drawRoundedRect(cardPos, 35, 50, '#ffffff');
            
            // 카드 이미지 또는 텍스트
            if (this.theme.useCardImages) {
                this.drawCardImage(card, cardPos);
            } else {
                this.drawCardText(card, cardPos);
            }
        });
    }
}
```

### 2.2 테마 시스템
```javascript
class ThemeManager {
    constructor() {
        this.currentTheme = 'classic';
        this.themes = {
            classic: {
                background: '#0f5132',
                playerBackground: 'rgba(0,0,0,0.7)',
                playerNameFont: '16px Arial',
                playerNameColor: '#ffffff',
                stackFont: '14px Arial Bold',
                stackColor: '#ffd700',
                potColor: '#ff6b35',
                cardBackground: '#ffffff',
                animations: true
            },
            modern: {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                playerBackground: 'rgba(255,255,255,0.1)',
                playerNameFont: '16px "Segoe UI"',
                playerNameColor: '#ffffff',
                stackFont: '14px "Segoe UI" Bold',
                stackColor: '#00d4aa',
                potColor: '#ff4757',
                cardBackground: '#ffffff',
                animations: true
            },
            // 더 많은 테마...
        };
    }
    
    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            this.applyTheme();
        }
    }
    
    applyTheme() {
        const theme = this.themes[this.currentTheme];
        // 테마 적용 로직
        document.documentElement.style.setProperty('--bg-color', theme.background);
        // 기타 CSS 변수 업데이트
    }
    
    customizeTheme(property, value) {
        this.themes[this.currentTheme][property] = value;
        this.applyTheme();
    }
}
```

## 3. 스트리밍 엔진

### 3.1 다중 플랫폼 스트리밍
```javascript
class StreamingEngine {
    constructor() {
        this.streams = new Map();
        this.encoder = new VideoEncoder();
        this.audioMixer = new AudioMixer();
    }
    
    async startStream(platforms) {
        for (const platform of platforms) {
            const stream = await this.createStream(platform);
            this.streams.set(platform.name, stream);
        }
        
        // 비디오 캡처 시작
        this.startVideoCapture();
        
        // 오디오 캡처 시작
        this.startAudioCapture();
        
        // 스트림 상태 모니터링 시작
        this.startHealthMonitoring();
    }
    
    async createStream(platform) {
        const config = this.getStreamConfig(platform);
        
        return {
            name: platform.name,
            rtmpUrl: platform.rtmpUrl,
            streamKey: platform.streamKey,
            encoder: new RTMPEncoder(config),
            health: new StreamHealth(),
            bitrate: config.bitrate,
            resolution: config.resolution
        };
    }
    
    async processFrame(videoFrame, audioFrame) {
        // 비디오 프레임에 그래픽 오버레이 적용
        const overlayedFrame = await this.applyOverlay(videoFrame);
        
        // 각 스트림에 맞는 품질로 인코딩
        for (const [platformName, stream] of this.streams) {
            const encodedVideo = await stream.encoder.encodeVideo(
                overlayedFrame, 
                stream.resolution
            );
            
            const encodedAudio = await stream.encoder.encodeAudio(
                audioFrame,
                stream.bitrate
            );
            
            // RTMP 서버로 전송
            await this.sendToRTMP(stream, encodedVideo, encodedAudio);
            
            // 스트림 상태 업데이트
            stream.health.updateStats(encodedVideo.size, encodedAudio.size);
        }
    }
    
    getStreamHealth() {
        const healthData = {};
        
        for (const [platformName, stream] of this.streams) {
            healthData[platformName] = {
                bitrate: stream.health.currentBitrate,
                fps: stream.health.currentFps,
                droppedFrames: stream.health.droppedFrames,
                connectionStatus: stream.health.isConnected ? 'connected' : 'disconnected',
                viewers: stream.health.viewerCount || 0
            };
        }
        
        return healthData;
    }
}
```

---

## 📊 성능 최적화

### 1. 하드웨어 요구사항

#### 1.1 최소 사양
```yaml
CPU: Intel i5-8400 또는 AMD Ryzen 5 2600
GPU: NVIDIA GTX 1060 (6GB) 또는 AMD RX 580
RAM: 8GB DDR4
저장공간: 50GB 여유공간 (SSD 권장)
네트워크: 업로드 10Mbps 이상
운영체제: Windows 10 (64bit), macOS 10.15+, Ubuntu 18.04+
```

#### 1.2 권장 사양
```yaml
CPU: Intel i7-10700K 또는 AMD Ryzen 7 3700X
GPU: NVIDIA RTX 3070 또는 AMD RX 6700 XT
RAM: 16GB DDR4
저장공간: 100GB 여유공간 (NVMe SSD)
네트워크: 업로드 50Mbps 이상
```

### 2. 성능 최적화 전략

#### 2.1 GPU 가속 활용
```yaml
활용_영역:
  - AI 모델 추론 (CUDA/OpenCL)
  - 비디오 인코딩 (NVENC/VCE)
  - 실시간 그래픽 렌더링 (OpenGL/DirectX)
  - 이미지 전처리 (GPU 셰이더)

최적화_기법:
  - 배치 처리로 GPU 활용도 최대화
  - 메모리 풀링으로 할당/해제 비용 최소화
  - 비동기 처리로 CPU-GPU 병렬 실행
```

#### 2.2 메모리 관리
```yaml
메모리_최적화:
  - 순환 버퍼로 비디오 프레임 관리
  - 압축 텍스처로 GPU 메모리 절약
  - 가비지 컬렉션 최소화
  - 메모리 리크 방지 시스템

모니터링:
  - 실시간 메모리 사용량 표시
  - 메모리 누수 자동 감지
  - 성능 저하 시 자동 최적화
```

#### 2.3 네트워크 최적화
```yaml
대역폭_관리:
  - 적응형 비트레이트 스트리밍
  - 네트워크 상황에 따른 품질 자동 조절
  - 다중 스트림 대역폭 분산
  - 우선순위 기반 패킷 전송

안정성_향상:
  - 자동 재연결 시스템
  - 버퍼링 최적화
  - 패킷 손실 복구
  - 지연시간 최소화
```

---

## 🔒 보안 및 프라이버시

### 1. 데이터 보안

#### 1.1 개인정보 보호
```yaml
수집_정보:
  최소한의_정보만_수집:
    - 사용자 ID (이메일)
    - 스트리밍 플랫폼 연결 정보
    - 사용 통계 (익명화)
  
처리_방식:
  - 로컬 처리 우선 (클라우드 최소화)
  - 암호화 저장 (AES-256)
  - 자동 삭제 정책 (30일 후)
```

#### 1.2 스트리밍 보안
```yaml
방송_보안:
  - 홀카드 지연 시스템으로 부정행위 방지
  - 스트림 키 암호화 저장
  - 무단 접근 방지 시스템
  
데이터_전송:
  - HTTPS/WSS 프로토콜 사용
  - 종단간 암호화
  - API 키 보안 관리
```

### 2. 사용자 안전

#### 2.1 부정행위 방지
```yaml
모니터링_시스템:
  - 비정상적인 카드 패턴 감지
  - 조작 시도 자동 감지
  - 의심스러운 활동 알림
  
투명성_도구:
  - 게임 기록 자동 저장
  - 재생 가능한 게임 로그
  - 감사 추적 시스템
```

---

## 📈 분석 및 리포팅

### 1. 게임 통계

#### 1.1 실시간 통계
```yaml
플레이어_통계:
  - VPIP (Voluntarily Put In Pot) %
  - PFR (Pre-Flop Raise) %
  - Aggression Factor
  - Win Rate
  - 시간당 핸드 수
  
세션_통계:
  - 총 핸드 수
  - 평균 팟 크기
  - 게임 진행 시간
  - 최대 스택 변동
```

#### 1.2 게임 분석 리포트
```yaml
자동_생성_리포트:
  - 세션 요약 (PDF/HTML)
  - 플레이어별 성과 분석
  - 주요 핸드 하이라이트
  - 통계 트렌드 그래프
  
내보내기_옵션:
  - Excel 파일
  - CSV 데이터
  - 이미지 파일
  - 비디오 클립
```

### 2. 스트리밍 분석

#### 2.1 방송 품질 모니터링
```yaml
실시간_지표:
  - 비트레이트 안정성
  - 프레임 드랍률
  - 오디오 품질
  - 네트워크 지연시간
  
시청자_분석:
  - 동시 접속자 수
  - 평균 시청 시간
  - 시청자 유입/이탈 패턴
  - 인기 시간대 분석
```

---

## 🎓 사용자 교육 및 지원

### 1. 튜토리얼 시스템

#### 1.1 단계별 가이드
```yaml
초보자_코스:
  1단계: "첫 번째 방송 시작하기"
    - 카메라 연결하기
    - 테이블 인식하기
    - 기본 설정 완료하기
    
  2단계: "스트리밍 플랫폼 연결하기"
    - Twitch 계정 연결
    - 스트림 키 설정
    - 첫 방송 시작
    
  3단계: "그래픽 커스터마이징"
    - 테마 선택하기
    - 플레이어 정보 설정
    - 로고 추가하기

고급자_코스:
  - 다중 카메라 설정
  - 고급 AI 설정 조정
  - 커스텀 그래픽 만들기
  - 성능 최적화 팁
```

#### 1.2 인터랙티브 도움말
```yaml
상황별_도움말:
  - 현재 화면의 모든 요소에 대한 설명
  - 클릭 한 번으로 관련 도움말 표시
  - 동영상 가이드 링크
  - FAQ 빠른 검색

실시간_지원:
  - 채팅 지원 (운영시간 내)
  - 이메일 지원 (24시간)
  - 커뮤니티 포럼
  - 사용자 가이드 위키
```

### 2. 커뮤니티 기능

#### 2.1 사용자 커뮤니티
```yaml
포럼_카테고리:
  - 초보자 질문방
  - 기술적 문제 해결
  - 팁과 노하우 공유
  - 기능 요청 및 제안
  
컨텐츠_공유:
  - 커스텀 테마 공유
  - 설정 파일 공유
  - 방송 하이라이트 공유
  - 튜토리얼 비디오 공유
```

---

## 🚀 출시 계획

### 1. 베타 테스트

#### 1.1 클로즈 베타 (3개월)
```yaml
참가자:
  - 포커 커뮤니티 파워 유저 50명
  - 스트리밍 경험자 30명
  - 기술적 피드백 가능자 20명
  
테스트_목표:
  - 핵심 기능 안정성 검증
  - 사용성 문제점 발견
  - 성능 최적화 포인트 식별
  - 초기 사용자 만족도 측정
```

#### 1.2 오픈 베타 (2개월)
```yaml
확대_테스트:
  - 베타 참가자 500명으로 확대
  - 다양한 환경에서 테스트
  - 서버 부하 테스트
  - 최종 버그 수정
```

### 2. 정식 출시

#### 2.1 출시 전략
```yaml
소프트_론칭:
  - 포커 커뮤니티 우선 공개
  - 얼리 어답터 대상 마케팅
  - 입소문 마케팅 집중
  
마케팅_채널:
  - 포커 유튜버 협업
  - 트위치 스트리머 후원
  - 포커 토너먼트 데모
  - SNS 캠페인
```

#### 2.1 가격 정책
```yaml
런칭_프로모션:
  - 첫 달 무료 체험
  - 얼리버드 50% 할인
  - 연간 구독 시 2개월 무료
  
정가_정책:
  - Basic: $29/월 (홈 게임용)
  - Pro: $99/월 (세미프로용)  
  - Enterprise: $299/월 (전문용)
```

---

## 📞 결론

**Poker-GFX**는 복잡한 기존 솔루션의 문제점을 해결하고, AI 기술을 활용해 누구나 쉽게 전문적인 포커 방송을 제작할 수 있는 혁신적인 애플리케이션입니다.

### 🎯 핵심 성공 요인

1. **극단적 사용 편의성**
   - 5분 만에 설정 완료
   - 직관적인 사용자 인터페이스
   - 자동화된 AI 기능

2. **전문적인 결과물**
   - TV 방송 수준의 그래픽
   - 실시간 게임 분석
   - 다중 플랫폼 동시 스트리밍

3. **접근 가능한 가격**
   - 기존 솔루션 대비 1/100 비용
   - 구독 모델로 낮은 진입 장벽
   - 단계적 기능 제공

4. **확장 가능한 아키텍처**
   - 홈 게임부터 전문 토너먼트까지
   - 클라우드 기반 확장성
   - 모바일 지원

### 🚀 차별화 전략

- **기술적 혁신**: RFID 없는 AI 기반 카드 인식
- **사용자 경험**: 복잡함 없는 직관적 설계  
- **경제성**: 합리적 가격의 구독 모델
- **접근성**: 누구나 사용할 수 있는 간편함

이 설계 기획서를 바탕으로 개발팀은 명확한 방향성을 가지고 사용자 중심의 혁신적인 포커 방송 앱을 구현할 수 있을 것입니다.

---

*본 설계 기획서는 실제 개발 과정에서 사용자 피드백과 기술적 제약사항을 반영하여 지속적으로 업데이트될 예정입니다.*