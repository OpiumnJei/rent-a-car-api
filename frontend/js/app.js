
document.addEventListener("DOMContentLoaded", () => {
    const enlaces = document.querySelectorAll(".nav-link");
    const contenido = document.getElementById("main-content");
    const sidebar = document.getElementById("sidebar");
    const botonMenu = document.getElementById("menu-toggle");

    const panelPrincipal = contenido.innerHTML;

    function formatearCodigo(prefijo, id) {
        if (id === null || id === undefined || id === "") {
            return "—";
        }

        return `${prefijo}-${String(id).padStart(6, "0")}`;
    }

    function mostrarModalExito(titulo, mensaje, codigo = "") {

        const modalAnterior = document.getElementById("modal-exito");

        if (modalAnterior) {
            modalAnterior.remove();
        }

        const modal = document.createElement("div");

        modal.id = "modal-exito";
        modal.className = "exito-modal-overlay";

        modal.innerHTML = `
        <div class="exito-modal"
             role="dialog"
             aria-modal="true"
             aria-labelledby="exito-titulo"
             aria-describedby="exito-mensaje">

            <button type="button"
                    class="exito-modal-close"
                    aria-label="Cerrar">
                <i data-lucide="x"></i>
            </button>

            <div class="exito-modal-icono">
                <i data-lucide="check-circle"></i>
            </div>

            <h2 id="exito-titulo"></h2>

            <p id="exito-mensaje"></p>

            <div class="exito-modal-registro">
                <span>Código de registro</span>
                <strong id="exito-codigo"></strong>
            </div>

            <button type="button"
                    class="exito-modal-aceptar">
                Aceptar
            </button>

        </div>
    `;

        modal.querySelector("#exito-titulo").textContent = titulo;
        modal.querySelector("#exito-mensaje").textContent = mensaje;
        modal.querySelector("#exito-codigo").textContent = codigo;

        if (!codigo) {
            modal.querySelector(".exito-modal-registro").hidden = true;
        }

        const focoAnterior = document.activeElement;

        function cerrar() {
            modal.remove();

            if (focoAnterior && focoAnterior.isConnected) {
                focoAnterior.focus();
            }
        }

        modal.querySelector(".exito-modal-close")
            .addEventListener("click", cerrar);

        modal.querySelector(".exito-modal-aceptar")
            .addEventListener("click", cerrar);

        modal.addEventListener("click", evento => {
            if (evento.target === modal) {
                cerrar();
            }
        });

        modal.addEventListener("keydown", evento => {

            if (evento.key === "Escape") {
                cerrar();
            }

            if (evento.key === "Tab") {
                const botones = modal.querySelectorAll("button");
                const primero = botones[0];
                const ultimo = botones[botones.length - 1];

                if (evento.shiftKey && document.activeElement === primero) {
                    evento.preventDefault();
                    ultimo.focus();
                } else if (!evento.shiftKey && document.activeElement === ultimo) {
                    evento.preventDefault();
                    primero.focus();
                }
            }
        });

        document.body.appendChild(modal);

        if (window.lucide) {
            window.lucide.createIcons();
        }

        modal.querySelector(".exito-modal-aceptar").focus();
    }

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
        "tipos-tarifas": {
            titulo: "Tipos de vehículo y tarifas",
            descripcion: "Catálogo de tipos de vehículo y sus tarifas."
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
        if (nombre === "contratos") {
            mostrarContratos();
            return;
        }
        if (nombre === "inspecciones") {
            mostrarInspecciones();
            return;
        }
        if (nombre === "facturacion") {
            mostrarFacturacion();
            return;
        }
        if (nombre === "empleados") {
            mostrarEmpleados();
            return;
        }
        if (nombre === "tipos-tarifas") {
            mostrarTiposTarifas();
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

    async function mostrarContratos() {
    contenido.innerHTML = `
        <section class="page-header">
            <div>
                <h1>Gestión de contratos</h1>
                <p class="page-description">
                    Administración y seguimiento de contratos
                    de alquiler de vehículos.
                </p>
            </div>
        </section>

        <section class="reservas-stats">
            <div class="reserva-stat-card">
                <div class="reserva-stat-icon">
                    <i data-lucide="file-text"></i>
                </div>
                <div>
                    <span>Contratos consultados</span>
                    <strong id="contratos-total">0</strong>
                </div>
            </div>

            <div class="reserva-stat-card">
                <div class="reserva-stat-icon">
                    <i data-lucide="check-circle"></i>
                </div>
                <div>
                    <span>Activos consultados</span>
                    <strong id="contratos-activos">0</strong>
                </div>
            </div>

            <div class="reserva-stat-card">
                <div class="reserva-stat-icon">
                    <i data-lucide="file-check"></i>
                </div>
                <div>
                    <span>Finalizados consultados</span>
                    <strong id="contratos-finalizados">0</strong>
                </div>
            </div>
        </section>

        <div class="reservas-section-heading">
            <h3>Consulta de contratos</h3>
            <p>
                Busca contratos por su identificador
                o genera uno desde una reserva confirmada.
            </p>
        </div>

        <section class="content-panel branches-panel reservas-list-panel">
            <div class="branches-toolbar reservas-list-toolbar">
                <div class="reservas-search-input">
                    <i data-lucide="search"></i>
                    <input
                        type="number"
                        id="buscar-contrato"
                        min="1"
                        step="1"
                        placeholder="Número de contrato..."
                        aria-label="Buscar contrato por ID"
                    >
                </div>

                <button
                    type="button"
                    class="btn-primary"
                    id="btn-nuevo-contrato"
                >
                    <i data-lucide="file-plus"></i>
                    Nuevo contrato
                </button>
            </div>

            <div class="branches-table-container">
                <table class="branches-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Reserva</th>
                            <th>Empleado</th>
                            <th>Garantía</th>
                            <th>Total estimado</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody id="contratos-table-body">
                        <tr>
                            <td colspan="8">
                                <div class="reservas-empty">
                                    <i data-lucide="file-search"></i>
                                    <h3>Consulta tus contratos</h3>
                                    <p>
                                        Introduce el número de un contrato
                                        para consultar su información.
                                    </p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    `;

    cargarTodosLosContratos();

    if (window.lucide) {
        window.lucide.createIcons();
    }

    document
        .getElementById("btn-nuevo-contrato")
        .addEventListener("click", abrirModalNuevoContrato);

    document
        .getElementById("buscar-contrato")
        .addEventListener("change", async (evento) => {
            const id = evento.target.value.trim();

            if (!id) return;

            await buscarContratoPorId(id);
        });
    }

    const contratosConsultados = new Map();

    async function buscarContratoPorId(id) {
        const tbody = document.getElementById("contratos-table-body");

        if (!tbody) return;

        const identificador = Number(id);

        if (!Number.isSafeInteger(identificador) || identificador < 1) {
            alert("Introduce un número de contrato válido.");
            return;
        }

        try {
            const contrato = await window.contratosAPI.obtenerPorId(identificador);

            contratosConsultados.set(Number(contrato.id), contrato);

            renderizarContratosConsultados();

        } catch (error) {
            alert(`No se pudo consultar el contrato: ${error.message}`);
        }
    }

    async function cargarTodosLosContratos() {
        const tbody = document.getElementById("contratos-table-body");
        if (!tbody) return;

        try {
            const contratos = await window.contratosAPI.obtenerTodas();

            if (!tbody.isConnected) return;

            contratos.forEach(contrato => {
                contratosConsultados.set(Number(contrato.id), contrato);
            });

            renderizarContratosConsultados();

        } catch (error) {
            console.error("Error al cargar contratos:", error);

            if (tbody.isConnected) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8">
                            No se pudieron cargar los contratos. Verifica la conexión con el servidor.
                        </td>
                    </tr>
                `;
            }
        }
    }

    async function renderizarContratosConsultados() {

        const tbody = document.getElementById("contratos-table-body");

        if (!tbody) return;

        const contratos = [...contratosConsultados.values()];

        const formatoMoneda = new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP"
        });

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

        document.getElementById("contratos-total").textContent =
            contratos.length;

        document.getElementById("contratos-activos").textContent =
            contratos.filter(c => c.estado === "ACTIVO").length;

        document.getElementById("contratos-finalizados").textContent =
            contratos.filter(c => c.estado === "FINALIZADO").length;

        if (contratos.length === 0) return;

        let empleadosPorId = new Map();

        try {

            const empleados = await window.empleadosAPI.obtenerTodos();

            empleadosPorId = new Map(
                empleados.map(e => [Number(e.id), e])
            );

        } catch (error) {
            console.error("Error al consultar empleados:", error);
        }

        if (!tbody.isConnected) return;

        tbody.innerHTML = contratos.map(contrato => {

            const empleado = empleadosPorId.get(
                Number(contrato.empleadoId)
            );

            const nombreEmpleado = empleado
                ? empleado.nombre
                : `Empleado ${contrato.empleadoId}`;

            const claseEstado = {
                ACTIVO: "contrato-estado-activo",
                FINALIZADO: "contrato-estado-finalizado",
                CANCELADO: "contrato-estado-cancelado"
            }[contrato.estado] || "contrato-estado-finalizado";

            return `
            <tr>
                <td class="contrato-codigo">
                    <strong>
                        ${formatearCodigo("CON", contrato.id)}
                    </strong>
                </td>

                <td class="contrato-codigo">
                    ${formatearCodigo("RES", contrato.reservaId)}
                </td>

                <td>${escaparHTML(nombreEmpleado)}</td>

                <td class="contrato-moneda">
                    ${formatoMoneda.format(contrato.garantia ?? 0)}
                </td>

                <td class="contrato-moneda">
                    ${formatoMoneda.format(contrato.totalEstimado ?? 0)}
                </td>

                <td>
                    <span class="contrato-estado ${claseEstado}">
                        ${escaparHTML(contrato.estado)}
                    </span>
                </td>

                <td class="contrato-fecha">
                    ${escaparHTML(
                contrato.fecha
                    ? new Date(contrato.fecha)
                        .toLocaleDateString("es-DO")
                    : "—"
            )}
                </td>

                <td>
                    <button
                        type="button"
                        class="contrato-btn-detalle"
                        data-contrato-id="${Number(contrato.id)}"
                        title="Ver detalles"
                        aria-label="Ver detalles del contrato"
                    >
                        <i data-lucide="eye"></i>
                    </button>
                </td>
            </tr>
        `;

        }).join("");

        tbody.querySelectorAll("[data-contrato-id]").forEach(boton => {

            boton.addEventListener("click", () => {

                const contrato = contratosConsultados.get(
                    Number(boton.dataset.contratoId)
                );

                if (!contrato) return;

                abrirModalDetalleContrato(contrato);

            });

        });

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    async function abrirModalDetalleContrato(contrato) {

        if (document.getElementById("modal-detalle-contrato")) return;

        const modal = document.createElement("div");

        modal.id = "modal-detalle-contrato";
        modal.className = "client-modal-overlay";

        const codigo = `CON-${String(contrato.id).padStart(6, "0")}`;

        modal.innerHTML = `
        <div class="client-modal reserva-modal"
             role="dialog"
             aria-modal="true"
             aria-labelledby="titulo-detalle-contrato">

            <div class="client-modal-header">
                <div>
                    <h2 id="titulo-detalle-contrato">
                        Detalles del contrato
                    </h2>
                    <p id="detalle-contrato-codigo"></p>
                </div>

                <button type="button"
                        class="client-modal-close"
                        id="cerrar-detalle-contrato"
                        aria-label="Cerrar">
                    ×
                </button>
            </div>

            <div class="client-modal-body">
                <div class="contrato-detalle-grid"
                     id="contenido-detalle-contrato">
                    <p>Cargando información...</p>
                </div>
            </div>

            <div class="client-modal-footer">
                <button type="button"
                        class="btn-secondary"
                        id="btn-cerrar-detalle-contrato">
                    Cerrar
                </button>
            </div>

        </div>
    `;

        document.body.appendChild(modal);

        modal.querySelector("#detalle-contrato-codigo")
            .textContent = codigo;

        const cerrar = () => modal.remove();

        modal.querySelector("#cerrar-detalle-contrato")
            .addEventListener("click", cerrar);

        modal.querySelector("#btn-cerrar-detalle-contrato")
            .addEventListener("click", cerrar);

        const formatoMoneda = new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP"
        });

        let reserva = null;
        let empleado = null;
        let cliente = null;
        let vehiculo = null;

        const resultados = await Promise.allSettled([
            window.reservasAPI.obtenerPorId(contrato.reservaId),
            window.empleadosAPI.obtenerPorId(contrato.empleadoId),
            window.clientesAPI.obtenerTodos(),
            window.vehiculosAPI.obtenerTodos()
        ]);

        if (resultados[0].status === "fulfilled") {
            reserva = resultados[0].value;
        }

        if (resultados[1].status === "fulfilled") {
            empleado = resultados[1].value;
        }

        if (reserva && resultados[2].status === "fulfilled") {

            cliente = resultados[2].value.find(
                c => Number(c.id) === Number(reserva.clienteId)
            );
        }

        if (reserva && resultados[3].status === "fulfilled") {

            vehiculo = resultados[3].value.find(
                v => Number(v.id) === Number(reserva.vehiculoId)
            );
        }

        if (!modal.isConnected) return;

        const contenedor = modal.querySelector(
            "#contenido-detalle-contrato"
        );

        contenedor.innerHTML = "";

        const agregarCampo = (etiqueta, valor, completo = false) => {

            const campo = document.createElement("div");

            campo.className = completo
                ? "contrato-detalle-campo contrato-detalle-full"
                : "contrato-detalle-campo";

            const label = document.createElement("span");
            label.textContent = etiqueta;

            const dato = document.createElement("strong");
            dato.textContent = valor ?? "No disponible";

            campo.append(label, dato);
            contenedor.appendChild(campo);
        };

        agregarCampo("Número de contrato", codigo);

        agregarCampo(
            "Reserva asociada",
            `RES-${String(contrato.reservaId).padStart(6, "0")}`
        );

        agregarCampo(
            "Cliente",
            cliente
                ? [cliente.nombre, cliente.apellido]
                    .filter(Boolean).join(" ")
                : "No disponible",
            true
        );

        agregarCampo(
            "Vehículo",
            vehiculo
                ? [vehiculo.marca, vehiculo.modelo, vehiculo.anio]
                    .filter(Boolean).join(" ")
                : "No disponible",
            true
        );

        agregarCampo("Placa", vehiculo?.placa);

        agregarCampo("Estado", contrato.estado);

        agregarCampo("Inicio del alquiler", reserva?.inicio);

        agregarCampo("Fin del alquiler", reserva?.fin);

        agregarCampo(
            "Empleado responsable",
            empleado?.nombre ?? `Empleado ${contrato.empleadoId}`,
            true
        );

        agregarCampo(
            "Total estimado",
            formatoMoneda.format(contrato.totalEstimado ?? 0)
        );

        agregarCampo(
            "Monto de garantía",
            formatoMoneda.format(contrato.garantia ?? 0)
        );

        agregarCampo(
            "Fecha de registro",
            contrato.fecha
                ? new Date(contrato.fecha).toLocaleDateString("es-DO")
                : "No disponible",
            true
        );
    }

    async function cargarEmpleadosContrato() {

        const selector = document.getElementById("contrato-empleado");

        if (!selector) return;

        selector.disabled = true;

        try {

            const empleados = await window.empleadosAPI.obtenerTodos();

            if (!selector.isConnected) return;

            const empleadosActivos = empleados.filter(
                empleado => empleado.activo === true
            );

            selector.innerHTML =
                '<option value="">Selecciona un empleado</option>';

            empleadosActivos.forEach(empleado => {

                const opcion = document.createElement("option");

                opcion.value = empleado.id;

                opcion.textContent =
                    `${empleado.nombre} — ${empleado.rol}`;

                selector.appendChild(opcion);

            });

            if (empleadosActivos.length === 0) {

                selector.innerHTML =
                    '<option value="">No hay empleados activos</option>';

                return;
            }

            selector.disabled = false;

        } catch (error) {

            selector.innerHTML =
                '<option value="">Error al cargar empleados</option>';

            console.error("Error al cargar empleados:", error);

        }
    }

    async function abrirModalNuevoContrato() {
        if (document.getElementById("modal-nuevo-contrato")) return;

        const modal = document.createElement("div");
        modal.id = "modal-nuevo-contrato";
        modal.className = "client-modal-overlay";

        modal.innerHTML = `
        <div class="client-modal reserva-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-nuevo-contrato">
            <div class="client-modal-header">
            <div>
                <h2 id="titulo-nuevo-contrato">Nuevo contrato</h2>
                <p>Genera un contrato desde una reserva confirmada.</p>
            </div>

            <button type="button"
                    class="client-modal-close"
                    id="cerrar-modal-contrato"
                    aria-label="Cerrar">
                ×
            </button>
        </div>

            <form id="form-nuevo-contrato">
            <div class="client-modal-body">
                <div class="client-form-grid">

                    <div class="client-form-field client-form-full">
                        <label for="contrato-reserva">Reserva confirmada</label>
                        <select id="contrato-reserva" required>
                            <option value="">Cargando reservas...</option>
                        </select>
                    </div>

                    <div class="client-form-field client-form-full">
                        <label for="contrato-total-estimado">
                            Total estimado del alquiler
                        </label>

                        <input
                            type="text"
                            id="contrato-total-estimado"
                            placeholder="Selecciona una reserva"
                            readonly
                        >
                    </div>
                </div>

                <div class="client-form-field client-form-full">
                    <label for="contrato-empleado">
                        Empleado responsable *
                    </label>

                    <select id="contrato-empleado" required disabled>
                        <option value="">Cargando empleados...</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="contrato-garantia">Monto de garantía (RD$)</label>
                    <input
                        type="number"
                        id="contrato-garantia"
                        min="0"
                        step="0.01"
                        value="0"
                        required
                    >
                </div>

                <div class="modal-actions">
                    <button type="button"
                            class="btn-secondary"
                            id="cancelar-contrato">
                        Cancelar
                    </button>
                    <button type="submit"
                            class="btn-primary"
                            id="guardar-contrato">
                        <i data-lucide="save"></i>
                        Generar contrato
                    </button>
                </div>
            </form>
        </div>
    `;

        document.body.appendChild(modal);

        cargarEmpleadosContrato();

        const cerrar = () => modal.remove();

        document.getElementById("cerrar-modal-contrato")
            .addEventListener("click", cerrar);

        document.getElementById("cancelar-contrato")
            .addEventListener("click", cerrar);

        const selector = document.getElementById("contrato-reserva");

        const totalEstimado = document.getElementById(
            "contrato-total-estimado"
        );

        const formatoMoneda = new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP"
        });

        selector.addEventListener("change", () => {
            const opcion = selector.options[selector.selectedIndex];

            const total = opcion?.dataset.total;

            totalEstimado.value =
                total !== undefined && total !== ""
                    ? formatoMoneda.format(Number(total))
                    : "";
        });

        try {
            const [reservas, clientes, vehiculos] = await Promise.all([
                window.reservasAPI.obtenerTodas(),
                window.clientesAPI.obtenerTodos(),
                window.vehiculosAPI.obtenerTodos()
            ]);

            const clientesPorId = new Map(
                clientes.map(cliente => [Number(cliente.id), cliente])
            );

            const vehiculosPorId = new Map(
                vehiculos.map(vehiculo => [Number(vehiculo.id), vehiculo])
            );

            if (!modal.isConnected) return;

            const confirmadas = reservas.filter(
                reserva => reserva.estado === "CONFIRMADA"
            );

            selector.innerHTML = '<option value="">Selecciona una reserva</option>';

            confirmadas.forEach(reserva => {
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

                const opcion = document.createElement("option");

                opcion.value = reserva.id;
                opcion.dataset.total = reserva.total ?? "";

                opcion.textContent =
                    `${formatearCodigo("RES", reserva.id)} — ` +
                    `${nombreCliente} — ${nombreVehiculo}`;

                selector.appendChild(opcion);
            });

            if (confirmadas.length === 0) {
                selector.innerHTML =
                    '<option value="">No hay reservas confirmadas</option>';
                selector.disabled = true;
            }
        } catch (error) {
            selector.innerHTML =
                '<option value="">Error al cargar reservas</option>';
            selector.disabled = true;
            alert(`No se pudieron cargar las reservas: ${error.message}`);
        }

        if (window.lucide) window.lucide.createIcons();

        document.getElementById("form-nuevo-contrato")
            .addEventListener("submit", async (evento) => {
                evento.preventDefault();

                const reservaId = Number(selector.value);
                const empleadoId = Number(
                    document.getElementById("contrato-empleado").value
                );
                const montoGarantia = Number(
                    document.getElementById("contrato-garantia").value
                );

                if (!Number.isSafeInteger(reservaId) || reservaId < 1 ||
                    !Number.isSafeInteger(empleadoId) || empleadoId < 1 ||
                    !Number.isFinite(montoGarantia) || montoGarantia < 0) {
                    alert("Verifica los datos del contrato.");
                    return;
                }

                const boton = document.getElementById("guardar-contrato");
                boton.disabled = true;
                boton.textContent = "Generando contrato...";

                try {
                    const contrato = await window.contratosAPI.crear({
                        reservaId,
                        empleadoId,
                        montoGarantia
                    });

                    contratosConsultados.set(Number(contrato.id), contrato);
                    renderizarContratosConsultados();

                    cerrar();

                    mostrarModalExito(
                        "¡Contrato generado!",
                        "El contrato de alquiler se ha generado correctamente.",
                        formatearCodigo("CON", contrato.id)
                    );

                } catch (error) {
                    alert(`No se pudo generar el contrato: ${error.message}`);
                } finally {
                    if (boton.isConnected) {
                        boton.disabled = false;
                        boton.textContent = "Generar contrato";
                    }
                }
                        });
    }

    async function mostrarEmpleados() {
    contenido.innerHTML = `
        <section class="page-header">
            <div>
                <h1>Gestión de empleados</h1>
                <p class="page-description">
                    Administración del personal de operación.
                </p>
            </div>
        </section>

        ${crearIndicadoresModulo([
            { id: "empleados-total", titulo: "Total de empleados", icono: "users" },
            { id: "empleados-activos", titulo: "Empleados activos", icono: "user-check" },
            { id: "empleados-inactivos", titulo: "Inactivos", icono: "user-x" }
        ])}

        <section class="content-panel branches-panel">
            <div class="branches-toolbar">
                <div class="branches-search rentcar-search">
                    <i data-lucide="search"></i>

                    <input
                        type="search"
                        id="buscar-empleado"
                        placeholder="Buscar por nombre, usuario o rol..."
                        aria-label="Buscar empleado"
                        autocomplete="off"
                    >

                    <button
                        type="button"
                        id="btn-buscar-empleado"
                        class="btn-search"
                    >
                        <i data-lucide="search"></i>
                        Buscar
                    </button>
                </div>

                <button
                    type="button"
                    id="nuevo-empleado"
                    class="btn-primary"
                >
                    <i data-lucide="user-plus"></i>
                    Nuevo empleado
                </button>
            </div>

            <div class="branches-table-container">
                <table class="branches-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Usuario</th>
                            <th>Sucursal</th>
                            <th>Rol</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody id="empleados-table-body">
                        <tr>
                            <td colspan="6">Cargando empleados...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    `;

    const cuerpoTabla = document.getElementById("empleados-table-body");
    const buscador = document.getElementById("buscar-empleado");
    const botonBuscar = document.getElementById("btn-buscar-empleado");

    document
        .getElementById("nuevo-empleado")
        .addEventListener("click", abrirModalEmpleado);

    if (window.lucide) {
        window.lucide.createIcons();
    }

    try {
        const [empleados, sucursales] = await Promise.all([
            window.empleadosAPI.obtenerTodos(),
            window.sucursalesAPI.obtenerTodas()
        ]);

        if (!cuerpoTabla.isConnected) return;

        const nombresSucursales = new Map(
            sucursales.map(sucursal => [sucursal.id, sucursal.nombre])
        );

        const activos = empleados.filter(empleado => empleado.activo === true).length;

        actualizarIndicadoresModulo({
            "empleados-total": empleados.length,
            "empleados-activos": activos,
            "empleados-inactivos": empleados.length - activos
        });

        renderizarEmpleados(empleados, cuerpoTabla, nombresSucursales);

        function buscarEmpleados() {
            const texto = buscador.value.trim().toLowerCase();

            const filtrados = empleados.filter(empleado =>
                [empleado.nombre, empleado.username, empleado.rol]
                    .some(valor => String(valor ?? "").toLowerCase().includes(texto))
            );

            renderizarEmpleados(filtrados, cuerpoTabla, nombresSucursales);
        }

        botonBuscar.addEventListener("click", buscarEmpleados);

        buscador.addEventListener("keydown", evento => {
            if (evento.key === "Enter") {
                buscarEmpleados();
            }
        });

        buscador.addEventListener("input", () => {
            if (buscador.value.trim() === "") {
                renderizarEmpleados(empleados, cuerpoTabla, nombresSucursales);
            }
        });

    } catch (error) {
        console.error("Error al cargar empleados:", error);

        if (cuerpoTabla.isConnected) {
            cuerpoTabla.innerHTML = `
                <tr>
                    <td colspan="6">
                        No se pudieron cargar los empleados.
                        Verifica la conexión con el servidor.
                    </td>
                </tr>
            `;
        }
    }
    }

    function abrirModalEmpleado() {
        if (document.getElementById("modal-empleado")) return;

        const modal = document.createElement("div");
        modal.id = "modal-empleado";
        modal.className = "modal-overlay";

        modal.innerHTML = `
        <div class="modal-container" role="dialog"
             aria-modal="true"
             aria-labelledby="modal-empleado-titulo">

            <div class="modal-header">
                <div>
                    <h2 id="modal-empleado-titulo">Nuevo empleado</h2>
                    <p>Registra un nuevo miembro del personal.</p>
                </div>

                <button type="button"
                        class="modal-close"
                        id="cerrar-modal-empleado"
                        aria-label="Cerrar formulario">
                    &times;
                </button>
            </div>

            <form id="form-nuevo-empleado">
                <div class="modal-body">

                    <div class="form-group">
                        <label for="empleado-nombre">Nombre completo *</label>
                        <input
                            type="text"
                            id="empleado-nombre"
                            name="nombre"
                            maxlength="100"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="empleado-username">Usuario *</label>
                        <input
                            type="text"
                            id="empleado-username"
                            name="username"
                            maxlength="50"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="empleado-password">Contraseña *</label>
                        <input
                            type="password"
                            id="empleado-password"
                            name="password"
                            maxlength="255"
                            autocomplete="new-password"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="empleado-sucursal">Sucursal *</label>
                        <select id="empleado-sucursal" required>
                            <option value="">Cargando sucursales...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="empleado-rol">Rol *</label>
                        <select id="empleado-rol" required>
                            <option value="">Selecciona un rol</option>
                            <option value="ADMINISTRADOR">Administrador</option>
                            <option value="AGENTE">Agente</option>
                            <option value="MECANICO">Mecánico</option>
                        </select>
                    </div>

                    <p id="mensaje-empleado"
                       class="form-message"
                       role="alert"></p>

                </div>

                <div class="modal-footer">
                    <button type="button"
                            class="btn-secondary"
                            id="cancelar-empleado">
                        Cancelar
                    </button>

                    <button type="submit"
                            class="btn-primary"
                            id="guardar-empleado">
                        Guardar empleado
                    </button>
                </div>
            </form>
        </div>
    `;

        document.body.appendChild(modal);

        const formulario = document.getElementById("form-nuevo-empleado");
        const botonGuardar = document.getElementById("guardar-empleado");
        const mensaje = document.getElementById("mensaje-empleado");

        const cerrar = () => {
            document.removeEventListener("keydown", cerrarConEscape);
            modal.remove();
        };

        const cerrarConEscape = evento => {
            if (evento.key === "Escape") cerrar();
        };

        document.addEventListener("keydown", cerrarConEscape);

        document.getElementById("cerrar-modal-empleado")
            .addEventListener("click", cerrar);

        document.getElementById("cancelar-empleado")
            .addEventListener("click", cerrar);

        modal.addEventListener("click", evento => {
            if (evento.target === modal) cerrar();
        });

        (async () => {
            try {
                const sucursales = await window.sucursalesAPI.obtenerActivas();

                if (!modal.isConnected) return;

                const selector = document.getElementById("empleado-sucursal");

                selector.innerHTML = '<option value="">Selecciona una sucursal</option>';

                sucursales.forEach(sucursal => {
                    const opcion = document.createElement("option");
                    opcion.value = sucursal.id;
                    opcion.textContent = sucursal.nombre;
                    selector.appendChild(opcion);
                });

                if (sucursales.length === 0) {
                    selector.innerHTML = '<option value="">No hay sucursales activas</option>';
                    selector.disabled = true;
                }

            } catch (error) {
                console.error("Error al cargar sucursales:", error);

                const selector = document.getElementById("empleado-sucursal");

                if (selector) {
                    selector.innerHTML = '<option value="">Error al cargar sucursales</option>';
                    selector.disabled = true;
                }
            }
        })();

        formulario.addEventListener("submit", async evento => {
            evento.preventDefault();

            const sucursalId = Number(
                document.getElementById("empleado-sucursal").value
            );
            const nombre = document.getElementById("empleado-nombre").value.trim();
            const username = document.getElementById("empleado-username").value.trim();
            const password = document.getElementById("empleado-password").value;
            const rol = document.getElementById("empleado-rol").value;

            if (!sucursalId || !nombre || !username || !password || !rol) {
                mensaje.textContent = "Completa todos los campos.";
                return;
            }

            botonGuardar.disabled = true;
            botonGuardar.textContent = "Guardando...";
            mensaje.textContent = "";

            try {
                const empleado = await window.empleadosAPI.registrar({
                    sucursalId,
                    nombre,
                    username,
                    password,
                    rol
                });

                cerrar();

                mostrarModalExito(
                    "¡Empleado registrado!",
                    "El empleado se ha registrado correctamente en el sistema.",
                    formatearCodigo("EMP", empleado.id)
                );

                if (location.hash === "#empleados") {
                    await mostrarEmpleados();
                }

            } catch (error) {
                console.error("Error al registrar empleado:", error);

                mensaje.textContent =
                    "No se pudo registrar el empleado. Verifica que el usuario no exista y los datos sean válidos.";

            } finally {
                if (botonGuardar.isConnected) {
                    botonGuardar.disabled = false;
                    botonGuardar.textContent = "Guardar empleado";
                }
            }
        });

        document.getElementById("empleado-nombre").focus();
    }

    function renderizarEmpleados(empleados, cuerpoTabla, nombresSucursales) {
        cuerpoTabla.replaceChildren();

        if (!Array.isArray(empleados) || empleados.length === 0) {
            const fila = document.createElement("tr");
            const celda = document.createElement("td");

            celda.colSpan = 6;
            celda.textContent = "No se encontraron empleados.";

            fila.appendChild(celda);
            cuerpoTabla.appendChild(fila);
            return;
        }

        empleados.forEach(empleado => {
            const fila = cuerpoTabla.insertRow();

            const datos = [
                empleado.id,
                empleado.nombre,
                empleado.username,
                nombresSucursales.get(empleado.sucursalId) ?? `Sucursal #${empleado.sucursalId}`,
                empleado.rol
            ];

            datos.forEach(dato => {
                const celda = fila.insertCell();
                celda.textContent = dato ?? "—";
            });

            const celdaEstado = fila.insertCell();
            const estado = document.createElement("span");

            estado.className = empleado.activo
                ? "branch-status active"
                : "branch-status inactive";

            estado.textContent = empleado.activo ? "Activo" : "Inactivo";

            celdaEstado.appendChild(estado);
        });
    }

    async function mostrarTiposTarifas() {
    contenido.innerHTML = `
        <section class="page-header">
            <div>
                <h1>Tipos de vehículo y tarifas</h1>
                <p class="page-description">
                    Catálogo de tipos de vehículo y tarifas de alquiler.
                </p>
            </div>
        </section>

        <div class="reservas-section-heading">
            <h3>Tipos de vehículo</h3>
            <p>Clasificación de la flota (SUV, sedán, etc.).</p>
        </div>

        <section class="content-panel branches-panel">
            <div class="branches-toolbar">
                <div class="branches-search rentcar-search">
                    <i data-lucide="search"></i>

                    <input
                        type="search"
                        id="buscar-tipo"
                        placeholder="Buscar tipo de vehículo..."
                        aria-label="Buscar tipo de vehículo"
                        autocomplete="off"
                    >

                    <button type="button" id="btn-buscar-tipo" class="btn-search">
                        <i data-lucide="search"></i>
                        Buscar
                    </button>
                </div>

                <button type="button" id="nuevo-tipo" class="btn-primary">
                    <i data-lucide="tag"></i>
                    Nuevo tipo
                </button>
            </div>

            <div class="branches-table-container">
                <table class="branches-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody id="tipos-table-body">
                        <tr>
                            <td colspan="3">Cargando tipos...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <div class="reservas-section-heading">
            <h3>Tarifas</h3>
            <p>Precio por día vigente para cada tipo de vehículo.</p>
        </div>

        <section class="content-panel branches-panel">
            <div class="branches-toolbar">
                <span class="tarifas-note">
                    Al registrar una tarifa se desactiva la anterior del mismo tipo.
                </span>

                <button type="button" id="nueva-tarifa" class="btn-primary">
                    <i data-lucide="plus"></i>
                    Nueva tarifa
                </button>
            </div>

            <div class="branches-table-container">
                <table class="branches-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tipo</th>
                            <th>Precio por día</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody id="tarifas-table-body">
                        <tr>
                            <td colspan="4">Cargando tarifas...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    `;

    const cuerpoTipos = document.getElementById("tipos-table-body");
    const cuerpoTarifas = document.getElementById("tarifas-table-body");
    const buscador = document.getElementById("buscar-tipo");

    document.getElementById("nuevo-tipo").addEventListener("click", abrirModalTipo);
    document.getElementById("nueva-tarifa").addEventListener("click", abrirModalTarifa);

    if (window.lucide) {
        window.lucide.createIcons();
    }

    try {
        const [tipos, tarifas] = await Promise.all([
            window.tiposVehiculoAPI.obtenerTodos(),
            window.tarifasAPI.obtenerTodas()
        ]);

        if (!cuerpoTipos.isConnected) return;

        const nombresTipos = new Map(
            tipos.map(tipo => [tipo.id, tipo.nombre])
        );

        renderizarTipos(tipos, cuerpoTipos);
        renderizarTarifas(tarifas, cuerpoTarifas, nombresTipos);

        function buscarTipos() {
            const texto = buscador.value.trim().toLowerCase();

            const filtrados = tipos.filter(tipo =>
                String(tipo.nombre ?? "").toLowerCase().includes(texto)
            );

            renderizarTipos(filtrados, cuerpoTipos);
        }

        document.getElementById("btn-buscar-tipo")
            .addEventListener("click", buscarTipos);

        buscador.addEventListener("keydown", evento => {
            if (evento.key === "Enter") buscarTipos();
        });

        buscador.addEventListener("input", () => {
            if (buscador.value.trim() === "") {
                renderizarTipos(tipos, cuerpoTipos);
            }
        });

    } catch (error) {
        console.error("Error al cargar tipos y tarifas:", error);

        if (cuerpoTipos.isConnected) {
            cuerpoTipos.innerHTML = '<tr><td colspan="3">No se pudieron cargar los tipos de vehículo.</td></tr>';
        }

        if (cuerpoTarifas.isConnected) {
            cuerpoTarifas.innerHTML = '<tr><td colspan="4">No se pudieron cargar las tarifas.</td></tr>';
        }
    }
    }

    function renderizarTipos(tipos, cuerpoTabla) {
        cuerpoTabla.replaceChildren();

        if (!Array.isArray(tipos) || tipos.length === 0) {
            const fila = cuerpoTabla.insertRow();
            const celda = fila.insertCell();
            celda.colSpan = 3;
            celda.textContent = "No se encontraron tipos de vehículo.";
            fila.appendChild(celda);
            return;
        }

        tipos.forEach(tipo => {
            const fila = cuerpoTabla.insertRow();

            const celdaId = fila.insertCell();
            celdaId.textContent = tipo.id;

            const celdaNombre = fila.insertCell();
            celdaNombre.textContent = tipo.nombre;

            const celdaEstado = fila.insertCell();
            const estado = document.createElement("span");
            estado.className = tipo.activo ? "branch-status active" : "branch-status inactive";
            estado.textContent = tipo.activo ? "Activo" : "Inactivo";
            celdaEstado.appendChild(estado);
        });
    }

    function renderizarTarifas(tarifas, cuerpoTabla, nombresTipos) {
        cuerpoTabla.replaceChildren();

        const formatoMoneda = new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP"
        });

        if (!Array.isArray(tarifas) || tarifas.length === 0) {
            const fila = cuerpoTabla.insertRow();
            const celda = fila.insertCell();
            celda.colSpan = 4;
            celda.textContent = "No se encontraron tarifas.";
            fila.appendChild(celda);
            return;
        }

        tarifas.forEach(tarifa => {
            const fila = cuerpoTabla.insertRow();

            const celdaId = fila.insertCell();
            celdaId.textContent = tarifa.id;

            const celdaTipo = fila.insertCell();
            celdaTipo.textContent = nombresTipos.get(tarifa.tipoVehiculoId)
                ?? `Tipo #${tarifa.tipoVehiculoId}`;

            const celdaPrecio = fila.insertCell();
            celdaPrecio.textContent = formatoMoneda.format(tarifa.precioPorDia ?? 0);

            const celdaEstado = fila.insertCell();
            const estado = document.createElement("span");
            estado.className = tarifa.activo ? "branch-status active" : "branch-status inactive";
            estado.textContent = tarifa.activo ? "Activa" : "Inactiva";
            celdaEstado.appendChild(estado);
        });
    }

    function abrirModalTipo() {
        if (document.getElementById("modal-tipo")) return;

        const modal = document.createElement("div");
        modal.id = "modal-tipo";
        modal.className = "modal-overlay";

        modal.innerHTML = `
        <div class="modal-container" role="dialog"
             aria-modal="true" aria-labelledby="modal-tipo-titulo">
            <div class="modal-header">
                <div>
                    <h2 id="modal-tipo-titulo">Nuevo tipo de vehículo</h2>
                    <p>Registra una nueva clasificación para la flota.</p>
                </div>
                <button type="button" class="modal-close"
                        id="cerrar-modal-tipo" aria-label="Cerrar formulario">&times;</button>
            </div>

            <form id="form-nuevo-tipo">
                <div class="modal-body">
                    <div class="form-group">
                        <label for="tipo-nombre">Nombre *</label>
                        <input type="text" id="tipo-nombre" name="nombre"
                               maxlength="80" required>
                    </div>
                    <p id="mensaje-tipo" class="form-message" role="alert"></p>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn-secondary" id="cancelar-tipo">Cancelar</button>
                    <button type="submit" class="btn-primary" id="guardar-tipo">Guardar tipo</button>
                </div>
            </form>
        </div>
    `;

        document.body.appendChild(modal);

        const formulario = document.getElementById("form-nuevo-tipo");
        const botonGuardar = document.getElementById("guardar-tipo");
        const mensaje = document.getElementById("mensaje-tipo");

        const cerrar = () => {
            document.removeEventListener("keydown", cerrarConEscape);
            modal.remove();
        };

        const cerrarConEscape = evento => {
            if (evento.key === "Escape") cerrar();
        };

        document.addEventListener("keydown", cerrarConEscape);
        document.getElementById("cerrar-modal-tipo").addEventListener("click", cerrar);
        document.getElementById("cancelar-tipo").addEventListener("click", cerrar);
        modal.addEventListener("click", evento => {
            if (evento.target === modal) cerrar();
        });

        formulario.addEventListener("submit", async evento => {
            evento.preventDefault();

            const nombre = document.getElementById("tipo-nombre").value.trim();

            if (!nombre) {
                mensaje.textContent = "Completa el nombre del tipo.";
                return;
            }

            botonGuardar.disabled = true;
            botonGuardar.textContent = "Guardando...";
            mensaje.textContent = "";

            try {
                const tipo = await window.tiposVehiculoAPI.crear({ nombre });

                cerrar();

                mostrarModalExito(
                    "¡Tipo registrado!",
                    "El tipo de vehículo se ha registrado correctamente.",
                    formatearCodigo("TIP", tipo.id)
                );

                if (location.hash === "#tipos-tarifas") {
                    await mostrarTiposTarifas();
                }

            } catch (error) {
                console.error("Error al registrar tipo:", error);
                mensaje.textContent =
                    "No se pudo registrar el tipo. Verifica que el nombre no exista.";

            } finally {
                if (botonGuardar.isConnected) {
                    botonGuardar.disabled = false;
                    botonGuardar.textContent = "Guardar tipo";
                }
            }
        });

        document.getElementById("tipo-nombre").focus();
    }

    function abrirModalTarifa() {
        if (document.getElementById("modal-tarifa")) return;

        const modal = document.createElement("div");
        modal.id = "modal-tarifa";
        modal.className = "modal-overlay";

        modal.innerHTML = `
        <div class="modal-container" role="dialog"
             aria-modal="true" aria-labelledby="modal-tarifa-titulo">
            <div class="modal-header">
                <div>
                    <h2 id="modal-tarifa-titulo">Nueva tarifa</h2>
                    <p>Define el precio por día para un tipo de vehículo.</p>
                </div>
                <button type="button" class="modal-close"
                        id="cerrar-modal-tarifa" aria-label="Cerrar formulario">&times;</button>
            </div>

            <form id="form-nueva-tarifa">
                <div class="modal-body">
                    <div class="form-group">
                        <label for="tarifa-tipo">Tipo de vehículo *</label>
                        <select id="tarifa-tipo" required>
                            <option value="">Cargando tipos...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="tarifa-precio">Precio por día (RD$) *</label>
                        <input type="number" id="tarifa-precio" name="precioPorDia"
                               min="0.01" step="0.01" required>
                    </div>

                    <p id="mensaje-tarifa" class="form-message" role="alert"></p>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn-secondary" id="cancelar-tarifa">Cancelar</button>
                    <button type="submit" class="btn-primary" id="guardar-tarifa">Guardar tarifa</button>
                </div>
            </form>
        </div>
    `;

        document.body.appendChild(modal);

        const formulario = document.getElementById("form-nueva-tarifa");
        const botonGuardar = document.getElementById("guardar-tarifa");
        const mensaje = document.getElementById("mensaje-tarifa");

        const cerrar = () => {
            document.removeEventListener("keydown", cerrarConEscape);
            modal.remove();
        };

        const cerrarConEscape = evento => {
            if (evento.key === "Escape") cerrar();
        };

        document.addEventListener("keydown", cerrarConEscape);
        document.getElementById("cerrar-modal-tarifa").addEventListener("click", cerrar);
        document.getElementById("cancelar-tarifa").addEventListener("click", cerrar);
        modal.addEventListener("click", evento => {
            if (evento.target === modal) cerrar();
        });

        (async () => {
            try {
                const tipos = await window.tiposVehiculoAPI.obtenerTodos();

                if (!modal.isConnected) return;

                const selector = document.getElementById("tarifa-tipo");

                selector.innerHTML = '<option value="">Selecciona un tipo</option>';

                const activos = tipos.filter(tipo => tipo.activo === true);

                activos.forEach(tipo => {
                    const opcion = document.createElement("option");
                    opcion.value = tipo.id;
                    opcion.textContent = tipo.nombre;
                    selector.appendChild(opcion);
                });

                if (activos.length === 0) {
                    selector.innerHTML = '<option value="">No hay tipos activos</option>';
                    selector.disabled = true;
                }

            } catch (error) {
                console.error("Error al cargar tipos:", error);

                const selector = document.getElementById("tarifa-tipo");

                if (selector) {
                    selector.innerHTML = '<option value="">Error al cargar tipos</option>';
                    selector.disabled = true;
                }
            }
        })();

        formulario.addEventListener("submit", async evento => {
            evento.preventDefault();

            const tipoVehiculoId = Number(
                document.getElementById("tarifa-tipo").value
            );
            const precioPorDia = Number(
                document.getElementById("tarifa-precio").value
            );

            if (!tipoVehiculoId || !Number.isFinite(precioPorDia) || precioPorDia <= 0) {
                mensaje.textContent = "Selecciona un tipo y un precio válido.";
                return;
            }

            botonGuardar.disabled = true;
            botonGuardar.textContent = "Guardando...";
            mensaje.textContent = "";

            try {
                const tarifa = await window.tarifasAPI.crear({
                    tipoVehiculoId,
                    precioPorDia
                });

                cerrar();

                mostrarModalExito(
                    "¡Tarifa registrada!",
                    "La tarifa se ha registrado y quedó como vigente.",
                    formatearCodigo("TAR", tarifa.id)
                );

                if (location.hash === "#tipos-tarifas") {
                    await mostrarTiposTarifas();
                }

            } catch (error) {
                console.error("Error al registrar tarifa:", error);
                mensaje.textContent = "No se pudo registrar la tarifa. Verifica los datos.";

            } finally {
                if (botonGuardar.isConnected) {
                    botonGuardar.disabled = false;
                    botonGuardar.textContent = "Guardar tarifa";
                }
            }
        });
    }

    async function mostrarInspecciones() {
    contenido.innerHTML = `
        <section class="page-header">
            <div>
                <h1>Gestión de inspecciones</h1>
                <p class="page-description">
                    Registro del estado de los vehículos al salir y al entrar.
                </p>
            </div>
        </section>

        <div class="reservas-section-heading">
            <h3>Registrar inspección</h3>
            <p>Registra una inspección de salida o de entrada para un contrato.</p>
        </div>

        <section class="content-panel branches-panel">
            <div class="branches-toolbar">
                <span class="tarifas-note">
                    Máximo una inspección de salida y una de entrada por contrato.
                </span>

                <button type="button" id="nueva-inspeccion" class="btn-primary">
                    <i data-lucide="clipboard-check"></i>
                    Nueva inspección
                </button>
            </div>
        </section>

        <div class="reservas-section-heading">
            <h3>Inspecciones por contrato</h3>
            <p>Consulta las inspecciones de un contrato por su número.</p>
        </div>

        <section class="content-panel branches-panel reservas-list-panel">
            <div class="branches-toolbar reservas-list-toolbar">
                <div class="reservas-search-input">
                    <i data-lucide="search"></i>
                    <input
                        type="number"
                        id="buscar-contrato-inspecciones"
                        min="1"
                        step="1"
                        placeholder="Número de contrato..."
                        aria-label="Buscar inspecciones por contrato"
                    >
                    <button type="button" id="btn-buscar-inspecciones" class="btn-search">
                        <i data-lucide="search"></i>
                        Buscar
                    </button>
                </div>
            </div>

            <div class="branches-table-container">
                <table class="branches-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tipo</th>
                            <th>Empleado</th>
                            <th>Kilometraje</th>
                            <th>Combustible</th>
                            <th>Fecha</th>
                            <th>Observaciones</th>
                        </tr>
                    </thead>
                    <tbody id="inspecciones-table-body">
                        <tr>
                            <td colspan="7">
                                <div class="reservas-empty">
                                    <i data-lucide="clipboard-search"></i>
                                    <h3>Consulta las inspecciones</h3>
                                    <p>Introduce el número de un contrato para ver sus inspecciones.</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    `;

    document.getElementById("nueva-inspeccion")
        .addEventListener("click", abrirModalInspeccion);

    const buscador = document.getElementById("buscar-contrato-inspecciones");

    const buscar = () => {
        const id = buscador.value.trim();
        if (id) cargarInspeccionesContrato(id);
    };

    document.getElementById("btn-buscar-inspecciones")
        .addEventListener("click", buscar);

    buscador.addEventListener("change", buscar);

    buscador.addEventListener("keydown", evento => {
        if (evento.key === "Enter") buscar();
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }
    }

    async function cargarInspeccionesContrato(contratoId) {
        const tbody = document.getElementById("inspecciones-table-body");
        if (!tbody) return;

        const id = Number(contratoId);

        if (!Number.isSafeInteger(id) || id < 1) {
            alert("Introduce un número de contrato válido.");
            return;
        }

        tbody.innerHTML = '<tr><td colspan="7">Cargando inspecciones...</td></tr>';

        try {
            const [inspecciones, empleados] = await Promise.all([
                window.inspeccionesAPI.obtenerPorContrato(id),
                window.empleadosAPI.obtenerTodos()
            ]);

            if (!tbody.isConnected) return;

            const nombresEmpleados = new Map(
                empleados.map(empleado => [empleado.id, empleado.nombre])
            );

            renderizarInspecciones(inspecciones, tbody, nombresEmpleados);

        } catch (error) {
            console.error("Error al consultar inspecciones:", error);

            if (tbody.isConnected) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7">
                            No se pudieron consultar las inspecciones: ${error.message}
                        </td>
                    </tr>
                `;
            }
        }
    }

    function renderizarInspecciones(inspecciones, cuerpoTabla, nombresEmpleados) {
        cuerpoTabla.replaceChildren();

        if (!Array.isArray(inspecciones) || inspecciones.length === 0) {
            const fila = cuerpoTabla.insertRow();
            const celda = fila.insertCell();
            celda.colSpan = 7;
            celda.textContent = "Este contrato no tiene inspecciones registradas.";
            fila.appendChild(celda);
            return;
        }

        const etiquetaCombustible = combustible => ({
            "LLENO": "Lleno",
            "TRES_CUARTOS": "3/4",
            "MEDIO": "1/2",
            "CUARTO": "1/4",
            "RESERVA": "Reserva"
        }[combustible] ?? combustible);

        inspecciones.forEach(inspeccion => {
            const fila = cuerpoTabla.insertRow();

            const datos = [
                inspeccion.id,
                inspeccion.tipo,
                nombresEmpleados.get(inspeccion.empleadoId) ?? `Empleado #${inspeccion.empleadoId}`,
                inspeccion.kilometraje,
                etiquetaCombustible(inspeccion.combustible),
                inspeccion.fecha
                    ? new Date(inspeccion.fecha).toLocaleDateString("es-DO")
                    : "—",
                inspeccion.observaciones || "—"
            ];

            datos.forEach(dato => {
                const celda = fila.insertCell();
                celda.textContent = dato ?? "—";
            });
        });
    }

    function abrirModalInspeccion() {
        if (document.getElementById("modal-inspeccion")) return;

        const modal = document.createElement("div");
        modal.id = "modal-inspeccion";
        modal.className = "modal-overlay";

        modal.innerHTML = `
        <div class="modal-container" role="dialog"
             aria-modal="true" aria-labelledby="modal-inspeccion-titulo">
            <div class="modal-header">
                <div>
                    <h2 id="modal-inspeccion-titulo">Nueva inspección</h2>
                    <p>Registra el estado del vehículo al salir o al entrar.</p>
                </div>
                <button type="button" class="modal-close"
                        id="cerrar-modal-inspeccion" aria-label="Cerrar formulario">&times;</button>
            </div>

            <form id="form-nueva-inspeccion">
                <div class="modal-body">
                    <div class="form-group">
                        <label for="inspeccion-contrato">Número de contrato *</label>
                        <input type="number" id="inspeccion-contrato"
                               min="1" step="1" required>
                    </div>

                    <div class="form-group">
                        <label for="inspeccion-empleado">Empleado inspector *</label>
                        <select id="inspeccion-empleado" required>
                            <option value="">Cargando empleados...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="inspeccion-tipo">Tipo *</label>
                        <select id="inspeccion-tipo" required>
                            <option value="">Selecciona el tipo</option>
                            <option value="SALIDA">Salida</option>
                            <option value="ENTRADA">Entrada</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="inspeccion-kilometraje">Kilometraje *</label>
                        <input type="number" id="inspeccion-kilometraje"
                               min="0" step="1" required>
                    </div>

                    <div class="form-group">
                        <label for="inspeccion-combustible">Nivel de combustible *</label>
                        <select id="inspeccion-combustible" required>
                            <option value="">Selecciona el nivel</option>
                            <option value="LLENO">Lleno</option>
                            <option value="3/4">3/4</option>
                            <option value="1/2">1/2</option>
                            <option value="1/4">1/4</option>
                            <option value="RESERVA">Reserva</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="inspeccion-observaciones">Observaciones</label>
                        <input type="text" id="inspeccion-observaciones"
                               maxlength="250" placeholder="Sin detalles">
                    </div>

                    <p id="mensaje-inspeccion" class="form-message" role="alert"></p>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn-secondary" id="cancelar-inspeccion">Cancelar</button>
                    <button type="submit" class="btn-primary" id="guardar-inspeccion">Registrar inspección</button>
                </div>
            </form>
        </div>
    `;

        document.body.appendChild(modal);

        const formulario = document.getElementById("form-nueva-inspeccion");
        const botonGuardar = document.getElementById("guardar-inspeccion");
        const mensaje = document.getElementById("mensaje-inspeccion");

        const cerrar = () => {
            document.removeEventListener("keydown", cerrarConEscape);
            modal.remove();
        };

        const cerrarConEscape = evento => {
            if (evento.key === "Escape") cerrar();
        };

        document.addEventListener("keydown", cerrarConEscape);
        document.getElementById("cerrar-modal-inspeccion").addEventListener("click", cerrar);
        document.getElementById("cancelar-inspeccion").addEventListener("click", cerrar);
        modal.addEventListener("click", evento => {
            if (evento.target === modal) cerrar();
        });

        (async () => {
            try {
                const empleados = await window.empleadosAPI.obtenerTodos();

                if (!modal.isConnected) return;

                const selector = document.getElementById("inspeccion-empleado");

                selector.innerHTML = '<option value="">Selecciona un empleado</option>';

                empleados
                    .filter(empleado => empleado.activo === true)
                    .forEach(empleado => {
                        const opcion = document.createElement("option");
                        opcion.value = empleado.id;
                        opcion.textContent = empleado.nombre;
                        selector.appendChild(opcion);
                    });

                if (empleados.filter(empleado => empleado.activo === true).length === 0) {
                    selector.innerHTML = '<option value="">No hay empleados activos</option>';
                    selector.disabled = true;
                }

            } catch (error) {
                console.error("Error al cargar empleados:", error);

                const selector = document.getElementById("inspeccion-empleado");

                if (selector) {
                    selector.innerHTML = '<option value="">Error al cargar empleados</option>';
                    selector.disabled = true;
                }
            }
        })();

        formulario.addEventListener("submit", async evento => {
            evento.preventDefault();

            const contratoId = Number(
                document.getElementById("inspeccion-contrato").value
            );
            const empleadoId = Number(
                document.getElementById("inspeccion-empleado").value
            );
            const tipo = document.getElementById("inspeccion-tipo").value;
            const kilometraje = Number(
                document.getElementById("inspeccion-kilometraje").value
            );
            const nivelCombustible = document.getElementById("inspeccion-combustible").value;
            const observaciones = document.getElementById("inspeccion-observaciones").value.trim();

            if (!Number.isSafeInteger(contratoId) || contratoId < 1 ||
                !Number.isSafeInteger(empleadoId) || empleadoId < 1 ||
                !tipo || !Number.isFinite(kilometraje) || kilometraje < 0 ||
                !nivelCombustible) {
                mensaje.textContent = "Completa todos los campos obligatorios.";
                return;
            }

            botonGuardar.disabled = true;
            botonGuardar.textContent = "Registrando...";
            mensaje.textContent = "";

            try {
                const inspeccion = await window.inspeccionesAPI.crear({
                    contratoId,
                    empleadoId,
                    tipo,
                    kilometraje,
                    nivelCombustible,
                    observaciones
                });

                cerrar();

                mostrarModalExito(
                    "¡Inspección registrada!",
                    "La inspección se ha registrado correctamente.",
                    formatearCodigo("INS", inspeccion.id)
                );

                if (location.hash === "#inspecciones") {
                    await mostrarInspecciones();

                    const buscador = document.getElementById("buscar-contrato-inspecciones");

                    if (buscador) {
                        buscador.value = String(contratoId);
                        await cargarInspeccionesContrato(contratoId);
                    }
                }

            } catch (error) {
                console.error("Error al registrar inspección:", error);
                mensaje.textContent = `No se pudo registrar la inspección: ${error.message}`;

            } finally {
                if (botonGuardar.isConnected) {
                    botonGuardar.disabled = false;
                    botonGuardar.textContent = "Registrar inspección";
                }
            }
        });

        document.getElementById("inspeccion-contrato").focus();
    }

    async function mostrarFacturacion() {
    contenido.innerHTML = `
        <section class="page-header">
            <div>
                <h1>Gestión de facturación</h1>
                <p class="page-description">
                    Consulta y administración de las facturas de alquiler.
                </p>
            </div>
        </section>

        <div class="reservas-section-heading">
            <h3>Facturas emitidas</h3>
            <p>Facturas iniciales y complementarias con su detalle.</p>
        </div>

        <section class="content-panel branches-panel reservas-list-panel">
            <div class="branches-toolbar reservas-list-toolbar">
                <span class="tarifas-note">
                    La factura inicial se emite tras la salida; la complementaria tras la entrada.
                </span>

                <button type="button" id="nueva-factura" class="btn-primary">
                    <i data-lucide="receipt"></i>
                    Nueva factura inicial
                </button>
            </div>

            <div class="branches-table-container">
                <table class="branches-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Contrato</th>
                            <th>Tipo</th>
                            <th>Total</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="facturas-table-body">
                        <tr>
                            <td colspan="6">Cargando facturas...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    `;

    document.getElementById("nueva-factura")
        .addEventListener("click", abrirModalFacturaInicial);

    if (window.lucide) {
        window.lucide.createIcons();
    }

    cargarFacturas();
    }

    async function cargarFacturas() {
        const tbody = document.getElementById("facturas-table-body");
        if (!tbody) return;

        try {
            const facturas = await window.facturasAPI.obtenerTodas();

            if (!tbody.isConnected) return;

            renderizarFacturas(facturas, tbody);

        } catch (error) {
            console.error("Error al cargar facturas:", error);

            if (tbody.isConnected) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6">
                            No se pudieron cargar las facturas. Verifica la conexión con el servidor.
                        </td>
                    </tr>
                `;
            }
        }
    }

    function renderizarFacturas(facturas, cuerpoTabla) {
        cuerpoTabla.replaceChildren();

        const formatoMoneda = new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP"
        });

        if (!Array.isArray(facturas) || facturas.length === 0) {
            const fila = cuerpoTabla.insertRow();
            const celda = fila.insertCell();
            celda.colSpan = 6;
            celda.textContent = "No hay facturas registradas.";
            fila.appendChild(celda);
            return;
        }

        facturas.forEach(factura => {
            const fila = cuerpoTabla.insertRow();

            const datos = [
                formatearCodigo("FAC", factura.id),
                formatearCodigo("CON", factura.contratoId),
                factura.tipo,
                formatoMoneda.format(factura.total ?? 0),
                factura.fecha
                    ? new Date(factura.fecha).toLocaleDateString("es-DO")
                    : "—"
            ];

            datos.forEach(dato => {
                const celda = fila.insertCell();
                celda.textContent = dato ?? "—";
            });

            const celdaAcciones = fila.insertCell();

            const botonVer = document.createElement("button");
            botonVer.type = "button";
            botonVer.className = "btn-search";
            botonVer.textContent = "Ver";
            botonVer.addEventListener("click", () => verDetalleFactura(factura));
            celdaAcciones.appendChild(botonVer);

            const botonPdf = document.createElement("button");
            botonPdf.type = "button";
            botonPdf.className = "btn-search";
            botonPdf.textContent = "PDF";
            botonPdf.addEventListener("click", () => descargarFacturaPdf(factura.id));
            celdaAcciones.appendChild(botonPdf);

            if (factura.tipo === "INICIAL") {
                const botonComplementaria = document.createElement("button");
                botonComplementaria.type = "button";
                botonComplementaria.className = "btn-search";
                botonComplementaria.textContent = "Complementaria";
                botonComplementaria.addEventListener(
                    "click",
                    () => abrirModalComplementaria(factura)
                );
                celdaAcciones.appendChild(botonComplementaria);
            }
        });
    }

    function descargarFacturaPdf(id) {
        window.open(`/api/v1/facturas/${encodeURIComponent(id)}/pdf`, "_blank");
    }

    function verDetalleFactura(factura) {
        if (document.getElementById("modal-detalle-factura")) return;

        const formatoMoneda = new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP"
        });

        const modal = document.createElement("div");
        modal.id = "modal-detalle-factura";
        modal.className = "modal-overlay";

        const filasDetalle = (factura.detalles ?? []).map(detalle => `
            <tr>
                <td>${detalle.concepto ?? "—"}</td>
                <td>${detalle.cantidad ?? 0}</td>
                <td>${formatoMoneda.format(detalle.precioUnitario ?? 0)}</td>
                <td>${formatoMoneda.format(detalle.subtotal ?? 0)}</td>
            </tr>
        `).join("");

        modal.innerHTML = `
        <div class="modal-container factura-detalle-modal" role="dialog"
             aria-modal="true" aria-labelledby="titulo-detalle-factura">
            <div class="modal-header">
                <div>
                    <h2 id="titulo-detalle-factura">Detalle de factura</h2>
                    <p>${formatearCodigo("FAC", factura.id)}</p>
                </div>
                <button type="button" class="modal-close"
                        id="cerrar-detalle-factura" aria-label="Cerrar">&times;</button>
            </div>

            <div class="modal-body">
                <div class="factura-resumen">
                    <div><span>Contrato</span><strong>${formatearCodigo("CON", factura.contratoId)}</strong></div>
                    <div><span>Tipo</span><strong>${factura.tipo}</strong></div>
                    <div><span>Subtotal</span><strong>${formatoMoneda.format(factura.subtotal ?? 0)}</strong></div>
                    <div><span>Cargos</span><strong>${formatoMoneda.format(factura.cargos ?? 0)}</strong></div>
                    <div><span>Impuestos</span><strong>${formatoMoneda.format(factura.impuestos ?? 0)}</strong></div>
                    <div><span>Total</span><strong>${formatoMoneda.format(factura.total ?? 0)}</strong></div>
                </div>

                <div class="branches-table-container">
                    <table class="branches-table">
                        <thead>
                            <tr>
                                <th>Concepto</th>
                                <th>Cantidad</th>
                                <th>Precio unitario</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filasDetalle || '<tr><td colspan="4">Sin detalles.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn-secondary" id="cerrar-detalle-factura-btn">Cerrar</button>
            </div>
        </div>
    `;

        document.body.appendChild(modal);

        const cerrar = () => {
            document.removeEventListener("keydown", cerrarConEscape);
            modal.remove();
        };

        const cerrarConEscape = evento => {
            if (evento.key === "Escape") cerrar();
        };

        document.addEventListener("keydown", cerrarConEscape);
        document.getElementById("cerrar-detalle-factura").addEventListener("click", cerrar);
        document.getElementById("cerrar-detalle-factura-btn").addEventListener("click", cerrar);
        modal.addEventListener("click", evento => {
            if (evento.target === modal) cerrar();
        });
    }

    function abrirModalFacturaInicial() {
        if (document.getElementById("modal-factura-inicial")) return;

        const modal = document.createElement("div");
        modal.id = "modal-factura-inicial";
        modal.className = "modal-overlay";

        modal.innerHTML = `
        <div class="modal-container" role="dialog"
             aria-modal="true" aria-labelledby="titulo-factura-inicial">
            <div class="modal-header">
                <div>
                    <h2 id="titulo-factura-inicial">Nueva factura inicial</h2>
                    <p>Emite la factura inicial de un contrato con inspección de salida.</p>
                </div>
                <button type="button" class="modal-close"
                        id="cerrar-factura-inicial" aria-label="Cerrar formulario">&times;</button>
            </div>

            <form id="form-factura-inicial">
                <div class="modal-body">
                    <div class="form-group">
                        <label for="factura-contrato">Número de contrato *</label>
                        <input type="number" id="factura-contrato" min="1" step="1" required>
                    </div>

                    <div class="form-group">
                        <label for="factura-devolucion">Fecha de devolución (opcional)</label>
                        <input type="date" id="factura-devolucion">
                    </div>

                    <p id="mensaje-factura-inicial" class="form-message" role="alert"></p>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn-secondary" id="cancelar-factura-inicial">Cancelar</button>
                    <button type="submit" class="btn-primary" id="guardar-factura-inicial">Emitir factura</button>
                </div>
            </form>
        </div>
    `;

        document.body.appendChild(modal);

        const formulario = document.getElementById("form-factura-inicial");
        const botonGuardar = document.getElementById("guardar-factura-inicial");
        const mensaje = document.getElementById("mensaje-factura-inicial");

        const cerrar = () => {
            document.removeEventListener("keydown", cerrarConEscape);
            modal.remove();
        };

        const cerrarConEscape = evento => {
            if (evento.key === "Escape") cerrar();
        };

        document.addEventListener("keydown", cerrarConEscape);
        document.getElementById("cerrar-factura-inicial").addEventListener("click", cerrar);
        document.getElementById("cancelar-factura-inicial").addEventListener("click", cerrar);
        modal.addEventListener("click", evento => {
            if (evento.target === modal) cerrar();
        });

        formulario.addEventListener("submit", async evento => {
            evento.preventDefault();

            const contratoId = Number(
                document.getElementById("factura-contrato").value
            );
            const fechaDevolucion = document.getElementById("factura-devolucion").value || null;

            if (!Number.isSafeInteger(contratoId) || contratoId < 1) {
                mensaje.textContent = "Introduce un número de contrato válido.";
                return;
            }

            botonGuardar.disabled = true;
            botonGuardar.textContent = "Emitiendo...";
            mensaje.textContent = "";

            try {
                const factura = await window.facturasAPI.crear({
                    contratoId,
                    fechaDevolucion
                });

                cerrar();

                mostrarModalExito(
                    "¡Factura emitida!",
                    "La factura inicial se ha emitido correctamente.",
                    formatearCodigo("FAC", factura.id)
                );

                if (location.hash === "#facturacion") {
                    await cargarFacturas();
                }

            } catch (error) {
                console.error("Error al emitir factura:", error);
                mensaje.textContent = `No se pudo emitir la factura: ${error.message}`;

            } finally {
                if (botonGuardar.isConnected) {
                    botonGuardar.disabled = false;
                    botonGuardar.textContent = "Emitir factura";
                }
            }
        });

        document.getElementById("factura-contrato").focus();
    }

    function abrirModalComplementaria(facturaInicial) {
        if (document.getElementById("modal-factura-complementaria")) return;

        const modal = document.createElement("div");
        modal.id = "modal-factura-complementaria";
        modal.className = "modal-overlay";

        modal.innerHTML = `
        <div class="modal-container" role="dialog"
             aria-modal="true" aria-labelledby="titulo-factura-complementaria">
            <div class="modal-header">
                <div>
                    <h2 id="titulo-factura-complementaria">Factura complementaria</h2>
                    <p>De ${formatearCodigo("FAC", facturaInicial.id)} · contrato ${formatearCodigo("CON", facturaInicial.contratoId)}</p>
                </div>
                <button type="button" class="modal-close"
                        id="cerrar-factura-complementaria" aria-label="Cerrar">&times;</button>
            </div>

            <form id="form-factura-complementaria">
                <div class="modal-body">
                    <div class="form-group">
                        <label for="complementaria-devolucion">Fecha de devolución (opcional)</label>
                        <input type="date" id="complementaria-devolucion">
                    </div>

                    <p id="mensaje-factura-complementaria" class="form-message" role="alert"></p>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn-secondary" id="cancelar-factura-complementaria">Cancelar</button>
                    <button type="submit" class="btn-primary" id="guardar-factura-complementaria">Emitir complementaria</button>
                </div>
            </form>
        </div>
    `;

        document.body.appendChild(modal);

        const formulario = document.getElementById("form-factura-complementaria");
        const botonGuardar = document.getElementById("guardar-factura-complementaria");
        const mensaje = document.getElementById("mensaje-factura-complementaria");

        const cerrar = () => {
            document.removeEventListener("keydown", cerrarConEscape);
            modal.remove();
        };

        const cerrarConEscape = evento => {
            if (evento.key === "Escape") cerrar();
        };

        document.addEventListener("keydown", cerrarConEscape);
        document.getElementById("cerrar-factura-complementaria").addEventListener("click", cerrar);
        document.getElementById("cancelar-factura-complementaria").addEventListener("click", cerrar);
        modal.addEventListener("click", evento => {
            if (evento.target === modal) cerrar();
        });

        formulario.addEventListener("submit", async evento => {
            evento.preventDefault();

            const fechaDevolucion = document.getElementById("complementaria-devolucion").value || null;

            botonGuardar.disabled = true;
            botonGuardar.textContent = "Emitiendo...";
            mensaje.textContent = "";

            try {
                const factura = await window.facturasAPI.crearComplementaria(
                    facturaInicial.id,
                    { fechaDevolucion }
                );

                cerrar();

                mostrarModalExito(
                    "¡Complementaria emitida!",
                    "La factura complementaria se ha emitido correctamente.",
                    formatearCodigo("FAC", factura.id)
                );

                if (location.hash === "#facturacion") {
                    await cargarFacturas();
                }

            } catch (error) {
                console.error("Error al emitir complementaria:", error);
                mensaje.textContent = `No se pudo emitir la complementaria: ${error.message}`;

            } finally {
                if (botonGuardar.isConnected) {
                    botonGuardar.disabled = false;
                    botonGuardar.textContent = "Emitir complementaria";
                }
            }
        });
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

                    mostrarModalExito(
                        "¡Reserva registrada!",
                        "La reserva se ha registrado correctamente en el sistema.",
                        formatearCodigo("RES", reserva.id)
                    );

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
            const clienteRegistrado =
                await window.clientesAPI.registrar(cliente);

            cerrar();

            mostrarModalExito(
                "¡Cliente registrado!",
                "El cliente se ha registrado correctamente en el sistema.",
                clienteRegistrado?.id != null
                    ? formatearCodigo("CLI", clienteRegistrado.id)
                    : ""
            );

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
            const licenciaRegistrada =
                await window.clientesAPI.registrarLicencia(licencia);

            cerrar();

            await abrirModalLicencias(cliente);

            mostrarModalExito(
                "¡Licencia registrada!",
                "La licencia de conducir se ha asociado correctamente al cliente.",
                licenciaRegistrada?.id != null
                    ? formatearCodigo("LIC", licenciaRegistrada.id)
                    : ""
            );

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
            formatearCodigo("CLI", cliente.id),
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
                const sucursalRegistrada =
                    await window.sucursalesAPI.crear(sucursal);

                cerrar();

                mostrarModalExito(
                    "¡Sucursal registrada!",
                    "La sucursal se ha registrado correctamente en el sistema.",
                    sucursalRegistrada?.id != null
                        ? formatearCodigo("SUC", sucursalRegistrada.id)
                        : ""
                );

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
                formatearCodigo("SUC", sucursal.id),
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
                formatearCodigo("VEH", vehiculo.id),
                vehiculo.placa,
                vehiculo.marca,
                vehiculo.modelo,
                vehiculo.anio,
                nombresSucursales.get(vehiculo.sucursalId)
                ?? formatearCodigo("SUC", vehiculo.sucursalId),
                vehiculo.kilometraje
            ];

            valores.forEach((valor, indice) => {
                const celda = fila.insertCell();
                celda.textContent = valor ?? "—";

                if (indice === 0) {
                    celda.classList.add("registro-codigo");
                }
            });

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
                const vehiculoRegistrado =
                    await window.vehiculosAPI.registrar(vehiculo);

                cerrar();

                mostrarModalExito(
                    "¡Vehículo registrado!",
                    "El vehículo se ha registrado correctamente en la flota.",
                    vehiculoRegistrado?.id != null
                        ? formatearCodigo("VEH", vehiculoRegistrado.id)
                        : ""
                );

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

