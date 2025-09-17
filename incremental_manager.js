/**
 * Incremental Update Manager - 클라이언트 측 증분 업데이트 관리
 * Day 3 구현
 */

class IncrementalUpdateManager {
    constructor(appsScriptUrl) {
        this.appsScriptUrl = appsScriptUrl;
        this.clientId = this.generateClientId();
        this.currentVersion = null;
        this.dataStore = [];
        this.updateQueue = [];
        this.isProcessing = false;
        this.conflictStrategy = 'server-wins';

        // 통계
        this.stats = {
            fullSyncs: 0,
            incrementalUpdates: 0,
            conflictsResolved: 0,
            deltasApplied: 0,
            startTime: Date.now()
        };

        // 이벤트 리스너
        this.eventListeners = {
            deltaReceived: [],
            deltaApplied: [],
            conflictDetected: [],
            fullSyncRequired: [],
            error: []
        };

        console.log(`🔧 IncrementalUpdateManager 초기화 (ID: ${this.clientId})`);
    }

    /**
     * 고유 클라이언트 ID 생성
     */
    generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
     * 증분 업데이트 요청
     */
    async fetchUpdate() {
        const startTime = performance.now();

        try {
            const url = `${this.appsScriptUrl}?action=getIncremental&clientId=${encodeURIComponent(this.clientId)}&version=${encodeURIComponent(this.currentVersion || '')}`;

            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const update = await response.json();
            const endTime = performance.now();

            // 성능 모니터링
            if (window.performanceMonitor) {
                window.performanceMonitor.trackApiCall(
                    'incremental',
                    endTime - startTime,
                    JSON.stringify(update).length
                );
            }

            console.log(`📦 업데이트 수신: 타입=${update.type}, 시간=${(endTime - startTime).toFixed(0)}ms`);

            // 업데이트 적용
            await this.applyUpdate(update);

            return update;

        } catch (error) {
            console.error('❌ 증분 업데이트 실패:', error);
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * 업데이트 적용
     */
    async applyUpdate(update) {
        if (update.type === 'full') {
            // 전체 동기화
            console.log('🔄 전체 동기화 수행');
            this.dataStore = update.data;
            this.currentVersion = update.version;
            this.stats.fullSyncs++;

            this.emit('fullSyncRequired', {
                data: update.data,
                version: update.version,
                reason: 'Version mismatch or first sync'
            });

        } else if (update.type === 'incremental') {
            // 증분 업데이트
            console.log(`🔺 증분 업데이트: +${update.stats.added} ~${update.stats.modified} -${update.stats.deleted}`);

            this.emit('deltaReceived', {
                delta: update.delta,
                stats: update.stats
            });

            await this.applyDelta(update.delta);
            this.currentVersion = update.version;
            this.stats.incrementalUpdates++;
        }
    }

    /**
     * 델타 적용
     */
    async applyDelta(delta) {
        // 업데이트 큐에 추가
        this.updateQueue.push(delta);

        if (!this.isProcessing) {
            await this.processUpdateQueue();
        }
    }

    /**
     * 업데이트 큐 처리
     */
    async processUpdateQueue() {
        this.isProcessing = true;

        while (this.updateQueue.length > 0) {
            const delta = this.updateQueue.shift();
            const startTime = performance.now();

            try {
                // 삭제 처리 (역순)
                if (delta.deleted && delta.deleted.length > 0) {
                    delta.deleted
                        .sort((a, b) => b.row - a.row)
                        .forEach(deletion => {
                            this.dataStore.splice(deletion.row, 1);
                            this.updateRowInDOM('delete', deletion.row);
                        });
                }

                // 수정 처리
                if (delta.modified && delta.modified.length > 0) {
                    delta.modified.forEach(modification => {
                        if (this.dataStore[modification.row]) {
                            modification.cells.forEach(cell => {
                                this.dataStore[modification.row][cell.col] = cell.newValue;
                            });
                            this.updateRowInDOM('modify', modification.row, this.dataStore[modification.row]);
                        }
                    });
                }

                // 추가 처리
                if (delta.added && delta.added.length > 0) {
                    delta.added.forEach(addition => {
                        // 지정된 위치에 삽입 또는 끝에 추가
                        if (addition.row >= this.dataStore.length) {
                            this.dataStore.push(addition.data);
                        } else {
                            this.dataStore.splice(addition.row, 0, addition.data);
                        }
                        this.updateRowInDOM('add', addition.row, addition.data);
                    });
                }

                const elapsed = performance.now() - startTime;
                this.stats.deltasApplied++;

                console.log(`✅ 델타 적용 완료 (${elapsed.toFixed(0)}ms)`);

                this.emit('deltaApplied', {
                    delta: delta,
                    dataStore: this.dataStore,
                    elapsed: elapsed
                });

            } catch (error) {
                console.error('❌ 델타 적용 오류:', error);
                this.emit('error', error);
            }
        }

        this.isProcessing = false;
    }

    /**
     * DOM 업데이트 (최적화)
     */
    updateRowInDOM(action, rowIndex, rowData = null) {
        // RequestAnimationFrame으로 배치 처리
        requestAnimationFrame(() => {
            const tbody = document.querySelector('#data-tbody');
            if (!tbody) return;

            switch (action) {
                case 'delete':
                    const rowToDelete = tbody.rows[rowIndex];
                    if (rowToDelete) {
                        rowToDelete.classList.add('row-deleted');
                        setTimeout(() => rowToDelete.remove(), 300);
                    }
                    break;

                case 'modify':
                    const rowToModify = tbody.rows[rowIndex];
                    if (rowToModify && rowData) {
                        // 셀 업데이트
                        rowData.forEach((value, colIndex) => {
                            if (rowToModify.cells[colIndex + 1]) { // +1 for row number column
                                const cell = rowToModify.cells[colIndex + 1];
                                if (cell.textContent !== value) {
                                    cell.textContent = value;
                                    cell.classList.add('cell-updated');
                                    setTimeout(() => cell.classList.remove('cell-updated'), 500);
                                }
                            }
                        });
                    }
                    break;

                case 'add':
                    const newRow = tbody.insertRow(rowIndex);
                    newRow.innerHTML = `
                        <td class="p-2">${rowIndex + 1}</td>
                        ${rowData.map(value => `<td class="p-2">${value || '-'}</td>`).join('')}
                    `;
                    newRow.classList.add('row-added');
                    setTimeout(() => newRow.classList.remove('row-added'), 500);
                    break;
            }
        });
    }

    /**
     * 로컬 변경사항 추적
     */
    trackLocalChange(row, col, newValue) {
        const change = {
            row: row,
            col: col,
            oldValue: this.dataStore[row] ? this.dataStore[row][col] : null,
            newValue: newValue,
            timestamp: Date.now()
        };

        // 로컬 데이터스토어 업데이트
        if (this.dataStore[row]) {
            this.dataStore[row][col] = newValue;
        }

        return change;
    }

    /**
     * 충돌 해결
     */
    async resolveConflicts(localChanges, serverDelta) {
        const conflicts = this.detectConflicts(localChanges, serverDelta);

        if (conflicts.length > 0) {
            console.warn(`⚠️ ${conflicts.length}개 충돌 감지`);

            this.emit('conflictDetected', {
                conflicts: conflicts,
                strategy: this.conflictStrategy
            });

            const resolutions = this.applyConflictStrategy(conflicts);
            this.stats.conflictsResolved += conflicts.length;

            return resolutions;
        }

        return [];
    }

    /**
     * 충돌 감지
     */
    detectConflicts(localChanges, serverDelta) {
        const conflicts = [];

        localChanges.forEach(localChange => {
            serverDelta.modified?.forEach(serverMod => {
                if (localChange.row === serverMod.row) {
                    serverMod.cells.forEach(serverCell => {
                        if (localChange.col === serverCell.col) {
                            conflicts.push({
                                row: localChange.row,
                                col: localChange.col,
                                localValue: localChange.newValue,
                                serverValue: serverCell.newValue,
                                baseValue: serverCell.oldValue
                            });
                        }
                    });
                }
            });
        });

        return conflicts;
    }

    /**
     * 충돌 해결 전략 적용
     */
    applyConflictStrategy(conflicts) {
        const resolutions = [];

        conflicts.forEach(conflict => {
            let resolution;

            switch (this.conflictStrategy) {
                case 'server-wins':
                    resolution = conflict.serverValue;
                    break;

                case 'client-wins':
                    resolution = conflict.localValue;
                    break;

                case 'merge':
                    if (typeof conflict.localValue === 'number' && typeof conflict.serverValue === 'number') {
                        resolution = (conflict.localValue + conflict.serverValue) / 2;
                    } else {
                        resolution = `${conflict.localValue} | ${conflict.serverValue}`;
                    }
                    break;

                default:
                    resolution = conflict.serverValue;
            }

            resolutions.push({
                row: conflict.row,
                col: conflict.col,
                value: resolution,
                strategy: this.conflictStrategy
            });

            // 해결된 값 적용
            if (this.dataStore[conflict.row]) {
                this.dataStore[conflict.row][conflict.col] = resolution;
            }
        });

        return resolutions;
    }

    /**
     * 전체 동기화 강제 실행
     */
    async forceFullSync() {
        console.log('🔄 강제 전체 동기화');
        this.currentVersion = null;
        return await this.fetchUpdate();
    }

    /**
     * 데이터 가져오기
     */
    getData() {
        return this.dataStore;
    }

    /**
     * 통계 조회
     */
    getStats() {
        const elapsed = (Date.now() - this.stats.startTime) / 1000;

        return {
            clientId: this.clientId,
            currentVersion: this.currentVersion ? this.currentVersion.substring(0, 8) + '...' : null,
            dataRows: this.dataStore.length,
            fullSyncs: this.stats.fullSyncs,
            incrementalUpdates: this.stats.incrementalUpdates,
            deltasApplied: this.stats.deltasApplied,
            conflictsResolved: this.stats.conflictsResolved,
            runningTime: elapsed.toFixed(0) + 's',
            efficiency: this.stats.incrementalUpdates > 0
                ? ((this.stats.incrementalUpdates / (this.stats.fullSyncs + this.stats.incrementalUpdates)) * 100).toFixed(1) + '%'
                : '0%'
        };
    }

    /**
     * 상태 조회
     */
    getStatus() {
        return {
            clientId: this.clientId,
            hasData: this.dataStore.length > 0,
            currentVersion: this.currentVersion,
            queueLength: this.updateQueue.length,
            isProcessing: this.isProcessing,
            conflictStrategy: this.conflictStrategy,
            stats: this.getStats()
        };
    }

    /**
     * 충돌 전략 설정
     */
    setConflictStrategy(strategy) {
        const validStrategies = ['server-wins', 'client-wins', 'merge'];
        if (validStrategies.includes(strategy)) {
            this.conflictStrategy = strategy;
            console.log(`✅ 충돌 해결 전략 변경: ${strategy}`);
        } else {
            console.warn(`⚠️ 유효하지 않은 전략: ${strategy}`);
        }
    }
}

// 전역 헬퍼 함수
function initializeIncrementalManager(appsScriptUrl) {
    const manager = new IncrementalUpdateManager(appsScriptUrl);

    // 이벤트 리스너 설정
    manager.on('deltaReceived', (data) => {
        console.log(`📥 델타 수신: +${data.stats.added} ~${data.stats.modified} -${data.stats.deleted}`);
    });

    manager.on('deltaApplied', (data) => {
        console.log(`✅ 델타 적용 완료 (${data.elapsed.toFixed(0)}ms)`);
    });

    manager.on('conflictDetected', (data) => {
        console.warn(`⚠️ 충돌 감지: ${data.conflicts.length}개 (전략: ${data.strategy})`);
    });

    manager.on('fullSyncRequired', (data) => {
        console.log(`🔄 전체 동기화: ${data.reason}`);
    });

    manager.on('error', (error) => {
        console.error('❌ IncrementalManager 오류:', error);
    });

    // 전역 등록
    window.incrementalManager = manager;

    console.log('✅ IncrementalUpdateManager 전역 등록 완료');
    return manager;
}

// 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IncrementalUpdateManager;
}