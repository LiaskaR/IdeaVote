# Production Deployment Guide for 1 Billion Users

## Architecture Overview

The IdeaHub Java 21 Spring Boot backend is designed to handle 1 billion users with enterprise-grade scalability:

### Key Features
- **Java 21 Spring Boot 3.2.1** - Latest LTS with virtual threads support
- **Keycloak Authentication** - OAuth2 JWT with role-based access control
- **Distributed Caching** - Hazelcast for multi-node cache sharing
- **Circuit Breakers** - Resilience4j for fault tolerance
- **Rate Limiting** - Per-endpoint limits to prevent abuse
- **Connection Pooling** - Optimized HikariCP with 100 connections per node
- **Monitoring** - Prometheus metrics and health endpoints
- **Database Optimization** - PostgreSQL with read replicas

## Performance Configuration

### Application Server (Tomcat)
- **Max Threads**: 400 per instance
- **Max Connections**: 10,000 concurrent
- **Connection Timeout**: 30 seconds
- **Compression**: Enabled for responses > 1KB

### Database (PostgreSQL)
- **Connection Pool**: 100 max, 20 min idle
- **Query Optimization**: Prepared statement caching
- **Read Replicas**: Automatic read/write splitting
- **Connection Timeout**: 30 seconds

### Caching Strategy
- **L1 Cache**: Local Hazelcast maps (10K entries per node)
- **L2 Cache**: Redis for session storage
- **TTL Configuration**:
  - Ideas: 1 hour (high read volume)
  - Users: 2 hours (profile data)
  - Votes: 30 minutes (frequently updated)

### Rate Limiting
- **Read Operations**: 1,000 requests/minute per user
- **Write Operations**: 100 requests/minute per user
- **Vote Operations**: 500 requests/minute per user
- **Comment Operations**: 200 requests/minute per user

## Deployment Strategy

### Horizontal Scaling
1. **Load Balancer**: NGINX with sticky sessions
2. **Application Instances**: 50+ nodes behind LB
3. **Database Cluster**: Master + 5 read replicas
4. **Cache Cluster**: 3-node Hazelcast cluster
5. **Message Queue**: Redis Pub/Sub for real-time updates

### Container Configuration
```yaml
resources:
  requests:
    memory: "2Gi"
    cpu: "1000m"
  limits:
    memory: "4Gi"
    cpu: "2000m"
```

### JVM Tuning
```bash
-Xmx2g -Xms1g
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:+UseStringDeduplication
-XX:+OptimizeStringConcat
```

## Security Configuration

### Keycloak Integration
- **JWT Validation**: RS256 signature verification
- **Role-Based Access**: USER, ADMIN roles
- **Token Expiration**: 24 hours with refresh
- **Session Management**: Stateless JWT approach

### API Security
- **CORS**: Configured for production domains
- **Rate Limiting**: Per-user and global limits
- **Input Validation**: Bean validation on all endpoints
- **Circuit Breakers**: Prevent cascade failures

## Monitoring & Observability

### Health Endpoints
- `/actuator/health` - Application health
- `/api/admin/health` - Detailed system health
- `/api/admin/metrics` - Performance metrics
- `/api/admin/cache/stats` - Cache statistics

### Metrics Collection
- **Prometheus**: Application and JVM metrics
- **Micrometer**: Custom business metrics
- **Grafana**: Real-time dashboards
- **AlertManager**: Automated alerting

### Key Metrics to Monitor
- Request throughput (RPS)
- Response latencies (P95, P99)
- Cache hit ratios
- Database connection pool usage
- JVM memory and GC metrics
- Circuit breaker states

## Database Optimization

### Connection Pool Settings
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 100
      minimum-idle: 20
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

### Query Optimization
- **Batch Processing**: 50 records per batch
- **Connection Caching**: Prepared statements cached
- **Index Strategy**: Covering indexes for common queries
- **Partitioning**: Time-based partitioning for large tables

## High Availability

### Failover Strategy
1. **Application**: Auto-scaling groups with health checks
2. **Database**: Automatic failover to read replicas
3. **Cache**: Distributed cluster with replication
4. **Load Balancer**: Multi-AZ deployment

### Backup Strategy
- **Database**: Point-in-time recovery (PITR)
- **Application**: Blue-green deployments
- **Configuration**: GitOps with rollback capability

## API Documentation

Access comprehensive API documentation at:
- **Swagger UI**: `/swagger-ui.html`
- **OpenAPI Spec**: `/v3/api-docs`

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string
- `KEYCLOAK_ISSUER_URI`: Keycloak realm issuer
- `REDIS_HOST`: Redis cache host
- `JWT_SECRET`: JWT signing secret (32+ chars)

### Optional
- `CORS_ORIGINS`: Allowed CORS origins
- `LOG_LEVEL`: Application log level
- `CACHE_TTL`: Cache time-to-live settings