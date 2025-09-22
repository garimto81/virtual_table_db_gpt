/**
 * GitHub Pages 버전 모니터링 및 자동 문제 해결 시스템
 * Playwright MCP 사용
 *
 * 목표: v13.3.3 배포 모니터링 및 자동 해결
 * 현재: v12.16.3 (GitHub Pages)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class GitHubPagesVersionMonitor {
    constructor() {
        this.TARGET_VERSION = '13.3.3';
        this.GITHUB_PAGES_URL = 'https://garimto81.github.io/virtual_table_db_claude/';
        this.CHECK_INTERVAL = 5 * 60 * 1000; // 5분
        this.MAX_ATTEMPTS = 20; // 최대 시도 횟수
        this.attemptCount = 0;
        this.successCount = 0;
        this.requiredSuccessCount = 3; // 연속 3회 성공 필요

        // 해결 시도 목록
        this.solutions = [
            { name: 'GitHub Actions 상태 확인', method: 'checkGitHubActions' },
            { name: '캐시 무효화 커밋', method: 'invalidateCache' },
            { name: 'gh-pages 브랜치 직접 업데이트', method: 'updateGhPages' },
            { name: '새로운 index.html 푸시', method: 'forceNewPush' }
        ];
        this.currentSolutionIndex = 0;
    }

    /**
     * 현재 시간 포맷팅
     */
    formatTime() {
        return new Date().toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    /**
     * 로그 출력
     */
    log(message, type = 'INFO') {
        const timestamp = this.formatTime();
        const icon = {
            'INFO': '📝',
            'SUCCESS': '✅',
            'ERROR': '❌',
            'WARNING': '⚠️',
            'CHECK': '🔍',
            'FIX': '🔧'
        }[type] || '📝';

        console.log(`[${timestamp}] ${icon} ${message}`);
    }

    /**
     * Playwright로 GitHub Pages 버전 체크
     */
    async checkVersion() {
        try {
            this.attemptCount++;
            this.log(`버전 체크 #${this.attemptCount}`, 'CHECK');

            // Playwright MCP를 통한 브라우저 자동화
            const { chromium } = require('playwright');
            const browser = await chromium.launch({
                headless: true,
                args: ['--no-cache', '--disable-cache']
            });

            const context = await browser.newContext({
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            });

            const page = await context.newPage();

            // 캐시 비활성화
            await page.route('**/*', route => {
                const headers = {
                    ...route.request().headers(),
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                };
                route.continue({ headers });
            });

            // 캐시 버스팅 URL로 접속
            const cacheBustingUrl = `${this.GITHUB_PAGES_URL}?t=${Date.now()}&v=${Math.random()}`;
            this.log(`접속 URL: ${cacheBustingUrl}`);

            await page.goto(cacheBustingUrl, {
                waitUntil: 'networkidle',
                timeout: 30000
            });

            // 버전 정보 추출
            const versionInfo = await page.evaluate(() => {
                return {
                    appVersion: typeof APP_VERSION !== 'undefined' ? APP_VERSION : null,
                    title: document.title,
                    timestamp: new Date().toISOString(),
                    url: window.location.href,
                    userAgent: navigator.userAgent
                };
            });

            await browser.close();

            // 결과 분석
            const currentVersion = versionInfo.appVersion;
            const isCorrectVersion = currentVersion === this.TARGET_VERSION;

            this.log(`  현재 버전: ${currentVersion || 'undefined'}`);
            this.log(`  목표 버전: ${this.TARGET_VERSION}`);
            this.log(`  페이지 제목: ${versionInfo.title}`);
            this.log(`  상태: ${isCorrectVersion ? '✅ 일치' : '❌ 불일치'}`, isCorrectVersion ? 'SUCCESS' : 'ERROR');

            if (isCorrectVersion) {
                this.successCount++;
                this.log(`연속 성공 횟수: ${this.successCount}/${this.requiredSuccessCount}`, 'SUCCESS');

                if (this.successCount >= this.requiredSuccessCount) {
                    this.log('🎉 버전 업데이트가 성공적으로 완료되었습니다!', 'SUCCESS');
                    this.log(`총 시도 횟수: ${this.attemptCount}`, 'SUCCESS');
                    return { success: true, version: currentVersion };
                }
            } else {
                this.successCount = 0; // 실패시 성공 카운트 리셋
            }

            return { success: isCorrectVersion, version: currentVersion, info: versionInfo };

        } catch (error) {
            this.log(`버전 체크 중 오류 발생: ${error.message}`, 'ERROR');
            return { success: false, error: error.message };
        }
    }

    /**
     * GitHub Actions 상태 확인
     */
    async checkGitHubActions() {
        try {
            this.log('GitHub Actions 워크플로우 상태 확인 중...', 'FIX');

            const output = execSync('gh run list --limit 5 --json status,conclusion,createdAt,workflowName', {
                encoding: 'utf8',
                cwd: process.cwd()
            });

            const runs = JSON.parse(output);
            const latestRun = runs[0];

            if (latestRun) {
                this.log(`  최신 워크플로우: ${latestRun.workflowName}`);
                this.log(`  상태: ${latestRun.status}`);
                this.log(`  결론: ${latestRun.conclusion || 'running'}`);
                this.log(`  생성 시간: ${latestRun.createdAt}`);

                if (latestRun.status === 'in_progress') {
                    this.log('워크플로우가 실행 중입니다. 대기합니다.', 'WARNING');
                    return false;
                }
            }

            // 새로운 워크플로우 트리거
            this.log('새로운 워크플로우 실행을 트리거합니다...', 'FIX');
            execSync('git push origin master --force-with-lease', {
                encoding: 'utf8',
                cwd: process.cwd()
            });

            return true;

        } catch (error) {
            this.log(`GitHub Actions 확인 중 오류: ${error.message}`, 'ERROR');
            return false;
        }
    }

    /**
     * 캐시 무효화 커밋 생성
     */
    async invalidateCache() {
        try {
            this.log('캐시 무효화 커밋 생성 중...', 'FIX');

            // 더미 파일로 캐시 무효화
            const cacheFile = path.join(process.cwd(), '.cache-bust');
            const timestamp = new Date().toISOString();
            fs.writeFileSync(cacheFile, `Cache bust: ${timestamp}\n${Math.random()}`);

            // Git 커밋 및 푸시
            execSync('git add .cache-bust', { cwd: process.cwd() });
            execSync(`git commit -m "chore: cache invalidation - ${timestamp}"`, {
                cwd: process.cwd()
            });
            execSync('git push origin master', { cwd: process.cwd() });

            this.log('캐시 무효화 커밋 완료', 'SUCCESS');
            return true;

        } catch (error) {
            this.log(`캐시 무효화 중 오류: ${error.message}`, 'ERROR');
            return false;
        }
    }

    /**
     * gh-pages 브랜치 직접 업데이트
     */
    async updateGhPages() {
        try {
            this.log('gh-pages 브랜치 직접 업데이트 중...', 'FIX');

            // 현재 브랜치 확인
            const currentBranch = execSync('git branch --show-current', {
                encoding: 'utf8',
                cwd: process.cwd()
            }).trim();

            // gh-pages 브랜치로 전환 또는 생성
            try {
                execSync('git checkout gh-pages', { cwd: process.cwd() });
            } catch {
                execSync('git checkout -b gh-pages', { cwd: process.cwd() });
            }

            // main 브랜치의 index.html 복사
            execSync(`git checkout ${currentBranch} -- index.html`, {
                cwd: process.cwd()
            });

            // 커밋 및 푸시
            execSync('git add index.html', { cwd: process.cwd() });
            execSync(`git commit -m "deploy: update to v${this.TARGET_VERSION}"`, {
                cwd: process.cwd()
            });
            execSync('git push origin gh-pages --force', { cwd: process.cwd() });

            // 원래 브랜치로 돌아가기
            execSync(`git checkout ${currentBranch}`, { cwd: process.cwd() });

            this.log('gh-pages 브랜치 업데이트 완료', 'SUCCESS');
            return true;

        } catch (error) {
            this.log(`gh-pages 업데이트 중 오류: ${error.message}`, 'ERROR');
            return false;
        }
    }

    /**
     * 새로운 index.html 강제 푸시
     */
    async forceNewPush() {
        try {
            this.log('새로운 index.html 강제 푸시 중...', 'FIX');

            // index.html에 타임스탬프 추가로 변경사항 생성
            const indexPath = path.join(process.cwd(), 'index.html');
            let content = fs.readFileSync(indexPath, 'utf8');

            // 기존 타임스탬프 코멘트 제거
            content = content.replace(/\s*<!-- Force update: .* -->/g, '');

            // 새 타임스탬프 추가
            const timestamp = new Date().toISOString();
            content = content.replace(
                '</head>',
                `  <!-- Force update: ${timestamp} -->\n</head>`
            );

            fs.writeFileSync(indexPath, content);

            // 강제 커밋 및 푸시
            execSync('git add index.html', { cwd: process.cwd() });
            execSync(`git commit -m "feat: force update v${this.TARGET_VERSION} - ${timestamp}"`, {
                cwd: process.cwd()
            });
            execSync('git push origin master --force-with-lease', { cwd: process.cwd() });

            this.log('강제 푸시 완료', 'SUCCESS');
            return true;

        } catch (error) {
            this.log(`강제 푸시 중 오류: ${error.message}`, 'ERROR');
            return false;
        }
    }

    /**
     * 문제 해결 시도
     */
    async attemptSolution() {
        if (this.currentSolutionIndex >= this.solutions.length) {
            this.log('모든 해결 방법을 시도했습니다. 처음부터 다시 시작합니다.', 'WARNING');
            this.currentSolutionIndex = 0;
        }

        const solution = this.solutions[this.currentSolutionIndex];
        this.log(`해결 시도 #${this.currentSolutionIndex + 1}: ${solution.name}`, 'FIX');

        const success = await this[solution.method]();

        if (success) {
            this.log(`${solution.name} 완료`, 'SUCCESS');
        } else {
            this.log(`${solution.name} 실패`, 'ERROR');
        }

        this.currentSolutionIndex++;
        return success;
    }

    /**
     * 메인 모니터링 루프
     */
    async startMonitoring() {
        this.log('🚀 GitHub Pages 버전 모니터링 시스템 시작', 'SUCCESS');
        this.log(`목표 버전: v${this.TARGET_VERSION}`);
        this.log(`체크 간격: ${this.CHECK_INTERVAL / 1000}초`);
        this.log(`최대 시도 횟수: ${this.MAX_ATTEMPTS}`);

        while (this.attemptCount < this.MAX_ATTEMPTS) {
            // 버전 체크
            const result = await this.checkVersion();

            if (result.success && this.successCount >= this.requiredSuccessCount) {
                this.log('🎉 모니터링 완료! 목표 버전이 배포되었습니다.', 'SUCCESS');
                break;
            }

            if (!result.success) {
                // 문제 해결 시도
                this.log(`대기 시간: ${this.CHECK_INTERVAL / 1000}초`);
                await this.attemptSolution();
            }

            // 대기
            this.log(`다음 체크까지 ${this.CHECK_INTERVAL / 1000}초 대기...`);
            await new Promise(resolve => setTimeout(resolve, this.CHECK_INTERVAL));
        }

        if (this.attemptCount >= this.MAX_ATTEMPTS) {
            this.log('최대 시도 횟수에 도달했습니다. 모니터링을 종료합니다.', 'ERROR');
        }
    }
}

// 모니터링 시작
if (require.main === module) {
    const monitor = new GitHubPagesVersionMonitor();
    monitor.startMonitoring().catch(error => {
        console.error('모니터링 중 치명적 오류:', error);
        process.exit(1);
    });
}

module.exports = GitHubPagesVersionMonitor;