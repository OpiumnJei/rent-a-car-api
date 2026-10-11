package com.project.rent_a_car_api.infrastructure.adapters.inbound.rest;

import com.project.rent_a_car_api.application.ports.inbound.ContratoUseCase;
import com.project.rent_a_car_api.application.ports.inbound.ReservaUseCase;
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

/**
 * Controller de reservas y contratos (RF-03, RF-04).
 * Por que: flujo secuencial reserva confirmada -> contrato activo.
 */
@RestController
@RequestMapping("/api/v1")
public class ReservaContratoController {

    private final ReservaUseCase reservas;
    private final ContratoUseCase contratos;

    public ReservaContratoController(ReservaUseCase reservas, ContratoUseCase contratos) {
        this.reservas = reservas;
        this.contratos = contratos;
    }

    @PostMapping("/reservas")
    @ResponseStatus(HttpStatus.CREATED)
    public Responses.ReservaResponse crearReserva(@Valid @RequestBody Requests.ReservaRequest req) {
        var r = reservas.crear(req.clienteId(), req.vehiculoId(), req.licenciaId(), req.fechaInicio(), req.fechaFin());
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return Responses.ReservaResponse.desde(r.getValue());
    }

    @PostMapping("/contratos")
    @ResponseStatus(HttpStatus.CREATED)
    public Responses.ContratoResponse generarContrato(@Valid @RequestBody Requests.ContratoRequest req) {
        var r = contratos.generar(req.reservaId(), req.empleadoId(), req.montoGarantia());
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return Responses.ContratoResponse.desde(r.getValue());
    }

    @GetMapping("/contratos/{id}")
    public Responses.ContratoResponse buscarContrato(@PathVariable Long id) {
        var r = contratos.buscarPorId(id);
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return Responses.ContratoResponse.desde(r.getValue());
    }
}
