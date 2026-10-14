package com.project.rent_a_car_api.infrastructure.adapters.inbound.rest;

import com.project.rent_a_car_api.application.ports.inbound.FacturaUseCase;
import com.project.rent_a_car_api.domain.exception.DomainException;
import com.project.rent_a_car_api.infrastructure.adapters.inbound.rest.dto.Requests;
import com.project.rent_a_car_api.infrastructure.adapters.inbound.rest.dto.Responses;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
 * Por que del cambio: anotaciones OpenAPI con ambos tiempos de cobro y descarga PDF.
 */
@RestController
@RequestMapping("/api/v1/facturas")
@Tag(name = "Facturacion", description = "Inicial tras salida, complementaria tras entrada y PDF (RF-06)")
public class FacturaController {

    private final FacturaUseCase facturas;

    public FacturaController(FacturaUseCase facturas) {
        this.facturas = facturas;
    }

    /** Request de complementaria. Por que: record local con fecha opcional (null = fin de reserva). */
    @Schema(description = "Fecha real de devolucion para calcular retraso (opcional)")
    public record ComplementariaRequest(
            @Schema(description = "Devolucion real; null usa el fin de la reserva", example = "2026-11-03") java.time.LocalDate fechaDevolucion) {
    }

    @Operation(summary = "Emitir factura inicial", description = "Tras la salida: dias x tarifa + ITBIS con cargos 0; se cobra antes de entregar")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Inicial creada"),
            @ApiResponse(responseCode = "400", description = "Sin salida registrada o sin tarifa"),
            @ApiResponse(responseCode = "404", description = "Contrato no encontrado"),
            @ApiResponse(responseCode = "409", description = "Ya tiene inicial")
    })
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
    @Operation(summary = "Emitir complementaria", description = "Tras la entrada: solo cargos de devolucion (combustible, km, dano, retraso); 409 si no hay cargos")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Complementaria creada"),
            @ApiResponse(responseCode = "400", description = "Sin entrada registrada o id no es inicial"),
            @ApiResponse(responseCode = "404", description = "Factura inicial no encontrada"),
            @ApiResponse(responseCode = "409", description = "Devolucion sin cargos adicionales")
    })
    @PostMapping("/{id}/complementaria")
    @ResponseStatus(HttpStatus.CREATED)
    public Responses.FacturaResponse complementaria(
            @Parameter(description = "Id de la factura inicial", example = "1") @PathVariable Long id,
            @RequestBody(required = false) ComplementariaRequest body) {
        var r = facturas.emitirComplementaria(id, body == null ? null : body.fechaDevolucion());
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return Responses.FacturaResponse.desde(r.getValue());
    }

    @Operation(summary = "Listar facturas", description = "Iniciales y complementarias con sus detalles")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Listado obtenido")
    })
    @GetMapping
    public List<Responses.FacturaResponse> listar() {
        var r = facturas.listarTodas();
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return r.getValue().stream().map(Responses.FacturaResponse::desde).toList();
    }

    @Operation(summary = "Buscar factura", description = "Detalle con lineas por id")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Factura encontrada"),
            @ApiResponse(responseCode = "404", description = "Factura no encontrada")
    })
    @GetMapping("/{id}")
    public Responses.FacturaResponse buscar(
            @Parameter(description = "Id de la factura", example = "1") @PathVariable Long id) {
        var r = facturas.buscarPorId(id);
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return Responses.FacturaResponse.desde(r.getValue());
    }

    /** Descarga el PDF. Por que: bytes directos evitan almacenamiento temporal en servidor. */
    @Operation(summary = "Descargar PDF", description = "Plantilla Rent a car Sys con datos, tabla y totales (RF-06.3)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "PDF generado",
                    content = @Content(mediaType = "application/pdf",
                            schema = @Schema(type = "string", format = "binary"))),
            @ApiResponse(responseCode = "404", description = "Factura no encontrada")
    })
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> pdf(
            @Parameter(description = "Id de la factura", example = "1") @PathVariable Long id) {
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
