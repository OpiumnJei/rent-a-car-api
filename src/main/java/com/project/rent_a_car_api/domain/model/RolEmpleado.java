package com.project.rent_a_car_api.domain.model;

/**
 * Roles de empleado segun RNF-03.
 * Por que: ADMINISTRADOR acceso total, AGENTE gestion comercial, MECANICO/INSPECTOR solo inspecciones.
 */
public enum RolEmpleado {
    ADMINISTRADOR,
    AGENTE,
    MECANICO
}
