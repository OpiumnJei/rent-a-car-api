package com.project.rent_a_car_api.infrastructure.adapters.inbound.rest;

import com.project.rent_a_car_api.application.ports.inbound.VehiculoUseCase;
import com.project.rent_a_car_api.domain.exception.DomainException;
import com.project.rent_a_car_api.domain.model.EstadoVehiculo;
import com.project.rent_a_car_api.infrastructure.adapters.inbound.rest.dto.Requests;
import com.project.rent_a_car_api.infrastructure.adapters.inbound.rest.dto.Responses;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller de vehiculos (RF-01.3, RF-01.4).
 * Por que: expone alta, disponibilidad por sucursal y cambio de estado.
 */
@RestController
@RequestMapping("/api/v1/vehiculos")
public class VehiculoController {

    private final VehiculoUseCase vehiculos;

    public VehiculoController(VehiculoUseCase vehiculos) {
        this.vehiculos = vehiculos;
    }

    /** Disponibilidad por sucursal. Por que: endpoint SRS /vehiculos/disponibles. */
    @GetMapping("/disponibles")
    public List<Responses.VehiculoResponse> disponibles(@RequestParam(required = false) Long sucursalId) {
        var r = vehiculos.listarDisponibles(sucursalId);
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return r.getValue().stream().map(Responses.VehiculoResponse::desde).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Responses.VehiculoResponse registrar(@Valid @RequestBody Requests.VehiculoRequest req) {
        var r = vehiculos.registrar(req.placa(), req.marca(), req.modelo(), req.anio(),
                req.tipoVehiculoId(), req.sucursalId(), req.kilometraje());
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return Responses.VehiculoResponse.desde(r.getValue());
    }

    /** Cambio de estado manual. Por que: permite a agente mover a mantenimiento sin inspeccion. */
    @PatchMapping("/{id}/estado")
    public Responses.VehiculoResponse cambiarEstado(@PathVariable Long id, @Valid @RequestBody Requests.EstadoVehiculoRequest req) {
        EstadoVehiculo estado;
        try {
            estado = EstadoVehiculo.valueOf(req.estado().trim().toUpperCase());
        } catch (Exception ex) {
            throw new DomainException(new com.project.rent_a_car_api.domain.result.DomainError("VALIDATION", "Estado invalido: " + req.estado()));
        }
        var r = vehiculos.cambiarEstado(id, estado);
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return Responses.VehiculoResponse.desde(r.getValue());
    }
}
