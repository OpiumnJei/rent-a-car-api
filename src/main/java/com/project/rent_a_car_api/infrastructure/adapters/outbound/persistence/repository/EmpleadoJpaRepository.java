package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository;

import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.EmpleadoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repositorio Spring Data de empleados.
 * Por que: username unico para el futuro login JWT (fase auth).
 */
public interface EmpleadoJpaRepository extends JpaRepository<EmpleadoEntity, Long> {
    Optional<EmpleadoEntity> findByUsername(String username);
}
