package com.project.rent_a_car_api.domain.model;

import com.project.rent_a_car_api.domain.result.DomainError;
import com.project.rent_a_car_api.domain.result.Result;

/**
 * Tipo de vehiculo y tarifa asociada (RF-01.2).
 * <p>
 * Por que: separa Tipo (SUV, Sedan) de Tarifa para permitir una sola tarifa activa
 * por tipo, segun exige el SRS.
 */
public record TipoVehiculo(Long id, String nombre, boolean activo) {

    /**
     * Factory validada.
     * Por que: evita tipos sin nombre que romperian la tarifa.
     */
    public static Result<TipoVehiculo> crear(Long id, String nombre, boolean activo) {
        if (nombre == null || nombre.isBlank()) {
            return Result.fail(DomainError.validation("El nombre del tipo de vehiculo es obligatorio"));
        }
        return Result.ok(new TipoVehiculo(id, nombre.trim(), activo));
    }
}
