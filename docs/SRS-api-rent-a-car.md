
# Especificación de Requisitos de Software (SRS) — Backend Rent-a-Car


## 1. Introducción

### 1.1 Propósito
El propósito de este documento es definir la Especificación de Requisitos de Software (SRS) para el desarrollo del **Backend del Sistema de Alquiler de Vehículos (Rent-a-Car)**. Este documento sirve de guía técnica para desarrolladores, arquitectos y evaluadores del proyecto, detallando la lógica del negocio, la arquitectura hexagonal, las interfaces de integración REST y los criterios no funcionales del sistema.

### 1.2 Alcance del Sistema
El backend proporcionará una API RESTful y stateless orientada al servicio de gestión de alquiler de vehículos. Administrará el ciclo de vida completo de la operación:
* Catálogos (sucursales, vehículos, modelos, tarifas).
* Verificación de clientes y licencias de conducir.
* Orquestación de reservas y contratos de alquiler.
* **Módulo integral de inspecciones técnicas y físicas de vehículos (Salida y Entrada).**
* Cálculo financiero y generación de facturas desglosadas (incluyendo cargos por ajustes detectados en inspección) con renderizado en PDF.

### 1.3 Glosario Técnico
* **Arquitectura Hexagonal (Puertos y Adaptadores):** Patrón arquitectónico que aísla el núcleo de dominio de las dependencias externas (frameworks, bases de datos, APIs externas).
* **Puerto de Entrada (Inbound Port):** Interfaz que define los casos de uso disponibles para los actores externos.
* **Puerto de Salida (Outbound Port):** Interfaz que define las operaciones requeridas por el dominio hacia componentes externos (persistencia, PDF, notificaciones).
* **Adaptador de Entrada (Inbound Adapter):** Controlador REST o punto de entrada HTTP que transforma las peticiones externas en llamadas a los casos de uso.
* **Adaptador de Salida (Outbound Adapter):** Implementación técnica concreta de un puerto de salida (ej. Repositorios Spring Data JPA, adaptadores iText/JasperReports).
* **Inspección de Salida (Check-out):** Verificación técnica realizada antes de que el cliente retire el vehículo (kilometraje inicial, nivel de combustible y estado físico).
* **Inspección de Entrada (Check-in):** Verificación técnica realizada al momento de la devolución del vehículo para auditar kilometraje final, combustible retornado y detección de nuevos daños.

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

### RF-03: Procesamiento de Reservas

* **RF-03.1 (Creación de Reserva):** Registra una reserva vinculando cliente, vehículo, licencia seleccionada y rango de fechas.
* **RF-03.2 (Validación de Negocio):**
* Verifica la disponibilidad del vehículo en las fechas solicitadas.
* Valida la vigencia de la licencia durante todo el periodo del alquiler.
* Obtiene la tarifa activa correspondiente al tipo de vehículo.



### RF-04: Gestión de Contratos

* **RF-04.1 (Generación de Contrato):** A partir de una reserva confirmada, genera el contrato de alquiler asignando al empleado responsable, fijando el monto de garantía y el total estimado.
* **RF-04.2 (Actualización por Contrato):** Cambia el estado del contrato a `Activo`.

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
* Compara el nivel de combustible de salida vs. entrada. Si el nivel devuelto es inferior, genera un cargo por faltante de combustible.
* Detecta si hubo exceso de kilometraje permitido o cargos por reparación derivados de las observaciones de entrada.



### RF-06: Módulo de Facturación y Expresión en PDF

* **RF-06.1 (Consolidación Financiera):** Procesa el total definitivo a facturar consolidando:
* Subtotal de días de alquiler según tarifa vigente.
* Cargos adicionales derivados de la inspección de entrada (faltante de combustible, cargos por daños o retrasos).
* Aplicación de impuestos (IVA/ITBIS) y cálculo del monto total.


* **RF-06.2 (Persistencia de Factura):** Registra la cabecera (`FACTURA`) y sus líneas en `FACTURA_DETALLE` vinculadas al contrato e inspecciones asociadas.
* **RF-06.3 (Generación de PDF):** Transforma la factura y sus detalles en un archivo PDF estructurado (incluyendo datos de inspección como kilometraje recorrido y combustible) para su descarga vía API.

---

## 4. Requisitos No Funcionales (RNF)

### RNF-01: Arquitectura y Mantenibilidad

* Estrategia basada en **Arquitectura Hexagonal** dividida en `domain`, `application` e `infrastructure`.
* El módulo `domain` **no debe poseer ninguna dependencia** de frameworks externos o librerías de infraestructura (cero referencias a Spring, JPA o Hibernate).

### RNF-02: Rendimiento

* Tiempo de respuesta en endpoints transaccionales (reservas, contratos, inspecciones) < menor a 300 ms en el percentil 95 (P95).
* Generación e inyección del documento PDF de factura < 1.5 segundos.

### RNF-03: Seguridad y Autenticación

* Implementación de Spring Security mediante tokens **JWT (JSON Web Tokens)**.
* Control de acceso basado en roles:
* `ROLE_ADMINISTRADOR`: Acceso total.
* `ROLE_AGENTE`: Gestión de clientes, reservas, contratos y facturación.
* `ROLE_MECANICO` / `ROLE_INSPECTOR`: Exclusivo para registro y consulta de inspecciones técnicas de salida/entrada.



### RNF-04: Manejo de Excepciones y Trazabilidad

* Formato estandarizado de respuesta para errores HTTP basado en el estándar **RFC 7807 (Problem Details)**.
* Uso de ExcepcionHandler global para capturar y mapear excepciones de negocio a códigos HTTP apropiados (400, 404, 409, 500).
* Control global de transacciones con `@Transactional` garantizando reversión (rollback) ante fallos en la secuencia Reserva $\rightarrow$ Contrato $\rightarrow$ Inspección $\rightarrow$ Factura.

---

## 5. Especificación de la Arquitectura Hexagonal

### 5.1 Estructura de Paquetes

```text
com.rentacar.backend
│
├── domain/                         -- Núcleo Puro de Dominio (Sin dependencias externas)
│   ├── model/                      -- Entidades (Cliente, Vehiculo, Reserva, Contrato, Inspeccion, Factura)
│   ├── exception/                  -- Excepciones de negocio (KilometrajeInvalidoException, InspeccionDuplicadaException)
│   └── service/                    -- Servicios de dominio (Ej: EvaluadorCargosInspeccionService)
│
├── application/                    -- Capa de Aplicación
│   ├── ports/
│   │   ├── inbound/                -- Casos de Uso (RegistrarInspeccionUseCase, EmitirFacturaUseCase)
│   │   └── outbound/               -- Puertos hacia afuera (InspeccionRepositoryPort, VehiculoStatePort, PdfGeneratorPort)
│   └── usecase/                    -- Implementación de los Casos de Uso
│
└── infrastructure/                 -- Capa de Adaptadores e Infraestructura
    ├── adapters/
    │   ├── inbound/rest/           -- Controllers REST, DTOs, Mappers (MapStruct)
    │   ├── outbound/persistence/    -- Entities JPA, Repositories Spring Data JPA
    │   └── outbound/pdf/           -- Adaptador de generación de reportes PDF (iText / Jasper)
    └── config/                     -- Beans de Spring, Security, Swagger

```

### 5.2 Definición de Puertos de Inspección (Contratos Técnicos)

#### Inbound Port (Caso de Uso de Inspección)

```java
package com.rentacar.backend.application.ports.inbound;

import com.rentacar.backend.domain.model.Inspeccion;

public interface RegistrarInspeccionUseCase {
    Inspeccion ejecutar(
            Long idContrato,
            Long idEmpleado,
            String tipoInspeccion,
            int kilometraje,
            String nivelCombustible,
            String observaciones
    );
}

```

#### Outbound Port (Persistencia de Inspección)

```java
package com.rentacar.backend.application.ports.outbound;

import com.rentacar.backend.domain.model.Inspeccion;
import java.util.List;
import java.util.Optional;

public interface InspeccionRepositoryPort {
    Inspeccion guardar(Inspeccion inspeccion);
    Optional<Inspeccion> buscarPorId(Long idInspeccion);
    List<Inspeccion> listarPorContrato(Long idContrato);
    boolean existePorContratoYTipo(Long idContrato, String tipoInspeccion);
}

```

---

## 6. Mapeo de Interfaces de Entradas (REST API Endpoints)

| Módulo | Método | Endpoint | Descripción | Roles Permitidos | DTO Entrada / Salida |
| --- | --- | --- | --- | --- | --- |
| **Sucursales** | `GET` | `/api/v1/sucursales` | Listar todas las sucursales | Todos | `-` / `List<SucursalDTO>` |
| **Vehículos** | `GET` | `/api/v1/vehiculos/disponibles` | Consultar vehículos disponibles por fecha/sucursal | `AGENTE`, `ADMIN` | `QueryParam` / `List<VehiculoDTO>` |
| **Clientes** | `POST` | `/api/v1/clientes` | Registrar un cliente | `AGENTE`, `ADMIN` | `ClienteRequestDTO` / `ClienteDTO` |
| **Licencias** | `POST` | `/api/v1/licencias` | Registrar/validar licencia de conducir | `AGENTE`, `ADMIN` | `LicenciaRequestDTO` / `LicenciaDTO` |
| **Reservas** | `POST` | `/api/v1/reservas` | Crear reserva validando licencias y tarifas | `AGENTE`, `ADMIN` | `CrearReservaDTO` / `ReservaDTO` |
| **Contratos** | `POST` | `/api/v1/contratos` | Generar contrato a partir de una reserva | `AGENTE`, `ADMIN` | `ContratoRequestDTO` / `ContratoDTO` |
| **Inspecciones** | `POST` | `/api/v1/inspecciones` | Registrar inspección (Salida o Entrada) | `MECANICO`, `AGENTE`, `ADMIN` | `InspeccionRequestDTO` / `InspeccionDTO` |
| **Inspecciones** | `GET` | `/api/v1/contratos/{id}/inspecciones` | Listar inspecciones (salida/entrada) de un contrato | `MECANICO`, `AGENTE`, `ADMIN` | `-` / `List<InspeccionDTO>` |
| **Facturas** | `POST` | `/api/v1/facturas` | Emitir factura (consolida tarifa + cargos de inspección) | `AGENTE`, `ADMIN` | `EmitirFacturaDTO` / `FacturaDTO` |
| **Facturas** | `GET` | `/api/v1/facturas/{id}/pdf` | Descargar PDF de factura con desglose detallado | `AGENTE`, `ADMIN` | `-` / `byte[] (application/pdf)` |
y los que falten (como los de autenticacion por poner un ejemplo)
```

```