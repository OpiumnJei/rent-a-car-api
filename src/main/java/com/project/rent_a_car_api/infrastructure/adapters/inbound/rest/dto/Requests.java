package com.project.rent_a_car_api.infrastructure.adapters.inbound.rest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
 * Por que del cambio: anotaciones @Schema con descripciones y ejemplos para que el
 * "Try it out" de Swagger venga pre-rellenado y cada campo se entienda sin leer codigo.
 */
public final class Requests {

    private Requests() {
        // Por que: contenedor estatico sin instancias.
    }

    @Schema(description = "Alta de sucursal (RF-01.1)")
    public record SucursalRequest(
            @Schema(description = "Nombre de la sucursal", example = "Sede Central") @NotBlank String nombre,
            @Schema(description = "Direccion fisica", example = "Av. Principal #123") String direccion,
            @Schema(description = "Telefono de contacto", example = "(809) 000-0000") String telefono) {
    }

    @Schema(description = "Alta de tipo de vehiculo (RF-01.2)")
    public record TipoRequest(
            @Schema(description = "Nombre del tipo", example = "SUV") @NotBlank String nombre) {
    }

    @Schema(description = "Definicion de tarifa activa por tipo (RF-01.2, desactiva la anterior)")
    public record TarifaRequest(
            @Schema(description = "Id del tipo de vehiculo", example = "1") @NotNull Long tipoVehiculoId,
            @Schema(description = "Precio por dia de alquiler", example = "5000.00") @NotNull @Positive BigDecimal precioPorDia) {
    }

    @Schema(description = "Alta de vehiculo con placa unica (RF-01.3)")
    public record VehiculoRequest(
            @Schema(description = "Placa unica", example = "ABC1234") @NotBlank String placa,
            @Schema(description = "Marca", example = "Toyota") String marca,
            @Schema(description = "Modelo", example = "RAV4") String modelo,
            @Schema(description = "Ano", example = "2023") Integer anio,
            @Schema(description = "Id del tipo de vehiculo", example = "1") @NotNull Long tipoVehiculoId,
            @Schema(description = "Id de la sucursal asignada", example = "1") @NotNull Long sucursalId,
            @Schema(description = "Kilometraje actual", example = "10000") @PositiveOrZero int kilometraje) {
    }

    @Schema(description = "Cambio manual de estado de flota")
    public record EstadoVehiculoRequest(
            @Schema(description = "Nuevo estado", allowableValues = {"DISPONIBLE", "ALQUILADO", "EN_MANTENIMIENTO", "AVERIADO"}, example = "EN_MANTENIMIENTO") @NotBlank String estado) {
    }

    @Schema(description = "Alta de cliente por documento unico (RF-02.1)")
    public record ClienteRequest(
            @Schema(description = "Cedula o pasaporte", example = "40200000001") @NotBlank String documento,
            @Schema(description = "Nombre", example = "Juan") @NotBlank String nombre,
            @Schema(description = "Apellido", example = "Perez") String apellido,
            @Schema(description = "Correo", example = "juan@mail.com") String email,
            @Schema(description = "Telefono", example = "8091111111") String telefono) {
    }

    @Schema(description = "Registro de licencia de conducir (RF-02.2)")
    public record LicenciaRequest(
            @Schema(description = "Id del cliente dueno", example = "1") @NotNull Long clienteId,
            @Schema(description = "Numero de licencia", example = "LIC-001") @NotBlank String numero,
            @Schema(description = "Fecha de expiracion (debe cubrir todo el alquiler)", example = "2028-05-01") @NotNull LocalDate fechaExpiracion,
            @Schema(description = "Categoria", example = "B") String categoria) {
    }

    @Schema(description = "Creacion de reserva con validaciones (RF-03.2)")
    public record ReservaRequest(
            @Schema(description = "Id del cliente", example = "1") @NotNull Long clienteId,
            @Schema(description = "Id del vehiculo", example = "1") @NotNull Long vehiculoId,
            @Schema(description = "Id de la licencia vigente del cliente", example = "1") @NotNull Long licenciaId,
            @Schema(description = "Inicio del alquiler", example = "2026-11-01") @NotNull LocalDate fechaInicio,
            @Schema(description = "Fin del alquiler", example = "2026-11-03") @NotNull LocalDate fechaFin) {
    }

    @Schema(description = "Generacion de contrato desde reserva confirmada (RF-04.1)")
    public record ContratoRequest(
            @Schema(description = "Id de la reserva confirmada", example = "1") @NotNull Long reservaId,
            @Schema(description = "Id del empleado responsable", example = "1") @NotNull Long empleadoId,
            @Schema(description = "Monto de garantia", example = "5000.00") BigDecimal montoGarantia) {
    }

    @Schema(description = "Registro de inspeccion de salida o entrada (RF-05)")
    public record InspeccionRequest(
            @Schema(description = "Id del contrato", example = "1") @NotNull Long contratoId,
            @Schema(description = "Id del empleado inspector", example = "1") @NotNull Long empleadoId,
            @Schema(description = "Momento operativo", allowableValues = {"SALIDA", "ENTRADA"}, example = "SALIDA") @NotBlank String tipo,
            @Schema(description = "Kilometraje actual (entrada >= salida)", example = "10000") @PositiveOrZero int kilometraje,
            @Schema(description = "Nivel devuelto", allowableValues = {"LLENO", "3/4", "1/2", "1/4", "RESERVA"}, example = "LLENO") @NotBlank String nivelCombustible,
            @Schema(description = "Observaciones de estado o danos", example = "Sin detalles") String observaciones) {
    }

    @Schema(description = "Emision de factura inicial tras la salida (RF-06)")
    public record FacturaRequest(
            @Schema(description = "Id del contrato con inspeccion de salida", example = "1") @NotNull Long contratoId,
            @Schema(description = "Fecha real de devolucion (null = fin de reserva)", example = "2026-11-03") LocalDate fechaDevolucion) {
    }
}
