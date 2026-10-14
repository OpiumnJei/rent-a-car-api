package com.project.rent_a_car_api.infrastructure.adapters.inbound.rest;

import com.project.rent_a_car_api.application.ports.inbound.RegistrarInspeccionUseCase;
import com.project.rent_a_car_api.domain.exception.DomainException;
import com.project.rent_a_car_api.domain.model.NivelCombustible;
import com.project.rent_a_car_api.domain.model.TipoInspeccion;
import com.project.rent_a_car_api.domain.result.DomainError;
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

import java.util.List;

/**
 * Controller de inspecciones segun SRS 5.2 (RF-05).
 * Por que: normaliza strings de tipo/combustible a enums antes del caso de uso
 * para errores 400 claros; el servicio aplica RF-05.3 y actualiza flota.
 * Por que del cambio: anotaciones OpenAPI con la regla 1 salida + 1 entrada y
 * la actualizacion de flota documentadas en cada respuesta.
 */
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Inspecciones", description = "Check-out y check-in con actualizacion de flota (RF-05)")
public class InspeccionController {

    private final RegistrarInspeccionUseCase inspecciones;

    public InspeccionController(RegistrarInspeccionUseCase inspecciones) {
        this.inspecciones = inspecciones;
    }

    @Operation(summary = "Registrar inspeccion", description = "Salida (vehiculo a Alquilado) o entrada (a Disponible/Mantenimiento); maximo una de cada una por contrato (RF-05.3)")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Inspeccion registrada y flota actualizada"),
            @ApiResponse(responseCode = "400", description = "Tipo/combustible invalido, entrada sin salida previa o km regresivo"),
            @ApiResponse(responseCode = "404", description = "Contrato o empleado no encontrados"),
            @ApiResponse(responseCode = "409", description = "Ya existe ese tipo de inspeccion o empleado inactivo")
    })
    @PostMapping("/inspecciones")
    @ResponseStatus(HttpStatus.CREATED)
    public Responses.InspeccionResponse registrar(@Valid @RequestBody Requests.InspeccionRequest req) {
        TipoInspeccion tipo;
        try {
            tipo = TipoInspeccion.valueOf(req.tipo().trim().toUpperCase());
        } catch (Exception ex) {
            throw new DomainException(DomainError.validation("Tipo invalido (SALIDA|ENTRADA): " + req.tipo()));
        }
        NivelCombustible nivel = NivelCombustible.desdeTexto(req.nivelCombustible());
        if (nivel == null) {
            throw new DomainException(DomainError.validation("Nivel combustible invalido: " + req.nivelCombustible()));
        }
        var r = inspecciones.ejecutar(req.contratoId(), req.empleadoId(), tipo, req.kilometraje(), nivel, req.observaciones());
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return Responses.InspeccionResponse.desde(r.getValue());
    }

    @Operation(summary = "Inspecciones del contrato", description = "Lista salida y entrada de un contrato en orden cronologico")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Listado obtenido"),
            @ApiResponse(responseCode = "404", description = "Contrato no encontrado")
    })
    @GetMapping("/contratos/{id}/inspecciones")
    public List<Responses.InspeccionResponse> listar(
            @Parameter(description = "Id del contrato", example = "1") @PathVariable Long id) {
        var r = inspecciones.listarPorContrato(id);
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return r.getValue().stream().map(Responses.InspeccionResponse::desde).toList();
    }
}
