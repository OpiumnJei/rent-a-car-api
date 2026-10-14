package com.project.rent_a_car_api.infrastructure.adapters.inbound.rest;

import com.project.rent_a_car_api.application.ports.inbound.CatalogoUseCase;
import com.project.rent_a_car_api.application.ports.inbound.SucursalUseCase;
import com.project.rent_a_car_api.domain.exception.DomainException;
import com.project.rent_a_car_api.domain.result.Result;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller de catalogos: sucursales, tipos y tarifas (RF-01.1, RF-01.2).
 * Por que: adaptador de entrada que convierte DTO a llamada de caso de uso
 * y Failure a DomainException para RFC7807; delgado sin logica de negocio.
 * Por que del cambio: anotaciones OpenAPI (@Tag/@Operation/@ApiResponses/@Parameter)
 * para agrupar en Swagger UI y documentar respuestas 200/201/400/404/409 del Result.
 */
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Catalogos", description = "Sucursales, tipos de vehiculo y tarifas (RF-01)")
public class CatalogoController {

    private final SucursalUseCase sucursales;
    private final CatalogoUseCase catalogo;

    public CatalogoController(SucursalUseCase sucursales, CatalogoUseCase catalogo) {
        this.sucursales = sucursales;
        this.catalogo = catalogo;
    }

    /** Lista sucursales. Por que: ?soloActivas=true por defecto para operacion diaria. */
    @Operation(summary = "Listar sucursales", description = "Lista todas o solo las activas para la operacion diaria")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Listado obtenido")
    })
    @GetMapping("/sucursales")
    public List<Responses.SucursalResponse> listar(
            @Parameter(description = "Filtrar solo activas", example = "true") @RequestParam(defaultValue = "true") boolean soloActivas) {
        Result<List<com.project.rent_a_car_api.domain.model.Sucursal>> r = sucursales.listar(soloActivas);
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return r.getValue().stream().map(Responses.SucursalResponse::desde).toList();
    }

    /** Registra sucursal. Por que: 201 Created segun REST. */
    @Operation(summary = "Registrar sucursal", description = "Da de alta una sucursal activa (RF-01.1)")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Sucursal creada"),
            @ApiResponse(responseCode = "400", description = "Validacion fallida (nombre obligatorio)")
    })
    @PostMapping("/sucursales")
    @ResponseStatus(HttpStatus.CREATED)
    public Responses.SucursalResponse crear(@Valid @RequestBody Requests.SucursalRequest req) {
        var r = sucursales.registrar(req.nombre(), req.direccion(), req.telefono());
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return Responses.SucursalResponse.desde(r.getValue());
    }

    @Operation(summary = "Listar tipos de vehiculo", description = "Catalogo de tipos (SUV, Sedan, ...) para tarifar")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Listado obtenido")
    })
    @GetMapping("/tipos-vehiculo")
    public List<Responses.TipoResponse> listarTipos() {
        var r = catalogo.listarTipos();
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return r.getValue().stream().map(Responses.TipoResponse::desde).toList();
    }

    @Operation(summary = "Registrar tipo de vehiculo", description = "Alta de tipo para luego definirle tarifa (RF-01.2)")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tipo creado"),
            @ApiResponse(responseCode = "400", description = "Validacion fallida")
    })
    @PostMapping("/tipos-vehiculo")
    @ResponseStatus(HttpStatus.CREATED)
    public Responses.TipoResponse crearTipo(@Valid @RequestBody Requests.TipoRequest req) {
        var r = catalogo.registrarTipo(req.nombre());
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return Responses.TipoResponse.desde(r.getValue());
    }

    @Operation(summary = "Listar tarifas activas", description = "Un solo costo vigente por tipo (RF-01.2)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Listado obtenido")
    })
    @GetMapping("/tarifas")
    public List<Responses.TarifaResponse> listarTarifas() {
        var r = catalogo.listarTarifasActivas();
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return r.getValue().stream().map(Responses.TarifaResponse::desde).toList();
    }

    @Operation(summary = "Definir tarifa", description = "Fija la tarifa activa del tipo desactivando la anterior (RF-01.2)")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tarifa creada"),
            @ApiResponse(responseCode = "400", description = "Precio invalido"),
            @ApiResponse(responseCode = "404", description = "Tipo de vehiculo no encontrado")
    })
    @PostMapping("/tarifas")
    @ResponseStatus(HttpStatus.CREATED)
    public Responses.TarifaResponse definirTarifa(@Valid @RequestBody Requests.TarifaRequest req) {
        var r = catalogo.definirTarifa(req.tipoVehiculoId(), req.precioPorDia());
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return Responses.TarifaResponse.desde(r.getValue());
    }
}
