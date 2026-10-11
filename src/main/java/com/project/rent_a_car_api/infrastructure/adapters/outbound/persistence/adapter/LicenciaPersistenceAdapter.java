package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.adapter;

import com.project.rent_a_car_api.application.ports.outbound.LicenciaRepositoryPort;
import com.project.rent_a_car_api.domain.model.Licencia;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.LicenciaEntity;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository.LicenciaJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Adaptador de licencias (RF-02.2).
 * Por que: separado de clientes para evitar colision de buscarPorId.
 */
@Component
public class LicenciaPersistenceAdapter implements LicenciaRepositoryPort {

    private final LicenciaJpaRepository licencias;

    public LicenciaPersistenceAdapter(LicenciaJpaRepository licencias) {
        this.licencias = licencias;
    }

    @Override
    public Licencia guardar(Licencia d) {
        LicenciaEntity e = new LicenciaEntity();
        e.setId(d.id());
        e.setClienteId(d.clienteId());
        e.setNumero(d.numero());
        e.setFechaExpiracion(d.fechaExpiracion());
        e.setCategoria(d.categoria());
        e.setActiva(d.activa());
        LicenciaEntity g = licencias.save(e);
        return new Licencia(g.getId(), g.getClienteId(), g.getNumero(), g.getFechaExpiracion(), g.getCategoria(), g.isActiva());
    }

    @Override
    public Optional<Licencia> buscarPorId(Long id) {
        return licencias.findById(id).map(e -> new Licencia(e.getId(), e.getClienteId(), e.getNumero(), e.getFechaExpiracion(), e.getCategoria(), e.isActiva()));
    }

    @Override
    public List<Licencia> listarPorCliente(Long clienteId) {
        return licencias.findByClienteId(clienteId).stream()
                .map(e -> new Licencia(e.getId(), e.getClienteId(), e.getNumero(), e.getFechaExpiracion(), e.getCategoria(), e.isActiva())).toList();
    }
}
