package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository;

import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.InspeccionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repositorio de inspecciones.
 * Por que: lista por contrato y existencia por tipo para RF-05.3.
 */
public interface InspeccionJpaRepository extends JpaRepository<InspeccionEntity, Long> {
    List<InspeccionEntity> findByContratoId(Long contratoId);

    boolean existsByContratoIdAndTipo(Long contratoId, String tipo);
}
