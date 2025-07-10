package com.ideahub.config;

import com.hazelcast.config.Config;
import com.hazelcast.config.MapConfig;
import com.hazelcast.config.EvictionConfig;
import com.hazelcast.config.EvictionPolicy;
import com.hazelcast.config.MaxSizePolicy;
import com.hazelcast.core.Hazelcast;
import com.hazelcast.core.HazelcastInstance;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    @Primary
    public HazelcastInstance hazelcastInstance() {
        Config config = new Config();
        config.setInstanceName("ideahub-cache");
        
        // Configure ideas cache
        MapConfig ideasMapConfig = new MapConfig();
        ideasMapConfig.setName("ideas");
        ideasMapConfig.setTimeToLiveSeconds(3600); // 1 hour
        ideasMapConfig.setMaxIdleSeconds(1800); // 30 minutes
        ideasMapConfig.setEvictionConfig(new EvictionConfig()
            .setEvictionPolicy(EvictionPolicy.LRU)
            .setMaxSizePolicy(MaxSizePolicy.PER_NODE)
            .setSize(10000));
        
        // Configure users cache
        MapConfig usersMapConfig = new MapConfig();
        usersMapConfig.setName("users");
        usersMapConfig.setTimeToLiveSeconds(7200); // 2 hours
        usersMapConfig.setMaxIdleSeconds(3600); // 1 hour
        usersMapConfig.setEvictionConfig(new EvictionConfig()
            .setEvictionPolicy(EvictionPolicy.LRU)
            .setMaxSizePolicy(MaxSizePolicy.PER_NODE)
            .setSize(100000));
        
        // Configure votes cache
        MapConfig votesMapConfig = new MapConfig();
        votesMapConfig.setName("votes");
        votesMapConfig.setTimeToLiveSeconds(1800); // 30 minutes
        votesMapConfig.setMaxIdleSeconds(900); // 15 minutes
        votesMapConfig.setEvictionConfig(new EvictionConfig()
            .setEvictionPolicy(EvictionPolicy.LRU)
            .setMaxSizePolicy(MaxSizePolicy.PER_NODE)
            .setSize(50000));
        
        config.addMapConfig(ideasMapConfig);
        config.addMapConfig(usersMapConfig);
        config.addMapConfig(votesMapConfig);
        
        return Hazelcast.newHazelcastInstance(config);
    }
}