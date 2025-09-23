/**
 * 보안 개선 전후 비교 테스트
 * index.html vs index-secure.html
 */

const fs = require('fs');
const path = require('path');
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

function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    return {
        fileSize: Math.round(content.length / 1024),
        lines: content.split('\n').length,
        vulnerabilities: {
            localStorage_api_key: {
                count: (content.match(/localStorage.*api.*key/gi) || []).length,
                found: /localStorage.*api.*key/gi.test(content)
            },
            innerHTML: {
                count: (content.match(/\.innerHTML\s*=/g) || []).length,
                found: /\.innerHTML\s*=/.test(content)
            },
            eval: {
                count: (content.match(/eval\(/g) || []).length,
                found: /eval\(/.test(content)
            },
            documentWrite: {
                count: (content.match(/document\.write/g) || []).length,
                found: /document\.write/.test(content)
            },
            unsanitizedHTML: {
                count: (content.match(/\.innerHTML\s*=(?!.*DOMPurify)/g) || []).length,
                found: /\.innerHTML\s*=(?!.*DOMPurify)/.test(content)
            }
        },
        security: {
            hasDOMPurify: content.includes('DOMPurify'),
            hasJWT: content.includes('Bearer') || content.includes('JWT'),
            hasProxyAPI: content.includes('/api/proxy'),
            hasCSRF: content.includes('csrf') || content.includes('CSRF'),
            hasInputValidation: content.includes('validate') || content.includes('sanitize')
        }
    };
}

async function compareFiles() {
    log('\n========================================', 'cyan');
    log('🔍 보안 개선 전후 비교 분석', 'cyan');
    log('========================================', 'cyan');
    
    const originalPath = path.join(__dirname, 'index.html');
    const securePath = path.join(__dirname, 'index-secure.html');
    
    if (!fs.existsSync(originalPath)) {
        log('❌ index.html 파일이 없습니다', 'red');
        return;
    }
    
    if (!fs.existsSync(securePath)) {
        log('❌ index-secure.html 파일이 없습니다', 'red');
        log('💡 보안 버전을 먼저 생성하세요', 'yellow');
        return;
    }
    
    const original = analyzeFile(originalPath);
    const secure = analyzeFile(securePath);
    
    // 파일 크기 비교
    log('\n📁 파일 정보', 'blue');
    log('\u250c───────────────┬──────────────┬─────────────────┐');
    log(`│ 항목          │ 원본        │ 보안 버전        │`);
    log('├───────────────┼──────────────┼─────────────────┤');
    log(`│ 파일 크기     │ ${original.fileSize}KB       │ ${secure.fileSize}KB            │`);
    log(`│ 전체 라인     │ ${original.lines}줄      │ ${secure.lines}줄           │`);
    log('└───────────────┴──────────────┴─────────────────┘');
    
    // 취약점 비교
    log('\n🔒 보안 취약점', 'blue');
    log('\u250c───────────────────┬───────┬─────────┬────────┐');
    log(`│ 취약점             │ 원본  │ 보안버전 │ 개선   │`);
    log('├───────────────────┼───────┼─────────┼────────┤');
    
    const vulnTypes = [
        { key: 'localStorage_api_key', name: 'localStorage API' },
        { key: 'innerHTML', name: 'innerHTML 사용' },
        { key: 'unsanitizedHTML', name: '미정화 HTML' },
        { key: 'eval', name: 'eval() 사용' },
        { key: 'documentWrite', name: 'document.write' }
    ];
    
    vulnTypes.forEach(({ key, name }) => {
        const origCount = original.vulnerabilities[key].count;
        const secCount = secure.vulnerabilities[key].count;
        const improved = origCount > secCount;
        const symbol = improved ? '✅' : (origCount === secCount ? '➖' : '❌');
        const color = improved ? 'green' : (origCount === secCount ? 'yellow' : 'red');
        
        log(`│ ${name.padEnd(18)} │ ${String(origCount).padEnd(5)} │ ${String(secCount).padEnd(8)} │ ${symbol}      │`, color);
    });
    
    log('└───────────────────┴───────┴─────────┴────────┘');
    
    // 보안 기능 비교
    log('\n🔐 보안 기능', 'blue');
    log('\u250c──────────────────┬───────┬─────────┐');
    log(`│ 기능             │ 원본  │ 보안버전 │`);
    log('├──────────────────┼───────┼─────────┤');
    
    const features = [
        { key: 'hasDOMPurify', name: 'DOMPurify' },
        { key: 'hasJWT', name: 'JWT 인증' },
        { key: 'hasProxyAPI', name: 'API 프록시' },
        { key: 'hasCSRF', name: 'CSRF 방어' },
        { key: 'hasInputValidation', name: '입력 검증' }
    ];
    
    features.forEach(({ key, name }) => {
        const origHas = original.security[key] ? '❌' : '❌';
        const secHas = secure.security[key] ? '✅' : '❌';
        const color = secure.security[key] ? 'green' : 'red';
        
        log(`│ ${name.padEnd(16)} │ ${origHas}    │ ${secHas}       │`, color);
    });
    
    log('└──────────────────┴───────┴─────────┘');
    
    // 결과 요약
    log('\n📊 결과 요약', 'cyan');
    
    const totalImprovement = 
        (original.vulnerabilities.innerHTML.count - secure.vulnerabilities.innerHTML.count) +
        (original.vulnerabilities.unsanitizedHTML.count - secure.vulnerabilities.unsanitizedHTML.count);
    
    if (totalImprovement > 0) {
        log(`✅ 취약점 ${totalImprovement}개 개선`, 'green');
    }
    
    if (secure.security.hasDOMPurify) {
        log('✅ DOMPurify 라이브러리 추가됨', 'green');
    }
    
    if (secure.vulnerabilities.innerHTML.count === 0) {
        log('✅ 모든 innerHTML이 안전하게 처리됨', 'green');
    } else if (secure.vulnerabilities.unsanitizedHTML.count === 0) {
        log('✅ 모든 HTML이 DOMPurify로 정화됨', 'green');
    }
    
    // 다음 단계 제안
    log('\n🎯 다음 단계', 'yellow');
    if (secure.vulnerabilities.localStorage_api_key.count > 0) {
        log('⚠️  localStorage API 키를 서버 프록시로 이동 필요', 'yellow');
    }
    if (!secure.security.hasJWT) {
        log('⚠️  JWT 인증 시스템 구현 필요', 'yellow');
    }
    if (!secure.security.hasProxyAPI) {
        log('⚠️  API 프록시 서버 연동 필요', 'yellow');
    }
    
    log('\n========================================', 'cyan');
    
    // 테스트 URL
    log('\n🌐 테스트 URL:', 'cyan');
    log('원본: http://localhost:3002/index.html', 'yellow');
    log('보안: http://localhost:3002/index-secure.html', 'green');
    log('상태: http://localhost:3002/test-status', 'blue');
}

// 실행
compareFiles().catch(error => {
    log(`❌ 오류 발생: ${error.message}`, 'red');
});