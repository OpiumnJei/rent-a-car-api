package com.project.rent_a_car_api.application.ports.inbound;

import com.project.rent_a_car_api.domain.model.Reserva;
import com.project.rent_a_car_api.domain.result.Result;

import java.time.LocalDate;

/**
 * Caso de uso de reservas (RF-03).
 * Por que: valida disponibilidad, licencia vigente y tarifa activa
 * antes de persistir; retorna Result para mapear a 400/404/409.
 */
public interface ReservaUseCase {
    Result<Reserva> crear(Long clienteId, Long vehiculoId, Long licenciaId, LocalDate inicio, LocalDate fin);
}
