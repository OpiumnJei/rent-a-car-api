
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

           return;
        }        
        if (nombre === "sucursales") {
           mostrarSucursales();
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

    async function mostrarSucursales() {
    contenido.innerHTML = `
        <section class="page-header">
            <div>
                <h1>Sucursales</h1>
                <p class="page-description">
                    Administración de los puntos de operación.
                </p>
            </div>
        </section>

        <section class="content-panel branches-panel">
        <div class="branches-toolbar">

          <div class="branches-search">

            <input
              type="search"
              id="buscar-sucursal"
              placeholder="Buscar sucursal..."
              aria-label="Buscar sucursal"
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
          <i data-lucide="plus"></i>
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

        // Evita actualizar una pantalla que ya no está abierta.
        if (!cuerpoTabla.isConnected) return;

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
});

