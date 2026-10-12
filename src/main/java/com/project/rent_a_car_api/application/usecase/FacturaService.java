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
import com.project.rent_a_car_api.domain.model.TipoFactura;
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
 * Caso de uso de facturacion en dos tiempos (RF-06).
 * Por que del cambio: el negocio cobra antes de entregar, asi que la INICIAL se emite
 * tras la inspeccion de SALIDA (dias x tarifa + ITBIS, cargos 0) y la COMPLEMENTARIA
 * tras la ENTRADA solo con cargos de devolucion. La inicial nunca se muta.
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
        // Por que: invariante "una inicial por contrato" (indice filtrado V2).
        if (facturas.buscarInicialPorContrato(contratoId).isPresent()) {
            return Result.fail(DomainError.conflict("El contrato ya tiene factura inicial"));
        }
        var datos = cargarDatosContrato(contrato.get().reservaId());
        if (datos.isFailure()) {
            return Result.fail(datos.getError());
        }
        // Por que: la inicial se emite tras la salida (deja km/combustible base y
        // el vehiculo en ALQUILADO); no exige entrada para no bloquear el cobro previo.
        boolean haySalida = inspecciones.listarPorContrato(contratoId).stream()
                .anyMatch(i -> i.tipo() == TipoInspeccion.SALIDA);
        if (!haySalida) {
            return Result.fail(DomainError.validation("Se requiere la inspeccion de salida para facturar"));
        }
        var ctx = datos.getValue();
        BigDecimal subtotal = ctx.precioPorDia().multiply(BigDecimal.valueOf(ctx.dias()));
        BigDecimal impuestos = impuestoDe(subtotal);
        BigDecimal total = subtotal.add(impuestos);
        List<Factura.FacturaDetalle> detalles = List.of(new Factura.FacturaDetalle(
                "Alquiler " + ctx.dias() + " dias x " + ctx.precioPorDia(),
                BigDecimal.valueOf(ctx.dias()), ctx.precioPorDia(), subtotal));
        Factura factura = new Factura(null, contratoId, TipoFactura.INICIAL, null,
                subtotal, BigDecimal.ZERO, impuestos, total, LocalDateTime.now(), detalles);
        return Result.ok(facturas.guardar(factura));
    }

    @Override
    @Transactional
    public Result<Factura> emitirComplementaria(Long facturaInicialId, LocalDate fechaDevolucion) {
        var inicial = facturas.buscarPorId(facturaInicialId);
        if (inicial.isEmpty()) {
            return Result.fail(DomainError.notFound("Factura no encontrada: " + facturaInicialId));
        }
        // Por que: la complementaria siempre cuelga de una inicial (trazabilidad fiscal).
        if (inicial.get().tipo() != TipoFactura.INICIAL) {
            return Result.fail(DomainError.validation("Solo una factura inicial genera complementaria"));
        }
        Long contratoId = inicial.get().contratoId();
        var contrato = contratos.buscarPorId(contratoId);
        if (contrato.isEmpty()) {
            return Result.fail(DomainError.notFound("Contrato no encontrado: " + contratoId));
        }
        var datos = cargarDatosContrato(contrato.get().reservaId());
        if (datos.isFailure()) {
            return Result.fail(datos.getError());
        }
        var lista = inspecciones.listarPorContrato(contratoId);
        var salida = lista.stream().filter(i -> i.tipo() == TipoInspeccion.SALIDA).findFirst();
        var entrada = lista.stream().filter(i -> i.tipo() == TipoInspeccion.ENTRADA).findFirst();
        if (salida.isEmpty() || entrada.isEmpty()) {
            return Result.fail(DomainError.validation("Se requieren inspecciones de salida y entrada para la complementaria"));
        }
        var ctx = datos.getValue();
        // Por que: cargos delegados al servicio de dominio puro con parametros de BillingProperties.
        var calculo = EvaluadorCargosInspeccionService.calcular(salida.get(), entrada.get(), (int) ctx.dias(),
                ctx.fechaFin(), fechaDevolucion == null ? ctx.fechaFin() : fechaDevolucion,
                billing.getPrecioPorNivelCombustible(), billing.getPrecioKmExtra(), billing.getKmIncluidoPorDia(),
                billing.getRecargoDanio(), billing.getRecargoRetrasoDia());
        if (calculo.isFailure()) {
            return Result.fail(calculo.getError());
        }
        BigDecimal cargos = calculo.getValue().totalCargos();
        // Por que: sin cargos no hay documento fiscal (evita complementarias en cero).
        if (cargos.signum() <= 0) {
            return Result.fail(DomainError.conflict("La devolucion no genero cargos adicionales"));
        }
        BigDecimal impuestos = impuestoDe(cargos);
        BigDecimal total = cargos.add(impuestos);
        Factura comp = new Factura(null, contratoId, TipoFactura.COMPLEMENTARIA, facturaInicialId,
                BigDecimal.ZERO, cargos, impuestos, total, LocalDateTime.now(), calculo.getValue().detalles());
        return Result.ok(facturas.guardar(comp));
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

    /**
     * Datos comunes del contrato para ambas facturas.
     * Por que: evita duplicar la carga contrato-reserva-vehiculo-tarifa en emitir
     * y emitirComplementaria; retorna Result para propagar 404/400.
     */
    private Result<ContextoContrato> cargarDatosContrato(Long reservaId) {
        var reserva = reservas.buscarPorId(reservaId);
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
        long dias = Math.max(1, ChronoUnit.DAYS.between(reserva.get().fechaInicio(), reserva.get().fechaFin()) + 1);
        return Result.ok(new ContextoContrato(dias, tarifa.get().precioPorDia(), reserva.get().fechaFin()));
    }

    /**
     * ITBIS sobre una base.
     * Por que: formula unica para inicial (sobre subtotal) y complementaria (sobre cargos).
     */
    private BigDecimal impuestoDe(BigDecimal base) {
        return base.multiply(billing.getItbisPercent())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    /** Agrupa lo necesario del contrato. Por que: record privado del servicio. */
    private record ContextoContrato(long dias, BigDecimal precioPorDia, LocalDate fechaFin) {
    }
}
