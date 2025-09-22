/**
 * 간단한 버전 모니터링 (30초 간격)
 * GitHub Pages v13.3.3 배포 대기
 */

const { chromium } = require('playwright');

async function simpleMonitor() {
    const TARGET_VERSION = '13.3.3';
    const GITHUB_PAGES_URL = 'https://garimto81.github.io/virtual_table_db_claude/';
    const CHECK_INTERVAL = 30 * 1000; // 30초
    let checkCount = 0;
    let successCount = 0;

    console.log('🚀 GitHub Pages 간단 모니터링 시작');
    console.log(`목표: v${TARGET_VERSION}`);
    console.log('체크 간격: 30초\n');

    while (checkCount < 20) { // 최대 10분간 모니터링
        checkCount++;
        console.log(`[${new Date().toLocaleTimeString()}] 🔍 체크 #${checkCount}`);

        try {
            const browser = await chromium.launch({ headless: true });
            const page = await browser.newPage();

            const url = `${GITHUB_PAGES_URL}?t=${Date.now()}`;
            await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });

            const version = await page.evaluate(() => {
                return typeof APP_VERSION !== 'undefined' ? APP_VERSION : null;
            });

            await browser.close();

            console.log(`   현재 버전: ${version || 'undefined'}`);

            if (version === TARGET_VERSION) {
                successCount++;
                console.log(`   ✅ 성공! (${successCount}/3)`);

                if (successCount >= 3) {
                    console.log('\n🎉 배포 완료! v13.3.3이 성공적으로 배포되었습니다!');
                    process.exit(0);
                }
            } else {
                successCount = 0;
                console.log(`   ❌ 대기 중... (목표: v${TARGET_VERSION})`);
            }

        } catch (error) {
            console.log(`   ❌ 오류: ${error.message}`);
        }

        console.log(`   ⏰ ${CHECK_INTERVAL / 1000}초 대기...\n`);
        await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }

    console.log('⏰ 시간 초과. 모니터링 종료.');
}

simpleMonitor().catch(console.error);