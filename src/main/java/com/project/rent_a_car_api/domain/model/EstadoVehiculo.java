package com.project.rent_a_car_api.domain.model;

/**
 * Estados del vehiculo segun ciclo de vida (RF-01.3, RF-05.4).
 * <p>
 * Por que: enum puro para transiciones controladas Disponible-Alquilado-Mantenimiento-Averiado
 * sin strings magicos dispersos.
 */
public enum EstadoVehiculo {
    DISPONIBLE,
    ALQUILADO,
    EN_MANTENIMIENTO,
    AVERIADO
}
