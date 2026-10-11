package com.project.rent_a_car_api.application.usecase;

import com.project.rent_a_car_api.application.ports.inbound.CatalogoUseCase;
import com.project.rent_a_car_api.application.ports.inbound.SucursalUseCase;
import com.project.rent_a_car_api.application.ports.outbound.SucursalRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.TarifaRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.TipoVehiculoRepositoryPort;
import com.project.rent_a_car_api.domain.model.Sucursal;
import com.project.rent_a_car_api.domain.model.Tarifa;
import com.project.rent_a_car_api.domain.model.TipoVehiculo;
import com.project.rent_a_car_api.domain.result.DomainError;
import com.project.rent_a_car_api.domain.result.Result;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Casos de uso de catalogos: sucursales, tipos y tarifas (RF-01.1, RF-01.2).
 * Por que: un solo servicio para catalogos simples evita proliferacion de clases;
 * cada metodo retorna Result y usa @Transactional para rollback ante fallo.
 */
@Service
public class CatalogoService implements SucursalUseCase, CatalogoUseCase {

    private final SucursalRepositoryPort sucursales;
    private final TipoVehiculoRepositoryPort tipos;
    private final TarifaRepositoryPort tarifas;

    /**
     * Inyeccion de puertos de salida.
     * Por que: el servicio solo conoce interfaces, no JPA.
     */
    public CatalogoService(SucursalRepositoryPort sucursales, TipoVehiculoRepositoryPort tipos, TarifaRepositoryPort tarifas) {
        this.sucursales = sucursales;
        this.tipos = tipos;
        this.tarifas = tarifas;
    }

    @Override
    @Transactional
    public Result<Sucursal> registrar(String nombre, String direccion, String telefono) {
        // Por que: validacion de dominio via factory que retorna Result.
        Result<Sucursal> creado = Sucursal.crear(null, nombre, direccion, telefono, true);
        if (creado.isFailure()) {
            return creado;
        }
        return Result.ok(sucursales.guardar(creado.getValue()));
    }

    @Override
    @Transactional(readOnly = true)
    public Result<List<Sucursal>> listar(boolean soloActivas) {
        // Por que: lectura sin transaccion de escritura para rendimiento.
        return Result.ok(soloActivas ? sucursales.listarActivas() : sucursales.listarTodas());
    }

    @Override
    @Transactional
    public Result<TipoVehiculo> registrarTipo(String nombre) {
        Result<TipoVehiculo> creado = TipoVehiculo.crear(null, nombre, true);
        if (creado.isFailure()) {
            return creado;
        }
        return Result.ok(tipos.guardar(creado.getValue()));
    }

    @Override
    @Transactional
    public Result<Tarifa> definirTarifa(Long tipoVehiculoId, BigDecimal precioPorDia) {
        // Por que: verifica que el tipo exista antes de tarifar.
        if (tipos.buscarPorId(tipoVehiculoId).isEmpty()) {
            return Result.fail(DomainError.notFound("Tipo de vehiculo no encontrado: " + tipoVehiculoId));
        }
        Result<Tarifa> creada = Tarifa.crear(null, tipoVehiculoId, precioPorDia, true);
        if (creada.isFailure()) {
            return creada;
        }
        // Por que: el adaptador desactiva la anterior para un solo vigente.
        return Result.ok(tarifas.guardar(creada.getValue()));
    }

    @Override
    @Transactional(readOnly = true)
    public Result<List<TipoVehiculo>> listarTipos() {
        return Result.ok(tipos.listarTodos());
    }

    @Override
    @Transactional(readOnly = true)
    public Result<List<Tarifa>> listarTarifasActivas() {
        return Result.ok(tarifas.listarActivas());
    }
}
