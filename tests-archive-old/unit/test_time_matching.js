const https = require('https');

// CSV 파싱 함수
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const rows = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].replace(/\r/g, '');
        if (!line.trim()) continue;

        const row = [];
        let inQuotes = false;
        let currentField = '';

        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            const nextChar = line[j + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    currentField += '"';
                    j++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                row.push(currentField.trim());
                currentField = '';
            } else {
                currentField += char;
            }
        }
        row.push(currentField.trim());
        rows.push(row);
    }

    return rows;
}

// 시간 파싱 함수
function parseTimeToTimestamp(timeStr) {
    if (!timeStr) return null;

    const str = String(timeStr).trim();

    // 이미 타임스탬프인 경우
    const numValue = parseInt(str);
    if (!isNaN(numValue) && numValue > 1000000000 && str.match(/^\d+$/)) {
        return numValue;
    }

    // HH:MM:SS 또는 HH:MM 형식
    const timeParts = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (timeParts) {
        const today = new Date();
        const hours = parseInt(timeParts[1]);
        const minutes = parseInt(timeParts[2]);
        const seconds = parseInt(timeParts[3] || 0);

        today.setHours(hours, minutes, seconds, 0);

        const now = new Date();
        if (today > now) {
            today.setDate(today.getDate() - 1);
        }

        return Math.floor(today.getTime() / 1000);
    }

    console.log(`⚠️ 시간 파싱 실패: "${str}"`);
    return null;
}

// CSV 다운로드 함수
function downloadCSV(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';

            // 리다이렉트 처리
            if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
                console.log('리다이렉트:', res.headers.location);
                downloadCSV(res.headers.location).then(resolve).catch(reject);
                return;
            }

            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function runTest() {
    console.log('🧪 시간 매칭 테스트 시작\n');

    try {
        // Virtual 시트 CSV 가져오기
        const csvUrl = 'https://docs.google.com/spreadsheets/d/1M-LM2KkwLNOTygtrPVdnYLqqBoz4MmZvbglUaptSYqE/export?format=csv&gid=561799849';

        console.log('📥 CSV 데이터 가져오기...');
        const csvText = await downloadCSV(csvUrl);
        console.log(`✅ CSV 크기: ${csvText.length} bytes\n`);

        // CSV 파싱
        const rows = parseCSV(csvText);
        console.log(`📊 파싱된 행 수: ${rows.length}개\n`);

        // 618-622행 데이터 확인
        console.log('🔍 618-622행 데이터 분석:');
        for (let i = 617; i < 623 && i < rows.length; i++) {
            const row = rows[i];
            if (row && row.length > 4) {
                console.log(`   행 ${i+1}: B열="${row[1] || ''}", E열="${row[4] || ''}"`);
            }
        }

        // 시간 캐시 구축
        console.log('\n📋 시간 데이터 캐싱:');
        const cache = new Map();
        const timeIndex = new Map();
        let count1018 = 0;
        let count1014 = 0;

        for (let i = 0; i < rows.length && i < 1000; i++) {
            const cols = rows[i];
            if (!cols || cols.length < 8) continue;

            const timeStr = cols[1]?.trim();
            if (!timeStr) continue;

            // 10:14, 10:18 카운트
            if (timeStr === '10:14') count1014++;
            if (timeStr === '10:18') count1018++;

            const timestamp = parseTimeToTimestamp(timeStr);
            if (!timestamp) continue;

            let status = cols[4]?.trim() || '';
            if (status.startsWith('"') && status.endsWith('"')) {
                status = status.slice(1, -1);
            }

            const rowData = {
                row: i + 1,
                time: timeStr,
                timestamp: timestamp,
                status: status
            };

            cache.set(i + 1, rowData);

            if (!timeIndex.has(timestamp)) {
                timeIndex.set(timestamp, []);
            }
            timeIndex.get(timestamp).push(i + 1);

            // 618-622행 근처만 로그
            if (i >= 617 && i < 623) {
                console.log(`   캐시 저장: 행 ${i+1}, 시간="${timeStr}", 상태="${status}", 타임스탬프=${timestamp}`);
            }
        }

        console.log(`\n✅ 캐시 크기: ${cache.size}개`);
        console.log(`✅ 시간 인덱스: ${timeIndex.size}개`);
        console.log(`✅ "10:14" 개수: ${count1014}개`);
        console.log(`✅ "10:18" 개수: ${count1018}개\n`);

        // 10:18 찾기
        console.log('🎯 10:18 매칭 테스트:');

        // Hand 시트의 타임스탬프 (핸드 #138)
        const handTimestamp = 1758075882; // 2025-09-17 10:18:02
        const handDate = new Date(handTimestamp * 1000);
        const targetHours = handDate.getHours();
        const targetMinutes = handDate.getMinutes();
        const targetTimeString = `${targetHours.toString().padStart(2, '0')}:${targetMinutes.toString().padStart(2, '0')}`;

        console.log(`   Hand 타임스탬프: ${handTimestamp}`);
        console.log(`   Hand 날짜/시간: ${handDate.toLocaleString()}`);
        console.log(`   목표 시간: ${targetTimeString}\n`);

        // 정확한 매칭 찾기
        console.log('   🔍 정확한 매칭 검색:');
        let exactMatchCount = 0;
        for (const [rowNum, data] of cache) {
            if (data.time === targetTimeString) {
                console.log(`      ✅ 발견: 행 ${rowNum}, 시간="${data.time}", 상태="${data.status}", 타임스탬프=${data.timestamp}`);
                exactMatchCount++;
            }
        }
        console.log(`   정확한 매칭 수: ${exactMatchCount}개\n`);

        // 근사 매칭
        console.log('   🔄 근사 매칭 (±5분):');
        const targetTotalMinutes = targetHours * 60 + targetMinutes;

        const nearMatches = [];
        for (const [rowNum, data] of cache) {
            const timeParts = data.time.match(/(\d+):(\d+)/);
            if (timeParts) {
                const hours = parseInt(timeParts[1]);
                const minutes = parseInt(timeParts[2]);
                const totalMinutes = hours * 60 + minutes;
                const diff = Math.abs(totalMinutes - targetTotalMinutes);

                if (diff <= 5) {
                    nearMatches.push({
                        row: rowNum,
                        time: data.time,
                        status: data.status,
                        diff: diff,
                        timestamp: data.timestamp
                    });
                }
            }
        }

        // 차이 순으로 정렬
        nearMatches.sort((a, b) => a.diff - b.diff);
        nearMatches.forEach(match => {
            console.log(`      행 ${match.row}: 시간="${match.time}" (${match.diff}분 차이), 상태="${match.status}"`);
        });

        // 특정 행 직접 확인
        console.log('\n   📌 특정 행 직접 확인:');
        console.log(`      행 618: ${cache.has(618) ? JSON.stringify(cache.get(618)) : '캐시에 없음'}`);
        console.log(`      행 622: ${cache.has(622) ? JSON.stringify(cache.get(622)) : '캐시에 없음'}`);

        // findClosestRow 로직 시뮬레이션
        console.log('\n   🎮 findClosestRow 로직 시뮬레이션:');
        let closestRow = null;

        // 1. 정확한 매칭 시도
        for (const [rowNum, data] of cache) {
            if (data.time === targetTimeString) {
                closestRow = data;
                console.log(`      ✅ 정확한 매칭으로 선택: 행 ${rowNum}`);
                break;
            }
        }

        // 2. 근사 매칭 시도
        if (!closestRow) {
            console.log('      ❌ 정확한 매칭 실패, 근사 매칭 시도...');
            for (const [rowNum, data] of cache) {
                const timeParts = data.time.match(/(\d+):(\d+)/);
                if (timeParts) {
                    const hours = parseInt(timeParts[1]);
                    const minutes = parseInt(timeParts[2]);
                    const totalMinutes = hours * 60 + minutes;
                    const diff = Math.abs(totalMinutes - targetTotalMinutes);

                    if (diff <= 3) {
                        closestRow = data;
                        console.log(`      🔄 근사 매칭으로 선택: 행 ${rowNum}, 시간="${data.time}" (${diff}분 차이)`);
                        break; // 첫 번째 매칭에서 중단!
                    }
                }
            }
        }

        if (closestRow) {
            console.log(`\n   🎯 최종 결과: 행 ${closestRow.row}, 시간="${closestRow.time}", 상태="${closestRow.status}"`);
        } else {
            console.log('\n   ❌ 매칭 실패');
        }

        console.log('\n🧪 테스트 완료');

    } catch (error) {
        console.error('❌ 오류:', error.message);
    }
}

// 테스트 실행
runTest();