# GGP-GFX Technical Specification

## Table of Contents
1. [Core Technology Stack](#core-technology-stack)
2. [Video Processing Module](#video-processing-module)
3. [AI/ML Module](#aiml-module)
4. [Graphics Engine](#graphics-engine)
5. [Streaming Infrastructure](#streaming-infrastructure)
6. [Database Design](#database-design)
7. [API Specifications](#api-specifications)
8. [Security Implementation](#security-implementation)

## Core Technology Stack

### Programming Languages

```yaml
Performance-Critical Components:
  - Video Processing: C++20 with CUDA/Vulkan
  - Graphics Engine: C++ with Vulkan/DirectX 12
  - Stream Processing: Rust for memory safety
  - Real-time Systems: C++ with lock-free algorithms

AI/ML Components:
  - ML Models: Python 3.11 with PyTorch 2.0
  - Computer Vision: Python with OpenCV/C++ bindings
  - Training Pipeline: Python with Kubeflow
  - Inference: C++ with TensorRT/ONNX Runtime

Services Layer:
  - API Gateway: Go 1.21 for performance
  - Microservices: Mixed (Go, Rust, Java, Node.js)
  - Web Services: TypeScript with Node.js 20
  - Analytics: Python with Apache Spark

Client Applications:
  - Desktop: TypeScript with Electron + React
  - Web: TypeScript with Next.js 14
  - Mobile: TypeScript with React Native
  - Plugins: C++ with SDK bindings
```

### Core Libraries and Frameworks

```yaml
Video/Audio:
  - FFmpeg 6.0: Media handling
  - GStreamer 1.22: Pipeline processing
  - x264/x265: Video encoding
  - Opus/AAC: Audio codecs

Graphics:
  - Vulkan 1.3: Cross-platform graphics
  - DirectX 12: Windows optimization
  - OpenGL 4.6: Legacy support
  - Skia: 2D graphics rendering

AI/ML:
  - PyTorch 2.0: Deep learning
  - TensorFlow 2.13: Alternative ML
  - ONNX Runtime: Model deployment
  - OpenCV 4.8: Computer vision

Networking:
  - WebRTC: Real-time communication
  - gRPC: Service communication
  - libsrt: Secure reliable transport
  - ZeroMQ: High-performance messaging
```

## Video Processing Module

### Architecture Overview

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

### Video Input System

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

### GPU-Accelerated Processing

```cuda
// CUDA kernel for real-time color correction
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
        
        // Apply color matrix transformation
        color = matrix->transform(color);
        
        output[idx] = clamp(color.x * 255.0f, 0.0f, 255.0f);
        output[idx + 1] = clamp(color.y * 255.0f, 0.0f, 255.0f);
        output[idx + 2] = clamp(color.z * 255.0f, 0.0f, 255.0f);
        output[idx + 3] = input[idx + 3]; // Alpha
    }
}
```

### Video Pipeline Architecture

```yaml
Input Stage:
  - Source detection and initialization
  - Format negotiation
  - Hardware decoder setup
  - Buffer allocation

Processing Stage:
  - Deinterlacing (if needed)
  - Color space conversion
  - Noise reduction
  - Resolution scaling
  - Frame rate conversion
  - Effects application

Output Stage:
  - Encoder configuration
  - Bitrate control
  - Multiplexing
  - Stream packaging
  - Buffer management
```

## AI/ML Module

### Computer Vision Pipeline

```python
class GameStateDetector:
    def __init__(self):
        self.card_detector = CardDetectionModel()
        self.chip_counter = ChipCountingModel()
        self.player_tracker = PlayerTrackingModel()
        self.action_classifier = ActionClassificationModel()
        
    async def process_frame(self, frame: np.ndarray) -> GameState:
        # Parallel processing for efficiency
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
        # YOLO-based detection
        detections = await self.card_detector.detect_async(frame)
        
        cards = []
        for det in detections:
            if det.confidence > 0.95:
                card = await self._classify_card(det.crop(frame))
                cards.append(card)
                
        return cards
```

### ML Model Architecture

```python
class CardDetectionModel(nn.Module):
    """
    Custom CNN architecture for playing card detection
    Optimized for real-time inference
    """
    def __init__(self):
        super().__init__()
        
        # Backbone: MobileNetV3 for efficiency
        self.backbone = timm.create_model(
            'mobilenetv3_large_100',
            pretrained=True,
            features_only=True
        )
        
        # FPN for multi-scale detection
        self.fpn = FeaturePyramidNetwork(
            in_channels_list=[40, 112, 160],
            out_channels=256
        )
        
        # Detection heads
        self.classification_head = nn.Sequential(
            nn.Conv2d(256, 256, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, num_classes, 1)
        )
        
        self.regression_head = nn.Sequential(
            nn.Conv2d(256, 256, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, 4, 1)  # bbox coordinates
        )
    
    def forward(self, x):
        # Extract multi-scale features
        features = self.backbone(x)
        
        # Build feature pyramid
        pyramid = self.fpn(features)
        
        # Generate predictions
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

### Training Pipeline

```python
class ModelTrainer:
    def __init__(self, config: TrainingConfig):
        self.config = config
        self.model = self._build_model()
        self.optimizer = self._build_optimizer()
        self.scheduler = self._build_scheduler()
        
    def train(self, train_loader, val_loader):
        best_metric = 0
        
        for epoch in range(self.config.epochs):
            # Training phase
            self.model.train()
            train_loss = 0
            
            for batch in tqdm(train_loader):
                loss = self._training_step(batch)
                train_loss += loss.item()
                
            # Validation phase
            val_metric = self._validate(val_loader)
            
            # Learning rate scheduling
            self.scheduler.step(val_metric)
            
            # Model checkpointing
            if val_metric > best_metric:
                best_metric = val_metric
                self._save_checkpoint(epoch, val_metric)
                
            # Early stopping
            if self._should_stop():
                break
```

### Inference Optimization

```cpp
class TensorRTInference {
private:
    nvinfer1::ICudaEngine* engine_;
    nvinfer1::IExecutionContext* context_;
    cudaStream_t stream_;
    
public:
    TensorRTInference(const std::string& enginePath) {
        // Load optimized TensorRT engine
        engine_ = loadEngine(enginePath);
        context_ = engine_->createExecutionContext();
        cudaStreamCreate(&stream_);
    }
    
    std::vector<Detection> infer(const cv::Mat& image) {
        // Preprocess image
        auto input = preprocessImage(image);
        
        // Allocate GPU buffers
        void* buffers[2];
        cudaMalloc(&buffers[0], input.size());
        cudaMalloc(&buffers[1], outputSize_);
        
        // Copy input to GPU
        cudaMemcpyAsync(buffers[0], input.data(), 
                       input.size(), cudaMemcpyHostToDevice, stream_);
        
        // Run inference
        context_->enqueueV2(buffers, stream_, nullptr);
        
        // Copy output from GPU
        std::vector<float> output(outputSize_ / sizeof(float));
        cudaMemcpyAsync(output.data(), buffers[1], 
                       outputSize_, cudaMemcpyDeviceToHost, stream_);
        
        cudaStreamSynchronize(stream_);
        
        // Parse detections
        return parseDetections(output);
    }
};
```

## Graphics Engine

### Rendering Architecture

```cpp
namespace GGP::Graphics {

class RenderEngine {
public:
    struct RenderConfig {
        Resolution outputResolution;
        ColorSpace colorSpace;
        bool enableHDR;
        AntiAliasingMode aaMode;
        VSync vsyncMode;
    };
    
    class Scene {
    public:
        void addLayer(std::unique_ptr<Layer> layer);
        void removeLayer(LayerID id);
        void updateLayer(LayerID id, const Transform& transform);
        void render(RenderTarget& target);
        
    private:
        std::vector<std::unique_ptr<Layer>> layers_;
        SceneGraph sceneGraph_;
        LightingSystem lighting_;
        PostProcessingPipeline postProcess_;
    };
    
private:
    VulkanContext vulkanContext_;
    std::unique_ptr<Scene> currentScene_;
    ResourceManager resources_;
    ShaderCache shaderCache_;
};

} // namespace GGP::Graphics
```

### Shader System

```glsl
// Vertex shader for overlay graphics
#version 450

layout(binding = 0) uniform UniformBufferObject {
    mat4 model;
    mat4 view;
    mat4 proj;
    float time;
} ubo;

layout(location = 0) in vec3 inPosition;
layout(location = 1) in vec2 inTexCoord;
layout(location = 2) in vec4 inColor;

layout(location = 0) out vec2 fragTexCoord;
layout(location = 1) out vec4 fragColor;

void main() {
    gl_Position = ubo.proj * ubo.view * ubo.model * vec4(inPosition, 1.0);
    fragTexCoord = inTexCoord;
    fragColor = inColor;
}

// Fragment shader with effects
#version 450

layout(binding = 1) uniform sampler2D texSampler;

layout(location = 0) in vec2 fragTexCoord;
layout(location = 1) in vec4 fragColor;

layout(location = 0) out vec4 outColor;

void main() {
    vec4 texColor = texture(texSampler, fragTexCoord);
    
    // Glow effect
    float glow = smoothstep(0.4, 0.6, texColor.a);
    vec3 glowColor = fragColor.rgb * glow * 1.5;
    
    outColor = vec4(
        mix(texColor.rgb, glowColor, 0.3),
        texColor.a * fragColor.a
    );
}
```

### Animation System

```cpp
class AnimationEngine {
public:
    template<typename T>
    class Animation {
    public:
        Animation(T startValue, T endValue, float duration)
            : start_(startValue), end_(endValue), 
              duration_(duration), elapsed_(0.0f) {}
        
        T update(float deltaTime) {
            elapsed_ += deltaTime;
            float t = std::min(elapsed_ / duration_, 1.0f);
            
            // Apply easing function
            t = easing_(t);
            
            // Interpolate value
            return lerp(start_, end_, t);
        }
        
        void setEasing(EasingFunction func) {
            easing_ = func;
        }
        
    private:
        T start_, end_;
        float duration_, elapsed_;
        EasingFunction easing_ = EaseInOutCubic;
    };
    
    void update(float deltaTime) {
        for (auto& [id, animation] : animations_) {
            animation->update(deltaTime);
        }
    }
};
```

### Real-time Compositing

```cpp
class Compositor {
private:
    struct RenderPass {
        VkRenderPass renderPass;
        VkFramebuffer framebuffer;
        VkCommandBuffer commandBuffer;
        std::vector<VkImageView> attachments;
    };
    
public:
    void composite(const std::vector<Layer*>& layers, 
                  RenderTarget& target) {
        // Begin render pass
        VkCommandBuffer cmd = beginCommandBuffer();
        
        // Sort layers by z-order
        auto sortedLayers = sortLayersByDepth(layers);
        
        // Render each layer
        for (const auto& layer : sortedLayers) {
            if (layer->isVisible()) {
                renderLayer(cmd, layer);
            }
        }
        
        // Apply post-processing
        applyPostProcessing(cmd, target);
        
        // Submit command buffer
        submitCommandBuffer(cmd);
    }
    
private:
    void renderLayer(VkCommandBuffer cmd, const Layer* layer) {
        // Bind pipeline
        vkCmdBindPipeline(cmd, VK_PIPELINE_BIND_POINT_GRAPHICS, 
                         layer->getPipeline());
        
        // Set uniforms
        layer->updateUniforms(cmd);
        
        // Draw
        layer->draw(cmd);
    }
};
```

## Streaming Infrastructure

### Multi-Protocol Streaming

```go
package streaming

type StreamManager struct {
    rtmpServer  *RTMPServer
    srtServer   *SRTServer
    webrtcHub   *WebRTCHub
    ndiBridge   *NDIBridge
    
    encoder     *Encoder
    transcoder  *Transcoder
    packager    *Packager
}

func (sm *StreamManager) StartStream(config StreamConfig) (*Stream, error) {
    // Create encoding pipeline
    pipeline := sm.createPipeline(config)
    
    // Configure encoder
    encConfig := EncoderConfig{
        Codec:      config.Codec,
        Bitrate:    config.Bitrate,
        Resolution: config.Resolution,
        Framerate:  config.Framerate,
        Profile:    config.Profile,
        Preset:     config.Preset,
    }
    
    encoder, err := sm.encoder.Create(encConfig)
    if err != nil {
        return nil, err
    }
    
    // Setup outputs
    outputs := make([]Output, 0, len(config.Destinations))
    
    for _, dest := range config.Destinations {
        output, err := sm.createOutput(dest)
        if err != nil {
            return nil, err
        }
        outputs = append(outputs, output)
    }
    
    // Start streaming
    stream := &Stream{
        ID:       generateStreamID(),
        Pipeline: pipeline,
        Encoder:  encoder,
        Outputs:  outputs,
        Metrics:  NewMetricsCollector(),
    }
    
    go stream.Run()
    
    return stream, nil
}
```

### Adaptive Bitrate Streaming

```go
type AdaptiveBitrateController struct {
    targetBitrate  int
    currentBitrate int
    minBitrate     int
    maxBitrate     int
    
    networkMonitor *NetworkMonitor
    qualityMetrics *QualityMetrics
}

func (abc *AdaptiveBitrateController) AdjustBitrate() {
    // Get network conditions
    bandwidth := abc.networkMonitor.GetAvailableBandwidth()
    latency := abc.networkMonitor.GetLatency()
    packetLoss := abc.networkMonitor.GetPacketLoss()
    
    // Calculate optimal bitrate
    optimalBitrate := abc.calculateOptimalBitrate(
        bandwidth, latency, packetLoss)
    
    // Smooth adjustment to avoid sudden changes
    adjustment := (optimalBitrate - abc.currentBitrate) * 0.1
    abc.currentBitrate += int(adjustment)
    
    // Clamp to min/max
    abc.currentBitrate = clamp(
        abc.currentBitrate, 
        abc.minBitrate, 
        abc.maxBitrate)
    
    // Apply new bitrate
    abc.applyBitrate(abc.currentBitrate)
}
```

### CDN Integration

```typescript
class CDNManager {
    private providers: Map<string, CDNProvider> = new Map();
    
    constructor() {
        // Initialize CDN providers
        this.providers.set('cloudflare', new CloudflareProvider());
        this.providers.set('fastly', new FastlyProvider());
        this.providers.set('akamai', new AkamaiProvider());
    }
    
    async distribute(stream: Stream): Promise<CDNDistribution> {
        // Select optimal CDN based on viewer geography
        const viewerLocations = await this.getViewerLocations(stream);
        const optimalProvider = this.selectProvider(viewerLocations);
        
        // Configure edge servers
        const edgeConfig = {
            originUrl: stream.originUrl,
            cachingRules: this.getCachingRules(stream),
            geoRestrictions: stream.geoRestrictions,
            tokenAuth: stream.requiresAuth
        };
        
        // Deploy to CDN
        const distribution = await optimalProvider.deploy(edgeConfig);
        
        // Setup monitoring
        this.setupMonitoring(distribution);
        
        return distribution;
    }
}
```

## Database Design

### Primary Database Schema (PostgreSQL)

```sql
-- Core user and authentication tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    mfa_secret VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Projects and collaboration
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(owner_id, name)
);

CREATE TABLE project_collaborators (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('viewer', 'editor', 'admin')),
    invited_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMPTZ,
    PRIMARY KEY (project_id, user_id)
);

-- Game sessions and history
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    game_type VARCHAR(50) NOT NULL,
    variant VARCHAR(50),
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    is_live BOOLEAN DEFAULT TRUE
);

CREATE TABLE game_events (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    player_id INTEGER,
    data JSONB NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    sequence_number BIGINT NOT NULL
);

CREATE INDEX idx_game_events_session_timestamp 
    ON game_events(session_id, timestamp);
CREATE INDEX idx_game_events_type 
    ON game_events(event_type);

-- Streaming and recording
CREATE TABLE streams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    session_id UUID REFERENCES game_sessions(id),
    stream_key VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'preparing',
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    destinations JSONB DEFAULT '[]',
    settings JSONB DEFAULT '{}',
    metrics JSONB DEFAULT '{}'
);

CREATE TABLE recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID REFERENCES streams(id) ON DELETE CASCADE,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    duration INTEGER,
    format VARCHAR(20),
    resolution VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Graphics and templates
CREATE TABLE graphics_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    thumbnail_url VARCHAR(500),
    data JSONB NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    downloads INTEGER DEFAULT 0,
    rating DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Analytics and metrics
CREATE TABLE analytics_events (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    event_name VARCHAR(100) NOT NULL,
    properties JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions
CREATE TABLE analytics_events_2025_01 
    PARTITION OF analytics_events 
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

### Time-Series Database (InfluxDB)

```influxql
// Performance metrics schema
measurement: system_metrics
tags:
  - server_id
  - service_name
  - environment
fields:
  - cpu_usage
  - memory_usage
  - gpu_usage
  - gpu_memory
  - network_in
  - network_out
  - disk_io

// Stream metrics schema
measurement: stream_metrics
tags:
  - stream_id
  - user_id
  - region
fields:
  - bitrate
  - fps
  - dropped_frames
  - latency
  - packet_loss
  - viewer_count
  - quality_score

// AI inference metrics
measurement: ai_metrics
tags:
  - model_name
  - version
  - device_type
fields:
  - inference_time
  - accuracy
  - confidence
  - queue_size
  - batch_size
```

### Cache Layer (Redis)

```redis
# Session management
session:{user_id}:{session_id} -> JSON (TTL: 24h)
  {
    "user_id": "uuid",
    "project_id": "uuid",
    "permissions": ["read", "write"],
    "expires_at": "timestamp"
  }

# Real-time game state
game:{session_id}:state -> JSON (TTL: 1h after game ends)
  {
    "players": [...],
    "board": [...],
    "pot": 1000,
    "current_player": 3,
    "betting_round": "flop"
  }

# Stream status
stream:{stream_id}:status -> JSON (TTL: 1h after stream ends)
  {
    "status": "live",
    "viewers": 1523,
    "bitrate": 6000,
    "uptime": 3600,
    "health": "good"
  }

# Feature flags
features:{user_id} -> SET
  ["new_ui", "ai_camera", "4k_streaming"]

# Rate limiting
rate_limit:{user_id}:{action} -> INT (TTL: 1m)
  api_calls: 150
  stream_starts: 5
```

## API Specifications

### RESTful API

```yaml
openapi: 3.0.0
info:
  title: GGP-GFX API
  version: 1.0.0

paths:
  /api/v1/auth/login:
    post:
      summary: User login
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
      responses:
        200:
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token:
                    type: string
                  refresh_token:
                    type: string
                  user:
                    $ref: '#/components/schemas/User'

  /api/v1/projects:
    get:
      summary: List user projects
      security:
        - BearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        200:
          description: Project list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Project'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

  /api/v1/streams:
    post:
      summary: Start new stream
      security:
        - BearerAuth: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [project_id, settings]
              properties:
                project_id:
                  type: string
                  format: uuid
                settings:
                  $ref: '#/components/schemas/StreamSettings'
      responses:
        201:
          description: Stream created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Stream'
```

### GraphQL API

```graphql
schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}

type Query {
  # User queries
  me: User!
  user(id: ID!): User
  
  # Project queries
  project(id: ID!): Project
  projects(
    filter: ProjectFilter
    sort: ProjectSort
    pagination: PaginationInput
  ): ProjectConnection!
  
  # Stream queries
  stream(id: ID!): Stream
  activeStreams: [Stream!]!
  
  # Game queries
  gameSession(id: ID!): GameSession
  gameHistory(
    sessionId: ID!
    pagination: PaginationInput
  ): GameEventConnection!
}

type Mutation {
  # Authentication
  login(input: LoginInput!): AuthPayload!
  logout: Boolean!
  refreshToken(token: String!): AuthPayload!
  
  # Projects
  createProject(input: CreateProjectInput!): Project!
  updateProject(id: ID!, input: UpdateProjectInput!): Project!
  deleteProject(id: ID!): Boolean!
  
  # Streaming
  startStream(input: StartStreamInput!): Stream!
  stopStream(id: ID!): Stream!
  updateStreamSettings(
    id: ID!
    settings: StreamSettingsInput!
  ): Stream!
  
  # Game actions
  createGameSession(input: CreateGameSessionInput!): GameSession!
  recordGameEvent(input: GameEventInput!): GameEvent!
}

type Subscription {
  # Real-time stream updates
  streamUpdated(streamId: ID!): StreamUpdate!
  
  # Game state changes
  gameStateChanged(sessionId: ID!): GameState!
  
  # Viewer count updates
  viewerCountChanged(streamId: ID!): ViewerCount!
  
  # Chat messages (if applicable)
  chatMessage(streamId: ID!): ChatMessage!
}

# Core types
type User {
  id: ID!
  email: String!
  username: String!
  avatar: String
  projects: [Project!]!
  subscription: Subscription
  createdAt: DateTime!
}

type Project {
  id: ID!
  name: String!
  description: String
  owner: User!
  collaborators: [Collaborator!]!
  settings: ProjectSettings!
  streams: [Stream!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Stream {
  id: ID!
  project: Project!
  status: StreamStatus!
  streamKey: String!
  destinations: [StreamDestination!]!
  settings: StreamSettings!
  metrics: StreamMetrics
  startedAt: DateTime
  endedAt: DateTime
}

# Enums
enum StreamStatus {
  PREPARING
  LIVE
  PAUSED
  ENDED
  ERROR
}

enum GameType {
  TEXAS_HOLDEM
  OMAHA
  SEVEN_CARD_STUD
  BLACKJACK
  BACCARAT
  CHESS
  GO
}

# Input types
input LoginInput {
  email: String!
  password: String!
  mfaCode: String
}

input CreateProjectInput {
  name: String!
  description: String
  gameType: GameType!
  isPublic: Boolean
}

input StartStreamInput {
  projectId: ID!
  destinations: [StreamDestinationInput!]!
  settings: StreamSettingsInput!
}
```

### WebSocket Events

```typescript
// Client -> Server events
interface ClientEvents {
  'authenticate': {
    token: string;
  };
  
  'join_stream': {
    streamId: string;
  };
  
  'leave_stream': {
    streamId: string;
  };
  
  'update_game_state': {
    sessionId: string;
    action: GameAction;
  };
  
  'camera_control': {
    streamId: string;
    camera: number;
    action: 'switch' | 'preset' | 'ptz';
    params?: any;
  };
}

// Server -> Client events
interface ServerEvents {
  'authenticated': {
    userId: string;
    permissions: string[];
  };
  
  'stream_update': {
    streamId: string;
    status: StreamStatus;
    metrics: StreamMetrics;
  };
  
  'game_state': {
    sessionId: string;
    state: GameState;
    timestamp: number;
  };
  
  'viewer_update': {
    streamId: string;
    count: number;
    locations: GeoData[];
  };
  
  'error': {
    code: string;
    message: string;
    details?: any;
  };
}
```

## Security Implementation

### Authentication System

```typescript
class AuthenticationService {
  private readonly jwtSecret = process.env.JWT_SECRET;
  private readonly refreshSecret = process.env.REFRESH_SECRET;
  
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    // Validate credentials
    const user = await this.validateCredentials(credentials);
    
    // Check MFA if enabled
    if (user.mfaEnabled) {
      await this.verifyMFA(credentials.mfaCode, user.mfaSecret);
    }
    
    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    
    // Store refresh token
    await this.storeRefreshToken(user.id, refreshToken);
    
    // Log authentication event
    await this.logAuthEvent(user.id, 'login', {
      ip: credentials.ipAddress,
      userAgent: credentials.userAgent
    });
    
    return { accessToken, refreshToken };
  }
  
  private generateAccessToken(user: User): string {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        permissions: user.permissions
      },
      this.jwtSecret,
      {
        expiresIn: '15m',
        issuer: 'ggp-gfx',
        audience: 'ggp-gfx-api'
      }
    );
  }
}
```

### Encryption Implementation

```go
package security

import (
    "crypto/aes"
    "crypto/cipher"
    "crypto/rand"
    "encoding/base64"
)

type EncryptionService struct {
    key []byte
}

func NewEncryptionService(key string) *EncryptionService {
    return &EncryptionService{
        key: []byte(key),
    }
}

func (e *EncryptionService) Encrypt(plaintext []byte) (string, error) {
    // Create cipher block
    block, err := aes.NewCipher(e.key)
    if err != nil {
        return "", err
    }
    
    // Create GCM
    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return "", err
    }
    
    // Create nonce
    nonce := make([]byte, gcm.NonceSize())
    if _, err := rand.Read(nonce); err != nil {
        return "", err
    }
    
    // Encrypt
    ciphertext := gcm.Seal(nonce, nonce, plaintext, nil)
    
    // Encode to base64
    return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func (e *EncryptionService) Decrypt(ciphertext string) ([]byte, error) {
    // Decode from base64
    data, err := base64.StdEncoding.DecodeString(ciphertext)
    if err != nil {
        return nil, err
    }
    
    // Create cipher block
    block, err := aes.NewCipher(e.key)
    if err != nil {
        return nil, err
    }
    
    // Create GCM
    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return nil, err
    }
    
    // Extract nonce
    nonceSize := gcm.NonceSize()
    nonce, ciphertext := data[:nonceSize], data[nonceSize:]
    
    // Decrypt
    plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
    if err != nil {
        return nil, err
    }
    
    return plaintext, nil
}
```

### API Security Middleware

```typescript
class SecurityMiddleware {
  rateLimiter = new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 100 // requests per window
  });
  
  async authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract token
      const token = this.extractToken(req);
      if (!token) {
        throw new UnauthorizedError('Missing authentication token');
      }
      
      // Verify token
      const payload = await this.verifyToken(token);
      
      // Check token blacklist
      if (await this.isTokenBlacklisted(token)) {
        throw new UnauthorizedError('Token has been revoked');
      }
      
      // Attach user to request
      req.user = await this.loadUser(payload.sub);
      
      next();
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }
  
  async authorize(requiredPermissions: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const user = req.user;
      
      // Check permissions
      const hasPermission = requiredPermissions.every(
        perm => user.permissions.includes(perm)
      );
      
      if (!hasPermission) {
        return res.status(403).json({
          error: 'Insufficient permissions'
        });
      }
      
      next();
    };
  }
  
  async validateInput(schema: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Validate request body
        const validated = await schema.validate(req.body);
        req.body = validated;
        
        // Sanitize input
        req.body = this.sanitizeInput(req.body);
        
        next();
      } catch (error) {
        res.status(400).json({
          error: 'Invalid input',
          details: error.errors
        });
      }
    };
  }
}
```

---

Next: [Feature Specifications →](05-feature-specifications.md)