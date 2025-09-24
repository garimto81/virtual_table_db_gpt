/**
 * 간단한 보안 미들웨어
 * 포트 6000 서버 실행을 위한 최소 보안 설정
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

/**
 * Helmet 보안 헤더 설정
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

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

  // Google Sheets API
  sheets: rateLimit({
    windowMs: 1 * 60 * 1000, // 1분
    max: 30, // 최대 30회
    message: 'Sheets API rate limit exceeded.'
  })
};

/**
 * 기본 보안 미들웨어
 */
export function securityMiddleware(_req: Request, res: Response, next: NextFunction): void {
  // 기본 헤더 설정
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  next();
}

/**
 * 입력 검증 유틸리티
 */
export class InputValidator {
  static validateHandNumber(input: any): number {
    const num = parseInt(input, 10);
    if (isNaN(num) || num < 1 || num > 999999) {
      throw new Error('Invalid hand number: must be between 1 and 999999');
    }
    return num;
  }

  static sanitizeString(input: any): string {
    if (typeof input !== 'string') return '';

    return input
      .trim()
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .substring(0, 1000);
  }
}

export default {
  helmetConfig,
  rateLimiters,
  securityMiddleware,
  InputValidator
};