package com.project.rent_a_car_api.domain.model;

/**
 * Tipo de inspeccion segun momento operativo (RF-05.1, RF-05.2).
 * <p>
 * Por que: limita a Salida (check-out) y Entrada (check-in) para aplicar
 * la regla de maximo una de cada una por contrato (RF-05.3).
 */
public enum TipoInspeccion {
    SALIDA,
    ENTRADA
}
