package com.project.rent_a_car_api.domain.model;

/**
 * Nivel de combustible con orden ordinal para comparar salida vs entrada (RF-05.5).
 * <p>
 * Por que: el orden LLENO mayor que RESERVA permite calcular niveles faltantes
 * como diferencia de ordinales sin logica dispersa.
 */
public enum NivelCombustible {
    RESERVA,
    CUARTO,
    MEDIO,
    TRES_CUARTOS,
    LLENO;

    /**
     * Convierte texto libre a enum.
     * Por que: la API recibe "3/4", "1/2" y debe normalizarlos.
     */
    public static NivelCombustible desdeTexto(String texto) {
        if (texto == null) {
            return null;
        }
        String t = texto.trim().toUpperCase();
        return switch (t) {
            case "LLENO" -> LLENO;
            case "3/4", "TRES_CUARTOS", "TRES CUARTOS" -> TRES_CUARTOS;
            case "1/2", "MEDIO", "MITAD" -> MEDIO;
            case "1/4", "CUARTO" -> CUARTO;
            case "RESERVA", "VACIO", "E" -> RESERVA;
            default -> null;
        };
    }

    /**
     * Calcula niveles faltantes devueltos por debajo de la salida.
     * Por que: cada escalon genera un cargo fijo segun BillingProperties.
     */
    public int nivelesFaltantesVs(NivelCombustible salida) {
        if (salida == null || this == null) {
            return 0;
        }
        int diff = salida.ordinal() - this.ordinal();
        return Math.max(0, diff);
    }
}
