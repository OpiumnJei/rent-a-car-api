# Guía Docker — Rent-a-Car API

Levanta todo el backend (API + SQL Server + base creada + migraciones) con un comando.

## 1. Programas necesarios

| Programa | Para qué | Dónde |
| --- | --- | --- |
| Docker Desktop (Windows, con backend WSL2) | Contenedores | Sitio oficial de Docker (docs.docker.com) |
| (Opcional) SSMS o Azure Data Studio | Consultar la BD | SSMS desde el sitio de Microsoft |
| (Opcional) Git | Clonar el proyecto | git-scm.com |

Requisitos mínimos: 8 GB de RAM (SQL Server pide ~2 GB) y virtualización activada en la BIOS.

> Si vienes del modo local: detén tu ejecución del IDE o tu `SQLEXPRESS` no molesta,
> pero el run del IDE **sí** ocupa el puerto `8080`. Detenlo antes del `up`.

## 2. Puesta en marcha (un comando)

Desde la raíz del proyecto (donde están `compose.yaml` y `Dockerfile`):

```powershell
docker compose up --build
```

Primer arranque tarda 5–10 min (descarga SQL Server ~1.4 GB, compila el jar y Flyway
aplica V1+V2). Verás `Started RentACarApiApplication` en el log de `api`.

En segundo plano:

```powershell
docker compose up --build -d
docker compose ps        # sqlserver Up (healthy) | db-init Exited (0) | api Up
docker compose logs -f api   # ver el arranque en vivo (Ctrl+C para salir)
```

## 3. Verificar que todo funciona

- Swagger: http://localhost:8080/swagger-ui.html
- Health rápido: http://localhost:8080/api/v1/sucursales → `[]`
- BD en SSMS: servidor `localhost,14333`, login `sa`, password `verYs3cret`,
  base `RentACarDB` (tablas `SUCURSAL`, `EMPLEADO`, `FACTURA`, ...).
- Por consola: `docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P verYs3cret -C -Q "SELECT name FROM sys.databases"`

## 4. Comandos útiles

```powershell
docker compose stop          # apaga sin borrar nada
docker compose start         # enciende de nuevo
docker compose down          # apaga y borra contenedores/red (los DATOS quedan en el volumen)
docker compose down -v       # además borra los datos (arranque 100% limpio)
docker compose up --build api    # reconstruir solo la api tras cambiar código
docker compose logs api          # ver logs de la api
docker compose restart api       # reiniciar solo la api
```

## 5. Cambiar el password de `sa` (opcional)

```powershell
$env:DB_PASSWORD='MiClave123*'; docker compose up --build -d
```

Vale para `sqlserver`, `db-init` y la `api` a la vez. En SSMS usa esa misma clave.
La configuración de `application.properties` no se toca: el contenedor la pisa
solo con variables `SPRING_*`.

## 6. Problemas comunes

| Síntoma | Causa y solución |
| --- | --- |
| `Port 8080 was already in use` | Tienes el run del IDE u otro proceso en el 8080. Detenlo y repite el `up`. |
| `sqlserver-1 is unhealthy` | Espera 2–3 min (primer arranque es lento). Si persiste: `docker compose logs sqlserver` y revisa errores de password. |
| `dependency failed to start` | Consecuencia del anterior: sin `sqlserver` sano no arrancan `db-init`/`api`. |
| Arranque muy lento la 1.ª vez | Normal: descarga imágenes + Maven compila. Los siguientes `up` son rápidos (caché). |
| `Cannot open database RentACarDB` | `db-init` no terminó en 0: `docker compose logs db-init`. |
