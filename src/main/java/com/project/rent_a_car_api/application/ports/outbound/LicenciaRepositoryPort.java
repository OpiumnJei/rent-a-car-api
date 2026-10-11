package com.project.rent_a_car_api.application.ports.outbound;

import com.project.rent_a_car_api.domain.model.Licencia;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de salida para licencias (RF-02.2).
 * Por que: el caso de uso valida vigencia sin conocer JPA.
 */
public interface LicenciaRepositoryPort {
    Licencia guardar(Licencia licencia);

    Optional<Licencia> buscarPorId(Long id);

    List<Licencia> listarPorCliente(Long clienteId);
}
