package com.project.rent_a_car_api.domain.service;

import com.project.rent_a_car_api.domain.model.Inspeccion;
import com.project.rent_a_car_api.domain.model.NivelCombustible;
import com.project.rent_a_car_api.domain.result.DomainError;
import com.project.rent_a_car_api.domain.result.Result;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import com.project.rent_a_car_api.domain.model.Factura.FacturaDetalle;

/**
 * Servicio de dominio que calcula cargos derivados de la inspeccion (RF-05.5, RF-06.1).
 * <p>
 * Por que: dominio puro sin Spring; recibe precios por parametro para no depender
 * de BillingProperties (infraestructura) y cumplir RNF-01. Retorna Result en todo.
 */
public final class EvaluadorCargosInspeccionService {

    private EvaluadorCargosInspeccionService() {
        // Por que: clase utilitaria sin estado, evita instanciacion.
    }

    /**
     * Resultado del calculo con desglose.
     * Por que: record para transportar cargos + detalles facturables juntos.
     */
    public record CalculoCargos(BigDecimal cargoCombustible, BigDecimal cargoKmExtra,
                                BigDecimal cargoDanio, BigDecimal cargoRetraso,
                                BigDecimal totalCargos, List<FacturaDetalle> detalles) {
    }

    /**
     * Calcula cargos comparando salida vs entrada.
     * Por que: RF-05.5 combustible faltante, km excedido, dano y retraso.
     *
     * @param salida               inspeccion de salida obligatoria
     * @param entrada              inspeccion de entrada obligatoria
     * @param diasAlquiler         dias cobrados segun tarifa
     * @param fechaFinEsperada     fin contractual para detectar retraso
     * @param fechaDevolucion      fecha real de entrada
     * @param precioPorNivel       costo por escalon de combustible
     * @param precioKmExtra        costo por km sobre incluido
     * @param kmIncluidoPorDia     km libres por dia
     * @param recargoDanio         recargo base por dano
     * @param recargoRetrasoDia    recargo por dia de retraso
     * @return Result con el desglose o error de validacion
     */
    public static Result<CalculoCargos> calcular(Inspeccion salida, Inspeccion entrada, int diasAlquiler,
                                                 LocalDate fechaFinEsperada, LocalDate fechaDevolucion,
                                                 BigDecimal precioPorNivel, BigDecimal precioKmExtra,
                                                 int kmIncluidoPorDia, BigDecimal recargoDanio,
                                                 BigDecimal recargoRetrasoDia) {
        if (salida == null || entrada == null) {
            return Result.fail(DomainError.validation("Se requieren inspecciones de salida y entrada"));
        }
        if (entrada.kilometraje() < salida.kilometraje()) {
            return Result.fail(DomainError.validation("El kilometraje de entrada no puede ser menor al de salida"));
        }
        List<FacturaDetalle> detalles = new ArrayList<>();
        BigDecimal cero = BigDecimal.ZERO;

        // Por que: cada nivel faltante (LLENO->3/4->1/2->1/4->RESERVA) genera cargo fijo.
        NivelCombustible nSalida = salida.nivelCombustible();
        NivelCombustible nEntrada = entrada.nivelCombustible();
        int faltantes = nEntrada.nivelesFaltantesVs(nSalida);
        BigDecimal cargoComb = faltantes <= 0 ? cero : precioPorNivel.multiply(BigDecimal.valueOf(faltantes));
        if (cargoComb.signum() > 0) {
            detalles.add(new FacturaDetalle("Faltante combustible (" + faltantes + " niveles)",
                    BigDecimal.valueOf(faltantes), precioPorNivel, cargoComb));
        }

        // Por que: km recorrido menos incluido por dias; el exceso se cobra por km.
        int recorridos = entrada.kilometraje() - salida.kilometraje();
        int incluidos = Math.max(0, kmIncluidoPorDia * Math.max(1, diasAlquiler));
        int excedidos = Math.max(0, recorridos - incluidos);
        BigDecimal cargoKm = excedidos <= 0 ? cero : precioKmExtra.multiply(BigDecimal.valueOf(excedidos));
        if (cargoKm.signum() > 0) {
            detalles.add(new FacturaDetalle("Km extra (" + excedidos + " km)",
                    BigDecimal.valueOf(excedidos), precioKmExtra, cargoKm));
        }

        // Por que: si la entrada reporta dano, recargo base unico.
        BigDecimal cargoDan = entrada.reportaDanio() ? recargoDanio : cero;
        if (cargoDan.signum() > 0) {
            detalles.add(new FacturaDetalle("Recargo por daño detectado",
                    BigDecimal.ONE, recargoDanio, cargoDan));
        }

        // Por que: dias posteriores al fin contractual generan recargo diario.
        BigDecimal cargoRet = cero;
        if (fechaFinEsperada != null && fechaDevolucion != null && fechaDevolucion.isAfter(fechaFinEsperada)) {
            long diasRetraso = ChronoUnit.DAYS.between(fechaFinEsperada, fechaDevolucion);
            if (diasRetraso > 0) {
                cargoRet = recargoRetrasoDia.multiply(BigDecimal.valueOf(diasRetraso));
                detalles.add(new FacturaDetalle("Retraso devolucion (" + diasRetraso + " dias)",
                        BigDecimal.valueOf(diasRetraso), recargoRetrasoDia, cargoRet));
            }
        }

        BigDecimal total = cargoComb.add(cargoKm).add(cargoDan).add(cargoRet);
        return Result.ok(new CalculoCargos(cargoComb, cargoKm, cargoDan, cargoRet, total, detalles));
    }
}
