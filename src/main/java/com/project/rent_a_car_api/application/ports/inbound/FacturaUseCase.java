package com.project.rent_a_car_api.application.ports.inbound;

import com.project.rent_a_car_api.domain.model.Factura;
import com.project.rent_a_car_api.domain.result.Result;

import java.time.LocalDate;
import java.util.List;

/**
 * Caso de uso de facturacion (RF-06).
 * Por que: consolida tarifa + cargos de inspeccion + ITBIS y persiste
 * cabecera con detalles para luego renderizar PDF.
 */
public interface FacturaUseCase {
    Result<Factura> emitir(Long contratoId, LocalDate fechaDevolucion);

    Result<Factura> buscarPorId(Long id);

    Result<List<Factura>> listarTodas();

    Result<byte[]> generarPdf(Long facturaId);
}
