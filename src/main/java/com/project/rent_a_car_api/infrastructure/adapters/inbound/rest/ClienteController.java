package com.project.rent_a_car_api.infrastructure.adapters.inbound.rest;

import com.project.rent_a_car_api.application.ports.inbound.ClienteUseCase;
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
import org.springframework.web.bind.annotation.PutMapping;

import java.util.List;

/**
 * Controller de clientes y licencias (RF-02).
 * Por que: alta de cliente y registro de licencias con vigencia validada en servicio.
 * Por que del cambio: anotaciones OpenAPI para documentar alta, licencias y errores 409/404.
 */
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Clientes y licencias", description = "Alta de clientes y licencias de conducir (RF-02)")
public class ClienteController {

    private final ClienteUseCase clientes;

    public ClienteController(ClienteUseCase clientes) {
        this.clientes = clientes;
    }

    @Operation(summary = "Listar todos los clientes")
    @GetMapping("/clientes")
    public List<Responses.ClienteResponse> listarTodos() {
        var resultado = clientes.listarTodos();

        if (resultado.isFailure()) {
            throw new DomainException(resultado.getError());
        }

        return resultado.getValue()
                .stream()
                .map(Responses.ClienteResponse::desde)
                .toList();
    }

    @Operation(summary = "Buscar cliente por ID")
    @GetMapping("/clientes/{id}")
    public Responses.ClienteResponse buscarPorId(@PathVariable Long id) {
        var resultado = clientes.buscarPorId(id);

        if (resultado.isFailure()) {
            throw new DomainException(resultado.getError());
        }

        return Responses.ClienteResponse.desde(resultado.getValue());
    }

    @Operation(summary = "Buscar cliente por documento")
    @GetMapping("/clientes/documento/{documento}")
    public Responses.ClienteResponse buscarPorDocumento(
            @PathVariable String documento) {

        var resultado = clientes.buscarPorDocumento(documento);

        if (resultado.isFailure()) {
            throw new DomainException(resultado.getError());
        }

        return Responses.ClienteResponse.desde(resultado.getValue());
    }

    @Operation(summary = "Registrar cliente", description = "Alta por documento unico cedula/pasaporte (RF-02.1)")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Cliente creado"),
            @ApiResponse(responseCode = "400", description = "Validacion fallida"),
            @ApiResponse(responseCode = "409", description = "Documento ya registrado")
    })
    @PostMapping("/clientes")
    @ResponseStatus(HttpStatus.CREATED)
    public Responses.ClienteResponse registrar(@Valid @RequestBody Requests.ClienteRequest req) {
        var r = clientes.registrar(req.documento(), req.nombre(), req.apellido(), req.email(), req.telefono());
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return Responses.ClienteResponse.desde(r.getValue());
    }

    @Operation(summary = "Registrar licencia", description = "Asocia licencia al cliente para validar vigencia en reservas (RF-02.2)")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Licencia creada"),
            @ApiResponse(responseCode = "400", description = "Validacion fallida"),
            @ApiResponse(responseCode = "404", description = "Cliente no encontrado")
    })
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
    @Operation(summary = "Licencias del cliente", description = "Lista licencias para elegir la vigente al reservar")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Listado obtenido"),
            @ApiResponse(responseCode = "404", description = "Cliente no encontrado")
    })
    @GetMapping("/clientes/{id}/licencias")
    public List<Responses.LicenciaResponse> licencias(
            @Parameter(description = "Id del cliente", example = "1") @PathVariable Long id) {
        var r = clientes.licenciasDeCliente(id);
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return r.getValue().stream().map(Responses.LicenciaResponse::desde).toList();
    }

    @PutMapping("/licencias/{id}")
    public Responses.LicenciaResponse actualizarLicencia(
        @PathVariable Long id,
        @Valid @RequestBody ActualizarLicenciaRequest req) {

    var resultado = clientes.actualizarLicencia(
            id,
            req.numero(),
            req.fechaExpiracion(),
            req.categoria()
    );

    if (resultado.isFailure()) {
        throw new DomainException(resultado.getError());
    }

    return Responses.LicenciaResponse.desde(resultado.getValue());
    }

    public record ActualizarLicenciaRequest(
        @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max = 30) String numero,
        @jakarta.validation.constraints.NotNull java.time.LocalDate fechaExpiracion,
        @jakarta.validation.constraints.Size(max = 10) String categoria
    ) {}
}
