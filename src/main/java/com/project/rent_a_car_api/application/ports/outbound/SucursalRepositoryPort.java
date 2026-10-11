package com.project.rent_a_car_api.application.ports.outbound;

import com.project.rent_a_car_api.domain.model.Sucursal;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de salida para sucursales (RF-01.1).
 * <p>
 * Por que: el dominio no conoce JPA; este contrato lo implementa el adaptador
 * de persistencia y permite cambiar la BD sin tocar casos de uso.
 */
public interface SucursalRepositoryPort {
    Sucursal guardar(Sucursal sucursal);

    Optional<Sucursal> buscarPorId(Long id);

    List<Sucursal> listarTodas();

    List<Sucursal> listarActivas();
}
