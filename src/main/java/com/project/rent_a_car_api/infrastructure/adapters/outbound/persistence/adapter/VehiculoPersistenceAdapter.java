package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.adapter;

import com.project.rent_a_car_api.application.ports.outbound.VehiculoRepositoryPort;
import com.project.rent_a_car_api.domain.model.EstadoVehiculo;
import com.project.rent_a_car_api.domain.model.Vehiculo;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.VehiculoEntity;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository.VehiculoJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Adaptador de vehiculos.
 * Por que: traduce estado enum a string y filtra disponibilidad por sucursal (RF-01.4).
 */
@Component
public class VehiculoPersistenceAdapter implements VehiculoRepositoryPort {

    private final VehiculoJpaRepository jpa;

    public VehiculoPersistenceAdapter(VehiculoJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Vehiculo guardar(Vehiculo v) {
        return aDominio(jpa.save(aEntidad(v)));
    }

    @Override
    public Optional<Vehiculo> buscarPorId(Long id) {
        return jpa.findById(id).map(this::aDominio);
    }

    @Override
    public Optional<Vehiculo> buscarPorPlaca(String placa) {
        return jpa.findByPlaca(placa).map(this::aDominio);
    }

    @Override
    public List<Vehiculo> listarPorSucursal(Long sucursalId) {
        return jpa.findBySucursalId(sucursalId).stream().map(this::aDominio).toList();
    }

    @Override
    public List<Vehiculo> listarDisponiblesPorSucursal(Long sucursalId) {
        // Por que: si no se filtra por sucursal, trae todos los disponibles globales.
        if (sucursalId == null) {
            return jpa.findAll().stream().filter(e -> "DISPONIBLE".equals(e.getEstado())).map(this::aDominio).toList();
        }
        return jpa.findBySucursalIdAndEstado(sucursalId, EstadoVehiculo.DISPONIBLE.name()).stream().map(this::aDominio).toList();
    }

    private VehiculoEntity aEntidad(Vehiculo d) {
        VehiculoEntity e = new VehiculoEntity();
        e.setId(d.id());
        e.setPlaca(d.placa());
        e.setMarca(d.marca());
        e.setModelo(d.modelo());
        e.setAnio(d.anio());
        e.setTipoVehiculoId(d.tipoVehiculoId());
        e.setSucursalId(d.sucursalId());
        e.setEstado(d.estado() == null ? EstadoVehiculo.DISPONIBLE.name() : d.estado().name());
        e.setKilometraje(d.kilometraje());
        return e;
    }

    private Vehiculo aDominio(VehiculoEntity e) {
        return new Vehiculo(e.getId(), e.getPlaca(), e.getMarca(), e.getModelo(), e.getAnio(),
                e.getTipoVehiculoId(), e.getSucursalId(), EstadoVehiculo.valueOf(e.getEstado()), e.getKilometraje());
    }
}
