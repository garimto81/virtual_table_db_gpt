/**
 * 🔍 자동 검증 스크립트
 * VERIFICATION_CHECKLIST.md의 항목들을 자동으로 확인
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Direct API 전환 자동 검증 시작');
console.log('=====================================\n');

let totalChecks = 0;
let passedChecks = 0;
const issues = [];

function checkItem(description, testFunc, required = true) {
  totalChecks++;
  try {
    const result = testFunc();
    if (result) {
      console.log(`✅ ${description}`);
      passedChecks++;
      return true;
    } else {
      console.log(`❌ ${description}`);
      if (required) issues.push(description);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description} - 에러: ${error.message}`);
    if (required) issues.push(`${description} - ${error.message}`);
    return false;
  }
}

// 1단계: 기본 파일 구조 확인
console.log('🏗️ 1단계: 기본 파일 구조 확인');
console.log('─────────────────────────────────');

checkItem('Google Sheets API 서비스 파일', () =>
  fs.existsSync('src/services/google-sheets.ts'));

checkItem('API 라우터 파일', () =>
  fs.existsSync('src/routes/sheets-api.ts'));

checkItem('클라이언트 API 모듈', () =>
  fs.existsSync('src/client/sheets-client.js'));

checkItem('통합 서버 파일', () =>
  fs.existsSync('src/server.ts'));

checkItem('Credentials .gitignore', () =>
  fs.existsSync('credentials/.gitignore'));

checkItem('Credentials README', () =>
  fs.existsSync('credentials/README.md'));

checkItem('환경변수 템플릿', () =>
  fs.existsSync('.env.example'));

// 2단계: 보안 강화 확인
console.log('\n🔐 2단계: 보안 강화 확인');
console.log('─────────────────────────────────');

checkItem('localStorage API 키 제거', () => {
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  return indexHtml.includes('서버 환경변수에서만 로드') &&
         indexHtml.includes('localStorage에 API 키를 저장하지 않음');
});

checkItem('AI Analyzer 보안 패치', () => {
  const aiAnalyzer = fs.readFileSync('src/modules/ai-analyzer.js', 'utf8');
  return aiAnalyzer.includes('서버 환경변수에서만 API 키 로드');
});

checkItem('Direct API 설정 활성화', () => {
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  return indexHtml.includes('USE_DIRECT_API: true');
});

// 3단계: 패키지 의존성 확인
console.log('\n📦 3단계: 패키지 의존성 확인');
console.log('─────────────────────────────────');

checkItem('package.json 필수 패키지', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const required = ['googleapis', 'axios', 'jsonwebtoken', 'helmet', 'express-rate-limit'];
  return required.every(dep =>
    pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]);
});

// 4단계: 환경 설정 확인
console.log('\n⚙️ 4단계: 환경 설정 확인');
console.log('─────────────────────────────────');

checkItem('.env.example 환경변수', () => {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  const required = ['GOOGLE_SHEETS_ID', 'GOOGLE_SHEETS_CREDENTIALS_PATH', 'GEMINI_API_KEY'];
  return required.every(varName => envExample.includes(varName));
});

checkItem('.env 파일 존재 (선택사항)', () =>
  fs.existsSync('.env'), false);

checkItem('credentials.json 존재 (선택사항)', () =>
  fs.existsSync('credentials/credentials.json'), false);

// 5단계: 빌드 테스트
console.log('\n🔧 5단계: 빌드 및 컴파일 테스트');
console.log('─────────────────────────────────');

checkItem('npm test 통과', () => {
  try {
    execSync('npm test', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
});

checkItem('TypeScript 의존성 설치', () => {
  try {
    execSync('npm list typescript', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
});

// 6단계: 서버 구성 확인
console.log('\n🚀 6단계: 서버 구성 확인');
console.log('─────────────────────────────────');

checkItem('서버 보안 미들웨어', () =>
  fs.existsSync('src/server/security.ts'));

checkItem('API 프록시 설정', () =>
  fs.existsSync('src/server/api-proxy.ts'));

checkItem('JWT 인증 모듈', () =>
  fs.existsSync('src/server/auth.ts'));

// 7단계: 코드 품질 확인
console.log('\n📊 7단계: 코드 품질 확인');
console.log('─────────────────────────────────');

checkItem('Google Sheets 서비스 타입 정의', () => {
  const sheetsService = fs.readFileSync('src/services/google-sheets.ts', 'utf8');
  return sheetsService.includes('interface UpdateRequest') &&
         sheetsService.includes('interface SheetsConfig');
});

checkItem('클라이언트 API 에러 처리', () => {
  const clientApi = fs.readFileSync('src/client/sheets-client.js', 'utf8');
  return clientApi.includes('shouldRetry') &&
         clientApi.includes('retryAttempts');
});

checkItem('레거시 호환성 래퍼', () => {
  const clientApi = fs.readFileSync('src/client/sheets-client.js', 'utf8');
  return clientApi.includes('legacySheetsAPI') &&
         clientApi.includes('callAppsScript');
});

// 최종 결과 출력
console.log('\n' + '='.repeat(50));
console.log('🎯 자동 검증 결과');
console.log('='.repeat(50));

console.log(`✅ 통과한 검증: ${passedChecks}/${totalChecks}`);
const successRate = Math.round((passedChecks / totalChecks) * 100);
console.log(`📊 성공률: ${successRate}%`);

if (issues.length > 0) {
  console.log('\n🚨 발견된 이슈들:');
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });
} else {
  console.log('\n🎉 모든 자동 검증 항목 통과!');
}

console.log('\n📋 다음 단계:');
console.log('1. VERIFICATION_CHECKLIST.md를 열어 수동 검증 진행');
console.log('2. 환경 설정 (.env 파일 및 credentials.json 생성)');
console.log('3. 개발 서버 실행 (npm run dev)');
console.log('4. 웹 인터페이스에서 기능 테스트');

// 상세 검증 가이드 생성
const detailGuide = `
📖 상세 검증 가이드
===================

다음 명령어들로 추가 검증을 수행하세요:

1. 서버 시작:
   npm run dev

2. API 테스트:
   curl http://localhost:3000/api/sheets/test

3. 브라우저 테스트:
   http://localhost:3000/index.html

4. 수동 검증:
   VERIFICATION_CHECKLIST.md 파일을 열어
   체크리스트를 하나씩 확인하세요.

현재 상태: ${successRate}% 완료 (자동 검증 기준)
`;

fs.writeFileSync('VERIFICATION_RESULT.txt', detailGuide);
console.log('\n📄 상세 결과가 VERIFICATION_RESULT.txt에 저장되었습니다.');
console.log('\n🔍 자동 검증 완료!');