
document.addEventListener("DOMContentLoaded", () => {
    const enlaces = document.querySelectorAll(".nav-link");
    const contenido = document.getElementById("main-content");
    const sidebar = document.getElementById("sidebar");
    const botonMenu = document.getElementById("menu-toggle");

    // Conservamos el diseño completo del panel principal.
    const panelPrincipal = contenido.innerHTML;

    const modulos = {
        dashboard: {
            titulo: "Panel principal",
            descripcion: "Disponibilidad de vehículos y operaciones de alquiler."
        },
        vehiculos: {
            titulo: "Vehículos",
            descripcion: "Consulta y administración de la flota."
        },
        reservas: {
            titulo: "Reservas",
            descripcion: "Seguimiento de las reservas de vehículos."
        },
        contratos: {
            titulo: "Contratos",
            descripcion: "Gestión de contratos de alquiler."
        },
        inspecciones: {
            titulo: "Inspecciones",
            descripcion: "Registro del estado de los vehículos."
        },
        facturacion: {
            titulo: "Facturación",
            descripcion: "Consulta y administración de facturas."
        },
        clientes: {
            titulo: "Clientes y licencias",
            descripcion: "Administración de clientes y sus licencias."
        },
        sucursales: {
            titulo: "Sucursales",
            descripcion: "Gestión de los puntos de operación."
        },
        empleados: {
            titulo: "Empleados",
            descripcion: "Administración del personal."
        }
    };

    function mostrarModulo(nombre) {
        if (nombre === "dashboard") {
           contenido.innerHTML = panelPrincipal;

           if (window.lucide) {
             window.lucide.createIcons();
           }

           cargarDashboard();

           return;
        }        
        if (nombre === "sucursales") {
           mostrarSucursales();
           return;
        }
        if (nombre === "vehiculos") {
            mostrarVehiculos();
            return;
        }
        if (nombre === "clientes") {
            mostrarClientes();
            return;
        }
        if (nombre === "reservas") {
            mostrarReservas();
            return;
        }

        const modulo = modulos[nombre];

        if (!modulo) return;

        contenido.replaceChildren();

        const encabezado = document.createElement("section");
        encabezado.className = "page-header";

        const encabezadoTexto = document.createElement("div");

        const titulo = document.createElement("h1");
        titulo.textContent = modulo.titulo;

        const descripcion = document.createElement("p");
        descripcion.className = "page-description";
        descripcion.textContent = modulo.descripcion;

        encabezadoTexto.append(titulo, descripcion);
        encabezado.appendChild(encabezadoTexto);

        const panel = document.createElement("section");
        panel.className = "content-panel";

        const mensaje = document.createElement("p");
        mensaje.textContent =
            "Este módulo está pendiente de desarrollo y conexión con la API.";

        panel.appendChild(mensaje);
        contenido.append(encabezado, panel);
    }

    async function cargarDashboard() {
        const estadoConexion = document.getElementById("api-status");

        try {
            const [sucursales, vehiculos, reservas, facturas] = await Promise.all([
                window.sucursalesAPI.obtenerTodas(),
                window.vehiculosAPI.obtenerTodos(),
                window.reservasAPI.obtenerTodas(),
                window.facturasAPI.obtenerTodas()
            ]);

            const disponibles = vehiculos.filter(
                vehiculo => String(vehiculo.estado || "").toUpperCase() === "DISPONIBLE"
            ).length;

            const fijar = (id, valor) => {
                const elemento = document.getElementById(id);
                if (elemento) elemento.textContent = valor;
            };

            fijar("total-disponibles", disponibles);
            fijar("total-vehiculos", vehiculos.length);
            fijar("total-reservas", reservas.length);
            fijar("total-sucursales", sucursales.length);
            fijar("total-facturas", facturas.length);

            if (estadoConexion) {
                estadoConexion.textContent = "Datos conectados";
                estadoConexion.classList.add("is-connected");
            }

            const notaFlota = document.getElementById("dashboard-fleet-note");

            if (notaFlota) {
                notaFlota.textContent = vehiculos.length
                    ? `${disponibles} de ${vehiculos.length} disponibles`
                    : "Sin vehículos registrados";
            }

            renderizarFlotaDashboard(vehiculos, sucursales);
            renderizarReservasDashboard(reservas);

        } catch (error) {
            console.error("Error al cargar el dashboard:", error);

            if (estadoConexion) {
                estadoConexion.textContent = "Sin conexión con la API";
                estadoConexion.classList.remove("is-connected");
            }
        }
    }

    function renderizarFlotaDashboard(vehiculos, sucursales) {
        const cuerpo = document.getElementById("fleet-table-body");
        if (!cuerpo) return;

        const nombresSucursales = new Map(
            sucursales.map(sucursal => [sucursal.id, sucursal.nombre])
        );

        cuerpo.replaceChildren();

        if (!vehiculos.length) {
            const fila = cuerpo.insertRow();
            const celda = fila.insertCell();
            celda.colSpan = 4;
            celda.className = "empty-table";
            celda.textContent = "No hay vehículos registrados.";
            return;
        }

        vehiculos.slice(0, 6).forEach(vehiculo => {
            const fila = cuerpo.insertRow();

            const celdaVehiculo = fila.insertCell();
            celdaVehiculo.textContent = [vehiculo.marca, vehiculo.modelo, vehiculo.anio]
                .filter(Boolean)
                .join(" ") || "—";

            const celdaPlaca = fila.insertCell();
            celdaPlaca.textContent = vehiculo.placa || "—";

            const celdaSucursal = fila.insertCell();
            celdaSucursal.textContent = nombresSucursales.get(vehiculo.sucursalId)
                ?? `Sucursal #${vehiculo.sucursalId}`;

            const celdaEstado = fila.insertCell();
            celdaEstado.appendChild(crearBadgeEstadoVehiculo(vehiculo.estado));
        });
    }

    function renderizarReservasDashboard(reservas) {
        const contenedor = document.getElementById("dashboard-reservas");
        if (!contenedor) return;

        if (!reservas.length) {
            contenedor.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon" aria-hidden="true">▤</div>
                    <h3>Sin reservas registradas</h3>
                    <p>Registra una nueva reserva para comenzar.</p>
                    <a href="#reservas" class="btn btn-outline">Ir a reservas</a>
                </div>
            `;
            return;
        }

        const confirmadas = reservas.filter(reserva => reserva.estado === "CONFIRMADA").length;
        const convertidas = reservas.filter(reserva => reserva.estado === "CONVERTIDA").length;

        contenedor.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon" aria-hidden="true">▤</div>
                <h3>${reservas.length} reservas registradas</h3>
                <p>${confirmadas} confirmadas · ${convertidas} convertidas.</p>
                <a href="#reservas" class="btn btn-outline">Ver reservas</a>
            </div>
        `;
    }

    async function mostrarReservas() {
        contenido.innerHTML = `
        <section class="page-header">
            <div>
                <h1>Gestión de reservas</h1>
                <p class="page-description">
                    Administración y seguimiento de reservas
                    de vehículos.
                </p>
            </div>
        </section>

        <section class="reservas-stats">
            <div class="reserva-stat-card">
                <div class="reserva-stat-icon">
                    <i data-lucide="calendar-days"></i>
                </div>
                <div>
                    <span>Total de reservas</span>
                    <strong id="reservas-total">—</strong>
                </div>
            </div>

            <div class="reserva-stat-card">
                <div class="reserva-stat-icon">
                    <i data-lucide="check-circle"></i>
                </div>
                <div>
                    <span>Confirmadas</span>
                    <strong id="reservas-confirmadas">—</strong>
                </div>
            </div>

            <div class="reserva-stat-card">
                <div class="reserva-stat-icon">
                    <i data-lucide="repeat"></i>
                </div>
                <div>
                    <span>Convertidas</span>
                    <strong id="reservas-convertidas">—</strong>
                </div>
            </div>
        </section>

        <div class="reservas-section-heading">
            <h3>Reservas registradas</h3>
            <p>Consulta las operaciones de alquiler.</p>
        </div>

        <section class="content-panel branches-panel reservas-list-panel">
            <div class="branches-toolbar reservas-list-toolbar">
                <div class="reservas-search-input">
                    <i data-lucide="search"></i>
                    <input
                        type="search"
                        id="buscar-reservas"
                        placeholder="Buscar por cliente, documento, reserva o vehículo..."
                        autocomplete="off"
                        aria-label="Buscar reservas"
                    >
                </div>

                <button
                    type="button"
                    class="btn-primary"
                    id="btn-nueva-reserva"
                >
                    <i data-lucide="calendar-plus"></i>
                    Nueva reserva
                </button>
            </div>

            <div class="branches-table-container">
                <table class="branches-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Vehículo</th>
                            <th>Fecha de inicio</th>
                            <th>Fecha de finalización</th>
                            <th>Estado</th>
                            <th>Total estimado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody id="reservas-table-body">
                        <tr>
                            <td colspan="8">
                                <div class="reservas-empty">
                                    <i data-lucide="calendar-search"></i>
                                    <h3>Listado pendiente de conexión</h3>
                                    <p>
                                        Próximamente podrás consultar
                                        las reservas registradas.
                                    </p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    `;

        if (window.lucide) {
            window.lucide.createIcons();
        }

        document
            .getElementById("btn-nueva-reserva")
            .addEventListener("click", abrirModalNuevaReserva);

        await cargarListadoReservas();
    }

    async function cargarListadoReservas() {
        const tbody = document.getElementById("reservas-table-body");

        if (!tbody) return;

        try {
            const [reservas, clientes, vehiculos] = await Promise.all([
                window.reservasAPI.obtenerTodas(),
                window.clientesAPI.obtenerTodos(),
                window.vehiculosAPI.obtenerTodos()
            ]);

            if (!tbody.isConnected) return;

            const clientesPorId = new Map(
                clientes.map(cliente => [Number(cliente.id), cliente])
            );

            const vehiculosPorId = new Map(
                vehiculos.map(vehiculo => [Number(vehiculo.id), vehiculo])
            );

            const buscador = document.getElementById("buscar-reservas");

            const normalizarBusqueda = valor => String(valor ?? "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .trim();

            const obtenerTextoBusqueda = reserva => {
                const cliente = clientesPorId.get(Number(reserva.clienteId));
                const vehiculo = vehiculosPorId.get(Number(reserva.vehiculoId));

                const codigo = `RES-${String(reserva.id).padStart(6, "0")}`;

                return normalizarBusqueda([
                    reserva.id,
                    codigo,
                    cliente?.nombre,
                    cliente?.apellido,
                    cliente?.documento,
                    vehiculo?.marca,
                    vehiculo?.modelo,
                    vehiculo?.anio,
                    vehiculo?.placa
                ].join(" "));
            };

            const escaparHTML = valor => String(valor ?? "").replace(
                /[&<>"']/g,
                caracter => ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;"
                })[caracter]
            );

            const total = reservas.length;
            const confirmadas = reservas.filter(
                reserva => reserva.estado === "CONFIRMADA"
            ).length;

            const convertidas = reservas.filter(
                reserva => reserva.estado === "CONVERTIDA"
            ).length;

            document.getElementById("reservas-total").textContent = total;
            document.getElementById("reservas-confirmadas").textContent = confirmadas;
            document.getElementById("reservas-convertidas").textContent = convertidas;

            if (total === 0) {
                tbody.innerHTML = `
                <tr>
                    <td colspan="8">
                        <div class="reservas-empty">
                            <h3>No hay reservas registradas</h3>
                            <p>Registra una nueva reserva para comenzar.</p>
                        </div>
                    </td>
                </tr>
            `;
                return;
            }

            const formatoMoneda = new Intl.NumberFormat("es-DO", {
                style: "currency",
                currency: "DOP"
            });

            const formatoFecha = fecha => {
                if (!fecha) return "—";

                const [anio, mes, dia] = fecha.split("-");
                return `${dia}/${mes}/${anio}`;
            };

            const renderizarReservas = reservasFiltradas => {
                tbody.innerHTML = reservasFiltradas.map(reserva => {
                const cliente = clientesPorId.get(Number(reserva.clienteId));
                const vehiculo = vehiculosPorId.get(Number(reserva.vehiculoId));

                const nombreCliente = cliente
                    ? [cliente.nombre, cliente.apellido]
                        .filter(Boolean)
                        .join(" ")
                    : `Cliente ${reserva.clienteId}`;

                const nombreVehiculo = vehiculo
                    ? [vehiculo.marca, vehiculo.modelo, vehiculo.anio]
                        .filter(Boolean)
                        .join(" ")
                    : `Vehículo ${reserva.vehiculoId}`;

                const placa = vehiculo?.placa ?? "";

                const codigo = `RES-${String(reserva.id).padStart(6, "0")}`;

                return `
                <tr>
                    <td>
                        <span class="reserva-codigo">
                            ${escaparHTML(codigo)}
                        </span>
                    </td>

                    <td>${escaparHTML(nombreCliente)}</td>

                    <td>
                        <div class="reserva-vehiculo-info">
                            <strong>${escaparHTML(nombreVehiculo)}</strong>
                            <small>${escaparHTML(placa)}</small>
                        </div>
                    </td>

                    <td>${formatoFecha(reserva.inicio)}</td>
                    <td>${formatoFecha(reserva.fin)}</td>
                    <td>${escaparHTML(reserva.estado)}</td>
                    <td>${formatoMoneda.format(reserva.total)}</td>
                    <td>
                    <button
                        type="button"
                        class="btn-ver-reserva"
                        data-reserva-id="${Number(reserva.id)}"
                    >
                        <i data-lucide="eye"></i>
                        Ver detalles
                    </button>
                    </td>
                </tr>
            `;
            }).join("");

                if (reservasFiltradas.length === 0) {
                    tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding:30px;">
                        No se encontraron reservas que coincidan con la búsqueda.
                    </td>
                </tr>
                `;
                }
            };

            renderizarReservas(reservas);

            tbody.addEventListener("click", async evento => {
                const boton = evento.target.closest(".btn-ver-reserva");

                if (!boton) return;

                const reservaId = Number(boton.dataset.reservaId);

                if (!Number.isInteger(reservaId) || reservaId <= 0) return;

                await abrirDetalleReserva(reservaId);
            });

            buscador?.addEventListener("input", () => {
                const texto = normalizarBusqueda(buscador.value);

                const resultados = reservas.filter(reserva =>
                    obtenerTextoBusqueda(reserva).includes(texto)
                );

                renderizarReservas(resultados);
            });

        } catch (error) {
            console.error("Error al cargar reservas:", error);

            if (tbody.isConnected) {
                tbody.innerHTML = `
                <tr>
                    <td colspan="8">
                        <div class="reservas-empty">
                            <h3>No se pudieron cargar las reservas</h3>
                            <p>Verifica la conexión con el servidor.</p>
                        </div>
                    </td>
                </tr>
            `;
            }
        }
    }

    async function abrirDetalleReserva(reservaId) {
        if (document.getElementById("modal-detalle-reserva")) return;

        const modal = document.createElement("div");
        modal.id = "modal-detalle-reserva";
        modal.className = "client-modal-overlay";

        const escaparHTML = valor => String(valor ?? "").replace(
            /[&<>"']/g,
            caracter => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            })[caracter]
        );

        const formatoFecha = fecha => {
            if (!fecha) return "—";
            const [anio, mes, dia] = fecha.split("-");
            return `${dia}/${mes}/${anio}`;
        };

        const formatoMoneda = new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP"
        });

        const cerrar = () => {
            document.removeEventListener("keydown", cerrarConEscape);
            modal.remove();
        };

        const cerrarConEscape = evento => {
            if (evento.key === "Escape") cerrar();
        };

        modal.innerHTML = `
        <div class="client-modal reserva-modal"
             role="dialog"
             aria-modal="true"
             aria-labelledby="titulo-detalle-reserva">

            <div class="client-modal-header">
                <div>
                    <h2 id="titulo-detalle-reserva">Detalle de reserva</h2>
                    <p>Información de la operación de alquiler.</p>
                </div>

                <button type="button"
                        class="client-modal-close"
                        id="cerrar-detalle-reserva"
                        aria-label="Cerrar">
                    &times;
                </button>
            </div>

            <div class="client-modal-body" id="detalle-reserva-contenido">
                <p>Cargando información de la reserva...</p>
            </div>

            <div class="client-modal-footer">
                <button type="button"
                        class="btn-primary"
                        id="aceptar-detalle-reserva">
                    Cerrar
                </button>
            </div>
        </div>
    `;

        document.body.appendChild(modal);

        document.addEventListener("keydown", cerrarConEscape);

        modal.querySelector("#cerrar-detalle-reserva")
            .addEventListener("click", cerrar);

        modal.querySelector("#aceptar-detalle-reserva")
            .addEventListener("click", cerrar);

        modal.addEventListener("click", evento => {
            if (evento.target === modal) cerrar();
        });

        const contenido = modal.querySelector("#detalle-reserva-contenido");

        try {
            const [reserva, clientes, vehiculos] = await Promise.all([
                window.reservasAPI.obtenerPorId(reservaId),
                window.clientesAPI.obtenerTodos(),
                window.vehiculosAPI.obtenerTodos()
            ]);

            if (!modal.isConnected) return;

            const cliente = clientes.find(
                item => Number(item.id) === Number(reserva.clienteId)
            );

            const vehiculo = vehiculos.find(
                item => Number(item.id) === Number(reserva.vehiculoId)
            );

            const nombreCliente = cliente
                ? [cliente.nombre, cliente.apellido].filter(Boolean).join(" ")
                : `Cliente ${reserva.clienteId}`;

            const nombreVehiculo = vehiculo
                ? [vehiculo.marca, vehiculo.modelo, vehiculo.anio]
                    .filter(Boolean).join(" ")
                : `Vehículo ${reserva.vehiculoId}`;

            const codigo = `RES-${String(reserva.id).padStart(6, "0")}`;

            const dias = reserva.inicio && reserva.fin
                ? Math.round(
                    (
                        Date.parse(`${reserva.fin}T12:00:00Z`) -
                        Date.parse(`${reserva.inicio}T12:00:00Z`)
                    ) / 86400000
                ) + 1
                : null;

            contenido.innerHTML = `
            <div class="reserva-detalle-cabecera">
                <strong>${escaparHTML(codigo)}</strong>
                <span>${escaparHTML(reserva.estado)}</span>
            </div>

            <div class="reserva-detalle-grid">
                <div>
                    <small>Cliente</small>
                    <strong>${escaparHTML(nombreCliente)}</strong>
                </div>

                <div>
                    <small>Documento</small>
                    <strong>${escaparHTML(cliente?.documento ?? "No disponible")}</strong>
                </div>

                <div>
                    <small>Vehículo</small>
                    <strong>${escaparHTML(nombreVehiculo)}</strong>
                </div>

                <div>
                    <small>Placa</small>
                    <strong>${escaparHTML(vehiculo?.placa ?? "No disponible")}</strong>
                </div>

                <div>
                    <small>Fecha de inicio</small>
                    <strong>${formatoFecha(reserva.inicio)}</strong>
                </div>

                <div>
                    <small>Fecha de finalización</small>
                    <strong>${formatoFecha(reserva.fin)}</strong>
                </div>

                <div>
                    <small>Duración del alquiler</small>
                    <strong>${dias ?? "—"} día(s)</strong>
                </div>
            </div>

            <div class="reserva-detalle-total">
                <span>Total estimado</span>
                <strong>${formatoMoneda.format(reserva.total)}</strong>
            </div>
        `;

        } catch (error) {
            console.error("Error al consultar reserva:", error);

            if (modal.isConnected) {
                contenido.innerHTML = `
                <p class="reserva-detalle-error">
                    No se pudo consultar la información de esta reserva.
                </p>
            `;
            }
        }
    }

    async function abrirModalNuevaReserva() {
        if (document.getElementById("modal-nueva-reserva")) return;

        const modal = document.createElement("div");
        modal.id = "modal-nueva-reserva";
        modal.className = "client-modal-overlay";

        modal.innerHTML = `
        <div class="client-modal reserva-modal"
             role="dialog"
             aria-modal="true"
             aria-labelledby="titulo-nueva-reserva">

            <div class="client-modal-header">
                <div>
                    <h2 id="titulo-nueva-reserva">Nueva reserva</h2>
                    <p>Completa los datos del alquiler.</p>
                </div>

                <button type="button"
                        class="client-modal-close"
                        id="cerrar-nueva-reserva">
                    ×
                </button>
            </div>

            <form id="formulario-nueva-reserva">
                <div class="client-modal-body">
                    <div class="client-form-grid">

                        <div class="client-form-field">
                            <label for="reserva-sucursal">Sucursal *</label>
                            <select id="reserva-sucursal" required>
                                <option value="">Cargando sucursales...</option>
                            </select>
                        </div>

                        <div class="client-form-field">
                            <label for="reserva-documento">Documento del cliente *</label>
                            <input id="reserva-documento"
                                   type="text"
                                   required>
                        </div>

                        <div class="client-form-field client-form-full">
                            <button type="button"
                                    class="btn-search"
                                    id="buscar-cliente-reserva">
                                Buscar cliente
                            </button>
                            <p id="reserva-cliente-info"></p>
                        </div>

                        <div class="client-form-field">
                            <label for="reserva-licencia">Licencia *</label>
                            <select id="reserva-licencia" required disabled>
                                <option value="">Busca un cliente primero</option>
                            </select>
                        </div>

                        <div class="client-form-field">
                            <label for="reserva-vehiculo">Vehículo *</label>
                            <select id="reserva-vehiculo" required disabled>
                                <option value="">Selecciona una sucursal</option>
                            </select>
                        </div>

                        <div class="client-form-field">
                            <label for="reserva-inicio">Fecha de inicio *</label>
                            <input id="reserva-inicio"
                                   type="date"
                                   required>
                        </div>

                        <div class="client-form-field">
                            <label for="reserva-fin">Fecha de finalización *</label>
                            <input id="reserva-fin"
                                   type="date"
                                   required>
                        </div>

                    </div>

                    <p id="reserva-mensaje"
                       class="client-form-message"
                       role="status"></p>
                </div>

                <div class="client-modal-footer">
                    <button type="button"
                            class="btn-search"
                            id="cancelar-nueva-reserva">
                        Cancelar
                    </button>

                    <button type="submit"
                            class="btn-primary"
                            id="guardar-nueva-reserva">
                        Confirmar reserva
                    </button>
                </div>
            </form>
        </div>
    `;

        document.body.appendChild(modal);

        const sucursalSelect = modal.querySelector("#reserva-sucursal");
        const vehiculoSelect = modal.querySelector("#reserva-vehiculo");
        const licenciaSelect = modal.querySelector("#reserva-licencia");
        const mensaje = modal.querySelector("#reserva-mensaje");
        const clienteInfo = modal.querySelector("#reserva-cliente-info");
        const botonGuardar = modal.querySelector("#guardar-nueva-reserva");

        let clienteSeleccionado = null;

        function cerrar() {
            document.removeEventListener("keydown", cerrarConEscape);
            modal.remove();
        }

        function cerrarConEscape(evento) {
            if (evento.key === "Escape") cerrar();
        }

        document.addEventListener("keydown", cerrarConEscape);

        modal.querySelector("#cerrar-nueva-reserva")
            .addEventListener("click", cerrar);

        modal.querySelector("#cancelar-nueva-reserva")
            .addEventListener("click", cerrar);

        modal.addEventListener("click", evento => {
            if (evento.target === modal) cerrar();
        });

        function llenarSelect(select, elementos, obtenerTexto) {
            select.replaceChildren();

            const opcionInicial = new Option("Seleccionar...", "");
            select.add(opcionInicial);

            elementos.forEach(elemento => {
                select.add(new Option(obtenerTexto(elemento), String(elemento.id)));
            });

            select.disabled = elementos.length === 0;
        }

        try {
            const sucursales = await window.sucursalesAPI.obtenerActivas();

            if (!modal.isConnected) return;

            llenarSelect(
                sucursalSelect,
                sucursales,
                sucursal => sucursal.nombre
            );
        } catch (error) {
            mensaje.textContent = "No se pudieron cargar las sucursales.";
        }

        sucursalSelect.addEventListener("change", async () => {
            vehiculoSelect.disabled = true;
            vehiculoSelect.replaceChildren();
            vehiculoSelect.add(new Option("Cargando vehículos...", ""));

            if (!sucursalSelect.value) return;

            const sucursalId = sucursalSelect.value;

            try {
                const vehiculos =
                    await window.vehiculosAPI.obtenerDisponibles(sucursalId);

                if (!modal.isConnected || sucursalSelect.value !== sucursalId) return;

                llenarSelect(
                    vehiculoSelect,
                    vehiculos,
                    vehiculo => `${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anio} — ${vehiculo.placa}`
                );
            } catch (error) {
                mensaje.textContent = "No se pudieron cargar los vehículos.";
            }
        });

        modal.querySelector("#buscar-cliente-reserva")
            .addEventListener("click", async () => {

                const documento =
                    modal.querySelector("#reserva-documento").value.trim();

                clienteSeleccionado = null;
                clienteInfo.textContent = "";
                licenciaSelect.disabled = true;
                licenciaSelect.replaceChildren();

                if (!documento) {
                    mensaje.textContent = "Introduce el documento del cliente.";
                    return;
                }

                mensaje.textContent = "Buscando cliente...";

                try {
                    const cliente =
                        await window.clientesAPI.buscarPorDocumento(documento);

                    if (!modal.isConnected) return;

                    const licencias =
                        await window.clientesAPI.obtenerLicencias(cliente.id);

                    if (!modal.isConnected) return;

                    clienteSeleccionado = cliente;

                    clienteInfo.textContent =
                        `${cliente.nombre} ${cliente.apellido || ""}`;

                    llenarSelect(
                        licenciaSelect,
                        licencias.filter(licencia => licencia.activa),
                        licencia => `${licencia.numero} - ${licencia.categoria || ""}`
                    );

                    mensaje.textContent = "";
                } catch (error) {
                    mensaje.textContent =
                        "No se pudo encontrar el cliente o consultar sus licencias.";
                }
            });

        modal.querySelector("#formulario-nueva-reserva")
            .addEventListener("submit", async evento => {

                evento.preventDefault();

                const datos = {
                    clienteId: clienteSeleccionado?.id,
                    vehiculoId: Number(vehiculoSelect.value),
                    licenciaId: Number(licenciaSelect.value),
                    fechaInicio: modal.querySelector("#reserva-inicio").value,
                    fechaFin: modal.querySelector("#reserva-fin").value
                };

                if (!datos.clienteId || !datos.vehiculoId ||
                    !datos.licenciaId || !datos.fechaInicio || !datos.fechaFin) {
                    mensaje.textContent = "Completa todos los campos obligatorios.";
                    return;
                }

                if (datos.fechaFin < datos.fechaInicio) {
                    mensaje.textContent =
                        "La fecha final no puede ser anterior a la inicial.";
                    return;
                }

                botonGuardar.disabled = true;
                mensaje.textContent = "Registrando reserva...";

                try {
                    const reserva = await window.reservasAPI.crear(datos);

                    cerrar();

                    alert(`Reserva #${reserva.id} registrada correctamente.`);

                    if (location.hash === "#reservas") {
                        await mostrarReservas();
                    }
                } catch (error) {
                    mensaje.textContent =
                        error.message || "No se pudo registrar la reserva.";
                } finally {
                    botonGuardar.disabled = false;
                }
            });
    }

    function crearIndicadoresModulo(indicadores) {
        return `
        <section class="reservas-stats">
            ${indicadores.map(indicador => `
                <div class="reserva-stat-card">
                    <div class="reserva-stat-icon">
                        <i data-lucide="${indicador.icono}"></i>
                    </div>
                    <div>
                        <span>${indicador.titulo}</span>
                        <strong id="${indicador.id}">—</strong>
                    </div>
                </div>
            `).join("")}
        </section>
    `;
    }

    function actualizarIndicadoresModulo(valores) {
        Object.entries(valores).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);

            if (elemento) {
                elemento.textContent = valor;
            }
        });
    }

    async function mostrarClientes() {
    contenido.innerHTML = `
        <section class="page-header">
            <div>
                <h1>Gestión de clientes</h1>
                <p class="page-description">
                    Administración de clientes y licencias de conducir.
                </p>
            </div>
        </section>

        ${crearIndicadoresModulo([
            { id: "clientes-total", titulo: "Total de clientes", icono: "users" },
            { id: "clientes-activos", titulo: "Clientes activos", icono: "user-check" },
            { id: "clientes-inactivos", titulo: "Inactivos", icono: "user-x" }
        ])}

        <section class="content-panel branches-panel">
            <div class="branches-toolbar">
                <div class="branches-search rentcar-search">
                    <i data-lucide="search"></i>

                    <input
                        type="search"
                        id="buscar-cliente"
                        placeholder="Buscar por nombre o documento..."
                        aria-label="Buscar cliente"
                        autocomplete="off"
                    >

                    <button
                        type="button"
                        id="btn-buscar-cliente"
                        class="btn-search"
                    >
                        <i data-lucide="search"></i>
                        Buscar
                    </button>
                </div>

                <button
                    type="button"
                    id="nuevo-cliente"
                    class="btn-primary"
                >
                    <i data-lucide="user-plus"></i>
                    Nuevo cliente
                </button>
            </div>

            <div class="branches-table-container">
                <table class="branches-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Documento</th>
                            <th>Teléfono</th>
                            <th>Correo</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody id="clientes-table-body">
                        <tr>
                            <td colspan="7">
                                Cargando clientes...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    `;

    const cuerpoTabla = document.getElementById("clientes-table-body");
    const buscador = document.getElementById("buscar-cliente");
    const botonBuscar = document.getElementById("btn-buscar-cliente");
    const botonNuevo = document.getElementById("nuevo-cliente");

    if (window.lucide) {
        window.lucide.createIcons();
    }

    botonNuevo.addEventListener("click", abrirModalCliente);

    try {
        const clientes = await window.clientesAPI.obtenerTodos();

        if (!cuerpoTabla.isConnected) return;

        const activos = clientes.filter(cliente => cliente.activo === true).length;

        actualizarIndicadoresModulo({
            "clientes-total": clientes.length,
            "clientes-activos": activos,
            "clientes-inactivos": clientes.length - activos
        });

        function filtrarClientes() {
            const texto = buscador.value.trim().toLowerCase();

            const filtrados = clientes.filter(cliente => {
                const nombreCompleto =
                    `${cliente.nombre || ""} ${cliente.apellido || ""}`
                    .toLowerCase();

                return (
                    nombreCompleto.includes(texto) ||
                    String(cliente.documento || "")
                        .toLowerCase()
                        .includes(texto)
                );
            });

            renderizarClientes(filtrados, cuerpoTabla);
        }

        botonBuscar.addEventListener("click", filtrarClientes);
        buscador.addEventListener("input", filtrarClientes);

        buscador.addEventListener("keydown", evento => {
            if (evento.key === "Enter") {
                filtrarClientes();
            }
        });

        renderizarClientes(clientes, cuerpoTabla);

    } catch (error) {
        console.error("Error al cargar clientes:", error);

        if (cuerpoTabla.isConnected) {
            cuerpoTabla.replaceChildren();

            const fila = document.createElement("tr");
            const celda = document.createElement("td");

            celda.colSpan = 7;
            celda.textContent =
                "No se pudieron cargar los clientes. Verifica la conexión con el servidor.";

            fila.appendChild(celda);
            cuerpoTabla.appendChild(fila);
        }
    }
    }

    function abrirModalCliente() {
    if (document.getElementById("modal-cliente")) return;

    const modal = document.createElement("div");
    modal.id = "modal-cliente";
    modal.className = "client-modal-overlay";

    modal.innerHTML = `
        <div class="client-modal" role="dialog"
             aria-modal="true" aria-labelledby="client-modal-title">

            <div class="client-modal-header">
                <div>
                    <h2 id="client-modal-title">Registrar cliente</h2>
                    <p>Introduce los datos del nuevo cliente.</p>
                </div>

                <button type="button" class="client-modal-close"
                        id="cerrar-modal-cliente"
                        aria-label="Cerrar formulario">
                    <i data-lucide="x"></i>
                </button>
            </div>

            <form id="formulario-cliente">
                <div class="client-modal-body">
                    <div class="client-form-grid">
                        <div class="client-form-field">
                            <label for="cliente-documento">
                                Cédula o pasaporte *
                            </label>
                            <input id="cliente-documento" name="documento"
                                   type="text" maxlength="50" required>
                        </div>

                        <div class="client-form-field">
                            <label for="cliente-nombre">Nombre *</label>
                            <input id="cliente-nombre" name="nombre"
                                   type="text" required>
                        </div>

                        <div class="client-form-field">
                            <label for="cliente-apellido">Apellido</label>
                            <input id="cliente-apellido" name="apellido"
                                   type="text">
                        </div>

                        <div class="client-form-field">
                            <label for="cliente-telefono">Teléfono</label>
                            <input id="cliente-telefono" name="telefono"
                                   type="tel">
                        </div>

                        <div class="client-form-field client-form-full">
                            <label for="cliente-email">Correo electrónico</label>
                            <input id="cliente-email" name="email"
                                   type="email">
                        </div>
                    </div>

                    <p id="cliente-form-mensaje"
                       class="client-form-message"
                       role="status" aria-live="polite"></p>
                </div>

                <div class="client-modal-footer">
                    <button type="button" class="btn-search"
                            id="cancelar-cliente">Cancelar</button>
                    <button type="submit" class="btn-primary"
                            id="guardar-cliente">
                        <i data-lucide="save"></i>
                        Guardar cliente
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    if (window.lucide) {
        window.lucide.createIcons();
    }

    const formulario = modal.querySelector("#formulario-cliente");
    const mensaje = modal.querySelector("#cliente-form-mensaje");
    const botonGuardar = modal.querySelector("#guardar-cliente");

    const cerrar = () => {
        document.removeEventListener("keydown", cerrarConEscape);
        modal.remove();
    };

    const cerrarConEscape = evento => {
        if (evento.key === "Escape") cerrar();
    };

    document.addEventListener("keydown", cerrarConEscape);

    modal.querySelector("#cerrar-modal-cliente")
        .addEventListener("click", cerrar);

    modal.querySelector("#cancelar-cliente")
        .addEventListener("click", cerrar);

    modal.addEventListener("click", evento => {
        if (evento.target === modal) cerrar();
    });

    modal.querySelector("#cliente-documento").focus();

    formulario.addEventListener("submit", async evento => {
        evento.preventDefault();

        const datos = new FormData(formulario);

        const cliente = {
            documento: String(datos.get("documento") || "").trim(),
            nombre: String(datos.get("nombre") || "").trim(),
            apellido: String(datos.get("apellido") || "").trim(),
            telefono: String(datos.get("telefono") || "").trim(),
            email: String(datos.get("email") || "").trim()
        };

        if (!cliente.documento || !cliente.nombre) {
            mensaje.textContent = "Completa los campos obligatorios.";
            return;
        }

        botonGuardar.disabled = true;
        mensaje.textContent = "Guardando cliente...";

        try {
            await window.clientesAPI.registrar(cliente);

            cerrar();

            if (window.location.hash === "#clientes") {
                await mostrarClientes();
            }

        } catch (error) {
            console.error("Error al registrar cliente:", error);

            mensaje.textContent =
                "No se pudo registrar el cliente. Verifica que el documento no esté registrado y que los datos sean válidos.";

        } finally {
            botonGuardar.disabled = false;
        }
    });
    }

    async function abrirModalLicencias(cliente) {
    if (document.getElementById("modal-licencias")) return;

    const modal = document.createElement("div");
    modal.id = "modal-licencias";
    modal.className = "client-modal-overlay";

    modal.innerHTML = `
        <div class="client-modal licenses-modal"
             role="dialog"
             aria-modal="true"
             aria-labelledby="titulo-modal-licencias">

            <div class="client-modal-header">
                <div>
                    <h2 id="titulo-modal-licencias">
                        Licencias de conducir
                    </h2>
                    <p id="licencias-cliente-info"></p>
                </div>

                <button type="button"
                        class="client-modal-close"
                        id="cerrar-modal-licencias"
                        aria-label="Cerrar">
                    <i data-lucide="x"></i>
                </button>
            </div>

            <div class="client-modal-body">
                <div class="licenses-table-container">
                    <table class="branches-table">
                        <thead>
                            <tr>
                                <th>Número</th>
                                <th>Categoría</th>
                                <th>Vencimiento</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="licencias-table-body">
                            <tr>
                                <td colspan="5">Cargando licencias...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p id="licencias-mensaje"
                   class="client-form-message"
                   role="status"></p>
            </div>

            <div class="client-modal-footer">
                <button type="button"
                        class="btn-search"
                        id="cancelar-modal-licencias">
                    Cerrar
                </button>

                <button type="button"
                        class="btn-primary"
                        id="nueva-licencia">
                    <i data-lucide="plus"></i>
                    Nueva licencia
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector("#licencias-cliente-info").textContent =
        `${cliente.nombre} ${cliente.apellido || ""} · ${cliente.documento}`;

    if (window.lucide) {
        window.lucide.createIcons();
    }

    const cuerpoTabla = modal.querySelector("#licencias-table-body");
    const mensaje = modal.querySelector("#licencias-mensaje");

    function cerrar() {
        document.removeEventListener("keydown", cerrarConEscape);
        modal.remove();
    }

    function cerrarConEscape(evento) {
        if (evento.key === "Escape") cerrar();
    }

    document.addEventListener("keydown", cerrarConEscape);

    modal.querySelector("#cerrar-modal-licencias")
        .addEventListener("click", cerrar);

    modal.querySelector("#cancelar-modal-licencias")
        .addEventListener("click", cerrar);

    modal.addEventListener("click", evento => {
        if (evento.target === modal) cerrar();
    });

    modal.querySelector("#nueva-licencia")
        .addEventListener("click", () => {
            cerrar();
            abrirModalNuevaLicencia(cliente);
        });

    try {
        const licencias =
            await window.clientesAPI.obtenerLicencias(cliente.id);

        if (!cuerpoTabla.isConnected) return;

        cuerpoTabla.replaceChildren();

        if (!licencias.length) {
            const fila = document.createElement("tr");
            const celda = document.createElement("td");
            celda.colSpan = 5;
            celda.textContent =
                "Este cliente todavía no tiene licencias registradas.";
            fila.appendChild(celda);
            cuerpoTabla.appendChild(fila);
            return;
        }

        licencias.forEach(licencia => {
            const fila = document.createElement("tr");

            const fecha = String(licencia.fechaExpiracion || "");
            const hoy = new Date();
            const fechaHoy = [
                hoy.getFullYear(),
                String(hoy.getMonth() + 1).padStart(2, "0"),
                String(hoy.getDate()).padStart(2, "0")
            ].join("-");

            let estadoLicencia;

            if (!licencia.activa) {
                estadoLicencia = "Inactiva";
            } else if (!fecha || fecha < fechaHoy) {
                estadoLicencia = "Vencida";
            } else {
                estadoLicencia = "Vigente";
            }

            const valores = [
                licencia.numero,
                licencia.categoria || "—",
                fecha || "—",
                estadoLicencia
            ];

            valores.forEach((valor, indice) => {
                const celda = document.createElement("td");

                if (indice === 3) {
                    const etiqueta = document.createElement("span");

                    etiqueta.className = "license-status " +
                        (estadoLicencia === "Vigente"
                            ? "license-status-valid"
                            : estadoLicencia === "Vencida"
                                ? "license-status-expired"
                                : "license-status-inactive");

                    etiqueta.textContent = valor;
                    celda.appendChild(etiqueta);
                } else {
                    celda.textContent = valor;
                }

                fila.appendChild(celda);
            });

            const celdaAcciones = document.createElement("td");

            const botonEditar = document.createElement("button");
            botonEditar.type = "button";
            botonEditar.className = "btn-search";
            botonEditar.textContent = "Editar";

            botonEditar.addEventListener("click", () => {
                cerrar();
                abrirModalEditarLicencia(cliente, licencia);
            });

            celdaAcciones.appendChild(botonEditar);
            fila.appendChild(celdaAcciones);

            cuerpoTabla.appendChild(fila);
        });

    } catch (error) {
        console.error("Error al consultar licencias:", error);
        mensaje.textContent =
            "No se pudieron consultar las licencias del cliente.";
        cuerpoTabla.replaceChildren();
    }
    }

    function abrirModalEditarLicencia(cliente, licencia) {
    if (document.getElementById("modal-editar-licencia")) return;

    const modal = document.createElement("div");
    modal.id = "modal-editar-licencia";
    modal.className = "client-modal-overlay";

    modal.innerHTML = `
        <div class="client-modal"
             role="dialog"
             aria-modal="true"
             aria-labelledby="titulo-editar-licencia">

            <div class="client-modal-header">
                <div>
                    <h2 id="titulo-editar-licencia">Editar licencia</h2>
                    <p id="editar-licencia-cliente"></p>
                </div>

                <button type="button"
                        class="client-modal-close"
                        id="cerrar-editar-licencia"
                        aria-label="Cerrar">
                    <i data-lucide="x"></i>
                </button>
            </div>

            <form id="formulario-editar-licencia">
                <div class="client-modal-body">
                    <div class="client-form-grid">

                        <div class="client-form-field">
                            <label for="editar-licencia-numero">
                                Número de licencia *
                            </label>
                            <input id="editar-licencia-numero"
                                   type="text"
                                   maxlength="30"
                                   required>
                        </div>

                        <div class="client-form-field">
                            <label for="editar-licencia-categoria">
                                Categoría
                            </label>
                            <input id="editar-licencia-categoria"
                                   type="text"
                                   maxlength="10">
                        </div>

                        <div class="client-form-field client-form-full">
                            <label for="editar-licencia-vencimiento">
                                Fecha de vencimiento *
                            </label>
                            <input id="editar-licencia-vencimiento"
                                   type="date"
                                   required>
                        </div>
                    </div>

                    <p id="editar-licencia-mensaje"
                       class="client-form-message"
                       role="status"></p>
                </div>

                <div class="client-modal-footer">
                    <button type="button"
                            class="btn-search"
                            id="cancelar-editar-licencia">
                        Cancelar
                    </button>

                    <button type="submit"
                            class="btn-primary"
                            id="guardar-editar-licencia">
                        Guardar cambios
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector("#editar-licencia-cliente").textContent =
        `${cliente.nombre} ${cliente.apellido || ""}`;

    modal.querySelector("#editar-licencia-numero").value =
        licencia.numero || "";

    modal.querySelector("#editar-licencia-categoria").value =
        licencia.categoria || "";

    modal.querySelector("#editar-licencia-vencimiento").value =
        String(licencia.fechaExpiracion || "").slice(0, 10);

    if (window.lucide) {
        window.lucide.createIcons();
    }

    const formulario = modal.querySelector("#formulario-editar-licencia");
    const mensaje = modal.querySelector("#editar-licencia-mensaje");
    const botonGuardar = modal.querySelector("#guardar-editar-licencia");

    function cerrar() {
        document.removeEventListener("keydown", cerrarConEscape);
        modal.remove();
    }

    function cerrarConEscape(evento) {
        if (evento.key === "Escape") cerrar();
    }

    document.addEventListener("keydown", cerrarConEscape);

    modal.querySelector("#cerrar-editar-licencia")
        .addEventListener("click", cerrar);

    modal.querySelector("#cancelar-editar-licencia")
        .addEventListener("click", cerrar);

    modal.addEventListener("click", evento => {
        if (evento.target === modal) cerrar();
    });

    formulario.addEventListener("submit", async evento => {
        evento.preventDefault();

        const datos = {
            numero: modal.querySelector("#editar-licencia-numero").value.trim(),
            categoria: modal.querySelector("#editar-licencia-categoria").value.trim(),
            fechaExpiracion: modal.querySelector("#editar-licencia-vencimiento").value
        };

        if (!datos.numero || !datos.fechaExpiracion) {
            mensaje.textContent = "Completa los campos obligatorios.";
            return;
        }

        botonGuardar.disabled = true;
        mensaje.textContent = "Guardando cambios...";

        try {
            await window.clientesAPI.actualizarLicencia(licencia.id, datos);

            cerrar();
            await abrirModalLicencias(cliente);

        } catch (error) {
            mensaje.textContent =
                error.message || "No se pudo actualizar la licencia.";
        } finally {
            botonGuardar.disabled = false;
        }
    });
    }

    function abrirModalNuevaLicencia(cliente) {
    if (document.getElementById("modal-nueva-licencia")) return;

    const modal = document.createElement("div");
    modal.id = "modal-nueva-licencia";
    modal.className = "client-modal-overlay";

    modal.innerHTML = `
        <div class="client-modal"
             role="dialog"
             aria-modal="true"
             aria-labelledby="titulo-nueva-licencia">

            <div class="client-modal-header">
                <div>
                    <h2 id="titulo-nueva-licencia">
                        Registrar licencia
                    </h2>
                    <p id="nueva-licencia-cliente"></p>
                </div>

                <button type="button"
                        class="client-modal-close"
                        id="cerrar-nueva-licencia"
                        aria-label="Cerrar">
                    <i data-lucide="x"></i>
                </button>
            </div>

            <form id="formulario-nueva-licencia">
                <div class="client-modal-body">
                    <div class="client-form-grid">

                        <div class="client-form-field">
                            <label for="licencia-numero">
                                Número de licencia *
                            </label>
                            <input id="licencia-numero"
                                   name="numero"
                                   type="text"
                                   maxlength="30"
                                   required>
                        </div>

                        <div class="client-form-field">
                            <label for="licencia-categoria">
                                Categoría
                            </label>
                            <input id="licencia-categoria"
                                   name="categoria"
                                   type="text"
                                   maxlength="10"
                            >
                        </div>

                        <div class="client-form-field client-form-full">
                            <label for="licencia-vencimiento">
                                Fecha de vencimiento *
                            </label>
                            <input id="licencia-vencimiento"
                                   name="fechaExpiracion"
                                   type="date"
                                   required>
                        </div>

                    </div>

                    <p id="nueva-licencia-mensaje"
                       class="client-form-message"
                       role="status"></p>
                </div>

                <div class="client-modal-footer">
                    <button type="button"
                            class="btn-search"
                            id="cancelar-nueva-licencia">
                        Cancelar
                    </button>

                    <button type="submit"
                            class="btn-primary"
                            id="guardar-nueva-licencia">
                        <i data-lucide="save"></i>
                        Guardar licencia
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector("#nueva-licencia-cliente").textContent =
        `${cliente.nombre} ${cliente.apellido || ""} · ${cliente.documento}`;

    if (window.lucide) {
        window.lucide.createIcons();
    }

    const formulario =
        modal.querySelector("#formulario-nueva-licencia");

    const mensaje =
        modal.querySelector("#nueva-licencia-mensaje");

    const botonGuardar =
        modal.querySelector("#guardar-nueva-licencia");

    function cerrar() {
        document.removeEventListener("keydown", cerrarConEscape);
        modal.remove();
    }

    function cerrarConEscape(evento) {
        if (evento.key === "Escape") cerrar();
    }

    document.addEventListener("keydown", cerrarConEscape);

    modal.querySelector("#cerrar-nueva-licencia")
        .addEventListener("click", cerrar);

    modal.querySelector("#cancelar-nueva-licencia")
        .addEventListener("click", cerrar);

    modal.addEventListener("click", evento => {
        if (evento.target === modal) cerrar();
    });

    formulario.addEventListener("submit", async evento => {
        evento.preventDefault();

        const datos = new FormData(formulario);

        const licencia = {
            clienteId: cliente.id,
            numero: String(datos.get("numero") || "").trim(),
            categoria: String(datos.get("categoria") || "").trim(),
            fechaExpiracion: String(
                datos.get("fechaExpiracion") || ""
            )
        };

        if (!licencia.numero || !licencia.fechaExpiracion) {
            mensaje.textContent =
                "Completa los campos obligatorios.";
            return;
        }

        botonGuardar.disabled = true;
        mensaje.textContent = "Guardando licencia...";

        try {
            await window.clientesAPI.registrarLicencia(licencia);

            cerrar();
            await abrirModalLicencias(cliente);

        } catch (error) {
            console.error("Error al registrar licencia:", error);
            mensaje.textContent =
                "No se pudo registrar la licencia. Verifica los datos y la fecha de vencimiento.";

        } finally {
            botonGuardar.disabled = false;
        }
    });
    }

    function renderizarClientes(clientes, cuerpoTabla) {
        cuerpoTabla.replaceChildren();

    if (!clientes.length) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");

        celda.colSpan = 7;
        celda.textContent = "No se encontraron clientes registrados.";

        fila.appendChild(celda);
        cuerpoTabla.appendChild(fila);
        return;
    }

    clientes.forEach(cliente => {
        const fila = document.createElement("tr");

        const valores = [
            cliente.id,
            `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim(),
            cliente.documento || "—",
            cliente.telefono || "—",
            cliente.email || "—"
        ];

        valores.forEach(valor => {
            const celda = document.createElement("td");
            celda.textContent = valor ?? "—";
            fila.appendChild(celda);
        });

        const celdaEstado = document.createElement("td");
        const estado = document.createElement("span");

        estado.className = cliente.activo
            ? "branch-status active"
            : "branch-status";

        estado.textContent = cliente.activo ? "ACTIVO" : "INACTIVO";

        celdaEstado.appendChild(estado);
        fila.appendChild(celdaEstado);

        const celdaAcciones = document.createElement("td");
        const botonLicencias = document.createElement("button");

        botonLicencias.type = "button";
        botonLicencias.className = "btn-search";
        botonLicencias.textContent = "Ver licencias";

        botonLicencias.addEventListener("click", () => {
            abrirModalLicencias(cliente);
        });

        celdaAcciones.appendChild(botonLicencias);
        fila.appendChild(celdaAcciones);

        cuerpoTabla.appendChild(fila);
    });
    }

    async function mostrarSucursales() {
    contenido.innerHTML = `
        <section class="page-header">
            <div>
                <h1>Gestión de sucursales</h1>
                <p class="page-description">
                    Administración de los puntos de operación.
                </p>
            </div>
        </section>

        ${crearIndicadoresModulo([
            { id: "sucursales-total", titulo: "Total de sucursales", icono: "building-2" },
            { id: "sucursales-activas", titulo: "Sucursales activas", icono: "circle-check" },
            { id: "sucursales-inactivas", titulo: "Inactivas", icono: "building" }
        ])}

        <section class="content-panel branches-panel">
        <div class="branches-toolbar">

            <div class="branches-search rentcar-search">
                <i data-lucide="search"></i>

                <input
                    type="search"
                    id="buscar-sucursal"
                    placeholder="Buscar sucursal..."
                    aria-label="Buscar sucursal"
                    autocomplete="off"
                >

                <button
                    type="button"
                    id="btn-buscar-sucursal"
                    class="btn-search"
                >
                    <i data-lucide="search"></i>
                    Buscar
                </button>
            </div>

          <button
           type="button"
           id="nueva-sucursal"
           class="btn-primary"
          >
          <i data-lucide="building-2"></i>
          Nueva sucursal
          </button>
        </div>

            <div class="branches-table-container">
                <table class="branches-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Dirección</th>
                            <th>Teléfono</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody id="branches-table-body">
                        <tr>
                            <td colspan="5">Cargando sucursales...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    `;

    const cuerpoTabla = document.getElementById("branches-table-body");
    const buscador = document.getElementById("buscar-sucursal");

    const botonNuevaSucursal = document.getElementById("nueva-sucursal");
    botonNuevaSucursal.addEventListener("click", abrirModalSucursal);

    const botonBuscar = document.getElementById("btn-buscar-sucursal");

    if (window.lucide) {
        window.lucide.createIcons();
    }

    try {
        const sucursales = await window.sucursalesAPI.obtenerTodas();

        if (!cuerpoTabla.isConnected) return;

        const activas = sucursales.filter(sucursal => sucursal.activo === true).length;

        actualizarIndicadoresModulo({
            "sucursales-total": sucursales.length,
            "sucursales-activas": activas,
            "sucursales-inactivas": sucursales.length - activas
        });

        renderizarSucursales(sucursales, cuerpoTabla);

    function buscarSucursales() {
       const texto = buscador.value.trim().toLowerCase();
       const filtradas = sucursales.filter(sucursal =>
        (sucursal.nombre || "").toLowerCase().includes(texto) ||
        (sucursal.direccion || "").toLowerCase().includes(texto)
    );

    renderizarSucursales(filtradas, cuerpoTabla);
    }

    botonBuscar.addEventListener("click", buscarSucursales);

    buscador.addEventListener("keydown", evento => {
      if (evento.key === "Enter") {
          buscarSucursales();
      }
    });

    buscador.addEventListener("input", () => {
      if (buscador.value.trim() === "") {
        renderizarSucursales(sucursales, cuerpoTabla);
    }
    });

    } catch (error) {
        console.error("Error al cargar sucursales:", error);

        if (cuerpoTabla.isConnected) {
            cuerpoTabla.innerHTML = `
                <tr>
                    <td colspan="5">
                        No se pudieron cargar las sucursales.
                        Verifica la conexión con el servidor.
                    </td>
                </tr>
            `;
        }
    }
    }

    function abrirModalSucursal() {
        if (document.getElementById("modal-sucursal")) return;

        const modal = document.createElement("div");
        modal.id = "modal-sucursal";
        modal.className = "modal-overlay";

        modal.innerHTML = `
        <div class="modal-container" role="dialog"
             aria-modal="true"
             aria-labelledby="modal-sucursal-titulo">

            <div class="modal-header">
                <div>
                    <h2 id="modal-sucursal-titulo">Nueva sucursal</h2>
                    <p>Registra un nuevo punto de operación.</p>
                </div>

                <button type="button"
                        class="modal-close"
                        id="cerrar-modal-sucursal"
                        aria-label="Cerrar formulario">
                    &times;
                </button>
            </div>

            <form id="form-nueva-sucursal">

                <div class="modal-body">

                    <div class="form-group">
                        <label for="sucursal-nombre">
                            Nombre de la sucursal
                        </label>

                        <input
                            type="text"
                            id="sucursal-nombre"
                            name="nombre"
                            maxlength="100"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="sucursal-direccion">
                            Dirección
                        </label>

                        <input
                            type="text"
                            id="sucursal-direccion"
                            name="direccion"
                            maxlength="200"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="sucursal-telefono">
                            Teléfono
                        </label>

                        <input
                            type="tel"
                            id="sucursal-telefono"
                            name="telefono"
                            maxlength="20"
                            required
                        >
                    </div>

                    <p id="mensaje-sucursal"
                       class="form-message"
                       role="alert"></p>

                </div>

                <div class="modal-footer">
                    <button type="button"
                            class="btn-secondary"
                            id="cancelar-sucursal">
                        Cancelar
                    </button>

                    <button type="submit"
                            class="btn-primary"
                            id="guardar-sucursal">
                        Guardar sucursal
                    </button>
                </div>

            </form>
        </div>
    `;

        document.body.appendChild(modal);

        const formulario = document.getElementById("form-nueva-sucursal");
        const botonGuardar = document.getElementById("guardar-sucursal");
        const mensaje = document.getElementById("mensaje-sucursal");

        const cerrar = () => {
            document.removeEventListener("keydown", cerrarConEscape);
            modal.remove();
        };

        const cerrarConEscape = evento => {
            if (evento.key === "Escape") cerrar();
        };

        document.addEventListener("keydown", cerrarConEscape);

        document.getElementById("cerrar-modal-sucursal")
            .addEventListener("click", cerrar);

        document.getElementById("cancelar-sucursal")
            .addEventListener("click", cerrar);

        modal.addEventListener("click", evento => {
            if (evento.target === modal) cerrar();
        });

        formulario.addEventListener("submit", async evento => {
            evento.preventDefault();

            const sucursal = {
                nombre: formulario.elements.nombre.value.trim(),
                direccion: formulario.elements.direccion.value.trim(),
                telefono: formulario.elements.telefono.value.trim()
            };

            if (!sucursal.nombre || !sucursal.direccion || !sucursal.telefono) {
                mensaje.textContent = "Completa todos los campos.";
                return;
            }

            botonGuardar.disabled = true;
            botonGuardar.textContent = "Guardando...";
            mensaje.textContent = "";

            try {
                await window.sucursalesAPI.crear(sucursal);

                cerrar();

                if (location.hash === "#sucursales") {
                    await mostrarSucursales();
                }

            } catch (error) {
                console.error("Error al registrar sucursal:", error);

                mensaje.textContent =
                    "No se pudo registrar la sucursal. Verifica los datos e inténtalo nuevamente.";

            } finally {
                if (botonGuardar.isConnected) {
                    botonGuardar.disabled = false;
                    botonGuardar.textContent = "Guardar sucursal";
                }
            }
        });

        document.getElementById("sucursal-nombre").focus();
    }

    function renderizarSucursales(sucursales, cuerpoTabla) {
        cuerpoTabla.replaceChildren();

        if (!Array.isArray(sucursales) || sucursales.length === 0) {
            const fila = document.createElement("tr");
            const celda = document.createElement("td");

            celda.colSpan = 5;
            celda.textContent = "No se encontraron sucursales.";

            fila.appendChild(celda);
            cuerpoTabla.appendChild(fila);
            return;
        }

        sucursales.forEach(sucursal => {
            const fila = document.createElement("tr");

            const datos = [
                sucursal.id,
                sucursal.nombre,
                sucursal.direccion,
                sucursal.telefono
            ];

            datos.forEach(dato => {
                const celda = document.createElement("td");
                celda.textContent = dato ?? "—";
                fila.appendChild(celda);
            });

            const celdaEstado = document.createElement("td");
            const estado = document.createElement("span");

            estado.className = sucursal.activo
                ? "branch-status active"
                : "branch-status inactive";

            estado.textContent = sucursal.activo
                ? "Activa"
                : "Inactiva";

            celdaEstado.appendChild(estado);
            fila.appendChild(celdaEstado);

            cuerpoTabla.appendChild(fila);
        });
    }

    function cerrarMenu() {
        sidebar.classList.remove("is-open");
        botonMenu.setAttribute("aria-expanded", "false");
        botonMenu.setAttribute("aria-label", "Abrir menú");
    }

    function navegar() {
        const solicitado = location.hash.substring(1) || "dashboard";
        const nombre = modulos[solicitado] ? solicitado : "dashboard";

        enlaces.forEach(enlace => {
            const activo = enlace.getAttribute("href") === `#${nombre}`;

            enlace.classList.toggle("active", activo);

            if (activo) {
                enlace.setAttribute("aria-current", "page");
            } else {
                enlace.removeAttribute("aria-current");
            }
        });

        mostrarModulo(nombre);
        cerrarMenu();
    }

    botonMenu.addEventListener("click", () => {
        const abierto = sidebar.classList.toggle("is-open");

        botonMenu.setAttribute("aria-expanded", String(abierto));
        botonMenu.setAttribute(
            "aria-label",
            abierto ? "Cerrar menú" : "Abrir menú"
        );
    });

    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape") cerrarMenu();
    });

    document.addEventListener("click", evento => {
        if (
            sidebar.classList.contains("is-open") &&
            !sidebar.contains(evento.target) &&
            !botonMenu.contains(evento.target)
        ) {
            cerrarMenu();
        }
    });

    window.addEventListener("hashchange", navegar);
    navegar();

    if (window.lucide) {
       window.lucide.createIcons();
    }

    async function mostrarVehiculos() {

        contenido.innerHTML = `
        <section class="page-header">
            <div>
                <h1>Gestión de vehículos</h1>
                <p class="page-description">
                    Consulta y administración de toda la flota de vehículos.
                </p>
            </div>
        </section>

        ${crearIndicadoresModulo([
            { id: "vehiculos-total", titulo: "Total de vehículos", icono: "car-front" },
            { id: "vehiculos-disponibles", titulo: "Disponibles", icono: "circle-check" },
            { id: "vehiculos-no-disponibles", titulo: "No disponibles", icono: "clock" }
        ])}

        <section class="content-panel branches-panel">

            <div class="branches-toolbar">

            <div class="branches-search rentcar-search">
                <i data-lucide="search"></i>

                <input
                    type="search"
                    id="buscar-vehiculo"
                    placeholder="Buscar por placa, marca o modelo..."
                    aria-label="Buscar vehículo"
                    autocomplete="off"
                >

                <button
                    type="button"
                    id="btn-buscar-vehiculo"
                    class="btn-search"
                >
                    <i data-lucide="search"></i>
                    Buscar
                </button>
            </div>

                <div class="vehicle-filter">
                        <select id="filtro-sucursal" aria-label="Filtrar por sucursal">
                          <option value="">Todas las sucursales</option>
                        </select>
                </div>

                <button
                    type="button"
                    id="nuevo-vehiculo"
                    class="btn-primary">
                    <i data-lucide="car-front"></i>
                    Nuevo vehículo
                </button>

            </div>

            <div class="branches-table-container">

                <table class="branches-table">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Placa</th>
                            <th>Marca</th>
                            <th>Modelo</th>
                            <th>Año</th>
                            <th>Sucursal</th>
                            <th>Kilometraje</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody id="vehiculos-table-body">
                        <tr>
                            <td colspan="9">
                                Cargando vehículos...
                            </td>
                        </tr>
                    </tbody>

                </table>

            </div>

        </section>
    `;

        const cuerpoTabla = document.getElementById("vehiculos-table-body");
        const buscador = document.getElementById("buscar-vehiculo");
        const botonBuscar = document.getElementById("btn-buscar-vehiculo");
        const filtroSucursal = document.getElementById("filtro-sucursal");
        const botonNuevoVehiculo = document.getElementById("nuevo-vehiculo");

        botonNuevoVehiculo.addEventListener("click", abrirModalVehiculo);

        if (window.lucide) {
            window.lucide.createIcons();
        }

        try {
            const [vehiculos, sucursales] = await Promise.all([
                window.vehiculosAPI.obtenerTodos(),
                window.sucursalesAPI.obtenerTodas()
            ]);

            if (!cuerpoTabla.isConnected) return;

            const disponibles = vehiculos.filter(
                vehiculo => String(vehiculo.estado || "").toUpperCase() === "DISPONIBLE"
            ).length;

            actualizarIndicadoresModulo({
                "vehiculos-total": vehiculos.length,
                "vehiculos-disponibles": disponibles,
                "vehiculos-no-disponibles": vehiculos.length - disponibles
            });

            sucursales.forEach(sucursal => {
                const opcion = document.createElement("option");
                opcion.value = sucursal.id;
                opcion.textContent = sucursal.nombre;
                filtroSucursal.appendChild(opcion);
            });

            const nombresSucursales = new Map(
                sucursales.map(sucursal => [
                    sucursal.id,
                    sucursal.nombre
                ])
            );


            if (!cuerpoTabla.isConnected) return;

            let vehiculosActuales = vehiculos;
            let solicitudFiltro = 0;

            function filtrarVehiculos() {
                const texto = buscador.value.trim().toLowerCase();

                const resultados = vehiculosActuales.filter(vehiculo => {
                    const campos = [
                        vehiculo.placa,
                        vehiculo.marca,
                        vehiculo.modelo
                    ];

                    return campos.some(valor =>
                        String(valor ?? "").toLowerCase().includes(texto)
                    );
                });

                renderizarVehiculos(
                    resultados,
                    cuerpoTabla,
                    nombresSucursales
                );
            }

            botonBuscar.addEventListener("click", filtrarVehiculos);

            buscador.addEventListener("input", filtrarVehiculos);

            buscador.addEventListener("keydown", evento => {
                if (evento.key === "Enter") {
                    evento.preventDefault();
                    filtrarVehiculos();
                }
            });

            filtroSucursal.addEventListener("change", async () => {
                const sucursalId = filtroSucursal.value || null;
                const solicitudActual = ++solicitudFiltro;

                filtroSucursal.disabled = true;

                try {
                    const resultado =
                        await window.vehiculosAPI.obtenerTodos(sucursalId);

                    if (!cuerpoTabla.isConnected ||
                        solicitudActual !== solicitudFiltro) {
                        return;
                    }

                    vehiculosActuales = resultado;
                    filtrarVehiculos();

                } catch (error) {
                    console.error("Error al filtrar vehículos:", error);
                    alert("No se pudieron consultar los vehículos.");
                } finally {
                    if (solicitudActual === solicitudFiltro &&
                        filtroSucursal.isConnected) {
                        filtroSucursal.disabled = false;
                    }
                }
            });

            filtrarVehiculos();
        } catch (error) {
            console.error("Error al consultar vehículos:", error);

            if (cuerpoTabla.isConnected) {
                cuerpoTabla.replaceChildren();

                const fila = cuerpoTabla.insertRow();
                const celda = fila.insertCell();
                celda.colSpan = 9;
                celda.textContent =
                    "No se pudieron cargar los vehículos. Verifica la conexión con el servidor.";
            }
        }
    }

    function claseEstadoVehiculo(estado) {
        switch (String(estado ?? "").toUpperCase()) {
            case "DISPONIBLE": return "active";
            case "ALQUILADO": return "info";
            case "EN_MANTENIMIENTO": return "warning";
            case "AVERIADO": return "danger";
            default: return "inactive";
        }
    }

    function etiquetaEstadoVehiculo(estado) {
        switch (String(estado ?? "").toUpperCase()) {
            case "DISPONIBLE": return "Disponible";
            case "ALQUILADO": return "Alquilado";
            case "EN_MANTENIMIENTO": return "En mantenimiento";
            case "AVERIADO": return "Averiado";
            default: return (estado ?? "DESCONOCIDO").replaceAll("_", " ");
        }
    }

    function crearBadgeEstadoVehiculo(estado) {
        const span = document.createElement("span");
        span.className = "branch-status " + claseEstadoVehiculo(estado);
        span.textContent = etiquetaEstadoVehiculo(estado);
        return span;
    }

    function renderizarVehiculos(vehiculos, cuerpoTabla, nombresSucursales) {

        cuerpoTabla.replaceChildren();

        if (!vehiculos.length) {
            const fila = cuerpoTabla.insertRow();
            const celda = fila.insertCell();

            celda.colSpan = 9;
            celda.textContent = "No se encontraron vehículos.";
            return;
        }

        vehiculos.forEach(vehiculo => {

            const fila = cuerpoTabla.insertRow();

            const valores = [
                vehiculo.id,
                vehiculo.placa,
                vehiculo.marca,
                vehiculo.modelo,
                vehiculo.anio,
                nombresSucursales.get(vehiculo.sucursalId)
                ?? `Sucursal #${vehiculo.sucursalId}`,
                vehiculo.kilometraje
            ];

            valores.forEach(valor => {
                const celda = fila.insertCell();
                celda.textContent = valor ?? "—";
            });

            const celdaEstado = fila.insertCell();
            celdaEstado.appendChild(crearBadgeEstadoVehiculo(vehiculo.estado));

            const celdaAcciones = fila.insertCell();
            const botonEstado = document.createElement("button");

            botonEstado.type = "button";
            botonEstado.className = "btn-search";
            botonEstado.textContent = "Cambiar estado";

            botonEstado.addEventListener("click", () => {
                abrirModalEstadoVehiculo(vehiculo);
            });

            celdaAcciones.appendChild(botonEstado);
        });
    }

    function abrirModalEstadoVehiculo(vehiculo) {

        if (document.getElementById("modal-estado-vehiculo")) {
            return;
        }

        const modal = document.createElement("div");

        modal.id = "modal-estado-vehiculo";
        modal.className = "modal-overlay";

        modal.innerHTML = `
        <div class="estado-modal-card" role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-modal-estado">

        <div class="estado-modal-header">
            <div>
                <h2 id="titulo-modal-estado">Cambiar estado</h2>
                <p>Actualiza la condición operativa del vehículo.</p>
            </div>

            <button type="button"
                    id="cerrar-modal-estado"
                    class="estado-modal-close"
                    aria-label="Cerrar">
                &times;
            </button>
        </div>

        <form id="form-estado-vehiculo">

            <div class="estado-modal-body">

                <div class="estado-vehiculo-info">
                    <span>VEHÍCULO SELECCIONADO</span>
                    <strong id="vehiculo-estado-descripcion"></strong>
                </div>

                <div class="estado-modal-field">
                    <label for="nuevo-estado-vehiculo">
                        Nuevo estado
                    </label>

                    <select id="nuevo-estado-vehiculo" required>
                        <option value="DISPONIBLE">Disponible</option>
                        <option value="ALQUILADO">Alquilado</option>
                        <option value="EN_MANTENIMIENTO">
                            En mantenimiento
                        </option>
                        <option value="AVERIADO">Averiado</option>
                    </select>
                </div>

            </div>

            <div class="estado-modal-footer">
                <button type="button"
                        id="cancelar-estado-vehiculo"
                        class="estado-btn-cancelar">
                    Cancelar
                </button>

                <button type="submit"
                        id="guardar-estado-vehiculo"
                        class="estado-btn-guardar">
                    Guardar cambios
                </button>
            </div>

          </form>
        </div>
`;

        document.body.appendChild(modal);

        document.getElementById("cerrar-modal-estado")
            .addEventListener("click", () => modal.remove());

        document.getElementById("vehiculo-estado-descripcion")
            .textContent = `${vehiculo.marca ?? ""} ${vehiculo.modelo ?? ""} - ${vehiculo.placa}`;

        const selector = document.getElementById("nuevo-estado-vehiculo");
        const formulario = document.getElementById("form-estado-vehiculo");
        const botonGuardar = document.getElementById("guardar-estado-vehiculo");

        selector.value = vehiculo.estado;

        document.getElementById("cancelar-estado-vehiculo")
            .addEventListener("click", () => modal.remove());

        formulario.addEventListener("submit", async evento => {
            evento.preventDefault();

            const nuevoEstado = selector.value;

            if (nuevoEstado === vehiculo.estado) {
                modal.remove();
                return;
            }

            botonGuardar.disabled = true;
            botonGuardar.textContent = "Guardando...";

            try {
                await window.vehiculosAPI.cambiarEstado(
                    vehiculo.id,
                    nuevoEstado
                );

                modal.remove();

                await mostrarVehiculos();

            } catch (error) {
                console.error("Error al cambiar estado:", error);
                alert("No se pudo actualizar el estado del vehículo.");
            } finally {
                if (botonGuardar.isConnected) {
                    botonGuardar.disabled = false;
                    botonGuardar.textContent = "Guardar cambios";
                }
            }
        });
    }

    async function abrirModalVehiculo() {
        if (document.getElementById("modal-vehiculo")) return;

        const modal = document.createElement("div");
        modal.id = "modal-vehiculo";
        modal.className = "modal-overlay";

        modal.innerHTML = `
        <div class="modal-container" role="dialog"
             aria-modal="true"
             aria-labelledby="titulo-modal-vehiculo">

            <div class="modal-header">
                <div>
                    <h2 id="titulo-modal-vehiculo">Nuevo vehículo</h2>
                    <p>Registrar una nueva unidad en la flota.</p>
                </div>

                <button type="button" class="modal-close"
                        id="cerrar-modal-vehiculo"
                        aria-label="Cerrar formulario">&times;</button>
            </div>

            <form id="form-nuevo-vehiculo">
                <div class="modal-body">

                    <div class="form-group">
                        <label for="vehiculo-placa">Placa *</label>
                        <input id="vehiculo-placa" name="placa"
                               type="text" required>
                    </div>

                    <div class="form-group">
                        <label for="vehiculo-marca">Marca</label>
                        <input id="vehiculo-marca" name="marca"
                               type="text">
                    </div>

                    <div class="form-group">
                        <label for="vehiculo-modelo">Modelo</label>
                        <input id="vehiculo-modelo" name="modelo"
                               type="text">
                    </div>

                    <div class="form-group">
                        <label for="vehiculo-anio">Año</label>
                        <input id="vehiculo-anio" name="anio"
                               type="number" min="1900" max="2100">
                    </div>

                    <div class="form-group">
                        <label for="vehiculo-tipo">Tipo de vehículo *</label>
                        <select id="vehiculo-tipo" name="tipoVehiculoId"
                                required disabled>
                            <option value="">Cargando tipos...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="vehiculo-sucursal">Sucursal *</label>
                        <select id="vehiculo-sucursal" name="sucursalId"
                                required disabled>
                            <option value="">Cargando sucursales...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="vehiculo-kilometraje">Kilometraje *</label>
                        <input id="vehiculo-kilometraje" name="kilometraje"
                               type="number" min="0" step="1"
                               required>
                    </div>

                    <p id="mensaje-vehiculo" class="form-message"
                       role="alert"></p>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn-secondary"
                            id="cancelar-vehiculo">Cancelar</button>

                    <button type="submit" class="btn-primary"
                            id="guardar-vehiculo" disabled>
                        Guardar vehículo
                    </button>
                </div>
            </form>
        </div>
    `;

        document.body.appendChild(modal);

        const formulario = modal.querySelector("#form-nuevo-vehiculo");
        const selectorTipo = modal.querySelector("#vehiculo-tipo");
        const selectorSucursal = modal.querySelector("#vehiculo-sucursal");
        const botonGuardar = modal.querySelector("#guardar-vehiculo");
        const mensaje = modal.querySelector("#mensaje-vehiculo");

        const cerrarConEscape = evento => {
            if (evento.key === "Escape") cerrar();
        };

        function cerrar() {
            document.removeEventListener("keydown", cerrarConEscape);
            modal.remove();
        }

        document.addEventListener("keydown", cerrarConEscape);

        modal.querySelector("#cerrar-modal-vehiculo")
            .addEventListener("click", cerrar);

        modal.querySelector("#cancelar-vehiculo")
            .addEventListener("click", cerrar);

        modal.addEventListener("click", evento => {
            if (evento.target === modal) cerrar();
        });

        modal.querySelector("#vehiculo-placa").focus();

        try {
            const [tipos, sucursales] = await Promise.all([
                window.tiposVehiculoAPI.obtenerTodos(),
                window.sucursalesAPI.obtenerActivas()
            ]);

            if (!modal.isConnected) return;

            function llenarSelector(selector, elementos, etiqueta) {
                selector.replaceChildren();

                const opcionInicial = document.createElement("option");
                opcionInicial.value = "";
                opcionInicial.textContent = `Seleccionar ${etiqueta}`;
                selector.appendChild(opcionInicial);

                elementos.forEach(elemento => {
                    const opcion = document.createElement("option");
                    opcion.value = elemento.id;
                    opcion.textContent = elemento.nombre;
                    selector.appendChild(opcion);
                });

                selector.disabled = elementos.length === 0;
            }

            llenarSelector(selectorTipo, tipos, "tipo de vehículo");
            llenarSelector(selectorSucursal, sucursales, "sucursal");

            if (!tipos.length || !sucursales.length) {
                mensaje.textContent =
                    "Debe existir al menos un tipo de vehículo y una sucursal activa.";
            } else {
                botonGuardar.disabled = false;
            }

        } catch (error) {
            console.error("Error al cargar catálogos:", error);

            if (modal.isConnected) {
                mensaje.textContent =
                    "No se pudieron cargar los tipos de vehículos o las sucursales.";
            }
        }

        formulario.addEventListener("submit", async evento => {
            evento.preventDefault();

            const datos = new FormData(formulario);

            const vehiculo = {
                placa: String(datos.get("placa")).trim(),
                marca: String(datos.get("marca")).trim(),
                modelo: String(datos.get("modelo")).trim(),
                anio: datos.get("anio") === ""
                    ? null
                    : Number(datos.get("anio")),
                tipoVehiculoId: Number(datos.get("tipoVehiculoId")),
                sucursalId: Number(datos.get("sucursalId")),
                kilometraje: Number(datos.get("kilometraje"))
            };

            if (!vehiculo.placa ||
                !vehiculo.tipoVehiculoId ||
                !vehiculo.sucursalId ||
                !Number.isInteger(vehiculo.kilometraje) ||
                vehiculo.kilometraje < 0) {
                mensaje.textContent = "Verifica los campos obligatorios.";
                return;
            }

            botonGuardar.disabled = true;
            botonGuardar.textContent = "Guardando...";
            mensaje.textContent = "";

            try {
                await window.vehiculosAPI.registrar(vehiculo);

                cerrar();

                if (location.hash === "#vehiculos") {
                    await mostrarVehiculos();
                }

            } catch (error) {
                console.error("Error al registrar vehículo:", error);

                if (modal.isConnected) {
                    mensaje.textContent =
                        "No se pudo registrar el vehículo. Verifica los datos o si la placa ya existe.";
                }

            } finally {
                if (botonGuardar.isConnected) {
                    botonGuardar.disabled = false;
                    botonGuardar.textContent = "Guardar vehículo";
                }
            }
        });
    }
});

