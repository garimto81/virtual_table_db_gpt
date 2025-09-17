/**
 * WebSocket Real-time Connection Manager - 실시간 양방향 통신
 * Day 5 구현
 */

class WebSocketManager {
    constructor(appsScriptUrl, adaptivePollingManager) {
        this.appsScriptUrl = appsScriptUrl;
        this.adaptivePollingManager = adaptivePollingManager;

        // WebSocket 연결 설정
        this.socket = null;
        this.connectionState = 'disconnected'; // disconnected, connecting, connected, error
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // 1초
        this.heartbeatInterval = null;
        this.heartbeatTimeout = 30000; // 30초

        // 폴백 시스템
        this.fallbackToPolling = false;
        this.isWebSocketSupported = typeof WebSocket !== 'undefined';

        // 메시지 큐
        this.messageQueue = [];
        this.pendingMessages = new Map();
        this.messageId = 0;

        // 통계
        this.stats = {
            connectionAttempts: 0,
            messagesReceived: 0,
            messagesSent: 0,
            dataTransferred: 0,
            averageLatency: 0,
            connectionUptime: 0,
            lastConnected: null,
            reconnects: 0
        };

        // 이벤트 리스너
        this.eventListeners = {
            connected: [],
            disconnected: [],
            message: [],
            error: [],
            dataReceived: [],
            latencyUpdate: []
        };

        console.log('🌐 WebSocketManager 초기화');
        this.init();
    }

    /**
     * 초기화
     */
    init() {
        if (!this.isWebSocketSupported) {
            console.warn('⚠️ WebSocket 미지원 - 폴링 모드로 폴백');
            this.fallbackToPolling = true;
            return;
        }

        // 네트워크 상태 모니터링
        if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
            window.addEventListener('online', () => this.handleNetworkOnline());
            window.addEventListener('offline', () => this.handleNetworkOffline());
        }

        // 페이지 언로드 시 연결 정리
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => this.disconnect());
        }
    }

    /**
     * WebSocket 연결 시작
     */
    async connect() {
        if (this.fallbackToPolling) {
            console.log('📡 WebSocket 폴백 - 적응형 폴링 사용');
            return this.startFallbackMode();
        }

        if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
            return;
        }

        this.connectionState = 'connecting';
        this.stats.connectionAttempts++;

        try {
            // WebSocket URL 생성 (실제 환경에서는 WSS 사용)
            const wsUrl = this.convertToWebSocketUrl(this.appsScriptUrl);

            console.log(`🔌 WebSocket 연결 시도: ${wsUrl}`);

            this.socket = new WebSocket(wsUrl);
            this.setupSocketEventHandlers();

            // 연결 타임아웃
            const connectTimeout = setTimeout(() => {
                if (this.connectionState === 'connecting') {
                    console.warn('⏰ WebSocket 연결 타임아웃');
                    this.handleConnectionError('Connection timeout');
                }
            }, 10000);

            // 연결 성공 시 타임아웃 해제
            this.socket.addEventListener('open', () => {
                clearTimeout(connectTimeout);
            });

        } catch (error) {
            console.error('❌ WebSocket 연결 실패:', error);
            this.handleConnectionError(error);
        }
    }

    /**
     * WebSocket URL 변환
     */
    convertToWebSocketUrl(httpUrl) {
        // 실제 환경에서는 WebSocket 엔드포인트로 변환
        // Google Apps Script는 WebSocket을 직접 지원하지 않으므로
        // 여기서는 시뮬레이션용 로컬 WebSocket 서버 URL 반환

        if (httpUrl.includes('localhost') || httpUrl.includes('127.0.0.1')) {
            return httpUrl.replace('http', 'ws') + '/websocket';
        }

        // 프로덕션에서는 별도의 WebSocket 서버 필요
        return 'wss://your-websocket-server.com/virtual-table';
    }

    /**
     * WebSocket 이벤트 핸들러 설정
     */
    setupSocketEventHandlers() {
        this.socket.addEventListener('open', (event) => {
            this.handleSocketOpen(event);
        });

        this.socket.addEventListener('message', (event) => {
            this.handleSocketMessage(event);
        });

        this.socket.addEventListener('close', (event) => {
            this.handleSocketClose(event);
        });

        this.socket.addEventListener('error', (event) => {
            this.handleSocketError(event);
        });
    }

    /**
     * WebSocket 연결 열림
     */
    handleSocketOpen(event) {
        console.log('✅ WebSocket 연결 성공');

        this.connectionState = 'connected';
        this.reconnectAttempts = 0;
        this.stats.lastConnected = Date.now();

        // 하트비트 시작
        this.startHeartbeat();

        // 큐된 메시지 전송
        this.flushMessageQueue();

        // 적응형 폴링 중지 (WebSocket이 우선)
        if (this.adaptivePollingManager) {
            this.adaptivePollingManager.stopPolling();
            console.log('⏹️ 적응형 폴링 중지 (WebSocket 연결됨)');
        }

        this.emit('connected', {
            timestamp: Date.now(),
            attempt: this.stats.connectionAttempts
        });

        // 초기 동기화 요청
        this.requestInitialSync();
    }

    /**
     * WebSocket 메시지 수신
     */
    handleSocketMessage(event) {
        try {
            const message = JSON.parse(event.data);
            this.stats.messagesReceived++;
            this.stats.dataTransferred += event.data.length;

            console.log('📨 WebSocket 메시지 수신:', message.type);

            // 지연 시간 계산
            if (message.timestamp) {
                const latency = Date.now() - message.timestamp;
                this.updateLatencyStats(latency);
            }

            // 메시지 타입별 처리
            switch (message.type) {
                case 'data-update':
                    this.handleDataUpdate(message);
                    break;

                case 'delta-update':
                    this.handleDeltaUpdate(message);
                    break;

                case 'user-activity':
                    this.handleUserActivity(message);
                    break;

                case 'system-notification':
                    this.handleSystemNotification(message);
                    break;

                case 'pong':
                    this.handlePong(message);
                    break;

                case 'error':
                    this.handleServerError(message);
                    break;

                default:
                    console.warn('🤷 알 수 없는 메시지 타입:', message.type);
            }

            this.emit('message', message);

        } catch (error) {
            console.error('❌ WebSocket 메시지 파싱 오류:', error);
        }
    }

    /**
     * WebSocket 연결 종료
     */
    handleSocketClose(event) {
        console.log('🔌 WebSocket 연결 종료:', event.code, event.reason);

        this.connectionState = 'disconnected';
        this.stopHeartbeat();

        this.emit('disconnected', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
        });

        // 자동 재연결 시도
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.warn('🚫 최대 재연결 시도 횟수 초과 - 폴링 모드로 폴백');
            this.startFallbackMode();
        }
    }

    /**
     * WebSocket 오류 처리
     */
    handleSocketError(event) {
        console.error('❌ WebSocket 오류:', event);
        this.handleConnectionError('WebSocket error');
    }

    /**
     * 연결 오류 처리
     */
    handleConnectionError(error) {
        this.connectionState = 'error';
        this.emit('error', error);

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
        } else {
            this.startFallbackMode();
        }
    }

    /**
     * 재연결 스케줄링
     */
    scheduleReconnect() {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // 지수 백오프

        console.log(`🔄 ${delay}ms 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            if (this.connectionState !== 'connected') {
                this.connect();
            }
        }, delay);
    }

    /**
     * 폴백 모드 시작
     */
    startFallbackMode() {
        this.fallbackToPolling = true;

        if (this.adaptivePollingManager) {
            console.log('📡 폴링 모드로 폴백');
            this.adaptivePollingManager.startPolling();
        }
    }

    /**
     * 하트비트 시작
     */
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.connectionState === 'connected') {
                this.sendMessage({
                    type: 'ping',
                    timestamp: Date.now()
                });
            }
        }, this.heartbeatTimeout);
    }

    /**
     * 하트비트 중지
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    /**
     * 메시지 전송
     */
    sendMessage(message) {
        if (this.connectionState !== 'connected') {
            // 연결되지 않은 경우 큐에 추가
            this.messageQueue.push(message);
            return false;
        }

        try {
            const messageString = JSON.stringify({
                ...message,
                id: ++this.messageId,
                timestamp: Date.now()
            });

            this.socket.send(messageString);
            this.stats.messagesSent++;
            this.stats.dataTransferred += messageString.length;

            console.log('📤 WebSocket 메시지 전송:', message.type);
            return true;

        } catch (error) {
            console.error('❌ 메시지 전송 실패:', error);
            return false;
        }
    }

    /**
     * 큐된 메시지 전송
     */
    flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.sendMessage(message);
        }
    }

    /**
     * 데이터 업데이트 처리
     */
    handleDataUpdate(message) {
        console.log('🔄 실시간 데이터 업데이트 수신');

        this.emit('dataReceived', {
            type: 'full',
            data: message.data,
            version: message.version,
            timestamp: message.timestamp
        });
    }

    /**
     * 델타 업데이트 처리
     */
    handleDeltaUpdate(message) {
        console.log('🔺 실시간 델타 업데이트 수신');

        // 증분 매니저로 델타 전달
        if (this.adaptivePollingManager && this.adaptivePollingManager.incrementalManager) {
            this.adaptivePollingManager.incrementalManager.applyUpdate({
                type: 'incremental',
                delta: message.delta,
                version: message.version,
                stats: message.stats
            });
        }

        this.emit('dataReceived', {
            type: 'delta',
            delta: message.delta,
            version: message.version,
            timestamp: message.timestamp
        });
    }

    /**
     * 사용자 활동 처리
     */
    handleUserActivity(message) {
        console.log('👤 다른 사용자 활동 감지:', message.activity);

        // 다중 사용자 환경에서 다른 사용자의 활동 표시
        this.emit('userActivity', {
            userId: message.userId,
            activity: message.activity,
            timestamp: message.timestamp
        });
    }

    /**
     * 시스템 알림 처리
     */
    handleSystemNotification(message) {
        console.log('🔔 시스템 알림:', message.notification);

        this.emit('systemNotification', {
            level: message.level,
            message: message.notification,
            timestamp: message.timestamp
        });
    }

    /**
     * Pong 응답 처리
     */
    handlePong(message) {
        const latency = Date.now() - message.timestamp;
        this.updateLatencyStats(latency);
        console.log(`🏓 Pong 수신 - 지연시간: ${latency}ms`);
    }

    /**
     * 서버 오류 처리
     */
    handleServerError(message) {
        console.error('🚨 서버 오류:', message.error);
        this.emit('error', message.error);
    }

    /**
     * 초기 동기화 요청
     */
    requestInitialSync() {
        this.sendMessage({
            type: 'request-sync',
            clientId: this.adaptivePollingManager?.clientId,
            lastVersion: this.adaptivePollingManager?.incrementalManager?.currentVersion
        });
    }

    /**
     * 지연시간 통계 업데이트
     */
    updateLatencyStats(latency) {
        if (this.stats.averageLatency === 0) {
            this.stats.averageLatency = latency;
        } else {
            this.stats.averageLatency = (this.stats.averageLatency * 0.9) + (latency * 0.1);
        }

        this.emit('latencyUpdate', {
            current: latency,
            average: this.stats.averageLatency
        });
    }

    /**
     * 네트워크 온라인 처리
     */
    handleNetworkOnline() {
        console.log('🌐 네트워크 복구됨');
        if (this.connectionState !== 'connected') {
            this.connect();
        }
    }

    /**
     * 네트워크 오프라인 처리
     */
    handleNetworkOffline() {
        console.log('📵 네트워크 연결 끊김');
        this.connectionState = 'disconnected';

        // 오프라인 모드 활성화
        this.emit('offline', { timestamp: Date.now() });
    }

    /**
     * 연결 해제
     */
    disconnect() {
        if (this.socket) {
            this.socket.close(1000, 'User requested disconnect');
        }

        this.stopHeartbeat();
        this.connectionState = 'disconnected';

        // 적응형 폴링 재시작
        if (this.adaptivePollingManager && this.fallbackToPolling) {
            this.adaptivePollingManager.startPolling();
        }
    }

    /**
     * 이벤트 리스너 등록
     */
    on(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].push(callback);
        }
    }

    /**
     * 이벤트 발생
     */
    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`WebSocket event error (${event}):`, error);
                }
            });
        }
    }

    /**
     * 상태 조회
     */
    getStatus() {
        return {
            connectionState: this.connectionState,
            isWebSocketSupported: this.isWebSocketSupported,
            fallbackToPolling: this.fallbackToPolling,
            reconnectAttempts: this.reconnectAttempts,
            stats: this.getStats()
        };
    }

    /**
     * 통계 조회
     */
    getStats() {
        const uptime = this.stats.lastConnected
            ? Date.now() - this.stats.lastConnected
            : 0;

        return {
            ...this.stats,
            connectionUptime: uptime,
            averageLatency: Math.round(this.stats.averageLatency),
            dataTransferredMB: (this.stats.dataTransferred / 1024 / 1024).toFixed(2)
        };
    }
}

// 전역 헬퍼 함수
function initializeWebSocketManager(appsScriptUrl, adaptivePollingManager) {
    const wsManager = new WebSocketManager(appsScriptUrl, adaptivePollingManager);

    // 이벤트 리스너 설정
    wsManager.on('connected', (data) => {
        console.log('🌐 WebSocket 연결됨');
        if (window.updateConnectionStatus) {
            window.updateConnectionStatus('websocket', 'connected');
        }
    });

    wsManager.on('disconnected', (data) => {
        console.log('🔌 WebSocket 연결 해제됨');
        if (window.updateConnectionStatus) {
            window.updateConnectionStatus('websocket', 'disconnected');
        }
    });

    wsManager.on('dataReceived', (data) => {
        console.log('📨 실시간 데이터 수신:', data.type);
        if (window.handleRealtimeData) {
            window.handleRealtimeData(data);
        }
    });

    wsManager.on('latencyUpdate', (data) => {
        if (window.updateLatencyMetrics) {
            window.updateLatencyMetrics(data);
        }
    });

    wsManager.on('error', (error) => {
        console.error('🚨 WebSocket 오류:', error);
    });

    // 전역 등록
    window.webSocketManager = wsManager;

    console.log('✅ WebSocketManager 전역 등록 완료');
    return wsManager;
}

// 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebSocketManager;
}