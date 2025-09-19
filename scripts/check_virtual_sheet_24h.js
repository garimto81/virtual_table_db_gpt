/**
 * Virtual 시트 24시간 데이터 확인 스크립트
 * 브라우저 콘솔에서 실행
 */

async function checkVirtualSheet24HourData() {
    console.log('🔍 Virtual 시트 24시간 데이터 확인 시작...');
    console.log('========================================');

    try {
        // 1. 캐시 강제 갱신
        if (typeof sheetDataCache !== 'undefined') {
            await sheetDataCache.refreshCache();

            // 2. 캐시 통계 확인
            const stats = sheetDataCache.getStats();
            console.log('📊 캐시 기본 정보:');
            console.log(`   캐시 크기: ${stats.cacheSize}개 행`);
            console.log(`   마지막 업데이트: ${stats.lastUpdated}`);
            console.log(`   시간 인덱스: ${stats.timeIndexSize}개`);
            console.log(`   핸드번호 인덱스: ${stats.handNumberIndexSize}개`);

            // 3. 시간대별 분포 분석
            const analysis = sheetDataCache.analyzeCache();

            // 4. 17시 이후 데이터 확인
            let after17Count = 0;
            let nightCount = 0;  // 22시 이후
            let timeRanges = {
                morning: 0,    // 00-06시
                day: 0,        // 07-16시
                evening: 0,    // 17-21시
                night: 0       // 22-23시
            };

            for (const [rowNum, data] of sheetDataCache.cache) {
                if (data.time) {
                    const hour = parseInt(data.time.split(':')[0]);

                    if (hour >= 17) after17Count++;
                    if (hour >= 22 || hour <= 2) nightCount++;

                    // 시간대별 분류
                    if (hour >= 0 && hour <= 6) timeRanges.morning++;
                    else if (hour >= 7 && hour <= 16) timeRanges.day++;
                    else if (hour >= 17 && hour <= 21) timeRanges.evening++;
                    else if (hour >= 22 && hour <= 23) timeRanges.night++;
                }
            }

            console.log('📈 시간대별 데이터 분포:');
            console.log(`   🌅 새벽(00-06시): ${timeRanges.morning}개`);
            console.log(`   ☀️ 낮(07-16시): ${timeRanges.day}개`);
            console.log(`   🌆 저녁(17-21시): ${timeRanges.evening}개`);
            console.log(`   🌙 밤(22-23시): ${timeRanges.night}개`);
            console.log('');
            console.log(`🔥 17시 이후 데이터: ${after17Count}개 (${((after17Count/stats.cacheSize)*100).toFixed(1)}%)`);
            console.log(`🌙 밤 시간대 데이터: ${nightCount}개 (${((nightCount/stats.cacheSize)*100).toFixed(1)}%)`);

            // 5. 최신/최초 시간 확인
            const times = Array.from(sheetDataCache.timeIndex.keys()).sort();
            if (times.length > 0) {
                console.log('⏰ 시간 범위:');
                console.log(`   최초: ${times[0]}`);
                console.log(`   최종: ${times[times.length - 1]}`);

                // 시간 갭 확인
                const gaps = [];
                for (let hour = 0; hour < 24; hour++) {
                    const hourStr = String(hour).padStart(2, '0');
                    const hourData = times.filter(t => t.startsWith(hourStr + ':'));
                    if (hourData.length === 0) {
                        gaps.push(hourStr + '시');
                    }
                }

                if (gaps.length > 0) {
                    console.log(`⚠️ 데이터 없는 시간대: ${gaps.join(', ')}`);
                } else {
                    console.log('✅ 24시간 모든 시간대에 데이터 존재');
                }
            }

            // 6. 최근 시간 매칭 테스트
            console.log('🧪 시간 매칭 테스트:');
            const testTimes = ['17:00', '19:22', '21:30', '23:20'];

            for (const testTime of testTimes) {
                const timestamp = new Date(`2025-09-18 ${testTime}:00`).getTime();
                const matched = sheetDataCache.findClosestRow(timestamp);

                if (matched) {
                    console.log(`   ✅ ${testTime}: 매칭 성공 (행 ${matched.row}, 시간: ${matched.time})`);
                } else {
                    console.log(`   ❌ ${testTime}: 매칭 실패`);
                }
            }

        } else {
            console.error('❌ sheetDataCache를 찾을 수 없습니다.');
            console.log('💡 index.html이 로드된 상태에서 실행하세요.');
        }

    } catch (error) {
        console.error('❌ 확인 중 오류:', error);
    }

    console.log('========================================');
    console.log('🔍 Virtual 시트 24시간 데이터 확인 완료');
}

// 실행 함수
checkVirtualSheet24HourData();