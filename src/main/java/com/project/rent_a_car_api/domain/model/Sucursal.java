package com.project.rent_a_car_api.domain.model;

import com.project.rent_a_car_api.domain.result.DomainError;
import com.project.rent_a_car_api.domain.result.Result;

/**
 * Sucursal fisica donde se recogen/devuelven vehiculos (RF-01.1).
 * <p>
 * Por que: record inmutable sin frameworks para cumplir RNF-01 (dominio puro);
 * la validacion retorna Result en vez de lanzar, coherente con Result en todo.
 */
public record Sucursal(Long id, String nombre, String direccion, String telefono, boolean activo) {

    /**
     * Factory validada de sucursal.
     * Por que: garantiza nombre obligatorio desde la creacion.
     */
    public static Result<Sucursal> crear(Long id, String nombre, String direccion, String telefono, boolean activo) {
        if (nombre == null || nombre.isBlank()) {
            return Result.fail(DomainError.validation("El nombre de la sucursal es obligatorio"));
        }
        return Result.ok(new Sucursal(id, nombre.trim(), direccion, telefono, activo));
    }
}
