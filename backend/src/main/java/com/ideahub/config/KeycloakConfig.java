package com.ideahub.config;

import org.keycloak.adapters.KeycloakConfigResolver;
import org.keycloak.adapters.springboot.KeycloakSpringBootConfigResolver;
import org.keycloak.adapters.springsecurity.KeycloakConfiguration;
import org.keycloak.adapters.springsecurity.config.KeycloakWebSecurityConfigurerAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.mapping.SimpleAuthorityMapper;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.web.authentication.session.RegisterSessionAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;

@KeycloakConfiguration
public class KeycloakConfig extends KeycloakWebSecurityConfigurerAdapter {
    
    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
        var keycloakAuthProvider = keycloakAuthenticationProvider();
        keycloakAuthProvider.setGrantedAuthoritiesMapper(new SimpleAuthorityMapper());
        auth.authenticationProvider(keycloakAuthProvider);
    }
    
    @Bean
    public KeycloakConfigResolver keycloakConfigResolver() {
        return new KeycloakSpringBootConfigResolver();
    }
    
    @Bean
    @Override
    protected SessionAuthenticationStrategy sessionAuthenticationStrategy() {
        return new RegisterSessionAuthenticationStrategy(new SessionRegistryImpl());
    }
    
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        super.configure(http);
        http
            .cors().and()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests(authz -> authz
                // Public endpoints
                .requestMatchers(HttpMethod.GET, "/health").permitAll()
                .requestMatchers(HttpMethod.GET, "/stats").permitAll()
                .requestMatchers(HttpMethod.GET, "/ideas").permitAll()
                .requestMatchers(HttpMethod.GET, "/ideas/{id}").permitAll()
                .requestMatchers(HttpMethod.GET, "/ideas/{id}/comments").permitAll()
                
                // Protected endpoints - require authentication
                .requestMatchers(HttpMethod.POST, "/ideas").authenticated()
                .requestMatchers(HttpMethod.PUT, "/ideas/{id}").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/ideas/{id}").authenticated()
                .requestMatchers(HttpMethod.POST, "/ideas/{id}/vote").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/ideas/{id}/vote").authenticated()
                .requestMatchers(HttpMethod.POST, "/ideas/{id}/comments").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/comments/{id}").authenticated()
                .requestMatchers("/user/**").authenticated()
                
                // All other requests require authentication
                .anyRequest().authenticated()
            );
    }
}