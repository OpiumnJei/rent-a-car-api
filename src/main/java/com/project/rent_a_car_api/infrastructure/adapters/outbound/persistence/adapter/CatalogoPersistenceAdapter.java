package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.adapter;

import com.project.rent_a_car_api.application.ports.outbound.TipoVehiculoRepositoryPort;
import com.project.rent_a_car_api.domain.model.TipoVehiculo;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.TipoVehiculoEntity;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository.TipoVehiculoJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Adaptador de tipos de vehiculo (RF-01.2).
 * Por que del cambio: se separo de tarifas porque Java no permite dos buscarPorId
 * con distinto retorno en una misma clase; un adaptador por puerto evita la colision.
 */
@Component
public class CatalogoPersistenceAdapter implements TipoVehiculoRepositoryPort {

    private final TipoVehiculoJpaRepository tipos;

    public CatalogoPersistenceAdapter(TipoVehiculoJpaRepository tipos) {
        this.tipos = tipos;
    }

    @Override
    public TipoVehiculo guardar(TipoVehiculo tipo) {
        TipoVehiculoEntity e = new TipoVehiculoEntity();
        e.setId(tipo.id());
        e.setNombre(tipo.nombre());
        e.setActivo(tipo.activo());
        TipoVehiculoEntity g = tipos.save(e);
        return new TipoVehiculo(g.getId(), g.getNombre(), g.isActivo());
    }

    @Override
    public Optional<TipoVehiculo> buscarPorId(Long id) {
        return tipos.findById(id).map(e -> new TipoVehiculo(e.getId(), e.getNombre(), e.isActivo()));
    }

    @Override
    public List<TipoVehiculo> listarTodos() {
        return tipos.findAll().stream().map(e -> new TipoVehiculo(e.getId(), e.getNombre(), e.isActivo())).toList();
    }
}
