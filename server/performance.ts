import type { Request, Response, NextFunction } from 'express';

interface PerformanceMetrics {
  requestCount: number;
  averageResponseTime: number;
  slowQueries: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  uptime: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private slowQueryThreshold = 1000; // 1 second
  private metricsWindow = 5 * 60 * 1000; // 5 minutes
  private startTime = Date.now();
  private startCpuUsage = process.cpuUsage();

  recordRequestTime(endpoint: string, duration: number) {
    const key = this.normalizeEndpoint(endpoint);
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    const times = this.metrics.get(key)!;
    times.push(duration);
    
    // Keep only recent measurements
    const cutoff = Date.now() - this.metricsWindow;
    const recentTimes = times.filter(time => time > cutoff);
    this.metrics.set(key, recentTimes);
  }

  private normalizeEndpoint(endpoint: string): string {
    // Normalize dynamic endpoints like /api/ideas/123 to /api/ideas/:id
    return endpoint
      .replace(/\/\d+/g, '/:id')
      .replace(/\/[a-f0-9]{24}/g, '/:id') // MongoDB ObjectIds
      .replace(/\/[0-9a-f-]{36}/g, '/:id'); // UUIDs
  }

  getMetrics(): PerformanceMetrics {
    const now = Date.now();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage(this.startCpuUsage);
    
    let totalRequests = 0;
    let totalTime = 0;
    let slowQueries = 0;
    
    for (const times of this.metrics.values()) {
      totalRequests += times.length;
      for (const time of times) {
        totalTime += time;
        if (time > this.slowQueryThreshold) {
          slowQueries++;
        }
      }
    }
    
    return {
      requestCount: totalRequests,
      averageResponseTime: totalRequests > 0 ? totalTime / totalRequests : 0,
      slowQueries,
      memoryUsage,
      cpuUsage,
      uptime: now - this.startTime,
      timestamp: now,
    };
  }

  getEndpointMetrics(): Record<string, { count: number; avgTime: number; slowCount: number }> {
    const result: Record<string, { count: number; avgTime: number; slowCount: number }> = {};
    
    for (const [endpoint, times] of this.metrics.entries()) {
      const totalTime = times.reduce((sum, time) => sum + time, 0);
      const slowCount = times.filter(time => time > this.slowQueryThreshold).length;
      
      result[endpoint] = {
        count: times.length,
        avgTime: times.length > 0 ? totalTime / times.length : 0,
        slowCount,
      };
    }
    
    return result;
  }

  isHealthy(): boolean {
    const metrics = this.getMetrics();
    
    // Health checks
    const memoryLimit = 512 * 1024 * 1024; // 512MB
    const avgResponseTimeLimit = 500; // 500ms
    const slowQueryPercentageLimit = 0.1; // 10%
    
    if (metrics.memoryUsage.heapUsed > memoryLimit) return false;
    if (metrics.averageResponseTime > avgResponseTimeLimit) return false;
    if (metrics.requestCount > 0 && (metrics.slowQueries / metrics.requestCount) > slowQueryPercentageLimit) return false;
    
    return true;
  }

  cleanup() {
    const cutoff = Date.now() - this.metricsWindow;
    for (const [endpoint, times] of this.metrics.entries()) {
      const recentTimes = times.filter(time => time > cutoff);
      if (recentTimes.length === 0) {
        this.metrics.delete(endpoint);
      } else {
        this.metrics.set(endpoint, recentTimes);
      }
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Performance monitoring middleware
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Store performance data in request object
  (req as any).performanceStart = startTime;
  
  // Use finish event instead of overriding res.end
  res.on('finish', () => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Record performance metrics
    performanceMonitor.recordRequestTime(req.path, duration);
  });
  
  // Set headers early, before response is sent
  res.setHeader('X-Request-ID', `req_${startTime}_${Math.random().toString(36).substr(2, 9)}`);
  
  next();
};

// Health check endpoint
export const healthCheck = (req: Request, res: Response) => {
  const metrics = performanceMonitor.getMetrics();
  const isHealthy = performanceMonitor.isHealthy();
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    metrics: {
      uptime: metrics.uptime,
      memory: {
        used: Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(metrics.memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(metrics.memoryUsage.external / 1024 / 1024),
      },
      cpu: {
        user: Math.round(metrics.cpuUsage.user / 1000),
        system: Math.round(metrics.cpuUsage.system / 1000),
      },
      requests: {
        total: metrics.requestCount,
        averageResponseTime: Math.round(metrics.averageResponseTime),
        slowQueries: metrics.slowQueries,
      },
    },
    endpoints: performanceMonitor.getEndpointMetrics(),
  });
};

// Performance metrics endpoint
export const getPerformanceMetrics = (req: Request, res: Response) => {
  const metrics = performanceMonitor.getMetrics();
  const endpointMetrics = performanceMonitor.getEndpointMetrics();
  
  res.json({
    timestamp: new Date().toISOString(),
    overall: metrics,
    endpoints: endpointMetrics,
    health: performanceMonitor.isHealthy(),
  });
};

// Database connection pool optimization
export const optimizeDatabase = () => {
  if (process.env.DATABASE_URL) {
    return {
      host: process.env.PGHOST,
      port: parseInt(process.env.PGPORT || '5432'),
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // 30 seconds
      connectionTimeoutMillis: 2000, // 2 seconds
      statement_timeout: 10000, // 10 seconds
      query_timeout: 10000, // 10 seconds
      application_name: 'ideahub_banking',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  }
  return null;
};

// Cleanup old metrics every 5 minutes
setInterval(() => {
  performanceMonitor.cleanup();
}, 5 * 60 * 1000);