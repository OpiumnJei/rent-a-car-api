package com.project.rent_a_car_api.application.ports.inbound;

import com.project.rent_a_car_api.domain.model.Contrato;
import com.project.rent_a_car_api.domain.result.Result;

import java.math.BigDecimal;

/**
 * Caso de uso de contratos (RF-04).
 * Por que: genera contrato Activo desde reserva confirmada con
 * empleado, garantia y total estimado.
 */
public interface ContratoUseCase {
    Result<Contrato> generar(Long reservaId, Long empleadoId, BigDecimal montoGarantia);

    Result<Contrato> buscarPorId(Long id);
}
