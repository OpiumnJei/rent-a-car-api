package com.project.rent_a_car_api.domain.model;

import com.project.rent_a_car_api.domain.result.DomainError;
import com.project.rent_a_car_api.domain.result.Result;

/**
 * Empleado con credenciales para la fase de autenticacion (login con username).
 * Por que: username unico + password hasheado (BCrypt 255 chars) + rol + activo
 * para bloquear acceso sin borrar historial; sucursal asignada para operacion.
 */
public record Empleado(Long id, Long sucursalId, String nombre, String username,
                       String password, RolEmpleado rol, boolean activo) {

    /**
     * Factory validada.
     * Por que: nombre, username, password y rol obligatorios; el hash real (BCrypt)
     * lo aplica el servicio antes de persistir en fase auth.
     */
    public static Result<Empleado> crear(Long id, Long sucursalId, String nombre, String username,
                                        String password, RolEmpleado rol, boolean activo) {
        if (sucursalId == null) {
            return Result.fail(DomainError.validation("El empleado requiere sucursal"));
        }
        if (nombre == null || nombre.isBlank()) {
            return Result.fail(DomainError.validation("El nombre del empleado es obligatorio"));
        }
        if (username == null || username.isBlank()) {
            return Result.fail(DomainError.validation("El username es obligatorio"));
        }
        if (password == null || password.isBlank()) {
            return Result.fail(DomainError.validation("El password es obligatorio"));
        }
        if (rol == null) {
            return Result.fail(DomainError.validation("El rol es obligatorio (ADMINISTRADOR, AGENTE, MECANICO)"));
        }
        return Result.ok(new Empleado(id, sucursalId, nombre.trim(), username.trim(), password, rol, activo));
    }
}
