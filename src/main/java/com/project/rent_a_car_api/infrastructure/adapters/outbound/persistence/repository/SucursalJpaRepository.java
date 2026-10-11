package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository;

import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.SucursalEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repositorio Spring Data de sucursales.
 * Por que: el adaptador delega aqui; query derivada evita SQL manual.
 */
public interface SucursalJpaRepository extends JpaRepository<SucursalEntity, Long> {
    List<SucursalEntity> findByActivoTrue();
}
