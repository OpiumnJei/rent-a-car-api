package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.adapter;

import com.project.rent_a_car_api.application.ports.outbound.InspeccionRepositoryPort;
import com.project.rent_a_car_api.domain.model.Inspeccion;
import com.project.rent_a_car_api.domain.model.NivelCombustible;
import com.project.rent_a_car_api.domain.model.TipoInspeccion;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.InspeccionEntity;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository.InspeccionJpaRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Adaptador de inspecciones (RF-05).
 * Por que: mapea enums a strings de BD y expone existencia por tipo para RF-05.3.
 */
@Component
public class InspeccionPersistenceAdapter implements InspeccionRepositoryPort {

    private final InspeccionJpaRepository jpa;

    public InspeccionPersistenceAdapter(InspeccionJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Inspeccion guardar(Inspeccion d) {
        InspeccionEntity e = new InspeccionEntity();
        e.setId(d.id());
        e.setContratoId(d.contratoId());
        e.setEmpleadoId(d.empleadoId());
        e.setTipo(d.tipo().name());
        e.setKilometraje(d.kilometraje());
        e.setNivelCombustible(d.nivelCombustible().name());
        e.setObservaciones(d.observaciones());
        e.setFecha(d.fecha() == null ? LocalDateTime.now() : d.fecha());
        return aDominio(jpa.save(e));
    }

    @Override
    public Optional<Inspeccion> buscarPorId(Long id) {
        return jpa.findById(id).map(this::aDominio);
    }

    @Override
    public List<Inspeccion> listarPorContrato(Long contratoId) {
        return jpa.findByContratoId(contratoId).stream().map(this::aDominio).toList();
    }

    @Override
    public boolean existePorContratoYTipo(Long contratoId, TipoInspeccion tipo) {
        // Por que: evita duplicados sin traer la lista completa.
        return jpa.existsByContratoIdAndTipo(contratoId, tipo.name());
    }

    private Inspeccion aDominio(InspeccionEntity e) {
        return new Inspeccion(e.getId(), e.getContratoId(), e.getEmpleadoId(),
                TipoInspeccion.valueOf(e.getTipo()), e.getKilometraje(),
                NivelCombustible.valueOf(e.getNivelCombustible()), e.getObservaciones(), e.getFecha());
    }
}
