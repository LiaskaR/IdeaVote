import Redis from 'redis';
import type { Request, Response, NextFunction } from 'express';

interface SessionData {
  userId: number;
  username: string;
  email: string;
  role: string;
  lastActivity: number;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

class SessionManager {
  private redis: ReturnType<typeof Redis.createClient> | null = null;
  private inMemoryStore = new Map<string, SessionData>();
  private useRedis = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      // Try to connect to Redis if available
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.redis = Redis.createClient({ url: redisUrl });
      
      this.redis.on('error', (err) => {
        console.warn('Redis connection error, falling back to in-memory sessions:', err.message);
        this.useRedis = false;
      });

      await this.redis.connect();
      this.useRedis = true;
      console.log('Connected to Redis for session management');
    } catch (error) {
      console.warn('Redis not available, using in-memory session store');
      this.useRedis = false;
    }
  }

  async createSession(sessionId: string, data: Omit<SessionData, 'lastActivity' | 'isActive'>): Promise<void> {
    const sessionData: SessionData = {
      ...data,
      lastActivity: Date.now(),
      isActive: true,
    };

    if (this.useRedis && this.redis) {
      await this.redis.setEx(`session:${sessionId}`, 3600 * 24, JSON.stringify(sessionData)); // 24 hours
    } else {
      this.inMemoryStore.set(sessionId, sessionData);
    }
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    if (this.useRedis && this.redis) {
      const data = await this.redis.get(`session:${sessionId}`);
      return data ? JSON.parse(data) : null;
    } else {
      return this.inMemoryStore.get(sessionId) || null;
    }
  }

  async updateSession(sessionId: string, updates: Partial<SessionData>): Promise<void> {
    const existingSession = await this.getSession(sessionId);
    if (!existingSession) return;

    const updatedSession = { ...existingSession, ...updates, lastActivity: Date.now() };

    if (this.useRedis && this.redis) {
      await this.redis.setEx(`session:${sessionId}`, 3600 * 24, JSON.stringify(updatedSession));
    } else {
      this.inMemoryStore.set(sessionId, updatedSession);
    }
  }

  async destroySession(sessionId: string): Promise<void> {
    if (this.useRedis && this.redis) {
      await this.redis.del(`session:${sessionId}`);
    } else {
      this.inMemoryStore.delete(sessionId);
    }
  }

  async destroyAllUserSessions(userId: number): Promise<void> {
    if (this.useRedis && this.redis) {
      const keys = await this.redis.keys('session:*');
      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const session: SessionData = JSON.parse(data);
          if (session.userId === userId) {
            await this.redis.del(key);
          }
        }
      }
    } else {
      for (const [sessionId, session] of this.inMemoryStore.entries()) {
        if (session.userId === userId) {
          this.inMemoryStore.delete(sessionId);
        }
      }
    }
  }

  async isSessionValid(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session || !session.isActive) return false;

    // Check if session is expired (inactive for more than 24 hours)
    const maxInactiveTime = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - session.lastActivity > maxInactiveTime) {
      await this.destroySession(sessionId);
      return false;
    }

    return true;
  }

  async cleanupExpiredSessions(): Promise<void> {
    const maxInactiveTime = 24 * 60 * 60 * 1000; // 24 hours
    const now = Date.now();

    if (this.useRedis && this.redis) {
      const keys = await this.redis.keys('session:*');
      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const session: SessionData = JSON.parse(data);
          if (now - session.lastActivity > maxInactiveTime) {
            await this.redis.del(key);
          }
        }
      }
    } else {
      for (const [sessionId, session] of this.inMemoryStore.entries()) {
        if (now - session.lastActivity > maxInactiveTime) {
          this.inMemoryStore.delete(sessionId);
        }
      }
    }
  }

  async getActiveSessions(userId: number): Promise<SessionData[]> {
    const sessions: SessionData[] = [];

    if (this.useRedis && this.redis) {
      const keys = await this.redis.keys('session:*');
      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const session: SessionData = JSON.parse(data);
          if (session.userId === userId && session.isActive) {
            sessions.push(session);
          }
        }
      }
    } else {
      for (const session of this.inMemoryStore.values()) {
        if (session.userId === userId && session.isActive) {
          sessions.push(session);
        }
      }
    }

    return sessions;
  }
}

export const sessionManager = new SessionManager();

// Middleware to validate session
export const validateSession = async (req: Request & { sessionId?: string }, res: Response, next: NextFunction) => {
  const sessionId = req.headers['x-session-id'] as string || req.sessionId;
  
  if (!sessionId) {
    return res.status(401).json({
      error: 'SESSION_REQUIRED',
      message: 'Session ID required'
    });
  }

  const isValid = await sessionManager.isSessionValid(sessionId);
  if (!isValid) {
    return res.status(401).json({
      error: 'SESSION_INVALID',
      message: 'Session expired or invalid'
    });
  }

  // Update last activity
  await sessionManager.updateSession(sessionId, { lastActivity: Date.now() });
  req.sessionId = sessionId;
  next();
};

// Cleanup expired sessions every hour
setInterval(() => {
  sessionManager.cleanupExpiredSessions().catch(console.error);
}, 60 * 60 * 1000);