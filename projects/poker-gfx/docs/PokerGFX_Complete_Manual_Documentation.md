# PokerGFX User Manual v3.2.0 - Complete Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [License Tiers](#license-tiers)
3. [Common Usage Scenarios](#common-usage-scenarios)
4. [Supported Hardware](#supported-hardware)
5. [Getting Started](#getting-started)
6. [The Interface](#the-interface)
7. [Video Configuration](#video-configuration)
8. [Action Tracker](#action-tracker)
9. [Studio](#studio)
10. [Advanced Features](#advanced-features)
11. [Settings](#settings)
12. [Troubleshooting](#troubleshooting)

---

## Introduction

PokerGFX is a powerful video titling software suite that generates real time poker graphics for video overlay. Used with the RFID Reader, it will automatically detect hole and community cards with no human intervention – however it can also be used with a conventional 'hole cam' table by entering card information manually.

In RFID mode, a USB cable (or WIFI link for completely wireless operation) connects the table to a Windows computer which runs the PokerGFX Server software. The server communicates with the table to track the movement of RFID-enabled playing cards between players, and converts this information to a graphical display which is superimposed on video of the game.

Tracking of betting action is possible by having the dealer or another observer enter player actions, using a convenient touch screen wireless tablet interface or by using a mouse/keyboard. In this mode, all graphics required for a TV broadcast or livestream are generated automatically.

### Evaluation Mode

If no dongle is detected, PokerGFX runs in evaluation mode. In this mode, no features are disabled and most functions run normally. However, a watermark is placed on the video every 30 seconds with details of how to purchase a licensed version. You must plug in a valid security dongle or license key to disable the watermark.

## License Tiers

PokerGFX has three separate licenses: Basic, Pro, Enterprise

### Basic License
- For first-time users testing out the product or hobbyists looking to stream a home game
- **Key Features:**
  - Graphics overlay on up to 4 video sources
  - Basic skins and animations
  - Manual card entry
  - RFID table support
  - Recording and streaming
  - Action Tracker

### Pro License  
- For dedicated hobbyists looking to produce a professional quality stream or generate revenue
- **All Basic features plus:**
  - Graphics overlay on up to 8 video sources
  - Advanced skins with customization
  - Studio post-production tools
  - Player photos and country flags
  - Sponsor logos (Leaderboard, Board, Strip)
  - PIP (Picture-in-Picture)
  - ATEM video switcher control
  - Secure delay up to 60 minutes
  - MultiGFX support
  - Commentary booth features

### Enterprise License
- For media teams who need full-feature production tools for serious business
- **All Basic & Pro features plus:**
  - Graphics overlay on up to 16 video sources
  - Live API for custom integrations
  - NDI output support
  - Blackmagic Decklink output
  - Multiple output devices
  - Priority support

**Note:** All Basic features are included with a Pro License, and all Basic & Pro features are included with an Enterprise License.

## Common Usage Scenarios

### GFX + INTERNAL VIDEO MIX
Up to 8 cameras are connected directly to the Server PC. PokerGFX automatically switches cameras to follow the action around the table and mixes video internally. No camera operators or external vision mixer required. PokerGFX adds graphics, records & streams with an optional security delay.

### GFX + EXTERNAL VIDEO MIX  
PokerGFX Server generates real time graphics which are keyed onto a live pre-mixed video feed from an external switcher. PokerGFX can ingest the program feed for internal keying of graphics, or output graphics only for external keying using chroma key or separate key & fill outputs. PokerGFX can record and stream with an optional security delay.

### LIVE
Game data and player actions are sent to one or more commentators or video mixers in real time. This is used where multiple graphics outputs are required, for example a clean output (no graphics), in-stream graphics (main output) and graphics on a second screen for commentators.

### POST
All cards and player actions for an entire game are recorded in a live database. The Studio feature is then used to fit the hands to the timeline of the final edit of the game video. When the timeline is finished, the graphics are automatically rendered onto the video to produce the final output in post-production.

## Supported Hardware

### Performance & Recommended PC Specifications

PokerGFX is fully GPU pipelined, which means all video capture, mixing, encoding and rendering is performed using the GPU rather than the system's CPU. This frees the system CPU for other tasks such as recording and streaming to online services and results in a very significant improvement in overall system performance.

The minimum recommended system specifications for mixing up to 8 sources, streaming and recording a 4K video are:

- **CPU**: Intel Core i7, 8th generation or equivalent AMD Ryzen
- **GPU**: NVIDIA GeForce GTX 1080 or above
- **Memory**: 16GB RAM minimum
- **Storage**: Fast SSD with at least 500GB free space for recordings
- **OS**: Windows 10 (64-bit) or Windows 11

### USB Webcams
Most USB webcams that support 1920x1080 @ 30fps (or greater) resolution are suitable for use with PokerGFX. We recommend the Logitech C920 or C922, Logitech Brio, or Microsoft LifeCam Studio.

### Capture Devices
Any video capture device that is compliant with Windows DirectShow WDM may be used with PokerGFX. Popular choices include:
- Blackmagic Design DeckLink series
- Magewell USB Capture series
- Elgato HD60 S+
- AVerMedia Live Gamer series

### Network Cameras
Remote network cameras that support RTSP or HTTP streaming protocols are supported. Interlaced video sources are always converted to progressive format.

### NDI Sources and Outputs
NDI (Network Device Interface) is a technology that enables video and audio to be shared across a local network. PokerGFX supports both NDI input sources and output destinations (Enterprise license required for output).

## Getting Started

### Software Installation

1. **Download the installer** from www.pokergfx.io
2. **Run the installer** as Administrator
3. **Connect the USB dongle** to any USB port on your computer
4. **Launch PokerGFX Server** from the desktop shortcut

PokerGFX requires a USB security dongle for normal use. The dongle can be plugged into any USB port on the Server PC. PokerGFX supports the use of up to 3 USB license dongles concurrently on the same PC. Using multiple dongles allows mixing between Basic, Pro and Enterprise licenses.

### RFID Reader Setup

The RFID Reader connects to the Server PC via a standard USB cable. The reader requires external power via the included power supply.

1. **Connect the RFID Reader** to power using the included adapter
2. **Connect the USB cable** from the reader to your PC
3. **Wait for Windows** to recognize the device (may take 30 seconds)
4. **Launch PokerGFX** - the reader status should show as "Connected"

### Table Calibration

Before first use, the table must be calibrated to identify the physical antenna positions:

1. Click **Settings** → **RFID** → **Calibrate Table**
2. Place one card face-down on each player position when prompted
3. Place cards on the board positions (Flop, Turn, River) when prompted
4. Place a card on the muck position
5. Click **Complete** when all positions are marked

The calibration data is stored permanently and only needs to be repeated if the table configuration changes.

### Register Playing Cards

Each deck of RFID cards must be registered before use:

1. Click **Settings** → **RFID** → **Register Deck**
2. Follow the on-screen prompts to scan each card
3. The system will automatically identify each card's rank and suit
4. Verify the deck is complete (52 cards)
5. Click **Save Deck** when complete

Multiple decks can be registered and stored. The system automatically detects which registered deck is in use.

## The Interface

### Main Window

The main PokerGFX Server window displays:

- **Live video preview** (with security watermark if delay is active)
- **System status indicators**:
  - Table Health: Connection quality to RFID reader
  - Network Health: Connection quality to Action Tracker
  - Stream Indicator: Green when secure delay is active
  - Record Indicator: Green when recording is active
- **Control buttons**:
  - Settings: Access all configuration options
  - Studio: Post-production tools (Pro license)
  - Sources: Video source configuration
  - Graphics: Overlay customization
  - Outputs: Streaming and recording settings

### Sources Tab

The Sources tab contains a list of available video sources:
- USB cameras
- Capture cards
- NDI sources
- Network cameras (RTSP/HTTP)
- Media files
- Screen capture

For each source you can configure:
- **Name**: Custom identifier
- **Resolution**: Up to 4K (3840x2160)
- **Frame rate**: 24/25/30/50/60 fps
- **Audio**: Enable/disable and adjust sync
- **Color correction**: Brightness, contrast, saturation, hue
- **Crop**: Remove unwanted edges
- **Status**: Enable/disable source

### Audio Configuration

Select the desired audio capture device and volume. The Sync setting adjusts the synchronization between audio and video:
- Negative values: Audio plays earlier
- Positive values: Audio plays later
- Adjustment range: -5000ms to +5000ms

## Video Configuration

### Camera Switching

PokerGFX supports multiple camera switching modes:

#### Manual Switching
Select cameras directly using:
- Number keys (1-8)
- Mouse clicks in the preview window
- Stream Deck buttons
- ATEM switcher controls

#### Automatic Switching
Enable automatic camera switching based on game events:
- **Follow Players**: Camera follows active player
- **Follow Board**: Switch to wide shot for community cards
- **Cycle**: Rotate through all cameras on timer

#### Camera Positions
Assign each camera to a table position:
- Seats 1-10
- Dealer position
- Wide/beauty shots
- Close-up angles

### Transitions

Configure how cameras switch:
- **Cut**: Instant switch (0ms)
- **Fade**: Smooth fade between sources (100-2000ms)
- **Wipe**: Directional wipe effect
- **Custom**: Load custom transition effects

### External Switcher Integration

When using an external video switcher:

1. Connect the switcher's program output to a capture card
2. Configure PokerGFX for "External Video Mix" mode
3. Choose keying method:
   - **Internal keying**: PokerGFX composites graphics
   - **External keying**: Output graphics with alpha channel
   - **Chroma key**: Green screen output for switcher keying

### ATEM Control (Pro License)

PokerGFX can control Blackmagic ATEM switchers:

1. Enable ATEM control in Settings → Sources
2. Enter the ATEM IP address
3. Map PokerGFX cameras to ATEM inputs
4. PokerGFX will automatically switch the ATEM to follow action

## Action Tracker

Action Tracker is the companion application for entering game information. It can run on:
- The same PC as the server (secondary display)
- A separate Windows PC on the network
- A Windows tablet for wireless operation

### Installation

1. Download Action Tracker from the PokerGFX website
2. Install on the desired device
3. Launch and enter the Server PC's IP address
4. Enter the table password (if set)

### Interface Overview

The Action Tracker interface displays:

- **Table visualization**: Overhead view of all players
- **Community cards**: Current board cards
- **Pot size**: Main and side pots
- **Active player**: Highlighted in green
- **Action buttons**: Fold, Check, Call, Raise, All-In
- **Chip adjustment**: Modify player stacks
- **Game controls**: New hand, show cards, etc.

### Operating Modes

#### Auto Mode
- Cards are detected automatically by RFID
- Only betting actions need to be entered
- Pot calculations are automatic

#### Manual Mode  
- All cards must be entered manually
- Used for non-RFID tables
- Touch/click cards to select rank and suit

### Entering Actions

When a player acts:

1. **Ensure correct player is highlighted** (follows dealer button)
2. **Touch the appropriate action button**:
   - FOLD: Player discards cards
   - CHECK: No bet (when allowed)
   - CALL: Match current bet
   - RAISE: Enter raise amount
   - ALL-IN: Player bets entire stack
3. **For raises**: Enter amount using number pad
4. **Confirm** with green checkmark

### Special Situations

#### Run It Twice
1. Touch the "Run It Twice" button before dealing
2. Deal first board normally
3. Touch "Board 2" button
4. Deal second board
5. System automatically calculates split pots

#### Straddles
- Touch the straddling player
- Select "Straddle" from the menu
- Enter straddle amount

#### Chops
- Select all players involved
- Touch "Chop Pot" button
- Pot is divided equally

#### Rabbit Hunting
- After hand ends, touch "Rabbit Hunt"
- Deal remaining cards
- Cards display with "Rabbit Hunt" indicator

## Studio (Pro License Required)

The Studio is a fully featured editing environment for post-production work.

### Workflow

1. **Import recorded game**: File → Import Recording
2. **Load into Video Library**: Organizes clips by hand
3. **Create playlist**: Drag hands to timeline
4. **Sync timing**: Adjust hand start/end points
5. **Render**: Export final video with graphics

### Video Player

- Playback controls with frame-accurate positioning
- Keyboard shortcuts:
  - Space: Play/pause
  - Left/Right arrows: Frame step
  - Shift+Left/Right: 10 frame jump
  - I/O: Set in/out points

### Hand Editor

Fine-tune hand details:
- Player names and seat positions
- Chip counts
- Card corrections
- Action timing
- Graphics appearance

### Event Editor

Add custom events:
- Player introductions
- Sponsor messages
- Statistical overlays
- Custom animations

### Rendering

Output options:
- Format: MP4, MOV, AVI, ProRes
- Resolution: Up to 4K
- Frame rate: Match source or convert
- Quality: Bitrate and compression settings

## Advanced Features

### Secure Delay

The Secure Delay feature introduces a delay to the live stream, essential for preventing cheating in live games:

1. **Enable** in Settings → Outputs
2. **Set delay time**: 1-60 minutes
3. **Choose mode**:
   - **Fixed**: Constant delay time
   - **Dynamic**: Variable delay (more secure)
   - **Auto**: Automatic based on pot size

When active:
- Live preview shows security watermark
- Delayed preview available for commentators
- Storage requires ~50GB per hour (1080p)

### MultiGFX

MultiGFX allows multiple PokerGFX instances to share the same table data:

1. **Primary server**: Connected to RFID table
2. **Secondary servers**: Receive data over network
3. **Each server** can have different:
   - Graphics styles
   - Camera angles
   - Output destinations
   - Delay settings

Configuration:
1. Enable MultiGFX on primary server
2. Note the sync key displayed
3. On secondary servers, enter sync key
4. Select "MultiGFX Client" mode

### PIP (Picture-in-Picture)

Display remote computer screens or additional video sources:

1. **Configure source**:
   - Remote desktop (via VNC/RDP)
   - Additional camera
   - Media player
2. **Position and size**:
   - Drag to position
   - Resize handles at corners
   - Opacity adjustment
3. **Timing**:
   - Always visible
   - Between hands only
   - Manual toggle

### Live API (Enterprise License)

The Live API enables real-time integration with external systems:

**Endpoints**:
- `/api/game/state`: Current game state
- `/api/players`: Player information
- `/api/action`: Recent actions
- `/api/graphics`: Control overlays

**WebSocket Events**:
```javascript
ws://server:8080/live
- hand.start
- player.action
- board.update
- hand.complete
```

### Commentary Booth

Provide delayed statistics to commentators:

1. **Enable** Commentary Booth in Settings
2. **Configure delay** to match stream delay
3. **Commentators see**:
   - Current action (delayed)
   - Player statistics
   - Hand histories
   - Pot odds calculations

## Settings

### Graphics Settings

Configure the appearance of on-screen graphics:

#### Display Options
- **Show player names**: Always/On action/Never
- **Show chip counts**: Always/On action/Never
- **Show cards**: Immediately/On action/At showdown
- **Animations**: Enable/disable transitions

#### Layout
- **Player box style**: Horizontal/Vertical/Curved
- **Position**: 8 preset layouts + custom
- **Margins**: Adjust safe areas
- **Scaling**: Resize for different displays

#### Branding (Pro License)
- **Leaderboard logo**: Top of chip counts
- **Board logo**: Next to community cards
- **Strip logo**: Bottom ticker area
- **Custom colors**: Match brand guidelines

### Output Settings

#### Streaming
- **Platforms**: Twitch, YouTube, Facebook, Custom RTMP
- **Quality**: Resolution, bitrate, keyframe interval
- **Multiple streams**: Send to multiple platforms

#### Recording
- **Format**: MP4, MOV, ProRes
- **Location**: Local or network storage
- **Splitting**: By time or hand
- **Backup recording**: Redundant recording

#### Preview Outputs
- **Video preview**: Additional display output
- **Audio preview**: Separate audio monitoring
- **NDI output**: Network video (Enterprise)
- **Decklink output**: SDI/HDMI (Enterprise)

### Server Settings

#### Security
- **Table password**: Require for Action Tracker
- **API authentication**: Token-based access
- **Secure folders**: Encrypted storage

#### Performance
- **GPU selection**: Choose rendering GPU
- **Memory limit**: Prevent overflow
- **Thread priority**: Balance with other apps

#### Network
- **Port configuration**: API and stream ports
- **Firewall rules**: Auto-configure Windows
- **Bandwidth limits**: Prevent network saturation

### Game Settings

#### Rules
- **Betting structure**: NL/PL/FL
- **Blind levels**: Tournament or cash
- **Straddle options**: Button/Mississippi/Sleeper
- **Bomb pots**: Frequency and amount

#### Display
- **Currency**: $/€/£/¥ or hide
- **Chip denominations**: Decimal places
- **Timer**: Shot clock settings
- **Statistics**: VPIP/PFR/AGG display

## Skins

### Built-in Skins

PokerGFX includes multiple professional skins:
- **Classic**: Traditional TV poker look
- **Modern**: Clean, minimal design  
- **Neon**: Vibrant colors with glow effects
- **Corporate**: Professional branding-ready
- **Custom**: Build your own design

### Skin Editor

Create or modify skins:

1. **Open Skin Editor**: Graphics → Skins → Edit
2. **Select element**: Player box, board, etc.
3. **Modify properties**:
   - Colors and gradients
   - Fonts and sizes
   - Borders and shadows
   - Animations
4. **Preview** changes in real-time
5. **Save** as new skin

### Elements

Customizable elements include:
- Player boxes (name, chips, cards)
- Community board
- Pot display
- Blinds/ante indicator
- Timer/shot clock
- Leaderboard
- Ticker/strip
- Transitions

## Troubleshooting

### Common Issues

#### RFID Reader Not Detected
- Check USB connection
- Verify power supply connected
- Install latest drivers from website
- Try different USB port
- Restart PokerGFX

#### Cards Not Reading
- Ensure cards are registered
- Check antenna connections
- Verify table calibration
- Clean card surfaces
- Replace low battery cards

#### Video Sources Missing
- Install device drivers
- Check Windows Camera Privacy
- Verify DirectShow compatibility
- Restart video devices
- Update Windows

#### Stream Connection Failed
- Verify stream key/URL
- Check firewall settings
- Test network bandwidth
- Confirm platform settings
- Use lower bitrate

#### Graphics Not Showing
- Confirm license dongle connected
- Check keying configuration
- Verify alpha channel settings
- Adjust opacity levels
- Reset graphics engine

### Performance Optimization

#### Reduce GPU Load
- Lower output resolution
- Disable unnecessary effects
- Reduce number of sources
- Use hardware encoding
- Close other GPU applications

#### Improve Stream Quality
- Use wired network connection
- Increase bitrate budget
- Enable B-frames
- Adjust keyframe interval
- Use dedicated streaming PC

### Log Files

PokerGFX creates detailed logs for troubleshooting:
- Location: `C:\ProgramData\PokerGFX\Logs`
- Files rotate daily
- Include with support requests

### Support

- **Email**: support@pokergfx.io
- **Documentation**: www.pokergfx.io/docs
- **Video tutorials**: www.pokergfx.io/tutorials
- **License portal**: www.pokergfx.io/licenses

---

## Appendix

### Keyboard Shortcuts

**General**
- F1: Help
- F5: Refresh sources
- F11: Fullscreen preview
- Ctrl+S: Save settings
- Ctrl+Q: Quit

**Camera Control**
- 1-8: Switch to camera N
- Space: Cut to preview
- T: Take (fade to preview)
- Ctrl+T: Set transition time

**Graphics**
- G: Toggle all graphics
- L: Show leaderboard
- B: Show big blind
- H: Show/hide cards

**Recording/Streaming**
- Ctrl+R: Start/stop recording
- Ctrl+B: Start/stop streaming
- Ctrl+D: Toggle secure delay

### File Formats

**Supported Video**
- MP4 (H.264/H.265)
- MOV (ProRes)
- AVI (uncompressed)
- MKV (various codecs)

**Supported Images**
- PNG (with alpha)
- JPEG/JPG
- BMP
- GIF (static)

**Supported Audio**
- AAC
- MP3
- WAV
- FLAC

### Network Ports

- 8080: HTTP API
- 8081: WebSocket
- 1935: RTMP server
- 5353: mDNS discovery
- 9000-9100: NDI (dynamic)

---

*PokerGFX User Manual v3.2.0*  
*© PokerGFX LLC 2011-2025*  
*www.pokergfx.io*