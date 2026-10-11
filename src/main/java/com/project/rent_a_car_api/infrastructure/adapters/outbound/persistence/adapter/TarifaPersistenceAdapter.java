package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.adapter;

import com.project.rent_a_car_api.application.ports.outbound.TarifaRepositoryPort;
import com.project.rent_a_car_api.domain.model.Tarifa;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.TarifaEntity;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository.TarifaJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Adaptador de tarifas (RF-01.2, RF-03.2).
 * Por que: clase separada para evitar colision de buscarPorId con tipos;
 * al guardar activa desactiva la anterior del mismo tipo (un solo vigente).
 */
@Component
public class TarifaPersistenceAdapter implements TarifaRepositoryPort {

    private final TarifaJpaRepository tarifas;

    public TarifaPersistenceAdapter(TarifaJpaRepository tarifas) {
        this.tarifas = tarifas;
    }

    @Override
    public Tarifa guardar(Tarifa tarifa) {
        // Por que: desactivar otras activas del tipo antes de guardar la nueva.
        if (tarifa.activo()) {
            tarifas.findByTipoVehiculoIdAndActivoTrue(tarifa.tipoVehiculoId()).ifPresent(activa -> {
                if (!activa.getId().equals(tarifa.id())) {
                    activa.setActivo(false);
                    tarifas.save(activa);
                }
            });
        }
        TarifaEntity e = new TarifaEntity();
        e.setId(tarifa.id());
        e.setTipoVehiculoId(tarifa.tipoVehiculoId());
        e.setPrecioPorDia(tarifa.precioPorDia());
        e.setActivo(tarifa.activo());
        TarifaEntity g = tarifas.save(e);
        return new Tarifa(g.getId(), g.getTipoVehiculoId(), g.getPrecioPorDia(), g.isActivo());
    }

    @Override
    public Optional<Tarifa> buscarPorId(Long id) {
        return tarifas.findById(id).map(e -> new Tarifa(e.getId(), e.getTipoVehiculoId(), e.getPrecioPorDia(), e.isActivo()));
    }

    @Override
    public Optional<Tarifa> buscarActivaPorTipo(Long tipoVehiculoId) {
        return tarifas.findByTipoVehiculoIdAndActivoTrue(tipoVehiculoId)
                .map(e -> new Tarifa(e.getId(), e.getTipoVehiculoId(), e.getPrecioPorDia(), e.isActivo()));
    }

    @Override
    public List<Tarifa> listarPorTipo(Long tipoVehiculoId) {
        return tarifas.findByTipoVehiculoId(tipoVehiculoId).stream()
                .map(e -> new Tarifa(e.getId(), e.getTipoVehiculoId(), e.getPrecioPorDia(), e.isActivo())).toList();
    }

    @Override
    public List<Tarifa> listarActivas() {
        return tarifas.findByActivoTrue().stream()
                .map(e -> new Tarifa(e.getId(), e.getTipoVehiculoId(), e.getPrecioPorDia(), e.isActivo())).toList();
    }
}
