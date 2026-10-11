package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository;

import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.VehiculoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio de vehiculos.
 * Por que: disponibilidad por sucursal + estado para RF-01.4.
 */
public interface VehiculoJpaRepository extends JpaRepository<VehiculoEntity, Long> {
    Optional<VehiculoEntity> findByPlaca(String placa);

    List<VehiculoEntity> findBySucursalId(Long sucursalId);

    List<VehiculoEntity> findBySucursalIdAndEstado(Long sucursalId, String estado);
}
