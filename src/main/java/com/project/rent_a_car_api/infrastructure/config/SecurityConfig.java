package com.project.rent_a_car_api.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Seguridad temporal permisiva.
 * Por que: el usuario pidio auth al final; para tener algo funcional ahora
 * se permite todo sin JWT. En la fase de auth se restringira por roles
 * ADMINISTRADOR/AGENTE/MECANICO segun SRS RNF-03.
 */
@Configuration
public class SecurityConfig {

    /**
     * Cadena de filtros que autoriza todo.
     * Por que: evita el login por defecto de Spring Security y desactiva CSRF
     * para API stateless; se endurecera al implementar JWT.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    /**
     * Codificador BCrypt para passwords de empleado.
     * Por que del cambio: EMPLEADO.password es NVARCHAR(255) para hash BCrypt;
     * se expone desde ya para que el alta deje claves listas para el login JWT (fase auth).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
