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
}
