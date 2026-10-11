package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository;

import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.TipoVehiculoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repositorio de tipos.
 * Por que: CRUD base; la unicidad de nombre la garantiza la BD.
 */
public interface TipoVehiculoJpaRepository extends JpaRepository<TipoVehiculoEntity, Long> {
}
