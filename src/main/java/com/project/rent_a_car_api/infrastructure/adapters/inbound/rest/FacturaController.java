package com.project.rent_a_car_api.infrastructure.adapters.inbound.rest;

import com.project.rent_a_car_api.application.ports.inbound.FacturaUseCase;
import com.project.rent_a_car_api.domain.exception.DomainException;
import com.project.rent_a_car_api.infrastructure.adapters.inbound.rest.dto.Requests;
import com.project.rent_a_car_api.infrastructure.adapters.inbound.rest.dto.Responses;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller de facturacion en dos tiempos y PDF (RF-06).
 * Por que del cambio: POST emite la INICIAL tras la salida (cobro previo a entregar);
 * POST /{id}/complementaria emite la COMPLEMENTARIA tras la entrada solo con cargos.
 * El PDF se descarga como application/pdf con Content-Disposition para el frontend.
 */
@RestController
@RequestMapping("/api/v1/facturas")
public class FacturaController {

    private final FacturaUseCase facturas;

    public FacturaController(FacturaUseCase facturas) {
        this.facturas = facturas;
    }

    /** Request de complementaria. Por que: record local con fecha opcional (null = fin de reserva). */
    public record ComplementariaRequest(java.time.LocalDate fechaDevolucion) {
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Responses.FacturaResponse emitir(@Valid @RequestBody Requests.FacturaRequest req) {
        var r = facturas.emitir(req.contratoId(), req.fechaDevolucion());
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return Responses.FacturaResponse.desde(r.getValue());
    }

    /** Complementaria de cargos de devolucion. Por que: cuelga de la inicial sin mutarla. */
    @PostMapping("/{id}/complementaria")
    @ResponseStatus(HttpStatus.CREATED)
    public Responses.FacturaResponse complementaria(@PathVariable Long id,
                                                    @RequestBody(required = false) ComplementariaRequest body) {
        var r = facturas.emitirComplementaria(id, body == null ? null : body.fechaDevolucion());
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return Responses.FacturaResponse.desde(r.getValue());
    }

    @GetMapping
    public List<Responses.FacturaResponse> listar() {
        var r = facturas.listarTodas();
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return r.getValue().stream().map(Responses.FacturaResponse::desde).toList();
    }

    @GetMapping("/{id}")
    public Responses.FacturaResponse buscar(@PathVariable Long id) {
        var r = facturas.buscarPorId(id);
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return Responses.FacturaResponse.desde(r.getValue());
    }

    /** Descarga el PDF. Por que: bytes directos evitan almacenamiento temporal en servidor. */
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> pdf(@PathVariable Long id) {
        var r = facturas.generarPdf(id);
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=factura-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(r.getValue());
    }
}
