// Virtual 시트 분석 다중 시간 테스트 스크립트
// 5개의 다른 시간대로 매칭 테스트 진행

async function testMultipleTimeSlots() {
    console.log('🧪 Virtual 시트 다중 시간 분석 테스트 시작\n');
    
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/1M-LM2KkwLNOTygtrPVdnYLqqBoz4MmZvbglUaptSYqE/edit?gid=561799849#gid=561799849';
    const timeColumnIndex = 2; // C열 (Seoul 시간)
    const searchRangeMinutes = 3;
    
    // 5개의 테스트 시간 (다양한 시간대)
    const testCases = [
        {
            name: "오후 6시 정각",
            timestamp: 1704099600, // 2024-01-01 09:00:00 UTC -> 18:00 KST
            expectedHour: 18,
            expectedMinute: 0
        },
        {
            name: "오후 6시 15분", 
            timestamp: 1704100500, // 2024-01-01 09:15:00 UTC -> 18:15 KST
            expectedHour: 18,
            expectedMinute: 15
        },
        {
            name: "오후 6시 30분",
            timestamp: 1704101400, // 2024-01-01 09:30:00 UTC -> 18:30 KST  
            expectedHour: 18,
            expectedMinute: 30
        },
        {
            name: "오후 7시 정각",
            timestamp: 1704103200, // 2024-01-01 10:00:00 UTC -> 19:00 KST
            expectedHour: 19,
            expectedMinute: 0
        },
        {
            name: "오후 8시 45분",
            timestamp: 1704109500, // 2024-01-01 11:45:00 UTC -> 20:45 KST
            expectedHour: 20,
            expectedMinute: 45
        }
    ];
    
    console.log(`🎯 테스트 설정:`);
    console.log(`   시트 URL: ${sheetUrl}`);
    console.log(`   검색 컬럼: C열 (Seoul 시간)`);
    console.log(`   허용 범위: ±${searchRangeMinutes}분`);
    console.log(`   테스트 케이스: ${testCases.length}개\n`);
    
    // CSV 데이터 한 번만 로드
    const csvData = await loadCSVData(sheetUrl);
    if (!csvData) return;
    
    console.log(`📊 로드된 데이터: ${csvData.length}개 행\n`);
    
    // 각 테스트 케이스 실행
    const results = [];
    
    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`🔍 테스트 ${i + 1}/5: ${testCase.name}`);
        console.log(`   타임스탬프: ${testCase.timestamp}`);
        console.log(`   UTC: ${new Date(testCase.timestamp * 1000).toISOString()}`);
        console.log(`   KST: ${new Date(testCase.timestamp * 1000).toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'})}`);
        
        const result = await analyzeTimeMatch(
            testCase.timestamp, 
            csvData, 
            timeColumnIndex, 
            searchRangeMinutes
        );
        
        result.testCase = testCase;
        results.push(result);
        
        if (result.success) {
            console.log(`   ✅ 매칭 성공: 행 ${result.rowIndex}, 시간 차이 ${result.timeDiffStr}`);
        } else {
            console.log(`   ❌ 매칭 실패: ${result.reason}`);
        }
        console.log('');
    }
    
    // 전체 결과 요약
    console.log('=' .repeat(80));
    console.log('📋 전체 테스트 결과 요약');
    console.log('=' .repeat(80));
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const testCase = result.testCase;
        
        console.log(`\n${i + 1}. ${testCase.name} (${testCase.expectedHour}:${testCase.expectedMinute.toString().padStart(2, '0')})`);
        
        if (result.success) {
            successCount++;
            console.log(`   🎯 결과: 성공`);
            console.log(`   📍 매칭 행: ${result.rowIndex}`);
            console.log(`   ⏰ 매칭 시간: ${result.matchedTime}`);
            console.log(`   ⏱️ 시간 차이: ${result.timeDiffStr}`);
            console.log(`   📄 행 데이터: [${result.rowData.slice(0, 4).join('] [')}]`);
            
            // 후보가 여러 개인 경우
            if (result.candidates && result.candidates.length > 1) {
                console.log(`   🔍 다른 후보: ${result.candidates.slice(1, 4).map(c => 
                    `행${c.rowIndex}(${c.timeCell}, ${c.diffSeconds}초차이)`
                ).join(', ')}`);
            }
        } else {
            failCount++;
            console.log(`   ❌ 결과: 실패`);
            console.log(`   📝 사유: ${result.reason}`);
            console.log(`   🔍 검색된 셀: ${result.checkedCount}개`);
        }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 최종 통계');
    console.log('='.repeat(80));
    console.log(`✅ 성공: ${successCount}/${results.length}개 (${Math.round(successCount/results.length*100)}%)`);
    console.log(`❌ 실패: ${failCount}/${results.length}개 (${Math.round(failCount/results.length*100)}%)`);
    
    if (successCount > 0) {
        const successfulResults = results.filter(r => r.success);
        const avgDiff = successfulResults.reduce((sum, r) => sum + r.timeDiff, 0) / successfulResults.length;
        console.log(`📈 평균 시간 차이: ${Math.round(avgDiff)}초`);
        
        const perfectMatches = successfulResults.filter(r => r.timeDiff === 0).length;
        if (perfectMatches > 0) {
            console.log(`🎯 완벽 일치: ${perfectMatches}개`);
        }
    }
    
    console.log('\n🏁 다중 시간 테스트 완료!');
}

// CSV 데이터 로드 함수
async function loadCSVData(sheetUrl) {
    try {
        // URL 변환
        const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (!sheetIdMatch) {
            console.error('❌ 올바른 Google Sheets URL이 아닙니다');
            return null;
        }
        
        const sheetId = sheetIdMatch[1];
        const gidMatch = sheetUrl.match(/[#&]gid=(\d+)/);
        const gid = gidMatch ? gidMatch[1] : '0';
        
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
        
        console.log('🌐 CSV 데이터 로드 중...');
        const response = await fetch(csvUrl + '&t=' + Date.now());
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
            throw new Error('시트가 비공개 상태이거나 접근할 수 없습니다');
        }
        
        return parseCSV(text);
        
    } catch (error) {
        console.error('❌ CSV 데이터 로드 실패:', error.message);
        return null;
    }
}

// 시간 매칭 분석 함수  
async function analyzeTimeMatch(timestamp, rows, timeColumnIndex, searchRangeMinutes) {
    const targetDate = new Date(timestamp * 1000);
    const kstDate = new Date(targetDate.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
    const targetHours = kstDate.getHours();
    const targetMinutes = kstDate.getMinutes();
    const targetTimeStr = `${targetHours.toString().padStart(2, '0')}:${targetMinutes.toString().padStart(2, '0')}`;
    
    let closestRow = null;
    let minDiff = Infinity;
    let matchedRowIndex = -1;
    let checkedCount = 0;
    const maxDiffSeconds = searchRangeMinutes * 60;
    const candidates = [];
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const timeCell = row[timeColumnIndex];
        
        if (!timeCell) continue;
        checkedCount++;
        
        // 시간 파싱 (HH:MM 또는 HH:MM:SS 형식)
        const timeMatch = timeCell.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
        if (!timeMatch) continue;
        
        const cellHours = parseInt(timeMatch[1]);
        const cellMinutes = parseInt(timeMatch[2]);
        
        // 같은 날 기준으로 비교
        const cellTotalMinutes = cellHours * 60 + cellMinutes;
        const targetTotalMinutes = targetHours * 60 + targetMinutes;
        
        let diffMinutes = Math.abs(cellTotalMinutes - targetTotalMinutes);
        
        // 자정 넘나드는 경우 고려
        const altDiff = Math.min(
            Math.abs(cellTotalMinutes - targetTotalMinutes + 1440),
            Math.abs(cellTotalMinutes - targetTotalMinutes - 1440)
        );
        diffMinutes = Math.min(diffMinutes, altDiff);
        
        const diffSeconds = diffMinutes * 60;
        
        if (diffSeconds <= maxDiffSeconds) {
            candidates.push({
                rowIndex: i + 1,
                timeCell: timeCell,
                diffSeconds: diffSeconds,
                diffMinutes: Math.floor(diffSeconds / 60),
                diffSecondsRemainder: diffSeconds % 60
            });
        }
        
        if (diffSeconds < minDiff && diffSeconds <= maxDiffSeconds) {
            minDiff = diffSeconds;
            closestRow = row;
            matchedRowIndex = i + 1;
        }
    }
    
    if (closestRow) {
        const diffMinutes = Math.floor(minDiff / 60);
        const diffSeconds = minDiff % 60;
        
        let timeDiffStr = '';
        if (minDiff === 0) {
            timeDiffStr = '완벽 일치';
        } else {
            if (diffMinutes > 0) {
                timeDiffStr = `${diffMinutes}분 ${diffSeconds}초`;
            } else {
                timeDiffStr = `${diffSeconds}초`;
            }
        }
        
        return {
            success: true,
            rowIndex: matchedRowIndex,
            matchedTime: closestRow[timeColumnIndex],
            targetTime: targetTimeStr,
            timeDiff: minDiff,
            timeDiffStr: timeDiffStr,
            rowData: closestRow,
            candidates: candidates.sort((a, b) => a.diffSeconds - b.diffSeconds),
            checkedCount: checkedCount
        };
    } else {
        return {
            success: false,
            reason: `${searchRangeMinutes}분 범위 내에서 매칭되는 행을 찾을 수 없음`,
            checkedCount: checkedCount,
            targetTime: targetTimeStr
        };
    }
}

// CSV 파싱 함수
function parseCSV(text) {
    const rows = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
        if (line.trim()) {
            const row = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    row.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            row.push(current.trim());
            rows.push(row);
        }
    }
    return rows;
}

// 테스트 실행
testMultipleTimeSlots();