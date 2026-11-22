package com.project.rent_a_car_api.application.usecase;

import com.project.rent_a_car_api.application.ports.inbound.ClienteUseCase;
import com.project.rent_a_car_api.application.ports.outbound.ClienteRepositoryPort;
import com.project.rent_a_car_api.application.ports.outbound.LicenciaRepositoryPort;
import com.project.rent_a_car_api.domain.model.Cliente;
import com.project.rent_a_car_api.domain.model.Licencia;
import com.project.rent_a_car_api.domain.result.DomainError;
import com.project.rent_a_car_api.domain.result.Result;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Caso de uso de clientes y licencias (RF-02).
 * Por que: documento y numero de licencia unicos se verifican antes de guardar
 * para retornar 409 en vez de dejar explotar la constraint SQL.
 */
@Service
public class ClienteService implements ClienteUseCase {

    private final ClienteRepositoryPort clientes;
    private final LicenciaRepositoryPort licencias;

    public ClienteService(ClienteRepositoryPort clientes, LicenciaRepositoryPort licencias) {
        this.clientes = clientes;
        this.licencias = licencias;
    }

    @Override
    @Transactional
    public Result<Cliente> registrar(String documento, String nombre, String apellido, String email, String telefono) {
        if (documento != null && clientes.buscarPorDocumento(documento.trim()).isPresent()) {
            return Result.fail(DomainError.conflict("Documento ya registrado: " + documento));
        }
        Result<Cliente> creado = Cliente.crear(null, documento, nombre, apellido, email, telefono, true);
        if (creado.isFailure()) {
            return creado;
        }
        return Result.ok(clientes.guardar(creado.getValue()));
    }

    @Override
    @Transactional
    public Result<Licencia> registrarLicencia(Long clienteId, String numero, LocalDate fechaExpiracion, String categoria) {
        if (clientes.buscarPorId(clienteId).isEmpty()) {
            return Result.fail(DomainError.notFound("Cliente no encontrado: " + clienteId));
        }
        Result<Licencia> creada = Licencia.crear(null, clienteId, numero, fechaExpiracion, categoria, true);
        if (creada.isFailure()) {
            return creada;
        }
        return Result.ok(licencias.guardar(creada.getValue()));
    }

    @Override
    @Transactional(readOnly = true)
    public Result<List<Licencia>> licenciasDeCliente(Long clienteId) {
        if (clientes.buscarPorId(clienteId).isEmpty()) {
            return Result.fail(DomainError.notFound("Cliente no encontrado: " + clienteId));
        }
        return Result.ok(licencias.listarPorCliente(clienteId));
    }

    @Override
    @Transactional(readOnly = true)
    public Result<Cliente> buscarPorId(Long id) {
        var c = clientes.buscarPorId(id);
        if (c.isEmpty()) {
            return Result.fail(DomainError.notFound("Cliente no encontrado: " + id));
        }
        return Result.ok(c.get());
    }

    @Override
    @Transactional(readOnly = true)
    public Result<Cliente> buscarPorDocumento(String documento) {
        if (documento == null || documento.isBlank()) {
            return Result.fail(
                DomainError.notFound("Documento no encontrado")
        );
    }

    var cliente = clientes.buscarPorDocumento(documento.trim());

    if (cliente.isEmpty()) {
        return Result.fail(
            DomainError.notFound("Cliente no encontrado: " + documento)
        );
    }

    return Result.ok(cliente.get());
    }

    @Override
    @Transactional(readOnly = true)
    public Result<List<Cliente>> listarTodos() {
        return Result.ok(clientes.listarTodos());
    }

    @Override
    @Transactional
    public Result<Licencia> actualizarLicencia(
        Long id,
        String numero,
        LocalDate fechaExpiracion,
        String categoria) {

    if (id == null) {
        return Result.fail(
                DomainError.validation("El ID de licencia es obligatorio")
        );
    }

    var existente = licencias.buscarPorId(id);

    if (existente.isEmpty()) {
        return Result.fail(
                DomainError.notFound("Licencia no encontrada: " + id)
        );
    }

    Licencia actual = existente.get();

    Result<Licencia> validacion = Licencia.crear(
            actual.id(),
            actual.clienteId(),
            numero,
            fechaExpiracion,
            categoria,
            actual.activa()
    );

    if (validacion.isFailure()) {
        return validacion;
    }

    Licencia actualizada = validacion.getValue();

    var duplicada = licencias.buscarPorNumero(actualizada.numero());

    if (duplicada.isPresent()
            && !duplicada.get().id().equals(id)) {

        return Result.fail(
                DomainError.conflict(
                        "Número de licencia ya registrado: "
                                + actualizada.numero()
                )
        );
    }

    return Result.ok(licencias.guardar(actualizada));
    }
}
