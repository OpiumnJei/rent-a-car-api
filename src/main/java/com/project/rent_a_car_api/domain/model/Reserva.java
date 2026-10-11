package com.project.rent_a_car_api.domain.model;

import com.project.rent_a_car_api.domain.result.DomainError;
import com.project.rent_a_car_api.domain.result.Result;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Reserva que vincula cliente, vehiculo, licencia y fechas (RF-03.1).
 * <p>
 * Por que: la invariante fechaInicio menor o igual a fechaFin se valida aqui
 * para fallar rapido con Result antes de tocar persistencia.
 */
public record Reserva(Long id, Long clienteId, Long vehiculoId, Long licenciaId,
                      LocalDate fechaInicio, LocalDate fechaFin, EstadoReserva estado, BigDecimal totalEstimado) {

    /**
     * Factory validada.
     * Por que: evita reservas sin actores o con rango invertido.
     */
    public static Result<Reserva> crear(Long id, Long clienteId, Long vehiculoId, Long licenciaId,
                                        LocalDate fechaInicio, LocalDate fechaFin, EstadoReserva estado, BigDecimal totalEstimado) {
        if (clienteId == null || vehiculoId == null || licenciaId == null) {
            return Result.fail(DomainError.validation("La reserva requiere cliente, vehiculo y licencia"));
        }
        if (fechaInicio == null || fechaFin == null) {
            return Result.fail(DomainError.validation("La reserva requiere rango de fechas"));
        }
        if (fechaFin.isBefore(fechaInicio)) {
            return Result.fail(DomainError.validation("La fecha fin no puede ser anterior al inicio"));
        }
        return Result.ok(new Reserva(id, clienteId, vehiculoId, licenciaId, fechaInicio, fechaFin,
                estado == null ? EstadoReserva.CONFIRMADA : estado, totalEstimado));
    }
}
