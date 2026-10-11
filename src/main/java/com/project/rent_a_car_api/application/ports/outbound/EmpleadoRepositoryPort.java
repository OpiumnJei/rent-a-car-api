package com.project.rent_a_car_api.application.ports.outbound;

import com.project.rent_a_car_api.domain.model.Empleado;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de salida para empleados.
 * Por que: el caso de uso valida existencia y username unico sin conocer JPA;
 * en fase auth se agregara busqueda por username para el login JWT.
 */
public interface EmpleadoRepositoryPort {
    Empleado guardar(Empleado empleado);

    Optional<Empleado> buscarPorId(Long id);

    Optional<Empleado> buscarPorUsername(String username);

    List<Empleado> listarTodos();
}
