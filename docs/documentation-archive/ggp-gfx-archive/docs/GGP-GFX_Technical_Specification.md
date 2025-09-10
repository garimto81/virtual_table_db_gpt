# GGP-GFX 기술 상세 명세서

## 1. 시스템 아키텍처 상세

### 1.1 마이크로서비스 아키텍처

```yaml
services:
  # Core Services
  core-engine:
    language: C++
    framework: Custom GPU Pipeline
    ports: [8001]
    dependencies: [vulkan, cuda, ffmpeg]
  
  video-processor:
    language: C++/Python
    framework: GStreamer + Custom
    ports: [8002]
    dependencies: [nvidia-codec-sdk, intel-media-sdk]
  
  ai-engine:
    language: Python
    framework: PyTorch + TensorRT
    ports: [8003]
    dependencies: [cuda, cudnn, tensorrt]
  
  # API Services
  api-gateway:
    language: Python
    framework: FastAPI
    ports: [8000]
    dependencies: [redis, postgresql]
  
  streaming-service:
    language: Go
    framework: Custom RTMP/SRT
    ports: [1935, 9999]
    dependencies: [libsrt, nginx-rtmp]
  
  # Support Services
  license-server:
    language: Rust
    framework: Actix-web
    ports: [8004]
    dependencies: [postgresql, stripe-api]
  
  analytics-service:
    language: Python
    framework: Apache Spark
    ports: [8005]
    dependencies: [kafka, elasticsearch]
```

### 1.2 데이터 플로우 아키텍처

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│Video Sources│────▶│Frame Buffer │────▶│GPU Pipeline │
└─────────────┘     └─────────────┘     └─────────────┘
                            │                    │
                            ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │AI Processor │     │Effects Engine│
                    └─────────────┘     └─────────────┘
                            │                    │
                            ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │Game Tracker │────▶│Graphics     │
                    └─────────────┘     │Compositor   │
                                       └─────────────┘
                                               │
                    ┌──────────────────────────┴──────┐
                    ▼                                 ▼
            ┌─────────────┐                  ┌─────────────┐
            │Stream Output│                  │File Output  │
            └─────────────┘                  └─────────────┘
```

## 2. 핵심 모듈 상세 설계

### 2.1 GPU Pipeline Engine

```cpp
class GPUPipeline {
private:
    VkInstance instance;
    VkDevice device;
    std::vector<VkQueue> computeQueues;
    std::vector<VkQueue> graphicsQueues;
    
public:
    // 초기화
    void Initialize(const PipelineConfig& config);
    
    // 프레임 처리
    void ProcessFrame(const Frame& input, Frame& output);
    
    // 효과 적용
    void ApplyEffect(const Effect& effect, Frame& frame);
    
    // 멀티 GPU 지원
    void DistributeWorkload(const std::vector<Task>& tasks);
};

// 프레임 버퍼 관리
class FrameBufferManager {
private:
    std::queue<std::shared_ptr<Frame>> inputQueue;
    std::queue<std::shared_ptr<Frame>> outputQueue;
    std::mutex queueMutex;
    
public:
    void PushFrame(std::shared_ptr<Frame> frame);
    std::shared_ptr<Frame> PopFrame();
    void OptimizeMemory();
};
```

### 2.2 AI 기반 게임 추적 시스템

```python
class GameTracker:
    def __init__(self):
        self.card_detector = CardDetectionModel()
        self.chip_counter = ChipCountingModel()
        self.action_classifier = ActionClassificationModel()
        self.player_tracker = PlayerTrackingModel()
        
    def process_frame(self, frame: np.ndarray) -> GameState:
        # 카드 감지
        cards = self.card_detector.detect(frame)
        
        # 칩 카운팅
        chip_counts = self.chip_counter.count(frame)
        
        # 플레이어 액션 분류
        actions = self.action_classifier.classify(frame)
        
        # 플레이어 추적
        players = self.player_tracker.track(frame)
        
        return GameState(
            cards=cards,
            chips=chip_counts,
            actions=actions,
            players=players
        )

class CardDetectionModel:
    def __init__(self):
        self.model = self._load_yolov8_model()
        self.ocr = EasyOCR(['en'])
        
    def detect(self, frame: np.ndarray) -> List[Card]:
        # YOLOv8로 카드 위치 감지
        detections = self.model(frame)
        
        cards = []
        for det in detections:
            # 카드 영역 추출
            card_region = frame[det.y1:det.y2, det.x1:det.x2]
            
            # OCR로 카드 값 인식
            result = self.ocr.readtext(card_region)
            
            # 카드 객체 생성
            card = Card(
                suit=self._classify_suit(card_region),
                rank=self._extract_rank(result),
                position=(det.x1, det.y1)
            )
            cards.append(card)
            
        return cards
```

### 2.3 실시간 그래픽 합성 엔진

```cpp
class GraphicsCompositor {
private:
    std::vector<Layer> layers;
    ShaderManager shaderManager;
    TextureManager textureManager;
    
public:
    // 레이어 관리
    void AddLayer(const Layer& layer);
    void RemoveLayer(int layerId);
    void ReorderLayers(const std::vector<int>& order);
    
    // 렌더링
    void Render(RenderTarget& target) {
        // Z-order로 정렬
        std::sort(layers.begin(), layers.end(), 
                  [](const Layer& a, const Layer& b) {
                      return a.zOrder < b.zOrder;
                  });
        
        // 각 레이어 렌더링
        for (const auto& layer : layers) {
            if (layer.visible) {
                RenderLayer(layer, target);
            }
        }
    }
    
    // 애니메이션
    void UpdateAnimations(float deltaTime);
    
    // 효과 적용
    void ApplyPostProcessing(RenderTarget& target);
};

// 셰이더 기반 효과
class ShaderEffect {
private:
    VkPipeline pipeline;
    VkDescriptorSet descriptorSet;
    
public:
    virtual void Apply(VkCommandBuffer cmd, 
                      const Texture& input, 
                      Texture& output) = 0;
};

class ChromaKeyEffect : public ShaderEffect {
public:
    void SetKeyColor(const Color& color);
    void SetThreshold(float threshold);
    void Apply(VkCommandBuffer cmd, 
              const Texture& input, 
              Texture& output) override;
};
```

### 2.4 스트리밍 엔진

```go
package streaming

type StreamingEngine struct {
    rtmpServer  *RTMPServer
    srtServer   *SRTServer
    webrtcServer *WebRTCServer
    encoder     *Encoder
}

// 멀티 플랫폼 스트리밍
func (s *StreamingEngine) StartMultiStreaming(config MultiStreamConfig) error {
    // 인코더 설정
    s.encoder.Configure(EncoderConfig{
        Codec:    config.Codec,
        Bitrate:  config.Bitrate,
        Framerate: config.Framerate,
        Resolution: config.Resolution,
    })
    
    // 각 플랫폼으로 스트림 시작
    for _, platform := range config.Platforms {
        go s.streamToPlatform(platform)
    }
    
    return nil
}

// 적응형 비트레이트
func (s *StreamingEngine) EnableABR(enabled bool) {
    if enabled {
        go s.monitorNetworkConditions()
        go s.adjustBitrateAdaptively()
    }
}

// 보안 딜레이
type SecureDelayBuffer struct {
    buffer     *ring.Buffer
    delayTime  time.Duration
    encryption *AESEncryption
}

func (b *SecureDelayBuffer) Write(frame Frame) {
    // 프레임 암호화
    encrypted := b.encryption.Encrypt(frame.Data)
    
    // 타임스탬프 추가
    frame.Timestamp = time.Now()
    frame.Data = encrypted
    
    // 버퍼에 저장
    b.buffer.Write(frame)
}

func (b *SecureDelayBuffer) Read() (Frame, error) {
    // 딜레이 시간 확인
    minTime := time.Now().Add(-b.delayTime)
    
    frame, err := b.buffer.ReadBefore(minTime)
    if err != nil {
        return Frame{}, err
    }
    
    // 복호화
    frame.Data = b.encryption.Decrypt(frame.Data)
    
    return frame, nil
}
```

## 3. 데이터베이스 스키마

### 3.1 PostgreSQL 스키마

```sql
-- 사용자 관리
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 라이선스 관리
CREATE TABLE licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    license_key VARCHAR(255) UNIQUE NOT NULL,
    license_type VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP,
    hardware_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 프로젝트 관리
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 게임 세션
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id),
    game_type VARCHAR(50) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    metadata JSONB
);

-- 핸드 히스토리
CREATE TABLE hands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES game_sessions(id),
    hand_number INTEGER NOT NULL,
    cards JSONB,
    actions JSONB,
    pot_size DECIMAL(10, 2),
    winners JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 플레이어 통계
CREATE TABLE player_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES game_sessions(id),
    player_name VARCHAR(255) NOT NULL,
    hands_played INTEGER DEFAULT 0,
    vpip DECIMAL(5, 2),
    pfr DECIMAL(5, 2),
    aggression_factor DECIMAL(5, 2),
    winnings DECIMAL(10, 2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_hands_session_id ON hands(session_id);
CREATE INDEX idx_hands_timestamp ON hands(timestamp);
CREATE INDEX idx_player_stats_session_id ON player_stats(session_id);
CREATE INDEX idx_licenses_user_id ON licenses(user_id);
```

### 3.2 Redis 캐시 구조

```redis
# 실시간 게임 상태
game:session:{session_id}:state -> JSON
game:session:{session_id}:players -> SET
game:session:{session_id}:pot -> STRING

# 플레이어 위치
player:{player_id}:seat -> STRING
player:{player_id}:chips -> STRING
player:{player_id}:cards -> JSON

# 스트리밍 상태
stream:{stream_id}:status -> STRING
stream:{stream_id}:viewers -> STRING
stream:{stream_id}:bitrate -> STRING

# 성능 메트릭
metrics:fps -> STRING
metrics:cpu_usage -> STRING
metrics:gpu_usage -> STRING
metrics:memory_usage -> STRING

# 세션 관리
session:{user_id}:token -> STRING (TTL: 24h)
session:{user_id}:preferences -> JSON
```

## 4. API 상세 명세

### 4.1 RESTful API

```yaml
openapi: 3.0.0
info:
  title: GGP-GFX API
  version: 1.0.0

paths:
  /api/v1/auth/login:
    post:
      summary: 사용자 로그인
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
      responses:
        200:
          description: 로그인 성공
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                  user:
                    $ref: '#/components/schemas/User'

  /api/v1/projects:
    get:
      summary: 프로젝트 목록 조회
      security:
        - bearerAuth: []
      responses:
        200:
          description: 프로젝트 목록
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Project'
    
    post:
      summary: 새 프로젝트 생성
      security:
        - bearerAuth: []
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProjectCreate'
      responses:
        201:
          description: 프로젝트 생성됨

  /api/v1/stream/start:
    post:
      summary: 스트리밍 시작
      security:
        - bearerAuth: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                projectId:
                  type: string
                platforms:
                  type: array
                  items:
                    type: object
                    properties:
                      type:
                        type: string
                        enum: [twitch, youtube, facebook, custom]
                      settings:
                        type: object
                securityDelay:
                  type: integer
                  description: 딜레이 시간 (초)

  /api/v1/game/track:
    post:
      summary: 게임 액션 추적
      security:
        - bearerAuth: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                sessionId:
                  type: string
                action:
                  type: string
                  enum: [fold, check, call, raise, allin]
                playerId:
                  type: integer
                amount:
                  type: number

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
        licenseType:
          type: string
    
    Project:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        gameType:
          type: string
        createdAt:
          type: string
          format: date-time
    
    ProjectCreate:
      type: object
      required:
        - name
        - gameType
      properties:
        name:
          type: string
        gameType:
          type: string
          enum: [holdem, omaha, stud, mixed]
        settings:
          type: object

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

### 4.2 WebSocket API

```typescript
// WebSocket 이벤트 정의
interface WebSocketEvents {
  // 서버 -> 클라이언트
  'game.state.update': {
    sessionId: string;
    state: GameState;
  };
  
  'player.action': {
    playerId: number;
    action: PlayerAction;
    amount?: number;
  };
  
  'cards.dealt': {
    type: 'hole' | 'flop' | 'turn' | 'river';
    cards: Card[];
  };
  
  'pot.update': {
    mainPot: number;
    sidePots?: SidePot[];
  };
  
  'stream.stats': {
    fps: number;
    bitrate: number;
    viewers: number;
    dropped_frames: number;
  };
  
  // 클라이언트 -> 서버
  'overlay.update': {
    elementId: string;
    properties: OverlayProperties;
  };
  
  'camera.switch': {
    cameraId: number;
  };
  
  'graphics.show': {
    graphicId: string;
    duration?: number;
  };
}

// WebSocket 연결 예시
const ws = new WebSocket('wss://api.ggp-gfx.com/ws');

ws.on('game.state.update', (data) => {
  updateGameDisplay(data.state);
});

ws.send('overlay.update', {
  elementId: 'player-1-stats',
  properties: {
    visible: true,
    opacity: 0.9
  }
});
```

## 5. 플러그인 시스템

### 5.1 플러그인 API

```python
from ggpgfx import Plugin, hooks

class CustomPokerPlugin(Plugin):
    """커스텀 포커 플러그인 예시"""
    
    metadata = {
        'name': 'Custom Poker Graphics',
        'version': '1.0.0',
        'author': 'Your Name',
        'description': 'Custom graphics for poker games'
    }
    
    def __init__(self):
        super().__init__()
        self.config = self.load_config()
    
    @hooks.on('hand.start')
    def on_hand_start(self, context):
        """핸드 시작 시 호출"""
        players = context.get_players()
        
        # 커스텀 애니메이션 표시
        self.show_animation('hand_start', {
            'players': players,
            'pot': 0
        })
    
    @hooks.on('player.win')
    def on_player_win(self, context):
        """플레이어 승리 시 호출"""
        winner = context.winner
        pot = context.pot
        
        # 승리 이펙트 표시
        self.create_particle_effect(
            position=winner.position,
            type='confetti',
            duration=3.0
        )
        
        # 커스텀 사운드 재생
        self.play_sound('victory.mp3')
    
    @hooks.on('overlay.render')
    def render_overlay(self, context):
        """오버레이 렌더링"""
        canvas = context.canvas
        
        # 커스텀 HUD 그리기
        self.draw_custom_hud(canvas)
        
        # 통계 표시
        if self.config.get('show_stats'):
            self.draw_statistics(canvas)
    
    def draw_custom_hud(self, canvas):
        """커스텀 HUD 렌더링"""
        # 플레이어 정보 박스
        for player in self.get_active_players():
            box = self.create_player_box(player)
            canvas.draw(box, position=player.hud_position)
    
    def draw_statistics(self, canvas):
        """통계 오버레이"""
        stats = self.calculate_statistics()
        
        stats_panel = self.create_panel({
            'title': 'Game Statistics',
            'data': stats,
            'style': self.config.get('stats_style')
        })
        
        canvas.draw(stats_panel, position='top-right')
```

### 5.2 플러그인 매니페스트

```json
{
  "manifest_version": 2,
  "plugin": {
    "name": "Custom Poker Graphics",
    "version": "1.0.0",
    "description": "Advanced poker graphics and animations",
    "author": "Your Name",
    "license": "MIT"
  },
  "requirements": {
    "ggpgfx_version": ">=1.0.0",
    "python": ">=3.8"
  },
  "permissions": [
    "overlay.render",
    "audio.play",
    "graphics.animate",
    "game.state.read"
  ],
  "assets": {
    "animations": [
      "assets/animations/hand_start.json",
      "assets/animations/showdown.json"
    ],
    "sounds": [
      "assets/sounds/victory.mp3",
      "assets/sounds/chip_move.wav"
    ],
    "images": [
      "assets/images/custom_cards.png",
      "assets/images/chip_stacks.png"
    ]
  },
  "config_schema": {
    "type": "object",
    "properties": {
      "show_stats": {
        "type": "boolean",
        "default": true
      },
      "stats_style": {
        "type": "string",
        "enum": ["minimal", "detailed", "professional"],
        "default": "professional"
      },
      "animation_speed": {
        "type": "number",
        "minimum": 0.5,
        "maximum": 2.0,
        "default": 1.0
      }
    }
  }
}
```

## 6. 성능 최적화

### 6.1 GPU 최적화

```cpp
class GPUOptimizer {
private:
    struct PerformanceMetrics {
        float gpu_utilization;
        float memory_usage;
        float temperature;
        int frame_time_ms;
    };
    
public:
    void OptimizePipeline(GPUPipeline& pipeline) {
        auto metrics = GetCurrentMetrics();
        
        // 동적 해상도 스케일링
        if (metrics.frame_time_ms > 16) { // 60fps 미달
            float scale = 16.0f / metrics.frame_time_ms;
            pipeline.SetRenderScale(scale);
        }
        
        // 워크로드 밸런싱
        if (metrics.gpu_utilization > 90) {
            pipeline.EnableMultiGPU();
            pipeline.DistributeWorkload();
        }
        
        // 메모리 최적화
        if (metrics.memory_usage > 0.8) {
            pipeline.CompressTextures();
            pipeline.ReleaseUnusedResources();
        }
    }
    
    // 적응형 품질 설정
    void AdaptiveQuality(RenderSettings& settings) {
        auto fps = GetCurrentFPS();
        
        if (fps < settings.target_fps * 0.9) {
            // 품질 낮추기
            settings.shadow_quality--;
            settings.texture_quality--;
            settings.effect_quality--;
        } else if (fps > settings.target_fps * 1.1) {
            // 품질 높이기
            settings.shadow_quality++;
            settings.texture_quality++;
            settings.effect_quality++;
        }
    }
};
```

### 6.2 메모리 관리

```cpp
class MemoryPool {
private:
    struct Block {
        void* ptr;
        size_t size;
        bool in_use;
    };
    
    std::vector<Block> blocks;
    std::mutex pool_mutex;
    
public:
    void* Allocate(size_t size) {
        std::lock_guard<std::mutex> lock(pool_mutex);
        
        // 재사용 가능한 블록 찾기
        for (auto& block : blocks) {
            if (!block.in_use && block.size >= size) {
                block.in_use = true;
                return block.ptr;
            }
        }
        
        // 새 블록 할당
        void* ptr = AllocateGPUMemory(size);
        blocks.push_back({ptr, size, true});
        return ptr;
    }
    
    void Deallocate(void* ptr) {
        std::lock_guard<std::mutex> lock(pool_mutex);
        
        for (auto& block : blocks) {
            if (block.ptr == ptr) {
                block.in_use = false;
                return;
            }
        }
    }
    
    void Defragment() {
        // 메모리 조각화 정리
        CompactMemory();
    }
};
```

## 7. 보안 구현

### 7.1 라이선스 보호

```rust
use aes_gcm::{Aes256Gcm, Key, Nonce};
use uuid::Uuid;

pub struct LicenseManager {
    hardware_id: String,
    license_server: String,
}

impl LicenseManager {
    pub fn validate_license(&self, license_key: &str) -> Result<License, Error> {
        // 하드웨어 ID 생성
        let hw_id = self.generate_hardware_id();
        
        // 라이선스 서버 검증
        let response = self.verify_with_server(license_key, &hw_id)?;
        
        // 로컬 검증
        if !self.verify_signature(&response) {
            return Err(Error::InvalidLicense);
        }
        
        // 라이선스 정보 복호화
        let license = self.decrypt_license(&response.data)?;
        
        Ok(license)
    }
    
    fn generate_hardware_id(&self) -> String {
        // CPU ID + GPU ID + MAC 주소 조합
        let cpu_id = get_cpu_id();
        let gpu_id = get_gpu_id();
        let mac = get_mac_address();
        
        let combined = format!("{}-{}-{}", cpu_id, gpu_id, mac);
        hash_sha256(&combined)
    }
    
    fn encrypt_communication(&self, data: &[u8]) -> Vec<u8> {
        let key = Key::from_slice(b"your-32-byte-secret-key-here!!");
        let cipher = Aes256Gcm::new(key);
        let nonce = Nonce::from_slice(b"unique-nonce");
        
        cipher.encrypt(nonce, data).expect("encryption failure")
    }
}
```

### 7.2 스트림 보안

```python
class StreamSecurity:
    def __init__(self):
        self.watermark_engine = WatermarkEngine()
        self.encryption = StreamEncryption()
        
    def apply_invisible_watermark(self, frame: np.ndarray, 
                                 user_id: str) -> np.ndarray:
        """보이지 않는 워터마크 삽입"""
        # DCT 변환
        dct = cv2.dct(np.float32(frame) / 255.0)
        
        # 워터마크 데이터 인코딩
        watermark_data = self.encode_user_data(user_id)
        
        # 중간 주파수 대역에 삽입
        for i, bit in enumerate(watermark_data):
            x, y = self.get_embed_position(i)
            if bit == 1:
                dct[x, y] += 0.1
            else:
                dct[x, y] -= 0.1
        
        # 역변환
        idct = cv2.idct(dct)
        watermarked = np.uint8(idct * 255)
        
        return watermarked
    
    def detect_watermark(self, frame: np.ndarray) -> str:
        """워터마크 검출"""
        dct = cv2.dct(np.float32(frame) / 255.0)
        
        watermark_bits = []
        for i in range(self.watermark_length):
            x, y = self.get_embed_position(i)
            if dct[x, y] > 0:
                watermark_bits.append(1)
            else:
                watermark_bits.append(0)
        
        return self.decode_user_data(watermark_bits)
```

## 8. 테스트 전략

### 8.1 단위 테스트

```python
import pytest
from ggpgfx.core import GameTracker, Card

class TestGameTracker:
    @pytest.fixture
    def tracker(self):
        return GameTracker()
    
    def test_card_detection(self, tracker):
        # 테스트 이미지 로드
        test_frame = load_test_image('poker_table.jpg')
        
        # 카드 감지
        cards = tracker.detect_cards(test_frame)
        
        # 검증
        assert len(cards) == 5  # 보드에 5장
        assert cards[0] == Card('A', 'spades')
        assert cards[1] == Card('K', 'hearts')
    
    def test_chip_counting(self, tracker):
        test_frame = load_test_image('chip_stack.jpg')
        
        count = tracker.count_chips(test_frame)
        
        assert count == 5750  # 예상 칩 수
        assert tracker.confidence > 0.95
    
    @pytest.mark.parametrize("action,expected", [
        ("fold_gesture.jpg", "fold"),
        ("raise_gesture.jpg", "raise"),
        ("check_gesture.jpg", "check"),
    ])
    def test_action_recognition(self, tracker, action, expected):
        test_frame = load_test_image(action)
        
        detected_action = tracker.recognize_action(test_frame)
        
        assert detected_action == expected
```

### 8.2 통합 테스트

```python
class TestStreamingIntegration:
    @pytest.fixture
    def streaming_engine(self):
        return StreamingEngine(test_mode=True)
    
    async def test_multi_platform_streaming(self, streaming_engine):
        # 테스트 스트림 설정
        config = MultiStreamConfig(
            platforms=[
                Platform('twitch', test_endpoint='rtmp://test.twitch.tv'),
                Platform('youtube', test_endpoint='rtmp://test.youtube.com'),
            ],
            resolution='1920x1080',
            bitrate=6000,
            fps=60
        )
        
        # 스트리밍 시작
        await streaming_engine.start(config)
        
        # 30초 동안 스트리밍
        await asyncio.sleep(30)
        
        # 메트릭 확인
        metrics = streaming_engine.get_metrics()
        assert metrics.dropped_frames < 10
        assert metrics.average_fps > 59
        assert all(p.is_connected for p in metrics.platforms)
        
        # 스트리밍 중지
        await streaming_engine.stop()
```

### 8.3 성능 테스트

```python
class TestPerformance:
    def test_gpu_pipeline_throughput(self):
        pipeline = GPUPipeline()
        
        # 4K 프레임 1000개 처리
        frames = generate_test_frames(1000, resolution='3840x2160')
        
        start_time = time.time()
        for frame in frames:
            pipeline.process(frame)
        end_time = time.time()
        
        # 성능 검증
        processing_time = end_time - start_time
        fps = 1000 / processing_time
        
        assert fps > 60  # 최소 60fps
        assert pipeline.gpu_usage < 80  # GPU 사용률 80% 미만
        assert pipeline.memory_usage < 4096  # 4GB 미만
```

## 9. 배포 및 CI/CD

### 9.1 Docker 구성

```dockerfile
# Base image
FROM nvidia/cuda:12.0-runtime-ubuntu22.04

# Dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    python3.11 \
    ffmpeg \
    libvulkan1 \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Application
COPY . /app
WORKDIR /app

# Build
RUN mkdir build && cd build && \
    cmake .. -DCMAKE_BUILD_TYPE=Release && \
    make -j$(nproc)

# Entry point
CMD ["./build/ggp-gfx-server"]
```

### 9.2 Kubernetes 배포

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ggp-gfx-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ggp-gfx
  template:
    metadata:
      labels:
        app: ggp-gfx
    spec:
      containers:
      - name: ggp-gfx
        image: ggpgfx/server:latest
        resources:
          requests:
            memory: "4Gi"
            cpu: "2"
            nvidia.com/gpu: 1
          limits:
            memory: "8Gi"
            cpu: "4"
            nvidia.com/gpu: 1
        ports:
        - containerPort: 8000
        - containerPort: 1935
        env:
        - name: LICENSE_SERVER
          value: "https://license.ggp-gfx.com"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
---
apiVersion: v1
kind: Service
metadata:
  name: ggp-gfx-service
spec:
  selector:
    app: ggp-gfx
  ports:
  - name: api
    port: 8000
    targetPort: 8000
  - name: rtmp
    port: 1935
    targetPort: 1935
  type: LoadBalancer
```

## 10. 모니터링 및 로깅

### 10.1 Prometheus 메트릭

```python
from prometheus_client import Counter, Histogram, Gauge

# 메트릭 정의
frames_processed = Counter('ggpgfx_frames_processed_total', 
                         'Total frames processed')
processing_time = Histogram('ggpgfx_processing_time_seconds',
                          'Frame processing time')
active_streams = Gauge('ggpgfx_active_streams',
                      'Number of active streams')
gpu_utilization = Gauge('ggpgfx_gpu_utilization_percent',
                       'GPU utilization percentage')

# 메트릭 수집
class MetricsCollector:
    def collect_metrics(self):
        # GPU 메트릭
        gpu_stats = self.get_gpu_stats()
        gpu_utilization.set(gpu_stats.utilization)
        
        # 스트림 메트릭
        active_streams.set(self.get_active_stream_count())
        
        # 처리 시간 추적
        with processing_time.time():
            self.process_frame()
        
        frames_processed.inc()
```

### 10.2 로깅 시스템

```python
import structlog

# 구조화된 로깅 설정
logger = structlog.get_logger()

class StreamingLogger:
    def log_stream_event(self, event_type: str, **kwargs):
        logger.info(
            "stream_event",
            event_type=event_type,
            timestamp=time.time(),
            **kwargs
        )
    
    def log_error(self, error: Exception, context: dict):
        logger.error(
            "stream_error",
            error_type=type(error).__name__,
            error_message=str(error),
            traceback=traceback.format_exc(),
            context=context
        )
    
    def log_performance(self, metrics: dict):
        logger.info(
            "performance_metrics",
            fps=metrics.get('fps'),
            latency_ms=metrics.get('latency'),
            cpu_usage=metrics.get('cpu_usage'),
            gpu_usage=metrics.get('gpu_usage'),
            memory_mb=metrics.get('memory_usage')
        )
```

---

이 기술 명세서는 GGP-GFX의 핵심 기술 구현을 상세히 다룹니다. 각 모듈은 독립적으로 개발 및 테스트가 가능하며, 전체 시스템은 마이크로서비스 아키텍처로 확장 가능합니다.