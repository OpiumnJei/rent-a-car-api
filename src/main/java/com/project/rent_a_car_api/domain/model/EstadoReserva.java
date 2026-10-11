package com.project.rent_a_car_api.domain.model;

/**
 * Estados de la reserva (RF-03).
 * <p>
 * Por que: controla si la reserva puede generar contrato o fue cancelada.
 */
public enum EstadoReserva {
    CONFIRMADA,
    CANCELADA,
    CONVERTIDA
}
