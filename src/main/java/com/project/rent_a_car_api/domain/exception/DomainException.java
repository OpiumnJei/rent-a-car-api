package com.project.rent_a_car_api.domain.exception;

import com.project.rent_a_car_api.domain.result.DomainError;

/**
 * Puente entre el patron Result y el ExceptionHandler RFC7807.
 * <p>
 * Por que: el dominio retorna Result en todo (sin throws de negocio), pero Spring MVC
 * necesita una excepcion para que GlobalExceptionHandler genere ProblemDetail.
 * El controller convierte Failure -> throw DomainException, y el handler lo mapea a 400/404/409.
 */
public class DomainException extends RuntimeException {

    private final DomainError error;

    /**
     * Crea la excepcion puente con el error de dominio.
     * Por que: conserva codigo y mensaje para el mapeo HTTP.
     */
    public DomainException(DomainError error) {
        super(error.message());
        this.error = error;
    }

    /**
     * Obtiene el error de dominio original.
     * Por que: el handler lo usa para decidir el status HTTP.
     */
    public DomainError getError() {
        return error;
    }

    /**
     * Lanza la excepcion si el error no es nulo (helper).
     * Por que: evita if-throw repetidos en controllers.
     */
    public static void throwIfFailed(com.project.rent_a_car_api.domain.result.Result<?> result) {
        if (result.isFailure()) {
            throw new DomainException(result.getError());
        }
    }
}
