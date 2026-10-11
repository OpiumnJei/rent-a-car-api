package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository;

import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.TarifaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio de tarifas.
 * Por que: buscar activa por tipo implementa RF-03.2 sin logica en memoria.
 */
public interface TarifaJpaRepository extends JpaRepository<TarifaEntity, Long> {
    Optional<TarifaEntity> findByTipoVehiculoIdAndActivoTrue(Long tipoVehiculoId);

    List<TarifaEntity> findByTipoVehiculoId(Long tipoVehiculoId);

    List<TarifaEntity> findByActivoTrue();
}
