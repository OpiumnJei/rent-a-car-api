package com.project.rent_a_car_api.application.ports.outbound;

import com.project.rent_a_car_api.domain.model.Tarifa;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de salida para tarifas (RF-01.2, RF-03.2).
 * Por que: el caso de uso necesita la tarifa activa por tipo sin conocer SQL.
 */
public interface TarifaRepositoryPort {
    Tarifa guardar(Tarifa tarifa);

    Optional<Tarifa> buscarPorId(Long id);

    Optional<Tarifa> buscarActivaPorTipo(Long tipoVehiculoId);

    List<Tarifa> listarPorTipo(Long tipoVehiculoId);

    List<Tarifa> listarActivas();
}
