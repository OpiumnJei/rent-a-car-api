package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.adapter;

import com.project.rent_a_car_api.application.ports.outbound.ContratoRepositoryPort;
import com.project.rent_a_car_api.domain.model.Contrato;
import com.project.rent_a_car_api.domain.model.EstadoContrato;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.ContratoEntity;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository.ContratoJpaRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Adaptador de contratos (RF-04).
 * Por que: separado de reservas para evitar colision de buscarPorId.
 */
@Component
public class ContratoPersistenceAdapter implements ContratoRepositoryPort {

    private final ContratoJpaRepository contratos;

    public ContratoPersistenceAdapter(ContratoJpaRepository contratos) {
        this.contratos = contratos;
    }

    @Override
    public Contrato guardar(Contrato d) {
        ContratoEntity e = new ContratoEntity();
        e.setId(d.id());
        e.setReservaId(d.reservaId());
        e.setEmpleadoId(d.empleadoId());
        e.setMontoGarantia(d.montoGarantia());
        e.setTotalEstimado(d.totalEstimado());
        e.setEstado(d.estado() == null ? EstadoContrato.ACTIVO.name() : d.estado().name());
        e.setFechaCreacion(d.fechaCreacion() == null ? LocalDateTime.now() : d.fechaCreacion());
        ContratoEntity g = contratos.save(e);
        return new Contrato(g.getId(), g.getReservaId(), g.getEmpleadoId(), g.getMontoGarantia(),
                g.getTotalEstimado(), EstadoContrato.valueOf(g.getEstado()), g.getFechaCreacion());
    }

    @Override
    public Optional<Contrato> buscarPorId(Long id) {
        return contratos.findById(id).map(g -> new Contrato(g.getId(), g.getReservaId(), g.getEmpleadoId(),
                g.getMontoGarantia(), g.getTotalEstimado(), EstadoContrato.valueOf(g.getEstado()), g.getFechaCreacion()));
    }

    @Override
    public Optional<Contrato> buscarPorReserva(Long reservaId) {
        return contratos.findByReservaId(reservaId).map(g -> new Contrato(g.getId(), g.getReservaId(), g.getEmpleadoId(),
                g.getMontoGarantia(), g.getTotalEstimado(), EstadoContrato.valueOf(g.getEstado()), g.getFechaCreacion()));
    }

    @Override
    public List<Contrato> listarTodos() {
        return contratos.findAll().stream().map(g -> new Contrato(g.getId(), g.getReservaId(), g.getEmpleadoId(),
                g.getMontoGarantia(), g.getTotalEstimado(), EstadoContrato.valueOf(g.getEstado()), g.getFechaCreacion())).toList();
    }
}
