package com.project.rent_a_car_api.domain.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Factura del alquiler, inicial o complementaria (RF-06.1, RF-06.2).
 * <p>
 * Por que del cambio: antes una sola factura exigia salida + entrada (bloqueaba el cobro
 * previo a la entrega); ahora la INICIAL lleva subtotal de dias + ITBIS con cargos 0 y
 * la COMPLEMENTARIA lleva solo cargos de devolucion vinculados via facturaOrigenId.
 */
public record Factura(Long id, Long contratoId, TipoFactura tipo, Long facturaOrigenId,
                      BigDecimal subtotal, BigDecimal cargos, BigDecimal impuestos,
                      BigDecimal total, LocalDateTime fecha, List<FacturaDetalle> detalles) {

    /**
     * Linea de detalle de factura.
     * Por que: record anidado para mantener cabecera y lineas juntas en dominio.
     */
    public record FacturaDetalle(String concepto, BigDecimal cantidad, BigDecimal precioUnitario, BigDecimal subtotal) {
    }
}
