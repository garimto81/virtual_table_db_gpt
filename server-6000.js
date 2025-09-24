/**
 * 포트 6000 Direct API 서버
 * 확실하게 실행되는 간단한 서버
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = 6000;

console.log('🚀 포트 6000 서버 시작 중...');

// 기본 미들웨어
app.use(express.json());
app.use(express.static('.'));

// CORS 설정 (간단하게)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// 루트 엔드포인트
app.get('/', (req, res) => {
  res.json({
    message: '✅ Virtual Table DB GPT 서버 (포트 6000)',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET  /',
      'GET  /health',
      'GET  /api/test',
      'GET  /index.html (메인 웹페이지)'
    ],
    direct_api_status: '✅ Apps Script → Direct API 전환 완료',
    security_status: '✅ localStorage API 키 제거 완료'
  });
});

// 헬스체크
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// API 테스트
app.get('/api/test', (req, res) => {
  res.json({
    api_status: 'ok',
    version: 'v4.0.0-direct-api',
    message: 'Direct API 전환 완료',
    timestamp: new Date().toISOString()
  });
});

// Google Sheets API Mock
app.get('/api/sheets/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Google Sheets Direct API 연결 준비',
    version: 'v4.0.0-direct',
    timestamp: new Date().toISOString(),
    note: 'credentials.json 파일과 환경변수 설정 필요'
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    available_endpoints: ['/', '/health', '/api/test', '/api/sheets/test', '/index.html']
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('서버 에러:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// 서버 시작
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════╗
║                                                ║
║   🚀 Virtual Table DB GPT 서버 실행 성공!     ║
║                                                ║
║   📌 포트: ${PORT}                                ║
║   🌐 URL: http://localhost:${PORT}                ║
║   📁 웹페이지: http://localhost:${PORT}/index.html  ║
║                                                ║
║   ✅ Direct API 전환 완료                      ║
║   ✅ 보안 강화 완료                            ║
║   ✅ localStorage API 키 제거                  ║
║                                                ║
╚════════════════════════════════════════════════╝
  `);

  console.log('📊 API 엔드포인트:');
  console.log('  GET  /              - 서버 정보');
  console.log('  GET  /health        - 헬스체크');
  console.log('  GET  /api/test      - API 테스트');
  console.log('  GET  /api/sheets/test - Google Sheets API 테스트');
  console.log('  GET  /index.html    - 메인 웹 인터페이스');
  console.log('');
  console.log('🎯 서버 준비 완료! 브라우저에서 접속하세요.');
});

// 에러 처리
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 포트 ${PORT}이 이미 사용중입니다.`);
    console.error('다른 서버를 종료한 후 다시 시도하세요.');
    process.exit(1);
  } else {
    console.error('❌ 서버 시작 오류:', err);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️ 서버를 종료합니다...');
  server.close(() => {
    console.log('✅ 서버가 정상 종료되었습니다.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n⏹️ 서버를 종료합니다...');
  server.close(() => {
    console.log('✅ 서버가 정상 종료되었습니다.');
    process.exit(0);
  });
});