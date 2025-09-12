import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { registerRoutes } from "./routes";
import { registerAuthRoutes } from "./authRoutes";
import { setupVite, serveStatic, log } from "./vite";
import { sanitizeInput, getCSPDirectives, securityHeaders, rateLimitConfigs } from "./security";
import { securityMiddleware, authThreatDetection, getSecurityMetrics } from "./monitoring";
import { auditMiddleware } from "./audit";
import { performanceMiddleware, healthCheck, getPerformanceMetrics } from "./performance";

const app = express();

// Trust proxy for correct IP handling in rate limiting
app.set('trust proxy', 1);

// Compression middleware for performance
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: getCSPDirectives(process.env.NODE_ENV || 'development'),
  } : false, // Disable CSP in development for Vite
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  crossOriginEmbedderPolicy: { policy: "require-corp" },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Set additional security headers
app.use((req, res, next) => {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  next();
});

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.PRODUCTION_DOMAIN || 'https://ideahub.replit.app']
    : ['http://localhost:5000', 'http://127.0.0.1:5000'],
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Enhanced rate limiting with different tiers
const generalLimiter = rateLimit({
  windowMs: rateLimitConfigs.general.windowMs,
  max: rateLimitConfigs.general.max,
  message: {
    error: 'RATE_LIMITED',
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: rateLimitConfigs.auth.windowMs,
  max: rateLimitConfigs.auth.max,
  message: {
    error: 'AUTH_RATE_LIMITED',
    message: 'Too many authentication attempts, please try again later'
  },
});

const apiLimiter = rateLimit({
  windowMs: rateLimitConfigs.api.windowMs,
  max: rateLimitConfigs.api.max,
  message: {
    error: 'API_RATE_LIMITED',
    message: 'API rate limit exceeded, please try again later'
  },
});

// Performance monitoring (must be early in middleware chain)
app.use(performanceMiddleware);

// Security monitoring and threat detection
app.use(securityMiddleware);

// Enhanced rate limiting with threat detection
app.use('/vote/auth', authThreatDetection, authLimiter);
app.use('/vote', apiLimiter);
app.use(generalLimiter);

app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Input sanitization middleware
app.use(sanitizeInput({
  maxStringLength: 50000, // Banking-grade input limits
  maxArrayLength: 50,
  allowedHTMLTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
}));

// Audit logging middleware
app.use(auditMiddleware);

// Monitoring and health endpoints
app.get('/health', healthCheck);
app.get('/vote/health', healthCheck);
app.get('/vote/security/metrics', getSecurityMetrics);
app.get('/vote/performance/metrics', getPerformanceMetrics);

// Basic request logging
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/vote")) {
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  // Register authentication routes
  registerAuthRoutes(app);
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
