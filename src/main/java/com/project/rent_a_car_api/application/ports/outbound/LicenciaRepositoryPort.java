package com.project.rent_a_car_api.application.ports.outbound;

import com.project.rent_a_car_api.domain.model.Licencia;

import java.util.List;
import java.util.Optional;

public interface LicenciaRepositoryPort {

    Licencia guardar(Licencia licencia);

    Optional<Licencia> buscarPorId(Long id);

    List<Licencia> listarPorCliente(Long clienteId);

    Optional<Licencia> buscarPorNumero(String numero);
}
