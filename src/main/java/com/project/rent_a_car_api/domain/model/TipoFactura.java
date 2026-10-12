package com.project.rent_a_car_api.domain.model;

/**
 * Tipo de factura segun momento de cobro (RF-06).
 * <p>
 * Por que: la INICIAL se emite tras la salida (alquiler + ITBIS, cargos 0) y se cobra
 * antes de entregar; la COMPLEMENTARIA nace tras la entrada solo con los cargos
 * de devolucion, dejando la inicial inmutable fiscalmente.
 */
public enum TipoFactura {
    INICIAL,
    COMPLEMENTARIA
}
