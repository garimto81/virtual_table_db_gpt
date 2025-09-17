/**
 * Adaptive Polling Manager - 사용자 활동 기반 동적 폴링
 * Day 4 구현
 */

class AdaptivePollingManager {
    constructor(incrementalManager) {
        this.incrementalManager = incrementalManager;
        this.pollingTimer = null;
        this.activityTracker = new UserActivityTracker();

        // 폴링 간격 설정 (ms)
        this.pollingIntervals = {
            active: 3000,      // 활성 편집 시 3초
            normal: 10000,     // 일반 활동 시 10초
            idle: 30000,       // 대기 상태 시 30초
            background: 60000  // 백그라운드 시 60초
        };

        // 현재 상태
        this.currentState = 'normal';
        this.currentInterval = this.pollingIntervals.normal;

        // 통계
        this.stats = {
            totalPolls: 0,
            stateChanges: 0,
            savedPolls: 0,
            startTime: Date.now()
        };

        // 이벤트 리스너
        this.eventListeners = {
            stateChanged: [],
            pollingStopped: [],
            pollingResumed: [],
            intervalChanged: []
        };

        this.init();

        console.log('🎯 AdaptivePollingManager 초기화 완료');
    }

    init() {
        // 활동 추적 이벤트 리스너 등록
        this.activityTracker.on('stateChanged', (newState) => {
            this.handleStateChange(newState);
        });

        // 페이지 가시성 API 사용
        this.setupVisibilityApi();

        // 초기 폴링 시작
        this.startPolling();
    }

    /**
     * 상태 변경 처리
     */
    handleStateChange(newState) {
        if (this.currentState === newState) return;

        const oldState = this.currentState;
        const oldInterval = this.currentInterval;

        this.currentState = newState;
        this.currentInterval = this.pollingIntervals[newState];
        this.stats.stateChanges++;

        console.log(`🔄 상태 변경: ${oldState} → ${newState} (${oldInterval}ms → ${this.currentInterval}ms)`);

        // 폴링 간격 업데이트
        this.updatePollingInterval();

        // 이벤트 발생
        this.emit('stateChanged', {
            oldState,
            newState,
            oldInterval,
            newInterval: this.currentInterval
        });

        this.emit('intervalChanged', {
            interval: this.currentInterval,
            state: newState
        });
    }

    /**
     * 폴링 간격 업데이트
     */
    updatePollingInterval() {
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
        }

        if (this.currentState !== 'background') {
            this.startPolling();
        } else {
            this.emit('pollingStopped', { reason: 'background' });
        }
    }

    /**
     * 폴링 시작
     */
    startPolling() {
        this.pollingTimer = setInterval(async () => {
            try {
                await this.performPoll();
            } catch (error) {
                console.error('❌ 적응형 폴링 오류:', error);
            }
        }, this.currentInterval);

        console.log(`🚀 폴링 시작: ${this.currentInterval}ms 간격 (${this.currentState} 모드)`);
        this.emit('pollingResumed', {
            interval: this.currentInterval,
            state: this.currentState
        });
    }

    /**
     * 폴링 실행
     */
    async performPoll() {
        const startTime = performance.now();

        // 상태별 폴링 로직
        switch (this.currentState) {
            case 'active':
                // 활성 편집 시 - 우선도 높은 체크
                await this.priorityPoll();
                break;

            case 'normal':
                // 일반 활동 시 - 표준 폴링
                await this.standardPoll();
                break;

            case 'idle':
                // 대기 상태 시 - 경량 폴링
                await this.lightweightPoll();
                break;

            default:
                await this.standardPoll();
        }

        const elapsed = performance.now() - startTime;
        this.stats.totalPolls++;

        // 성능 모니터링
        if (window.performanceMonitor) {
            window.performanceMonitor.trackApiCall(
                `adaptive-${this.currentState}`,
                elapsed,
                0
            );
        }

        console.log(`📊 폴링 완료: ${this.currentState} 모드, ${elapsed.toFixed(0)}ms`);
    }

    /**
     * 우선도 높은 폴링 (활성 편집 시)
     */
    async priorityPoll() {
        // 증분 업데이트로 빠른 동기화
        if (this.incrementalManager) {
            await this.incrementalManager.fetchUpdate();
        }
    }

    /**
     * 표준 폴링 (일반 활동 시)
     */
    async standardPoll() {
        // 기본 증분 업데이트
        if (this.incrementalManager) {
            await this.incrementalManager.fetchUpdate();
        }
    }

    /**
     * 경량 폴링 (대기 상태 시)
     */
    async lightweightPoll() {
        // Checksum만 확인하여 변경 여부만 체크
        if (this.incrementalManager) {
            // 경량 체크를 위해 헤더만 요청
            const response = await fetch(`${this.incrementalManager.appsScriptUrl}?action=ping&clientId=${this.incrementalManager.clientId}`, {
                method: 'HEAD',
                mode: 'cors',
                cache: 'no-cache'
            });

            if (response.status === 200) {
                // 변경이 있을 때만 전체 업데이트
                await this.incrementalManager.fetchUpdate();
            }
        }
    }

    /**
     * 페이지 가시성 API 설정
     */
    setupVisibilityApi() {
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    // 페이지가 백그라운드로 이동
                    this.handleStateChange('background');
                } else {
                    // 페이지가 다시 활성화
                    const currentActivity = this.activityTracker.getCurrentState();
                    this.handleStateChange(currentActivity);
                }
            });
        }
    }

    /**
     * 폴링 중지
     */
    stopPolling() {
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
            this.pollingTimer = null;
            console.log('⏹️ 폴링 중지');
            this.emit('pollingStopped', { reason: 'manual' });
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
                    console.error(`Event listener error (${event}):`, error);
                }
            });
        }
    }

    /**
     * 통계 조회
     */
    getStats() {
        const runtime = (Date.now() - this.stats.startTime) / 1000;
        const baselinePolls = Math.floor(runtime / 10); // 10초 고정 폴링 기준
        const savedPolls = Math.max(0, baselinePolls - this.stats.totalPolls);
        const efficiency = baselinePolls > 0 ? ((savedPolls / baselinePolls) * 100).toFixed(1) : 0;

        return {
            currentState: this.currentState,
            currentInterval: this.currentInterval,
            totalPolls: this.stats.totalPolls,
            stateChanges: this.stats.stateChanges,
            savedPolls: savedPolls,
            efficiency: efficiency + '%',
            runtime: runtime.toFixed(0) + 's'
        };
    }

    /**
     * 현재 상태 조회
     */
    getStatus() {
        return {
            state: this.currentState,
            interval: this.currentInterval,
            isPolling: this.pollingTimer !== null,
            activityLevel: this.activityTracker.getActivityLevel(),
            stats: this.getStats()
        };
    }

    /**
     * 폴링 간격 수동 설정
     */
    setPollingInterval(state, interval) {
        if (this.pollingIntervals.hasOwnProperty(state)) {
            this.pollingIntervals[state] = interval;

            if (this.currentState === state) {
                this.updatePollingInterval();
            }

            console.log(`✅ ${state} 모드 폴링 간격 변경: ${interval}ms`);
        }
    }
}

/**
 * 사용자 활동 추적기
 */
class UserActivityTracker {
    constructor() {
        this.lastActivity = Date.now();
        this.editingActivity = Date.now();
        this.activityLevel = 0; // 0: idle, 1: normal, 2: active
        this.currentState = 'normal';

        // 임계값 (ms)
        this.thresholds = {
            activeToNormal: 10000,    // 10초
            normalToIdle: 30000,      // 30초
            editingActive: 5000       // 5초
        };

        // 활동 점수
        this.activityScore = 0;
        this.activityDecay = 0.95; // 매초 5% 감소

        // 이벤트 리스너
        this.eventListeners = {
            stateChanged: []
        };

        this.init();
    }

    init() {
        if (typeof document !== 'undefined') {
            // 마우스 및 키보드 활동 감지
            const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'click'];
            events.forEach(event => {
                document.addEventListener(event, () => this.recordActivity(event), true);
            });

            // 입력 필드 편집 감지
            document.addEventListener('input', () => this.recordEditingActivity(), true);
            document.addEventListener('focus', (e) => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
                    this.recordEditingActivity();
                }
            }, true);
        }

        // 상태 모니터링 타이머
        this.monitoringTimer = setInterval(() => {
            this.updateActivityState();
        }, 1000);

        console.log('👀 UserActivityTracker 초기화 완료');
    }

    /**
     * 일반 활동 기록
     */
    recordActivity(eventType) {
        this.lastActivity = Date.now();

        // 활동 점수 증가 (이벤트 타입별 가중치)
        const weights = {
            'mousedown': 2,
            'keydown': 3,
            'scroll': 1,
            'click': 2,
            'mousemove': 0.1
        };

        this.activityScore += weights[eventType] || 1;
        this.activityScore = Math.min(this.activityScore, 100); // 최대 100점
    }

    /**
     * 편집 활동 기록 (우선도 높음)
     */
    recordEditingActivity() {
        this.editingActivity = Date.now();
        this.activityScore += 5; // 편집은 높은 점수
        this.activityScore = Math.min(this.activityScore, 100);

        console.log('✏️ 편집 활동 감지');
    }

    /**
     * 활동 상태 업데이트
     */
    updateActivityState() {
        const now = Date.now();
        const timeSinceActivity = now - this.lastActivity;
        const timeSinceEditing = now - this.editingActivity;

        // 활동 점수 감소 (시간 경과에 따라)
        this.activityScore *= this.activityDecay;

        // 새로운 상태 결정
        let newState;

        if (timeSinceEditing < this.thresholds.editingActive || this.activityScore > 50) {
            newState = 'active';
            this.activityLevel = 2;
        } else if (timeSinceActivity < this.thresholds.activeToNormal && this.activityScore > 10) {
            newState = 'normal';
            this.activityLevel = 1;
        } else if (timeSinceActivity < this.thresholds.normalToIdle) {
            newState = 'normal';
            this.activityLevel = 1;
        } else {
            newState = 'idle';
            this.activityLevel = 0;
        }

        // 상태 변경 시 이벤트 발생
        if (newState !== this.currentState) {
            const oldState = this.currentState;
            this.currentState = newState;

            console.log(`🔄 활동 상태 변경: ${oldState} → ${newState} (점수: ${this.activityScore.toFixed(1)})`);

            this.emit('stateChanged', newState);
        }
    }

    /**
     * 현재 상태 조회
     */
    getCurrentState() {
        return this.currentState;
    }

    /**
     * 활동 수준 조회
     */
    getActivityLevel() {
        return {
            level: this.activityLevel,
            score: this.activityScore.toFixed(1),
            lastActivity: Date.now() - this.lastActivity,
            lastEditing: Date.now() - this.editingActivity
        };
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
                    console.error(`Activity tracker event error (${event}):`, error);
                }
            });
        }
    }

    /**
     * 정리
     */
    destroy() {
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
        }
    }
}

// 전역 헬퍼 함수
function initializeAdaptivePolling(incrementalManager) {
    const adaptiveManager = new AdaptivePollingManager(incrementalManager);

    // 이벤트 리스너 설정
    adaptiveManager.on('stateChanged', (data) => {
        console.log(`🎯 폴링 상태 변경: ${data.oldState} → ${data.newState}`);

        // UI 업데이트
        if (window.updatePollingStatus) {
            window.updatePollingStatus(data);
        }
    });

    adaptiveManager.on('intervalChanged', (data) => {
        console.log(`⏱️ 폴링 간격 변경: ${data.interval}ms (${data.state} 모드)`);
    });

    adaptiveManager.on('pollingStopped', (data) => {
        console.log(`⏹️ 폴링 중지: ${data.reason}`);
    });

    adaptiveManager.on('pollingResumed', (data) => {
        console.log(`▶️ 폴링 재개: ${data.interval}ms (${data.state} 모드)`);
    });

    // 전역 등록
    window.adaptivePollingManager = adaptiveManager;

    console.log('✅ AdaptivePollingManager 전역 등록 완료');
    return adaptiveManager;
}

// 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdaptivePollingManager, UserActivityTracker };
}