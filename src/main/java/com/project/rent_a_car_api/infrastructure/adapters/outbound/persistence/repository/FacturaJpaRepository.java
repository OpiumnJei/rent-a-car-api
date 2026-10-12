package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository;

import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.FacturaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio de facturas.
 * Por que del cambio: sin findByContratoId unico (V2 permite inicial + N
 * complementarias); se busca la inicial por tipo y se lista por contrato.
 */
public interface FacturaJpaRepository extends JpaRepository<FacturaEntity, Long> {
    Optional<FacturaEntity> findByContratoIdAndTipo(Long contratoId, String tipo);

    List<FacturaEntity> findByContratoId(Long contratoId);
}
