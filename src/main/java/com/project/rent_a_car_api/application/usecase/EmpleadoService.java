package com.project.rent_a_car_api.application.usecase;

import com.project.rent_a_car_api.application.ports.inbound.EmpleadoUseCase;
import com.project.rent_a_car_api.application.ports.outbound.EmpleadoRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.SucursalRepositoryPort;
import com.project.rent_a_car_api.domain.model.Empleado;
import com.project.rent_a_car_api.domain.model.RolEmpleado;
import com.project.rent_a_car_api.domain.result.DomainError;
import com.project.rent_a_car_api.domain.result.Result;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Caso de uso minimo de empleados.
 * Por que: valida sucursal existente y username unico, codifica el password con
 * BCrypt desde ya para dejarlo listo para el login JWT; retorna Result en todo.
 */
@Service
public class EmpleadoService implements EmpleadoUseCase {

    private final EmpleadoRepositoryPort empleados;
    private final SucursalRepositoryPort sucursales;
    private final PasswordEncoder encoder;

    public EmpleadoService(EmpleadoRepositoryPort empleados, SucursalRepositoryPort sucursales, PasswordEncoder encoder) {
        this.empleados = empleados;
        this.sucursales = sucursales;
        this.encoder = encoder;
    }

    @Override
    @Transactional
    public Result<Empleado> registrar(Long sucursalId, String nombre, String username, String password, RolEmpleado rol) {
        if (sucursales.buscarPorId(sucursalId).isEmpty()) {
            return Result.fail(DomainError.notFound("Sucursal no encontrada: " + sucursalId));
        }
        if (username != null && empleados.buscarPorUsername(username.trim()).isPresent()) {
            return Result.fail(DomainError.conflict("Username ya registrado: " + username));
        }
        Result<Empleado> creado = Empleado.crear(null, sucursalId, nombre, username, password, rol, true);
        if (creado.isFailure()) {
            return creado;
        }
        // Por que: nunca se persiste en claro; BCrypt genera hash de 60+ chars apto para NVARCHAR(255).
        Empleado conHash = new Empleado(null, sucursalId, creado.getValue().nombre(),
                creado.getValue().username(), encoder.encode(password), rol, true);
        return Result.ok(empleados.guardar(conHash));
    }

    @Override
    @Transactional(readOnly = true)
    public Result<List<Empleado>> listar() {
        return Result.ok(empleados.listarTodos());
    }

    @Override
    @Transactional(readOnly = true)
    public Result<Empleado> buscarPorId(Long id) {
        var e = empleados.buscarPorId(id);
        if (e.isEmpty()) {
            return Result.fail(DomainError.notFound("Empleado no encontrado: " + id));
        }
        return Result.ok(e.get());
    }
}
