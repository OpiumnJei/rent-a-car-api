package com.project.rent_a_car_api.infrastructure.adapters.inbound.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTOs de entrada con validacion Bean Validation.
 * Por que: records compactos; la validacion sintactica ocurre antes del caso de uso,
 * que se encarga de las reglas de negocio con Result.
 */
public final class Requests {

    private Requests() {
        // Por que: contenedor estatico sin instancias.
    }

    public record SucursalRequest(@NotBlank String nombre, String direccion, String telefono) {
    }

    public record TipoRequest(@NotBlank String nombre) {
    }

    public record TarifaRequest(@NotNull Long tipoVehiculoId, @NotNull @Positive BigDecimal precioPorDia) {
    }

    public record VehiculoRequest(@NotBlank String placa, String marca, String modelo, Integer anio,
                                  @NotNull Long tipoVehiculoId, @NotNull Long sucursalId,
                                  @PositiveOrZero int kilometraje) {
    }

    public record EstadoVehiculoRequest(@NotBlank String estado) {
    }

    public record ClienteRequest(@NotBlank String documento, @NotBlank String nombre,
                                 String apellido, String email, String telefono) {
    }

    public record LicenciaRequest(@NotNull Long clienteId, @NotBlank String numero,
                                  @NotNull LocalDate fechaExpiracion, String categoria) {
    }

    public record ReservaRequest(@NotNull Long clienteId, @NotNull Long vehiculoId, @NotNull Long licenciaId,
                                 @NotNull LocalDate fechaInicio, @NotNull LocalDate fechaFin) {
    }

    public record ContratoRequest(@NotNull Long reservaId, @NotNull Long empleadoId, BigDecimal montoGarantia) {
    }

    public record InspeccionRequest(@NotNull Long contratoId, @NotNull Long empleadoId, @NotBlank String tipo,
                                    @PositiveOrZero int kilometraje, @NotBlank String nivelCombustible,
                                    String observaciones) {
    }

    public record FacturaRequest(@NotNull Long contratoId, LocalDate fechaDevolucion) {
    }
}
