/**
 * 보안 미들웨어 및 유틸리티
 * Phase 1: 보안 강화 - XSS, CSRF, Rate Limiting 등
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// DOMPurify 초기화
const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * 입력 검증 클래스
 */
export class InputValidator {
    /**
     * 핸드 번호 검증
     */
    static validateHandNumber(input: any): number {
        const num = parseInt(input, 10);
        if (isNaN(num) || num < 1 || num > 999999) {
            throw new Error('Invalid hand number: must be between 1 and 999999');
        }
        return num;
    }

    /**
     * 플레이어 이름 검증
     */
    static validatePlayerName(input: any): string {
        if (typeof input !== 'string') {
            throw new Error('Player name must be a string');
        }
        
        // 위험한 문자 제거
        const sanitized = input.trim()
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/<[^>]+>/g, '')
            .substring(0, 50);
        
        if (sanitized.length < 1) {
            throw new Error('Player name cannot be empty');
        }
        
        return sanitized;
    }

    /**
     * 이메일 검증
     */
    static validateEmail(input: any): string {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input)) {
            throw new Error('Invalid email format');
        }
        return input.toLowerCase();
    }

    /**
     * URL 검증
     */
    static validateURL(input: any): string {
        try {
            const url = new URL(input);
            if (!['http:', 'https:'].includes(url.protocol)) {
                throw new Error('Only HTTP and HTTPS protocols are allowed');
            }
            return url.toString();
        } catch {
            throw new Error('Invalid URL format');
        }
    }

    /**
     * SQL 인젝션 방지
     */
    static sanitizeSQLInput(input: string): string {
        // 기본적인 SQL 인젝션 방어
        return input.replace(/['"\\;]/g, '');
    }
}

/**
 * XSS 방어를 위한 HTML 새니타이저
 */
export class HTMLSanitizer {
    /**
     * HTML 문자열 정화
     */
    static sanitize(dirty: string, options?: any): string {
        const defaultOptions = {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'div', 'span'],
            ALLOWED_ATTR: ['href', 'title', 'class', 'id'],
            ALLOW_DATA_ATTR: false,
            FORBID_SCRIPT: true,
            FORBID_IFRAME: true
        };
        
        return purify.sanitize(dirty, { ...defaultOptions, ...options });
    }

    /**
     * 텍스트로만 변환
     */
    static toText(html: string): string {
        return purify.sanitize(html, { ALLOWED_TAGS: [] });
    }
}

/**
 * Rate Limiting 설정
 */
export const rateLimiters = {
    // 일반 API 호출
    general: rateLimit({
        windowMs: 15 * 60 * 1000, // 15분
        max: 100, // 최대 100회
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false
    }),

    // 로그인 시도
    login: rateLimit({
        windowMs: 15 * 60 * 1000, // 15분
        max: 5, // 최대 5회
        message: 'Too many login attempts, please try again later.',
        skipSuccessfulRequests: true
    }),

    // AI API 호출
    ai: rateLimit({
        windowMs: 1 * 60 * 1000, // 1분
        max: 10, // 최대 10회
        message: 'AI API rate limit exceeded, please wait.',
        keyGenerator: (req) => {
            return req.user?.userId || req.ip;
        }
    }),

    // Google Sheets API
    sheets: rateLimit({
        windowMs: 1 * 60 * 1000, // 1분
        max: 30, // 최대 30회
        message: 'Sheets API rate limit exceeded.'
    })
};

/**
 * Helmet 보안 헤더 설정
 */
export const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://generativelanguage.googleapis.com"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: "no-referrer" },
    xssFilter: true
});

/**
 * CSRF 토큰 생성 및 검증
 */
export class CSRFProtection {
    private static tokens = new Map<string, { token: string; expires: number }>();

    /**
     * CSRF 토큰 생성
     */
    static generateToken(sessionId: string): string {
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const expires = Date.now() + (60 * 60 * 1000); // 1시간
        
        this.tokens.set(sessionId, { token, expires });
        
        // 만료된 토큰 정리
        this.cleanup();
        
        return token;
    }

    /**
     * CSRF 토큰 검증
     */
    static validateToken(sessionId: string, token: string): boolean {
        const stored = this.tokens.get(sessionId);
        
        if (!stored || stored.expires < Date.now()) {
            return false;
        }
        
        if (stored.token !== token) {
            return false;
        }
        
        // 토큰 일회성 사용
        this.tokens.delete(sessionId);
        return true;
    }

    /**
     * 만료된 토큰 정리
     */
    private static cleanup(): void {
        const now = Date.now();
        for (const [sessionId, data] of this.tokens.entries()) {
            if (data.expires < now) {
                this.tokens.delete(sessionId);
            }
        }
    }
}

/**
 * 보안 로깅
 */
export class SecurityLogger {
    /**
     * 보안 이벤트 로깅
     */
    static logSecurityEvent(event: {
        type: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        userId?: string;
        ip?: string;
        details?: any;
    }): void {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            ...event
        };
        
        // 콘솔 로그 (프로덕션에서는 파일이나 데이터베이스로)
        if (event.severity === 'high' || event.severity === 'critical') {
            console.error('🔴 Security Event:', logEntry);
        } else {
            console.warn('🟡 Security Event:', logEntry);
        }
        
        // TODO: 실제 프로덕션에서는 파일 또는 데이터베이스에 저장
    }

    /**
     * 의심스러운 행동 감지
     */
    static detectSuspiciousActivity(req: Request): boolean {
        // SQL 인젝션 패턴 감지
        const sqlPatterns = /('|(\-\-)|(;)|(\|\|)|(\/\*)|(%27)|(\')|(\-\-)|(;)|(%23)|(#))/i;
        const url = req.url + JSON.stringify(req.body || {});
        
        if (sqlPatterns.test(url)) {
            this.logSecurityEvent({
                type: 'SQL_INJECTION_ATTEMPT',
                severity: 'high',
                ip: req.ip,
                details: { url: req.url, body: req.body }
            });
            return true;
        }
        
        // XSS 패턴 감지
        const xssPatterns = /(<script[^>]*>|javascript:|onerror=|onclick=)/i;
        if (xssPatterns.test(url)) {
            this.logSecurityEvent({
                type: 'XSS_ATTEMPT',
                severity: 'high',
                ip: req.ip,
                details: { url: req.url, body: req.body }
            });
            return true;
        }
        
        return false;
    }
}

/**
 * 보안 미들웨어 통합
 */
export function securityMiddleware(req: Request, res: Response, next: NextFunction): void {
    // 의심스러운 활동 감지
    if (SecurityLogger.detectSuspiciousActivity(req)) {
        res.status(400).json({ error: 'Suspicious activity detected' });
        return;
    }
    
    // CSRF 토큰 헤더 추가 (브라우저 요청인 경우)
    if (req.method !== 'GET' && req.headers['x-requested-with'] !== 'XMLHttpRequest') {
        const sessionId = req.sessionID || req.ip;
        const csrfToken = CSRFProtection.generateToken(sessionId);
        res.setHeader('X-CSRF-Token', csrfToken);
    }
    
    next();
}

/**
 * 에러 정보 숨기기
 */
export function sanitizeError(error: Error): { message: string; code?: string } {
    // 개발 환경에서만 상세 에러 표시
    if (process.env.NODE_ENV === 'development') {
        return {
            message: error.message,
            code: (error as any).code
        };
    }
    
    // 프로덕션에서는 일반적인 메시지만 반환
    return {
        message: 'An error occurred. Please try again later.',
        code: 'INTERNAL_ERROR'
    };
}