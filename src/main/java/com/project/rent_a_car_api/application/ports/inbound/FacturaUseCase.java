package com.project.rent_a_car_api.application.ports.inbound;

import com.project.rent_a_car_api.domain.model.Factura;
import com.project.rent_a_car_api.domain.result.Result;

import java.time.LocalDate;
import java.util.List;

/**
 * Caso de uso de facturacion (RF-06).
 * Por que del cambio: dos momentos de cobro. emitir crea la INICIAL tras la salida
 * (se cobra antes de entregar); emitirComplementaria crea la COMPLEMENTARIA tras la
 * entrada solo con cargos de devolucion, sin mutar la inicial.
 */
public interface FacturaUseCase {
    Result<Factura> emitir(Long contratoId, LocalDate fechaDevolucion);

    Result<Factura> emitirComplementaria(Long facturaInicialId, LocalDate fechaDevolucion);

    Result<Factura> buscarPorId(Long id);

    Result<List<Factura>> listarTodas();

    Result<byte[]> generarPdf(Long facturaId);
}
