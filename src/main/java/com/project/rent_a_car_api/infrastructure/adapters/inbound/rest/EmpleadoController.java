package com.project.rent_a_car_api.infrastructure.adapters.inbound.rest;

import com.project.rent_a_car_api.application.ports.inbound.EmpleadoUseCase;
import com.project.rent_a_car_api.domain.exception.DomainException;
import com.project.rent_a_car_api.domain.model.RolEmpleado;
import com.project.rent_a_car_api.domain.result.DomainError;
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
 */
@RestController
@RequestMapping("/api/v1/empleados")
public class EmpleadoController {

    private final EmpleadoUseCase empleados;

    public EmpleadoController(EmpleadoUseCase empleados) {
        this.empleados = empleados;
    }

    /** Request de alta. Por que: record local para no tocar DTOs compartidos en este cambio. */
    public record EmpleadoRequest(@NotNull Long sucursalId, @NotBlank String nombre,
                                  @NotBlank String username, @NotBlank String password,
                                  @NotBlank String rol) {
    }

    /** Response sin exponer el hash. Por que: nunca se devuelve el password. */
    public record EmpleadoResponse(Long id, Long sucursalId, String nombre, String username, String rol, boolean activo) {
    }

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

    @GetMapping
    public List<EmpleadoResponse> listar() {
        var r = empleados.listar();
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        return r.getValue().stream()
                .map(e -> new EmpleadoResponse(e.id(), e.sucursalId(), e.nombre(), e.username(), e.rol().name(), e.activo())).toList();
    }

    @GetMapping("/{id}")
    public EmpleadoResponse buscar(@PathVariable Long id) {
        var r = empleados.buscarPorId(id);
        if (r.isFailure()) {
            throw new DomainException(r.getError());
        }
        var e = r.getValue();
        return new EmpleadoResponse(e.id(), e.sucursalId(), e.nombre(), e.username(), e.rol().name(), e.activo());
    }
}
