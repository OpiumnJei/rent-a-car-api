# Cheat Sheet — Arquitectura Hexagonal (Puertos y Adaptadores) — Rent-a-Car API

Guía de repaso basada en las clases reales del proyecto. Sirve para estudiar, para la exposición
y para no volver a confundir los conceptos.

> Cómo usarlo: léelo completo una vez, y al final responde la **autoevaluación** tapando las
> respuestas (vienen plegadas en "Ver respuesta").

---

## 1. La idea en 30 segundos

- El **núcleo** (reglas de negocio + casos de uso) no sabe nada de SQL, HTTP ni PDFs. Se conecta
  con el mundo a través de **contratos (puertos)**.
- Quien implementa esos contratos son los **adaptadores** (controladores, persistencia, PDF).
- **Todas las dependencias apuntan hacia adentro**: la infraestructura conoce a `application` y
  `domain`; el núcleo no conoce a nadie de afuera.

---

## 2. La analogía de la agencia (la que sí funciona)

Imagina una agencia de alquiler de autos física:

| En la agencia | En el código | Qué hace |
| --- | --- | --- |
| Empleado de mostrador | `ReservaContratoController` | Recibe al cliente (HTTP), toma los datos y los pasa al gerente. No sabe de archivos ni de cálculos. |
| Gerente | `ReservaService` | Aplica las reglas ("el auto ya está reservado", "la licencia está vencida") y da órdenes al archivero. Nunca toca el archivo directamente. |
| Formulario/instrucciones del gerente | `ReservaRepositoryPort` | El contrato: "necesito guardar, buscar por id, verificar solape". No dice cómo. |
| Archivero | `ReservaPersistenceAdapter` | Único que sabe dónde está el libro y cómo escribir en él (SQL Server). |
| Libro contable | Tabla `RESERVA` | Los datos persistidos. |
| La reserva misma | `Reserva` (dominio) | El concepto de negocio, puro, sin ataduras técnicas. |

---

## 3. Las tres capas del proyecto (dónde vive cada cosa)

```
src/main/java/com/project/rent_a_car_api/
├── domain/
│   ├── model/       → records puros: Reserva, Factura, Vehiculo, ...
│   └── result/      → Result, DomainError (éxito/fallo tipado, sin excepciones)
├── application/
│   ├── ports/
│   │   ├── inbound/     → interfaces *UseCase (9)
│   │   └── outbound/    → interfaces *RepositoryPort (11) + PdfGeneratorPort + BillingParamsPort
│   └── usecase/         → *Service (@Service), implementan los *UseCase (8 services)
└── infrastructure/
    ├── adapters/
    │   ├── inbound/rest/            → *Controller + dto/ (7 controllers)
    │   └── outbound/
    │       ├── persistence/adapter/ → *PersistenceAdapter (11)
    │       ├── persistence/entity/  → *Entity (JPA: @Entity, @Table, @Column)
    │       ├── persistence/repository/ → *JpaRepository (Spring Data)
    │       └── pdf/                 → JasperFacturaPdfAdapter
    ├── config/        → SecurityConfig, OpenApiConfig, BillingProperties
    └── exception/     → GlobalExceptionHandler
```

**Regla de oro de esta estructura**: `domain` no importa nada de Spring/JPA; `application` solo
importa de `domain`; `infrastructure` puede importar de todos. Nunca al revés.

---

## 4. Puertos (los contratos)

### 4.1 Puertos de entrada (inbound) — los llama el mundo exterior

| Puerto (interfaz) | Lo implementa | Lo llama |
| --- | --- | --- |
| `CatalogoUseCase`, `SucursalUseCase` | `CatalogoService` | `CatalogoController` |
| `VehiculoUseCase` | `VehiculoService` | `VehiculoController` |
| `ClienteUseCase` | `ClienteService` | `ClienteController` |
| `ReservaUseCase` | `ReservaService` | `ReservaContratoController` |
| `ContratoUseCase` | `ContratoService` | `ReservaContratoController` |
| `RegistrarInspeccionUseCase` | `InspeccionService` | `InspeccionController` |
| `FacturaUseCase` | `FacturaService` | `FacturaController` |
| `EmpleadoUseCase` | `EmpleadoService` | `EmpleadoController` |

Un puerto puede tener un método por historia de usuario (`crear`, `listar`, `obtenerPorId`...).
Ninguna interfaz tiene código ejecutable: solo la firma.

### 4.2 Puertos de salida (outbound) — los llama el núcleo

| Puerto (interfaz) | Adaptador que lo implementa | Tecnología |
| --- | --- | --- |
| `SucursalRepositoryPort` | `SucursalPersistenceAdapter` | SQL Server (JPA) |
| `TipoVehiculoRepositoryPort` | `CatalogoPersistenceAdapter` | SQL Server (JPA) |
| `TarifaRepositoryPort` | `TarifaPersistenceAdapter` | SQL Server (JPA) |
| `VehiculoRepositoryPort` | `VehiculoPersistenceAdapter` | SQL Server (JPA) |
| `ClienteRepositoryPort` | `ClientePersistenceAdapter` | SQL Server (JPA) |
| `LicenciaRepositoryPort` | `LicenciaPersistenceAdapter` | SQL Server (JPA) |
| `ReservaRepositoryPort` | `ReservaPersistenceAdapter` | SQL Server (JPA) |
| `ContratoRepositoryPort` | `ContratoPersistenceAdapter` | SQL Server (JPA) |
| `InspeccionRepositoryPort` | `InspeccionPersistenceAdapter` | SQL Server (JPA) |
| `FacturaRepositoryPort` | `FacturaPersistenceAdapter` | SQL Server (JPA) |
| `EmpleadoRepositoryPort` | `EmpleadoPersistenceAdapter` | SQL Server (JPA) |
| `PdfGeneratorPort` | `JasperFacturaPdfAdapter` | JasperReports → `byte[]` PDF |
| `BillingParamsPort` | `BillingProperties` | `application.properties` |

> Nota: un adaptador por puerto. `CatalogoPersistenceAdapter` implementa solo
> `TipoVehiculoRepositoryPort` (se separó de tarifas: ver comentario en el código).

---

## 5. Regla mnemotécnica: ¿inbound u outbound?

La pregunta clave: **¿quién inicia la llamada?**

| Situación | Tipo | Ejemplos del proyecto |
| --- | --- | --- |
| El mundo exterior llama **hacia adentro** del núcleo | **Inbound** | Controllers REST → `*UseCase` |
| El núcleo llama **hacia afuera** del mundo | **Outbound** | Services → `*RepositoryPort`, `PdfGeneratorPort`, `BillingParamsPort` |

**Outbound NO significa "base de datos".** Significa *todo lo que el núcleo necesita del
exterior*: guardar datos (repositorios), generar un PDF (Jasper), enviar un correo, leer
configuración (`BillingProperties`).

Ojo: "recibe datos como parámetro" **no** sirve como criterio — todo método recibe datos. El
criterio es la **dirección de la llamada**.

---

## 6. Flujo completo de una petición

### 6.1 Ejemplo: `POST /api/v1/reservas`

```
HTTP POST /api/v1/reservas  (JSON)
   │
   ▼
ReservaContratoController                 ← adaptador de ENTRADA (traduce el HTTP)
   │ llama al puerto de entrada
   ▼
ReservaUseCase                            ← puerto INBOUND (interfaz)
   │ lo implementa
   ▼
ReservaService                            ← caso de uso (@Service, @Transactional)
   │ valida reglas: cliente, vehículo, licencia vigente y del cliente,
   │ fechas, solape, tarifa activa → arma Reserva (dominio)
   │ luego pide a los puertos de SALIDA:
   │
   ├──► ClienteRepositoryPort  ──► ClientePersistenceAdapter  ──► ClienteJpaRepository  ──► SQL
   ├──► VehiculoRepositoryPort ──► VehiculoPersistenceAdapter ──► VehiculoJpaRepository ──► SQL
   ├──► LicenciaRepositoryPort ──► LicenciaPersistenceAdapter ──► LicenciaJpaRepository ──► SQL
   ├──► TarifaRepositoryPort   ──► TarifaPersistenceAdapter   ──► TarifaJpaRepository   ──► SQL
   └──► ReservaRepositoryPort  ──► ReservaPersistenceAdapter  ──► ReservaJpaRepository  ──► SQL
   │
   ▼
Result<Reserva>  →  ReservaResponse (HTTP 201)
   │ si hay DomainError
   ▼
GlobalExceptionHandler  →  400 / 404 / 409 (formato Problem Details)
```

### 6.2 Ejemplo: generar el PDF de una factura

```
FacturaController → FacturaUseCase → FacturaService
    └──► PdfGeneratorPort (interfaz en application/ports/outbound)
             └──► JasperFacturaPdfAdapter (infrastructure/adapters/outbound/pdf)
                      └──► reports/factura.jrxml → byte[] PDF
```

El caso de uso **no conoce JasperReports**; solo conoce `byte[] generarFacturaPdf(Long id)`.
Si mañana cambias de Jasper a otra librería, solo cambias el adaptador.

---

## 7. La regla de oro: dependencias hacia adentro (Inversión de Dependencias)

```
   domain  ←  application  ←  infrastructure
   (núcleo)   (puertos + use cases)   (controllers, JPA, Jasper)
```

- El **contrato (puerto) lo define quien tiene la necesidad**: el núcleo. **No** quien lo
  implementa (infraestructura).
- Es la **D de SOLID** ("Dependency Inversion Principle"): normalmente la capa de arriba
  dependería de la de abajo; aquí se invierte — la infraestructura depende de las interfaces
  del núcleo.
- **Evidencia en el código**: los adaptadores importan los puertos desde `application...`;
  el núcleo jamás importa `infrastructure...`.
- **Contraejemplo fatal**: definir `VehiculoRepositoryPort` dentro de `infrastructure` "según lo
  que JPA permita" sería un doble error:
  1. el lado equivocado → el `Service` tendría que importar la capa externa;
  2. la tecnología dictando el contrato → los métodos (`buscarPorPlaca`...) los dicta el
     negocio, no JPA.
- Los puertos viven "dentro del hexágono". En **este proyecto** el interior está separado en:
  `domain/` (modelos y `Result`) y `application/ports/` (los puertos) + `application/usecase/`.

---

## 8. Spring: el pegamento invisible

- `@Service` en los casos de uso y `@Component` en los adaptadores → Spring los detecta
  (component scan) y los registra como **beans**.
- **Inyección por contrato**: el constructor de `ReservaService` pide `ReservaRepositoryPort`;
  Spring le pasa la instancia de `ReservaPersistenceAdapter` porque es la clase que cumple el
  contrato. Tú nunca escribes `new ReservaPersistenceAdapter()` — por eso "no ves" dónde se usa.
- Cuando el service ejecuta `reservas.guardar(...)`, **el código que corre es el del adaptador**
  (polimorfismo). Las interfaces no tienen código.
- Si le quitas `@Component` al adaptador → **falla al arrancar** con
  `UnsatisfiedDependencyException` / `NoSuchBeanDefinitionException`: no hay bean que implemente
  el puerto.
- Si existieran **dos** implementaciones del mismo puerto → Spring pide desambiguar con
  `@Primary` o `@Qualifier`.

### Beneficios reales de depender de la interfaz (y no de la clase concreta)

1. **Sustituir la implementación sin tocar a quien llama** (el controller o el service ni se
   enteran).
2. **Testear con dobles/mocks** del puerto, sin base de datos real.
3. **Spring resuelve por tipo**: "dame quien cumpla este contrato".

---

## 9. No confundir: puerto de repositorio vs `JpaRepository`

| | `ReservaRepositoryPort` | `ReservaJpaRepository` |
| --- | --- | --- |
| Capa | `application/ports/outbound` (interior) | `infrastructure/.../repository` (exterior) |
| Quién lo define | El núcleo, según su necesidad | Convención de Spring Data |
| Quién lo implementa | `ReservaPersistenceAdapter` (lo escribes tú) | Spring Data, en runtime (proxy) |
| Lenguaje | Dominio (`Reserva`) | Persistencia (`ReservaEntity`) |
| Rol | Contrato estable del núcleo | Herramienta interna del adaptador |

---

## 10. Mapeo dominio ↔ entidad (`aEntidad` / `aDominio`)

- El **modelo de dominio** es un `record` inmutable y sin anotaciones (`Reserva`, `Factura`...).
- La **entidad JPA** es una clase con `@Entity`, `@Table`, `@Column` (`ReservaEntity`...).
- El adaptador **traduce en ambos sentidos**:
  - `aEntidad(dominio)` → objeto listo para `jpa.save(...)`;
  - `aDominio(entidad)` → devuelve al núcleo un objeto puro (con el id ya generado por la BD).
- Por qué: el dominio queda **libre de dependencias tecnológicas**; JPA es un detalle del
  adaptador.

---

## 11. Iconos de IntelliJ que generaban duda

| Icono / texto | Significado |
| --- | --- |
| `f` con flecha hacia **arriba** | Método declarado en una interfaz (tiene implementaciones) |
| `f` con flecha hacia **abajo** | Método que **sobrescribe** (`@Override`) a uno de la interfaz o clase padre |
| `1 implementation` | Cuántas clases implementan esa interfaz (ej. `ReservaRepositoryPort` → 1: el adaptador) |
| `5 usages` | En cuántos lugares se usa ese campo/método |

---

## 12. Trampas frecuentes (errores que ya casi cometes)

- ❌ "Se ejecuta el código de la interfaz" → las interfaces no tienen código; se ejecuta el
  **adaptador** inyectado.
- ❌ "Outbound = base de datos" → también PDFs, correo, configuración...
- ❌ "El puerto lo define infraestructura / según lo que JPA permita" → lo define el **núcleo**
  según su necesidad, y vive adentro (`application/ports/`).
- ❌ "El controller puede llamar al `JpaRepository` directo" → jamás. Camino único:
  controller → use case → puerto de salida → adaptador → JPA.
- ❌ "El dominio puede importar Spring o JPA" → jamás; solo Java puro (`java.time`,
  `java.math`, sus propios `Result`/`DomainError`).
- ❌ "Si no veo `new Adaptador()` es que no se usa" → lo crea e inyecta Spring.

---

## 13. Las 5 reglas de oro (resumen final)

1. **Las dependencias apuntan hacia adentro.** El interior no conoce la infraestructura.
2. **Quién inicia la llamada decide el nombre**: exterior → núcleo = **inbound**;
   núcleo → exterior = **outbound**.
3. **El contrato lo escribe quien tiene la necesidad** (el núcleo), no quien lo implementa.
4. **En runtime se ejecuta el adaptador**, porque Spring inyectó esa implementación donde se
   pidió la interfaz.
5. **El dominio dicta el QUÉ (puertos); la infraestructura provee el CÓMO (adaptadores).**

**Frase para la exposición:**
> "El controlador depende de un contrato, no de una implementación. Por eso puedo cambiar SQL
> Server, el generador de PDFs o el servicio de correo sin tocar las reglas de negocio: solo
> cambio el adaptador."

---

## 14. Autoevaluación (tapa las respuestas)

**P1.** ¿Qué tipo de puerto es `RegistrarInspeccionUseCase`? ¿Quién lo implementa y quién lo llama?

<details><summary>Ver respuesta</summary>

Puerto **de entrada (inbound)**. Lo implementa `InspeccionService` y lo llama
`InspeccionController` cuando llega un `POST /api/v1/inspecciones`.
</details>

**P2.** Cuando `ReservaService` ejecuta `reservas.guardar(...)` (donde `reservas` es
`ReservaRepositoryPort`), ¿qué código se ejecuta realmente?

<details><summary>Ver respuesta</summary>

El de `ReservaPersistenceAdapter`: Spring inyectó esa implementación donde se pidió el contrato
(polimorfismo). La interfaz solo declara la firma.
</details>

**P3.** ¿Qué diferencia hay entre `ReservaRepositoryPort` y `ReservaJpaRepository`?

<details><summary>Ver respuesta</summary>

`ReservaRepositoryPort` es el **puerto de salida** del núcleo (contrato estable, vive en
`application/ports/outbound`). `ReservaJpaRepository` es la **interfaz de Spring Data** que el
adaptador usa internamente; Spring la implementa en runtime y es un detalle técnico.
</details>

**P4.** ¿Por qué el controller declara `private final ReservaUseCase reservas;` y no
`private final ReservaService reservas;`?

<details><summary>Ver respuesta</summary>

Porque debe depender del **contrato**, no de la implementación: así puedes sustituir la
implementación o testear con un mock sin tocar el controller.
</details>

**P5.** ¿Quién define el contrato de `FacturaRepositoryPort` y dónde vive?

<details><summary>Ver respuesta</summary>

Lo define **la aplicación (el núcleo)**, porque es quien tiene la necesidad; vive en
`application/ports/outbound/`. Nunca en `infrastructure`, porque entonces el núcleo dependería
de la capa externa (inversión de dependencias rota).
</details>

**P6.** ¿Qué pasa si le quitas `@Component` a `ReservaPersistenceAdapter`?

<details><summary>Ver respuesta</summary>

Spring no lo registra como bean → al arrancar falla la inyección
(`UnsatisfiedDependencyException`): no encuentra quién implemente `ReservaRepositoryPort`.
</details>

**P7.** `NotificacionEmailAdapter` implementa `NotificacionPort` (puerto outbound) y lo llama
`ReservaService`. ¿Inbound u outbound y por qué?

<details><summary>Ver respuesta</summary>

**Outbound**: el núcleo (`ReservaService`) inicia la llamada hacia el exterior para enviar el
correo. Outbound = todo lo que el núcleo pide afuera.
</details>

**P8.** ¿Cuáles de estos imports NUNCA deben aparecer en `domain/`?
`jakarta.persistence.Entity`, `org.springframework.stereotype.Service`, `java.time.LocalDate`,
`java.math.BigDecimal`, cualquier clase de `infrastructure...`.

<details><summary>Ver respuesta</summary>

Prohibidos: `jakarta.persistence.*`, `org.springframework.*` y cualquier clase de
`infrastructure...`. Permitidos: `java.time.LocalDate` y `java.math.BigDecimal` (Java puro).
</details>

**P9.** Si mañana se cambia SQL Server por PostgreSQL, ¿qué se toca y qué no?

<details><summary>Ver respuesta</summary>

Se cambian/crean los **adaptadores de persistencia** y la configuración del datasource. No se
tocan: dominio, puertos, casos de uso ni controllers.
</details>

**P10.** ¿Para qué existen los métodos `aEntidad` y `aDominio` en los adaptadores?

<details><summary>Ver respuesta</summary>

Para traducir entre el **modelo de dominio** (record puro, sin anotaciones) y la **entidad JPA**
(con `@Entity`/`@Column`), manteniendo el dominio libre de dependencias tecnológicas.
</details>

**P11.** ¿Puede un controller llamar directamente a `ReservaJpaRepository`? Justifica.

<details><summary>Ver respuesta</summary>

No. Violaría las capas: el camino es controller → puerto de entrada (use case) →
service → puerto de salida → adaptador → JPA. El controller ni siquiera debe conocer que existe
JPA.
</details>

**P12.** ¿Qué significa exactamente "las dependencias apuntan hacia adentro"?

<details><summary>Ver respuesta</summary>

Que `infrastructure` puede importar de `application` y `domain`, pero el núcleo
(`domain` + `application`) nunca importa `infrastructure`. El núcleo no conoce la tecnología;
la tecnología se adapta al núcleo.
</details>
