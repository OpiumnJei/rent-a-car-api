const API_BASE_URL = "/api/v1";

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    if (!response.ok) {
        throw new Error(
            `Error al comunicarse con el servidor: ${response.status}`
        );
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

const sucursalesAPI = {

    obtenerTodas: async () => {
        return apiRequest("/sucursales?soloActivas=false");
    },

    obtenerActivas: async () => {
        return apiRequest("/sucursales?soloActivas=true");
    },

    crear: async (sucursal) => {
        return apiRequest("/sucursales", {
            method: "POST",
            body: JSON.stringify(sucursal)
        });
    }

};

window.sucursalesAPI = sucursalesAPI;