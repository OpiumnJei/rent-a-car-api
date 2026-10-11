package com.project.rent_a_car_api.application.usecase;

import com.project.rent_a_car_api.application.ports.inbound.RegistrarInspeccionUseCase;
import com.project.rent_a_car_api.application.ports.outbound.ContratoRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.EmpleadoRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.InspeccionRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.ReservaRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.VehiculoRepositoryPort;
import com.project.rent_a_car_api.domain.model.EstadoVehiculo;
import com.project.rent_a_car_api.domain.model.Inspeccion;
import com.project.rent_a_car_api.domain.model.NivelCombustible;
import com.project.rent_a_car_api.domain.model.TipoInspeccion;
import com.project.rent_a_car_api.domain.result.DomainError;
import com.project.rent_a_car_api.domain.result.Result;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

/**
 * Caso de uso de inspecciones segun SRS 5.2 (RF-05).
 * Por que: valida maximo 1 salida + 1 entrada, km entrada mayor o igual a salida,
 * y actualiza la flota: salida -> Alquilado; entrada sin dano -> Disponible,
 * con dano -> En Mantenimiento. Todo atomico con @Transactional y Result.
 */
@Service
public class InspeccionService implements RegistrarInspeccionUseCase {

    private final InspeccionRepositoryPort inspecciones;
    private final ContratoRepositoryPort contratos;
    private final ReservaRepositoryPort reservas;
    private final VehiculoRepositoryPort vehiculos;
    private final EmpleadoRepositoryPort empleados;

    public InspeccionService(InspeccionRepositoryPort inspecciones, ContratoRepositoryPort contratos,
                             ReservaRepositoryPort reservas, VehiculoRepositoryPort vehiculos,
                             EmpleadoRepositoryPort empleados) {
        this.inspecciones = inspecciones;
        this.contratos = contratos;
        this.reservas = reservas;
        this.vehiculos = vehiculos;
        this.empleados = empleados;
    }

    @Override
    @Transactional
    public Result<Inspeccion> ejecutar(Long idContrato, Long idEmpleado, TipoInspeccion tipo,
                                       int kilometraje, NivelCombustible nivel, String observaciones) {
        var contrato = contratos.buscarPorId(idContrato);
        if (contrato.isEmpty()) {
            return Result.fail(DomainError.notFound("Contrato no encontrado: " + idContrato));
        }
        // Por que del cambio: FK EMPLEADO exige inspector existente y activo.
        var inspector = empleados.buscarPorId(idEmpleado);
        if (inspector.isEmpty()) {
            return Result.fail(DomainError.notFound("Empleado no encontrado: " + idEmpleado));
        }
        if (!inspector.get().activo()) {
            return Result.fail(DomainError.conflict("Empleado inactivo: " + idEmpleado));
        }
        // Por que: RF-05.3 impide duplicar el mismo tipo por contrato.
        if (inspecciones.existePorContratoYTipo(idContrato, tipo)) {
            return Result.fail(DomainError.conflict("Ya existe inspeccion " + tipo + " para el contrato"));
        }
        if (tipo == TipoInspeccion.ENTRADA) {
            // Por que: la entrada exige salida previa y km no regresivo.
            var previas = inspecciones.listarPorContrato(idContrato);
            var salida = previas.stream().filter(i -> i.tipo() == TipoInspeccion.SALIDA).findFirst();
            if (salida.isEmpty()) {
                return Result.fail(DomainError.validation("La entrada requiere salida previa"));
            }
            if (kilometraje < salida.get().kilometraje()) {
                return Result.fail(DomainError.validation("El kilometraje de entrada debe ser mayor o igual al de salida"));
            }
        }
        Result<Inspeccion> creada = Inspeccion.crear(null, idContrato, idEmpleado, tipo,
                kilometraje, nivel, observaciones, LocalDateTime.now());
        if (creada.isFailure()) {
            return creada;
        }
        Inspeccion guardada = inspecciones.guardar(creada.getValue());

        // Por que: RF-05.1 y RF-05.4 actualizacion automatica de flota.
        var reserva = reservas.buscarPorId(contrato.get().reservaId());
        if (reserva.isPresent()) {
            var vehiculo = vehiculos.buscarPorId(reserva.get().vehiculoId());
            if (vehiculo.isPresent()) {
                var v = vehiculo.get();
                if (tipo == TipoInspeccion.SALIDA) {
                    vehiculos.guardar(v.conEstado(EstadoVehiculo.ALQUILADO).conKilometraje(kilometraje));
                } else {
                    EstadoVehiculo destino = guardada.reportaDanio() ? EstadoVehiculo.EN_MANTENIMIENTO : EstadoVehiculo.DISPONIBLE;
                    vehiculos.guardar(v.conEstado(destino).conKilometraje(kilometraje));
                }
            }
        }
        return Result.ok(guardada);
    }

    @Override
    @Transactional(readOnly = true)
    public Result<List<Inspeccion>> listarPorContrato(Long contratoId) {
        if (contratos.buscarPorId(contratoId).isEmpty()) {
            return Result.fail(DomainError.notFound("Contrato no encontrado: " + contratoId));
        }
        var lista = inspecciones.listarPorContrato(contratoId).stream()
                .sorted(Comparator.comparing(Inspeccion::fecha, Comparator.nullsFirst(Comparator.naturalOrder()))).toList();
        return Result.ok(lista);
    }
}
