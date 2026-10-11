package com.project.rent_a_car_api.application.usecase;

import com.project.rent_a_car_api.application.ports.inbound.VehiculoUseCase;
import com.project.rent_a_car_api.application.ports.outbound.SucursalRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.TipoVehiculoRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.VehiculoRepositoryPort;
import com.project.rent_a_car_api.domain.model.EstadoVehiculo;
import com.project.rent_a_car_api.domain.model.Vehiculo;
import com.project.rent_a_car_api.domain.result.DomainError;
import com.project.rent_a_car_api.domain.result.Result;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Caso de uso de vehiculos (RF-01.3, RF-01.4).
 * Por que: valida FK de tipo/sucursal y placa unica antes de guardar;
 * retorna Result para mapear duplicados a 409.
 */
@Service
public class VehiculoService implements VehiculoUseCase {

    private final VehiculoRepositoryPort vehiculos;
    private final TipoVehiculoRepositoryPort tipos;
    private final SucursalRepositoryPort sucursales;

    public VehiculoService(VehiculoRepositoryPort vehiculos, TipoVehiculoRepositoryPort tipos, SucursalRepositoryPort sucursales) {
        this.vehiculos = vehiculos;
        this.tipos = tipos;
        this.sucursales = sucursales;
    }

    @Override
    @Transactional
    public Result<Vehiculo> registrar(String placa, String marca, String modelo, Integer anio,
                                      Long tipoVehiculoId, Long sucursalId, int kilometraje) {
        if (tipos.buscarPorId(tipoVehiculoId).isEmpty()) {
            return Result.fail(DomainError.notFound("Tipo de vehiculo no encontrado: " + tipoVehiculoId));
        }
        if (sucursales.buscarPorId(sucursalId).isEmpty()) {
            return Result.fail(DomainError.notFound("Sucursal no encontrada: " + sucursalId));
        }
        String placaNorm = placa == null ? null : placa.trim().toUpperCase();
        if (placaNorm != null && vehiculos.buscarPorPlaca(placaNorm).isPresent()) {
            return Result.fail(DomainError.conflict("Placa ya registrada: " + placaNorm));
        }
        Result<Vehiculo> creado = Vehiculo.crear(null, placaNorm, marca, modelo, anio,
                tipoVehiculoId, sucursalId, EstadoVehiculo.DISPONIBLE, kilometraje);
        if (creado.isFailure()) {
            return creado;
        }
        return Result.ok(vehiculos.guardar(creado.getValue()));
    }

    @Override
    @Transactional
    public Result<Vehiculo> cambiarEstado(Long vehiculoId, EstadoVehiculo nuevoEstado) {
        var actual = vehiculos.buscarPorId(vehiculoId);
        if (actual.isEmpty()) {
            return Result.fail(DomainError.notFound("Vehiculo no encontrado: " + vehiculoId));
        }
        if (nuevoEstado == null) {
            return Result.fail(DomainError.validation("El nuevo estado es obligatorio"));
        }
        return Result.ok(vehiculos.guardar(actual.get().conEstado(nuevoEstado)));
    }

    @Override
    @Transactional(readOnly = true)
    public Result<List<Vehiculo>> listarDisponibles(Long sucursalId) {
        // Por que: filtro en BD por sucursal y estado para RF-01.4.
        return Result.ok(vehiculos.listarDisponiblesPorSucursal(sucursalId));
    }

    @Override
    @Transactional(readOnly = true)
    public Result<Vehiculo> buscarPorId(Long id) {
        var v = vehiculos.buscarPorId(id);
        if (v.isEmpty()) {
            return Result.fail(DomainError.notFound("Vehiculo no encontrado: " + id));
        }
        return Result.ok(v.get());
    }
}
