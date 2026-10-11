package com.project.rent_a_car_api.application.ports.outbound;

import java.math.BigDecimal;

/**
 * Puerto de salida para parametros de facturacion.
 * Por que: el caso de uso necesita precios sin conocer BillingProperties (infraestructura);
 * asi application no depende de infrastructure y pasa el ArchUnit.
 */
public interface BillingParamsPort {
    BigDecimal getItbisPercent();

    BigDecimal getPrecioPorNivelCombustible();

    BigDecimal getPrecioKmExtra();

    int getKmIncluidoPorDia();

    BigDecimal getRecargoDanio();

    BigDecimal getRecargoRetrasoDia();
}
