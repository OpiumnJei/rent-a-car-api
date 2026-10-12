package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.adapter;

import com.project.rent_a_car_api.application.ports.outbound.FacturaRepositoryPort;
import com.project.rent_a_car_api.domain.model.Factura;
import com.project.rent_a_car_api.domain.model.TipoFactura;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.FacturaDetalleEntity;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.FacturaEntity;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository.FacturaJpaRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Adaptador de facturas (RF-06.2).
 * Por que: persiste cabecera con detalles en cascada en una sola llamada,
 * garantizando atomicidad con @Transactional del caso de uso.
 * Por que del cambio: mapea tipo y factura_origen_id de la V2.
 */
@Component
public class FacturaPersistenceAdapter implements FacturaRepositoryPort {

    private final FacturaJpaRepository jpa;

    public FacturaPersistenceAdapter(FacturaJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Factura guardar(Factura d) {
        FacturaEntity e = new FacturaEntity();
        e.setId(d.id());
        e.setContratoId(d.contratoId());
        e.setTipo(d.tipo() == null ? TipoFactura.INICIAL.name() : d.tipo().name());
        e.setFacturaOrigenId(d.facturaOrigenId());
        e.setSubtotal(d.subtotal());
        e.setCargos(d.cargos());
        e.setImpuestos(d.impuestos());
        e.setTotal(d.total());
        e.setFecha(d.fecha() == null ? LocalDateTime.now() : d.fecha());
        if (d.detalles() != null) {
            // Por que: con mappedBy el detalle es dueno de la FK; hay que fijar
            // ambos lados para que el INSERT incluya factura_id.
            e.setDetalles(d.detalles().stream().map(det -> {
                FacturaDetalleEntity de = new FacturaDetalleEntity();
                de.setFactura(e);
                de.setConcepto(det.concepto());
                de.setCantidad(det.cantidad());
                de.setPrecioUnitario(det.precioUnitario());
                de.setSubtotal(det.subtotal());
                return de;
            }).toList());
        }
        return aDominio(jpa.save(e));
    }

    @Override
    public Optional<Factura> buscarPorId(Long id) {
        return jpa.findById(id).map(this::aDominio);
    }

    @Override
    public Optional<Factura> buscarInicialPorContrato(Long contratoId) {
        // Por que: la invariante "una inicial por contrato" vive en el indice filtrado V2.
        return jpa.findByContratoIdAndTipo(contratoId, TipoFactura.INICIAL.name()).map(this::aDominio);
    }

    @Override
    public List<Factura> listarPorContrato(Long contratoId) {
        return jpa.findByContratoId(contratoId).stream().map(this::aDominio).toList();
    }

    @Override
    public List<Factura> listarTodas() {
        return jpa.findAll().stream().map(this::aDominio).toList();
    }

    private Factura aDominio(FacturaEntity e) {
        List<Factura.FacturaDetalle> dets = e.getDetalles() == null ? List.of() : e.getDetalles().stream()
                .map(de -> new Factura.FacturaDetalle(de.getConcepto(), de.getCantidad(), de.getPrecioUnitario(), de.getSubtotal())).toList();
        return new Factura(e.getId(), e.getContratoId(), TipoFactura.valueOf(e.getTipo()), e.getFacturaOrigenId(),
                e.getSubtotal(), e.getCargos(), e.getImpuestos(), e.getTotal(), e.getFecha(), dets);
    }
}
