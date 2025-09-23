/**
 * Virtual Table DB 보안 강화 서버
 * Phase 1: 보안 강화 - 통합 서버
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { VirtualTableDB } from './index';
import { helmetConfig, securityMiddleware, rateLimiters } from './server/security';
import apiProxy from './server/api-proxy';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 보안 헤더
app.use(helmetConfig);

// CORS 설정 (프로덕션에서는 더 엄격하게)
const corsOptions: cors.CorsOptions = {
    origin: NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    exposedHeaders: ['X-CSRF-Token']
};
app.use(cors(corsOptions));

// 미들웨어
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(securityMiddleware);
app.use(rateLimiters.general);

// API 프록시 라우트
app.use(apiProxy);

// VirtualTableDB 인스턴스
const db = new VirtualTableDB();

// 루트 경로
app.get('/', (_req, res) => {
  res.json({
    message: 'Virtual Table DB 서버에 오신 것을 환영합니다!',
    version: db.getVersion(),
    documentation: {
      health: '/health',
      version: '/api/version',
      greeting: '/api/greeting (POST)',
      events: '/api/events (SSE)'
    }
  });
});

// 헬스체크 엔드포인트
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    version: db.getVersion(),
    timestamp: new Date().toISOString()
  });
});

// API 엔드포인트
app.get('/api/version', (_req, res) => {
  res.json({ version: db.getVersion() });
});

app.post('/api/greeting', (req, res) => {
  try {
    const { name } = req.body;
    const message = db.greeting(name);
    res.json({ message });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 테스트용 SSE 엔드포인트
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // 5초마다 이벤트 전송
  const interval = setInterval(() => {
    const data = {
      time: new Date().toISOString(),
      message: '실시간 데이터 전송 중...'
    };
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }, 5000);

  // 클라이언트 연결 종료시
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

// 404 핸들러
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 서버 시작
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Virtual Table DB Server              ║
║   🔒 Phase 1: 보안 강화 완료           ║
║   Version: ${db.getVersion()}                  ║
║   Port: ${PORT}                           ║
║   URL: http://localhost:${PORT}           ║
╚════════════════════════════════════════╝

🔐 보안 기능:
  ✅ JWT 인증 시스템
  ✅ RBAC (역할 기반 접근 제어)
  ✅ API 키 서버 사이드 관리
  ✅ XSS/CSRF 방어
  ✅ Rate Limiting
  ✅ 입력 검증 및 새니타이제이션
  ✅ 보안 로깅

📌 Available Endpoints:
  GET  /              - 홈 (API 문서)
  GET  /health        - 헬스체크
  GET  /api/version   - 버전 정보

🔒 보안 API (인증 필요):
  POST /api/proxy/gemini/analyze    - AI 분석
  POST /api/proxy/sheets/update     - Sheets 업데이트
  POST /api/proxy/filename/generate - 파일명 생성
  POST /api/proxy/subtitle/generate - 자막 생성

🚀 보안 강화 서버가 성공적으로 시작되었습니다!
  `);
});

// Graceful shutdown 처리
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

// 프로세스 유지를 위한 처리
if (require.main === module) {
  // Keep the process running
  setInterval(() => {}, 1 << 30);
}

export default app;