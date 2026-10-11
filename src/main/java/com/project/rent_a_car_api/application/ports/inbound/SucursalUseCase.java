package com.project.rent_a_car_api.application.ports.inbound;

import com.project.rent_a_car_api.domain.model.Sucursal;
import com.project.rent_a_car_api.domain.result.Result;

import java.util.List;

/**
 * Caso de uso de sucursales (RF-01.1).
 * Por que: inbound port que el controller invoca; retorna Result en todo.
 */
public interface SucursalUseCase {
    Result<Sucursal> registrar(String nombre, String direccion, String telefono);

    Result<List<Sucursal>> listar(boolean soloActivas);
}
