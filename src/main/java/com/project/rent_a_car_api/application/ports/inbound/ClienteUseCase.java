package com.project.rent_a_car_api.application.ports.inbound;

import com.project.rent_a_car_api.domain.model.Cliente;
import com.project.rent_a_car_api.domain.model.Licencia;
import com.project.rent_a_car_api.domain.result.Result;

import java.time.LocalDate;
import java.util.List;

/**
 * Caso de uso de clientes y licencias (RF-02).
 * Por que: agrupa alta por documento unico y registro de licencias
 * con validacion de vigencia para reservas.
 */
public interface ClienteUseCase {
    Result<Cliente> registrar(String documento, String nombre, String apellido, String email, String telefono);

    Result<Licencia> registrarLicencia(Long clienteId, String numero, LocalDate fechaExpiracion, String categoria);

    Result<List<Licencia>> licenciasDeCliente(Long clienteId);

    Result<Cliente> buscarPorId(Long id);
}
