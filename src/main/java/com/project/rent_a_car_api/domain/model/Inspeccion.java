package com.project.rent_a_car_api.domain.model;

import com.project.rent_a_car_api.domain.result.DomainError;
import com.project.rent_a_car_api.domain.result.Result;

import java.time.LocalDateTime;

/**
 * Inspeccion tecnica y fisica de salida/entrada (RF-05).
 * <p>
 * Por que: audita km, combustible y danos; su registro dispara el cambio
 * de estado de la flota y los cargos de facturacion.
 */
public record Inspeccion(Long id, Long contratoId, Long empleadoId, TipoInspeccion tipo,
                         int kilometraje, NivelCombustible nivelCombustible, String observaciones,
                         LocalDateTime fecha) {

    /**
     * Factory validada.
     * Por que: contrato, inspector, tipo y combustible obligatorios; km no negativo.
     */
    public static Result<Inspeccion> crear(Long id, Long contratoId, Long empleadoId, TipoInspeccion tipo,
                                           int kilometraje, NivelCombustible nivelCombustible, String observaciones,
                                           LocalDateTime fecha) {
        if (contratoId == null) {
            return Result.fail(DomainError.validation("La inspeccion requiere contrato"));
        }
        if (empleadoId == null) {
            return Result.fail(DomainError.validation("La inspeccion requiere empleado inspector"));
        }
        if (tipo == null) {
            return Result.fail(DomainError.validation("El tipo de inspeccion es obligatorio"));
        }
        if (nivelCombustible == null) {
            return Result.fail(DomainError.validation("El nivel de combustible es obligatorio"));
        }
        if (kilometraje < 0) {
            return Result.fail(DomainError.validation("El kilometraje no puede ser negativo"));
        }
        return Result.ok(new Inspeccion(id, contratoId, empleadoId, tipo, kilometraje, nivelCombustible, observaciones, fecha));
    }

    /**
     * Indica si la entrada reporta dano critico.
     * Por que: RF-05.4 decide Disponible vs Mantenimiento/Averiado segun observaciones.
     * Heuristica simple y documentada: menciona dano, choque, averia, rayadura profunda.
     */
    public boolean reportaDanio() {
        if (observaciones == null || observaciones.isBlank()) {
            return false;
        }
        String o = observaciones.toLowerCase();
        return o.contains("daño") || o.contains("dano") || o.contains("choque")
                || o.contains("averia") || o.contains("avería") || o.contains("rotura")
                || o.contains("abolladura") || o.contains("critico");
    }
}
