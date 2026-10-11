package com.project.rent_a_car_api.application.ports.inbound;

import com.project.rent_a_car_api.domain.model.Empleado;
import com.project.rent_a_car_api.domain.model.RolEmpleado;
import com.project.rent_a_car_api.domain.result.Result;

import java.util.List;

/**
 * Caso de uso minimo de empleados (alta y consulta).
 * Por que: sin esto el FK EMPLEADO en CONTRATO/INSPECCION bloquearia el flujo;
 * el login JWT y el hash definitivo llegan en fase auth, aqui solo se deja
 * la base operativa con password ya codificado por el servicio.
 */
public interface EmpleadoUseCase {
    Result<Empleado> registrar(Long sucursalId, String nombre, String username, String password, RolEmpleado rol);

    Result<List<Empleado>> listar();

    Result<Empleado> buscarPorId(Long id);
}
