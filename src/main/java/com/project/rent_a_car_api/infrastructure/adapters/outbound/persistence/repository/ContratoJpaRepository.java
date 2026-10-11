package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository;

import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.ContratoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repositorio de contratos.
 * Por que: busqueda por reserva para impedir duplicados (RF-04.1).
 */
public interface ContratoJpaRepository extends JpaRepository<ContratoEntity, Long> {
    Optional<ContratoEntity> findByReservaId(Long reservaId);
}
