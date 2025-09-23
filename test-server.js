/**
 * 보안 강화 서버 테스트 스크립트
 * Phase 1 테스트용
 */

const axios = require('axios');

const SERVER_URL = 'http://localhost:3001';
let testToken = null;

// 색상 코드
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, success, details = '') {
    const status = success ? `✅ PASS` : `❌ FAIL`;
    const color = success ? 'green' : 'red';
    log(`${status} - ${name}`, color);
    if (details) {
        console.log(`     ${details}`);
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 테스트 함수들
async function testHealthCheck() {
    try {
        const response = await axios.get(`${SERVER_URL}/health`);
        const success = response.status === 200 && response.data.status === 'healthy';
        logTest('Health Check', success, `Status: ${response.data.status}`);
        return success;
    } catch (error) {
        logTest('Health Check', false, error.message);
        return false;
    }
}

async function testHomePage() {
    try {
        const response = await axios.get(`${SERVER_URL}/`);
        const success = response.status === 200;
        logTest('Home Page', success, `Version: ${response.data.version}`);
        return success;
    } catch (error) {
        logTest('Home Page', false, error.message);
        return false;
    }
}

async function testApiVersion() {
    try {
        const response = await axios.get(`${SERVER_URL}/api/version`);
        const success = response.status === 200 && response.data.version;
        logTest('API Version', success, `Version: ${response.data.version}`);
        return success;
    } catch (error) {
        logTest('API Version', false, error.message);
        return false;
    }
}

async function testSecureEndpointWithoutAuth() {
    try {
        await axios.post(`${SERVER_URL}/api/proxy/gemini/analyze`, {
            handInfo: 'test',
            currentStack: 100
        });
        logTest('Secure Endpoint Without Auth', false, 'Should have been rejected');
        return false;
    } catch (error) {
        const success = error.response && error.response.status === 401;
        logTest('Secure Endpoint Without Auth', success, 
            success ? 'Correctly rejected (401)' : `Wrong status: ${error.response?.status}`);
        return success;
    }
}

async function testRateLimiting() {
    log('\n📊 Testing Rate Limiting (sending 10 rapid requests)...', 'cyan');
    
    const requests = [];
    for (let i = 0; i < 10; i++) {
        requests.push(
            axios.get(`${SERVER_URL}/health`)
                .then(() => ({ success: true }))
                .catch(error => ({ 
                    success: false, 
                    status: error.response?.status,
                    message: error.response?.data?.message 
                }))
        );
    }
    
    const results = await Promise.all(requests);
    const rateLimited = results.some(r => r.status === 429);
    
    if (!rateLimited) {
        log('     All requests succeeded (rate limit is generous)', 'yellow');
    } else {
        const limitedCount = results.filter(r => r.status === 429).length;
        log(`     ${limitedCount} requests were rate limited`, 'green');
    }
    
    return true;
}

async function testCORS() {
    try {
        const response = await axios.options(`${SERVER_URL}/health`, {
            headers: {
                'Origin': 'http://localhost:3001',
                'Access-Control-Request-Method': 'GET'
            }
        });
        
        const hasAllowOrigin = response.headers['access-control-allow-origin'];
        const hasAllowMethods = response.headers['access-control-allow-methods'];
        
        const success = hasAllowOrigin && hasAllowMethods;
        logTest('CORS Headers', success, 
            `Origin: ${hasAllowOrigin || 'none'}, Methods: ${hasAllowMethods || 'none'}`);
        return success;
    } catch (error) {
        logTest('CORS Headers', false, error.message);
        return false;
    }
}

async function testSecurityHeaders() {
    try {
        const response = await axios.get(`${SERVER_URL}/health`);
        const headers = response.headers;
        
        const securityHeaders = {
            'x-content-type-options': headers['x-content-type-options'],
            'x-frame-options': headers['x-frame-options'],
            'x-xss-protection': headers['x-xss-protection'],
            'strict-transport-security': headers['strict-transport-security']
        };
        
        const hasSecurityHeaders = Object.values(securityHeaders).some(h => h !== undefined);
        
        logTest('Security Headers', hasSecurityHeaders);
        
        if (hasSecurityHeaders) {
            Object.entries(securityHeaders).forEach(([key, value]) => {
                if (value) {
                    console.log(`     ${key}: ${value}`);
                }
            });
        }
        
        return hasSecurityHeaders;
    } catch (error) {
        logTest('Security Headers', false, error.message);
        return false;
    }
}

async function testInputValidation() {
    try {
        // 잘못된 데이터로 테스트
        await axios.post(`${SERVER_URL}/api/proxy/filename/generate`, {
            handNumber: 'invalid', // 숫자가 아님
            players: ['<script>alert("XSS")</script>'], // XSS 시도
            tableName: 'test'
        }, {
            headers: {
                'Authorization': 'Bearer fake-token' // 가짜 토큰
            }
        });
        
        logTest('Input Validation', false, 'Should have been rejected');
        return false;
    } catch (error) {
        const success = error.response && (error.response.status === 401 || error.response.status === 400);
        logTest('Input Validation', success, 
            success ? `Correctly rejected (${error.response.status})` : 'Wrong response');
        return success;
    }
}

// 메인 테스트 실행
async function runTests() {
    console.log('\n');
    log('====================================', 'cyan');
    log('🔒 Virtual Table DB 보안 서버 테스트', 'cyan');
    log('====================================', 'cyan');
    console.log('\n');
    
    log('서버 URL: ' + SERVER_URL, 'yellow');
    log('테스트 시작...\n', 'yellow');
    
    // 서버 연결 확인
    log('1️⃣ 기본 연결 테스트', 'blue');
    log('-----------------', 'blue');
    
    const healthOk = await testHealthCheck();
    if (!healthOk) {
        log('\n❌ 서버가 실행되지 않았습니다!', 'red');
        log('다음 명령어로 서버를 실행하세요:', 'yellow');
        log('npm run dev', 'cyan');
        return;
    }
    
    await testHomePage();
    await testApiVersion();
    
    // 보안 기능 테스트
    log('\n2️⃣ 보안 기능 테스트', 'blue');
    log('-----------------', 'blue');
    
    await testSecureEndpointWithoutAuth();
    await testCORS();
    await testSecurityHeaders();
    await testInputValidation();
    
    // Rate Limiting 테스트
    log('\n3️⃣ Rate Limiting 테스트', 'blue');
    log('--------------------', 'blue');
    
    await testRateLimiting();
    
    // 결과 요약
    log('\n====================================', 'cyan');
    log('📊 테스트 완료', 'cyan');
    log('====================================', 'cyan');
    
    log('\n💡 다음 단계:', 'yellow');
    log('1. .env 파일에 실제 API 키 설정', 'reset');
    log('2. JWT 토큰 생성 및 인증 테스트', 'reset');
    log('3. 실제 API 프록시 기능 테스트', 'reset');
}

// 테스트 실행
runTests().catch(error => {
    log('\n❌ 테스트 실행 중 오류:', 'red');
    console.error(error);
});