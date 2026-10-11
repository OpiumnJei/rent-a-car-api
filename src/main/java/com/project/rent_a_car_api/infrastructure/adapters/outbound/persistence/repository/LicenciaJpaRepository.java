package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository;

import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.LicenciaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repositorio de licencias.
 * Por que: lista por cliente para seleccionar licencia vigente en reserva.
 */
public interface LicenciaJpaRepository extends JpaRepository<LicenciaEntity, Long> {
    List<LicenciaEntity> findByClienteId(Long clienteId);
}
