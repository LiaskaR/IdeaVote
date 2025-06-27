import type { Request, Response, NextFunction } from 'express';
import { auditLogger } from './audit';

interface SecurityMetrics {
  requestCount: number;
  errorCount: number;
  authFailures: number;
  suspiciousActivity: number;
  lastReset: number;
}

interface ThreatDetection {
  ipAddress: string;
  requestCount: number;
  errorCount: number;
  authFailures: number;
  suspiciousPatterns: string[];
  firstSeen: number;
  lastSeen: number;
  riskScore: number;
}

class SecurityMonitor {
  private metrics: SecurityMetrics = {
    requestCount: 0,
    errorCount: 0,
    authFailures: 0,
    suspiciousActivity: 0,
    lastReset: Date.now(),
  };

  private threats = new Map<string, ThreatDetection>();
  private blockedIPs = new Set<string>();
  private suspiciousPatterns = [
    /\b(union|select|insert|update|delete|drop|create|alter)\b/i, // SQL Injection
    /<script[^>]*>.*?<\/script>/gi, // XSS
    /\b(eval|exec|system|cmd)\s*\(/i, // Code injection
    /\.\.\//g, // Directory traversal
    /\b(administrator|admin|root|test|guest)\b/i, // Common usernames
    /\b(password|passwd|pwd)\b/i, // Password fishing
  ];

  // Anomaly detection thresholds
  private readonly THRESHOLDS = {
    MAX_REQUESTS_PER_MINUTE: 1000,
    MAX_ERRORS_PER_MINUTE: 50,
    MAX_AUTH_FAILURES_PER_MINUTE: 5,
    HIGH_RISK_SCORE: 75,
    CRITICAL_RISK_SCORE: 90,
    BLOCK_DURATION: 60 * 60 * 1000, // 1 hour
  };

  updateMetrics(increment: keyof Omit<SecurityMetrics, 'lastReset'>) {
    this.metrics[increment]++;
    this.resetMetricsIfNeeded();
  }

  private resetMetricsIfNeeded() {
    const oneMinute = 60 * 1000;
    if (Date.now() - this.metrics.lastReset > oneMinute) {
      this.metrics = {
        requestCount: 0,
        errorCount: 0,
        authFailures: 0,
        suspiciousActivity: 0,
        lastReset: Date.now(),
      };
    }
  }

  analyzeThreat(req: Request): ThreatDetection {
    const ip = req.ip || 'unknown';
    const userAgent = req.get('User-Agent') || '';
    const url = req.url;
    const body = JSON.stringify(req.body);
    
    let threat = this.threats.get(ip);
    if (!threat) {
      threat = {
        ipAddress: ip,
        requestCount: 0,
        errorCount: 0,
        authFailures: 0,
        suspiciousPatterns: [],
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        riskScore: 0,
      };
      this.threats.set(ip, threat);
    }

    threat.requestCount++;
    threat.lastSeen = Date.now();

    // Check for suspicious patterns
    const content = `${url} ${userAgent} ${body}`;
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(content)) {
        const patternName = pattern.toString();
        if (!threat.suspiciousPatterns.includes(patternName)) {
          threat.suspiciousPatterns.push(patternName);
        }
      }
    }

    // Calculate risk score
    threat.riskScore = this.calculateRiskScore(threat);

    return threat;
  }

  private calculateRiskScore(threat: ThreatDetection): number {
    let score = 0;

    // High request rate
    const requestRate = threat.requestCount / ((Date.now() - threat.firstSeen) / 60000);
    if (requestRate > 100) score += 30;
    else if (requestRate > 50) score += 15;

    // High error rate
    const errorRate = threat.errorCount / threat.requestCount;
    if (errorRate > 0.5) score += 25;
    else if (errorRate > 0.2) score += 10;

    // Authentication failures
    if (threat.authFailures > 10) score += 40;
    else if (threat.authFailures > 5) score += 20;

    // Suspicious patterns
    score += threat.suspiciousPatterns.length * 10;

    // Time-based factors
    const sessionDuration = Date.now() - threat.firstSeen;
    if (sessionDuration < 5 * 60 * 1000) score += 15; // Very short sessions are suspicious

    return Math.min(score, 100);
  }

  shouldBlockIP(ip: string): boolean {
    return this.blockedIPs.has(ip) || this.isHighRiskIP(ip);
  }

  private isHighRiskIP(ip: string): boolean {
    const threat = this.threats.get(ip);
    return threat ? threat.riskScore >= this.THRESHOLDS.HIGH_RISK_SCORE : false;
  }

  blockIP(ip: string, duration: number = this.THRESHOLDS.BLOCK_DURATION) {
    this.blockedIPs.add(ip);
    setTimeout(() => {
      this.blockedIPs.delete(ip);
    }, duration);
  }

  detectAnomalies(): string[] {
    const anomalies: string[] = [];

    // Check overall metrics
    if (this.metrics.requestCount > this.THRESHOLDS.MAX_REQUESTS_PER_MINUTE) {
      anomalies.push('High request volume detected');
    }

    if (this.metrics.errorCount > this.THRESHOLDS.MAX_ERRORS_PER_MINUTE) {
      anomalies.push('High error rate detected');
    }

    if (this.metrics.authFailures > this.THRESHOLDS.MAX_AUTH_FAILURES_PER_MINUTE) {
      anomalies.push('High authentication failure rate');
    }

    // Check individual IPs
    for (const [ip, threat] of this.threats.entries()) {
      if (threat.riskScore >= this.THRESHOLDS.CRITICAL_RISK_SCORE) {
        anomalies.push(`Critical threat detected from IP: ${ip}`);
        this.blockIP(ip);
      } else if (threat.riskScore >= this.THRESHOLDS.HIGH_RISK_SCORE) {
        anomalies.push(`High risk activity from IP: ${ip}`);
      }
    }

    return anomalies;
  }

  getSecurityReport() {
    const activeThreats = Array.from(this.threats.values())
      .filter(threat => threat.riskScore > 50)
      .sort((a, b) => b.riskScore - a.riskScore);

    return {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      blockedIPs: Array.from(this.blockedIPs),
      activeThreats: activeThreats.slice(0, 10), // Top 10 threats
      totalThreats: this.threats.size,
      anomalies: this.detectAnomalies(),
    };
  }

  cleanup() {
    const oneHour = 60 * 60 * 1000;
    const cutoff = Date.now() - oneHour;

    // Remove old threat data
    for (const [ip, threat] of this.threats.entries()) {
      if (threat.lastSeen < cutoff && threat.riskScore < 50) {
        this.threats.delete(ip);
      }
    }
  }
}

export const securityMonitor = new SecurityMonitor();

// Security monitoring middleware
export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';

  // Check if IP is blocked
  if (securityMonitor.shouldBlockIP(ip)) {
    auditLogger.logSecurityEvent(req, 'BLOCKED_IP_ACCESS', { ip }, 'CRITICAL');
    return res.status(403).json({
      error: 'ACCESS_DENIED',
      message: 'Access denied due to security policy'
    });
  }

  // Analyze threat
  const threat = securityMonitor.analyzeThreat(req);
  
  // Update metrics
  securityMonitor.updateMetrics('requestCount');

  // Log high-risk requests
  if (threat.riskScore >= 70) {
    auditLogger.logSecurityEvent(req, 'HIGH_RISK_REQUEST', {
      riskScore: threat.riskScore,
      suspiciousPatterns: threat.suspiciousPatterns,
      threatData: threat
    }, 'HIGH');
  }

  // Monitor response for errors
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    if (res.statusCode >= 400) {
      securityMonitor.updateMetrics('errorCount');
      threat.errorCount++;
      
      if (res.statusCode === 401 || res.statusCode === 403) {
        securityMonitor.updateMetrics('authFailures');
        threat.authFailures++;
      }
    }
    
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Threat detection for specific endpoints
export const authThreatDetection = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';
  const threat = securityMonitor.analyzeThreat(req);
  
  // If too many auth failures, block temporarily
  if (threat.authFailures >= 5) {
    auditLogger.logSecurityEvent(req, 'BRUTE_FORCE_ATTEMPT', {
      ip,
      authFailures: threat.authFailures,
      riskScore: threat.riskScore
    }, 'CRITICAL');
    
    securityMonitor.blockIP(ip, 15 * 60 * 1000); // 15 minutes
    return res.status(429).json({
      error: 'AUTH_RATE_LIMITED',
      message: 'Too many authentication attempts. Please try again later.'
    });
  }
  
  next();
};

// Real-time monitoring endpoint for dashboards
export const getSecurityMetrics = (req: Request, res: Response) => {
  const report = securityMonitor.getSecurityReport();
  res.json(report);
};

// Cleanup old data every hour
setInterval(() => {
  securityMonitor.cleanup();
}, 60 * 60 * 1000);

// Anomaly detection check every minute
setInterval(() => {
  const anomalies = securityMonitor.detectAnomalies();
  if (anomalies.length > 0) {
    console.warn('Security anomalies detected:', anomalies);
    // In production, this would trigger alerts to security team
  }
}, 60 * 1000);