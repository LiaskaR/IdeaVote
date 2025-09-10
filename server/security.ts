import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import type { Request, Response, NextFunction } from 'express';

// Setup DOMPurify for server-side use
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

export interface SecurityConfig {
  maxStringLength: number;
  maxArrayLength: number;
  allowedHTMLTags: string[];
  blockedPatterns: RegExp[];
}

const defaultConfig: SecurityConfig = {
  maxStringLength: 10000,
  maxArrayLength: 100,
  allowedHTMLTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
  blockedPatterns: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript URLs
    /on\w+\s*=/gi, // Event handlers
    /data:text\/html/gi, // Data URLs
    /vbscript:/gi, // VBScript
  ]
};

// Sanitize string content
export function sanitizeString(input: string, config: SecurityConfig = defaultConfig): string {
  if (typeof input !== 'string') return '';
  
  // Check length limits
  if (input.length > config.maxStringLength) {
    throw new Error(`String length exceeds maximum of ${config.maxStringLength} characters`);
  }
  
  // Check for blocked patterns
  for (const pattern of config.blockedPatterns) {
    if (pattern.test(input)) {
      throw new Error('Input contains potentially dangerous content');
    }
  }
  
  // Sanitize HTML content
  return purify.sanitize(input, {
    ALLOWED_TAGS: config.allowedHTMLTags,
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

// Recursively sanitize object properties
export function sanitizeObject(obj: any, config: SecurityConfig = defaultConfig): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj, config);
  }
  
  if (Array.isArray(obj)) {
    if (obj.length > config.maxArrayLength) {
      throw new Error(`Array length exceeds maximum of ${config.maxArrayLength} items`);
    }
    return obj.map(item => sanitizeObject(item, config));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeString(key, config);
      sanitized[sanitizedKey] = sanitizeObject(value, config);
    }
    return sanitized;
  }
  
  return obj;
}

// Input sanitization middleware
export const sanitizeInput = (config: Partial<SecurityConfig> = {}) => {
  const fullConfig = { ...defaultConfig, ...config };
  
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body) {
        req.body = sanitizeObject(req.body, fullConfig);
      }
      
      if (req.query) {
        req.query = sanitizeObject(req.query, fullConfig);
      }
      
      if (req.params) {
        req.params = sanitizeObject(req.params, fullConfig);
      }
      
      next();
    } catch (error) {
      res.status(400).json({
        error: 'INVALID_INPUT',
        message: error instanceof Error ? error.message : 'Invalid input detected'
      });
    }
  };
};

// Content Security Policy configuration
export const getCSPDirectives = (env: string) => {
  const baseDirectives: Record<string, string[]> = {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:", "blob:"],
    connectSrc: ["'self'"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    workerSrc: ["'self'"],
    childSrc: ["'none'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: [],
  };
  
  if (env === 'development') {
    baseDirectives.connectSrc.push('http://localhost:*');
    baseDirectives.scriptSrc = ["'self'", "'unsafe-inline'", "'unsafe-eval'"];
  } else {
    baseDirectives.scriptSrc = ["'self'"];
  }
  
  return baseDirectives;
};

// Rate limiting configurations for different endpoints
export const rateLimitConfigs = {
  auth: { windowMs: 15 * 60 * 1000, max: 500 }, // 5 attempts per 15 minutes
  api: { windowMs: 15 * 60 * 1000, max: 10000 }, // 1000 requests per 15 minutes
  upload: { windowMs: 60 * 60 * 1000, max: 1000 }, // 10 uploads per hour
  general: { windowMs: 15 * 60 * 1000, max: 1000 }, // 100 requests per 15 minutes
};

// Security headers configuration
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};