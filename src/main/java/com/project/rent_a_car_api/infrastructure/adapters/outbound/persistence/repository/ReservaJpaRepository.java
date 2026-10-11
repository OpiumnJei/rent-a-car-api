package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository;

import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.ReservaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

/**
 * Repositorio de reservas con deteccion de solape.
 * Por que: query de solape implementa RF-03.2 (mismo vehiculo, rangos que se cruzan
 * y estado CONFIRMADA) directamente en SQL para evitar traer todo a memoria.
 */
public interface ReservaJpaRepository extends JpaRepository<ReservaEntity, Long> {
    List<ReservaEntity> findByVehiculoId(Long vehiculoId);

    @Query("SELECT COUNT(r) > 0 FROM ReservaEntity r WHERE r.vehiculoId = :vehiculoId "
            + "AND r.estado = 'CONFIRMADA' AND r.fechaInicio <= :fin AND r.fechaFin >= :inicio")
    boolean existeSolape(@Param("vehiculoId") Long vehiculoId,
                         @Param("inicio") LocalDate inicio,
                         @Param("fin") LocalDate fin);
}
