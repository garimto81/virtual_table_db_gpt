# GGP-GFX 기술 명세

## 목차
1. [핵심 기술 스택](#핵심-기술-스택)
2. [비디오 처리 모듈](#비디오-처리-모듈)
3. [AI/ML 모듈](#aiml-모듈)
4. [그래픽 엔진](#그래픽-엔진)
5. [스트리밍 인프라스트럭처](#스트리밍-인프라스트럭처)
6. [데이터베이스 설계](#데이터베이스-설계)
7. [API 명세](#api-명세)
8. [보안 구현](#보안-구현)

## 핵심 기술 스택

### 프로그래밍 언어

```yaml
성능 중요 컴포넌트:
  - 비디오 처리: C++20 with CUDA/Vulkan
  - 그래픽 엔진: C++ with Vulkan/DirectX 12
  - 스트림 처리: Rust for memory safety
  - 실시간 시스템: C++ with lock-free algorithms

AI/ML 컴포넌트:
  - ML 모델: Python 3.11 with PyTorch 2.0
  - 컴퓨터 비전: Python with OpenCV/C++ bindings
  - 훈련 파이프라인: Python with Kubeflow
  - 추론: C++ with TensorRT/ONNX Runtime

서비스 계층:
  - API 게이트웨이: Go 1.21 for performance
  - 마이크로서비스: 혼합 (Go, Rust, Java, Node.js)
  - 웹 서비스: TypeScript with Node.js 20
  - 분석: Python with Apache Spark

클라이언트 애플리케이션:
  - 데스크톱: TypeScript with Electron + React
  - 웹: TypeScript with Next.js 14
  - 모바일: TypeScript with React Native
  - 플러그인: C++ with SDK bindings
```

### 핵심 라이브러리 및 프레임워크

```yaml
비디오/오디오:
  - FFmpeg 6.0: 미디어 처리
  - GStreamer 1.22: 파이프라인 처리
  - x264/x265: 비디오 인코딩
  - Opus/AAC: 오디오 코덱

그래픽:
  - Vulkan 1.3: 크로스 플랫폼 그래픽
  - DirectX 12: Windows 최적화
  - OpenGL 4.6: 레거시 지원
  - Skia: 2D 그래픽 렌더링

AI/ML:
  - PyTorch 2.0: 딥러닝
  - TensorFlow 2.13: 대안 ML
  - ONNX Runtime: 모델 배포
  - OpenCV 4.8: 컴퓨터 비전

네트워킹:
  - WebRTC: 실시간 통신
  - gRPC: 서비스 통신
  - libsrt: 보안 신뢰성 전송
  - ZeroMQ: 고성능 메시징
```

## 비디오 처리 모듈

### 아키텍처 개요

```cpp
namespace GGP::Video {

class VideoProcessor {
public:
    struct Config {
        Resolution inputResolution;
        Resolution outputResolution;
        PixelFormat format;
        ColorSpace colorSpace;
        FrameRate targetFPS;
        GPUDevice* device;
    };

    class Pipeline {
    public:
        void addSource(std::unique_ptr<VideoSource> source);
        void addFilter(std::unique_ptr<VideoFilter> filter);
        void addOutput(std::unique_ptr<VideoOutput> output);
        void process(Frame& frame);
    };

private:
    std::vector<std::unique_ptr<Pipeline>> pipelines_;
    ThreadPool processingPool_;
    GPUContext gpuContext_;
};

} // namespace GGP::Video
```

### 비디오 입력 시스템

```cpp
class VideoInputManager {
public:
    enum class SourceType {
        USB_CAMERA,
        CAPTURE_CARD,
        NDI_STREAM,
        RTSP_STREAM,
        SRT_STREAM,
        FILE_INPUT,
        SCREEN_CAPTURE,
        VIRTUAL_CAMERA
    };

    struct SourceCapabilities {
        std::vector<Resolution> supportedResolutions;
        std::vector<FrameRate> supportedFrameRates;
        std::vector<PixelFormat> supportedFormats;
        bool hasAudio;
        bool hasHardwareAcceleration;
    };

    std::vector<VideoSource> discoverSources();
    SourceCapabilities getCapabilities(const VideoSource& source);
    std::unique_ptr<InputStream> createStream(const VideoSource& source);
};
```

### GPU 가속 처리

```cuda
// 실시간 색상 보정을 위한 CUDA 커널
__global__ void colorCorrection(
    const uint8_t* input,
    uint8_t* output,
    const ColorMatrix* matrix,
    int width,
    int height)
{
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    
    if (x < width && y < height) {
        int idx = (y * width + x) * 4; // RGBA
        
        float3 color = make_float3(
            input[idx] / 255.0f,
            input[idx + 1] / 255.0f,
            input[idx + 2] / 255.0f
        );
        
        // 색상 매트릭스 변환 적용
        color = matrix->transform(color);
        
        output[idx] = clamp(color.x * 255.0f, 0.0f, 255.0f);
        output[idx + 1] = clamp(color.y * 255.0f, 0.0f, 255.0f);
        output[idx + 2] = clamp(color.z * 255.0f, 0.0f, 255.0f);
        output[idx + 3] = input[idx + 3]; // Alpha
    }
}
```

### 비디오 파이프라인 아키텍처

```yaml
입력 단계:
  - 소스 감지 및 초기화
  - 형식 협상
  - 하드웨어 디코더 설정
  - 버퍼 할당

처리 단계:
  - 디인터레이싱 (필요시)
  - 색공간 변환
  - 노이즈 감소
  - 해상도 스케일링
  - 프레임 레이트 변환
  - 효과 적용

출력 단계:
  - 인코더 구성
  - 비트레이트 제어
  - 멀티플렉싱
  - 스트림 패키징
  - 버퍼 관리
```

## AI/ML 모듈

### 컴퓨터 비전 파이프라인

```python
class GameStateDetector:
    def __init__(self):
        self.card_detector = CardDetectionModel()
        self.chip_counter = ChipCountingModel()
        self.player_tracker = PlayerTrackingModel()
        self.action_classifier = ActionClassificationModel()
        
    async def process_frame(self, frame: np.ndarray) -> GameState:
        # 효율성을 위한 병렬 처리
        tasks = [
            self._detect_cards(frame),
            self._count_chips(frame),
            self._track_players(frame),
            self._classify_actions(frame)
        ]
        
        results = await asyncio.gather(*tasks)
        
        return GameState(
            cards=results[0],
            chips=results[1],
            players=results[2],
            actions=results[3],
            timestamp=time.time()
        )
    
    async def _detect_cards(self, frame: np.ndarray) -> List[Card]:
        # YOLO 기반 감지
        detections = await self.card_detector.detect_async(frame)
        
        cards = []
        for det in detections:
            if det.confidence > 0.95:
                card = await self._classify_card(det.crop(frame))
                cards.append(card)
                
        return cards
```

### ML 모델 아키텍처

```python
class CardDetectionModel(nn.Module):
    """
    카드 감지를 위한 커스텀 CNN 아키텍처
    실시간 추론에 최적화
    """
    def __init__(self):
        super().__init__()
        
        # 백본: 효율성을 위한 MobileNetV3
        self.backbone = timm.create_model(
            'mobilenetv3_large_100',
            pretrained=True,
            features_only=True
        )
        
        # 다중 스케일 감지를 위한 FPN
        self.fpn = FeaturePyramidNetwork(
            in_channels_list=[40, 112, 160],
            out_channels=256
        )
        
        # 감지 헤드
        self.classification_head = nn.Sequential(
            nn.Conv2d(256, 256, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, num_classes, 1)
        )
        
        self.regression_head = nn.Sequential(
            nn.Conv2d(256, 256, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, 4, 1)  # bbox 좌표
        )
    
    def forward(self, x):
        # 다중 스케일 피처 추출
        features = self.backbone(x)
        
        # 피처 피라미드 구축
        pyramid = self.fpn(features)
        
        # 예측 생성
        classifications = []
        regressions = []
        
        for feat in pyramid.values():
            classifications.append(
                self.classification_head(feat)
            )
            regressions.append(
                self.regression_head(feat)
            )
        
        return classifications, regressions
```

### 훈련 파이프라인

```python
class ModelTrainer:
    def __init__(self, config: TrainingConfig):
        self.config = config
        self.model = self._build_model()
        self.optimizer = self._build_optimizer()
        self.scheduler = self._build_scheduler()
        self.loss_fn = self._build_loss_function()
        
    def train_epoch(self, dataloader):
        self.model.train()
        total_loss = 0
        
        for batch_idx, (data, targets) in enumerate(dataloader):
            data, targets = data.cuda(), targets.cuda()
            
            # 순전파
            predictions = self.model(data)
            loss = self.loss_fn(predictions, targets)
            
            # 역전파
            self.optimizer.zero_grad()
            loss.backward()
            
            # 그래디언트 클리핑
            torch.nn.utils.clip_grad_norm_(
                self.model.parameters(), 
                max_norm=1.0
            )
            
            self.optimizer.step()
            total_loss += loss.item()
            
            # 로깅
            if batch_idx % 100 == 0:
                self.log_metrics({
                    'loss': loss.item(),
                    'lr': self.scheduler.get_last_lr()[0]
                })
        
        return total_loss / len(dataloader)
```

## 그래픽 엔진

### Vulkan 기반 렌더링

```cpp
class VulkanRenderer {
public:
    struct RenderConfig {
        VkFormat colorFormat;
        VkFormat depthFormat;
        uint32_t width;
        uint32_t height;
        bool enableMSAA;
        uint32_t sampleCount;
    };

    class RenderPass {
    public:
        void begin(VkCommandBuffer cmdBuffer);
        void end(VkCommandBuffer cmdBuffer);
        void bindPipeline(VkPipeline pipeline);
        void bindDescriptorSets(
            VkPipelineLayout layout,
            const std::vector<VkDescriptorSet>& sets
        );
        void draw(uint32_t vertexCount, uint32_t instanceCount = 1);
    };

private:
    VkDevice device_;
    VkQueue graphicsQueue_;
    VkCommandPool commandPool_;
    std::vector<VkCommandBuffer> commandBuffers_;
    VkSwapchainKHR swapchain_;
};
```

### 셰이더 시스템

```glsl
// 버텍스 셰이더
#version 450

layout(location = 0) in vec3 inPosition;
layout(location = 1) in vec2 inTexCoord;
layout(location = 2) in vec3 inNormal;

layout(location = 0) out vec2 fragTexCoord;
layout(location = 1) out vec3 fragNormal;
layout(location = 2) out vec3 fragWorldPos;

layout(binding = 0) uniform UniformBufferObject {
    mat4 model;
    mat4 view;
    mat4 projection;
    mat4 normal;
} ubo;

void main() {
    vec4 worldPos = ubo.model * vec4(inPosition, 1.0);
    gl_Position = ubo.projection * ubo.view * worldPos;
    
    fragTexCoord = inTexCoord;
    fragNormal = mat3(ubo.normal) * inNormal;
    fragWorldPos = worldPos.xyz;
}

// 프래그먼트 셰이더
#version 450

layout(location = 0) in vec2 fragTexCoord;
layout(location = 1) in vec3 fragNormal;
layout(location = 2) in vec3 fragWorldPos;

layout(location = 0) out vec4 outColor;

layout(binding = 1) uniform sampler2D texSampler;
layout(binding = 2) uniform LightingUBO {
    vec3 lightPos;
    vec3 lightColor;
    vec3 viewPos;
} lighting;

void main() {
    // 기본 조명 계산
    vec3 normal = normalize(fragNormal);
    vec3 lightDir = normalize(lighting.lightPos - fragWorldPos);
    vec3 viewDir = normalize(lighting.viewPos - fragWorldPos);
    
    // Diffuse
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * lighting.lightColor;
    
    // Specular
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32);
    vec3 specular = spec * lighting.lightColor;
    
    // 최종 색상
    vec3 textureColor = texture(texSampler, fragTexCoord).rgb;
    vec3 finalColor = (diffuse + specular) * textureColor;
    
    outColor = vec4(finalColor, 1.0);
}
```

### 애니메이션 시스템

```cpp
class AnimationSystem {
public:
    enum class EasingType {
        Linear,
        EaseIn,
        EaseOut,
        EaseInOut,
        Bounce,
        Elastic
    };

    template<typename T>
    class Tween {
    public:
        Tween(T startValue, T endValue, float duration, EasingType easing)
            : startValue_(startValue)
            , endValue_(endValue) 
            , duration_(duration)
            , easing_(easing)
            , currentTime_(0.0f) {}

        T getValue() const {
            float t = currentTime_ / duration_;
            t = applyEasing(t, easing_);
            return lerp(startValue_, endValue_, t);
        }

        void update(float deltaTime) {
            currentTime_ = std::min(currentTime_ + deltaTime, duration_);
        }

        bool isComplete() const {
            return currentTime_ >= duration_;
        }

    private:
        T startValue_;
        T endValue_;
        float duration_;
        float currentTime_;
        EasingType easing_;

        float applyEasing(float t, EasingType type) const;
        T lerp(const T& a, const T& b, float t) const;
    };

    void update(float deltaTime);
    void addTween(std::unique_ptr<TweenBase> tween);
};
```

## 스트리밍 인프라스트럭처

### 스트림 관리자

```go
package streaming

import (
    "context"
    "sync"
    "github.com/pion/webrtc/v3"
)

type StreamManager struct {
    mu      sync.RWMutex
    streams map[string]*Stream
    config  *Config
}

type Stream struct {
    ID          string
    Protocol    Protocol
    Quality     QualitySettings
    Destination []Endpoint
    Health      HealthMetrics
    encoder     *Encoder
    mu          sync.RWMutex
}

type Protocol int

const (
    ProtocolRTMP Protocol = iota
    ProtocolSRT
    ProtocolWebRTC
    ProtocolHLS
    ProtocolDASH
)

func (sm *StreamManager) CreateStream(ctx context.Context, req *CreateStreamRequest) (*Stream, error) {
    sm.mu.Lock()
    defer sm.mu.Unlock()
    
    stream := &Stream{
        ID:          generateStreamID(),
        Protocol:    req.Protocol,
        Quality:     req.Quality,
        Destination: req.Destinations,
        Health:      NewHealthMetrics(),
    }
    
    // 인코더 설정
    encoder, err := NewEncoder(stream.Quality)
    if err != nil {
        return nil, fmt.Errorf("failed to create encoder: %w", err)
    }
    stream.encoder = encoder
    
    sm.streams[stream.ID] = stream
    
    // 스트림 시작
    go stream.start(ctx)
    
    return stream, nil
}

func (s *Stream) start(ctx context.Context) {
    defer s.cleanup()
    
    for {
        select {
        case <-ctx.Done():
            return
        case frame := <-s.inputChannel:
            if err := s.processFrame(frame); err != nil {
                log.Errorf("Failed to process frame: %v", err)
                s.Health.RecordError(err)
            }
        }
    }
}
```

### WebRTC 구현

```typescript
class WebRTCStreamer {
    private peerConnection: RTCPeerConnection;
    private dataChannel: RTCDataChannel;
    private mediaStream: MediaStream;

    constructor(private config: WebRTCConfig) {
        this.peerConnection = new RTCPeerConnection({
            iceServers: config.iceServers,
            iceCandidatePoolSize: 10,
        });

        this.setupPeerConnection();
    }

    private setupPeerConnection(): void {
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendSignalingMessage({
                    type: 'ice-candidate',
                    candidate: event.candidate,
                });
            }
        };

        this.peerConnection.ontrack = (event) => {
            const [remoteStream] = event.streams;
            this.onRemoteStream?.(remoteStream);
        };

        this.peerConnection.ondatachannel = (event) => {
            const channel = event.channel;
            this.setupDataChannel(channel);
        };
    }

    async startStreaming(stream: MediaStream): Promise<void> {
        this.mediaStream = stream;

        // 트랙 추가
        stream.getTracks().forEach((track) => {
            this.peerConnection.addTrack(track, stream);
        });

        // 데이터 채널 생성
        this.dataChannel = this.peerConnection.createDataChannel('gameData', {
            ordered: true,
        });
        this.setupDataChannel(this.dataChannel);

        // 오퍼 생성
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        this.sendSignalingMessage({
            type: 'offer',
            offer: offer,
        });
    }

    async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
        await this.peerConnection.setRemoteDescription(answer);
    }

    async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
        await this.peerConnection.addIceCandidate(candidate);
    }

    sendGameData(data: any): void {
        if (this.dataChannel?.readyState === 'open') {
            this.dataChannel.send(JSON.stringify(data));
        }
    }

    private setupDataChannel(channel: RTCDataChannel): void {
        channel.onopen = () => {
            console.log('Data channel opened');
        };

        channel.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.onGameData?.(data);
            } catch (error) {
                console.error('Failed to parse game data:', error);
            }
        };
    }
}
```

## 데이터베이스 설계

### PostgreSQL 스키마

```sql
-- 사용자 테이블
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false
);

-- 프로젝트 테이블
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    settings JSONB NOT NULL DEFAULT '{}',
    thumbnail_url TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 스트림 테이블
CREATE TABLE streams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    protocol VARCHAR(50) NOT NULL,
    endpoint_url TEXT NOT NULL,
    stream_key VARCHAR(255),
    quality_settings JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'stopped',
    started_at TIMESTAMP WITH TIME ZONE,
    stopped_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 애셋 테이블
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'image', 'video', 'audio', 'template'
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_updated_at ON projects(updated_at);
CREATE INDEX idx_streams_project_id ON streams(project_id);
CREATE INDEX idx_streams_status ON streams(status);
CREATE INDEX idx_assets_project_id ON assets(project_id);
CREATE INDEX idx_assets_type ON assets(type);
```

### MongoDB 스키마

```javascript
// 템플릿 컬렉션
db.templates.createIndex({ "category": 1, "game_type": 1 });
db.templates.createIndex({ "tags": 1 });
db.templates.createIndex({ "rating": -1 });

// 템플릿 문서 예시
{
  "_id": ObjectId("..."),
  "name": "Poker Tournament Overlay",
  "description": "Professional poker tournament overlay with player stats",
  "category": "overlay",
  "game_type": "poker",
  "tags": ["tournament", "poker", "professional"],
  "author": {
    "user_id": "uuid-here",
    "name": "Template Creator"
  },
  "rating": 4.8,
  "downloads": 15420,
  "price": 29.99,
  "preview_images": [
    "https://cdn.ggp-gfx.com/templates/poker-tournament/preview1.jpg",
    "https://cdn.ggp-gfx.com/templates/poker-tournament/preview2.jpg"
  ],
  "config_schema": {
    "type": "object",
    "properties": {
      "tournament_name": {
        "type": "string",
        "title": "Tournament Name",
        "default": "My Tournament"
      },
      "blind_levels": {
        "type": "array",
        "title": "Blind Levels",
        "items": {
          "type": "object",
          "properties": {
            "small_blind": {"type": "number"},
            "big_blind": {"type": "number"},
            "ante": {"type": "number", "default": 0}
          }
        }
      }
    }
  },
  "assets": [
    {
      "name": "background.png",
      "path": "/assets/backgrounds/poker-tournament-bg.png",
      "type": "image"
    },
    {
      "name": "player-card.json",
      "path": "/assets/components/player-card.json",
      "type": "component"
    }
  ],
  "created_at": ISODate("2024-01-15T10:30:00Z"),
  "updated_at": ISODate("2024-01-15T10:30:00Z")
}

// 사용자 설정 컬렉션
db.user_settings.createIndex({ "user_id": 1 });

{
  "_id": ObjectId("..."),
  "user_id": "uuid-here",
  "preferences": {
    "theme": "dark",
    "language": "en",
    "auto_save_interval": 30,
    "default_quality": "1080p",
    "hardware_acceleration": true
  },
  "shortcuts": {
    "start_stream": "F1",
    "stop_stream": "F2",
    "switch_scene": "Space",
    "toggle_recording": "F3"
  },
  "integrations": {
    "twitch": {
      "enabled": true,
      "channel_name": "user_channel",
      "auth_token": "encrypted_token"
    },
    "youtube": {
      "enabled": false
    }
  },
  "created_at": ISODate("2024-01-15T10:30:00Z"),
  "updated_at": ISODate("2024-01-15T10:30:00Z")
}
```

## API 명세

### GraphQL 스키마

```graphql
# 스칼라 타입
scalar DateTime
scalar JSON
scalar Upload

# 사용자 타입
type User {
  id: ID!
  email: String!
  username: String!
  firstName: String
  lastName: String
  avatarUrl: String
  subscriptionTier: SubscriptionTier!
  createdAt: DateTime!
  updatedAt: DateTime!
  projects: [Project!]!
}

# 프로젝트 타입
type Project {
  id: ID!
  name: String!
  description: String
  settings: JSON!
  thumbnailUrl: String
  isPublic: Boolean!
  owner: User!
  collaborators: [User!]!
  streams: [Stream!]!
  assets: [Asset!]!
  createdAt: DateTime!
  updatedAt: DateTime!
  lastAccessedAt: DateTime!
}

# 스트림 타입
type Stream {
  id: ID!
  name: String!
  protocol: StreamProtocol!
  endpointUrl: String!
  qualitySettings: JSON!
  status: StreamStatus!
  health: StreamHealth
  startedAt: DateTime
  stoppedAt: DateTime
  project: Project!
}

# 열거형
enum SubscriptionTier {
  FREE
  BASIC
  PRO
  ENTERPRISE
}

enum StreamProtocol {
  RTMP
  SRT
  WEBRTC
  HLS
  DASH
}

enum StreamStatus {
  STOPPED
  STARTING
  STREAMING
  ERROR
}

# 쿼리
type Query {
  # 사용자
  me: User
  user(id: ID!): User
  
  # 프로젝트
  project(id: ID!): Project
  projects(
    filter: ProjectFilter
    sort: ProjectSort
    limit: Int = 20
    offset: Int = 0
  ): ProjectConnection!
  
  # 스트림
  stream(id: ID!): Stream
  streams(projectId: ID!): [Stream!]!
  
  # 템플릿
  templates(
    category: String
    gameType: String
    search: String
    limit: Int = 20
    offset: Int = 0
  ): TemplateConnection!
}

# 뮤테이션
type Mutation {
  # 인증
  login(email: String!, password: String!): AuthPayload!
  register(input: RegisterInput!): AuthPayload!
  logout: Boolean!
  
  # 프로젝트
  createProject(input: CreateProjectInput!): Project!
  updateProject(id: ID!, input: UpdateProjectInput!): Project!
  deleteProject(id: ID!): Boolean!
  
  # 스트림
  startStream(id: ID!, settings: StreamSettings): Stream!
  stopStream(id: ID!): Stream!
  updateStreamSettings(id: ID!, settings: StreamSettings!): Stream!
  
  # 애셋
  uploadAsset(
    projectId: ID!
    file: Upload!
    name: String
  ): Asset!
  deleteAsset(id: ID!): Boolean!
}

# 구독
type Subscription {
  # 프로젝트 업데이트
  projectUpdated(projectId: ID!): Project!
  
  # 스트림 상태
  streamStatus(streamId: ID!): Stream!
  streamHealth(streamId: ID!): StreamHealth!
  
  # 렌더링 진행상황
  renderProgress(jobId: ID!): RenderProgress!
}
```

### REST API 엔드포인트

```yaml
# 인증 API
POST /api/v1/auth/login
POST /api/v1/auth/register  
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password

# 사용자 API
GET /api/v1/users/me
PUT /api/v1/users/me
GET /api/v1/users/{id}
PUT /api/v1/users/{id}/avatar
DELETE /api/v1/users/{id}

# 프로젝트 API
GET /api/v1/projects
POST /api/v1/projects
GET /api/v1/projects/{id}
PUT /api/v1/projects/{id}
DELETE /api/v1/projects/{id}
POST /api/v1/projects/{id}/duplicate
GET /api/v1/projects/{id}/collaborators
POST /api/v1/projects/{id}/collaborators
DELETE /api/v1/projects/{id}/collaborators/{userId}

# 스트림 API
GET /api/v1/streams
POST /api/v1/streams
GET /api/v1/streams/{id}
PUT /api/v1/streams/{id}
DELETE /api/v1/streams/{id}
POST /api/v1/streams/{id}/start
POST /api/v1/streams/{id}/stop
GET /api/v1/streams/{id}/health
GET /api/v1/streams/{id}/analytics

# 애셋 API
GET /api/v1/assets
POST /api/v1/assets
GET /api/v1/assets/{id}
PUT /api/v1/assets/{id}
DELETE /api/v1/assets/{id}
POST /api/v1/assets/upload
GET /api/v1/assets/{id}/download

# 템플릿 API
GET /api/v1/templates
GET /api/v1/templates/{id}
POST /api/v1/templates/{id}/install
GET /api/v1/templates/categories
GET /api/v1/templates/featured
```

## 보안 구현

### JWT 토큰 시스템

```typescript
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface JWTPayload {
    userId: string;
    email: string;
    subscriptionTier: string;
    permissions: string[];
    iat: number;
    exp: number;
}

class JWTService {
    private readonly accessTokenSecret: string;
    private readonly refreshTokenSecret: string;
    private readonly accessTokenTTL = 15 * 60; // 15분
    private readonly refreshTokenTTL = 7 * 24 * 60 * 60; // 7일

    constructor() {
        this.accessTokenSecret = process.env.JWT_ACCESS_SECRET!;
        this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET!;
    }

    generateTokenPair(userId: string, userData: any): TokenPair {
        const payload: Partial<JWTPayload> = {
            userId,
            email: userData.email,
            subscriptionTier: userData.subscriptionTier,
            permissions: userData.permissions
        };

        const accessToken = jwt.sign(
            payload,
            this.accessTokenSecret,
            { 
                expiresIn: this.accessTokenTTL,
                issuer: 'ggp-gfx',
                audience: 'ggp-gfx-users'
            }
        );

        const refreshToken = jwt.sign(
            { userId, tokenId: crypto.randomUUID() },
            this.refreshTokenSecret,
            { 
                expiresIn: this.refreshTokenTTL,
                issuer: 'ggp-gfx',
                audience: 'ggp-gfx-users'
            }
        );

        return { accessToken, refreshToken };
    }

    verifyAccessToken(token: string): JWTPayload | null {
        try {
            return jwt.verify(token, this.accessTokenSecret) as JWTPayload;
        } catch (error) {
            return null;
        }
    }

    verifyRefreshToken(token: string): any {
        try {
            return jwt.verify(token, this.refreshTokenSecret);
        } catch (error) {
            return null;
        }
    }
}
```

### 권한 기반 접근 제어

```typescript
enum Permission {
    // 프로젝트 권한
    PROJECT_CREATE = 'project:create',
    PROJECT_READ = 'project:read',
    PROJECT_UPDATE = 'project:update',
    PROJECT_DELETE = 'project:delete',
    
    // 스트림 권한
    STREAM_CREATE = 'stream:create',
    STREAM_START = 'stream:start',
    STREAM_STOP = 'stream:stop',
    
    // 관리자 권한
    ADMIN_USER_MANAGE = 'admin:user:manage',
    ADMIN_SYSTEM_CONFIG = 'admin:system:config'
}

class AuthorizationService {
    private readonly rolePermissions = new Map<string, Permission[]>([
        ['free', [
            Permission.PROJECT_CREATE,
            Permission.PROJECT_READ,
            Permission.STREAM_CREATE,
            Permission.STREAM_START
        ]],
        ['pro', [
            Permission.PROJECT_CREATE,
            Permission.PROJECT_READ,
            Permission.PROJECT_UPDATE,
            Permission.PROJECT_DELETE,
            Permission.STREAM_CREATE,
            Permission.STREAM_START,
            Permission.STREAM_STOP
        ]],
        ['admin', [
            ...Object.values(Permission)
        ]]
    ]);

    hasPermission(userRoles: string[], requiredPermission: Permission): boolean {
        for (const role of userRoles) {
            const permissions = this.rolePermissions.get(role) || [];
            if (permissions.includes(requiredPermission)) {
                return true;
            }
        }
        return false;
    }

    requirePermission(permission: Permission) {
        return (req: Request, res: Response, next: NextFunction) => {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            if (!this.hasPermission(user.roles, permission)) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            next();
        };
    }
}
```

### 데이터 암호화

```typescript
import crypto from 'crypto';

class EncryptionService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly keyDerivationSalt: Buffer;
    private readonly encryptionKey: Buffer;

    constructor() {
        this.keyDerivationSalt = Buffer.from(process.env.ENCRYPTION_SALT!, 'base64');
        this.encryptionKey = this.deriveKey(process.env.MASTER_KEY!);
    }

    private deriveKey(masterKey: string): Buffer {
        return crypto.pbkdf2Sync(
            masterKey,
            this.keyDerivationSalt,
            100000, // 반복 횟수
            32, // 키 길이
            'sha256'
        );
    }

    encrypt(plaintext: string): string {
        const iv = crypto.randomBytes(12); // GCM에서는 12바이트 IV 사용
        const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
        cipher.setAAD(Buffer.from('ggp-gfx')); // 추가 인증 데이터

        let encrypted = cipher.update(plaintext, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        const authTag = cipher.getAuthTag();

        // IV, 인증 태그, 암호문을 결합
        const result = Buffer.concat([
            iv,
            authTag,
            Buffer.from(encrypted, 'base64')
        ]);

        return result.toString('base64');
    }

    decrypt(encryptedData: string): string {
        const data = Buffer.from(encryptedData, 'base64');
        
        // IV, 인증 태그, 암호문 분리
        const iv = data.slice(0, 12);
        const authTag = data.slice(12, 28);
        const encrypted = data.slice(28);

        const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
        decipher.setAuthTag(authTag);
        decipher.setAAD(Buffer.from('ggp-gfx'));

        let decrypted = decipher.update(encrypted, null, 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }
}
```

---

다음: [기능 명세 →](05-feature-specifications-ko.md)