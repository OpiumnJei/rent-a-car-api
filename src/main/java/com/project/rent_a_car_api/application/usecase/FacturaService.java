package com.project.rent_a_car_api.application.usecase;

import com.project.rent_a_car_api.application.ports.inbound.FacturaUseCase;
import com.project.rent_a_car_api.application.ports.outbound.BillingParamsPort;
import com.project.rent_a_car_api.application.ports.outbound.ContratoRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.FacturaRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.InspeccionRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.PdfGeneratorPort;
import com.project.rent_a_car_api.application.ports.outbound.ReservaRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.TarifaRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.VehiculoRepositoryPort;
import com.project.rent_a_car_api.domain.model.Factura;
import com.project.rent_a_car_api.domain.model.TipoInspeccion;
import com.project.rent_a_car_api.domain.result.DomainError;
import com.project.rent_a_car_api.domain.result.Result;
import com.project.rent_a_car_api.domain.service.EvaluadorCargosInspeccionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * Caso de uso de facturacion (RF-06).
 * Por que: consolida subtotal por dias segun tarifa + cargos de inspeccion
 * (combustible, km, dano, retraso) + ITBIS; persiste cabecera con detalles
 * y delega el PDF al puerto generador. Retorna Result en todo.
 */
@Service
public class FacturaService implements FacturaUseCase {

    private final FacturaRepositoryPort facturas;
    private final ContratoRepositoryPort contratos;
    private final ReservaRepositoryPort reservas;
    private final VehiculoRepositoryPort vehiculos;
    private final TarifaRepositoryPort tarifas;
    private final InspeccionRepositoryPort inspecciones;
    private final BillingParamsPort billing;
    private final PdfGeneratorPort pdf;

    public FacturaService(FacturaRepositoryPort facturas, ContratoRepositoryPort contratos,
                          ReservaRepositoryPort reservas, VehiculoRepositoryPort vehiculos,
                          TarifaRepositoryPort tarifas, InspeccionRepositoryPort inspecciones,
                          BillingParamsPort billing, PdfGeneratorPort pdf) {
        this.facturas = facturas;
        this.contratos = contratos;
        this.reservas = reservas;
        this.vehiculos = vehiculos;
        this.tarifas = tarifas;
        this.inspecciones = inspecciones;
        this.billing = billing;
        this.pdf = pdf;
    }

    @Override
    @Transactional
    public Result<Factura> emitir(Long contratoId, LocalDate fechaDevolucion) {
        var contrato = contratos.buscarPorId(contratoId);
        if (contrato.isEmpty()) {
            return Result.fail(DomainError.notFound("Contrato no encontrado: " + contratoId));
        }
        if (facturas.buscarPorContrato(contratoId).isPresent()) {
            return Result.fail(DomainError.conflict("El contrato ya fue facturado"));
        }
        var reserva = reservas.buscarPorId(contrato.get().reservaId());
        if (reserva.isEmpty()) {
            return Result.fail(DomainError.notFound("Reserva del contrato no encontrada"));
        }
        var vehiculo = vehiculos.buscarPorId(reserva.get().vehiculoId());
        if (vehiculo.isEmpty()) {
            return Result.fail(DomainError.notFound("Vehiculo de la reserva no encontrado"));
        }
        var tarifa = tarifas.buscarActivaPorTipo(vehiculo.get().tipoVehiculoId());
        if (tarifa.isEmpty()) {
            return Result.fail(DomainError.validation("Sin tarifa activa para el tipo de vehiculo"));
        }
        var lista = inspecciones.listarPorContrato(contratoId);
        var salida = lista.stream().filter(i -> i.tipo() == TipoInspeccion.SALIDA).findFirst();
        var entrada = lista.stream().filter(i -> i.tipo() == TipoInspeccion.ENTRADA).findFirst();
        if (salida.isEmpty() || entrada.isEmpty()) {
            return Result.fail(DomainError.validation("Se requieren inspecciones de salida y entrada para facturar"));
        }
        long dias = ChronoUnit.DAYS.between(reserva.get().fechaInicio(), reserva.get().fechaFin()) + 1;
        dias = Math.max(1, dias);
        BigDecimal subtotal = tarifa.get().precioPorDia().multiply(BigDecimal.valueOf(dias));

        // Por que: cargos delegados al servicio de dominio puro con parametros de BillingProperties.
        var calculo = EvaluadorCargosInspeccionService.calcular(salida.get(), entrada.get(), (int) dias,
                reserva.get().fechaFin(), fechaDevolucion == null ? reserva.get().fechaFin() : fechaDevolucion,
                billing.getPrecioPorNivelCombustible(), billing.getPrecioKmExtra(), billing.getKmIncluidoPorDia(),
                billing.getRecargoDanio(), billing.getRecargoRetrasoDia());
        if (calculo.isFailure()) {
            return Result.fail(calculo.getError());
        }
        BigDecimal cargos = calculo.getValue().totalCargos();
        BigDecimal base = subtotal.add(cargos);
        BigDecimal impuestos = base.multiply(billing.getItbisPercent())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal total = base.add(impuestos);

        List<Factura.FacturaDetalle> detalles = new ArrayList<>();
        detalles.add(new Factura.FacturaDetalle("Alquiler " + dias + " dias x " + tarifa.get().precioPorDia(),
                BigDecimal.valueOf(dias), tarifa.get().precioPorDia(), subtotal));
        detalles.addAll(calculo.getValue().detalles());

        Factura factura = new Factura(null, contratoId, subtotal, cargos, impuestos, total, LocalDateTime.now(), detalles);
        return Result.ok(facturas.guardar(factura));
    }

    @Override
    @Transactional(readOnly = true)
    public Result<Factura> buscarPorId(Long id) {
        var f = facturas.buscarPorId(id);
        if (f.isEmpty()) {
            return Result.fail(DomainError.notFound("Factura no encontrada: " + id));
        }
        return Result.ok(f.get());
    }

    @Override
    @Transactional(readOnly = true)
    public Result<List<Factura>> listarTodas() {
        return Result.ok(facturas.listarTodas());
    }

    @Override
    @Transactional(readOnly = true)
    public Result<byte[]> generarPdf(Long facturaId) {
        if (facturas.buscarPorId(facturaId).isEmpty()) {
            return Result.fail(DomainError.notFound("Factura no encontrada: " + facturaId));
        }
        try {
            // Por que: el adaptador Jasper puede lanzar excepcion tecnica; se envuelve en Result.
            return Result.ok(pdf.generarFacturaPdf(facturaId));
        } catch (Exception ex) {
            return Result.fail(DomainError.validation("No se pudo generar el PDF: " + ex.getMessage()));
        }
    }
}
