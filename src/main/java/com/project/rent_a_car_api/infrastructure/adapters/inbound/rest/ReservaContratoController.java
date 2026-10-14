package com.project.rent_a_car_api.infrastructure.adapters.inbound.rest;

import com.project.rent_a_car_api.application.ports.inbound.ContratoUseCase;
import com.project.rent_a_car_api.application.ports.inbound.ReservaUseCase;
import com.project.rent_a_car_api.domain.exception.DomainException;
import com.project.rent_a_car_api.infrastructure.adapters.inbound.rest.dto.Requests;
import com.project.rent_a_car_api.infrastructure.adapters.inbound.rest.dto.Responses;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller de reservas y contratos (RF-03, RF-04).
 * Por que: flujo secuencial reserva confirmada -> contrato activo.
 * Por que del cambio: anotaciones OpenAPI con las validaciones de negocio
 * (solape, licencia, tarifa) mapeadas a 400/404/409.
 */
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Reservas y contratos", description = "Reservas validadas y contratos activos (RF-03, RF-04)")
public class ReservaContratoController {

    private final ReservaUseCase reservas;
    private final ContratoUseCase contratos;

    public ReservaContratoController(ReservaUseCase reservas, ContratoUseCase contratos) {
        this.reservas = reservas;
        this.contratos = contratos;
    }

    @Operation(summary = "Crear reserva", description = "Valida disponibilidad, licencia vigente y tarifa activa; calcula total estimado (RF-03)")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Reserva confirmada"),
            @ApiResponse(responseCode = "400", description = "Rango invalido o licencia vencida"),
            @ApiResponse(responseCode = "404", description = "Cliente, vehiculo o licencia no encontrados"),
            @ApiResponse(responseCode = "409", description = "Vehiculo no disponible en esas fechas")
    })
    @PostMapping("/reservas")
    @ResponseStatus(HttpStatus.CREATED)
    public Responses.ReservaResponse crearReserva(@Valid @RequestBody Requests.ReservaRequest req) {
        var r = reservas.crear(req.clienteId(), req.vehiculoId(), req.licenciaId(), req.fechaInicio(), req.fechaFin());
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return Responses.ReservaResponse.desde(r.getValue());
    }

    @Operation(summary = "Generar contrato", description = "Contrato activo desde reserva confirmada con empleado y garantia (RF-04)")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Contrato activo"),
            @ApiResponse(responseCode = "404", description = "Reserva o empleado no encontrados"),
            @ApiResponse(responseCode = "409", description = "Reserva no confirmada, ya contratada o empleado inactivo")
    })
    @PostMapping("/contratos")
    @ResponseStatus(HttpStatus.CREATED)
    public Responses.ContratoResponse generarContrato(@Valid @RequestBody Requests.ContratoRequest req) {
        var r = contratos.generar(req.reservaId(), req.empleadoId(), req.montoGarantia());
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return Responses.ContratoResponse.desde(r.getValue());
    }

    @Operation(summary = "Buscar contrato", description = "Detalle de un contrato por id")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Contrato encontrado"),
            @ApiResponse(responseCode = "404", description = "Contrato no encontrado")
    })
    @GetMapping("/contratos/{id}")
    public Responses.ContratoResponse buscarContrato(
            @Parameter(description = "Id del contrato", example = "1") @PathVariable Long id) {
        var r = contratos.buscarPorId(id);
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return Responses.ContratoResponse.desde(r.getValue());
    }
}
