package com.project.rent_a_car_api.infrastructure.adapters.outbound.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Entidad JPA de vehiculo fisico.
 * Por que: usa columnas FK planas (tipo/sucursal) para mapeo simple sin relaciones lazy
 * que compliquen el adaptador; estado como string del enum.
 */
@Entity
@Table(name = "VEHICULO")
public class VehiculoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 20)
    private String placa;
    @Column(length = 80)
    private String marca;
    @Column(length = 80)
    private String modelo;
    private Integer anio;
    @Column(name = "tipo_vehiculo_id", nullable = false)
    private Long tipoVehiculoId;
    @Column(name = "sucursal_id", nullable = false)
    private Long sucursalId;
    @Column(nullable = false, length = 20)
    private String estado = "DISPONIBLE";
    @Column(nullable = false)
    private int kilometraje;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }
    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }
    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }
    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }
    public Long getTipoVehiculoId() { return tipoVehiculoId; }
    public void setTipoVehiculoId(Long tipoVehiculoId) { this.tipoVehiculoId = tipoVehiculoId; }
    public Long getSucursalId() { return sucursalId; }
    public void setSucursalId(Long sucursalId) { this.sucursalId = sucursalId; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public int getKilometraje() { return kilometraje; }
    public void setKilometraje(int kilometraje) { this.kilometraje = kilometraje; }
}
