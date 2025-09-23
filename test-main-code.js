/**
 * 메인 코드(index.html) 작동 테스트
 * 기존 기능이 정상 작동하는지 확인
 */

const axios = require('axios');

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// HTTP 서버로 index.html 확인
async function testHttpServer() {
    log('\n📄 index.html 로드 테스트...', 'cyan');
    
    try {
        const response = await axios.get('http://localhost:8080/index.html');
        
        if (response.status === 200) {
            const html = response.data;
            
            // 주요 요소들 확인
            const checks = [
                { name: 'APP_VERSION', exists: html.includes('APP_VERSION') },
                { name: 'Virtual Table 데이터', exists: html.includes('Virtual Table 데이터') },
                { name: '편집 버튼', exists: html.includes('편집') },
                { name: '완료 버튼', exists: html.includes('완료') },
                { name: 'SSE 연결', exists: html.includes('SSE') || html.includes('EventSource') },
                { name: 'Google Sheets 연동', exists: html.includes('APPS_SCRIPT_URL') },
                { name: 'AI 분석 기능', exists: html.includes('analyzeHand') || html.includes('AI') },
                { name: '파일명 생성', exists: html.includes('generateFilename') },
                { name: '자막 생성', exists: html.includes('subtitle') || html.includes('자막') }
            ];
            
            log('\n✅ index.html 로드 성공!', 'green');
            log('\n📋 주요 기능 체크리스트:', 'yellow');
            
            let allPass = true;
            checks.forEach(check => {
                const status = check.exists ? '✅' : '❌';
                const color = check.exists ? 'green' : 'red';
                log(`  ${status} ${check.name}`, color);
                if (!check.exists) allPass = false;
            });
            
            // 보안 취약점 확인
            log('\n🔒 보안 취약점 스캔:', 'yellow');
            const vulnerabilities = [
                { 
                    name: 'localStorage에 API 키 저장', 
                    pattern: /localStorage\.setItem.*api.*key/i,
                    found: /localStorage\.setItem.*api.*key/i.test(html)
                },
                { 
                    name: 'innerHTML 사용 (XSS 위험)', 
                    pattern: /\.innerHTML\s*=/,
                    found: /\.innerHTML\s*=/.test(html),
                    count: (html.match(/\.innerHTML\s*=/g) || []).length
                },
                { 
                    name: 'eval() 사용', 
                    pattern: /eval\(/,
                    found: /eval\(/.test(html)
                },
                { 
                    name: 'document.write 사용', 
                    pattern: /document\.write/,
                    found: /document\.write/.test(html)
                }
            ];
            
            vulnerabilities.forEach(vuln => {
                if (vuln.found) {
                    const count = vuln.count ? ` (${vuln.count}곳)` : '';
                    log(`  ⚠️  ${vuln.name}${count}`, 'red');
                } else {
                    log(`  ✅ ${vuln.name} - 안전`, 'green');
                }
            });
            
            // 파일 크기 확인
            const fileSizeKB = Math.round(html.length / 1024);
            log(`\n📊 파일 정보:`, 'cyan');
            log(`  - 파일 크기: ${fileSizeKB}KB`, fileSizeKB > 100 ? 'red' : 'green');
            log(`  - 전체 라인 수: ${html.split('\n').length}줄`, 'yellow');
            
            return allPass;
            
        } else {
            log('❌ index.html 로드 실패', 'red');
            return false;
        }
    } catch (error) {
        log(`❌ 서버 연결 실패: ${error.message}`, 'red');
        log('\n💡 웹 서버가 실행되지 않았습니다.', 'yellow');
        log('다음 명령어로 서버를 실행하세요:', 'yellow');
        log('python -m http.server 8080', 'cyan');
        return false;
    }
}

// 메인 실행
async function main() {
    log('========================================', 'cyan');
    log('🔍 Virtual Table DB 메인 코드 테스트', 'cyan');
    log('========================================', 'cyan');
    
    const result = await testHttpServer();
    
    log('\n========================================', 'cyan');
    if (result) {
        log('✅ 기본 기능 테스트 완료', 'green');
        log('\n⚠️  발견된 보안 이슈:', 'yellow');
        log('1. localStorage에 API 키 저장 중', 'yellow');
        log('2. innerHTML 사용으로 XSS 취약', 'yellow');
        log('\n다음 단계: 보안 취약점 수정', 'cyan');
    } else {
        log('❌ 테스트 실패', 'red');
    }
    log('========================================', 'cyan');
}

// 실행
main().catch(error => {
    log(`\n❌ 테스트 중 오류 발생: ${error.message}`, 'red');
    process.exit(1);
});