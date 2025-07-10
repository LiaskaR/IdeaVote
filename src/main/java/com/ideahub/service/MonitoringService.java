package com.ideahub.service;

import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.RuntimeMXBean;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@Service
public class MonitoringService {
    
    @Autowired
    private DataSource dataSource;
    
    @Autowired
    private HazelcastInstance hazelcastInstance;
    
    @Autowired
    private CacheManager cacheManager;
    
    public Map<String, Object> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        
        // Database health
        health.put("database", checkDatabaseHealth());
        
        // Memory health
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        Map<String, Object> memory = new HashMap<>();
        memory.put("heap_used", memoryBean.getHeapMemoryUsage().getUsed() / 1024 / 1024 + " MB");
        memory.put("heap_max", memoryBean.getHeapMemoryUsage().getMax() / 1024 / 1024 + " MB");
        memory.put("non_heap_used", memoryBean.getNonHeapMemoryUsage().getUsed() / 1024 / 1024 + " MB");
        health.put("memory", memory);
        
        // JVM health
        RuntimeMXBean runtimeBean = ManagementFactory.getRuntimeMXBean();
        Map<String, Object> jvm = new HashMap<>();
        jvm.put("uptime", runtimeBean.getUptime() / 1000 / 60 + " minutes");
        jvm.put("threads", ManagementFactory.getThreadMXBean().getThreadCount());
        health.put("jvm", jvm);
        
        // Cache health
        health.put("cache", getCacheHealth());
        
        return health;
    }
    
    public Map<String, Object> getSystemMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        // JVM metrics
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        RuntimeMXBean runtimeBean = ManagementFactory.getRuntimeMXBean();
        
        metrics.put("heap_memory_used", memoryBean.getHeapMemoryUsage().getUsed());
        metrics.put("heap_memory_max", memoryBean.getHeapMemoryUsage().getMax());
        metrics.put("non_heap_memory_used", memoryBean.getNonHeapMemoryUsage().getUsed());
        metrics.put("uptime", runtimeBean.getUptime());
        metrics.put("thread_count", ManagementFactory.getThreadMXBean().getThreadCount());
        
        // Cache metrics
        metrics.put("cache_stats", getCacheStatistics());
        
        return metrics;
    }
    
    public Map<String, Object> getCacheStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            IMap<Object, Object> ideasMap = hazelcastInstance.getMap("ideas");
            IMap<Object, Object> usersMap = hazelcastInstance.getMap("users");
            IMap<Object, Object> votesMap = hazelcastInstance.getMap("votes");
            
            Map<String, Object> ideasStats = new HashMap<>();
            ideasStats.put("size", ideasMap.size());
            ideasStats.put("owned_entry_count", ideasMap.getLocalMapStats().getOwnedEntryCount());
            ideasStats.put("hits", ideasMap.getLocalMapStats().getHits());
            ideasStats.put("misses", 0);
            
            Map<String, Object> usersStats = new HashMap<>();
            usersStats.put("size", usersMap.size());
            usersStats.put("owned_entry_count", usersMap.getLocalMapStats().getOwnedEntryCount());
            usersStats.put("hits", usersMap.getLocalMapStats().getHits());
            usersStats.put("misses", 0);
            
            Map<String, Object> votesStats = new HashMap<>();
            votesStats.put("size", votesMap.size());
            votesStats.put("owned_entry_count", votesMap.getLocalMapStats().getOwnedEntryCount());
            votesStats.put("hits", votesMap.getLocalMapStats().getHits());
            votesStats.put("misses", 0);
            
            stats.put("ideas", ideasStats);
            stats.put("users", usersStats);
            stats.put("votes", votesStats);
            
        } catch (Exception e) {
            stats.put("error", "Failed to get cache statistics: " + e.getMessage());
        }
        
        return stats;
    }
    
    public void clearAllCaches() {
        try {
            hazelcastInstance.getMap("ideas").clear();
            hazelcastInstance.getMap("users").clear();
            hazelcastInstance.getMap("votes").clear();
        } catch (Exception e) {
            throw new RuntimeException("Failed to clear caches", e);
        }
    }
    
    public Map<String, Object> getUserActivity() {
        Map<String, Object> activity = new HashMap<>();
        
        // This would typically be calculated from actual user activity data
        // For now, returning basic statistics
        activity.put("active_users_last_hour", 0);
        activity.put("active_users_last_24h", 0);
        activity.put("total_sessions", 0);
        activity.put("avg_session_duration", "0 minutes");
        
        return activity;
    }
    
    private Map<String, Object> checkDatabaseHealth() {
        Map<String, Object> dbHealth = new HashMap<>();
        
        try (Connection connection = dataSource.getConnection()) {
            dbHealth.put("status", "UP");
            dbHealth.put("database", connection.getMetaData().getDatabaseProductName());
            dbHealth.put("version", connection.getMetaData().getDatabaseProductVersion());
            dbHealth.put("driver", connection.getMetaData().getDriverName());
        } catch (SQLException e) {
            dbHealth.put("status", "DOWN");
            dbHealth.put("error", e.getMessage());
        }
        
        return dbHealth;
    }
    
    private Map<String, Object> getCacheHealth() {
        Map<String, Object> cacheHealth = new HashMap<>();
        
        try {
            cacheHealth.put("status", "UP");
            cacheHealth.put("cluster_size", hazelcastInstance.getCluster().getMembers().size());
            cacheHealth.put("cluster_state", hazelcastInstance.getCluster().getClusterState().name());
        } catch (Exception e) {
            cacheHealth.put("status", "DOWN");
            cacheHealth.put("error", e.getMessage());
        }
        
        return cacheHealth;
    }
}