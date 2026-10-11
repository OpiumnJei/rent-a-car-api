package com.project.rent_a_car_api.application.usecase;

import com.project.rent_a_car_api.application.ports.inbound.ContratoUseCase;
import com.project.rent_a_car_api.application.ports.outbound.ContratoRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.EmpleadoRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.ReservaRepositoryPort;
import com.project.rent_a_car_api.domain.model.Contrato;
import com.project.rent_a_car_api.domain.model.EstadoContrato;
import com.project.rent_a_car_api.domain.model.EstadoReserva;
import com.project.rent_a_car_api.domain.result.DomainError;
import com.project.rent_a_car_api.domain.result.Result;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Caso de uso de contratos (RF-04).
 * Por que: genera contrato Activo desde reserva confirmada, impide duplicados
 * por reserva y marca la reserva como CONVERTIDA en la misma transaccion.
 * Por que del cambio: valida que el empleado exista y este activo (FK EMPLEADO)
 * para no dejar que la BD rechace con error tecnico; retorna 404/409 via Result.
 */
@Service
public class ContratoService implements ContratoUseCase {

    private final ContratoRepositoryPort contratos;
    private final ReservaRepositoryPort reservas;
    private final EmpleadoRepositoryPort empleados;

    public ContratoService(ContratoRepositoryPort contratos, ReservaRepositoryPort reservas, EmpleadoRepositoryPort empleados) {
        this.contratos = contratos;
        this.reservas = reservas;
        this.empleados = empleados;
    }

    @Override
    @Transactional
    public Result<Contrato> generar(Long reservaId, Long empleadoId, BigDecimal montoGarantia) {
        var empleado = empleados.buscarPorId(empleadoId);
        if (empleado.isEmpty()) {
            return Result.fail(DomainError.notFound("Empleado no encontrado: " + empleadoId));
        }
        if (!empleado.get().activo()) {
            return Result.fail(DomainError.conflict("Empleado inactivo: " + empleadoId));
        }
        var reserva = reservas.buscarPorId(reservaId);
        if (reserva.isEmpty()) {
            return Result.fail(DomainError.notFound("Reserva no encontrada: " + reservaId));
        }
        if (reserva.get().estado() != EstadoReserva.CONFIRMADA) {
            return Result.fail(DomainError.conflict("La reserva no esta confirmada"));
        }
        if (contratos.buscarPorReserva(reservaId).isPresent()) {
            return Result.fail(DomainError.conflict("La reserva ya tiene contrato"));
        }
        Result<Contrato> creado = Contrato.crear(null, reservaId, empleadoId, montoGarantia,
                reserva.get().totalEstimado(), EstadoContrato.ACTIVO, LocalDateTime.now());
        if (creado.isFailure()) {
            return creado;
        }
        Contrato guardado = contratos.guardar(creado.getValue());
        // Por que: la reserva convertida ya no puede generar otro contrato.
        var r = reserva.get();
        reservas.guardar(new com.project.rent_a_car_api.domain.model.Reserva(r.id(), r.clienteId(), r.vehiculoId(),
                r.licenciaId(), r.fechaInicio(), r.fechaFin(), EstadoReserva.CONVERTIDA, r.totalEstimado()));
        return Result.ok(guardado);
    }

    @Override
    @Transactional(readOnly = true)
    public Result<Contrato> buscarPorId(Long id) {
        var c = contratos.buscarPorId(id);
        if (c.isEmpty()) {
            return Result.fail(DomainError.notFound("Contrato no encontrado: " + id));
        }
        return Result.ok(c.get());
    }
}
