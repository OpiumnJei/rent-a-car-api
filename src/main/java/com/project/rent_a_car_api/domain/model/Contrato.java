package com.project.rent_a_car_api.domain.model;

import com.project.rent_a_car_api.domain.result.DomainError;
import com.project.rent_a_car_api.domain.result.Result;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Contrato generado desde una reserva confirmada (RF-04.1).
 * <p>
 * Por que: fija empleado responsable, garantia y total estimado; una reserva
 * solo genera un contrato (unicidad reserva_id).
 */
public record Contrato(Long id, Long reservaId, Long empleadoId, BigDecimal montoGarantia,
                       BigDecimal totalEstimado, EstadoContrato estado, LocalDateTime fechaCreacion) {

    /**
     * Factory validada.
     * Por que: reserva y empleado obligatorios para trazabilidad operativa.
     */
    public static Result<Contrato> crear(Long id, Long reservaId, Long empleadoId, BigDecimal montoGarantia,
                                         BigDecimal totalEstimado, EstadoContrato estado, LocalDateTime fechaCreacion) {
        if (reservaId == null) {
            return Result.fail(DomainError.validation("El contrato requiere reserva"));
        }
        if (empleadoId == null) {
            return Result.fail(DomainError.validation("El contrato requiere empleado responsable"));
        }
        return Result.ok(new Contrato(id, reservaId, empleadoId, montoGarantia, totalEstimado,
                estado == null ? EstadoContrato.ACTIVO : estado, fechaCreacion));
    }
}
