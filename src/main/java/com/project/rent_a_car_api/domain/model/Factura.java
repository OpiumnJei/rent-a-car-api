package com.project.rent_a_car_api.domain.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Factura consolidada del alquiler (RF-06.1, RF-06.2).
 * <p>
 * Por que: agrupa subtotal de dias + cargos de inspeccion + ITBIS en un total
 * definitivo vinculado al contrato, con sus lineas de detalle.
 */
public record Factura(Long id, Long contratoId, BigDecimal subtotal, BigDecimal cargos,
                      BigDecimal impuestos, BigDecimal total, LocalDateTime fecha, List<FacturaDetalle> detalles) {

    /**
     * Linea de detalle de factura.
     * Por que: record anidado para mantener cabecera y lineas juntas en dominio.
     */
    public record FacturaDetalle(String concepto, BigDecimal cantidad, BigDecimal precioUnitario, BigDecimal subtotal) {
    }
}
