package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.adapter;

import com.project.rent_a_car_api.application.ports.outbound.EmpleadoRepositoryPort;
import com.project.rent_a_car_api.domain.model.Empleado;
import com.project.rent_a_car_api.domain.model.RolEmpleado;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.EmpleadoEntity;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository.EmpleadoJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Adaptador de empleados.
 * Por que: traduce rol enum a string y viceversa; el caso de uso nunca ve Entities.
 */
@Component
public class EmpleadoPersistenceAdapter implements EmpleadoRepositoryPort {

    private final EmpleadoJpaRepository jpa;

    public EmpleadoPersistenceAdapter(EmpleadoJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Empleado guardar(Empleado d) {
        EmpleadoEntity e = new EmpleadoEntity();
        e.setId(d.id());
        e.setSucursalId(d.sucursalId());
        e.setNombre(d.nombre());
        e.setUsername(d.username());
        e.setPassword(d.password());
        e.setRol(d.rol().name());
        e.setActivo(d.activo());
        return aDominio(jpa.save(e));
    }

    @Override
    public Optional<Empleado> buscarPorId(Long id) {
        return jpa.findById(id).map(this::aDominio);
    }

    @Override
    public Optional<Empleado> buscarPorUsername(String username) {
        return jpa.findByUsername(username).map(this::aDominio);
    }

    @Override
    public List<Empleado> listarTodos() {
        return jpa.findAll().stream().map(this::aDominio).toList();
    }

    private Empleado aDominio(EmpleadoEntity e) {
        return new Empleado(e.getId(), e.getSucursalId(), e.getNombre(), e.getUsername(),
                e.getPassword(), RolEmpleado.valueOf(e.getRol()), e.isActivo());
    }
}
