package com.project.rent_a_car_api.domain.model;

import com.project.rent_a_car_api.domain.result.DomainError;
import com.project.rent_a_car_api.domain.result.Result;

/**
 * Cliente identificado por cedula/pasaporte (RF-02.1).
 * <p>
 * Por que: documento unico como invariante para alta y consulta.
 */
public record Cliente(Long id, String documento, String nombre, String apellido, String email, String telefono, boolean activo) {

    /**
     * Factory validada.
     * Por que: documento y nombre obligatorios evitan clientes fantasma en reservas.
     */
    public static Result<Cliente> crear(Long id, String documento, String nombre, String apellido, String email, String telefono, boolean activo) {
        if (documento == null || documento.isBlank()) {
            return Result.fail(DomainError.validation("El documento del cliente es obligatorio"));
        }
        if (nombre == null || nombre.isBlank()) {
            return Result.fail(DomainError.validation("El nombre del cliente es obligatorio"));
        }
        return Result.ok(new Cliente(id, documento.trim(), nombre.trim(),
                apellido, email, telefono, activo));
    }
}
