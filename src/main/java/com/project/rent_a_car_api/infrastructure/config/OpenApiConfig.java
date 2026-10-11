package com.project.rent_a_car_api.infrastructure.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

/**
 * Documentacion OpenAPI 3.0 / Swagger UI con esquema de seguridad JWT.
 */
@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Rent-a-Car API",
                version = "v1",
                description = "Backend del Sistema de Alquiler de Vehiculos: catalogos, clientes, reservas, contratos, inspecciones y facturacion"
        )
)
@SecurityScheme(
        name = "bearer-jwt",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "Token JWT obtenido en POST /api/v1/auth/login. Enviar como: Bearer &lt;token&gt;"
)
public class OpenApiConfig {
}
