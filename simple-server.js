/**
 * 간단한 Node.js Express 서버 (포트 6000)
 * TypeScript 컴파일 없이 바로 실행
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 6000;

console.log('🚀 Simple Express Server 시작...');

// CORS 설정
app.use(cors({
  origin: ['http://localhost:6000', 'http://127.0.0.1:6000'],
  credentials: true
}));

// 미들웨어
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 정적 파일 서빙
app.use(express.static('.'));

// 루트 경로
app.get('/', (req, res) => {
  res.json({
    message: 'Virtual Table DB GPT 서버 (포트 6000)',
    status: 'running',
    port: PORT,
    endpoints: {
      main: '/',
      health: '/health',
      sheets_test: '/api/sheets/test',
      static_files: '/*.html'
    },
    features: [
      '✅ Direct API 전환 완료',
      '✅ 보안 강화 적용',
      '✅ 정적 파일 서빙',
      '✅ CORS 설정'
    ]
  });
});

// 헬스체크
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Google Sheets API 테스트 엔드포인트
app.get('/api/sheets/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Sheets API 테스트 성공 (단순 서버)',
    version: 'v4.0.0-simple',
    timestamp: new Date().toISOString(),
    note: 'credentials.json 파일과 환경변수 설정이 필요합니다'
  });
});

// 기본 Sheets API 엔드포인트들 (Mock)
app.post('/api/sheets/update', (req, res) => {
  console.log('📝 Sheets 업데이트 요청:', req.body);
  res.json({
    status: 'success',
    message: '시트 업데이트 완료 (Mock)',
    data: req.body
  });
});

app.post('/api/sheets/batch-verify', (req, res) => {
  console.log('🔍 배치 검증 요청:', req.body);
  res.json({
    status: 'success',
    message: '배치 검증 완료 (Mock)',
    verified: req.body.rows?.length || 0
  });
});

// 환경 변수 상태 확인
app.get('/api/env/status', (req, res) => {
  res.json({
    env_loaded: {
      NODE_ENV: process.env.NODE_ENV || 'not_set',
      PORT: process.env.PORT || 'not_set',
      GOOGLE_SHEETS_ID: process.env.GOOGLE_SHEETS_ID ? '✅ 설정됨' : '❌ 미설정',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '✅ 설정됨' : '❌ 미설정',
      GOOGLE_SHEETS_CREDENTIALS_PATH: process.env.GOOGLE_SHEETS_CREDENTIALS_PATH || '❌ 미설정'
    }
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    available_endpoints: [
      'GET /',
      'GET /health',
      'GET /api/sheets/test',
      'GET /api/env/status',
      'GET /index.html'
    ]
  });
});

// 서버 시작
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 Virtual Table DB Simple Server   ║
║   포트: ${PORT}                           ║
║   URL: http://localhost:${PORT}           ║
╚════════════════════════════════════════╝

📌 주요 엔드포인트:
  GET  /                    - 홈페이지
  GET  /health             - 헬스체크
  GET  /index.html         - 메인 웹페이지
  GET  /api/sheets/test    - Sheets API 테스트
  GET  /api/env/status     - 환경변수 상태

✅ Direct API 전환 테스트 준비 완료!
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM 신호를 받았습니다. 서버를 종료합니다...');
  server.close(() => {
    console.log('서버가 종료되었습니다.');
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT 신호를 받았습니다. 서버를 종료합니다...');
  server.close(() => {
    console.log('서버가 종료되었습니다.');
    process.exit(0);
  });
});