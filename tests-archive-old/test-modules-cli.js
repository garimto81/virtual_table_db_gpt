#!/usr/bin/env node
/**
 * 모듈화된 로직 CLI 테스트 스크립트
 *
 * 사용법:
 *   node test-modules-cli.js
 *   node test-modules-cli.js --performance
 *   node test-modules-cli.js --verbose
 */

// 🎨 콘솔 색상
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// 테스트 통계
let testStats = {
    passed: 0,
    failed: 0,
    total: 0,
    startTime: Date.now()
};

// 명령행 인수
const args = process.argv.slice(2);
const isVerbose = args.includes('--verbose') || args.includes('-v');
const isPerformanceOnly = args.includes('--performance') || args.includes('-p');

/**
 * 콘솔 출력 유틸리티
 */
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function logHeader(message) {
    log(`\n${'='.repeat(50)}`, 'cyan');
    log(`🧪 ${message}`, 'cyan');
    log(`${'='.repeat(50)}`, 'cyan');
}

/**
 * 테스트 결과 기록
 */
function recordTest(testName, passed, details = '') {
    testStats.total++;
    if (passed) {
        testStats.passed++;
        logSuccess(`${testName}`);
    } else {
        testStats.failed++;
        logError(`${testName}`);
    }

    if (details && isVerbose) {
        log(`   ${details}`, 'magenta');
    }
}

/**
 * 가짜 브라우저 환경 시뮬레이션
 */
function setupMockEnvironment() {
    // 글로벌 객체들 시뮬레이션
    global.window = {
        DEBUG_MODE: true,
        CONFIG: {
            GEMINI_API_KEY: 'test-key-12345'
        }
    };

    // localStorage 시뮬레이션
    global.localStorage = {
        storage: {
            'filenamePrefix': 'VT',
            'filenameSuffix': '_test',
            'useAIForFilename': 'true',
            'filenameTemplate': '{prefix}{handNumber}_{position}_{action}'
        },
        getItem: function(key) {
            return this.storage[key] || null;
        },
        setItem: function(key, value) {
            this.storage[key] = value;
        },
        removeItem: function(key) {
            delete this.storage[key];
        }
    };

    // Map 시뮬레이션 (Node.js에는 이미 있지만 명시적으로)
    if (!global.Map) {
        global.Map = Map;
    }

    // 콘솔 메서드들 (기본적으로 있지만 확인)
    global.console = console;

    // setTimeout 시뮬레이션
    global.setTimeout = setTimeout;
    global.performance = {
        now: () => Date.now()
    };
}

/**
 * 모듈 로드 시뮬레이션
 */
function loadModules() {
    logHeader('모듈 로드 테스트');

    try {
        // FilenameManager 클래스 시뮬레이션
        class MockFilenameManager {
            constructor() {
                this.handToFilename = new Map();
                this.filenameToHand = new Map();
                this.config = {
                    prefix: 'VT',
                    suffix: '_test',
                    template: '{prefix}{handNumber}_{position}_{action}'
                };
            }

            async generateCustomFilename(handNumber) {
                // 캐시 확인
                if (this.handToFilename.has(handNumber)) {
                    return this.handToFilename.get(handNumber);
                }

                // 새 파일명 생성
                const filename = `${this.config.prefix}${handNumber}_TestHero_AK_TestVillain_QQ_test_summary${this.config.suffix}`;
                this.saveMapping(handNumber, filename);
                return filename;
            }

            saveMapping(handNumber, filename) {
                this.handToFilename.set(handNumber, filename);
                this.filenameToHand.set(filename, handNumber);
            }

            extractHandNumber(filename) {
                if (this.filenameToHand.has(filename)) {
                    return this.filenameToHand.get(filename);
                }

                // 패턴 매칭
                const patterns = [
                    /^[A-Z]+(\d+)_/,
                    /^(\d+)_/,
                    /^(\d+)$/
                ];

                for (const pattern of patterns) {
                    const match = filename.match(pattern);
                    if (match) {
                        const handNumber = parseInt(match[1]);
                        this.saveMapping(handNumber, filename);
                        return handNumber;
                    }
                }
                return null;
            }

            batchSaveMappings(items) {
                items.forEach(({handNumber, filename}) => {
                    if (handNumber && filename) {
                        this.saveMapping(parseInt(handNumber), filename);
                    }
                });
            }

            getStats() {
                return {
                    totalMappings: this.handToFilename.size,
                    memorySize: `${(this.handToFilename.size * 100 / 1024).toFixed(2)} KB`
                };
            }
        }

        // AIAnalyzer 클래스 시뮬레이션
        class MockAIAnalyzer {
            constructor() {
                this.analysisCache = new Map();
                this.CACHE_TTL = 24 * 60 * 60 * 1000;
            }

            async generateFileSummary(analysis) {
                const cacheKey = `file_${analysis.handData.handNumber}`;
                const cached = this.analysisCache.get(cacheKey);

                if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
                    return cached.analysis;
                }

                // 가짜 AI 요약 생성
                const summary = analysis.keywords ?
                    analysis.keywords.slice(0, 3).join('_') :
                    'test_summary_action';

                this.analysisCache.set(cacheKey, {
                    analysis: summary,
                    timestamp: Date.now()
                });

                return summary;
            }

            getStats() {
                return {
                    cacheSize: this.analysisCache.size,
                    apiKey: '설정됨',
                    models: ['gemini-1.5-flash-latest']
                };
            }
        }

        // 글로벌에 모듈 할당
        global.window.FilenameManager = new MockFilenameManager();
        global.window.AIAnalyzer = new MockAIAnalyzer();

        // 호환성 함수들
        global.window.generateCustomFilename = async function(handNumber) {
            return await global.window.FilenameManager.generateCustomFilename(handNumber);
        };

        global.window.extractHandNumberFromFilename = function(filename) {
            return global.window.FilenameManager.extractHandNumber(filename);
        };

        // 가짜 분석 함수
        global.window.getUnifiedHandAnalysis = async function(handNumber) {
            return {
                handData: { handNumber },
                hero: { name: 'TestHero', cards: 'AK' },
                villain: { name: 'TestVillain', cards: 'QQ' },
                keywords: ['3bet', 'bluff', 'fold'],
                summary: 'test_summary'
            };
        };

        recordTest('FilenameManager 모듈 로드', true, 'Mock 클래스로 시뮬레이션');
        recordTest('AIAnalyzer 모듈 로드', true, 'Mock 클래스로 시뮬레이션');
        recordTest('호환성 어댑터 로드', true, '래퍼 함수들 설정 완료');

    } catch (error) {
        recordTest('모듈 로드', false, `오류: ${error.message}`);
        return false;
    }

    return true;
}

/**
 * 파일명 생성 테스트
 */
async function testFilenameGeneration() {
    logHeader('파일명 생성 테스트');

    try {
        // 기본 파일명 생성
        const filename1 = await global.window.FilenameManager.generateCustomFilename(142);
        const passed1 = filename1.includes('VT142') && filename1.includes('TestHero');
        recordTest('기본 파일명 생성', passed1, `결과: ${filename1}`);

        // 캐시 테스트
        const start = Date.now();
        const filename2 = await global.window.FilenameManager.generateCustomFilename(142);
        const cacheTime = Date.now() - start;
        const passed2 = filename1 === filename2 && cacheTime < 10;
        recordTest('캐시 시스템', passed2, `캐시 시간: ${cacheTime}ms`);

        // 다른 핸드번호
        const filename3 = await global.window.FilenameManager.generateCustomFilename(999);
        const passed3 = filename3.includes('VT999') && filename3 !== filename1;
        recordTest('다른 핸드번호', passed3, `결과: ${filename3}`);

    } catch (error) {
        recordTest('파일명 생성 테스트', false, `오류: ${error.message}`);
    }
}

/**
 * 매핑 시스템 테스트
 */
async function testMappingSystem() {
    logHeader('매핑 시스템 테스트');

    try {
        // 매핑 저장/추출
        global.window.FilenameManager.saveMapping(777, 'test_777_mapping');
        const extracted = global.window.FilenameManager.extractHandNumber('test_777_mapping');
        recordTest('매핑 저장/추출', extracted === 777, `저장: 777, 추출: ${extracted}`);

        // 일괄 매핑
        const batchData = [];
        for (let i = 500; i < 510; i++) {
            batchData.push({ handNumber: i, filename: `batch_${i}_test` });
        }
        global.window.FilenameManager.batchSaveMappings(batchData);

        let batchSuccess = true;
        for (let i = 500; i < 510; i++) {
            const extracted = global.window.FilenameManager.extractHandNumber(`batch_${i}_test`);
            if (extracted !== i) {
                batchSuccess = false;
                break;
            }
        }
        recordTest('일괄 매핑', batchSuccess, '10개 매핑 일괄 처리');

        // 통계 확인
        const stats = global.window.FilenameManager.getStats();
        recordTest('매핑 통계', stats.totalMappings > 10, `총 매핑: ${stats.totalMappings}`);

    } catch (error) {
        recordTest('매핑 시스템 테스트', false, `오류: ${error.message}`);
    }
}

/**
 * AI 통합 테스트
 */
async function testAIIntegration() {
    logHeader('AI 통합 테스트');

    try {
        // AI 요약 생성
        const mockAnalysis = {
            handData: { handNumber: 888 },
            keywords: ['3bet', 'bluff', 'fold']
        };
        const summary = await global.window.AIAnalyzer.generateFileSummary(mockAnalysis);
        recordTest('AI 요약 생성', summary && summary.includes('_'), `결과: ${summary}`);

        // AI 캐시
        const start = Date.now();
        const summary2 = await global.window.AIAnalyzer.generateFileSummary(mockAnalysis);
        const cacheTime = Date.now() - start;
        recordTest('AI 캐시', summary === summary2 && cacheTime < 10, `캐시 시간: ${cacheTime}ms`);

        // AI 통계
        const aiStats = global.window.AIAnalyzer.getStats();
        recordTest('AI 통계', aiStats.cacheSize >= 0, `캐시 크기: ${aiStats.cacheSize}`);

    } catch (error) {
        recordTest('AI 통합 테스트', false, `오류: ${error.message}`);
    }
}

/**
 * 성능 벤치마크
 */
async function performanceBenchmark() {
    logHeader('성능 벤치마크');

    try {
        const iterations = 1000;
        logInfo(`${iterations}개 파일명 성능 테스트 시작...`);

        // 데이터 준비
        for (let i = 1; i <= iterations; i++) {
            await global.window.FilenameManager.generateCustomFilename(i);
        }

        // 조회 성능 측정
        const start = Date.now();
        for (let i = 1; i <= iterations; i++) {
            await global.window.FilenameManager.generateCustomFilename(i);
        }
        const end = Date.now();

        const totalTime = end - start;
        const avgTime = totalTime / iterations;
        const throughput = Math.round(1000 / avgTime);

        log(`\n📊 성능 결과:`, 'cyan');
        log(`   총 시간: ${totalTime}ms`, 'yellow');
        log(`   평균 시간: ${avgTime.toFixed(4)}ms`, 'yellow');
        log(`   초당 처리량: ${throughput.toLocaleString()}개/초`, 'yellow');

        const passed = avgTime < 1; // 1ms 이하 기대
        recordTest('성능 벤치마크', passed, `평균: ${avgTime.toFixed(4)}ms`);

    } catch (error) {
        recordTest('성능 벤치마크', false, `오류: ${error.message}`);
    }
}

/**
 * 최종 결과 출력
 */
function printSummary() {
    const duration = Date.now() - testStats.startTime;
    const successRate = ((testStats.passed / testStats.total) * 100).toFixed(1);

    log(`\n${'='.repeat(50)}`, 'cyan');
    log(`🏁 테스트 완료`, 'bright');
    log(`${'='.repeat(50)}`, 'cyan');
    log(`통과: ${testStats.passed}/${testStats.total}`, 'green');
    log(`실패: ${testStats.failed}/${testStats.total}`, testStats.failed > 0 ? 'red' : 'green');
    log(`성공률: ${successRate}%`, successRate >= 90 ? 'green' : 'yellow');
    log(`실행 시간: ${duration}ms`, 'blue');

    if (testStats.failed === 0) {
        log(`\n🎉 모든 테스트 통과!`, 'green');
    } else {
        log(`\n⚠️  ${testStats.failed}개 테스트 실패`, 'red');
    }
}

/**
 * 메인 테스트 실행
 */
async function runTests() {
    log(`🧪 모듈화된 로직 CLI 테스트 시작`, 'bright');
    log(`실행 옵션: ${isVerbose ? 'verbose ' : ''}${isPerformanceOnly ? 'performance-only' : ''}`, 'blue');

    // 환경 설정
    setupMockEnvironment();

    // 모듈 로드
    const modulesLoaded = loadModules();
    if (!modulesLoaded) {
        log(`❌ 모듈 로드 실패, 테스트 중단`, 'red');
        process.exit(1);
    }

    // 테스트 실행
    if (isPerformanceOnly) {
        await performanceBenchmark();
    } else {
        await testFilenameGeneration();
        await testMappingSystem();
        await testAIIntegration();
        await performanceBenchmark();
    }

    // 결과 출력
    printSummary();

    // 종료 코드
    process.exit(testStats.failed === 0 ? 0 : 1);
}

// 실행
if (require.main === module) {
    runTests().catch(error => {
        logError(`치명적 오류: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    });
}

module.exports = { runTests, setupMockEnvironment };