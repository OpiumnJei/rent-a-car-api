package com.project.rent_a_car_api.domain.model;

/**
 * Estados del contrato (RF-04.2).
 * <p>
 * Por que: el contrato nace Activo y solo se Finaliza al facturar la devolucion.
 */
public enum EstadoContrato {
    ACTIVO,
    FINALIZADO,
    CANCELADO
}
