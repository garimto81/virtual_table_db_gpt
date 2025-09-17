/**
 * 성능 모니터링 도구
 * 현재 폴링 방식의 성능을 측정하고 개선 후 비교를 위한 기준선 설정
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            apiCalls: {
                total: 0,
                byType: {
                    fullData: 0,
                    checksum: 0,
                    incremental: 0
                },
                timestamps: []
            },
            latency: {
                samples: [],
                average: 0,
                min: Infinity,
                max: 0
            },
            dataTransfer: {
                totalBytes: 0,
                samples: []
            },
            errors: {
                count: 0,
                types: {}
            },
            sessionStartTime: Date.now(),
            lastResetTime: Date.now()
        };

        // 10분 간격으로 메트릭 리포트
        this.reportInterval = 10 * 60 * 1000; // 10분
        this.startReporting();
    }

    /**
     * API 호출 추적
     * @param {string} type - 호출 타입 (fullData, checksum, incremental)
     * @param {number} responseTime - 응답 시간(ms)
     * @param {number} dataSize - 데이터 크기(bytes)
     */
    trackApiCall(type, responseTime, dataSize) {
        const now = Date.now();

        // API 호출 카운트
        this.metrics.apiCalls.total++;
        this.metrics.apiCalls.byType[type] = (this.metrics.apiCalls.byType[type] || 0) + 1;
        this.metrics.apiCalls.timestamps.push(now);

        // 지연 시간 추적
        this.metrics.latency.samples.push(responseTime);
        this.metrics.latency.min = Math.min(this.metrics.latency.min, responseTime);
        this.metrics.latency.max = Math.max(this.metrics.latency.max, responseTime);
        this.updateAverageLatency();

        // 데이터 전송량 추적
        this.metrics.dataTransfer.totalBytes += dataSize;
        this.metrics.dataTransfer.samples.push({
            timestamp: now,
            bytes: dataSize
        });

        // 최근 1시간 데이터만 유지
        this.cleanOldData();
    }

    /**
     * 에러 추적
     * @param {string} errorType - 에러 타입
     * @param {Error} error - 에러 객체
     */
    trackError(errorType, error) {
        this.metrics.errors.count++;
        this.metrics.errors.types[errorType] = (this.metrics.errors.types[errorType] || 0) + 1;

        console.error(`[Performance Monitor] Error: ${errorType}`, error);
    }

    /**
     * 평균 지연 시간 계산
     */
    updateAverageLatency() {
        const samples = this.metrics.latency.samples;
        if (samples.length === 0) return;

        const sum = samples.reduce((acc, val) => acc + val, 0);
        this.metrics.latency.average = sum / samples.length;
    }

    /**
     * 1시간 이상 된 데이터 정리
     */
    cleanOldData() {
        const oneHourAgo = Date.now() - 60 * 60 * 1000;

        // 타임스탬프 정리
        this.metrics.apiCalls.timestamps = this.metrics.apiCalls.timestamps.filter(
            ts => ts > oneHourAgo
        );

        // 데이터 전송 샘플 정리
        this.metrics.dataTransfer.samples = this.metrics.dataTransfer.samples.filter(
            sample => sample.timestamp > oneHourAgo
        );

        // 지연 시간 샘플은 최근 100개만 유지
        if (this.metrics.latency.samples.length > 100) {
            this.metrics.latency.samples = this.metrics.latency.samples.slice(-100);
            this.updateAverageLatency();
        }
    }

    /**
     * 현재 메트릭 리포트
     */
    generateReport() {
        const duration = (Date.now() - this.metrics.lastResetTime) / 1000; // 초 단위
        const apiCallsPerMinute = (this.metrics.apiCalls.total / duration) * 60;
        const apiCallsPerDay = apiCallsPerMinute * 60 * 24;

        return {
            summary: {
                totalApiCalls: this.metrics.apiCalls.total,
                apiCallsPerMinute: apiCallsPerMinute.toFixed(2),
                estimatedDailyApiCalls: Math.round(apiCallsPerDay),
                averageLatency: `${this.metrics.latency.average.toFixed(0)}ms`,
                minLatency: `${this.metrics.latency.min}ms`,
                maxLatency: `${this.metrics.latency.max}ms`,
                totalDataTransfer: this.formatBytes(this.metrics.dataTransfer.totalBytes),
                errorRate: `${((this.metrics.errors.count / this.metrics.apiCalls.total) * 100).toFixed(2)}%`,
                monitoringDuration: this.formatDuration(duration)
            },
            details: {
                apiCallsByType: this.metrics.apiCalls.byType,
                errorTypes: this.metrics.errors.types,
                recentApiCalls: this.getRecentApiCallRate()
            }
        };
    }

    /**
     * 최근 10분간 API 호출률
     */
    getRecentApiCallRate() {
        const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
        const recentCalls = this.metrics.apiCalls.timestamps.filter(ts => ts > tenMinutesAgo);
        return {
            count: recentCalls.length,
            rate: (recentCalls.length / 10).toFixed(2) + ' calls/min'
        };
    }

    /**
     * 바이트를 읽기 쉬운 형식으로 변환
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 시간을 읽기 쉬운 형식으로 변환
     */
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    /**
     * 정기 리포팅 시작
     */
    startReporting() {
        setInterval(() => {
            console.log('=== 성능 모니터링 리포트 ===');
            console.log(JSON.stringify(this.generateReport(), null, 2));

            // 대시보드에 표시
            this.displayOnDashboard();
        }, this.reportInterval);
    }

    /**
     * 대시보드에 메트릭 표시
     */
    displayOnDashboard() {
        const report = this.generateReport();
        const dashboardElement = document.getElementById('performance-dashboard');

        if (dashboardElement) {
            dashboardElement.innerHTML = `
                <div class="performance-metrics">
                    <h3>실시간 성능 메트릭</h3>
                    <div class="metric-grid">
                        <div class="metric-item">
                            <span class="metric-label">총 API 호출</span>
                            <span class="metric-value">${report.summary.totalApiCalls}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">분당 호출</span>
                            <span class="metric-value">${report.summary.apiCallsPerMinute}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">예상 일일 호출</span>
                            <span class="metric-value ${report.summary.estimatedDailyApiCalls > 5000 ? 'warning' : ''}">${report.summary.estimatedDailyApiCalls}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">평균 지연시간</span>
                            <span class="metric-value">${report.summary.averageLatency}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">데이터 전송량</span>
                            <span class="metric-value">${report.summary.totalDataTransfer}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">에러율</span>
                            <span class="metric-value ${parseFloat(report.summary.errorRate) > 1 ? 'warning' : ''}">${report.summary.errorRate}</span>
                        </div>
                    </div>
                    <div class="monitoring-duration">
                        모니터링 시간: ${report.summary.monitoringDuration}
                    </div>
                </div>
            `;
        }
    }

    /**
     * 메트릭 리셋
     */
    reset() {
        this.metrics = {
            apiCalls: {
                total: 0,
                byType: {
                    fullData: 0,
                    checksum: 0,
                    incremental: 0
                },
                timestamps: []
            },
            latency: {
                samples: [],
                average: 0,
                min: Infinity,
                max: 0
            },
            dataTransfer: {
                totalBytes: 0,
                samples: []
            },
            errors: {
                count: 0,
                types: {}
            },
            sessionStartTime: Date.now(),
            lastResetTime: Date.now()
        };
    }

    /**
     * CSV 형식으로 메트릭 내보내기
     */
    exportToCSV() {
        const report = this.generateReport();
        const csvData = [
            ['Metric', 'Value'],
            ['Total API Calls', report.summary.totalApiCalls],
            ['API Calls Per Minute', report.summary.apiCallsPerMinute],
            ['Estimated Daily API Calls', report.summary.estimatedDailyApiCalls],
            ['Average Latency', report.summary.averageLatency],
            ['Min Latency', report.summary.minLatency],
            ['Max Latency', report.summary.maxLatency],
            ['Total Data Transfer', report.summary.totalDataTransfer],
            ['Error Rate', report.summary.errorRate],
            ['Monitoring Duration', report.summary.monitoringDuration]
        ];

        const csv = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance_metrics_${Date.now()}.csv`;
        a.click();
    }
}

// 전역 성능 모니터 인스턴스
window.performanceMonitor = new PerformanceMonitor();

// 기존 fetchSheetData 함수를 래핑하여 성능 추적
if (typeof fetchSheetData !== 'undefined') {
    const originalFetchSheetData = fetchSheetData;
    fetchSheetData = async function(...args) {
        const startTime = Date.now();

        try {
            const result = await originalFetchSheetData.apply(this, args);
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            const dataSize = JSON.stringify(result).length;

            // 성능 메트릭 추적
            window.performanceMonitor.trackApiCall('fullData', responseTime, dataSize);

            return result;
        } catch (error) {
            window.performanceMonitor.trackError('fetchSheetData', error);
            throw error;
        }
    };
}

console.log('Performance Monitor 초기화 완료');
console.log('10분마다 자동으로 성능 리포트가 생성됩니다.');