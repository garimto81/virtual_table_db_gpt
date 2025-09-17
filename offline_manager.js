/**
 * Offline Mode Manager - 오프라인 모드 및 로컬 캐싱
 * Day 5 구현
 */

class OfflineManager {
    constructor(incrementalManager) {
        this.incrementalManager = incrementalManager;

        // 오프라인 상태
        this.isOnline = navigator.onLine;
        this.isOfflineMode = false;

        // 로컬 스토리지 설정
        this.storageKeys = {
            data: 'vtdb_offline_data',
            version: 'vtdb_offline_version',
            changes: 'vtdb_offline_changes',
            metadata: 'vtdb_offline_metadata'
        };

        // 변경사항 큐
        this.changeQueue = [];
        this.maxQueueSize = 1000;

        // 동기화 상태
        this.syncState = 'idle'; // idle, syncing, error
        this.lastSyncTime = null;
        this.pendingChanges = 0;

        // 충돌 해결 설정
        this.conflictResolution = 'server-wins'; // server-wins, client-wins, merge

        // 통계
        this.stats = {
            offlineTime: 0,
            changesQueued: 0,
            changesSynced: 0,
            conflictsResolved: 0,
            syncAttempts: 0,
            lastOfflineStart: null
        };

        // 이벤트 리스너
        this.eventListeners = {
            offlineMode: [],
            onlineMode: [],
            dataCached: [],
            syncStarted: [],
            syncCompleted: [],
            conflictDetected: []
        };

        this.init();
        console.log('💾 OfflineManager 초기화 완료');
    }

    /**
     * 초기화
     */
    init() {
        // 네트워크 상태 모니터링
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // 페이지 로드 시 캐시된 데이터 복원
        this.loadCachedData();

        // 주기적 동기화 (온라인 시)
        setInterval(() => {
            if (this.isOnline && this.changeQueue.length > 0) {
                this.syncChanges();
            }
        }, 30000); // 30초마다

        // 스토리지 이벤트 리스너 (다른 탭과의 동기화)
        window.addEventListener('storage', (e) => this.handleStorageChange(e));
    }

    /**
     * 온라인 상태 처리
     */
    handleOnline() {
        console.log('🌐 온라인 모드로 전환');

        this.isOnline = true;

        if (this.isOfflineMode) {
            this.isOfflineMode = false;

            // 오프라인 시간 계산
            if (this.stats.lastOfflineStart) {
                this.stats.offlineTime += Date.now() - this.stats.lastOfflineStart;
            }

            this.emit('onlineMode', {
                timestamp: Date.now(),
                pendingChanges: this.changeQueue.length
            });

            // 대기 중인 변경사항 동기화
            if (this.changeQueue.length > 0) {
                console.log(`🔄 ${this.changeQueue.length}개 변경사항 동기화 시작`);
                this.syncChanges();
            }
        }
    }

    /**
     * 오프라인 상태 처리
     */
    handleOffline() {
        console.log('📵 오프라인 모드로 전환');

        this.isOnline = false;
        this.isOfflineMode = true;
        this.stats.lastOfflineStart = Date.now();

        this.emit('offlineMode', {
            timestamp: Date.now(),
            cachedData: this.hasCachedData()
        });

        // 현재 데이터 캐시
        this.cacheCurrentData();
    }

    /**
     * 데이터 변경사항 추가
     */
    addChange(change) {
        const changeRecord = {
            id: this.generateChangeId(),
            type: change.type, // create, update, delete
            data: change.data,
            timestamp: Date.now(),
            synced: false
        };

        this.changeQueue.push(changeRecord);
        this.stats.changesQueued++;

        // 큐 크기 제한
        if (this.changeQueue.length > this.maxQueueSize) {
            const removed = this.changeQueue.shift();
            console.warn('⚠️ 변경사항 큐 오버플로우:', removed);
        }

        // 로컬 스토리지에 저장
        this.saveChangesToStorage();

        console.log(`📝 변경사항 추가: ${change.type} (큐: ${this.changeQueue.length})`);

        // 오프라인이 아니면 즉시 동기화 시도
        if (this.isOnline && this.syncState === 'idle') {
            setTimeout(() => this.syncChanges(), 1000);
        }

        return changeRecord.id;
    }

    /**
     * 현재 데이터 캐시
     */
    cacheCurrentData() {
        try {
            if (this.incrementalManager) {
                const data = this.incrementalManager.getData();
                const version = this.incrementalManager.currentVersion;

                localStorage.setItem(this.storageKeys.data, JSON.stringify(data));
                localStorage.setItem(this.storageKeys.version, version || '');

                const metadata = {
                    cachedAt: Date.now(),
                    rowCount: data.length,
                    version: version
                };

                localStorage.setItem(this.storageKeys.metadata, JSON.stringify(metadata));

                console.log(`💾 데이터 캐시 완료: ${data.length}행`);

                this.emit('dataCached', {
                    rowCount: data.length,
                    version: version,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            console.error('❌ 데이터 캐시 실패:', error);
        }
    }

    /**
     * 캐시된 데이터 로드
     */
    loadCachedData() {
        try {
            const cachedData = localStorage.getItem(this.storageKeys.data);
            const cachedVersion = localStorage.getItem(this.storageKeys.version);
            const cachedChanges = localStorage.getItem(this.storageKeys.changes);

            if (cachedData) {
                const data = JSON.parse(cachedData);
                console.log(`📁 캐시된 데이터 로드: ${data.length}행`);

                // 증분 매니저에 데이터 설정
                if (this.incrementalManager) {
                    this.incrementalManager.dataStore = data;
                    this.incrementalManager.currentVersion = cachedVersion;
                }
            }

            if (cachedChanges) {
                this.changeQueue = JSON.parse(cachedChanges);
                console.log(`📝 캐시된 변경사항 로드: ${this.changeQueue.length}개`);
            }

        } catch (error) {
            console.error('❌ 캐시된 데이터 로드 실패:', error);
        }
    }

    /**
     * 변경사항을 스토리지에 저장
     */
    saveChangesToStorage() {
        try {
            localStorage.setItem(this.storageKeys.changes, JSON.stringify(this.changeQueue));
        } catch (error) {
            console.error('❌ 변경사항 저장 실패:', error);
        }
    }

    /**
     * 변경사항 동기화
     */
    async syncChanges() {
        if (this.syncState === 'syncing' || !this.isOnline || this.changeQueue.length === 0) {
            return;
        }

        this.syncState = 'syncing';
        this.stats.syncAttempts++;

        console.log(`🔄 동기화 시작: ${this.changeQueue.length}개 변경사항`);

        this.emit('syncStarted', {
            changeCount: this.changeQueue.length,
            timestamp: Date.now()
        });

        try {
            // 변경사항을 배치로 처리
            const batchSize = 10;
            let synced = 0;
            let conflicts = 0;

            for (let i = 0; i < this.changeQueue.length; i += batchSize) {
                const batch = this.changeQueue.slice(i, i + batchSize);
                const result = await this.syncBatch(batch);

                synced += result.synced;
                conflicts += result.conflicts;

                // 동기화된 항목 제거
                this.changeQueue.splice(i - synced, result.synced);
            }

            this.stats.changesSynced += synced;
            this.stats.conflictsResolved += conflicts;
            this.lastSyncTime = Date.now();

            // 스토리지 업데이트
            this.saveChangesToStorage();

            console.log(`✅ 동기화 완료: ${synced}개 동기화, ${conflicts}개 충돌 해결`);

            this.emit('syncCompleted', {
                synced: synced,
                conflicts: conflicts,
                remaining: this.changeQueue.length,
                timestamp: Date.now()
            });

        } catch (error) {
            console.error('❌ 동기화 실패:', error);
            this.syncState = 'error';

            // 재시도 스케줄링
            setTimeout(() => {
                this.syncState = 'idle';
                this.syncChanges();
            }, 5000);

            return;
        }

        this.syncState = 'idle';
    }

    /**
     * 배치 동기화
     */
    async syncBatch(batch) {
        // 실제 서버와의 동기화 로직
        // 여기서는 시뮬레이션

        let synced = 0;
        let conflicts = 0;

        for (const change of batch) {
            try {
                // 서버에 변경사항 전송 시뮬레이션
                const result = await this.sendChangeToServer(change);

                if (result.success) {
                    synced++;
                    change.synced = true;
                } else if (result.conflict) {
                    conflicts++;
                    await this.resolveConflict(change, result.serverData);
                }

            } catch (error) {
                console.error('❌ 변경사항 동기화 실패:', change.id, error);
            }
        }

        return { synced, conflicts };
    }

    /**
     * 서버에 변경사항 전송 (시뮬레이션)
     */
    async sendChangeToServer(change) {
        // 실제로는 Apps Script API 호출
        return new Promise((resolve) => {
            setTimeout(() => {
                // 90% 성공률 시뮬레이션
                if (Math.random() < 0.9) {
                    resolve({ success: true });
                } else {
                    resolve({
                        success: false,
                        conflict: true,
                        serverData: { /* 서버 데이터 */ }
                    });
                }
            }, 100);
        });
    }

    /**
     * 충돌 해결
     */
    async resolveConflict(change, serverData) {
        console.warn('⚠️ 데이터 충돌 감지:', change.id);

        this.emit('conflictDetected', {
            changeId: change.id,
            clientData: change.data,
            serverData: serverData,
            resolution: this.conflictResolution
        });

        let resolvedData;

        switch (this.conflictResolution) {
            case 'server-wins':
                resolvedData = serverData;
                break;

            case 'client-wins':
                resolvedData = change.data;
                break;

            case 'merge':
                resolvedData = this.mergeData(change.data, serverData);
                break;

            default:
                resolvedData = serverData;
        }

        // 해결된 데이터 적용
        if (this.incrementalManager) {
            // 로컬 데이터 업데이트
            this.incrementalManager.applyResolvedConflict(change, resolvedData);
        }

        change.synced = true;
        return resolvedData;
    }

    /**
     * 데이터 병합
     */
    mergeData(clientData, serverData) {
        // 간단한 병합 로직 (실제로는 더 복잡)
        return {
            ...serverData,
            ...clientData,
            mergedAt: Date.now()
        };
    }

    /**
     * 변경 ID 생성
     */
    generateChangeId() {
        return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 스토리지 변경 처리 (다른 탭과의 동기화)
     */
    handleStorageChange(event) {
        if (event.key === this.storageKeys.changes) {
            // 다른 탭에서 변경사항 업데이트
            this.loadCachedData();
        }
    }

    /**
     * 캐시된 데이터 존재 확인
     */
    hasCachedData() {
        return localStorage.getItem(this.storageKeys.data) !== null;
    }

    /**
     * 캐시 정리
     */
    clearCache() {
        Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });

        this.changeQueue = [];
        console.log('🗑️ 오프라인 캐시 정리 완료');
    }

    /**
     * 강제 동기화
     */
    forcSync() {
        if (this.isOnline) {
            this.syncState = 'idle';
            this.syncChanges();
        } else {
            console.warn('⚠️ 오프라인 상태에서는 동기화할 수 없습니다');
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
                    console.error(`Offline event error (${event}):`, error);
                }
            });
        }
    }

    /**
     * 상태 조회
     */
    getStatus() {
        return {
            isOnline: this.isOnline,
            isOfflineMode: this.isOfflineMode,
            syncState: this.syncState,
            pendingChanges: this.changeQueue.length,
            hasCachedData: this.hasCachedData(),
            lastSyncTime: this.lastSyncTime,
            conflictResolution: this.conflictResolution
        };
    }

    /**
     * 통계 조회
     */
    getStats() {
        const currentOfflineTime = this.isOfflineMode && this.stats.lastOfflineStart
            ? Date.now() - this.stats.lastOfflineStart
            : 0;

        return {
            ...this.stats,
            currentOfflineTime: currentOfflineTime,
            totalOfflineTime: this.stats.offlineTime + currentOfflineTime,
            syncSuccessRate: this.stats.syncAttempts > 0
                ? ((this.stats.changesSynced / this.stats.changesQueued) * 100).toFixed(1) + '%'
                : '0%',
            averageQueueSize: this.changeQueue.length
        };
    }

    /**
     * 충돌 해결 전략 설정
     */
    setConflictResolution(strategy) {
        const validStrategies = ['server-wins', 'client-wins', 'merge'];
        if (validStrategies.includes(strategy)) {
            this.conflictResolution = strategy;
            console.log(`✅ 충돌 해결 전략 변경: ${strategy}`);
        }
    }
}

// 전역 헬퍼 함수
function initializeOfflineManager(incrementalManager) {
    const offlineManager = new OfflineManager(incrementalManager);

    // 이벤트 리스너 설정
    offlineManager.on('offlineMode', (data) => {
        console.log('📵 오프라인 모드 활성화');
        if (window.updateOfflineStatus) {
            window.updateOfflineStatus(true, data);
        }
    });

    offlineManager.on('onlineMode', (data) => {
        console.log('🌐 온라인 모드 복구');
        if (window.updateOfflineStatus) {
            window.updateOfflineStatus(false, data);
        }
    });

    offlineManager.on('syncCompleted', (data) => {
        console.log(`🔄 동기화 완료: ${data.synced}개 처리`);
        if (window.updateSyncStatus) {
            window.updateSyncStatus(data);
        }
    });

    offlineManager.on('conflictDetected', (data) => {
        console.warn(`⚠️ 충돌 감지: ${data.changeId}`);
        if (window.showConflictNotification) {
            window.showConflictNotification(data);
        }
    });

    // 전역 등록
    window.offlineManager = offlineManager;

    console.log('✅ OfflineManager 전역 등록 완료');
    return offlineManager;
}

// 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OfflineManager;
}