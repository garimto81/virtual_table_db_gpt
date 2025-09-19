/**
 * Virtual 시트 CSV 데이터 상세 분석
 * B열 시간 데이터 정확한 분석
 */

async function analyzeVirtualCSVData() {
    console.log('📊 Virtual 시트 CSV 데이터 상세 분석 시작...');
    console.log('========================================');

    try {
        // 1. CSV 데이터 직접 가져오기
        const sheetUrl = getSheetUrl();
        if (!sheetUrl) {
            console.error('❌ 시트 URL이 설정되지 않음');
            return;
        }

        const csvUrl = convertToCSVUrl(sheetUrl);
        console.log('🔗 CSV URL:', csvUrl);

        const response = await fetch(csvUrl + '&random=' + Math.random());
        const csvText = await response.text();

        // 2. Papa Parse로 파싱
        let rows;
        if (typeof Papa !== 'undefined') {
            const result = Papa.parse(csvText, {
                header: false,
                skipEmptyLines: true,
                quotes: true,
                quoteChar: '"',
                escapeChar: '"'
            });
            rows = result.data;
            console.log('✅ Papa Parse 사용:', rows.length, '개 행 파싱');
        } else {
            // 커스텀 파서 사용
            rows = parseCSV(csvText);
            console.log('✅ 커스텀 파서 사용:', rows.length, '개 행 파싱');
        }

        // 3. B열 (시간) 데이터 분석
        let timeDataRows = [];
        let timeStats = {
            firstTimeRow: null,
            lastTimeRow: null,
            totalRows: rows.length,
            timeDataCount: 0,
            hourDistribution: {},
            timeRange: {
                earliest: null,
                latest: null
            }
        };

        console.log('🔍 B열 시간 데이터 분석:');
        console.log(`   전체 행 수: ${rows.length}`);

        // 각 행의 B열 확인
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const timeValue = row[1]; // B열

            if (timeValue && timeValue.toString().match(/^\d{1,2}:\d{2}/)) {
                timeDataRows.push({
                    rowIndex: i,
                    rowNumber: i + 1,
                    time: timeValue.toString(),
                    fullRow: row
                });

                const hour = parseInt(timeValue.toString().split(':')[0]);
                timeStats.hourDistribution[hour] = (timeStats.hourDistribution[hour] || 0) + 1;

                if (timeStats.firstTimeRow === null) {
                    timeStats.firstTimeRow = i + 1;
                    timeStats.timeRange.earliest = timeValue.toString();
                }
                timeStats.lastTimeRow = i + 1;
                timeStats.timeRange.latest = timeValue.toString();
                timeStats.timeDataCount++;
            }
        }

        // 4. 결과 출력
        console.log('📈 시간 데이터 통계:');
        console.log(`   시간 데이터가 있는 행: ${timeStats.timeDataCount}개`);
        console.log(`   첫 번째 시간 데이터: ${timeStats.firstTimeRow}행 (${timeStats.timeRange.earliest})`);
        console.log(`   마지막 시간 데이터: ${timeStats.lastTimeRow}행 (${timeStats.timeRange.latest})`);

        // 5. 시간대별 분포
        console.log('⏰ 시간대별 데이터 분포:');
        const sortedHours = Object.keys(timeStats.hourDistribution).map(h => parseInt(h)).sort((a, b) => a - b);

        let morningCount = 0, dayCount = 0, eveningCount = 0, nightCount = 0;

        for (const hour of sortedHours) {
            const count = timeStats.hourDistribution[hour];
            console.log(`   ${String(hour).padStart(2, '0')}시: ${count}개 행`);

            // 시간대별 분류
            if (hour >= 0 && hour <= 6) morningCount += count;
            else if (hour >= 7 && hour <= 16) dayCount += count;
            else if (hour >= 17 && hour <= 21) eveningCount += count;
            else if (hour >= 22 && hour <= 23) nightCount += count;
        }

        console.log('📊 시간대별 요약:');
        console.log(`   🌅 새벽(00-06시): ${morningCount}개`);
        console.log(`   ☀️ 낮(07-16시): ${dayCount}개`);
        console.log(`   🌆 저녁(17-21시): ${eveningCount}개`);
        console.log(`   🌙 밤(22-23시): ${nightCount}개`);

        // 6. 17시 이후 데이터 상세 확인
        const after17Data = timeDataRows.filter(item => {
            const hour = parseInt(item.time.split(':')[0]);
            return hour >= 17;
        });

        console.log('🔥 17시 이후 데이터 상세:');
        console.log(`   17시 이후 총 ${after17Data.length}개 행`);

        if (after17Data.length > 0) {
            console.log('   샘플 데이터 (처음 10개):');
            after17Data.slice(0, 10).forEach(item => {
                const handNumber = item.fullRow[0]; // A열
                const status = item.fullRow[4]; // E열
                console.log(`     행 ${item.rowNumber}: ${item.time} | 핸드#${handNumber} | 상태:"${status}"`);
            });

            // 19:22, 21:08, 22:28, 23:11, 23:20 시간 정확히 찾기
            const specificTimes = ['19:22', '21:08', '22:28', '23:11', '23:20'];
            console.log('🎯 특정 시간 검색:');

            for (const searchTime of specificTimes) {
                const found = timeDataRows.find(item => item.time === searchTime);
                if (found) {
                    console.log(`   ✅ ${searchTime}: 행 ${found.rowNumber}에서 발견`);
                } else {
                    console.log(`   ❌ ${searchTime}: 정확한 시간 없음`);

                    // 근접한 시간 찾기
                    const [targetHour, targetMin] = searchTime.split(':').map(n => parseInt(n));
                    const nearby = timeDataRows.filter(item => {
                        const [hour, min] = item.time.split(':').map(n => parseInt(n));
                        return hour === targetHour && Math.abs(min - targetMin) <= 5;
                    });

                    if (nearby.length > 0) {
                        console.log(`     🔍 근접 시간: ${nearby.map(n => `${n.time}(행${n.rowNumber})`).join(', ')}`);
                    }
                }
            }
        } else {
            console.log('   ❌ 17시 이후 데이터 없음');
        }

        // 7. 첫 10행과 마지막 10행 샘플
        console.log('📋 데이터 샘플:');
        console.log('   첫 10행:');
        for (let i = 0; i < Math.min(10, rows.length); i++) {
            const time = rows[i][1] || '(시간없음)';
            const hand = rows[i][0] || '(핸드없음)';
            console.log(`     행 ${i+1}: ${time} | ${hand}`);
        }

        console.log('   마지막 10행:');
        for (let i = Math.max(0, rows.length - 10); i < rows.length; i++) {
            const time = rows[i][1] || '(시간없음)';
            const hand = rows[i][0] || '(핸드없음)';
            console.log(`     행 ${i+1}: ${time} | ${hand}`);
        }

        return {
            totalRows: timeStats.totalRows,
            timeDataCount: timeStats.timeDataCount,
            firstTimeRow: timeStats.firstTimeRow,
            lastTimeRow: timeStats.lastTimeRow,
            timeRange: timeStats.timeRange,
            hourDistribution: timeStats.hourDistribution,
            after17Count: after17Data.length
        };

    } catch (error) {
        console.error('❌ 분석 중 오류:', error);
        return null;
    }

    console.log('========================================');
    console.log('📊 Virtual 시트 CSV 데이터 분석 완료');
}

// 실행
analyzeVirtualCSVData();