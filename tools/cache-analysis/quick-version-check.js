/**
 * 빠른 버전 체크 스크립트
 * GitHub Pages 현재 상태를 즉시 확인
 */

const { chromium } = require('playwright');

async function quickVersionCheck() {
    const TARGET_VERSION = '13.3.3';
    const GITHUB_PAGES_URL = 'https://garimto81.github.io/virtual_table_db_claude/';

    console.log('🔍 GitHub Pages 빠른 버전 체크 시작...\n');

    try {
        const browser = await chromium.launch({
            headless: true,
            args: ['--no-cache', '--disable-cache']
        });

        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            extraHTTPHeaders: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

        const page = await context.newPage();

        // 캐시 비활성화 라우팅
        await page.route('**/*', route => {
            const headers = {
                ...route.request().headers(),
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            };
            route.continue({ headers });
        });

        // 다양한 URL로 테스트
        const urls = [
            `${GITHUB_PAGES_URL}`,
            `${GITHUB_PAGES_URL}?t=${Date.now()}`,
            `${GITHUB_PAGES_URL}index.html?v=${Math.random()}`,
            `${GITHUB_PAGES_URL}?cache_bust=${Date.now()}&r=${Math.random()}`
        ];

        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            console.log(`📋 테스트 ${i + 1}/${urls.length}: ${url.length > 80 ? url.substring(0, 80) + '...' : url}`);

            try {
                await page.goto(url, {
                    waitUntil: 'networkidle',
                    timeout: 15000
                });

                // 페이지 로딩 완료 후 잠시 대기
                await page.waitForTimeout(2000);

                const versionInfo = await page.evaluate(() => {
                    const appVersion = typeof APP_VERSION !== 'undefined' ? APP_VERSION : null;
                    const title = document.title;
                    const lastModified = document.lastModified;

                    // HTML에서 버전 정보 추출 시도
                    const htmlContent = document.documentElement.innerHTML;
                    const versionMatches = htmlContent.match(/Version:\s*([0-9.]+)/);
                    const titleVersionMatches = title.match(/v([0-9.]+)/);

                    return {
                        appVersion,
                        title,
                        lastModified,
                        url: window.location.href,
                        timestamp: new Date().toISOString(),
                        htmlVersion: versionMatches ? versionMatches[1] : null,
                        titleVersion: titleVersionMatches ? titleVersionMatches[1] : null,
                        bodyText: document.body ? document.body.innerText.substring(0, 200) : 'No body'
                    };
                });

                const currentVersion = versionInfo.appVersion || versionInfo.htmlVersion || versionInfo.titleVersion;
                const isCorrectVersion = currentVersion === TARGET_VERSION;

                console.log(`   📊 결과:`);
                console.log(`      APP_VERSION: ${versionInfo.appVersion || 'undefined'}`);
                console.log(`      HTML Version: ${versionInfo.htmlVersion || 'not found'}`);
                console.log(`      Title Version: ${versionInfo.titleVersion || 'not found'}`);
                console.log(`      페이지 제목: ${versionInfo.title}`);
                console.log(`      최종 수정: ${versionInfo.lastModified}`);
                console.log(`      상태: ${isCorrectVersion ? '✅ 목표 버전' : '❌ 구 버전'}`);

                if (isCorrectVersion) {
                    console.log(`\n🎉 성공! v${TARGET_VERSION}이 배포되었습니다!`);
                    await browser.close();
                    return;
                }

                console.log(''); // 빈 줄

            } catch (error) {
                console.log(`   ❌ 오류: ${error.message}`);
                console.log(''); // 빈 줄
            }
        }

        await browser.close();

        console.log(`⚠️  모든 테스트에서 목표 버전 v${TARGET_VERSION}을 찾지 못했습니다.`);
        console.log(`🔧 전체 모니터링 시스템을 실행하려면: npm run monitor`);

    } catch (error) {
        console.error('❌ 빠른 체크 중 오류 발생:', error.message);
        process.exit(1);
    }
}

// 스크립트 실행
if (require.main === module) {
    quickVersionCheck().catch(error => {
        console.error('치명적 오류:', error);
        process.exit(1);
    });
}

module.exports = quickVersionCheck;