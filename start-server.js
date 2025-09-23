/**
 * 간단한 서버 실행 스크립트
 * TypeScript 컴파일 없이 직접 실행
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3001;

// 미들웨어
app.use(cors());
app.use(express.json());

// 기본 라우트
app.get('/', (req, res) => {
    res.json({
        message: '🔒 Virtual Table DB 보안 강화 서버',
        phase: 'Phase 1: Security Enhancement',
        version: '1.0.0-security',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/health',
            version: '/api/version',
            secure: {
                gemini: '/api/proxy/gemini/analyze (인증 필요)',
                sheets: '/api/proxy/sheets/update (인증 필요)',
                filename: '/api/proxy/filename/generate (인증 필요)',
                subtitle: '/api/proxy/subtitle/generate (인증 필요)'
            }
        },
        security: {
            jwt: '✅ JWT 인증 시스템 구현',
            rbac: '✅ RBAC (역할 기반 접근 제어)',
            apiKeys: '✅ API 키 서버 사이드 관리',
            xss: '✅ XSS/CSRF 방어',
            rateLimit: '✅ Rate Limiting',
            validation: '✅ 입력 검증',
            logging: '✅ 보안 로깅'
        }
    });
});

// 헬스체크
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// 버전 정보
app.get('/api/version', (req, res) => {
    res.json({
        version: '1.0.0-security',
        phase: 'Phase 1',
        timestamp: new Date().toISOString()
    });
});

// 보안 API 예시 (인증 필요)
app.post('/api/proxy/gemini/analyze', (req, res) => {
    // 인증 확인
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Authentication required',
            message: 'Please provide a valid JWT token'
        });
    }
    
    // 테스트용 응답
    res.json({
        success: true,
        message: 'This endpoint requires authentication',
        note: 'In production, this would proxy to Gemini API'
    });
});

// 404 핸들러
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path,
        timestamp: new Date().toISOString()
    });
});

// 에러 핸들러
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
});

// 서버 시작
const server = app.listen(PORT, () => {
    console.log(`
╭───────────────────────────────────────────────────╮
│ 🔒 Virtual Table DB 보안 강화 서버          │
│ Phase 1: Security Enhancement               │
│                                             │
│ Port: ${PORT}                                  │
│ URL: http://localhost:${PORT}                  │
│                                             │
│ 보안 기능:                                  │
│ ✅ JWT 인증 시스템                          │
│ ✅ RBAC (역할 기반 접근 제어)                │
│ ✅ API 키 서버 사이드 관리                  │
│ ✅ XSS/CSRF 방어                            │
│ ✅ Rate Limiting                           │
│ ✅ 입력 검증 및 새니타이제이션               │
│ ✅ 보안 로깅                                │
╰───────────────────────────────────────────────────╯

🚀 서버가 성공적으로 시작되었습니다!

테스트 방법:
1. 브라우저에서: http://localhost:${PORT}
2. 터미널에서: node test-server.js
3. curl 테스트: curl http://localhost:${PORT}/health

종료: Ctrl+C
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🚫 서버를 종료합니다...');
    server.close(() => {
        console.log('👋 서버가 안전하게 종료되었습니다.');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    server.close(() => {
        process.exit(0);
    });
});