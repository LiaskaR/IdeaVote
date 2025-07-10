package com.ideahub.controller;

import com.ideahub.service.MonitoringService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    @Autowired
    private MonitoringService monitoringService;
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        Map<String, Object> health = monitoringService.getSystemHealth();
        return ResponseEntity.ok(health);
    }
    
    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        Map<String, Object> metrics = monitoringService.getSystemMetrics();
        return ResponseEntity.ok(metrics);
    }
    
    @GetMapping("/cache/stats")
    public ResponseEntity<Map<String, Object>> getCacheStats() {
        Map<String, Object> stats = monitoringService.getCacheStatistics();
        return ResponseEntity.ok(stats);
    }
    
    @PostMapping("/cache/clear")
    public ResponseEntity<Map<String, String>> clearCaches() {
        monitoringService.clearAllCaches();
        return ResponseEntity.ok(Map.of("status", "success", "message", "All caches cleared"));
    }
    
    @GetMapping("/users/activity")
    public ResponseEntity<Map<String, Object>> getUserActivity() {
        Map<String, Object> activity = monitoringService.getUserActivity();
        return ResponseEntity.ok(activity);
    }
}