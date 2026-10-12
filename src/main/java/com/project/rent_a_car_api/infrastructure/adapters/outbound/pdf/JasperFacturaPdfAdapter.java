package com.project.rent_a_car_api.infrastructure.adapters.outbound.pdf;

import com.project.rent_a_car_api.application.ports.outbound.ClienteRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.ContratoRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.FacturaRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.PdfGeneratorPort;
import com.project.rent_a_car_api.application.ports.outbound.ReservaRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.VehiculoRepositoryPort;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Adaptador JasperReports para el PDF de factura (RF-06.3).
 * Por que: compila el jrxml del classpath una vez por llamada simple (suficiente
 * para RNF <1.5s en facturas pequenas); recibe datos del repositorio de facturas
 * para no acoplar el caso de uso a Jasper.
 * Por que del cambio: la plantilla redisenada muestra cliente, vehiculo, periodo y
 * tipo de documento, asi que el adaptador resuelve contrato-reserva-cliente-vehiculo
 * con los puertos de lectura ya existentes (solo lectura, sin logica de negocio).
 */
@Component
public class JasperFacturaPdfAdapter implements PdfGeneratorPort {

    private static final DateTimeFormatter FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter FECHA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final FacturaRepositoryPort facturas;
    private final ContratoRepositoryPort contratos;
    private final ReservaRepositoryPort reservas;
    private final ClienteRepositoryPort clientes;
    private final VehiculoRepositoryPort vehiculos;

    public JasperFacturaPdfAdapter(FacturaRepositoryPort facturas, ContratoRepositoryPort contratos,
                                   ReservaRepositoryPort reservas, ClienteRepositoryPort clientes,
                                   VehiculoRepositoryPort vehiculos) {
        this.facturas = facturas;
        this.contratos = contratos;
        this.reservas = reservas;
        this.clientes = clientes;
        this.vehiculos = vehiculos;
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
            params.put("tipo", factura.tipo().name());
            params.put("facturaOrigenId", factura.facturaOrigenId());
            params.put("contratoId", factura.contratoId());
            params.put("fechaEmision", factura.fecha() == null ? "" : factura.fecha().format(FECHA_HORA));
            params.put("subtotal", factura.subtotal());
            params.put("cargos", factura.cargos());
            params.put("impuestos", factura.impuestos());
            params.put("total", factura.total());
            // Por que: datos descriptivos para el encabezado del PDF (N/D si falta algo).
            params.putAll(datosOperacion(factura.contratoId()));
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

    /**
     * Resuelve nombres de cliente/vehiculo y periodo para el encabezado.
     * Por que: metodo separado para mantener legible el flujo principal; todo
     * Optional con N/D para que un dato faltante no tumbe el PDF.
     */
    private Map<String, Object> datosOperacion(Long contratoId) {
        String clienteNombre = "N/D";
        String clienteDocumento = "N/D";
        String vehiculoPlaca = "N/D";
        String vehiculoDescripcion = "N/D";
        String periodo = "N/D";
        var contrato = contratos.buscarPorId(contratoId);
        if (contrato.isPresent()) {
            var reserva = reservas.buscarPorId(contrato.get().reservaId());
            if (reserva.isPresent()) {
                var r = reserva.get();
                periodo = r.fechaInicio().format(FECHA) + " - " + r.fechaFin().format(FECHA);
                var cliente = clientes.buscarPorId(r.clienteId());
                if (cliente.isPresent()) {
                    clienteNombre = cliente.get().nombre() + (cliente.get().apellido() == null ? "" : " " + cliente.get().apellido());
                    clienteDocumento = cliente.get().documento();
                }
                var vehiculo = vehiculos.buscarPorId(r.vehiculoId());
                if (vehiculo.isPresent()) {
                    vehiculoPlaca = vehiculo.get().placa();
                    vehiculoDescripcion = ((vehiculo.get().marca() == null ? "" : vehiculo.get().marca() + " ")
                            + (vehiculo.get().modelo() == null ? "" : vehiculo.get().modelo())).trim();
                    if (vehiculoDescripcion.isEmpty()) {
                        vehiculoDescripcion = "N/D";
                    }
                }
            }
        }
        Map<String, Object> datos = new HashMap<>();
        datos.put("clienteNombre", clienteNombre);
        datos.put("clienteDocumento", clienteDocumento);
        datos.put("vehiculoPlaca", vehiculoPlaca);
        datos.put("vehiculoDescripcion", vehiculoDescripcion);
        datos.put("periodo", periodo);
        return datos;
    }
}
