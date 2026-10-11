package com.project.rent_a_car_api.application.ports.outbound;

import com.project.rent_a_car_api.domain.model.Inspeccion;
import com.project.rent_a_car_api.domain.model.TipoInspeccion;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de salida para inspecciones (RF-05, contrato tecnico del SRS 5.2).
 * Por que: implementa existePorContratoYTipo para RF-05.3 (max 1 salida + 1 entrada).
 */
public interface InspeccionRepositoryPort {
    Inspeccion guardar(Inspeccion inspeccion);

    Optional<Inspeccion> buscarPorId(Long id);

    List<Inspeccion> listarPorContrato(Long contratoId);

    boolean existePorContratoYTipo(Long contratoId, TipoInspeccion tipo);
}
