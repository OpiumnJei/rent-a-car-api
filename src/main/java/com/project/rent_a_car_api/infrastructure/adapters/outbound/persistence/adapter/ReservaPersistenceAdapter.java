package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.adapter;

import com.project.rent_a_car_api.application.ports.outbound.ReservaRepositoryPort;
import com.project.rent_a_car_api.domain.model.EstadoReserva;
import com.project.rent_a_car_api.domain.model.Reserva;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.ReservaEntity;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository.ReservaJpaRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Adaptador de reservas (RF-03).
 * Por que del cambio: separado de contratos por colision de buscarPorId.
 */
@Component
public class ReservaPersistenceAdapter implements ReservaRepositoryPort {

    private final ReservaJpaRepository reservas;

    public ReservaPersistenceAdapter(ReservaJpaRepository reservas) {
        this.reservas = reservas;
    }

    @Override
    public Reserva guardar(Reserva d) {
        ReservaEntity e = new ReservaEntity();
        e.setId(d.id());
        e.setClienteId(d.clienteId());
        e.setVehiculoId(d.vehiculoId());
        e.setLicenciaId(d.licenciaId());
        e.setFechaInicio(d.fechaInicio());
        e.setFechaFin(d.fechaFin());
        e.setEstado(d.estado() == null ? EstadoReserva.CONFIRMADA.name() : d.estado().name());
        e.setTotalEstimado(d.totalEstimado());
        ReservaEntity g = reservas.save(e);
        return new Reserva(g.getId(), g.getClienteId(), g.getVehiculoId(), g.getLicenciaId(),
                g.getFechaInicio(), g.getFechaFin(), EstadoReserva.valueOf(g.getEstado()), g.getTotalEstimado());
    }

    @Override
    public Optional<Reserva> buscarPorId(Long id) {
        return reservas.findById(id).map(g -> new Reserva(g.getId(), g.getClienteId(), g.getVehiculoId(), g.getLicenciaId(),
                g.getFechaInicio(), g.getFechaFin(), EstadoReserva.valueOf(g.getEstado()), g.getTotalEstimado()));
    }

    @Override
    public List<Reserva> listarPorVehiculo(Long vehiculoId) {
        return reservas.findByVehiculoId(vehiculoId).stream().map(g -> new Reserva(g.getId(), g.getClienteId(),
                g.getVehiculoId(), g.getLicenciaId(), g.getFechaInicio(), g.getFechaFin(),
                EstadoReserva.valueOf(g.getEstado()), g.getTotalEstimado())).toList();
    }

    @Override
    public boolean existeSolape(Long vehiculoId, LocalDate inicio, LocalDate fin) {
        // Por que: delega al query JPQL para RF-03.2 sin cargar reservas.
        return reservas.existeSolape(vehiculoId, inicio, fin);
    }
}
