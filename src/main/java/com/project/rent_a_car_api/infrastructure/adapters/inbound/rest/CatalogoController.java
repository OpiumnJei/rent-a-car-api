package com.project.rent_a_car_api.infrastructure.adapters.inbound.rest;

import com.project.rent_a_car_api.application.ports.inbound.CatalogoUseCase;
import com.project.rent_a_car_api.application.ports.inbound.SucursalUseCase;
import com.project.rent_a_car_api.domain.exception.DomainException;
import com.project.rent_a_car_api.domain.result.Result;
import com.project.rent_a_car_api.infrastructure.adapters.inbound.rest.dto.Requests;
import com.project.rent_a_car_api.infrastructure.adapters.inbound.rest.dto.Responses;
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
 */
@RestController
@RequestMapping("/api/v1")
public class CatalogoController {

    private final SucursalUseCase sucursales;
    private final CatalogoUseCase catalogo;

    public CatalogoController(SucursalUseCase sucursales, CatalogoUseCase catalogo) {
        this.sucursales = sucursales;
        this.catalogo = catalogo;
    }

    /** Lista sucursales. Por que: ?soloActivas=true por defecto para operacion diaria. */
    @GetMapping("/sucursales")
    public List<Responses.SucursalResponse> listar(@RequestParam(defaultValue = "true") boolean soloActivas) {
        Result<List<com.project.rent_a_car_api.domain.model.Sucursal>> r = sucursales.listar(soloActivas);
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return r.getValue().stream().map(Responses.SucursalResponse::desde).toList();
    }

    /** Registra sucursal. Por que: 201 Created segun REST. */
    @PostMapping("/sucursales")
    @ResponseStatus(HttpStatus.CREATED)
    public Responses.SucursalResponse crear(@Valid @RequestBody Requests.SucursalRequest req) {
        var r = sucursales.registrar(req.nombre(), req.direccion(), req.telefono());
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return Responses.SucursalResponse.desde(r.getValue());
    }

    @GetMapping("/tipos-vehiculo")
    public List<Responses.TipoResponse> listarTipos() {
        var r = catalogo.listarTipos();
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return r.getValue().stream().map(Responses.TipoResponse::desde).toList();
    }

    @PostMapping("/tipos-vehiculo")
    @ResponseStatus(HttpStatus.CREATED)
    public Responses.TipoResponse crearTipo(@Valid @RequestBody Requests.TipoRequest req) {
        var r = catalogo.registrarTipo(req.nombre());
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return Responses.TipoResponse.desde(r.getValue());
    }

    @GetMapping("/tarifas")
    public List<Responses.TarifaResponse> listarTarifas() {
        var r = catalogo.listarTarifasActivas();
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return r.getValue().stream().map(Responses.TarifaResponse::desde).toList();
    }

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
