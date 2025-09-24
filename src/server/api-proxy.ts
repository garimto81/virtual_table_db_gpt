/**
 * API 프록시 서버
 * Phase 1: 보안 강화 - 포커 핸드 모니터링 시스템 핵심 API
 */

import express, { Request, Response } from 'express';
import axios from 'axios';
import { authMiddleware, rbacMiddleware, UserRole, JWTPayload } from './auth';
import { rateLimiters, InputValidator } from './security';

const router = express.Router();


/**
 * Google Sheets API 프록시
 */
router.post(
    '/api/proxy/sheets/update',
    authMiddleware,
    rbacMiddleware([UserRole.EDITOR, UserRole.ADMIN]),
    rateLimiters.sheets,
    async (req: Request & { user?: JWTPayload }, res: Response) => {
        try {
            // 입력 검증
            const { action, data } = req.body;
            
            if (!action || !data) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }

            // 핸드 번호 검증
            if (data.handNumber) {
                data.handNumber = InputValidator.validateHandNumber(data.handNumber);
            }

            // 플레이어 이름 검증
            if (data.playerName) {
                data.playerName = InputValidator.sanitizeString(data.playerName);
            }

            // Apps Script URL (환경 변수에서 관리)
            const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
            
            if (!APPS_SCRIPT_URL) {
                throw new Error('Apps Script URL not configured');
            }

            // Apps Script 호출
            const response = await axios.post(
                APPS_SCRIPT_URL,
                {
                    action,
                    data,
                    userId: req.user?.userId || 'anonymous', // 사용자 ID 추가
                    timestamp: new Date().toISOString()
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000 // 15초 타임아웃
                }
            );

            // 보안 로깅
            console.log({
                type: 'SHEETS_UPDATE',
                severity: 'low',
                userId: req.user?.userId,
                ip: req.ip,
                details: { action, handNumber: data.handNumber }
            });

            return res.json({
                success: true,
                result: response.data,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Sheets API error:', error);
            
            return res.status(500).json({
                success: false,
                error: 'Sheets update failed',
                timestamp: new Date().toISOString()
            });
        }
    }
);

/**
 * 파일명 생성 API 프록시
 */
router.post(
    '/api/proxy/filename/generate',
    authMiddleware,
    rbacMiddleware([UserRole.EDITOR, UserRole.ADMIN]),
    async (req: Request & { user?: JWTPayload }, res: Response) => {
        try {
            const { handNumber, players, tableName } = req.body;
            
            // 입력 검증
            const validatedHandNumber = InputValidator.validateHandNumber(handNumber);
            const validatedPlayers = players.map((p: string) => InputValidator.sanitizeString(p));
            
            // 파일명 생성 로직
            const filename = `${tableName}_${validatedHandNumber}_${validatedPlayers.join('_')}.mp4`
                .replace(/[^a-zA-Z0-9가-힣_.-]/g, '_')
                .replace(/_+/g, '_')
                .substring(0, 255); // 파일명 길이 제한
            
            return res.json({
                success: true,
                filename,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Filename generation error:', error);
            
            return res.status(500).json({
                success: false,
                error: 'Filename generation failed',
                timestamp: new Date().toISOString()
            });
        }
    }
);

/**
 * 자막 생성 API 프록시
 */
router.post(
    '/api/proxy/subtitle/generate',
    authMiddleware,
    rbacMiddleware([UserRole.EDITOR, UserRole.ADMIN]),
    async (req: Request & { user?: JWTPayload }, res: Response) => {
        try {
            const { keyPlayer, stack } = req.body;
            
            if (!keyPlayer || !stack) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }
            
            // 입력 검증
            const validatedPlayer = InputValidator.sanitizeString(keyPlayer.name);
            const validatedStack = Math.max(0, parseInt(stack, 10));
            
            // 자막 생성 (CURRENT STACK 형식)
            const subtitle = `"
${keyPlayer.country || 'Unknown'}
${validatedPlayer.toUpperCase()}
CURRENT STACK - ${validatedStack.toLocaleString()} (${Math.round(validatedStack / 100)}BB)
"`;
            
            return res.json({
                success: true,
                subtitle,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Subtitle generation error:', error);
            
            return res.status(500).json({
                success: false,
                error: 'Subtitle generation failed',
                timestamp: new Date().toISOString()
            });
        }
    }
);


/**
 * 헬스체크 API
 */
router.get('/api/health', (_req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime()
    });
});

// 디버깅: 등록된 라우트 상세 확인
console.log('=== API 프록시 라우터 초기화 ===');
console.log('등록된 라우트 수:', router.stack.length);
router.stack.forEach((layer: any, index: number) => {
    const route = layer.route;
    if (route) {
        const methods = Object.keys(route.methods).join(', ').toUpperCase();
        console.log(`${index + 1}. ${methods} ${route.path}`);
        console.log(`   미들웨어 수: ${route.stack.length}`);
        route.stack.forEach((stack: any, stackIndex: number) => {
            console.log(`   - ${stackIndex + 1}. ${stack.handle.name || 'anonymous'}`);
        });
    } else {
        console.log(`${index + 1}. 미들웨어: ${layer.handle.name || 'anonymous'}`);
    }
});
console.log('=============================');

export default router;