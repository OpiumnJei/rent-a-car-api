package com.project.rent_a_car_api.application.ports.outbound;

import com.project.rent_a_car_api.domain.model.Contrato;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de salida para contratos (RF-04).
 * Por que: una reserva solo genera un contrato; se busca por reserva.
 */
public interface ContratoRepositoryPort {
    Contrato guardar(Contrato contrato);

    Optional<Contrato> buscarPorId(Long id);

    Optional<Contrato> buscarPorReserva(Long reservaId);

    List<Contrato> listarTodos();
}
