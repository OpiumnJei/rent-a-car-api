package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidad JPA de contrato.
 * Por que: reserva_id unico garantiza un contrato por reserva (RF-04.1).
 */
@Entity
@Table(name = "CONTRATO")
public class ContratoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "reserva_id", nullable = false, unique = true)
    private Long reservaId;
    @Column(name = "empleado_id", nullable = false)
    private Long empleadoId;
    @Column(name = "monto_garantia", precision = 12, scale = 2)
    private BigDecimal montoGarantia;
    @Column(name = "total_estimado", precision = 12, scale = 2)
    private BigDecimal totalEstimado;
    @Column(nullable = false, length = 20)
    private String estado = "ACTIVO";
    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getReservaId() { return reservaId; }
    public void setReservaId(Long reservaId) { this.reservaId = reservaId; }
    public Long getEmpleadoId() { return empleadoId; }
    public void setEmpleadoId(Long empleadoId) { this.empleadoId = empleadoId; }
    public BigDecimal getMontoGarantia() { return montoGarantia; }
    public void setMontoGarantia(BigDecimal montoGarantia) { this.montoGarantia = montoGarantia; }
    public BigDecimal getTotalEstimado() { return totalEstimado; }
    public void setTotalEstimado(BigDecimal totalEstimado) { this.totalEstimado = totalEstimado; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
