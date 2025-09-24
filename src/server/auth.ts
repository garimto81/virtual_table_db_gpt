/**
 * 인증 및 권한 관리 시스템
 * Phase 1: 보안 강화 - JWT 기반 인증
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';

// JWT 설정
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

// 사용자 역할 정의 (RBAC)
export enum UserRole {
    ADMIN = 'admin',
    EDITOR = 'editor',
    VIEWER = 'viewer'
}

// 사용자 인터페이스
export interface User {
    id: string;
    email: string;
    role: UserRole;
    createdAt: Date;
}

// JWT 페이로드 인터페이스
export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}

// 토큰 블랙리스트 (실제로는 Redis 사용 권장)
const tokenBlacklist = new Set<string>();

/**
 * 비밀번호 해싱
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

/**
 * 비밀번호 검증
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

/**
 * JWT 토큰 생성
 */
export function generateToken(user: User): string {
    const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
    };
    
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
}

/**
 * 리프레시 토큰 생성
 */
export function generateRefreshToken(user: User): string {
    const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
    };
    
    return jwt.sign(payload, JWT_SECRET + '-refresh', {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN
    });
}

/**
 * JWT 토큰 검증
 */
export function verifyToken(token: string): JWTPayload {
    // 블랙리스트 확인
    if (tokenBlacklist.has(token)) {
        throw new Error('Token has been revoked');
    }
    
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

/**
 * 리프레시 토큰 검증
 */
export function verifyRefreshToken(token: string): JWTPayload {
    try {
        return jwt.verify(token, JWT_SECRET + '-refresh') as JWTPayload;
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
}

/**
 * 토큰 블랙리스트에 추가 (로그아웃)
 */
export function revokeToken(token: string): void {
    tokenBlacklist.add(token);
    
    // 만료된 토큰 정리 (24시간 후)
    setTimeout(() => {
        tokenBlacklist.delete(token);
    }, 24 * 60 * 60 * 1000);
}

/**
 * 인증 미들웨어
 */
export function authMiddleware(req: Request & { user?: JWTPayload }, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            error: 'Authentication required',
            message: 'Please provide a valid JWT token'
        });
        return;
    }

    const token = authHeader.substring(7);

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            error: 'Invalid or expired token',
            message: (error as Error).message
        });
        return;
    }
}

/**
 * 역할 기반 접근 제어 미들웨어
 */
export function rbacMiddleware(allowedRoles: UserRole[]) {
    return (req: Request & { user?: JWTPayload }, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }
        
        next();
    };
}

/**
 * OAuth 제공자 인터페이스
 */
export interface OAuthProvider {
    name: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    authorizationUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
}

/**
 * OAuth 설정
 */
export const oauthProviders: Record<string, OAuthProvider> = {
    google: {
        name: 'Google',
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
        authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
    },
    github: {
        name: 'GitHub',
        clientId: process.env.GITHUB_CLIENT_ID || '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/github/callback',
        authorizationUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userInfoUrl: 'https://api.github.com/user'
    }
};

/**
 * 권한 매트릭스
 */
export const permissionMatrix = {
    [UserRole.ADMIN]: [
        'read:all',
        'write:all',
        'delete:all',
        'manage:users',
        'manage:settings'
    ],
    [UserRole.EDITOR]: [
        'read:all',
        'write:own',
        'delete:own',
        'edit:hands',
        'analyze:ai'
    ],
    [UserRole.VIEWER]: [
        'read:public',
        'view:hands',
        'export:data'
    ]
};

/**
 * 권한 확인 헬퍼 함수
 */
export function hasPermission(role: UserRole, permission: string): boolean {
    const permissions = permissionMatrix[role] || [];
    return permissions.includes(permission) || permissions.includes(permission.split(':')[0] + ':all');
}