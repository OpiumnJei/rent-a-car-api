package com.project.rent_a_car_api.application.ports.outbound;

import com.project.rent_a_car_api.domain.model.Vehiculo;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de salida para vehiculos (RF-01.3, RF-01.4).
 * Por que: incluye disponibilidad por sucursal para no filtrar en memoria.
 */
public interface VehiculoRepositoryPort {
    Vehiculo guardar(Vehiculo vehiculo);

    Optional<Vehiculo> buscarPorId(Long id);

    Optional<Vehiculo> buscarPorPlaca(String placa);

    List<Vehiculo> listarPorSucursal(Long sucursalId);

    List<Vehiculo> listarDisponiblesPorSucursal(Long sucursalId);
}
