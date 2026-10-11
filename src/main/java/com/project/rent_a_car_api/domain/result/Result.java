package com.project.rent_a_car_api.domain.result;

/**
 * Patron Result para evitar excepciones como control de flujo.
 * <p>
 * Por que: el SRS exige trazabilidad y robustez en Reserva-Contrato-Inspeccion-Factura;
 * retornar Success/Failure hace los fallos de negocio explicitos y testeables,
 * y mantiene al dominio libre de dependencias Spring/JPA.
 */
public sealed interface Result<T> permits Result.Success, Result.Failure {

    /** Variante de exito con el valor producido. */
    record Success<T>(T value) implements Result<T> {
    }

    /** Variante de fallo con el error de dominio tipificado. */
    record Failure<T>(DomainError error) implements Result<T> {
    }

    /**
     * Crea un resultado exitoso.
     * Por que: factory nombrada para lectura clara en casos de uso.
     */
    static <T> Result<T> ok(T value) {
        return new Success<>(value);
    }

    /**
     * Crea un resultado fallido.
     * Por que: centraliza la creacion de fallos con DomainError.
     */
    static <T> Result<T> fail(String code, String message) {
        return new Failure<>(new DomainError(code, message));
    }

    /**
     * Crea un resultado fallido a partir de un error ya construido.
     * Por que: reutiliza errores calculados en servicios de dominio.
     */
    static <T> Result<T> fail(DomainError error) {
        return new Failure<>(error);
    }

    /**
     * Indica si el resultado es exitoso.
     * Por que: evita instanceof dispersos en los casos de uso.
     */
    default boolean isSuccess() {
        return this instanceof Success<T>;
    }

    /**
     * Indica si el resultado es fallido.
     * Por que: simetria con isSuccess para ramas de error.
     */
    default boolean isFailure() {
        return this instanceof Failure<T>;
    }

    /**
     * Obtiene el valor en caso de exito o null si fallo.
     * Por que: acceso rapido sin desempaquetado manual.
     */
    default T getValue() {
        if (this instanceof Success<T> s) {
            return s.value();
        }
        return null;
    }

    /**
     * Obtiene el error en caso de fallo o null si exito.
     * Por que: permite al controller mapear a ProblemDetail.
     */
    default DomainError getError() {
        if (this instanceof Failure<T> f) {
            return f.error();
        }
        return null;
    }
}
