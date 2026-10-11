package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository;

import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.FacturaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repositorio de facturas.
 * Por que: una factura por contrato (RF-06.2) mas listado general.
 */
public interface FacturaJpaRepository extends JpaRepository<FacturaEntity, Long> {
    Optional<FacturaEntity> findByContratoId(Long contratoId);
}
