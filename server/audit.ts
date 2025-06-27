import fs from 'fs/promises';
import path from 'path';
import type { Request, Response, NextFunction } from 'express';

export interface AuditEvent {
  timestamp: string;
  eventId: string;
  userId?: number;
  username?: string;
  sessionId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  method: string;
  endpoint: string;
  status: 'SUCCESS' | 'FAILURE' | 'ERROR';
  statusCode: number;
  details?: Record<string, any>;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  compliance: {
    pciDss: boolean;
    sox: boolean;
    gdpr: boolean;
  };
}

class AuditLogger {
  private logDirectory = path.join(process.cwd(), 'logs', 'audit');
  private maxLogFiles = 365; // Keep logs for 1 year (banking requirement)
  private maxFileSize = 100 * 1024 * 1024; // 100MB per file

  constructor() {
    this.ensureLogDirectory();
  }

  private async ensureLogDirectory() {
    try {
      await fs.mkdir(this.logDirectory, { recursive: true });
    } catch (error) {
      console.error('Failed to create audit log directory:', error);
    }
  }

  private getLogFileName(date: Date = new Date()): string {
    const dateStr = date.toISOString().split('T')[0];
    return path.join(this.logDirectory, `audit-${dateStr}.log`);
  }

  private async rotateLogIfNeeded(filePath: string) {
    try {
      const stats = await fs.stat(filePath);
      if (stats.size > this.maxFileSize) {
        const timestamp = Date.now();
        const newPath = filePath.replace('.log', `-${timestamp}.log`);
        await fs.rename(filePath, newPath);
      }
    } catch (error) {
      // File doesn't exist yet, which is fine
    }
  }

  private async cleanupOldLogs() {
    try {
      const files = await fs.readdir(this.logDirectory);
      const logFiles = files
        .filter(file => file.startsWith('audit-') && file.endsWith('.log'))
        .sort()
        .reverse();

      if (logFiles.length > this.maxLogFiles) {
        const filesToDelete = logFiles.slice(this.maxLogFiles);
        for (const file of filesToDelete) {
          await fs.unlink(path.join(this.logDirectory, file));
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old audit logs:', error);
    }
  }

  async logEvent(event: Omit<AuditEvent, 'timestamp' | 'eventId'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      eventId: this.generateEventId(),
    };

    const logEntry = JSON.stringify(auditEvent) + '\n';
    const logFile = this.getLogFileName();

    try {
      await this.rotateLogIfNeeded(logFile);
      await fs.appendFile(logFile, logEntry, 'utf8');
      
      // Log critical events to console as well
      if (event.riskLevel === 'CRITICAL') {
        console.error('CRITICAL AUDIT EVENT:', auditEvent);
      }
    } catch (error) {
      console.error('Failed to write audit log:', error);
      // In production, this should trigger an alert
    }
  }

  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Banking-specific audit events
  async logAuthenticationAttempt(req: Request, success: boolean, userId?: number, username?: string) {
    await this.logEvent({
      userId,
      username,
      action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILURE',
      resourceType: 'AUTHENTICATION',
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      method: req.method,
      endpoint: req.path,
      status: success ? 'SUCCESS' : 'FAILURE',
      statusCode: success ? 200 : 401,
      riskLevel: success ? 'LOW' : 'MEDIUM',
      compliance: { pciDss: true, sox: true, gdpr: true },
    });
  }

  async logDataAccess(req: Request, resourceType: string, resourceId: string, userId?: number) {
    await this.logEvent({
      userId,
      action: 'DATA_ACCESS',
      resourceType: resourceType.toUpperCase(),
      resourceId,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      method: req.method,
      endpoint: req.path,
      status: 'SUCCESS',
      statusCode: 200,
      riskLevel: 'LOW',
      compliance: { pciDss: true, sox: true, gdpr: true },
    });
  }

  async logDataModification(req: Request, resourceType: string, resourceId: string, userId?: number, changes?: Record<string, any>) {
    await this.logEvent({
      userId,
      action: 'DATA_MODIFICATION',
      resourceType: resourceType.toUpperCase(),
      resourceId,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      method: req.method,
      endpoint: req.path,
      status: 'SUCCESS',
      statusCode: 200,
      details: changes,
      riskLevel: 'MEDIUM',
      compliance: { pciDss: true, sox: true, gdpr: true },
    });
  }

  async logSecurityEvent(req: Request, eventType: string, details: Record<string, any>, riskLevel: AuditEvent['riskLevel'] = 'HIGH') {
    await this.logEvent({
      action: `SECURITY_${eventType.toUpperCase()}`,
      resourceType: 'SECURITY',
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      method: req.method,
      endpoint: req.path,
      status: 'ERROR',
      statusCode: 403,
      details,
      riskLevel,
      compliance: { pciDss: true, sox: true, gdpr: true },
    });
  }

  async logApiRequest(req: Request, res: Response, userId?: number, sessionId?: string) {
    const riskLevel = this.determineRiskLevel(req, res);
    
    await this.logEvent({
      userId,
      sessionId,
      action: 'API_REQUEST',
      resourceType: 'API',
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      method: req.method,
      endpoint: req.path,
      status: res.statusCode >= 400 ? 'ERROR' : 'SUCCESS',
      statusCode: res.statusCode,
      riskLevel,
      compliance: { pciDss: true, sox: true, gdpr: true },
    });
  }

  private determineRiskLevel(req: Request, res: Response): AuditEvent['riskLevel'] {
    // Authentication endpoints are always medium risk
    if (req.path.includes('/auth')) return 'MEDIUM';
    
    // Admin endpoints are high risk
    if (req.path.includes('/admin')) return 'HIGH';
    
    // Failed requests are higher risk
    if (res.statusCode >= 400) return 'HIGH';
    
    // Modification operations are medium risk
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return 'MEDIUM';
    
    return 'LOW';
  }
}

export const auditLogger = new AuditLogger();

// Audit middleware
export const auditMiddleware = (req: Request & { user?: any, sessionId?: string }, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Capture response finish to log the complete request
  res.on('finish', () => {
    // Log the API request with timing
    auditLogger.logApiRequest(req, res, req.user?.userId, req.sessionId).catch(console.error);
  });
  
  next();
};

// Cleanup old logs daily
setInterval(() => {
  auditLogger['cleanupOldLogs']().catch(console.error);
}, 24 * 60 * 60 * 1000);