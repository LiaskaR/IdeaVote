import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: number;
  username: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

// Generate JWT tokens
export const generateTokens = (user: { id: number; username: string; email: string; role: string }) => {
  const accessToken = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    {
      userId: user.id,
      type: 'refresh',
    },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Verify password
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Verify JWT token
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

// Authentication middleware
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'UNAUTHORIZED',
        message: 'Access token required' 
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({ 
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired token' 
      });
    }

    // Verify user still exists and is active
    const user = await storage.getUser(payload.userId);
    if (!user || user.isActive !== 'true') {
      return res.status(401).json({ 
        error: 'USER_INACTIVE',
        message: 'User account is inactive' 
      });
    }

    req.user = payload;
    next();
  } catch (error) {
    return res.status(500).json({ 
      error: 'AUTH_ERROR',
      message: 'Authentication failed' 
    });
  }
};

// Role-based authorization middleware
export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'UNAUTHORIZED',
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'FORBIDDEN',
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

// Rate limiting by user
export const rateLimitByUser = new Map<number, { count: number; resetTime: number }>();

export const userRateLimit = (maxRequests: number, windowMs: number) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(); // Let authentication middleware handle this
    }

    const userId = req.user.userId;
    const now = Date.now();
    const userLimit = rateLimitByUser.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      rateLimitByUser.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
      });
    }

    userLimit.count++;
    next();
  };
};