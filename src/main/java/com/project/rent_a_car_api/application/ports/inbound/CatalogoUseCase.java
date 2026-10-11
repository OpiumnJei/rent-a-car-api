package com.project.rent_a_car_api.application.ports.inbound;

import com.project.rent_a_car_api.domain.model.Tarifa;
import com.project.rent_a_car_api.domain.model.TipoVehiculo;
import com.project.rent_a_car_api.domain.result.Result;

import java.math.BigDecimal;
import java.util.List;

/**
 * Caso de uso de tipos y tarifas (RF-01.2).
 * Por que: crear tipo + definir tarifa activa desactivando la anterior
 * garantiza un solo costo vigente por tipo.
 */
public interface CatalogoUseCase {
    Result<TipoVehiculo> registrarTipo(String nombre);

    Result<Tarifa> definirTarifa(Long tipoVehiculoId, BigDecimal precioPorDia);

    Result<List<TipoVehiculo>> listarTipos();

    Result<List<Tarifa>> listarTarifasActivas();
}
