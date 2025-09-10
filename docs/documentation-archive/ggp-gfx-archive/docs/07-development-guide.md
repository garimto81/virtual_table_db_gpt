# GGP-GFX Development Guide

## Table of Contents
1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Coding Standards](#coding-standards)
4. [Build System](#build-system)
5. [Testing Strategy](#testing-strategy)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Performance Guidelines](#performance-guidelines)
8. [Security Best Practices](#security-best-practices)

## Development Environment Setup

### Prerequisites

#### System Requirements
```yaml
Development Machine:
  OS: Windows 10/11, macOS 12+, Ubuntu 20.04+
  CPU: Intel i7/AMD Ryzen 7 or better
  RAM: 32GB minimum, 64GB recommended
  GPU: NVIDIA RTX 3060 or better (CUDA development)
  Storage: 1TB NVMe SSD
  Network: High-speed internet (cloud development)

Software Requirements:
  - Git 2.40+
  - Docker Desktop 4.20+
  - Node.js 20 LTS
  - Python 3.11+
  - Rust 1.70+
  - Go 1.21+
  - C++ compiler (MSVC 2022, GCC 12+, Clang 15+)
```

#### Development Tools
```bash
# Core development tools
npm install -g @nestjs/cli
npm install -g typescript
npm install -g @angular/cli
pip install poetry
cargo install cargo-watch
go install github.com/cosmtrek/air@latest

# GPU development
# CUDA Toolkit 12.0+
# cuDNN 8.9+
# TensorRT 8.6+

# Database tools
docker pull postgres:15
docker pull redis:7
docker pull influxdb:2.7
docker pull mongodb:7.0
```

### Repository Setup

#### Clone and Initialize
```bash
# Clone the repository
git clone https://github.com/ggp-gfx/core.git
cd ggp-gfx

# Initialize submodules
git submodule update --init --recursive

# Setup development environment
./scripts/setup-dev.sh

# Install dependencies
make install-deps

# Build development containers
docker-compose -f docker-compose.dev.yml build

# Start development services
docker-compose -f docker-compose.dev.yml up -d
```

#### Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Configure development environment
# Edit .env.local with your settings:
# - Database credentials
# - API keys
# - Cloud provider credentials
# - GPU device settings
```

### IDE Configuration

#### Visual Studio Code Setup
```json
{
  "extensions": {
    "recommendations": [
      "ms-vscode.cpptools",
      "rust-lang.rust-analyzer",
      "golang.go",
      "ms-python.python",
      "bradlc.vscode-tailwindcss",
      "ms-vscode.vscode-typescript-next",
      "ms-kubernetes-tools.vscode-kubernetes-tools",
      "ms-vscode-remote.remote-containers"
    ]
  },
  "settings": {
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true,
      "source.organizeImports": true
    },
    "typescript.preferences.importModuleSpecifier": "relative",
    "rust-analyzer.cargo.features": "all",
    "go.formatTool": "goimports",
    "python.defaultInterpreterPath": "./venv/bin/python",
    "cmake.configureOnOpen": true
  }
}
```

#### IntelliJ/CLion Setup
```xml
<!-- .idea/codeStyles/Project.xml -->
<component name="ProjectCodeStyleConfiguration">
  <code_scheme name="Project" version="173">
    <TypeScriptCodeStyleSettings version="0">
      <option name="FORCE_SEMICOLON_STYLE" value="true" />
      <option name="USE_DOUBLE_QUOTES" value="false" />
      <option name="ENFORCE_TRAILING_COMMA" value="WhenMultiline" />
    </TypeScriptCodeStyleSettings>
    <codeStyleSettings language="TypeScript">
      <option name="INDENT_SIZE" value="2" />
      <option name="TAB_SIZE" value="2" />
    </codeStyleSettings>
  </code_scheme>
</component>
```

### Local Development Services

#### Docker Compose Configuration
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ggp_gfx_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpassword
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/db/init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  influxdb:
    image: influxdb:2.7
    environment:
      DOCKER_INFLUXDB_INIT_MODE: setup
      DOCKER_INFLUXDB_INIT_USERNAME: dev
      DOCKER_INFLUXDB_INIT_PASSWORD: devpassword
      DOCKER_INFLUXDB_INIT_ORG: ggp-gfx
      DOCKER_INFLUXDB_INIT_BUCKET: metrics
    ports:
      - "8086:8086"
    volumes:
      - influxdb_data:/var/lib/influxdb2

  mongodb:
    image: mongo:7.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: dev
      MONGO_INITDB_ROOT_PASSWORD: devpassword
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  localstack:
    image: localstack/localstack:2.0
    environment:
      SERVICES: s3,lambda,apigateway,cloudformation
      DEBUG: 1
      DATA_DIR: /tmp/localstack/data
    ports:
      - "4566:4566"
    volumes:
      - localstack_data:/tmp/localstack

volumes:
  postgres_data:
  redis_data:
  influxdb_data:
  mongodb_data:
  localstack_data:
```

## Project Structure

### Monorepo Organization

```
ggp-gfx/
├── apps/                          # Applications
│   ├── desktop/                   # Electron desktop app
│   ├── web/                       # Next.js web app
│   ├── mobile/                    # React Native app
│   └── server/                    # Backend services
├── libs/                          # Shared libraries
│   ├── core/                      # Core business logic
│   ├── ui/                        # UI components
│   ├── api/                       # API clients
│   └── utils/                     # Utility functions
├── services/                      # Microservices
│   ├── api-gateway/               # API Gateway (Go)
│   ├── auth-service/              # Authentication (Node.js)
│   ├── video-processor/           # Video processing (C++)
│   ├── ai-engine/                 # AI/ML service (Python)
│   ├── graphics-renderer/         # Graphics rendering (C++)
│   ├── stream-manager/            # Streaming service (Go)
│   └── analytics/                 # Analytics service (Python)
├── packages/                      # NPM packages
│   ├── eslint-config/             # Shared ESLint config
│   ├── typescript-config/         # Shared TypeScript config
│   └── ui-design-system/          # Design system
├── tools/                         # Development tools
│   ├── build/                     # Build scripts
│   ├── deploy/                    # Deployment scripts
│   └── testing/                   # Testing utilities
├── docs/                          # Documentation
├── scripts/                       # Utility scripts
├── docker/                        # Docker configurations
├── k8s/                          # Kubernetes manifests
└── infrastructure/                # Infrastructure as code
    ├── terraform/                 # Terraform configs
    └── ansible/                   # Ansible playbooks
```

### Service Architecture

#### API Gateway Structure
```
services/api-gateway/
├── cmd/
│   └── server/
│       └── main.go               # Entry point
├── internal/
│   ├── config/                   # Configuration
│   ├── handlers/                 # HTTP handlers
│   ├── middleware/               # Middleware
│   ├── routes/                   # Route definitions
│   └── services/                 # Business logic
├── pkg/                          # Public packages
├── api/                          # API definitions
│   └── openapi.yaml
├── Dockerfile
├── go.mod
└── go.sum
```

#### Video Processor Structure
```
services/video-processor/
├── src/
│   ├── main.cpp                  # Entry point
│   ├── core/                     # Core processing
│   │   ├── pipeline.cpp
│   │   ├── filters.cpp
│   │   └── encoders.cpp
│   ├── gpu/                      # GPU acceleration
│   │   ├── cuda/
│   │   └── vulkan/
│   ├── api/                      # gRPC API
│   └── utils/                    # Utilities
├── include/                      # Header files
├── tests/                        # Unit tests
├── benchmarks/                   # Performance tests
├── CMakeLists.txt
└── Dockerfile
```

#### AI Engine Structure
```
services/ai-engine/
├── src/
│   ├── __init__.py
│   ├── main.py                   # FastAPI server
│   ├── models/                   # ML models
│   │   ├── card_detection.py
│   │   ├── game_state.py
│   │   └── player_tracking.py
│   ├── training/                 # Training scripts
│   ├── inference/                # Inference engine
│   └── data/                     # Data processing
├── tests/
├── requirements.txt
├── pyproject.toml
└── Dockerfile
```

## Coding Standards

### Language-Specific Standards

#### TypeScript/JavaScript
```typescript
// Use strict mode and explicit types
'use strict';

interface VideoSource {
  readonly id: string;
  readonly name: string;
  readonly type: VideoSourceType;
  isActive: boolean;
  settings: VideoSourceSettings;
}

// Use const assertions for readonly data
const VIDEO_FORMATS = ['mp4', 'mov', 'avi', 'mkv'] as const;
type VideoFormat = typeof VIDEO_FORMATS[number];

// Prefer functional programming patterns
const processVideoSources = (sources: VideoSource[]): ProcessedSource[] => {
  return sources
    .filter(source => source.isActive)
    .map(source => ({
      ...source,
      processedAt: Date.now()
    }));
};

// Use async/await over Promises
async function loadVideoSource(id: string): Promise<VideoSource | null> {
  try {
    const response = await fetch(`/api/sources/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load source: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error loading video source:', error);
    return null;
  }
}

// Use proper error handling
class VideoProcessingError extends Error {
  constructor(
    message: string,
    public readonly sourceId: string,
    public readonly errorCode: string
  ) {
    super(message);
    this.name = 'VideoProcessingError';
  }
}
```

#### C++ Standards
```cpp
// Use modern C++ features (C++20)
#include <memory>
#include <string_view>
#include <ranges>
#include <concepts>

namespace ggp::video {

// Use concepts for type constraints
template<typename T>
concept VideoFilter = requires(T filter, const Frame& frame) {
    { filter.process(frame) } -> std::convertible_to<Frame>;
    { filter.name() } -> std::convertible_to<std::string_view>;
};

// Use RAII and smart pointers
class VideoProcessor {
public:
    explicit VideoProcessor(std::unique_ptr<GPUContext> context)
        : gpu_context_(std::move(context)) {}
    
    // Use const correctness
    [[nodiscard]] ProcessingResult process(const Frame& input) const;
    
    // Use noexcept for non-throwing functions
    [[nodiscard]] bool is_ready() const noexcept { return ready_; }

private:
    std::unique_ptr<GPUContext> gpu_context_;
    bool ready_ = false;
};

// Use structured bindings
auto [width, height] = get_frame_dimensions(frame);

// Use ranges for algorithms
auto filtered_sources = sources 
    | std::views::filter([](const auto& source) { return source.is_active(); })
    | std::views::transform([](const auto& source) { return source.process(); });

} // namespace ggp::video
```

#### Python Standards
```python
"""Video processing AI module."""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from typing import Any, Protocol, TypeVar, Generic
from pathlib import Path

import numpy as np
import torch
from pydantic import BaseModel, Field, ConfigDict

# Use type hints everywhere
T = TypeVar('T')

class ModelProtocol(Protocol):
    """Protocol for ML models."""
    
    def predict(self, input_data: np.ndarray) -> np.ndarray:
        """Make predictions on input data."""
        ...

@dataclass(frozen=True)
class DetectionResult:
    """Immutable detection result."""
    
    bbox: tuple[int, int, int, int]
    confidence: float
    class_id: int
    timestamp: float = Field(default_factory=time.time)

class CardDetector:
    """Detects playing cards in video frames."""
    
    def __init__(self, model_path: Path) -> None:
        self._model = self._load_model(model_path)
        self._logger = logging.getLogger(__name__)
    
    async def detect_cards(
        self, 
        frame: np.ndarray,
        confidence_threshold: float = 0.8
    ) -> list[DetectionResult]:
        """Detect cards in video frame asynchronously."""
        try:
            # Run inference in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            detections = await loop.run_in_executor(
                None, 
                self._run_inference, 
                frame
            )
            
            # Filter by confidence
            return [
                det for det in detections 
                if det.confidence >= confidence_threshold
            ]
            
        except Exception:
            self._logger.exception("Card detection failed")
            return []
    
    def _run_inference(self, frame: np.ndarray) -> list[DetectionResult]:
        """Run model inference (blocking operation)."""
        # Implementation details...
        pass
```

#### Go Standards
```go
package streaming

import (
    "context"
    "fmt"
    "log/slog"
    "time"
)

// Use interfaces for abstraction
type StreamManager interface {
    StartStream(ctx context.Context, config StreamConfig) (*Stream, error)
    StopStream(ctx context.Context, streamID string) error
    GetStreamStatus(ctx context.Context, streamID string) (StreamStatus, error)
}

// Use struct embedding for composition
type BaseStream struct {
    ID        string
    CreatedAt time.Time
    logger    *slog.Logger
}

type RTMPStream struct {
    BaseStream
    Endpoint string
    Key      string
}

// Use context for cancellation and timeouts
func (s *streamManager) StartStream(
    ctx context.Context, 
    config StreamConfig,
) (*Stream, error) {
    // Create timeout context
    ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
    defer cancel()
    
    // Validate config
    if err := config.Validate(); err != nil {
        return nil, fmt.Errorf("invalid config: %w", err)
    }
    
    // Use channels for communication
    streamCh := make(chan *Stream, 1)
    errCh := make(chan error, 1)
    
    go func() {
        stream, err := s.createStream(config)
        if err != nil {
            errCh <- err
            return
        }
        streamCh <- stream
    }()
    
    // Handle cancellation
    select {
    case stream := <-streamCh:
        return stream, nil
    case err := <-errCh:
        return nil, err
    case <-ctx.Done():
        return nil, ctx.Err()
    }
}

// Use custom errors
type StreamError struct {
    StreamID string
    Op       string
    Err      error
}

func (e *StreamError) Error() string {
    return fmt.Sprintf("stream %s: %s: %v", e.StreamID, e.Op, e.Err)
}

func (e *StreamError) Unwrap() error {
    return e.Err
}
```

### Code Organization

#### File Naming Conventions
```yaml
TypeScript/JavaScript:
  - Components: PascalCase (VideoPlayer.tsx)
  - Hooks: camelCase starting with 'use' (useVideoStream.ts)
  - Utilities: camelCase (formatDuration.ts)
  - Constants: SCREAMING_SNAKE_CASE (API_ENDPOINTS.ts)
  - Types: PascalCase (VideoSource.types.ts)

C++:
  - Headers: snake_case (.hpp)
  - Source: snake_case (.cpp)
  - Classes: PascalCase
  - Functions: snake_case
  - Constants: SCREAMING_SNAKE_CASE

Python:
  - Modules: snake_case (.py)
  - Classes: PascalCase
  - Functions: snake_case
  - Constants: SCREAMING_SNAKE_CASE

Go:
  - Packages: lowercase
  - Files: snake_case (.go)
  - Types: PascalCase
  - Functions: PascalCase (public), camelCase (private)
  - Constants: PascalCase or SCREAMING_SNAKE_CASE
```

#### Import Organization
```typescript
// 1. Node modules
import React from 'react';
import { Observable } from 'rxjs';

// 2. Internal libraries
import { VideoProcessor } from '@ggp-gfx/core';
import { Button } from '@ggp-gfx/ui';

// 3. Relative imports (grouped by proximity)
import { useVideoStream } from '../../hooks';
import { VideoControls } from '../VideoControls';
import { StreamStatus } from './StreamStatus';

// 4. Type-only imports (grouped separately)
import type { VideoSource, StreamConfig } from '@ggp-gfx/types';
import type { ComponentProps } from 'react';
```

### Documentation Standards

#### JSDoc Comments
```typescript
/**
 * Processes video frames through AI detection pipeline.
 * 
 * @param frames - Array of video frames to process
 * @param options - Processing configuration options
 * @returns Promise resolving to detection results
 * 
 * @throws {VideoProcessingError} When frame processing fails
 * 
 * @example
 * ```typescript
 * const results = await processFrames(frames, {
 *   confidence: 0.8,
 *   batchSize: 32
 * });
 * ```
 */
async function processFrames(
  frames: VideoFrame[],
  options: ProcessingOptions
): Promise<DetectionResult[]> {
  // Implementation...
}
```

#### C++ Documentation
```cpp
/**
 * @brief GPU-accelerated video filter for real-time processing.
 * 
 * This class provides hardware-accelerated video filtering using CUDA
 * or Vulkan compute shaders. Supports multiple filter types including
 * color correction, noise reduction, and artistic effects.
 * 
 * @tparam FilterType The type of filter to apply
 * 
 * @example
 * ```cpp
 * auto filter = VideoFilter<ColorCorrection>(gpu_context);
 * auto result = filter.process(input_frame);
 * ```
 */
template<VideoFilter FilterType>
class GPUVideoFilter {
public:
    /**
     * @brief Constructs a new GPU video filter.
     * @param context Shared GPU context for operations
     * @param config Filter-specific configuration
     */
    explicit GPUVideoFilter(
        std::shared_ptr<GPUContext> context,
        const FilterConfig& config
    );
    
    /**
     * @brief Processes a video frame through the filter.
     * @param input Input video frame
     * @return Processed video frame
     * @throws GPUProcessingError if GPU operation fails
     */
    [[nodiscard]] Frame process(const Frame& input) const;
};
```

## Build System

### Multi-Language Build Configuration

#### Root Makefile
```makefile
# GGP-GFX Build System
.PHONY: all build test clean install deps

# Global variables
BUILD_TYPE ?= debug
PARALLEL_JOBS ?= $(shell nproc)
DOCKER_REGISTRY ?= ghcr.io/ggp-gfx

# Default target
all: deps build test

# Install all dependencies
deps:
	@echo "Installing dependencies..."
	npm install
	pip install -r requirements.txt
	cargo fetch
	go mod download
	git submodule update --init --recursive

# Build all services
build: build-web build-desktop build-services

build-web:
	@echo "Building web application..."
	cd apps/web && npm run build

build-desktop:
	@echo "Building desktop application..."
	cd apps/desktop && npm run build

build-services:
	@echo "Building microservices..."
	$(MAKE) -C services/api-gateway build
	$(MAKE) -C services/video-processor build
	$(MAKE) -C services/ai-engine build

# Run tests
test: test-unit test-integration test-e2e

test-unit:
	@echo "Running unit tests..."
	npm run test:unit
	cargo test
	go test ./...
	python -m pytest tests/unit

test-integration:
	@echo "Running integration tests..."
	docker-compose -f docker-compose.test.yml up --abort-on-container-exit

test-e2e:
	@echo "Running end-to-end tests..."
	npm run test:e2e

# Clean build artifacts
clean:
	rm -rf dist/
	rm -rf build/
	rm -rf node_modules/
	rm -rf target/
	cargo clean
	go clean -cache
	python -m pip cache purge

# Docker builds
docker-build:
	docker build -t $(DOCKER_REGISTRY)/api-gateway:latest services/api-gateway
	docker build -t $(DOCKER_REGISTRY)/video-processor:latest services/video-processor
	docker build -t $(DOCKER_REGISTRY)/ai-engine:latest services/ai-engine

# Development shortcuts
dev:
	docker-compose -f docker-compose.dev.yml up

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f
```

#### CMake Configuration (C++ Services)
```cmake
# services/video-processor/CMakeLists.txt
cmake_minimum_required(VERSION 3.25)
project(ggp-video-processor VERSION 1.0.0 LANGUAGES CXX CUDA)

# C++ Standards
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Build types
set(CMAKE_BUILD_TYPE ${CMAKE_BUILD_TYPE} CACHE STRING "Build type")
set_property(CACHE CMAKE_BUILD_TYPE PROPERTY STRINGS Debug Release RelWithDebInfo MinSizeRel)

# Find packages
find_package(PkgConfig REQUIRED)
find_package(CUDA REQUIRED)
find_package(Vulkan REQUIRED)
find_package(OpenCV REQUIRED)
find_package(FFmpeg REQUIRED)

# External dependencies
include(FetchContent)

FetchContent_Declare(
    spdlog
    GIT_REPOSITORY https://github.com/gabime/spdlog.git
    GIT_TAG v1.12.0
)

FetchContent_Declare(
    grpc
    GIT_REPOSITORY https://github.com/grpc/grpc.git
    GIT_TAG v1.57.0
)

FetchContent_MakeAvailable(spdlog grpc)

# Compiler flags
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -g -O0 -Wall -Wextra -Wpedantic")
    add_definitions(-DDEBUG)
else()
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -DNDEBUG")
    
    # Enable LTO for release builds
    set(CMAKE_INTERPROCEDURAL_OPTIMIZATION TRUE)
endif()

# CUDA settings
set(CMAKE_CUDA_STANDARD 17)
set(CMAKE_CUDA_ARCHITECTURES 70 75 80 86 89 90)

# Source files
file(GLOB_RECURSE SOURCES "src/*.cpp" "src/*.cu")
file(GLOB_RECURSE HEADERS "include/*.hpp" "include/*.cuh")

# Create library
add_library(ggp_video_core SHARED ${SOURCES})

target_include_directories(ggp_video_core
    PUBLIC
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
        $<INSTALL_INTERFACE:include>
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/src
)

target_link_libraries(ggp_video_core
    PUBLIC
        ${OpenCV_LIBS}
        ${FFmpeg_LIBRARIES}
        CUDA::cudart
        CUDA::curand
        CUDA::cublas
        Vulkan::Vulkan
        spdlog::spdlog
        gRPC::grpc++
)

# Executable
add_executable(video-processor src/main.cpp)
target_link_libraries(video-processor ggp_video_core)

# Tests
enable_testing()
add_subdirectory(tests)

# Install targets
install(TARGETS ggp_video_core video-processor
    EXPORT ggp-video-targets
    LIBRARY DESTINATION lib
    ARCHIVE DESTINATION lib
    RUNTIME DESTINATION bin
    INCLUDES DESTINATION include
)

install(DIRECTORY include/ DESTINATION include)
```

#### Cargo Configuration (Rust Services)
```toml
# services/stream-manager/Cargo.toml
[package]
name = "ggp-stream-manager"
version = "1.0.0"
edition = "2021"
authors = ["GGP-GFX Team <dev@ggp-gfx.com>"]
description = "High-performance streaming service for GGP-GFX"
license = "MIT"

[dependencies]
# Async runtime
tokio = { version = "1.32", features = ["full"] }
tokio-util = { version = "0.7", features = ["codec"] }

# Web framework
axum = "0.6"
tower = "0.4"
tower-http = { version = "0.4", features = ["cors", "trace"] }

# Serialization
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

# Logging
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }

# Database
sqlx = { version = "0.7", features = ["runtime-tokio-rustls", "postgres", "chrono", "uuid"] }
redis = { version = "0.23", features = ["tokio-comp"] }

# Streaming protocols
rtmp = "0.3"
webrtc = "0.8"

# Configuration
config = "0.13"
clap = { version = "4.4", features = ["derive", "env"] }

[dev-dependencies]
tokio-test = "0.4"
wiremock = "0.5"

[[bin]]
name = "stream-manager"
path = "src/main.rs"

[profile.release]
lto = true
codegen-units = 1
panic = "abort"

[profile.dev]
debug = true
overflow-checks = true
```

#### Package.json (Node.js Services)
```json
{
  "name": "@ggp-gfx/auth-service",
  "version": "1.0.0",
  "description": "Authentication and authorization service",
  "main": "dist/main.js",
  "scripts": {
    "build": "tsc && tsc-alias",
    "build:watch": "concurrently \"tsc -w\" \"tsc-alias -w\"",
    "start": "node dist/main.js",
    "start:dev": "tsx watch src/main.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.2.6",
    "@nestjs/core": "^10.2.6",
    "@nestjs/jwt": "^10.1.1",
    "@nestjs/passport": "^10.0.2",
    "@nestjs/platform-express": "^10.2.6",
    "@nestjs/typeorm": "^10.0.0",
    "bcrypt": "^5.1.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "pg": "^8.11.3",
    "redis": "^4.6.8",
    "typeorm": "^0.3.17"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.0",
    "@types/jest": "^29.5.5",
    "@types/node": "^20.6.3",
    "@types/passport-jwt": "^3.0.9",
    "@types/passport-local": "^1.0.35",
    "@types/pg": "^8.10.3",
    "concurrently": "^8.2.1",
    "eslint": "^8.49.0",
    "jest": "^29.7.0",
    "prettier": "^3.0.3",
    "ts-jest": "^29.1.1",
    "tsc-alias": "^1.8.8",
    "tsx": "^3.12.10",
    "typescript": "^5.2.2"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=9.0.0"
  }
}
```

### Build Optimization

#### Parallel Builds
```yaml
# .github/workflows/build.yml
name: Build and Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-matrix:
    strategy:
      matrix:
        service:
          - api-gateway
          - auth-service
          - video-processor
          - ai-engine
          - stream-manager
        include:
          - service: api-gateway
            language: go
            build-cmd: make build
          - service: auth-service
            language: node
            build-cmd: npm run build
          - service: video-processor
            language: cpp
            build-cmd: cmake --build build --parallel
          - service: ai-engine
            language: python
            build-cmd: python -m build
          - service: stream-manager
            language: rust
            build-cmd: cargo build --release
    
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Build Environment
      uses: ./.github/actions/setup-${{ matrix.language }}
    
    - name: Cache Dependencies
      uses: actions/cache@v3
      with:
        path: |
          ~/.cargo/registry
          ~/.cargo/git
          node_modules
          ~/.cache/pip
        key: ${{ runner.os }}-${{ matrix.service }}-${{ hashFiles('**/Cargo.lock', '**/package-lock.json', '**/requirements.txt') }}
    
    - name: Build Service
      run: |
        cd services/${{ matrix.service }}
        ${{ matrix.build-cmd }}
    
    - name: Run Tests
      run: |
        cd services/${{ matrix.service }}
        make test
```

#### Docker Multi-stage Builds
```dockerfile
# services/video-processor/Dockerfile
# Multi-stage build for C++ service
FROM nvidia/cuda:12.0-devel-ubuntu22.04 as builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    ninja-build \
    pkg-config \
    libopencv-dev \
    libavcodec-dev \
    libavformat-dev \
    libswscale-dev \
    && rm -rf /var/lib/apt/lists/*

# Set up Vulkan SDK
RUN apt-get update && apt-get install -y wget && \
    wget -qO - https://packages.lunarg.com/lunarg-signing-key-pub.asc | apt-key add - && \
    wget -qO /etc/apt/sources.list.d/lunarg-vulkan-jammy.list \
    https://packages.lunarg.com/vulkan/lunarg-vulkan-jammy.list && \
    apt-get update && apt-get install -y vulkan-sdk && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy source code
COPY . .

# Build application
RUN cmake -B build -G Ninja \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_INSTALL_PREFIX=/usr/local && \
    cmake --build build --parallel $(nproc) && \
    cmake --install build

# Runtime stage
FROM nvidia/cuda:12.0-runtime-ubuntu22.04

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libopencv-core4.5d \
    libopencv-imgproc4.5d \
    libavcodec58 \
    libavformat58 \
    libswscale5 \
    && rm -rf /var/lib/apt/lists/*

# Copy built application
COPY --from=builder /usr/local/bin/video-processor /usr/local/bin/
COPY --from=builder /usr/local/lib/libggp_video_core.so /usr/local/lib/

# Set up runtime environment
ENV LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH
ENV CUDA_VISIBLE_DEVICES=all

EXPOSE 8080
EXPOSE 9090

CMD ["video-processor"]
```

## Testing Strategy

### Test Pyramid

#### Unit Tests (70%)
```typescript
// apps/web/src/components/VideoPlayer.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VideoPlayer } from './VideoPlayer';
import { mockVideoSource } from '../__mocks__/videoSource';

describe('VideoPlayer', () => {
  it('should render video player with controls', () => {
    render(<VideoPlayer source={mockVideoSource} />);
    
    expect(screen.getByRole('video')).toBeInTheDocument();
    expect(screen.getByLabelText('Play/Pause')).toBeInTheDocument();
    expect(screen.getByLabelText('Volume')).toBeInTheDocument();
  });
  
  it('should toggle play/pause on button click', async () => {
    const onPlayStateChange = jest.fn();
    
    render(
      <VideoPlayer 
        source={mockVideoSource} 
        onPlayStateChange={onPlayStateChange}
      />
    );
    
    const playButton = screen.getByLabelText('Play/Pause');
    fireEvent.click(playButton);
    
    await waitFor(() => {
      expect(onPlayStateChange).toHaveBeenCalledWith(true);
    });
  });
  
  it('should handle video loading errors gracefully', async () => {
    const errorSource = { ...mockVideoSource, url: 'invalid-url' };
    
    render(<VideoPlayer source={errorSource} />);
    
    const video = screen.getByRole('video') as HTMLVideoElement;
    fireEvent.error(video);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load video/i)).toBeInTheDocument();
    });
  });
});
```

#### Integration Tests (20%)
```python
# services/ai-engine/tests/integration/test_card_detection.py
import pytest
import asyncio
from pathlib import Path
from unittest.mock import AsyncMock

from src.models.card_detection import CardDetector
from src.inference.engine import InferenceEngine

@pytest.fixture
async def card_detector():
    """Create card detector with test model."""
    model_path = Path("tests/fixtures/models/card_detection_test.onnx")
    detector = CardDetector(model_path)
    await detector.initialize()
    return detector

@pytest.fixture
def sample_frames():
    """Load sample video frames for testing."""
    frames_dir = Path("tests/fixtures/frames")
    return [
        cv2.imread(str(frame_path))
        for frame_path in frames_dir.glob("*.jpg")
    ]

@pytest.mark.asyncio
async def test_card_detection_pipeline(card_detector, sample_frames):
    """Test complete card detection pipeline."""
    results = []
    
    for frame in sample_frames:
        detections = await card_detector.detect_cards(frame)
        results.append(detections)
    
    # Verify detection results
    assert len(results) == len(sample_frames)
    
    # Check that cards were detected in expected frames
    poker_frame_results = results[0]  # Frame with poker cards
    assert len(poker_frame_results) >= 2
    assert all(det.confidence > 0.8 for det in poker_frame_results)

@pytest.mark.asyncio
async def test_inference_engine_performance(card_detector, sample_frames):
    """Test inference engine performance metrics."""
    import time
    
    start_time = time.time()
    
    # Process multiple frames
    tasks = [
        card_detector.detect_cards(frame)
        for frame in sample_frames[:10]
    ]
    
    results = await asyncio.gather(*tasks)
    
    end_time = time.time()
    processing_time = end_time - start_time
    
    # Performance assertions
    assert processing_time < 5.0  # Should process 10 frames in under 5 seconds
    assert len(results) == 10
```

#### End-to-End Tests (10%)
```typescript
// tests/e2e/streaming-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Streaming Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });
  
  test('should complete full streaming workflow', async ({ page }) => {
    // Create new project
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name"]', 'E2E Test Stream');
    await page.selectOption('[data-testid="game-type"]', 'poker');
    await page.click('[data-testid="create-project"]');
    
    // Wait for project creation
    await expect(page.locator('[data-testid="project-title"]')).toContainText('E2E Test Stream');
    
    // Add video source
    await page.click('[data-testid="add-source-button"]');
    await page.selectOption('[data-testid="source-type"]', 'test-pattern');
    await page.fill('[data-testid="source-name"]', 'Test Camera');
    await page.click('[data-testid="add-source-confirm"]');
    
    // Verify source was added
    await expect(page.locator('[data-testid="source-list"]')).toContainText('Test Camera');
    
    // Configure stream settings
    await page.click('[data-testid="stream-settings"]');
    await page.selectOption('[data-testid="stream-quality"]', '1080p');
    await page.fill('[data-testid="stream-title"]', 'E2E Test Stream');
    
    // Add streaming destination
    await page.click('[data-testid="add-destination"]');
    await page.selectOption('[data-testid="platform"]', 'test-rtmp');
    await page.fill('[data-testid="rtmp-url"]', 'rtmp://test.example.com/live');
    await page.fill('[data-testid="stream-key"]', 'test-key-123');
    await page.click('[data-testid="save-destination"]');
    
    // Start stream
    await page.click('[data-testid="start-stream-button"]');
    
    // Wait for stream to start
    await expect(page.locator('[data-testid="stream-status"]')).toContainText('Live');
    
    // Verify stream metrics
    await expect(page.locator('[data-testid="viewer-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="bitrate-display"]')).toBeVisible();
    
    // Stop stream
    await page.click('[data-testid="stop-stream-button"]');
    
    // Confirm stop
    await page.click('[data-testid="confirm-stop"]');
    
    // Verify stream stopped
    await expect(page.locator('[data-testid="stream-status"]')).toContainText('Stopped');
  });
  
  test('should handle streaming errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/streams/start', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Network error' })
      });
    });
    
    // Attempt to start stream
    await page.click('[data-testid="start-stream-button"]');
    
    // Verify error handling
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to start stream');
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });
});
```

### Test Configuration

#### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  projects: [
    {
      displayName: 'web',
      testMatch: ['<rootDir>/apps/web/**/*.test.{ts,tsx}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/tests/setup/web.ts'],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/apps/web/src/$1',
        '^@ggp-gfx/(.*)$': '<rootDir>/libs/$1/src'
      },
      collectCoverageFrom: [
        'apps/web/src/**/*.{ts,tsx}',
        '!apps/web/src/**/*.d.ts',
        '!apps/web/src/**/*.stories.{ts,tsx}'
      ]
    },
    {
      displayName: 'server',
      testMatch: ['<rootDir>/services/**/*.test.{ts,js}'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/setup/server.ts']
    }
  ],
  
  // Global configuration
  collectCoverageFrom: [
    'apps/**/*.{ts,tsx,js,jsx}',
    'libs/**/*.{ts,tsx,js,jsx}',
    'services/**/*.{ts,js}',
    '!**/*.d.ts',
    '!**/*.stories.{ts,tsx,js,jsx}',
    '!**/node_modules/**'
  ],
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

#### Pytest Configuration
```ini
# services/ai-engine/pytest.ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*

addopts = 
    --strict-markers
    --strict-config
    --verbose
    --cov=src
    --cov-report=term-missing
    --cov-report=html:htmlcov
    --cov-report=xml:coverage.xml
    --cov-fail-under=80
    --asyncio-mode=auto
    --disable-warnings

markers =
    unit: Unit tests
    integration: Integration tests
    slow: Slow tests
    gpu: Tests requiring GPU
    
filterwarnings =
    ignore::DeprecationWarning
    ignore::PendingDeprecationWarning
```

### Performance Testing

#### Load Testing with k6
```javascript
// tests/performance/streaming-load.js
import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    errors: ['rate<0.1'], // Error rate must be below 10%
  },
};

export default function () {
  // Test API endpoints
  const apiResponse = http.get(`${__ENV.API_BASE_URL}/api/streams`);
  
  check(apiResponse, {
    'API status is 200': (r) => r.status === 200,
    'API response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test WebSocket connection
  const wsUrl = `${__ENV.WS_BASE_URL}/ws`;
  const response = ws.connect(wsUrl, {}, function (socket) {
    socket.on('open', () => {
      socket.send(JSON.stringify({
        type: 'subscribe',
        channel: 'stream-updates'
      }));
    });
    
    socket.on('message', (data) => {
      const message = JSON.parse(data);
      check(message, {
        'WebSocket message has type': (m) => m.type !== undefined,
      });
    });
    
    socket.setTimeout(() => {
      socket.close();
    }, 5000);
  });
  
  check(response, {
    'WebSocket connection successful': (r) => r && r.status === 101,
  }) || errorRate.add(1);
  
  sleep(1);
}
```

#### Benchmark Tests (C++)
```cpp
// services/video-processor/benchmarks/processing_benchmark.cpp
#include <benchmark/benchmark.h>
#include <opencv2/opencv.hpp>

#include "core/video_processor.hpp"
#include "gpu/cuda_processor.hpp"

class VideoProcessorBenchmark : public benchmark::Fixture {
public:
    void SetUp(const ::benchmark::State& state) override {
        // Create test frame
        test_frame_ = cv::Mat::zeros(1920, 1080, CV_8UC3);
        cv::randu(test_frame_, cv::Scalar::all(0), cv::Scalar::all(255));
        
        // Initialize processor
        processor_ = std::make_unique<ggp::video::CudaProcessor>();
        processor_->initialize();
    }
    
    void TearDown(const ::benchmark::State& state) override {
        processor_->cleanup();
    }

protected:
    cv::Mat test_frame_;
    std::unique_ptr<ggp::video::VideoProcessor> processor_;
};

BENCHMARK_DEFINE_F(VideoProcessorBenchmark, ColorCorrection)(benchmark::State& state) {
    for (auto _ : state) {
        auto result = processor_->apply_color_correction(test_frame_);
        benchmark::DoNotOptimize(result);
    }
    
    state.SetItemsProcessed(state.iterations());
    state.SetBytesProcessed(state.iterations() * test_frame_.total() * test_frame_.elemSize());
}

BENCHMARK_DEFINE_F(VideoProcessorBenchmark, ChromaKey)(benchmark::State& state) {
    ggp::video::ChromaKeySettings settings{
        .key_color = cv::Vec3b(0, 255, 0),  // Green
        .threshold = 0.3f,
        .softness = 0.1f
    };
    
    for (auto _ : state) {
        auto result = processor_->apply_chroma_key(test_frame_, settings);
        benchmark::DoNotOptimize(result);
    }
}

// Register benchmarks
BENCHMARK_REGISTER_F(VideoProcessorBenchmark, ColorCorrection)
    ->Unit(benchmark::kMillisecond)
    ->Iterations(1000);

BENCHMARK_REGISTER_F(VideoProcessorBenchmark, ChromaKey)
    ->Unit(benchmark::kMillisecond)
    ->Iterations(1000);

BENCHMARK_MAIN();
```

## CI/CD Pipeline

### GitHub Actions Workflow

#### Main Build Pipeline
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Dependency and security scanning
  security-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'

  # Code quality and linting
  code-quality:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run ESLint
      run: npm run lint:ci
    
    - name: Run Prettier
      run: npm run format:check
    
    - name: TypeScript check
      run: npm run type-check

  # Build and test matrix
  build-test:
    needs: [security-scan, code-quality]
    strategy:
      matrix:
        service:
          - name: web
            dockerfile: apps/web/Dockerfile
            context: .
          - name: desktop
            dockerfile: apps/desktop/Dockerfile
            context: .
          - name: api-gateway
            dockerfile: services/api-gateway/Dockerfile
            context: services/api-gateway
          - name: video-processor
            dockerfile: services/video-processor/Dockerfile
            context: services/video-processor
        
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Login to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/${{ matrix.service.name }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
    
    - name: Build and push
      uses: docker/build-push-action@v5
      with:
        context: ${{ matrix.service.context }}
        file: ${{ matrix.service.dockerfile }}
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  # Integration tests
  integration-tests:
    needs: build-test
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: testpass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup test environment
      run: |
        docker-compose -f docker-compose.test.yml up -d
        sleep 30  # Wait for services to be ready
    
    - name: Run integration tests
      run: |
        npm run test:integration
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: integration-test-results
        path: test-results/

  # E2E tests with Playwright
  e2e-tests:
    needs: build-test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Playwright
      run: npx playwright install --with-deps
    
    - name: Start application
      run: |
        docker-compose -f docker-compose.e2e.yml up -d
        npm run wait-for-app
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Upload E2E results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: e2e-test-results
        path: |
          test-results/
          playwright-report/

  # Performance tests
  performance-tests:
    needs: build-test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup k6
      run: |
        sudo gpg -k
        sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
        echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
        sudo apt-get update
        sudo apt-get install k6
    
    - name: Start test environment
      run: docker-compose -f docker-compose.perf.yml up -d
    
    - name: Run performance tests
      run: k6 run tests/performance/load-test.js
    
    - name: Upload performance results
      uses: actions/upload-artifact@v3
      with:
        name: performance-results
        path: performance-results.json

  # Deploy to staging
  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: [integration-tests, e2e-tests]
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-west-2
    
    - name: Deploy to EKS
      run: |
        aws eks update-kubeconfig --name ggp-gfx-staging
        kubectl apply -f k8s/staging/
        kubectl set image deployment/api-gateway api-gateway=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/api-gateway:${{ github.sha }}
        kubectl rollout status deployment/api-gateway

  # Deploy to production
  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [integration-tests, e2e-tests, performance-tests]
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-west-2
    
    - name: Deploy to EKS
      run: |
        aws eks update-kubeconfig --name ggp-gfx-production
        kubectl apply -f k8s/production/
        kubectl set image deployment/api-gateway api-gateway=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/api-gateway:${{ github.sha }}
        kubectl rollout status deployment/api-gateway
```

## Performance Guidelines

### GPU Optimization

#### CUDA Best Practices
```cpp
// Optimal memory management
class CudaMemoryPool {
public:
    void* allocate(size_t size) {
        // Use memory pool to avoid frequent allocations
        auto it = free_blocks_.lower_bound(size);
        if (it != free_blocks_.end()) {
            void* ptr = it->second;
            free_blocks_.erase(it);
            return ptr;
        }
        
        void* ptr;
        cudaMalloc(&ptr, size);
        allocated_blocks_[ptr] = size;
        return ptr;
    }
    
    void deallocate(void* ptr) {
        if (auto it = allocated_blocks_.find(ptr); it != allocated_blocks_.end()) {
            free_blocks_.emplace(it->second, ptr);
            allocated_blocks_.erase(it);
        }
    }

private:
    std::map<size_t, void*> free_blocks_;
    std::map<void*, size_t> allocated_blocks_;
};

// Stream-based processing for concurrency
class CudaStreamProcessor {
public:
    void process_batch(const std::vector<Frame>& frames) {
        const size_t num_streams = std::min(frames.size(), max_streams_);
        
        for (size_t i = 0; i < frames.size(); i += num_streams) {
            // Process frames in parallel using multiple streams
            for (size_t j = 0; j < num_streams && (i + j) < frames.size(); ++j) {
                const size_t frame_idx = i + j;
                const cudaStream_t stream = streams_[j];
                
                // Async memory copy
                cudaMemcpyAsync(device_input_[j], frames[frame_idx].data(), 
                               frames[frame_idx].size(), cudaMemcpyHostToDevice, stream);
                
                // Launch kernel
                launch_processing_kernel<<<grid_size_, block_size_, 0, stream>>>(
                    device_input_[j], device_output_[j], frames[frame_idx].width(), 
                    frames[frame_idx].height());
                
                // Async memory copy back
                cudaMemcpyAsync(host_output_[j], device_output_[j], 
                               frames[frame_idx].size(), cudaMemcpyDeviceToHost, stream);
            }
            
            // Synchronize all streams
            for (size_t j = 0; j < num_streams; ++j) {
                cudaStreamSynchronize(streams_[j]);
            }
        }
    }

private:
    static constexpr size_t max_streams_ = 4;
    std::array<cudaStream_t, max_streams_> streams_;
    std::array<void*, max_streams_> device_input_;
    std::array<void*, max_streams_> device_output_;
    std::array<void*, max_streams_> host_output_;
    
    dim3 grid_size_;
    dim3 block_size_;
};
```

### Memory Management

#### Smart Memory Allocation
```typescript
// Object pooling for frequent allocations
class ObjectPool<T> {
  private available: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  
  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.createFn());
    }
  }
  
  acquire(): T {
    if (this.available.length > 0) {
      return this.available.pop()!;
    }
    return this.createFn();
  }
  
  release(obj: T): void {
    this.resetFn(obj);
    this.available.push(obj);
  }
}

// Usage example
const framePool = new ObjectPool(
  () => new VideoFrame(),
  (frame) => frame.reset(),
  20
);

class VideoProcessor {
  processFrame(inputData: Uint8Array): VideoFrame {
    const frame = framePool.acquire();
    
    try {
      frame.loadData(inputData);
      this.applyEffects(frame);
      return frame;
    } finally {
      // Return to pool when done
      framePool.release(frame);
    }
  }
}
```

### Asynchronous Processing

#### Event-Driven Architecture
```go
// High-performance event processing
type EventProcessor struct {
    workers    int
    inputCh    chan Event
    outputCh   chan ProcessedEvent
    workerPool []chan Event
    wg         sync.WaitGroup
}

func NewEventProcessor(workers int, bufferSize int) *EventProcessor {
    ep := &EventProcessor{
        workers:    workers,
        inputCh:    make(chan Event, bufferSize),
        outputCh:   make(chan ProcessedEvent, bufferSize),
        workerPool: make([]chan Event, workers),
    }
    
    // Create worker goroutines
    for i := 0; i < workers; i++ {
        workerCh := make(chan Event, bufferSize/workers)
        ep.workerPool[i] = workerCh
        
        go ep.worker(i, workerCh, ep.outputCh)
    }
    
    // Start dispatcher
    go ep.dispatch()
    
    return ep
}

func (ep *EventProcessor) worker(id int, input <-chan Event, output chan<- ProcessedEvent) {
    defer ep.wg.Done()
    
    for event := range input {
        // Process event
        processed := ep.processEvent(event)
        
        // Send result
        select {
        case output <- processed:
        case <-time.After(time.Second):
            log.Printf("Worker %d: output channel full, dropping event", id)
        }
    }
}

func (ep *EventProcessor) dispatch() {
    defer ep.wg.Done()
    
    var workerIndex int
    
    for event := range ep.inputCh {
        // Round-robin distribution
        worker := ep.workerPool[workerIndex]
        workerIndex = (workerIndex + 1) % ep.workers
        
        select {
        case worker <- event:
        case <-time.After(100 * time.Millisecond):
            log.Printf("Worker channel full, dropping event")
        }
    }
    
    // Close all worker channels
    for _, worker := range ep.workerPool {
        close(worker)
    }
}
```

## Security Best Practices

### Input Validation

#### Comprehensive Validation
```typescript
import { z } from 'zod';
import DOMPurify from 'dompurify';

// Schema-based validation
const StreamConfigSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title too long')
    .refine(val => DOMPurify.sanitize(val) === val, 'Invalid characters'),
  
  quality: z.enum(['720p', '1080p', '4k']),
  
  bitrate: z.number()
    .min(1000, 'Bitrate too low')
    .max(50000, 'Bitrate too high'),
  
  destinations: z.array(z.object({
    platform: z.enum(['twitch', 'youtube', 'facebook']),
    endpoint: z.string().url('Invalid URL'),
    key: z.string().min(10, 'Stream key too short')
  })).max(10, 'Too many destinations')
});

class ValidationMiddleware {
  static validate<T>(schema: z.ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const validated = schema.parse(req.body);
        req.body = validated;
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({
            error: 'Validation failed',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          });
        } else {
          next(error);
        }
      }
    };
  }
}

// Usage
app.post('/api/streams', 
  ValidationMiddleware.validate(StreamConfigSchema),
  streamController.createStream
);
```

### Authentication & Authorization

#### JWT Security Implementation
```typescript
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { RateLimiterRedis } from 'rate-limiter-flexible';

class SecurityService {
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  
  private rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'login_fail',
    points: SecurityService.MAX_LOGIN_ATTEMPTS,
    duration: 900, // 15 minutes
    blockDuration: 900,
  });
  
  async authenticate(email: string, password: string, ipAddress: string): Promise<AuthResult> {
    // Check rate limiting
    try {
      await this.rateLimiter.consume(ipAddress);
    } catch {
      throw new Error('Too many login attempts');
    }
    
    // Verify credentials
    const user = await this.verifyCredentials(email, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Generate tokens
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      sessionId: crypto.randomUUID()
    };
    
    const accessToken = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET!,
      {
        expiresIn: SecurityService.ACCESS_TOKEN_EXPIRY,
        issuer: 'ggp-gfx-auth',
        audience: 'ggp-gfx-api'
      }
    );
    
    const refreshToken = jwt.sign(
      { sub: user.id, sessionId: tokenPayload.sessionId },
      process.env.REFRESH_SECRET!,
      { expiresIn: SecurityService.REFRESH_TOKEN_EXPIRY }
    );
    
    // Store session
    await this.storeSession(tokenPayload.sessionId, user.id);
    
    return { accessToken, refreshToken, user };
  }
  
  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
      
      // Check if session is still valid
      const sessionValid = await this.isSessionValid(payload.sessionId);
      if (!sessionValid) {
        throw new Error('Session expired');
      }
      
      return payload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
  
  private async verifyCredentials(email: string, password: string): Promise<User | null> {
    const user = await userRepository.findByEmail(email);
    if (!user) return null;
    
    // Use timing-safe comparison
    const hashedPassword = crypto.scryptSync(password, user.salt, 64);
    const storedPassword = Buffer.from(user.password, 'hex');
    
    if (!crypto.timingSafeEqual(hashedPassword, storedPassword)) {
      return null;
    }
    
    return user;
  }
  
  private async storeSession(sessionId: string, userId: string): Promise<void> {
    await redisClient.setex(`session:${sessionId}`, 
      7 * 24 * 60 * 60, // 7 days
      JSON.stringify({ userId, createdAt: Date.now() })
    );
  }
  
  private async isSessionValid(sessionId: string): Promise<boolean> {
    const session = await redisClient.get(`session:${sessionId}`);
    return session !== null;
  }
}
```

### Data Protection

#### Encryption at Rest
```go
package security

import (
    "crypto/aes"
    "crypto/cipher"
    "crypto/rand"
    "encoding/base64"
    "fmt"
)

type EncryptionService struct {
    gcm cipher.AEAD
}

func NewEncryptionService(key []byte) (*EncryptionService, error) {
    if len(key) != 32 {
        return nil, fmt.Errorf("key must be 32 bytes")
    }
    
    block, err := aes.NewCipher(key)
    if err != nil {
        return nil, err
    }
    
    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return nil, err
    }
    
    return &EncryptionService{gcm: gcm}, nil
}

func (e *EncryptionService) Encrypt(plaintext []byte) (string, error) {
    nonce := make([]byte, e.gcm.NonceSize())
    if _, err := rand.Read(nonce); err != nil {
        return "", err
    }
    
    ciphertext := e.gcm.Seal(nonce, nonce, plaintext, nil)
    return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func (e *EncryptionService) Decrypt(ciphertext string) ([]byte, error) {
    data, err := base64.StdEncoding.DecodeString(ciphertext)
    if err != nil {
        return nil, err
    }
    
    nonceSize := e.gcm.NonceSize()
    if len(data) < nonceSize {
        return nil, fmt.Errorf("ciphertext too short")
    }
    
    nonce, ciphertext := data[:nonceSize], data[nonceSize:]
    return e.gcm.Open(nil, nonce, ciphertext, nil)
}

// Usage in database operations
type SecureUserRepository struct {
    db   *sql.DB
    enc  *EncryptionService
}

func (r *SecureUserRepository) CreateUser(user *User) error {
    // Encrypt sensitive fields
    encryptedEmail, err := r.enc.Encrypt([]byte(user.Email))
    if err != nil {
        return err
    }
    
    encryptedPhone, err := r.enc.Encrypt([]byte(user.Phone))
    if err != nil {
        return err
    }
    
    _, err = r.db.Exec(`
        INSERT INTO users (id, encrypted_email, encrypted_phone, created_at)
        VALUES ($1, $2, $3, $4)
    `, user.ID, encryptedEmail, encryptedPhone, time.Now())
    
    return err
}
```

---

Next: [Deployment & Operations →](08-deployment-operations.md)