package com.project.rent_a_car_api.domain.model;

import com.project.rent_a_car_api.domain.result.DomainError;
import com.project.rent_a_car_api.domain.result.Result;

import java.time.LocalDate;

/**
 * Licencia de conducir asociada a un cliente (RF-02.2).
 * <p>
 * Por que: la vigencia durante todo el alquiler se valida en reserva;
 * el metodo vigenteDurante encapsula esa regla de negocio.
 */
public record Licencia(Long id, Long clienteId, String numero, LocalDate fechaExpiracion, String categoria, boolean activa) {

    /**
     * Factory validada.
     * Por que: numero y expiracion obligatorios para poder verificar vigencia.
     */
    public static Result<Licencia> crear(Long id, Long clienteId, String numero, LocalDate fechaExpiracion, String categoria, boolean activa) {
        if (clienteId == null) {
            return Result.fail(DomainError.validation("La licencia requiere cliente"));
        }
        if (numero == null || numero.isBlank()) {
            return Result.fail(DomainError.validation("El numero de licencia es obligatorio"));
        }
        if (fechaExpiracion == null) {
            return Result.fail(DomainError.validation("La fecha de expiracion es obligatoria"));
        }
        return Result.ok(new Licencia(id, clienteId, numero.trim(), fechaExpiracion, categoria, activa));
    }

    /**
     * Verifica si la licencia cubre todo el periodo de alquiler.
     * Por que: RF-02.2 rechaza reservas si expira durante o antes del alquiler.
     */
    public boolean vigenteDurante(LocalDate inicio, LocalDate fin) {
        if (fechaExpiracion == null || inicio == null || fin == null) {
            return false;
        }
        return fechaExpiracion.isAfter(fin);
    }
}
