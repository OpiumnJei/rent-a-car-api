package com.project.rent_a_car_api.domain.model;

import com.project.rent_a_car_api.domain.result.DomainError;
import com.project.rent_a_car_api.domain.result.Result;

/**
 * Unidad fisica alquilable con placa unica (RF-01.3).
 * <p>
 * Por que: record de dominio con transicion de estado explicita para que
 * inspeccion de salida/entrada actualice la flota (RF-05.1, RF-05.4).
 */
public record Vehiculo(Long id, String placa, String marca, String modelo, Integer anio,
                       Long tipoVehiculoId, Long sucursalId, EstadoVehiculo estado, int kilometraje) {

    /**
     * Factory validada.
     * Por que: placa unica y kilometraje no negativo son invariantes de flota.
     */
    public static Result<Vehiculo> crear(Long id, String placa, String marca, String modelo, Integer anio,
                                         Long tipoVehiculoId, Long sucursalId, EstadoVehiculo estado, int kilometraje) {
        if (placa == null || placa.isBlank()) {
            return Result.fail(DomainError.validation("La placa es obligatoria"));
        }
        if (tipoVehiculoId == null) {
            return Result.fail(DomainError.validation("El vehiculo requiere tipo"));
        }
        if (sucursalId == null) {
            return Result.fail(DomainError.validation("El vehiculo requiere sucursal"));
        }
        if (kilometraje < 0) {
            return Result.fail(DomainError.validation("El kilometraje no puede ser negativo"));
        }
        return Result.ok(new Vehiculo(id, placa.trim().toUpperCase(), marca, modelo, anio,
                tipoVehiculoId, sucursalId, estado == null ? EstadoVehiculo.DISPONIBLE : estado, kilometraje));
    }

    /**
     * Retorna copia con nuevo estado.
     * Por que: los records son inmutables; la transicion crea instancia sin setters.
     */
    public Vehiculo conEstado(EstadoVehiculo nuevo) {
        return new Vehiculo(id, placa, marca, modelo, anio, tipoVehiculoId, sucursalId, nuevo, kilometraje);
    }

    /**
     * Retorna copia con nuevo kilometraje.
     * Por que: la inspeccion actualiza km sin mutar el original.
     */
    public Vehiculo conKilometraje(int nuevoKm) {
        return new Vehiculo(id, placa, marca, modelo, anio, tipoVehiculoId, sucursalId, estado, nuevoKm);
    }
}
