package com.project.rent_a_car_api.infrastructure.adapters.inbound.rest.dto;

import com.project.rent_a_car_api.domain.model.Cliente;
import com.project.rent_a_car_api.domain.model.Contrato;
import com.project.rent_a_car_api.domain.model.Factura;
import com.project.rent_a_car_api.domain.model.Inspeccion;
import com.project.rent_a_car_api.domain.model.Licencia;
import com.project.rent_a_car_api.domain.model.Reserva;
import com.project.rent_a_car_api.domain.model.Sucursal;
import com.project.rent_a_car_api.domain.model.Tarifa;
import com.project.rent_a_car_api.domain.model.TipoVehiculo;
import com.project.rent_a_car_api.domain.model.Vehiculo;

/**
 * DTOs de salida como records.
 * Por que: la API expone estos records en vez de entidades de dominio internas;
 * el mapeo explicito evita filtrar detalles de persistencia.
 */
public final class Responses {

    private Responses() {
    }

    public record SucursalResponse(Long id, String nombre, String direccion, String telefono, boolean activo) {
        public static SucursalResponse desde(Sucursal d) {
            return new SucursalResponse(d.id(), d.nombre(), d.direccion(), d.telefono(), d.activo());
        }
    }

    public record TipoResponse(Long id, String nombre, boolean activo) {
        public static TipoResponse desde(TipoVehiculo d) {
            return new TipoResponse(d.id(), d.nombre(), d.activo());
        }
    }

    public record TarifaResponse(Long id, Long tipoVehiculoId, Object precioPorDia, boolean activo) {
        public static TarifaResponse desde(Tarifa d) {
            return new TarifaResponse(d.id(), d.tipoVehiculoId(), d.precioPorDia(), d.activo());
        }
    }

    public record VehiculoResponse(Long id, String placa, String marca, String modelo, Integer anio,
                                   Long tipoVehiculoId, Long sucursalId, String estado, int kilometraje) {
        public static VehiculoResponse desde(Vehiculo d) {
            return new VehiculoResponse(d.id(), d.placa(), d.marca(), d.modelo(), d.anio(),
                    d.tipoVehiculoId(), d.sucursalId(), d.estado().name(), d.kilometraje());
        }
    }

    public record ClienteResponse(Long id, String documento, String nombre, String apellido, String email, String telefono, boolean activo) {
        public static ClienteResponse desde(Cliente d) {
            return new ClienteResponse(d.id(), d.documento(), d.nombre(), d.apellido(), d.email(), d.telefono(), d.activo());
        }
    }

    public record LicenciaResponse(Long id, Long clienteId, String numero, Object fechaExpiracion, String categoria, boolean activa) {
        public static LicenciaResponse desde(Licencia d) {
            return new LicenciaResponse(d.id(), d.clienteId(), d.numero(), d.fechaExpiracion(), d.categoria(), d.activa());
        }
    }

    public record ReservaResponse(Long id, Long clienteId, Long vehiculoId, Long licenciaId, Object inicio, Object fin, String estado, Object total) {
        public static ReservaResponse desde(Reserva d) {
            return new ReservaResponse(d.id(), d.clienteId(), d.vehiculoId(), d.licenciaId(), d.fechaInicio(), d.fechaFin(), d.estado().name(), d.totalEstimado());
        }
    }

    public record ContratoResponse(Long id, Long reservaId, Long empleadoId, Object garantia, Object totalEstimado, String estado, Object fecha) {
        public static ContratoResponse desde(Contrato d) {
            return new ContratoResponse(d.id(), d.reservaId(), d.empleadoId(), d.montoGarantia(), d.totalEstimado(), d.estado().name(), d.fechaCreacion());
        }
    }

    public record InspeccionResponse(Long id, Long contratoId, Long empleadoId, String tipo, int kilometraje, String combustible, String observaciones, Object fecha) {
        public static InspeccionResponse desde(Inspeccion d) {
            return new InspeccionResponse(d.id(), d.contratoId(), d.empleadoId(), d.tipo().name(), d.kilometraje(), d.nivelCombustible().name(), d.observaciones(), d.fecha());
        }
    }

    public record FacturaResponse(Long id, Long contratoId, String tipo, Long facturaOrigenId, Object subtotal, Object cargos, Object impuestos, Object total, Object fecha, Object detalles) {
        public static FacturaResponse desde(Factura d) {
            // Por que del cambio: se exponen tipo y factura origen para distinguir inicial de complementaria.
            return new FacturaResponse(d.id(), d.contratoId(), d.tipo().name(), d.facturaOrigenId(), d.subtotal(), d.cargos(), d.impuestos(), d.total(), d.fecha(), d.detalles());
        }
    }
}
