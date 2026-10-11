package com.project.rent_a_car_api.infrastructure.config;

import com.project.rent_a_car_api.application.ports.outbound.BillingParamsPort;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Parametros financieros de facturacion (prefijo {@code app.billing}).
 *
 * <p>En desarrollo se hardcodean en {@code application.properties}.
 * En produccion la fuente de verdad es la tabla PARAMETRO_FACTURACION;
 * estos valores actuan como respaldo/valor por defecto.
 * Por que del cambio: implementa BillingParamsPort para que application
 * dependa del puerto y no de esta clase de infraestructura (RNF-01).
 */
@Component
@ConfigurationProperties(prefix = "app.billing")
public class BillingProperties implements BillingParamsPort {

    /** Porcentaje de ITBIS, ej. 18 = 18%. */
    private BigDecimal itbisPercent = BigDecimal.valueOf(18);

    /** Costo por cada escalon de combustible faltante (LLENO -&gt; 3/4 -&gt; 1/2 -&gt; 1/4 -&gt; RESERVA). */
    private BigDecimal precioPorNivelCombustible = BigDecimal.valueOf(1500);

    /** Precio por kilometro excedido sobre el incluido. */
    private BigDecimal precioKmExtra = BigDecimal.valueOf(50);

    /** Kilometros incluidos por dia de alquiler. */
    private int kmIncluidoPorDia = 200;

    /** Recargo base por dano detectado en inspeccion de entrada. */
    private BigDecimal recargoDanio = BigDecimal.valueOf(8000);

    /** Recargo por dia de retraso en la devolucion. */
    private BigDecimal recargoRetrasoDia = BigDecimal.valueOf(1000);

    public BigDecimal getItbisPercent() {
        return itbisPercent;
    }

    public void setItbisPercent(BigDecimal itbisPercent) {
        this.itbisPercent = itbisPercent;
    }

    public BigDecimal getPrecioPorNivelCombustible() {
        return precioPorNivelCombustible;
    }

    public void setPrecioPorNivelCombustible(BigDecimal precioPorNivelCombustible) {
        this.precioPorNivelCombustible = precioPorNivelCombustible;
    }

    public BigDecimal getPrecioKmExtra() {
        return precioKmExtra;
    }

    public void setPrecioKmExtra(BigDecimal precioKmExtra) {
        this.precioKmExtra = precioKmExtra;
    }

    public int getKmIncluidoPorDia() {
        return kmIncluidoPorDia;
    }

    public void setKmIncluidoPorDia(int kmIncluidoPorDia) {
        this.kmIncluidoPorDia = kmIncluidoPorDia;
    }

    public BigDecimal getRecargoDanio() {
        return recargoDanio;
    }

    public void setRecargoDanio(BigDecimal recargoDanio) {
        this.recargoDanio = recargoDanio;
    }

    public BigDecimal getRecargoRetrasoDia() {
        return recargoRetrasoDia;
    }

    public void setRecargoRetrasoDia(BigDecimal recargoRetrasoDia) {
        this.recargoRetrasoDia = recargoRetrasoDia;
    }
}
