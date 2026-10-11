package com.project.rent_a_car_api.application.ports.outbound;

import com.project.rent_a_car_api.domain.model.Cliente;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de salida para clientes (RF-02.1).
 * Por que: alta y consulta por documento unico.
 */
public interface ClienteRepositoryPort {
    Cliente guardar(Cliente cliente);

    Optional<Cliente> buscarPorId(Long id);

    Optional<Cliente> buscarPorDocumento(String documento);

    List<Cliente> listarTodos();
}
