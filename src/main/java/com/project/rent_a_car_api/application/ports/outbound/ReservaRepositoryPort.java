package com.project.rent_a_car_api.application.ports.outbound;

import com.project.rent_a_car_api.domain.model.Reserva;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Puerto de salida para reservas (RF-03).
 * Por que: expone solape de fechas para validar disponibilidad (RF-03.2).
 */
public interface ReservaRepositoryPort {
    Reserva guardar(Reserva reserva);

    Optional<Reserva> buscarPorId(Long id);

    List<Reserva> listarPorVehiculo(Long vehiculoId);

    boolean existeSolape(Long vehiculoId, LocalDate inicio, LocalDate fin);
}
