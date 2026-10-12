package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

/**
 * Entidad JPA de linea de factura.
 * Por que: cada cargo (dias, combustible, km, dano, retraso) queda como linea auditable.
 * Por que del cambio: antes factura_id se mapeaba como campo de solo lectura y el
 * @OneToMany usaba @JoinColumn; Hibernate omitia la FK en el INSERT y fallaba con
 * NOT NULL. Ahora relacion bidireccional (ManyToOne dueno) con INSERT directo.
 */
@Entity
@Table(name = "FACTURA_DETALLE")
public class FacturaDetalleEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "factura_id", nullable = false)
    private FacturaEntity factura;
    @Column(nullable = false, length = 250)
    private String concepto;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cantidad = BigDecimal.ONE;
    @Column(name = "precio_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioUnitario = BigDecimal.ZERO;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public FacturaEntity getFactura() { return factura; }
    public void setFactura(FacturaEntity factura) { this.factura = factura; }
    public String getConcepto() { return concepto; }
    public void setConcepto(String concepto) { this.concepto = concepto; }
    public BigDecimal getCantidad() { return cantidad; }
    public void setCantidad(BigDecimal cantidad) { this.cantidad = cantidad; }
    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
}
