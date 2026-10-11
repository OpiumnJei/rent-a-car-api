package com.project.rent_a_car_api.application.ports.outbound;

/**
 * Puerto de salida para generar el PDF de factura (RF-06.3).
 * <p>
 * Por que: el caso de uso no conoce JasperReports; el adaptador PDF
 * implementa este contrato y devuelve los bytes del documento.
 */
public interface PdfGeneratorPort {

    /**
     * Genera el PDF de una factura ya persistida.
     * Por que: recibe el id para que el adaptador cargue datos o reciba el modelo.
     */
    byte[] generarFacturaPdf(Long facturaId);
}
