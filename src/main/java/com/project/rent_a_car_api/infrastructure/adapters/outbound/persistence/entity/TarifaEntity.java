package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

/**
 * Entidad JPA de tarifa por tipo.
 * Por que: precio_por_dia con flag activo; la unicidad activa la garantiza el indice filtrado V1.
 */
@Entity
@Table(name = "TARIFA")
public class TarifaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "tipo_vehiculo_id", nullable = false)
    private Long tipoVehiculoId;
    @Column(name = "precio_por_dia", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioPorDia;
    @Column(nullable = false)
    private boolean activo = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTipoVehiculoId() { return tipoVehiculoId; }
    public void setTipoVehiculoId(Long tipoVehiculoId) { this.tipoVehiculoId = tipoVehiculoId; }
    public BigDecimal getPrecioPorDia() { return precioPorDia; }
    public void setPrecioPorDia(BigDecimal precioPorDia) { this.precioPorDia = precioPorDia; }
    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
}
