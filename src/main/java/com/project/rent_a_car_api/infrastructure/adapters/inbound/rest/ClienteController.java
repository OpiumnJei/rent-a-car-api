package com.project.rent_a_car_api.infrastructure.adapters.inbound.rest;

import com.project.rent_a_car_api.application.ports.inbound.ClienteUseCase;
import com.project.rent_a_car_api.domain.exception.DomainException;
import com.project.rent_a_car_api.infrastructure.adapters.inbound.rest.dto.Requests;
import com.project.rent_a_car_api.infrastructure.adapters.inbound.rest.dto.Responses;
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
 * Controller de clientes y licencias (RF-02).
 * Por que: alta de cliente y registro de licencias con vigencia validada en servicio.
 */
@RestController
@RequestMapping("/api/v1")
public class ClienteController {

    private final ClienteUseCase clientes;

    public ClienteController(ClienteUseCase clientes) {
        this.clientes = clientes;
    }

    @PostMapping("/clientes")
    @ResponseStatus(HttpStatus.CREATED)
    public Responses.ClienteResponse registrar(@Valid @RequestBody Requests.ClienteRequest req) {
        var r = clientes.registrar(req.documento(), req.nombre(), req.apellido(), req.email(), req.telefono());
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return Responses.ClienteResponse.desde(r.getValue());
    }

    @PostMapping("/licencias")
    @ResponseStatus(HttpStatus.CREATED)
    public Responses.LicenciaResponse registrarLicencia(@Valid @RequestBody Requests.LicenciaRequest req) {
        var r = clientes.registrarLicencia(req.clienteId(), req.numero(), req.fechaExpiracion(), req.categoria());
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return Responses.LicenciaResponse.desde(r.getValue());
    }

    /** Licencias de un cliente. Por que: la reserva necesita elegir licencia vigente. */
    @GetMapping("/clientes/{id}/licencias")
    public List<Responses.LicenciaResponse> licencias(@PathVariable Long id) {
        var r = clientes.licenciasDeCliente(id);
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return r.getValue().stream().map(Responses.LicenciaResponse::desde).toList();
    }
}
