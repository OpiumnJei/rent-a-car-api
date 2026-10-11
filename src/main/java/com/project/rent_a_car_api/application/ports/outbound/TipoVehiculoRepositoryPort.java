package com.project.rent_a_car_api.application.ports.outbound;

import com.project.rent_a_car_api.domain.model.TipoVehiculo;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de salida para tipos de vehiculo (RF-01.2).
 * Por que: aisla al caso de uso de Spring Data JPA.
 */
public interface TipoVehiculoRepositoryPort {
    TipoVehiculo guardar(TipoVehiculo tipo);

    Optional<TipoVehiculo> buscarPorId(Long id);

    List<TipoVehiculo> listarTodos();
}
