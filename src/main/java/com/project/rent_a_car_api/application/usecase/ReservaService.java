package com.project.rent_a_car_api.application.usecase;

import com.project.rent_a_car_api.application.ports.inbound.ReservaUseCase;
import com.project.rent_a_car_api.application.ports.outbound.ClienteRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.LicenciaRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.ReservaRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.TarifaRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.VehiculoRepositoryPort;
import com.project.rent_a_car_api.domain.model.EstadoReserva;
import com.project.rent_a_car_api.domain.model.Reserva;
import com.project.rent_a_car_api.domain.result.DomainError;
import com.project.rent_a_car_api.domain.result.Result;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Caso de uso de reservas (RF-03.1, RF-03.2).
 * Por que: orquesta las 3 validaciones del SRS (disponibilidad por solape,
 * licencia vigente todo el periodo, tarifa activa) y calcula total estimado
 * como dias x precio; todo con Result sin throws.
 */
@Service
public class ReservaService implements ReservaUseCase {

    private final ReservaRepositoryPort reservas;
    private final VehiculoRepositoryPort vehiculos;
    private final ClienteRepositoryPort clientes;
    private final LicenciaRepositoryPort licencias;
    private final TarifaRepositoryPort tarifas;

    public ReservaService(ReservaRepositoryPort reservas, VehiculoRepositoryPort vehiculos,
                          ClienteRepositoryPort clientes, LicenciaRepositoryPort licencias,
                          TarifaRepositoryPort tarifas) {
        this.reservas = reservas;
        this.vehiculos = vehiculos;
        this.clientes = clientes;
        this.licencias = licencias;
        this.tarifas = tarifas;
    }

    @Override
    @Transactional
    public Result<Reserva> crear(Long clienteId, Long vehiculoId, Long licenciaId, LocalDate inicio, LocalDate fin) {
        var cliente = clientes.buscarPorId(clienteId);
        if (cliente.isEmpty()) {
            return Result.fail(DomainError.notFound("Cliente no encontrado: " + clienteId));
        }
        var vehiculo = vehiculos.buscarPorId(vehiculoId);
        if (vehiculo.isEmpty()) {
            return Result.fail(DomainError.notFound("Vehiculo no encontrado: " + vehiculoId));
        }
        var licencia = licencias.buscarPorId(licenciaId);
        if (licencia.isEmpty()) {
            return Result.fail(DomainError.notFound("Licencia no encontrada: " + licenciaId));
        }
        if (!licencia.get().clienteId().equals(clienteId)) {
            return Result.fail(DomainError.validation("La licencia no pertenece al cliente"));
        }
        if (inicio == null || fin == null || fin.isBefore(inicio)) {
            return Result.fail(DomainError.validation("Rango de fechas invalido"));
        }
        // Por que: RF-02.2 la licencia debe cubrir todo el alquiler.
        if (!licencia.get().vigenteDurante(inicio, fin)) {
            return Result.fail(DomainError.validation("Licencia vencida durante el periodo de alquiler"));
        }
        // Por que: RF-03.2 disponibilidad por solape de reservas confirmadas.
        if (reservas.existeSolape(vehiculoId, inicio, fin)) {
            return Result.fail(DomainError.conflict("Vehiculo no disponible en las fechas solicitadas"));
        }
        // Por que: tarifa activa del tipo para el total estimado.
        var tarifa = tarifas.buscarActivaPorTipo(vehiculo.get().tipoVehiculoId());
        if (tarifa.isEmpty()) {
            return Result.fail(DomainError.validation("Sin tarifa activa para el tipo de vehiculo"));
        }
        long dias = ChronoUnit.DAYS.between(inicio, fin) + 1;
        BigDecimal total = tarifa.get().precioPorDia().multiply(BigDecimal.valueOf(Math.max(1, dias)));
        Result<Reserva> creada = Reserva.crear(null, clienteId, vehiculoId, licenciaId, inicio, fin, EstadoReserva.CONFIRMADA, total);
        if (creada.isFailure()) {
            return creada;
        }
        return Result.ok(reservas.guardar(creada.getValue()));
    }
}
