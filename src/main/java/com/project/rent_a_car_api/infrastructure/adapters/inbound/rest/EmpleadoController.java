package com.project.rent_a_car_api.infrastructure.adapters.inbound.rest;

import com.project.rent_a_car_api.application.ports.inbound.EmpleadoUseCase;
import com.project.rent_a_car_api.domain.exception.DomainException;
import com.project.rent_a_car_api.domain.model.RolEmpleado;
import com.project.rent_a_car_api.domain.result.DomainError;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
 * Controller minimo de empleados (base para fase auth).
 * Por que: sin alta de empleados el FK EMPLEADO bloquearia contratos/inspecciones;
 * el password se codifica con BCrypt en el servicio y el login JWT llega despues.
 * Por que del cambio: anotaciones OpenAPI con roles y 409 de username duplicado.
 */
@RestController
@RequestMapping("/api/v1/empleados")
@Tag(name = "Empleados", description = "Alta y consulta de empleados con roles (base de auth)")
public class EmpleadoController {

    private final EmpleadoUseCase empleados;

    public EmpleadoController(EmpleadoUseCase empleados) {
        this.empleados = empleados;
    }

    /** Request de alta. Por que: record local para no tocar DTOs compartidos en este cambio. */
    @Schema(description = "Alta de empleado con username unico y password BCrypt")
    public record EmpleadoRequest(
            @Schema(description = "Id de la sucursal asignada", example = "1") @NotNull Long sucursalId,
            @Schema(description = "Nombre completo", example = "Ana Martinez") @NotBlank String nombre,
            @Schema(description = "Usuario unico para login", example = "ana.m") @NotBlank String username,
            @Schema(description = "Clave (se guarda hasheada, nunca se devuelve)", example = "Clave123*") @NotBlank String password,
            @Schema(description = "Rol operativo", allowableValues = {"ADMINISTRADOR", "AGENTE", "MECANICO"}, example = "AGENTE") @NotBlank String rol) {
    }

    /** Response sin exponer el hash. Por que: nunca se devuelve el password. */
    @Schema(description = "Empleado sin credenciales expuestas")
    public record EmpleadoResponse(Long id, Long sucursalId, String nombre, String username, String rol, boolean activo) {
    }

    @Operation(summary = "Registrar empleado", description = "Alta con sucursal, username unico y rol; password con BCrypt")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Empleado creado"),
            @ApiResponse(responseCode = "400", description = "Validacion fallida o rol invalido"),
            @ApiResponse(responseCode = "404", description = "Sucursal no encontrada"),
            @ApiResponse(responseCode = "409", description = "Username ya registrado")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmpleadoResponse registrar(@Valid @RequestBody EmpleadoRequest req) {
        RolEmpleado rol;
        try {
            rol = RolEmpleado.valueOf(req.rol().trim().toUpperCase());
        } catch (Exception ex) {
            throw new DomainException(DomainError.validation("Rol invalido (ADMINISTRADOR, AGENTE, MECANICO): " + req.rol()));
        }
        var r = empleados.registrar(req.sucursalId(), req.nombre(), req.username(), req.password(), rol);
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        var e = r.getValue();
        return new EmpleadoResponse(e.id(), e.sucursalId(), e.nombre(), e.username(), e.rol().name(), e.activo());
    }

    @Operation(summary = "Listar empleados", description = "Nomina completa sin exponer hashes")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Listado obtenido")
    })
    @GetMapping
    public List<EmpleadoResponse> listar() {
        var r = empleados.listar();
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return r.getValue().stream()
                .map(e -> new EmpleadoResponse(e.id(), e.sucursalId(), e.nombre(), e.username(), e.rol().name(), e.activo())).toList();
    }

    @Operation(summary = "Buscar empleado", description = "Detalle sin credenciales por id")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Empleado encontrado"),
            @ApiResponse(responseCode = "404", description = "Empleado no encontrado")
    })
    @GetMapping("/{id}")
    public EmpleadoResponse buscar(
            @Parameter(description = "Id del empleado", example = "1") @PathVariable Long id) {
        var r = empleados.buscarPorId(id);
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        var e = r.getValue();
        return new EmpleadoResponse(e.id(), e.sucursalId(), e.nombre(), e.username(), e.rol().name(), e.activo());
    }
}
