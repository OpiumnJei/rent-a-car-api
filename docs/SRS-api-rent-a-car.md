
# Especificación de Requisitos de Software (SRS) — Backend Rent-a-Car


## 1. Introducción

### 1.1 Propósito
El propósito de este documento es definir la Especificación de Requisitos de Software (SRS) para el desarrollo del **Backend del Sistema de Alquiler de Vehículos (Rent-a-Car)**. Este documento sirve de guía técnica para desarrolladores, arquitectos y evaluadores del proyecto, detallando la lógica del negocio, la arquitectura hexagonal, las interfaces de integración REST y los criterios no funcionales del sistema.

### 1.2 Alcance del Sistema
El backend proporcionará una API RESTful y stateless orientada al servicio de gestión de alquiler de vehículos. Administrará el ciclo de vida completo de la operación:
* Catálogos (sucursales, vehículos, modelos, tarifas).
* Verificación de clientes y licencias de conducir.
* Gestión de empleados con roles (base de la autenticación JWT).
* Orquestación de reservas y contratos de alquiler.
* **Módulo integral de inspecciones técnicas y físicas de vehículos (Salida y Entrada).**
* Facturación en dos tiempos: factura inicial tras la salida (cobro previo a la entrega) y factura complementaria tras la entrada (cargos de devolución), con renderizado en PDF.

### 1.3 Glosario Técnico
* **Arquitectura Hexagonal (Puertos y Adaptadores):** Patrón arquitectónico que aísla el núcleo de dominio de las dependencias externas (frameworks, bases de datos, APIs externas).
* **Puerto de Entrada (Inbound Port):** Interfaz que define los casos de uso disponibles para los actores externos.
* **Puerto de Salida (Outbound Port):** Interfaz que define las operaciones requeridas por el dominio hacia componentes externos (persistencia, PDF, notificaciones).
* **Adaptador de Entrada (Inbound Adapter):** Controlador REST o punto de entrada HTTP que transforma las peticiones externas en llamadas a los casos de uso.
* **Adaptador de Salida (Outbound Adapter):** Implementación técnica concreta de un puerto de salida (ej. Repositorios Spring Data JPA, adaptadores iText/JasperReports).
* **Inspección de Salida (Check-out):** Verificación técnica realizada antes de que el cliente retire el vehículo (kilometraje inicial, nivel de combustible y estado físico).
* **Inspección de Entrada (Check-in):** Verificación técnica realizada al momento de la devolución del vehículo para auditar kilometraje final, combustible retornado y detección de nuevos daños.
* **Patrón Result:** Los casos de uso retornan `Result<T>` (éxito con valor o fallo con `DomainError` tipificado `NOT_FOUND`/`CONFLICT`/`VALIDATION`) en vez de lanzar excepciones de negocio; el controller convierte el fallo en `DomainException` y el handler lo mapea a Problem Details.
* **Factura Inicial:** Documento fiscal emitido tras la inspección de salida (días × tarifa + ITBIS, cargos en cero); se cobra antes de entregar el vehículo y nunca se muta.
* **Factura Complementaria:** Documento fiscal vinculado a una inicial, emitido tras la inspección de entrada únicamente con los cargos de devolución; solo existe si dichos cargos son mayores a cero.

--- 

## 2. Descripción General y Restricciones Tecnológicas

### 2.1 Perspectiva del Producto
El backend funciona de manera autónoma como un microservicio o API central que atiende requerimientos de clientes frontend (web) o sistemas administrativos. La persistencia de datos se realiza sobre una base de datos relacional SQL Server.

```text
+-----------------------------------------------------------------+
|                       FRONTEND / CLIENTES                       |
+-----------------------------------------------------------------+
                                | HTTP / JSON (REST API)
                                v
+-----------------------------------------------------------------+
|                         ADAPTADOR REST                          |
|             (Spring MVC Controllers, DTOs, Mappers)             |
+-----------------------------------------------------------------+
                                |
                                v (Inbound Ports)
+-----------------------------------------------------------------+
|                         CAPA DE APLICACIÓN                       |
|               (Use Cases / Services Implementation)             |
+-----------------------------------------------------------------+
                                |
                                v
+-----------------------------------------------------------------+
|                         CAPA DE DOMINIO                         |
|           (Entidades, Objetos de Valor, Reglas de Negocio)      |
+-----------------------------------------------------------------+
                                | (Outbound Ports)
                                v
+-------------------------------+---------------------------------+
|   ADAPTADOR DE PERSISTENCIA   |       ADAPTADOR DE REPORTES     |
|   (Spring Data JPA / SQL)     |     (JasperReports)     |
+-------------------------------+---------------------------------+
               |                                |
               v                                v
         [ SQL Server ]                    [ Archivos PDF ]

```

### 2.2 Stack Tecnológico Obligatorio

* **Lenguaje de Programación:** Java 17 (Uso de Records, DTOs, Result Pattern).
* **Framework Principal:** Spring Boot 3.x (Spring Web, Spring Data JPA, Spring Security, Validation).
* **Autenticacion:** Autenticacion con JWT.
* **Base de Datos:** SQL Server 2019+.
* **Gestor de Dependencias:** Maven.
* **Generación de Documentos:** JasperReports.
* **Documentación de API:** OpenAPI 3.0 / Swagger UI.
* **Pruebas Unitarias:** JUnit 5 + Mockito.
* **Migración de Base de Datos:** Flyway.

---

## 3. Requisitos Funcionales (RF)

### RF-01: Gestión de Catálogos y Flota de Vehículos

* **RF-01.1 (Sucursales):** Permite registrar, consultar y listar sucursales activas.
* **RF-01.2 (Tipos y Tarifas):** Permite administrar tipos de vehículos y asociar tarifas por día. La tarifa posee un estado activo/inactivo para asegurar que solo exista un costo vigente por tipo de vehículo.
* **RF-01.3 (Vehículos):** Permite registrar unidades físicas con placa única, modelo y sucursal asignada. Gestiona los cambios de estado del vehículo (`Disponible`, `Alquilado`, `En Mantenimiento`, `Averiado`).
* **RF-01.4 (Filtro de Disponibilidad):** Consulta de vehículos disponibles filtrados por sucursal y rango de fechas.

### RF-02: Gestión de Clientes y Licencias

* **RF-02.1 (Registro de Clientes):** Alta y consulta de clientes mediante cédula/pasaporte.
* **RF-02.2 (Validación de Licencias):** Permite registrar y verificar la vigencia de licencias de conducir asociadas a un cliente. Rechaza reservas si la fecha de expiración de la licencia es anterior o coincide con el periodo de alquiler.
* **RF-02.3 (Gestión de Empleados):** Alta y consulta de empleados con sucursal asignada, `username` único, password con hash BCrypt, rol (`ADMINISTRADOR`, `AGENTE`, `MECANICO`) y flag `activo` para bloquear acceso sin borrar historial. Contratos e inspecciones referencian al empleado responsable/inspector (FK `EMPLEADO`).

### RF-03: Procesamiento de Reservas

* **RF-03.1 (Creación de Reserva):** Registra una reserva vinculando cliente, vehículo, licencia seleccionada y rango de fechas.
* **RF-03.2 (Validación de Negocio):**
* Verifica la disponibilidad del vehículo en las fechas solicitadas.
* Valida la vigencia de la licencia durante todo el periodo del alquiler.
* Obtiene la tarifa activa correspondiente al tipo de vehículo.



### RF-04: Gestión de Contratos

* **RF-04.1 (Generación de Contrato):** A partir de una reserva confirmada, genera el contrato de alquiler asignando al empleado responsable (existente y activo), fijando el monto de garantía y el total estimado. Una reserva solo genera un contrato; al generarlo la reserva pasa a `CONVERTIDA`.
* **RF-04.2 (Estado del Contrato):** El contrato nace en estado `Activo`.

### RF-05: Módulo de Inspección de Vehículos (Salida y Entrada)

* **RF-05.1 (Inspección de Salida / Check-out):**
* Registra la inspección inicial obligatoria vinculada al contrato antes de entregar el vehículo.
* Captura: empleado inspector (`id_empleado`), tipo (`Salida`), kilometraje actual, nivel de combustible (`Lleno`, `3/4`, `1/2`, `1/4`, `Reserva`) y observaciones de estado previo.
* Al completar la inspección de salida, actualiza automáticamente el estado del vehículo a `Alquilado`.


* **RF-05.2 (Inspección de Entrada / Check-in):**
* Registra la inspección final al momento de la devolución del vehículo por parte del cliente.
* Captura: empleado inspector (`id_empleado`), tipo (`Entrada`), kilometraje final, nivel de combustible devuelto y observaciones sobre nuevos daños/averías.


* **RF-05.3 (Validación Operativa de Inspección):**
* El kilometraje en la inspección de entrada debe ser mayor o igual al registrado en la inspección de salida.
* Un contrato no puede tener más de una inspección de salida y una de entrada.


* **RF-05.4 (Actualización Automática de Estado de Flota):**
* Si la inspección de entrada se registra sin observaciones de daño crítico, el estado del vehículo cambia a `Disponible`.
* Si la inspección de entrada registra daños o averías, el vehículo pasa automáticamente a estado `En Mantenimiento` o `Averiado`.


* **RF-05.5 (Cálculo de Penalizaciones y Cargos de Inspección):**
* Compara el nivel de combustible de salida vs. entrada. Si el nivel devuelto es inferior, genera un cargo por faltante de combustible (un costo fijo por cada escalón: `Lleno → 3/4 → 1/2 → 1/4 → Reserva`).
* Detecta exceso sobre los kilómetros incluidos por día, cargos por reparación derivados de las observaciones de entrada y recargo por días de retraso respecto al fin contractual.
* Los parámetros (costo por nivel, precio por km extra, km incluidos/día, recargo por daño y por día de retraso, % ITBIS) viven en la tabla `PARAMETRO_FACTURACION`, con respaldo en `BillingProperties`.



### RF-06: Módulo de Facturación en Dos Tiempos y PDF

El negocio cobra **antes de entregar el vehículo**, por lo que la facturación se divide
en dos documentos fiscales. La factura inicial nunca se muta una vez emitida.

* **RF-06.1 (Factura Inicial):** Se emite tras la inspección de salida (exige contrato
vigente + salida registrada; no exige la entrada para no bloquear el cobro previo).
Consolida subtotal de días de alquiler según tarifa vigente (cargos en cero),
aplica ITBIS y calcula el total. Solo existe una inicial por contrato.
* **RF-06.2 (Factura Complementaria):** Se emite tras la inspección de entrada, colgada
de una inicial existente (`factura_origen_id`). Consolida únicamente los cargos de
devolución calculados en RF-05.5 más su ITBIS. Si la devolución no genera cargos,
no se emite documento (conflicto 409) en vez de una factura en cero.
* **RF-06.3 (Persistencia de Factura):** Registra la cabecera (`FACTURA` con `tipo`
`INICIAL`/`COMPLEMENTARIA`) y sus líneas en `FACTURA_DETALLE` vinculadas al contrato.
* **RF-06.4 (Generación de PDF):** Transforma cada factura en un archivo PDF con identidad
"Rent a car Sys" (encabezado comercial, datos de cliente/vehículo/contrato/periodo,
tabla de conceptos y caja de totales) para su descarga vía API. La inicial se titula
`FACTURA`; la complementaria, `FACTURA COMPLEMENTARIA` con referencia a la inicial.

---

## 4. Requisitos No Funcionales (RNF)

### RNF-01: Arquitectura y Mantenibilidad

* Estrategia basada en **Arquitectura Hexagonal** dividida en `domain`, `application` e `infrastructure`.
* El módulo `domain` **no debe poseer ninguna dependencia** de frameworks externos o librerías de infraestructura (cero referencias a Spring, JPA o Hibernate).

### RNF-02: Rendimiento

* Tiempo de respuesta en endpoints transaccionales (reservas, contratos, inspecciones) < menor a 300 ms en el percentil 95 (P95).
* Generación e inyección del documento PDF de factura < 1.5 segundos.

### RNF-03: Seguridad y Autenticación

* Implementación de Spring Security mediante tokens **JWT (JSON Web Tokens)** (fase de autenticación pendiente; temporalmente la API opera con acceso abierto `permitAll`).
* Control de acceso basado en roles (enum `RolEmpleado`, sin prefijo `ROLE_`):
* `ADMINISTRADOR`: Acceso total.
* `AGENTE`: Gestión de clientes, reservas, contratos y facturación.
* `MECANICO`: Exclusivo para registro y consulta de inspecciones técnicas de salida/entrada.



### RNF-04: Manejo de Excepciones y Trazabilidad

* Formato estandarizado de respuesta para errores HTTP basado en el estándar **RFC 7807 (Problem Details)**.
* Uso de ExcepcionHandler global para capturar y mapear excepciones de negocio a códigos HTTP apropiados (400, 404, 409, 500). Puente con el patrón Result: el controller convierte `Result.Failure` en `DomainException` (`NOT_FOUND` → 404, `CONFLICT` → 409, `VALIDATION` → 400).
* Control global de transacciones con `@Transactional` garantizando reversión (rollback) ante fallos en la secuencia Reserva $\rightarrow$ Contrato $\rightarrow$ Inspección $\rightarrow$ Factura.

---

## 5. Especificación de la Arquitectura Hexagonal

### 5.1 Estructura de Paquetes

```text
com.project.rent_a_car_api
│
├── domain/                         -- Núcleo Puro de Dominio (Sin dependencias externas)
│   ├── model/                      -- Entidades (Sucursal, TipoVehiculo, Tarifa, Vehiculo, Cliente, Licencia, Reserva, Contrato, Inspeccion, Factura, Empleado + enums)
│   ├── result/                     -- Patrón Result (Result<T>, DomainError NOT_FOUND/CONFLICT/VALIDATION)
│   ├── exception/                  -- Puente DomainException (Failure -> ProblemDetail vía handler)
│   └── service/                    -- Servicios de dominio (Ej: EvaluadorCargosInspeccionService)
│
├── application/                    -- Capa de Aplicación
│   ├── ports/
│   │   ├── inbound/                -- Casos de Uso (SucursalUseCase, VehiculoUseCase, ReservaUseCase, RegistrarInspeccionUseCase, FacturaUseCase, EmpleadoUseCase, ...)
│   │   └── outbound/               -- Puertos hacia afuera (InspeccionRepositoryPort, FacturaRepositoryPort, VehiculoRepositoryPort, PdfGeneratorPort, BillingParamsPort, ...)
│   └── usecase/                    -- Implementación de los Casos de Uso (retornan Result, @Transactional)
│
└── infrastructure/                 -- Capa de Adaptadores e Infraestructura
    ├── adapters/
    │   ├── inbound/rest/           -- Controllers REST, DTOs Requests/Responses (con anotaciones OpenAPI)
    │   ├── outbound/persistence/    -- Entities JPA, Repositories Spring Data JPA, Adapters por agregado
    │   └── outbound/pdf/           -- Adaptador JasperReports de factura (JasperFacturaPdfAdapter)
    ├── config/                     -- Beans de Spring, Security (permitAll temporal), Swagger, BillingProperties
    └── exception/                  -- GlobalExceptionHandler RFC 7807 (+ DomainException 400/404/409)

```

### 5.2 Definición de Puertos de Inspección (Contratos Técnicos)

#### Inbound Port (Caso de Uso de Inspección)

```java
package com.project.rent_a_car_api.application.ports.inbound;

import com.project.rent_a_car_api.domain.model.Inspeccion;
import com.project.rent_a_car_api.domain.model.NivelCombustible;
import com.project.rent_a_car_api.domain.model.TipoInspeccion;
import com.project.rent_a_car_api.domain.result.Result;
import java.util.List;

public interface RegistrarInspeccionUseCase {
    Result<Inspeccion> ejecutar(
            Long idContrato,
            Long idEmpleado,
            TipoInspeccion tipoInspeccion,
            int kilometraje,
            NivelCombustible nivelCombustible,
            String observaciones
    );

    Result<List<Inspeccion>> listarPorContrato(Long contratoId);
}

```

#### Outbound Port (Persistencia de Inspección)

```java
package com.project.rent_a_car_api.application.ports.outbound;

import com.project.rent_a_car_api.domain.model.Inspeccion;
import com.project.rent_a_car_api.domain.model.TipoInspeccion;
import java.util.List;
import java.util.Optional;

public interface InspeccionRepositoryPort {
    Inspeccion guardar(Inspeccion inspeccion);
    Optional<Inspeccion> buscarPorId(Long idInspeccion);
    List<Inspeccion> listarPorContrato(Long idContrato);
    boolean existePorContratoYTipo(Long idContrato, TipoInspeccion tipoInspeccion);
}

```

#### Inbound Port (Caso de Uso de Facturación en Dos Tiempos)

```java
package com.project.rent_a_car_api.application.ports.inbound;

import com.project.rent_a_car_api.domain.model.Factura;
import com.project.rent_a_car_api.domain.result.Result;
import java.time.LocalDate;

public interface FacturaUseCase {
    // Inicial tras la salida (cargos en cero); 409 si ya existe inicial.
    Result<Factura> emitir(Long contratoId, LocalDate fechaDevolucion);

    // Complementaria tras la entrada (solo cargos); 409 si no hay cargos.
    Result<Factura> emitirComplementaria(Long facturaInicialId, LocalDate fechaDevolucion);
}

```

---

## 6. Mapeo de Interfaces de Entradas (REST API Endpoints)

| Módulo | Método | Endpoint | Descripción | Roles previstos (auth pendiente) | DTO Entrada / Salida |
| --- | --- | --- | --- | --- | --- |
| **Sucursales** | `GET` | `/api/v1/sucursales?soloActivas=true` | Listar sucursales (activas por defecto) | Todos | `-` / `List<SucursalResponse>` |
| **Sucursales** | `POST` | `/api/v1/sucursales` | Registrar sucursal | `AGENTE`, `ADMINISTRADOR` | `SucursalRequest` / `SucursalResponse` |
| **Catálogos** | `GET` | `/api/v1/tipos-vehiculo` | Listar tipos de vehículo | Todos | `-` / `List<TipoResponse>` |
| **Catálogos** | `POST` | `/api/v1/tipos-vehiculo` | Registrar tipo de vehículo | `AGENTE`, `ADMINISTRADOR` | `TipoRequest` / `TipoResponse` |
| **Catálogos** | `GET` | `/api/v1/tarifas` | Listar tarifas activas | Todos | `-` / `List<TarifaResponse>` |
| **Catálogos** | `POST` | `/api/v1/tarifas` | Definir tarifa activa del tipo | `AGENTE`, `ADMINISTRADOR` | `TarifaRequest` / `TarifaResponse` |
| **Vehículos** | `GET` | `/api/v1/vehiculos/disponibles?sucursalId=` | Disponibles por sucursal | `AGENTE`, `ADMINISTRADOR` | `QueryParam` / `List<VehiculoResponse>` |
| **Vehículos** | `POST` | `/api/v1/vehiculos` | Registrar vehículo (placa única) | `AGENTE`, `ADMINISTRADOR` | `VehiculoRequest` / `VehiculoResponse` |
| **Vehículos** | `PATCH` | `/api/v1/vehiculos/{id}/estado` | Cambio manual de estado de flota | `AGENTE`, `ADMINISTRADOR` | `EstadoVehiculoRequest` / `VehiculoResponse` |
| **Empleados** | `POST` | `/api/v1/empleados` | Registrar empleado (BCrypt + rol) | `ADMINISTRADOR` | `EmpleadoRequest` / `EmpleadoResponse` |
| **Empleados** | `GET` | `/api/v1/empleados` | Listar empleados | `ADMINISTRADOR` | `-` / `List<EmpleadoResponse>` |
| **Empleados** | `GET` | `/api/v1/empleados/{id}` | Buscar empleado | `ADMINISTRADOR` | `-` / `EmpleadoResponse` |
| **Clientes** | `POST` | `/api/v1/clientes` | Registrar un cliente | `AGENTE`, `ADMINISTRADOR` | `ClienteRequest` / `ClienteResponse` |
| **Licencias** | `POST` | `/api/v1/licencias` | Registrar/validar licencia de conducir | `AGENTE`, `ADMINISTRADOR` | `LicenciaRequest` / `LicenciaResponse` |
| **Licencias** | `GET` | `/api/v1/clientes/{id}/licencias` | Licencias de un cliente | `AGENTE`, `ADMINISTRADOR` | `-` / `List<LicenciaResponse>` |
| **Reservas** | `POST` | `/api/v1/reservas` | Crear reserva validando licencias y tarifas | `AGENTE`, `ADMINISTRADOR` | `ReservaRequest` / `ReservaResponse` |
| **Contratos** | `POST` | `/api/v1/contratos` | Generar contrato a partir de una reserva | `AGENTE`, `ADMINISTRADOR` | `ContratoRequest` / `ContratoResponse` |
| **Contratos** | `GET` | `/api/v1/contratos/{id}` | Buscar contrato | `AGENTE`, `ADMINISTRADOR` | `-` / `ContratoResponse` |
| **Inspecciones** | `POST` | `/api/v1/inspecciones` | Registrar inspección (Salida o Entrada) | `MECANICO`, `AGENTE`, `ADMINISTRADOR` | `InspeccionRequest` / `InspeccionResponse` |
| **Inspecciones** | `GET` | `/api/v1/contratos/{id}/inspecciones` | Listar inspecciones (salida/entrada) de un contrato | `MECANICO`, `AGENTE`, `ADMINISTRADOR` | `-` / `List<InspeccionResponse>` |
| **Facturas** | `POST` | `/api/v1/facturas` | Emitir inicial tras la salida | `AGENTE`, `ADMINISTRADOR` | `FacturaRequest` / `FacturaResponse` |
| **Facturas** | `POST` | `/api/v1/facturas/{id}/complementaria` | Emitir complementaria tras la entrada | `AGENTE`, `ADMINISTRADOR` | `ComplementariaRequest` / `FacturaResponse` |
| **Facturas** | `GET` | `/api/v1/facturas` | Listar facturas | `AGENTE`, `ADMINISTRADOR` | `-` / `List<FacturaResponse>` |
| **Facturas** | `GET` | `/api/v1/facturas/{id}` | Buscar factura | `AGENTE`, `ADMINISTRADOR` | `-` / `FacturaResponse` |
| **Facturas** | `GET` | `/api/v1/facturas/{id}/pdf` | Descargar PDF de factura con desglose detallado | `AGENTE`, `ADMINISTRADOR` | `-` / `byte[] (application/pdf)` |
| **Auth** | `POST` | `/api/v1/auth/login` | Login JWT (pendiente de implementación) | Todos | `LoginRequest` / `TokenResponse` |

Nota: los roles aplican cuando se active JWT (RNF-03); temporalmente la API opera con acceso abierto.