package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad JPA de factura con detalles en cascada.
 * Por que: RF-06.2 cabecera + FACTURA_DETALLE; cascade ALL simplifica el guardado atomico.
 * Por que del cambio: columnas tipo (INICIAL/COMPLEMENTARIA) y factura_origen_id
 * para la complementaria vinculada; se quita unique=true de contrato_id porque ahora
 * la unicidad es "una inicial por contrato" via indice filtrado V2.
 */
@Entity
@Table(name = "FACTURA")
public class FacturaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "contrato_id", nullable = false)
    private Long contratoId;
    @Column(nullable = false, length = 20)
    private String tipo = "INICIAL";
    @Column(name = "factura_origen_id")
    private Long facturaOrigenId;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cargos = BigDecimal.ZERO;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal impuestos = BigDecimal.ZERO;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;
    @Column(nullable = false)
    private LocalDateTime fecha;
    // Por que del cambio: mappedBy hace a FacturaDetalle duena de la FK (INSERT directo
    // con factura_id) en vez del insert-con-null + update del unidireccional.
    @OneToMany(mappedBy = "factura", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<FacturaDetalleEntity> detalles = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getContratoId() { return contratoId; }
    public void setContratoId(Long contratoId) { this.contratoId = contratoId; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public Long getFacturaOrigenId() { return facturaOrigenId; }
    public void setFacturaOrigenId(Long facturaOrigenId) { this.facturaOrigenId = facturaOrigenId; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public BigDecimal getCargos() { return cargos; }
    public void setCargos(BigDecimal cargos) { this.cargos = cargos; }
    public BigDecimal getImpuestos() { return impuestos; }
    public void setImpuestos(BigDecimal impuestos) { this.impuestos = impuestos; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
    public List<FacturaDetalleEntity> getDetalles() { return detalles; }
    public void setDetalles(List<FacturaDetalleEntity> detalles) { this.detalles = detalles; }
}
