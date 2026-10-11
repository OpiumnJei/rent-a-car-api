package com.project.rent_a_car_api.infrastructure.adapters.outbound.pdf;

import com.project.rent_a_car_api.application.ports.outbound.FacturaRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.PdfGeneratorPort;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Adaptador JasperReports para el PDF de factura (RF-06.3).
 * Por que: compila el jrxml del classpath una vez por llamada simple (suficiente
 * para RNF <1.5s en facturas pequenas); recibe datos del repositorio de facturas
 * para no acoplar el caso de uso a Jasper.
 */
@Component
public class JasperFacturaPdfAdapter implements PdfGeneratorPort {

    private final FacturaRepositoryPort facturas;

    public JasperFacturaPdfAdapter(FacturaRepositoryPort facturas) {
        this.facturas = facturas;
    }

    @Override
    public byte[] generarFacturaPdf(Long facturaId) {
        var factura = facturas.buscarPorId(facturaId)
                .orElseThrow(() -> new IllegalArgumentException("Factura no encontrada: " + facturaId));
        try (InputStream jrxml = new ClassPathResource("reports/factura.jrxml").getInputStream()) {
            // Por que: compilar en memoria evita archivos .jasper versionados.
            JasperReport report = JasperCompileManager.compileReport(jrxml);
            Map<String, Object> params = new HashMap<>();
            params.put("facturaId", factura.id());
            params.put("contratoId", factura.contratoId());
            params.put("subtotal", factura.subtotal());
            params.put("cargos", factura.cargos());
            params.put("impuestos", factura.impuestos());
            params.put("total", factura.total());
            List<Map<String, Object>> lineas = factura.detalles() == null ? List.of() : factura.detalles().stream()
                    .map(d -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("concepto", d.concepto());
                        m.put("cantidad", d.cantidad());
                        m.put("precioUnitario", d.precioUnitario());
                        m.put("subtotal", d.subtotal());
                        return m;
                    }).toList();
            JasperPrint print = JasperFillManager.fillReport(report, params, new JRBeanCollectionDataSource(lineas));
            // Por que: exporta a bytes para descarga directa sin disco.
            return JasperExportManager.exportReportToPdf(print);
        } catch (Exception ex) {
            throw new IllegalStateException("No se pudo generar el PDF de la factura " + facturaId, ex);
        }
    }
}
