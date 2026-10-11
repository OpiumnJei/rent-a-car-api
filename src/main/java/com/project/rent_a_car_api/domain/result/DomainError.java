package com.project.rent_a_car_api.domain.result;

/**
 * Error de dominio tipificado con codigo y mensaje.
 * <p>
 * Por que: el controller necesita un codigo estable (NOT_FOUND, CONFLICT, VALIDATION)
 * para mapear a HTTP 404/409/400 via GlobalExceptionHandler sin acoplar el dominio a Spring.
 */
public record DomainError(String code, String message) {

    /** Codigo para recurso inexistente -> HTTP 404. */
    public static final String NOT_FOUND = "NOT_FOUND";
    /** Codigo para conflicto de negocio -> HTTP 409. */
    public static final String CONFLICT = "CONFLICT";
    /** Codigo para validacion de reglas -> HTTP 400. */
    public static final String VALIDATION = "VALIDATION";

    /**
     * Crea un error de no encontrado.
     * Por que: factory expresiva para repositorios y casos de uso.
     */
    public static DomainError notFound(String message) {
        return new DomainError(NOT_FOUND, message);
    }

    /**
     * Crea un error de conflicto.
     * Por que: reserva solapada, inspeccion duplicada, tarifa duplicada.
     */
    public static DomainError conflict(String message) {
        return new DomainError(CONFLICT, message);
    }

    /**
     * Crea un error de validacion.
     * Por que: kilometraje, fechas, licencia vencida, campos obligatorios.
     */
    public static DomainError validation(String message) {
        return new DomainError(VALIDATION, message);
    }
}
