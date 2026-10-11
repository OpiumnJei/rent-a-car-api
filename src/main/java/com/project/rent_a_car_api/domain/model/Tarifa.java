package com.project.rent_a_car_api.domain.model;

import com.project.rent_a_car_api.domain.result.DomainError;
import com.project.rent_a_car_api.domain.result.Result;

import java.math.BigDecimal;

/**
 * Tarifa por dia asociada a un tipo de vehiculo (RF-01.2, RF-03.2).
 * <p>
 * Por que: entidad separada con flag activo para asegurar un solo costo vigente
 * por tipo; el precio se valida positivo via Result.
 */
public record Tarifa(Long id, Long tipoVehiculoId, BigDecimal precioPorDia, boolean activo) {

    /**
     * Factory validada.
     * Por que: impide tarifas negativas o sin tipo que corromperian el calculo de reserva.
     */
    public static Result<Tarifa> crear(Long id, Long tipoVehiculoId, BigDecimal precioPorDia, boolean activo) {
        if (tipoVehiculoId == null) {
            return Result.fail(DomainError.validation("La tarifa requiere tipo de vehiculo"));
        }
        if (precioPorDia == null || precioPorDia.signum() <= 0) {
            return Result.fail(DomainError.validation("El precio por dia debe ser mayor a cero"));
        }
        return Result.ok(new Tarifa(id, tipoVehiculoId, precioPorDia, activo));
    }
}
