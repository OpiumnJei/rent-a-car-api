package com.project.rent_a_car_api.application.ports.outbound;

import com.project.rent_a_car_api.domain.model.Factura;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de salida para facturas (RF-06.2).
 * Por que: persiste cabecera + detalles vinculados al contrato.
 * Por que del cambio: buscarPorContrato unico ya no existe (inicial + N
 * complementarias); se ofrece la inicial por separado y el listado por contrato.
 */
public interface FacturaRepositoryPort {
    Factura guardar(Factura factura);

    Optional<Factura> buscarPorId(Long id);

    Optional<Factura> buscarInicialPorContrato(Long contratoId);

    List<Factura> listarPorContrato(Long contratoId);

    List<Factura> listarTodas();
}
