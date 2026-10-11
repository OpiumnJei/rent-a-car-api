package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.adapter;

import com.project.rent_a_car_api.application.ports.outbound.SucursalRepositoryPort;
import com.project.rent_a_car_api.domain.model.Sucursal;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.SucursalEntity;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository.SucursalJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Adaptador de persistencia de sucursales.
 * Por que: implementa el puerto de salida traduciendo dominio a JPA y viceversa;
 * el caso de uso nunca ve Entities.
 */
@Component
public class SucursalPersistenceAdapter implements SucursalRepositoryPort {

    private final SucursalJpaRepository jpa;

    /**
     * Inyeccion por constructor.
     * Por que: inmutabilidad y testabilidad sin field injection.
     */
    public SucursalPersistenceAdapter(SucursalJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Sucursal guardar(Sucursal sucursal) {
        SucursalEntity e = aEntidad(sucursal);
        return aDominio(jpa.save(e));
    }

    @Override
    public Optional<Sucursal> buscarPorId(Long id) {
        return jpa.findById(id).map(this::aDominio);
    }

    @Override
    public List<Sucursal> listarTodas() {
        return jpa.findAll().stream().map(this::aDominio).toList();
    }

    @Override
    public List<Sucursal> listarActivas() {
        return jpa.findByActivoTrue().stream().map(this::aDominio).toList();
    }

    /** Convierte dominio a entidad. Por que: centraliza el mapeo en un solo punto. */
    private SucursalEntity aEntidad(Sucursal d) {
        SucursalEntity e = new SucursalEntity();
        e.setId(d.id());
        e.setNombre(d.nombre());
        e.setDireccion(d.direccion());
        e.setTelefono(d.telefono());
        e.setActivo(d.activo());
        return e;
    }

    /** Convierte entidad a dominio. Por que: el exterior solo trabaja con records puros. */
    private Sucursal aDominio(SucursalEntity e) {
        return new Sucursal(e.getId(), e.getNombre(), e.getDireccion(), e.getTelefono(), e.isActivo());
    }
}
