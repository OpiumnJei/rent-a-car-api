package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository;

import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.LicenciaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LicenciaJpaRepository extends JpaRepository<LicenciaEntity, Long> {

    List<LicenciaEntity> findByClienteId(Long clienteId);

    Optional<LicenciaEntity> findByNumero(String numero);
}