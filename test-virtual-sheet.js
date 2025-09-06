// Virtual 시트 분석 테스트 스크립트
// Node.js 환경에서 실행 가능

async function testVirtualSheetAnalysis() {
    console.log('🧪 Virtual 시트 분석 테스트 시작\n');
    
    // 테스트 매개변수 (시트에서 보이는 18:00 시간대로 조정)
    const testTimestamp = 1704099600; // 2024-01-01 09:00:00 UTC -> 18:00 KST
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/1M-LM2KkwLNOTygtrPVdnYLqqBoz4MmZvbglUaptSYqE/edit?gid=561799849#gid=561799849';
    const searchRangeMinutes = 3;
    const timeColumnIndex = 2; // C열 (0-indexed)
    
    console.log(`📝 테스트 설정:`);
    console.log(`   타임스탬프: ${testTimestamp}`);
    console.log(`   UTC 시간: ${new Date(testTimestamp * 1000).toISOString()}`);
    console.log(`   KST 시간: ${new Date(testTimestamp * 1000).toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'})}`);
    console.log(`   검색 범위: ±${searchRangeMinutes}분`);
    console.log(`   시간 컬럼: ${['A', 'B', 'C'][timeColumnIndex]}열\n`);
    
    try {
        // URL 변환
        console.log('🔗 URL 변환 중...');
        const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (!sheetIdMatch) {
            throw new Error('올바른 Google Sheets URL이 아닙니다');
        }
        
        const sheetId = sheetIdMatch[1];
        const gidMatch = sheetUrl.match(/[#&]gid=(\d+)/);
        const gid = gidMatch ? gidMatch[1] : '0';
        
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
        
        console.log(`   Sheet ID: ${sheetId}`);
        console.log(`   GID: ${gid}`);
        console.log(`   CSV URL: ${csvUrl}\n`);
        
        // CSV 데이터 가져오기
        console.log('🌐 CSV 데이터 가져오는 중...');
        const response = await fetch(csvUrl + '&t=' + Date.now());
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log(`   응답 크기: ${text.length} 문자`);
        
        // HTML 응답 체크
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
            throw new Error('시트가 비공개 상태이거나 접근할 수 없습니다');
        }
        
        // CSV 파싱
        const rows = parseCSV(text);
        console.log(`   파싱된 행 수: ${rows.length}개\n`);
        
        // 첫 5개 행 미리보기
        console.log('📋 데이터 미리보기 (첫 5행):');
        for (let i = 0; i < Math.min(5, rows.length); i++) {
            const row = rows[i];
            console.log(`   행 ${i + 1}: [${row.slice(0, 5).join('] [').replace(/\[\]/g, '[빈값]')}]${row.length > 5 ? ` (+${row.length - 5}개 컬럼 더)` : ''}`);
        }
        console.log('');
        
        // 타겟 시간 계산
        const targetDate = new Date(testTimestamp * 1000);
        // KST로 변환
        const kstDate = new Date(targetDate.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
        const targetHours = kstDate.getHours();
        const targetMinutes = kstDate.getMinutes();
        const targetTimeStr = `${targetHours.toString().padStart(2, '0')}:${targetMinutes.toString().padStart(2, '0')}`;
        
        console.log(`🎯 매칭 대상:`);
        console.log(`   KST 시간: ${targetTimeStr}`);
        console.log(`   검색 컬럼: ${['A', 'B', 'C'][timeColumnIndex]}열`);
        console.log(`   허용 범위: ±${searchRangeMinutes}분\n`);
        
        // 매칭 로직 실행
        console.log('🔍 매칭 분석 중...');
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
            
            // 같은 날 기준으로 비교 (시간과 분만)
            const cellTotalMinutes = cellHours * 60 + cellMinutes;
            const targetTotalMinutes = targetHours * 60 + targetMinutes;
            
            let diffMinutes = Math.abs(cellTotalMinutes - targetTotalMinutes);
            
            // 자정을 넘나드는 경우 고려
            const altDiff = Math.min(
                Math.abs(cellTotalMinutes - targetTotalMinutes + 1440), // +24시간
                Math.abs(cellTotalMinutes - targetTotalMinutes - 1440)  // -24시간
            );
            diffMinutes = Math.min(diffMinutes, altDiff);
            
            const diffSeconds = diffMinutes * 60;
            
            if (diffSeconds <= maxDiffSeconds) {
                candidates.push({
                    rowIndex: i + 1,
                    timeCell: timeCell,
                    diffSeconds: diffSeconds,
                    diffMinutes: Math.floor(diffSeconds / 60),
                    diffSecondsRemainder: diffSeconds % 60,
                    rowData: row.slice(0, 3)
                });
            }
            
            if (diffSeconds < minDiff && diffSeconds <= maxDiffSeconds) {
                minDiff = diffSeconds;
                closestRow = row;
                matchedRowIndex = i + 1;
            }
        }
        
        console.log(`   검색된 셀 수: ${checkedCount}개`);
        console.log(`   후보 수: ${candidates.length}개\n`);
        
        // 후보들 표시 (최대 10개)
        if (candidates.length > 0) {
            console.log('🔍 찾은 후보들:');
            const sortedCandidates = candidates.sort((a, b) => a.diffSeconds - b.diffSeconds);
            for (let i = 0; i < Math.min(10, sortedCandidates.length); i++) {
                const candidate = sortedCandidates[i];
                const diffStr = candidate.diffMinutes > 0 ? 
                    `${candidate.diffMinutes}분 ${candidate.diffSecondsRemainder}초` : 
                    `${candidate.diffSecondsRemainder}초`;
                console.log(`   ${i + 1}. 행 ${candidate.rowIndex}: ${candidate.timeCell} (차이: ${diffStr})`);
            }
            console.log('');
        }
        
        // 최종 결과
        if (closestRow) {
            const diffMinutes = Math.floor(minDiff / 60);
            const diffSeconds = minDiff % 60;
            
            let timeDiffStr = '';
            if (minDiff === 0) {
                timeDiffStr = '완벽 일치';
                console.log('🎉 매칭 결과: 완벽 일치!');
            } else {
                if (diffMinutes > 0) {
                    timeDiffStr = `${diffMinutes}분 ${diffSeconds}초`;
                } else {
                    timeDiffStr = `${diffSeconds}초`;
                }
                console.log('✅ 매칭 결과: 성공');
            }
            
            console.log(`   행 번호: ${matchedRowIndex}`);
            console.log(`   타겟 시간: ${targetTimeStr}`);
            console.log(`   매칭된 시간: ${closestRow[timeColumnIndex]}`);
            console.log(`   시간 차이: ${timeDiffStr}`);
            console.log(`   매칭된 행 데이터: [${closestRow.slice(0, 5).join('] [').replace(/\[\]/g, '[빈값]')}]`);
            
        } else {
            console.log('❌ 매칭 결과: 실패');
            console.log(`   ${searchRangeMinutes}분 범위 내에서 매칭되는 행을 찾을 수 없습니다.`);
            console.log(`   검색된 셀: ${checkedCount}개`);
        }
        
    } catch (error) {
        console.error('❌ 오류 발생:', error.message);
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
testVirtualSheetAnalysis();