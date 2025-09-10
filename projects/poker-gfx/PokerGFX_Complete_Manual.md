# PokerGFX User Manual v3.2.0

## Complete Documentation

---

## Table of Contents

### [Quick Start](#quick-start)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [First Time Setup](#first-time-setup)

### [1. Introduction](#1-introduction)
- [1.1 What is PokerGFX?](#11-what-is-pokergfx)
- [1.2 Key Features](#12-key-features)
- [1.3 Usage Scenarios](#13-usage-scenarios)
- [1.4 Evaluation Mode](#14-evaluation-mode)

### [2. License Tiers](#2-license-tiers)
- [2.1 Basic License](#21-basic-license)
- [2.2 Pro License](#22-pro-license)
- [2.3 Enterprise License](#23-enterprise-license)
- [2.4 Feature Comparison](#24-feature-comparison)

### [3. Hardware & System Requirements](#3-hardware--system-requirements)
- [3.1 Minimum PC Specifications](#31-minimum-pc-specifications)
- [3.2 Recommended PC Specifications](#32-recommended-pc-specifications)
- [3.3 Supported Capture Devices](#33-supported-capture-devices)
- [3.4 USB Webcams](#34-usb-webcams)
- [3.5 Network Cameras](#35-network-cameras)
- [3.6 NDI Sources and Outputs](#36-ndi-sources-and-outputs)

### [4. Getting Started](#4-getting-started)
- [4.1 Software Installation](#41-software-installation)
- [4.2 RFID Reader Setup](#42-rfid-reader-setup)
- [4.3 Table Calibration](#43-table-calibration)
- [4.4 Registering Playing Cards](#44-registering-playing-cards)
- [4.5 Checking a Deck](#45-checking-a-deck)

### [5. Playing a Game](#5-playing-a-game)
- [5.1 Tag Players](#51-tag-players)
- [5.2 During the Game](#52-during-the-game)
- [5.3 Game Graphics](#53-game-graphics)
- [5.4 Player Photos](#54-player-photos)
- [5.5 Player Country Flags](#55-player-country-flags)
- [5.6 Switching Between Different Games](#56-switching-between-different-games)

### [6. The Server Interface](#6-the-server-interface)
- [6.1 Main Window](#61-main-window)
- [6.2 Video Preview](#62-video-preview)
- [6.3 Recording a Game](#63-recording-a-game)
- [6.4 System Status Icons](#64-system-status-icons)

### [7. Video Sources Configuration](#7-video-sources-configuration)
- [7.1 Sources Tab](#71-sources-tab)
- [7.2 Auto Camera Switching](#72-auto-camera-switching)
- [7.3 Camera Transitions](#73-camera-transitions)
- [7.4 Using an External Switcher](#74-using-an-external-switcher)
- [7.5 Audio Input](#75-audio-input)
- [7.6 External Keying](#76-external-keying)

### [8. ATEM Video Switcher Control](#8-atem-video-switcher-control)
- [8.1 Remote Control Setup](#81-remote-control-setup)
- [8.2 Configuration](#82-configuration)
- [8.3 Operation](#83-operation)

### [9. Outputs Configuration](#9-outputs-configuration)
- [9.1 Streaming Settings](#91-streaming-settings)
- [9.2 Recording Settings](#92-recording-settings)
- [9.3 Vertical Video (9x16)](#93-vertical-video-9x16)
- [9.4 Preview Outputs](#94-preview-outputs)

### [10. Secure Delay](#10-secure-delay)
- [10.1 Basic Configuration](#101-basic-configuration)
- [10.2 Auto Delay](#102-auto-delay)
- [10.3 Delay Countdown](#103-delay-countdown)
- [10.4 Dynamic Delay](#104-dynamic-delay)

### [11. Graphics Settings](#11-graphics-settings)
- [11.1 GFX 1, GFX 2 & GFX 3](#111-gfx-1-gfx-2--gfx-3)
- [11.2 Player Display Options](#112-player-display-options)
- [11.3 Layout Options](#113-layout-options)
- [11.4 Branding and Logos](#114-branding-and-logos)
- [11.5 Advanced Graphics Options](#115-advanced-graphics-options)

### [12. PIP (Picture-in-Picture)](#12-pip-picture-in-picture)
- [12.1 Configuration](#121-configuration)
- [12.2 Display Options](#122-display-options)
- [12.3 Remote Computer Display](#123-remote-computer-display)

### [13. System Settings](#13-system-settings)
- [13.1 Server Settings](#131-server-settings)
- [13.2 Game Settings](#132-game-settings)
- [13.3 Network Settings](#133-network-settings)
- [13.4 Security Settings](#134-security-settings)

### [14. Advanced Features](#14-advanced-features)
- [14.1 Commentary Booth](#141-commentary-booth)
- [14.2 Stream Deck Integration](#142-stream-deck-integration)
- [14.3 Twitch Integration](#143-twitch-integration)
- [14.4 Live API (Enterprise)](#144-live-api-enterprise)

### [15. Skins System](#15-skins-system)
- [15.1 Built-in Skins](#151-built-in-skins)
- [15.2 Skin Editor](#152-skin-editor)
- [15.3 Custom Elements](#153-custom-elements)
- [15.4 4K Skins](#154-4k-skins)

### [16. Action Tracker](#16-action-tracker)
- [16.1 Installation](#161-installation)
- [16.2 The Interface](#162-the-interface)
- [16.3 Connecting to Server](#163-connecting-to-server)
- [16.4 Operating Modes](#164-operating-modes)
- [16.5 Entering Player Actions](#165-entering-player-actions)
- [16.6 Special Situations](#166-special-situations)
- [16.7 Keyboard Shortcuts](#167-keyboard-shortcuts)

### [17. MultiGFX](#17-multigfx)
- [17.1 Overview](#171-overview)
- [17.2 Configuration](#172-configuration)
- [17.3 Limitations and Requirements](#173-limitations-and-requirements)

### [18. Studio (Pro License)](#18-studio-pro-license)
- [18.1 Introduction](#181-introduction)
- [18.2 Using the Studio](#182-using-the-studio)
- [18.3 Video Player](#183-video-player)
- [18.4 Video Library](#184-video-library)
- [18.5 Playlist](#185-playlist)
- [18.6 Hand Editor](#186-hand-editor)
- [18.7 Event Editor](#187-event-editor)
- [18.8 Rendering the Video](#188-rendering-the-video)

### [19. Troubleshooting](#19-troubleshooting)
- [19.1 Common Issues](#191-common-issues)
- [19.2 RFID Reader Problems](#192-rfid-reader-problems)
- [19.3 Video Source Issues](#193-video-source-issues)
- [19.4 Streaming Problems](#194-streaming-problems)
- [19.5 Performance Optimization](#195-performance-optimization)

### [20. Appendix](#20-appendix)
- [20.1 Keyboard Shortcuts](#201-keyboard-shortcuts)
- [20.2 Supported File Formats](#202-supported-file-formats)
- [20.3 Network Ports](#203-network-ports)
- [20.4 FCC Warning & IC Caution](#204-fcc-warning--ic-caution)

---

## Quick Start

### System Requirements

**Minimum Requirements:**
- Windows 10 (64-bit) or Windows 11
- Intel Core i7 8th gen or AMD Ryzen equivalent
- 16GB RAM
- NVIDIA GTX 1080 or equivalent GPU
- 500GB SSD with free space
- USB 3.0 ports

### Installation

1. Download PokerGFX installer from www.pokergfx.io
2. Run installer as Administrator
3. Connect USB security dongle
4. Launch PokerGFX Server

### First Time Setup

1. **Connect RFID Reader** via USB
2. **Calibrate Table** (Settings → RFID → Calibrate)
3. **Register Playing Cards** (Settings → RFID → Register Deck)
4. **Configure Video Sources** (Sources tab)
5. **Set Output Destination** (Outputs tab)

---

## 1. Introduction

### 1.1 What is PokerGFX?

PokerGFX is a powerful video titling software suite that generates real-time poker graphics for video overlay. When used with the RFID Reader, it automatically detects hole and community cards with no human intervention. It can also be used with conventional 'hole cam' tables by entering card information manually.

The system consists of:
- **PokerGFX Server**: Main application running on Windows PC
- **RFID Reader**: Hardware device that detects playing cards
- **Action Tracker**: Companion app for entering betting actions
- **Studio** (Pro): Post-production editing suite

### 1.2 Key Features

- **Automatic Card Detection**: RFID technology tracks all cards in real-time
- **GPU Accelerated**: All video processing performed on GPU for maximum performance
- **Multi-Camera Support**: Up to 16 video sources (depending on license)
- **Live Streaming**: Direct integration with Twitch, YouTube, Facebook
- **Security Delay**: Protect game integrity with 1-60 minute delay
- **Professional Graphics**: Broadcast-quality overlays and animations
- **Post Production**: Complete editing suite for recorded games

### 1.3 Usage Scenarios

#### Scenario 1: Live Streaming with Internal Mixing
```
Cameras → PokerGFX → Graphics Overlay → Stream to Platform
         ↓
    Auto Switching
```

#### Scenario 2: Professional Broadcast
```
Cameras → External Switcher → PokerGFX → Graphics Overlay
                            ↓
                     Multiple Outputs
```

#### Scenario 3: Post Production
```
Record Game → Studio → Edit Timeline → Render with Graphics
```

### 1.4 Evaluation Mode

If no dongle is detected, PokerGFX runs in evaluation mode:
- All features are functional
- Watermark appears every 30 seconds
- No time limit for testing
- Purchase license to remove watermark

---

## 2. License Tiers

### 2.1 Basic License

**Target Users**: Home games, hobbyists, first-time users

**Features Include:**
- Graphics overlay on up to 4 video sources
- Basic skins and animations
- Manual card entry mode
- RFID table support
- Recording and streaming
- Action Tracker included
- Standard transitions
- Basic audio mixing

**Limitations:**
- No Studio (post-production)
- No player photos
- No sponsor logos
- No ATEM control
- Limited to 30-minute delay

### 2.2 Pro License

**Target Users**: Serious streamers, small production companies

**All Basic Features PLUS:**
- Graphics overlay on up to 8 video sources
- Advanced skins with full customization
- Studio post-production tools
- Player photos and country flags
- Sponsor logos (Leaderboard, Board, Strip)
- PIP (Picture-in-Picture) support
- ATEM video switcher control
- Secure delay up to 60 minutes
- MultiGFX support for multiple outputs
- Commentary booth features
- Advanced animations
- Custom card designs

### 2.3 Enterprise License

**Target Users**: Broadcasting companies, large tournaments

**All Pro Features PLUS:**
- Graphics overlay on up to 16 video sources
- Live API for custom integrations
- NDI input and output support
- Blackmagic Decklink output
- Multiple simultaneous outputs
- Priority technical support
- Custom development available
- Floating licenses
- Cloud integration options
- Advanced security features

### 2.4 Feature Comparison

| Feature | Basic | Pro | Enterprise |
|---------|-------|-----|------------|
| Video Sources | 4 | 8 | 16 |
| RFID Support | ✓ | ✓ | ✓ |
| Streaming | ✓ | ✓ | ✓ |
| Recording | ✓ | ✓ | ✓ |
| Action Tracker | ✓ | ✓ | ✓ |
| Studio | ✗ | ✓ | ✓ |
| Player Photos | ✗ | ✓ | ✓ |
| Sponsor Logos | ✗ | ✓ | ✓ |
| Secure Delay | 30 min | 60 min | 60 min |
| ATEM Control | ✗ | ✓ | ✓ |
| NDI Support | Input Only | Input Only | Input/Output |
| API Access | ✗ | ✗ | ✓ |
| Support | Community | Standard | Priority |

---

## 3. Hardware & System Requirements

### 3.1 Minimum PC Specifications

- **Operating System**: Windows 10 (64-bit) 20H2 or newer
- **Processor**: Intel Core i7 8th generation or AMD Ryzen 5 2600
- **Memory**: 16GB DDR4 RAM
- **Graphics**: NVIDIA GeForce GTX 1080 or AMD RX 5700
- **Storage**: 500GB SSD (50GB free for delay buffer)
- **Network**: Gigabit Ethernet recommended
- **USB**: At least 2x USB 3.0 ports

### 3.2 Recommended PC Specifications

For optimal performance with 8 sources at 4K:

- **Operating System**: Windows 11 Pro
- **Processor**: Intel Core i9 12th gen or AMD Ryzen 9 5900X
- **Memory**: 32GB DDR4 RAM (64GB for 4K production)
- **Graphics**: NVIDIA RTX 3080 or better
- **Storage**: 2TB NVMe SSD
- **Network**: 10 Gigabit Ethernet
- **USB**: USB 3.2 Gen 2 ports

### 3.3 Supported Capture Devices

**Blackmagic Design:**
- DeckLink Mini Recorder 4K
- DeckLink Duo 2
- DeckLink 8K Pro
- UltraStudio 4K Mini

**Magewell:**
- USB Capture HDMI 4K Plus
- USB Capture SDI 4K Plus
- Pro Capture Series

**Elgato:**
- HD60 S+
- 4K60 Pro MK.2
- Cam Link 4K

**AVerMedia:**
- Live Gamer 4K
- Live Gamer Duo
- BU110

### 3.4 USB Webcams

Recommended models for best compatibility:

**Logitech:**
- Brio 4K
- C920/C922 HD Pro
- StreamCam

**Microsoft:**
- LifeCam Studio
- Modern Webcam

**Razer:**
- Kiyo Pro

Requirements:
- 1920x1080 @ 30fps minimum
- DirectShow compatibility
- USB 3.0 connection recommended

### 3.5 Network Cameras

Supported protocols:
- **RTSP**: Standard streaming protocol
- **HTTP**: MJPEG streams
- **ONVIF**: Auto-discovery compatible

Compatible brands:
- Axis Communications
- Hikvision
- Dahua
- Ubiquiti
- Generic IP cameras with RTSP

### 3.6 NDI Sources and Outputs

**NDI Input (All licenses):**
- Automatic discovery on local network
- Support for NDI 5.0 and newer
- Full resolution up to 4K
- Low latency mode available

**NDI Output (Enterprise only):**
- Broadcast program feed to network
- Separate graphics-only feed
- Alpha channel support
- Configurable bandwidth

---

## 4. Getting Started

### 4.1 Software Installation

#### Step 1: Download
1. Visit www.pokergfx.io
2. Click "Download" and select your version
3. Save installer to your computer

#### Step 2: Install
1. Right-click installer and select "Run as Administrator"
2. Follow installation wizard
3. Choose installation directory (default: C:\Program Files\PokerGFX)
4. Select components to install

#### Step 3: License Activation
1. Insert USB dongle into any USB port
2. Launch PokerGFX Server
3. Dongle will be detected automatically
4. If using multiple dongles, all will be recognized

### 4.2 RFID Reader Setup

#### Hardware Connection
1. **Power Connection**:
   - Connect power adapter to RFID Reader
   - Plug into wall outlet
   - Green LED indicates power

2. **USB Connection**:
   - Use provided USB cable
   - Connect to USB 3.0 port (blue port)
   - Windows will install drivers automatically

3. **Network Setup (Optional)**:
   - For WiFi operation, configure via Settings
   - Reduces cable clutter
   - Allows remote placement

#### Initial Configuration
1. Launch PokerGFX Server
2. Navigate to Settings → RFID
3. Status should show "Connected"
4. Note the Reader Serial Number

### 4.3 Table Calibration

Calibration teaches the system your table's physical layout.

#### Calibration Process:

1. **Start Calibration**:
   - Settings → RFID → Calibrate Table
   - Calibration wizard opens

2. **Player Positions**:
   - Place one card at Seat 1
   - Click "Detect"
   - Repeat for all seats (up to 10)

3. **Board Positions**:
   - Place cards on:
     - Flop position (3 cards)
     - Turn position (1 card)
     - River position (1 card)

4. **Special Positions**:
   - Muck area
   - Dealer position (optional)
   - Burn card area (optional)

5. **Save Calibration**:
   - Review detected positions
   - Click "Save Calibration"
   - Data stored permanently

### 4.4 Registering Playing Cards

Each deck must be registered before use.

#### Registration Process:

1. **Prepare Deck**:
   - Ensure all 52 cards present
   - Cards should be clean
   - Remove jokers

2. **Start Registration**:
   ```
   Settings → RFID → Register Deck
   ```

3. **Scan Cards**:
   - Follow on-screen prompts
   - Place each card on reader
   - System identifies rank and suit
   - Progress bar shows completion

4. **Verification**:
   - System displays all detected cards
   - Check for missing cards
   - Verify correct detection

5. **Save Deck**:
   - Name your deck (e.g., "Red Deck 1")
   - Click "Save"
   - Can register multiple decks

### 4.5 Checking a Deck

Before each session, verify deck integrity:

1. **Quick Check**:
   ```
   Action Tracker → CHECK button
   ```

2. **Process**:
   - Shuffle deck thoroughly
   - Deal all cards face-down
   - System counts and verifies
   - Results show missing/duplicate cards

3. **Troubleshooting**:
   - Clean cards if not reading
   - Check for damaged RFID chips
   - Re-register if necessary

---

## 5. Playing a Game

### 5.1 Tag Players

Optional but recommended for better graphics:

1. **Access Player Tagging**:
   - Right-click seat in Action Tracker
   - Select "Tag Player"

2. **Enter Information**:
   - Player name
   - Country (for flag display)
   - Photo (Pro license)
   - Chip count

3. **Player Database**:
   - Names saved automatically
   - Quick selection for regulars
   - Import/export player lists

### 5.2 During the Game

#### Automatic Functions:
- Card detection when dealt
- Pot calculation based on actions
- Board cards recognized instantly
- Player positions tracked

#### Manual Input Required:
- Betting actions (fold, check, call, raise)
- All-in amounts
- Side pot creation
- Winner designation (if needed)

### 5.3 Game Graphics

Graphics update automatically based on:
- Current action
- Player positions
- Pot size
- Community cards
- Betting rounds

#### Display Elements:
- Player names and chips
- Hole cards (when appropriate)
- Pot size(s)
- Board cards
- Action indicators
- Betting amounts

### 5.4 Player Photos

**Requirements**: Pro or Enterprise license

#### Adding Photos:

1. **During Game**:
   - Right-click player
   - Select "Photo"
   - Choose image file
   - Auto-cropped to circle

2. **Bulk Import**:
   - Media → Import Player Photos
   - Match names to files
   - Batch processing

3. **Photo Specifications**:
   - Format: JPG or PNG
   - Minimum: 400x400 pixels
   - Automatic face detection
   - Stored in media library

### 5.5 Player Country Flags

Display player nationality:

1. **Set Country**:
   - Right-click player
   - Select "Country"
   - Choose from list
   - Flag appears in graphics

2. **Custom Flags**:
   - Add to flags folder
   - PNG format, 3:2 ratio
   - Automatic sizing

### 5.6 Switching Between Different Games

PokerGFX supports multiple poker variants:

#### Hold'em Games:
- No Limit Hold'em
- Limit Hold'em
- Pot Limit Hold'em

#### Omaha Variants:
- Pot Limit Omaha (4 cards)
- Pot Limit Omaha Hi/Lo
- 5-Card Omaha
- 6-Card Omaha (Big O)

#### Other Games:
- Seven Card Stud
- Stud Hi/Lo
- Razz
- 2-7 Triple Draw
- Badugi
- Mixed Games (HORSE, 8-Game)

#### Switching Process:
1. End current hand
2. Settings → Game → Variant
3. Select new game
4. Graphics update automatically

---

## 6. The Server Interface

### 6.1 Main Window

The main PokerGFX Server window contains:

```
┌─────────────────────────────────────┐
│  PokerGFX Server - Table Name       │
├─────────────────────────────────────┤
│                                     │
│         Live Video Preview          │
│         (Security Mode)             │
│                                     │
├─────────────────────────────────────┤
│ Table: ●  Network: ●  Stream: ●     │
│ Rec: ●   CPU: 45%   GPU: 62%       │
└─────────────────────────────────────┘
```

#### Status Indicators:

**Table Health** 🟢🟡🔴
- Green: Excellent connection
- Yellow: Minor issues
- Red: Connection problems

**Network Health** 🟢🟡🔴
- Green: Action Tracker connected
- Yellow: Intermittent connection
- Red: Disconnected

**Stream Status** 🟢⚫
- Green: Actively streaming
- Gray: Not streaming

**Record Status** 🟢⚫
- Green: Recording active
- Gray: Not recording

### 6.2 Video Preview

#### Security Preview:
- Shows watermarked preview when delay active
- Displays "SECURITY MODE" overlay
- Hole cards shown face down
- Prevents accidental information leaks

#### Live Preview Options:
- Right-click for options menu
- Toggle preview quality
- Enable/disable audio monitoring
- Snapshot function

### 6.3 Recording a Game

#### Recording Modes:

1. **Game Data Only**:
   - Records actions and cards
   - No video file
   - Smallest file size
   - For post-production workflow

2. **Game Data with Video**:
   - Full stream recording
   - Includes graphics
   - Large file size

3. **Clean Feed**:
   - Video without graphics
   - Game data separate
   - Maximum flexibility

#### Recording Settings:
```
Outputs → Recording:
- Format: MP4/MOV/ProRes
- Quality: High/Medium/Low
- Location: Local/Network
- Split by: Time/Hand
```

#### File Management:
- Auto-naming with timestamp
- Hand-based splitting option
- Automatic cleanup options
- Network storage support

### 6.4 System Status Icons

#### Performance Monitoring:

**CPU Usage**: 
- Green: < 70%
- Yellow: 70-85%
- Red: > 85%

**GPU Usage**:
- Green: < 80%
- Yellow: 80-90%
- Red: > 90%

**Memory**:
- Displays used/total
- Warning at 80%

**Temperature**:
- CPU and GPU temps
- Thermal throttling warnings

---

## 7. Video Sources Configuration

### 7.1 Sources Tab

Access all video configuration:

```
Sources Tab Layout:
┌─────────────────────────────────┐
│ Name    Type    Res    FPS  On  │
├─────────────────────────────────┤
│ Cam 1   USB    1080p   30   ✓   │
│ Cam 2   USB    1080p   30   ✓   │
│ Table   HDMI   4K      60   ✓   │
│ Screen  NDI    1080p   60   ✓   │
└─────────────────────────────────┘
```

#### Adding Sources:

1. **USB Cameras**:
   - Auto-detected
   - Select from dropdown
   - Configure resolution/framerate

2. **Capture Cards**:
   - Requires drivers installed
   - HDMI/SDI inputs
   - Format detection

3. **NDI Sources**:
   - Network auto-discovery
   - Manual IP entry option
   - Bandwidth settings

4. **IP Cameras**:
   - Enter RTSP URL
   - Authentication if required
   - Buffer settings

### 7.2 Auto Camera Switching

Intelligent camera switching based on game action:

#### Switching Modes:

**Follow Players**:
- Switches to active player
- Configurable delay
- Smooth transitions

**Follow Board**:
- Wide shot for flop
- Returns to players after

**Cycle Mode**:
- Rotates through all cameras
- Configurable timing
- Manual override available

#### Configuration:
```
Sources → Auto Switch:
- Mode: Follow/Cycle/Manual
- Delay: 0-5 seconds
- Transition: Cut/Fade
- Exclude cameras option
```

### 7.3 Camera Transitions

Professional transitions between sources:

#### Transition Types:

1. **Cut** (0ms):
   - Instant switch
   - No processing overhead
   - Traditional broadcast style

2. **Fade** (100-2000ms):
   - Smooth blend
   - Adjustable duration
   - CPU efficient

3. **Wipe** (Pro):
   - Directional transitions
   - Multiple patterns
   - Customizable speed

4. **Custom** (Pro):
   - Import transition files
   - Alpha channel support
   - Stinger transitions

### 7.4 Using an External Switcher

Integration with professional video switchers:

#### Setup Process:

1. **Connect Program Output**:
   - Switcher → Capture Card
   - Full resolution recommended
   - Verify signal format

2. **Configure PokerGFX**:
   ```
   Sources → External Switcher:
   - Input: Select capture device
   - Mode: External Mix
   - Keying: Internal/External
   ```

3. **Keying Options**:
   - **Internal**: PokerGFX composites
   - **External**: Output key/fill
   - **Chroma**: Green screen output

### 7.5 Audio Input

Comprehensive audio configuration:

#### Audio Sources:
- Camera embedded audio
- Dedicated audio interface
- System sounds
- NDI audio streams

#### Configuration:
```
Audio Settings:
- Device: [Select Input]
- Volume: 0-100%
- Sync: -5000 to +5000ms
- Monitoring: On/Off
```

#### Sync Adjustment:
- Negative: Audio plays earlier
- Positive: Audio plays later
- Test with clap sync

### 7.6 External Keying

For professional broadcast workflows:

#### Key/Fill Output:
1. Requires two outputs
2. Key = Alpha channel
3. Fill = Color information
4. Frame-accurate sync

#### Chroma Key Output:
1. Green screen background
2. Adjustable key color
3. Spill suppression
4. Clean edges

---

## 8. ATEM Video Switcher Control

### 8.1 Remote Control Setup

**Requirements**: Pro or Enterprise license

#### Compatible Models:
- ATEM Mini series
- ATEM Constellation
- ATEM Production Studio
- ATEM Television Studio

### 8.2 Configuration

1. **Network Setup**:
   ```
   ATEM IP Address: 192.168.1.240
   Connection Port: 9910 (default)
   ```

2. **Input Mapping**:
   ```
   PokerGFX Camera 1 → ATEM Input 1
   PokerGFX Camera 2 → ATEM Input 2
   etc.
   ```

3. **Enable Control**:
   - Sources → ATEM Control → Enable
   - Test connection
   - Verify input switching

### 8.3 Operation

PokerGFX automatically controls ATEM:
- Follows game action
- Switches inputs
- Maintains sync
- Override available

---

## 9. Outputs Configuration

### 9.1 Streaming Settings

#### Platform Configuration:

**Twitch**:
```
Server: Auto (recommended)
Stream Key: [Your key]
Bitrate: 6000 kbps
Keyframe: 2 seconds
```

**YouTube**:
```
Server: Primary
Stream Key: [Your key]
Bitrate: 4500-9000 kbps
Keyframe: 2 seconds
```

**Facebook**:
```
Server URL: Custom
Stream Key: [Your key]
Bitrate: 4000 kbps
Max 1080p 30fps
```

**Custom RTMP**:
```
URL: rtmp://your-server/live
Key: stream-key
Full URL support
```

#### Encoding Settings:
- Codec: H.264/H.265
- Profile: High
- Preset: Quality/Balanced/Speed
- B-frames: 2
- Reference frames: 3

### 9.2 Recording Settings

#### Recording Formats:

**MP4**:
- Universal compatibility
- Moderate file size
- H.264/H.265 codec

**MOV**:
- ProRes option (Pro)
- Higher quality
- Larger files

**MKV**:
- Recovery features
- Multiple audio tracks
- Flexible container

#### Quality Presets:

**Broadcast Quality**:
- Bitrate: 50 Mbps
- Format: ProRes 422
- Color: 4:2:2 10-bit

**High Quality**:
- Bitrate: 25 Mbps
- Format: H.264 High
- Color: 4:2:0 8-bit

**Standard Quality**:
- Bitrate: 10 Mbps
- Format: H.264 Main
- Suitable for web

### 9.3 Vertical Video (9x16)

For mobile-first platforms:

1. **Enable Vertical Mode**:
   ```
   Outputs → Format → 9:16 Vertical
   ```

2. **Layout Adjustments**:
   - Graphics reposition automatically
   - Player boxes stack vertically
   - Board remains visible

3. **Platform Support**:
   - Instagram Live
   - TikTok
   - YouTube Shorts
   - Facebook Stories

### 9.4 Preview Outputs

Additional output options:

**Video Preview**:
- Secondary monitor output
- Full quality preview
- Configurable display

**NDI Output** (Enterprise):
- Network video distribution
- Multiple receivers
- Alpha channel support

**Decklink Output** (Enterprise):
- Professional SDI/HDMI
- Broadcast equipment
- Timecode support

---

## 10. Secure Delay

### 10.1 Basic Configuration

Protect game integrity with time delay:

1. **Enable Delay**:
   ```
   Outputs → Secure Delay → Enable
   Delay Time: 1-60 minutes
   ```

2. **Storage Requirements**:
   - 1080p: ~50GB per hour
   - 4K: ~200GB per hour
   - Fast SSD recommended

3. **Security Features**:
   - Encrypted storage
   - No preview access
   - Watermarked monitoring

### 10.2 Auto Delay

Automatic delay based on pot size:

```
Settings:
- Threshold: $1,000
- Delay: 30 minutes
- Increase: 1 min per $1,000
- Maximum: 60 minutes
```

### 10.3 Delay Countdown

Visual countdown in corner:
- Shows time remaining
- Updates each second
- Customizable position
- Hide option available

### 10.4 Dynamic Delay

Variable delay for extra security:
- Random 5-10 minute variation
- Changes each hand
- Prevents timing attacks
- Maintains minimum delay

---

## 11. Graphics Settings

### 11.1 GFX 1, GFX 2 & GFX 3

Three independent graphics outputs:

**GFX 1 - Main Output**:
- Full graphics package
- All elements enabled
- Primary stream output

**GFX 2 - Clean Feed**:
- Minimal graphics
- Commentary friendly
- Secondary output

**GFX 3 - Feature Table**:
- Enhanced graphics
- Special animations
- Premium production

### 11.2 Player Display Options

Control when players appear:

**Always**: 
- Constant display
- Full information

**On Action**: 
- Shows when betting
- Cleaner look

**After Bet**: 
- Post-flop only
- Reduces clutter

**At Showdown**: 
- Maximum suspense
- Cards revealed last

### 11.3 Layout Options

Multiple layout presets:

**Standard Layouts**:
1. Classic - Traditional TV style
2. Modern - Clean minimal design
3. Corner - Compact corner display
4. Full - Maximum information
5. Mobile - Optimized for phones

**Custom Positioning**:
- Drag and drop interface
- Pixel-perfect placement
- Save custom layouts
- Quick switching

### 11.4 Branding and Logos

**Logo Positions** (Pro license):

**Leaderboard Logo**:
- Top of chip counts
- 300x100 pixels recommended
- PNG with transparency

**Board Logo**:
- Next to community cards
- Scales automatically
- Multiple positions

**Strip Logo**:
- Ticker area placement
- Continuous visibility
- Animated options

### 11.5 Advanced Graphics Options

**Animations**:
- Card reveal effects
- Pot award animations
- Player eliminations
- Custom celebrations

**Statistics Display**:
- VPIP/PFR percentages
- Hand count
- Win rate
- Stack trends

**Special Effects**:
- Particle systems
- Glow effects
- Motion blur
- 3D card flips

---

## 12. PIP (Picture-in-Picture)

### 12.1 Configuration

Add secondary video sources:

1. **Enable PIP**:
   ```
   Graphics → PIP → Enable
   ```

2. **Select Source**:
   - Additional camera
   - Computer screen
   - Media player
   - Network source

### 12.2 Display Options

**Positioning**:
- Drag to any location
- Snap to grid
- Preset positions
- Size handles

**Appearance**:
- Border: Color/width
- Shadow: Drop shadow
- Opacity: 0-100%
- Corner radius

**Timing**:
- Always visible
- Between hands
- During specific events
- Manual control

### 12.3 Remote Computer Display

Show remote screens:

1. **Setup Remote Access**:
   - Install VNC server
   - Configure permissions
   - Note IP address

2. **Connect from PokerGFX**:
   ```
   PIP → Remote → Add
   Protocol: VNC
   Address: 192.168.1.100
   Password: [if required]
   ```

3. **Use Cases**:
   - Tournament clock
   - Leaderboard display
   - Statistics dashboard
   - Sponsor content

---

## 13. System Settings

### 13.1 Server Settings

Core system configuration:

**Performance**:
```
GPU Selection: [Select GPU]
Memory Limit: 8GB
Thread Priority: High
Preview Quality: Medium
```

**Storage**:
```
Recording Path: D:\Recordings
Temp Path: D:\Temp
Auto-cleanup: 7 days
Low space warning: 100GB
```

**Network**:
```
API Port: 8080
WebSocket Port: 8081
Discovery: Enabled
Firewall: Auto-configure
```

### 13.2 Game Settings

Customize game rules:

**Betting Structure**:
- No Limit
- Pot Limit
- Fixed Limit
- Mixed Limit

**Blind Configuration**:
- Small/Big blind amounts
- Ante settings
- Bring-in (Stud games)
- Blind increase schedule

**Special Rules**:
- Straddle options
- Bomb pot frequency
- Run it twice
- Insurance allowed

### 13.3 Network Settings

**Port Configuration**:
```
HTTP API: 8080
WebSocket: 8081
RTMP Server: 1935
mDNS: 5353
NDI: 5960-5969
```

**Security**:
- IP whitelist
- API authentication
- SSL/TLS support
- Rate limiting

### 13.4 Security Settings

**Access Control**:
- Table password required
- Action Tracker authentication
- API token system
- User permissions

**Data Protection**:
- Encrypted storage
- Secure communications
- Audit logging
- Backup encryption

---

## 14. Advanced Features

### 14.1 Commentary Booth

Provide delayed information to commentators:

**Setup**:
1. Enable Commentary Booth
2. Set delay to match stream
3. Configure network access
4. Provide login credentials

**Commentator View**:
- Delayed statistics
- Hand histories
- Player information
- Real-time chat

**Features**:
- Pot odds calculator
- Hand range analysis
- Historical statistics
- Note taking system

### 14.2 Stream Deck Integration

Control PokerGFX with Elgato Stream Deck:

**Setup Process**:
1. Install Stream Deck software
2. Download PokerGFX plugin
3. Configure connection
4. Assign buttons

**Available Actions**:
- Camera switching
- Graphics toggle
- Recording control
- Scene selection
- Custom macros

**Advanced Controls**:
- Multi-actions
- Conditional logic
- Status indicators
- Custom icons

### 14.3 Twitch Integration

Deep integration with Twitch platform:

**ChatBot Features**:
- Automatic hand updates
- Viewer commands
- Statistics queries
- Prediction integration

**Viewer Commands**:
```
!stats - Current statistics
!pot - Current pot size
!stacks - Chip counts
!odds - Hand odds
!history - Recent hands
```

**Channel Points**:
- Trigger animations
- Show statistics
- Request replays
- Prediction betting

### 14.4 Live API (Enterprise)

Real-time data access for custom integrations:

**REST Endpoints**:
```
GET /api/v1/game/state
GET /api/v1/players
GET /api/v1/hands/current
POST /api/v1/graphics/show
```

**WebSocket Events**:
```javascript
ws://server:8081/live

Events:
- hand.start
- player.action
- board.revealed
- pot.awarded
- hand.complete
```

**Authentication**:
```
Headers:
Authorization: Bearer <api-token>
Content-Type: application/json
```

---

## 15. Skins System

### 15.1 Built-in Skins

Professional designs included:

**Classic**: 
- Traditional TV poker style
- Time-tested design
- Maximum readability

**Modern**:
- Clean minimalist look
- Flat design elements
- Mobile optimized

**Neon**:
- Vibrant colors
- Glow effects
- Night stream friendly

**Tournament**:
- Official event style
- Sponsor ready
- Broadcast quality

**Custom Base**:
- Starting template
- Full customization
- Your branding

### 15.2 Skin Editor

Create unique looks:

**Access Editor**:
```
Graphics → Skins → Edit
```

**Editing Tools**:
- Color picker
- Gradient editor
- Font selection
- Size adjustment
- Animation timeline

**Elements to Customize**:
- Player boxes
- Card backs
- Pot display
- Board area
- Transitions
- Backgrounds

### 15.3 Custom Elements

**Player Boxes**:
```
Components:
- Background shape
- Border style
- Name placement
- Chip position
- Card layout
- Action indicator
```

**Community Board**:
```
Options:
- Card spacing
- Background style
- Animation type
- Label format
```

**Special Effects**:
- Particle systems
- Glow effects
- Shadows
- Reflections
- Motion blur

### 15.4 4K Skins

Ultra HD considerations:

**Scaling Options**:
- Auto-scale from HD
- Native 4K design
- Resolution switching

**Performance**:
- GPU optimization
- Texture compression
- LOD system

---

## 16. Action Tracker

### 16.1 Installation

Action Tracker setup options:

**Same PC Installation**:
1. Included with PokerGFX
2. Launches automatically
3. Uses second monitor

**Network Installation**:
1. Download installer
2. Run on tablet/laptop
3. Enter server IP
4. Connect via WiFi

**System Requirements**:
- Windows 10 or newer
- 4GB RAM minimum
- WiFi recommended
- Touch screen preferred

### 16.2 The Interface

```
┌─────────────────────────────────────┐
│          ACTION TRACKER             │
├─────────────────────────────────────┤
│     [1] [2] [3] [4] [5]            │
│                                     │
│     [D]                             │
│                                     │
│     [10] [9] [8] [7] [6]           │
├─────────────────────────────────────┤
│ POT: $2,450  BOARD: [A♠][K♦][Q♣]  │
├─────────────────────────────────────┤
│ [FOLD][CHECK][CALL][RAISE][ALLIN]  │
└─────────────────────────────────────┘
```

**Interface Elements**:
- Player positions (1-10)
- Dealer button (D)
- Community cards display
- Current pot size
- Action buttons
- Chip adjustment controls

### 16.3 Connecting to Server

**Connection Process**:
1. Launch Action Tracker
2. Enter server IP address
3. Enter table password (if set)
4. Click "Connect"

**Connection Status**:
- Green: Connected
- Yellow: Connecting
- Red: Disconnected

**Troubleshooting**:
- Verify same network
- Check firewall settings
- Confirm server running
- Test with ping

### 16.4 Operating Modes

**Auto Mode (RFID)**:
- Cards detected automatically
- Only actions needed
- Fastest operation
- Most accurate

**Manual Mode**:
- All cards entered manually
- Click to select cards
- For non-RFID tables
- Practice mode

**Hybrid Mode**:
- RFID for cards
- Manual corrections
- Backup option

### 16.5 Entering Player Actions

**Basic Actions**:

**FOLD**: 
- Player out of hand
- Cards auto-mucked
- Removes from pot

**CHECK**:
- No bet required
- Continues action
- Available when appropriate

**CALL**:
- Matches current bet
- Auto-calculates amount
- Updates pot

**RAISE**:
1. Touch RAISE button
2. Enter amount (number pad)
3. Confirm with ✓
4. Updates all players

**ALL-IN**:
- Entire stack committed
- Creates side pots
- Special animation

### 16.6 Special Situations

**Run It Twice**:
1. Before river, select "Run it Twice"
2. Deal first river
3. Select "Board 2"
4. Deal second river
5. Pot split automatically

**Straddles**:
1. Select straddling player
2. Menu → Straddle
3. Enter amount
4. Adjusts action order

**Bomb Pots**:
1. Menu → Bomb Pot
2. Enter amount per player
3. Deal flop immediately
4. Action begins

**Rabbit Hunting**:
- After hand ends
- Menu → Rabbit Hunt
- Shows remaining cards
- Display only, no action

**Chops**:
1. Select all players involved
2. Menu → Chop Pot
3. Divides equally
4. Ends hand

### 16.7 Keyboard Shortcuts

**Speed Entry**:
- F: Fold
- C: Check/Call
- R: Raise
- A: All-in
- 0-9: Amount entry
- Enter: Confirm
- Esc: Cancel

**Navigation**:
- Tab: Next player
- Shift+Tab: Previous
- Space: Select active

---

## 17. MultiGFX

### 17.1 Overview

MultiGFX enables multiple synchronized outputs:

**Use Cases**:
- Different graphics per output
- Multiple stream destinations
- Isolated commentary feed
- Backup systems

**Architecture**:
```
RFID Table → Primary Server → Network
                ↓
          Secondary Servers
         (Multiple Instances)
```

### 17.2 Configuration

**Primary Server Setup**:
1. Enable MultiGFX mode
2. Note sync key displayed
3. Configure network access
4. Set data sharing options

**Secondary Server Setup**:
1. Install PokerGFX
2. Select MultiGFX Client
3. Enter primary IP
4. Enter sync key
5. Configure unique output

**Synchronization**:
- Real-time data sync
- Shared player info
- Independent graphics
- Separate delays possible

### 17.3 Limitations and Requirements

**Network Requirements**:
- Gigabit LAN required
- Low latency essential
- Same subnet preferred
- Reliable connection

**License Requirements**:
- Primary: Pro or Enterprise
- Secondary: Any license
- Features based on lowest

**Limitations**:
- 100ms max latency
- 4 secondary servers max
- No cascading
- LAN only (no internet)

---

## 18. Studio (Pro License)

### 18.1 Introduction

Studio is the post-production suite for edited content:

**Workflow Overview**:
1. Record game with data
2. Edit video separately
3. Import to Studio
4. Sync hands to timeline
5. Render with graphics

**Benefits**:
- Fix mistakes
- Perfect timing
- Multiple versions
- Highlight reels

### 18.2 Using the Studio

**Interface Layout**:
```
┌─────────────┬──────────────────┐
│   Library   │   Preview        │
│             │                  │
├─────────────┼──────────────────┤
│  Timeline   │   Properties     │
└─────────────┴──────────────────┘
```

**Import Process**:
1. File → Import Recording
2. Select game file (.pgx)
3. Import video file
4. Auto-match timestamps

### 18.3 Video Player

**Playback Controls**:
- Space: Play/Pause
- J/K/L: Reverse/Pause/Forward
- I/O: Mark in/out points
- M: Add marker
- Frame accurate scrubbing

**Display Options**:
- Full quality preview
- Proxy mode for speed
- Safe area guides
- Graphics overlay toggle

### 18.4 Video Library

**Organization**:
- Folders by date/event
- Thumbnail previews
- Search by player/hand
- Tag system
- Favorites marking

**Hand Detection**:
- Automatic splitting
- Manual adjustment
- Batch processing
- Smart naming

### 18.5 Playlist

**Creating Playlists**:
1. Drag hands to timeline
2. Arrange order
3. Set transitions
4. Add titles
5. Preview sequence

**Editing Tools**:
- Trim in/out points
- Adjust timing
- Change graphics
- Add commentary

### 18.6 Hand Editor

**Editable Elements**:
- Player names
- Seat positions
- Chip counts
- Card corrections
- Action timing
- Pot amounts

**Timeline Sync**:
- Frame accurate placement
- Offset adjustment
- Stretch/compress time
- Keyframe animation

### 18.7 Event Editor

**Custom Events**:
- Title cards
- Sponsor messages
- Statistics overlays
- Player introductions
- Winner celebrations

**Animation Editor**:
- Keyframe system
- Easing curves
- Preview mode
- Template library

### 18.8 Rendering the Video

**Output Settings**:
```
Format: MP4/MOV/ProRes
Resolution: Source/1080p/4K
Frame Rate: Original/Convert
Quality: Broadcast/High/Web
```

**Render Options**:
- Graphics only (alpha)
- Full composite
- Multiple versions
- Batch queue

**Export Features**:
- Chapter markers
- Metadata embedding
- Color management
- Audio normalization

---

## 19. Troubleshooting

### 19.1 Common Issues

**PokerGFX Won't Start**:
- Check dongle connected
- Verify Windows updates
- Run as Administrator
- Check antivirus exceptions

**Graphics Not Showing**:
- Confirm license active
- Check output settings
- Verify keying config
- Reset graphics engine

**Performance Issues**:
- Lower preview quality
- Reduce active sources
- Check GPU drivers
- Close other programs

### 19.2 RFID Reader Problems

**Reader Not Detected**:
1. Check USB connection
2. Verify power supply
3. Try different USB port
4. Reinstall drivers
5. Test with diagnostics

**Cards Not Reading**:
- Clean card surface
- Check antenna placement
- Re-register deck
- Verify calibration
- Replace damaged cards

**Intermittent Detection**:
- Check for interference
- Secure cable connections
- Update firmware
- Adjust read timing

### 19.3 Video Source Issues

**Camera Not Found**:
- Install camera drivers
- Check USB bandwidth
- Verify DirectShow
- Restart devices
- Windows privacy settings

**Black Screen**:
- Correct input selected
- Resolution supported
- Cable connected
- Source powered on

**Frame Drops**:
- Lower resolution
- Check USB 3.0
- Update drivers
- Dedicated USB controller

### 19.4 Streaming Problems

**Connection Failed**:
- Verify stream key
- Check internet speed
- Firewall exceptions
- Correct server URL
- Platform requirements

**Buffering/Lag**:
- Lower bitrate
- Check upload speed
- Wired connection
- Close other apps
- CDN selection

**Quality Issues**:
- Increase bitrate
- Check encoding settings
- Keyframe interval
- Color space settings

### 19.5 Performance Optimization

**GPU Optimization**:
- Update drivers
- Dedicated GPU only
- Disable integrated
- GPU scheduling on
- Clean install drivers

**CPU Optimization**:
- High performance mode
- Disable background apps
- Process priority high
- Adequate cooling
- BIOS updates

**Memory Management**:
- 32GB recommended
- Close browsers
- Disable startup items
- Page file settings
- Memory diagnostic

---

## 20. Appendix

### 20.1 Keyboard Shortcuts

**General Controls**:
```
F1          - Help
F5          - Refresh sources
F11         - Fullscreen
Ctrl+S      - Save settings
Ctrl+Q      - Quit application
Alt+F4      - Force quit
```

**Camera Controls**:
```
1-8         - Switch cameras
Space       - Cut to preview
T           - Take (transition)
Ctrl+T      - Transition settings
Shift+1-8   - Preview camera
```

**Graphics Controls**:
```
G           - Toggle all graphics
L           - Show leaderboard
B           - Show blinds
H           - Hide/show cards
P           - Show pot
Ctrl+G      - Graphics settings
```

**Recording/Streaming**:
```
Ctrl+R      - Record start/stop
Ctrl+B      - Broadcast start/stop
Ctrl+D      - Toggle delay
Shift+R     - Mark recording
Ctrl+Shift+R - Split recording
```

**Action Tracker**:
```
F           - Fold
C           - Check/Call
R           - Raise
A           - All-in
Enter       - Confirm
Esc         - Cancel
Tab         - Next player
```

### 20.2 Supported File Formats

**Video Formats**:
- Input: MP4, MOV, AVI, MKV, MPEG
- Output: MP4, MOV, ProRes
- Codecs: H.264, H.265, ProRes

**Image Formats**:
- Player photos: JPG, PNG
- Logos: PNG (transparency)
- Cards: PNG (custom)

**Audio Formats**:
- Input: AAC, MP3, WAV, FLAC
- Output: AAC, PCM
- Bitrate: 128-320 kbps

**Data Formats**:
- Game data: .pgx (proprietary)
- Settings: .json
- Exports: .csv, .xml

### 20.3 Network Ports

**Default Ports**:
```
8080    - HTTP API
8081    - WebSocket
1935    - RTMP Server
5353    - mDNS Discovery
5960    - NDI Discovery
5961-69 - NDI Video
9910    - ATEM Control
```

**Firewall Configuration**:
- Allow inbound: 8080, 8081, 1935
- Allow outbound: All
- UDP required for NDI
- TCP for API/Stream

### 20.4 FCC Warning & IC Caution

**FCC WARNING**:
This device complies with Part 15 of the FCC Rules. Operation is subject to the following two conditions:
1. This device may not cause harmful interference
2. This device must accept any interference received

Changes or modifications not expressly approved by the party responsible for compliance could void the user's authority to operate the equipment.

**IC Caution**:
This device complies with Industry Canada license-exempt RSS standard(s). Operation is subject to the following two conditions:
1. This device may not cause interference
2. This device must accept any interference

Le présent appareil est conforme aux CNR d'Industrie Canada applicables aux appareils radio exempts de licence.

---

## Support & Contact

**Technical Support**:
- Email: support@pokergfx.io
- Portal: www.pokergfx.io/support
- Hours: 24/7 for Enterprise

**Documentation**:
- Online: www.pokergfx.io/docs
- Videos: www.pokergfx.io/tutorials
- Forum: www.pokergfx.io/community

**Sales & Licensing**:
- Email: sales@pokergfx.io
- Phone: +1-888-POKERGFX
- Portal: www.pokergfx.io/licenses

---

*PokerGFX User Manual v3.2.0*  
*© 2011-2025 PokerGFX LLC. All rights reserved.*  
*PokerGFX is a registered trademark of PokerGFX LLC.*

*Manual Revision: 3.2.0*  
*Publication Date: 2025*  
*Document ID: PGX-UM-320-EN*