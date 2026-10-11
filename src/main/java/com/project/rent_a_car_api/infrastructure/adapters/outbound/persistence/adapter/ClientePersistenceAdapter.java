package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.adapter;

import com.project.rent_a_car_api.application.ports.outbound.ClienteRepositoryPort;
import com.project.rent_a_car_api.domain.model.Cliente;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity.ClienteEntity;
import com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.repository.ClienteJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Adaptador de clientes (RF-02.1).
 * Por que del cambio: separado de licencias por colision de buscarPorId con distinto retorno.
 */
@Component
public class ClientePersistenceAdapter implements ClienteRepositoryPort {

    private final ClienteJpaRepository clientes;

    public ClientePersistenceAdapter(ClienteJpaRepository clientes) {
        this.clientes = clientes;
    }

    @Override
    public Cliente guardar(Cliente d) {
        ClienteEntity e = new ClienteEntity();
        e.setId(d.id());
        e.setDocumento(d.documento());
        e.setNombre(d.nombre());
        e.setApellido(d.apellido());
        e.setEmail(d.email());
        e.setTelefono(d.telefono());
        e.setActivo(d.activo());
        ClienteEntity g = clientes.save(e);
        return new Cliente(g.getId(), g.getDocumento(), g.getNombre(), g.getApellido(), g.getEmail(), g.getTelefono(), g.isActivo());
    }

    @Override
    public Optional<Cliente> buscarPorId(Long id) {
        return clientes.findById(id).map(e -> new Cliente(e.getId(), e.getDocumento(), e.getNombre(), e.getApellido(), e.getEmail(), e.getTelefono(), e.isActivo()));
    }

    @Override
    public Optional<Cliente> buscarPorDocumento(String documento) {
        return clientes.findByDocumento(documento).map(e -> new Cliente(e.getId(), e.getDocumento(), e.getNombre(), e.getApellido(), e.getEmail(), e.getTelefono(), e.isActivo()));
    }

    @Override
    public List<Cliente> listarTodos() {
        return clientes.findAll().stream().map(e -> new Cliente(e.getId(), e.getDocumento(), e.getNombre(), e.getApellido(), e.getEmail(), e.getTelefono(), e.isActivo())).toList();
    }
}
