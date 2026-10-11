package com.project.rent_a_car_api.application.ports.inbound;

import com.project.rent_a_car_api.domain.model.Inspeccion;
import com.project.rent_a_car_api.domain.model.NivelCombustible;
import com.project.rent_a_car_api.domain.model.TipoInspeccion;
import com.project.rent_a_car_api.domain.result.Result;

import java.util.List;

/**
 * Caso de uso de inspecciones segun contrato tecnico SRS 5.2 (RF-05).
 * Por que: firma ejecutar(contrato, empleado, tipo, km, combustible, obs)
 * actualiza flota a Alquilado/Disponible/Mantenimiento.
 */
public interface RegistrarInspeccionUseCase {
    Result<Inspeccion> ejecutar(Long idContrato, Long idEmpleado, TipoInspeccion tipoInspeccion,
                                int kilometraje, NivelCombustible nivelCombustible, String observaciones);

    Result<List<Inspeccion>> listarPorContrato(Long contratoId);
}
