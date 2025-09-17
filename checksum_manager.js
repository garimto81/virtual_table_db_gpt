/**
 * Checksum Manager - 클라이언트 측 Checksum 비교 및 관리
 * Day 2 구현
 */

class ChecksumManager {
    constructor(appsScriptUrl) {
        this.appsScriptUrl = appsScriptUrl;
        this.lastChecksum = null;
        this.lastData = null;
        this.pollInterval = 10000; // 초기 10초 (Day 4에서 적응형으로 개선)
        this.isPolling = false;
        this.pollingTimer = null;
        this.stats = {
            checksumCalls: 0,
            dataCalls: 0,
            cacheHits: 0,
            startTime: Date.now()
        };

        // 이벤트 리스너
        this.eventListeners = {
            dataChanged: [],
            checksumChecked: [],
            error: []
        };

        console.log('🔧 ChecksumManager 초기화 완료');
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
     * Checksum만 확인 (경량 체크)
     */
    async fetchChecksum() {
        const startTime = performance.now();

        try {
            const url = `${this.appsScriptUrl}?action=getChecksum`;
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const endTime = performance.now();

            // 통계 업데이트
            this.stats.checksumCalls++;

            // 성능 모니터링
            if (window.performanceMonitor) {
                window.performanceMonitor.trackApiCall(
                    'checksum',
                    endTime - startTime,
                    JSON.stringify(data).length
                );
            }

            console.log(`✅ Checksum 조회: ${data.checksum.substring(0, 10)}... (${(endTime - startTime).toFixed(0)}ms)`);

            this.emit('checksumChecked', {
                checksum: data.checksum,
                responseTime: endTime - startTime
            });

            return data;
        } catch (error) {
            console.error('❌ Checksum 조회 실패:', error);
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * 전체 데이터 가져오기 (checksum 포함)
     */
    async fetchFullData() {
        const startTime = performance.now();

        try {
            const url = `${this.appsScriptUrl}?action=getFullData&checksum=${encodeURIComponent(this.lastChecksum || '')}`;
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const endTime = performance.now();

            // 통계 업데이트
            this.stats.dataCalls++;

            // 성능 모니터링
            if (window.performanceMonitor) {
                window.performanceMonitor.trackApiCall(
                    'fullData',
                    endTime - startTime,
                    JSON.stringify(data).length
                );
            }

            console.log(`📦 데이터 로드: 변경=${data.changed}, 크기=${JSON.stringify(data).length}bytes (${(endTime - startTime).toFixed(0)}ms)`);

            return data;
        } catch (error) {
            console.error('❌ 데이터 로드 실패:', error);
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * 변경사항 확인 및 필요시 데이터 로드
     */
    async checkForUpdates() {
        try {
            // 1. Checksum만 먼저 확인
            const checksumResponse = await this.fetchChecksum();

            // 2. Checksum이 변경된 경우에만 전체 데이터 가져오기
            if (checksumResponse.checksum !== this.lastChecksum) {
                console.log('🔄 데이터 변경 감지됨');

                const fullDataResponse = await this.fetchFullData();

                if (fullDataResponse.changed && fullDataResponse.data) {
                    // 데이터 업데이트
                    this.lastChecksum = fullDataResponse.checksum;
                    this.lastData = fullDataResponse.data;

                    // 변경 이벤트 발생
                    this.emit('dataChanged', {
                        data: fullDataResponse.data,
                        checksum: fullDataResponse.checksum,
                        timestamp: fullDataResponse.timestamp
                    });

                    return {
                        updated: true,
                        data: fullDataResponse.data
                    };
                } else {
                    // 서버에서 변경 없음 확인 (checksum 동기화)
                    this.lastChecksum = fullDataResponse.checksum;
                    this.stats.cacheHits++;

                    console.log('✨ 캐시 히트 - 데이터 변경 없음');
                    return {
                        updated: false,
                        cached: true
                    };
                }
            } else {
                // Checksum 일치 - 변경 없음
                this.stats.cacheHits++;
                console.log('✨ Checksum 일치 - 스킵');

                return {
                    updated: false,
                    cached: true
                };
            }
        } catch (error) {
            console.error('❌ 업데이트 확인 실패:', error);
            throw error;
        }
    }

    /**
     * 폴링 시작
     */
    startPolling(interval = null) {
        if (this.isPolling) {
            console.log('⚠️ 이미 폴링 중입니다');
            return;
        }

        if (interval) {
            this.pollInterval = interval;
        }

        this.isPolling = true;
        console.log(`🔄 폴링 시작 (간격: ${this.pollInterval}ms)`);

        // 즉시 한 번 실행
        this.checkForUpdates();

        // 주기적 실행
        this.pollingTimer = setInterval(() => {
            this.checkForUpdates();
        }, this.pollInterval);
    }

    /**
     * 폴링 중지
     */
    stopPolling() {
        if (!this.isPolling) {
            return;
        }

        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
            this.pollingTimer = null;
        }

        this.isPolling = false;
        console.log('⏹️ 폴링 중지됨');
    }

    /**
     * 통계 조회
     */
    getStats() {
        const elapsed = (Date.now() - this.stats.startTime) / 1000; // 초
        const totalCalls = this.stats.checksumCalls + this.stats.dataCalls;

        return {
            totalCalls: totalCalls,
            checksumCalls: this.stats.checksumCalls,
            dataCalls: this.stats.dataCalls,
            cacheHits: this.stats.cacheHits,
            cacheHitRate: totalCalls > 0 ? (this.stats.cacheHits / this.stats.checksumCalls * 100).toFixed(1) + '%' : '0%',
            apiReduction: this.stats.checksumCalls > 0 ? ((1 - this.stats.dataCalls / this.stats.checksumCalls) * 100).toFixed(1) + '%' : '0%',
            runningTime: elapsed.toFixed(0) + 's',
            callsPerMinute: elapsed > 0 ? (totalCalls / elapsed * 60).toFixed(1) : '0'
        };
    }

    /**
     * 통계 리셋
     */
    resetStats() {
        this.stats = {
            checksumCalls: 0,
            dataCalls: 0,
            cacheHits: 0,
            startTime: Date.now()
        };
        console.log('📊 통계 리셋됨');
    }

    /**
     * 강제 새로고침
     */
    async forceRefresh() {
        console.log('🔄 강제 새로고침');
        this.lastChecksum = null; // Checksum 초기화
        return await this.checkForUpdates();
    }

    /**
     * 다중 범위 Checksum 확인
     */
    async fetchMultiRangeChecksums() {
        try {
            const url = `${this.appsScriptUrl}?action=getMultiChecksum`;
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📊 다중 범위 Checksum:', data.checksums);

            return data.checksums;
        } catch (error) {
            console.error('❌ 다중 범위 Checksum 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 현재 데이터 조회
     */
    getData() {
        return this.lastData;
    }

    /**
     * 현재 Checksum 조회
     */
    getChecksum() {
        return this.lastChecksum;
    }

    /**
     * 상태 조회
     */
    getStatus() {
        return {
            isPolling: this.isPolling,
            pollInterval: this.pollInterval,
            hasData: this.lastData !== null,
            lastChecksum: this.lastChecksum ? this.lastChecksum.substring(0, 10) + '...' : null,
            stats: this.getStats()
        };
    }
}

// 전역 인스턴스 생성 헬퍼
function initializeChecksumManager(appsScriptUrl) {
    const manager = new ChecksumManager(appsScriptUrl);

    // 이벤트 리스너 설정 예제
    manager.on('dataChanged', (data) => {
        console.log('📢 데이터 변경 감지:', data.timestamp);
        // UI 업데이트 로직
        if (window.updateUI) {
            window.updateUI(data.data);
        }
    });

    manager.on('checksumChecked', (data) => {
        console.log(`🔍 Checksum 확인: ${data.checksum.substring(0, 10)}... (${data.responseTime.toFixed(0)}ms)`);
    });

    manager.on('error', (error) => {
        console.error('❌ ChecksumManager 오류:', error);
    });

    // 전역 객체로 등록
    window.checksumManager = manager;

    console.log('✅ ChecksumManager 전역 등록 완료');
    return manager;
}

// 모듈 내보내기 (Node.js 환경)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChecksumManager;
}