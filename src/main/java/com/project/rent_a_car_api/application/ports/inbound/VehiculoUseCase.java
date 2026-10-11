package com.project.rent_a_car_api.application.ports.inbound;

import com.project.rent_a_car_api.domain.model.EstadoVehiculo;
import com.project.rent_a_car_api.domain.model.Vehiculo;
import com.project.rent_a_car_api.domain.result.Result;

import java.util.List;

/**
 * Caso de uso de vehiculos (RF-01.3, RF-01.4).
 * Por que: centraliza alta con placa unica, cambio de estado y
 * filtro de disponibilidad por sucursal.
 */
public interface VehiculoUseCase {
    Result<Vehiculo> registrar(String placa, String marca, String modelo, Integer anio,
                               Long tipoVehiculoId, Long sucursalId, int kilometraje);

    Result<Vehiculo> cambiarEstado(Long vehiculoId, EstadoVehiculo nuevoEstado);

    Result<List<Vehiculo>> listarDisponibles(Long sucursalId);

    Result<Vehiculo> buscarPorId(Long id);
}
