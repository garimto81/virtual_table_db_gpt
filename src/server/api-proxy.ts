/**
 * API 프록시 서버
 * Phase 1: 보안 강화 - API 키를 서버에서 관리
 */

import express, { Request, Response } from 'express';
import axios from 'axios';
import { authMiddleware, rbacMiddleware, UserRole } from './auth';
import { rateLimiters, InputValidator, SecurityLogger } from './security';

const router = express.Router();

// Gemini API 설정
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';

if (!GEMINI_API_KEY) {
    console.error('⚠️ GEMINI_API_KEY is not set in environment variables');
}

/**
 * Gemini AI 분석 프록시
 * 클라이언트에서 API 키를 직접 사용하지 않고 서버를 통해 호출
 */
router.post(
    '/api/proxy/gemini/analyze',
    authMiddleware, // 인증 필수
    rbacMiddleware([UserRole.EDITOR, UserRole.ADMIN]), // Editor 이상만 사용 가능
    rateLimiters.ai, // AI API Rate limiting
    async (req: Request & { user?: any }, res: Response) => {
        try {
            // 입력 검증
            const { handInfo, currentStack } = req.body;
            
            if (!handInfo || !currentStack) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }

            // 보안 로깅
            SecurityLogger.logSecurityEvent({
                type: 'AI_ANALYSIS_REQUEST',
                severity: 'low',
                userId: req.user?.userId,
                ip: req.ip,
                details: { handInfo: handInfo.substring(0, 50) }
            });

            // Gemini API 프롬프트 구성
            const prompt = `
                포커 핸드 분석:
                ${handInfo}
                현재 스텍: ${currentStack}BB
                
                다음 형식으로 3단어 이내로 간결하게 요약:
                1. 액션 타입 (예: 블러프/벌루벳/폴드)
                2. 핸드 강도 (약함/보통/강함)
                3. 결과 (성공/실패/진행중)
            `;

            // Gemini API 호출
            const response = await axios.post(
                `${GEMINI_API_URL}/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
                {
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 1,
                        topP: 1,
                        maxOutputTokens: 100
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000 // 10초 타임아웃
                }
            );

            // 응답 처리
            const aiAnalysis = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '분석 실패';
            
            res.json({
                success: true,
                analysis: aiAnalysis.trim(),
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Gemini API error:', error);
            
            // 에러 로깅
            SecurityLogger.logSecurityEvent({
                type: 'AI_ANALYSIS_ERROR',
                severity: 'medium',
                userId: req.user?.userId,
                ip: req.ip,
                details: { error: (error as Error).message }
            });

            res.status(500).json({
                success: false,
                error: 'AI analysis failed',
                timestamp: new Date().toISOString()
            });
        }
    }
);

/**
 * Google Sheets API 프록시
 */
router.post(
    '/api/proxy/sheets/update',
    authMiddleware,
    rbacMiddleware([UserRole.EDITOR, UserRole.ADMIN]),
    rateLimiters.sheets,
    async (req: Request & { user?: any }, res: Response) => {
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
                data.playerName = InputValidator.validatePlayerName(data.playerName);
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
                    userId: req.user.userId, // 사용자 ID 추가
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
            SecurityLogger.logSecurityEvent({
                type: 'SHEETS_UPDATE',
                severity: 'low',
                userId: req.user?.userId,
                ip: req.ip,
                details: { action, handNumber: data.handNumber }
            });

            res.json({
                success: true,
                result: response.data,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Sheets API error:', error);
            
            res.status(500).json({
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
    async (req: Request & { user?: any }, res: Response) => {
        try {
            const { handNumber, players, tableName } = req.body;
            
            // 입력 검증
            const validatedHandNumber = InputValidator.validateHandNumber(handNumber);
            const validatedPlayers = players.map((p: string) => InputValidator.validatePlayerName(p));
            
            // 파일명 생성 로직
            const filename = `${tableName}_${validatedHandNumber}_${validatedPlayers.join('_')}.mp4`
                .replace(/[^a-zA-Z0-9가-힣_.-]/g, '_')
                .replace(/_+/g, '_')
                .substring(0, 255); // 파일명 길이 제한
            
            res.json({
                success: true,
                filename,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Filename generation error:', error);
            
            res.status(500).json({
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
    async (req: Request & { user?: any }, res: Response) => {
        try {
            const { keyPlayer, stack } = req.body;
            
            if (!keyPlayer || !stack) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }
            
            // 입력 검증
            const validatedPlayer = InputValidator.validatePlayerName(keyPlayer.name);
            const validatedStack = Math.max(0, parseInt(stack, 10));
            
            // 자막 생성 (CURRENT STACK 형식)
            const subtitle = `"
${keyPlayer.country || 'Unknown'}
${validatedPlayer.toUpperCase()}
CURRENT STACK - ${validatedStack.toLocaleString()} (${Math.round(validatedStack / 100)}BB)
"`;
            
            res.json({
                success: true,
                subtitle,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Subtitle generation error:', error);
            
            res.status(500).json({
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
router.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime()
    });
});

export default router;