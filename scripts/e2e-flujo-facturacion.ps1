# E2E del flujo de cobro en dos tiempos: inicial tras salida + complementaria tras entrada.
# Por que: script reutilizable que valida el diseno acordado contra la API real;
# usa sufijo unico para no chocar con datos de pruebas anteriores.
$ErrorActionPreference = 'Stop'
$base = 'http://localhost:8080/api/v1'
$sfx = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds().ToString().Substring(6)

function Post($url, $body) {
    return Invoke-RestMethod -Uri "$base$url" -Method Post -ContentType 'application/json' `
        -Body ($body | ConvertTo-Json -Depth 5)
}

$suc = Post '/sucursales' @{ nombre = "Sucursal E2E $sfx"; direccion = 'Calle 1'; telefono = '8090000000' }
$emp = Post '/empleados' @{ sucursalId = $suc.id; nombre = 'Agente E2E'; username = "agente$sfx"; password = 'Clave123*'; rol = 'AGENTE' }
$tipo = Post '/tipos-vehiculo' @{ nombre = "SUV-E2E-$sfx" }
$tar = Post '/tarifas' @{ tipoVehiculoId = $tipo.id; precioPorDia = 5000 }
$veh = Post '/vehiculos' @{ placa = "E2E$sfx"; marca = 'Toyota'; modelo = 'RAV4'; anio = 2023; tipoVehiculoId = $tipo.id; sucursalId = $suc.id; kilometraje = 10000 }
$cli = Post '/clientes' @{ documento = "402000$sfx"; nombre = 'Juan'; apellido = 'Perez'; email = "juan$sfx@mail.com"; telefono = '8091111111' }
$lic = Post '/licencias' @{ clienteId = $cli.id; numero = "LIC$sfx"; fechaExpiracion = '2028-05-01'; categoria = 'B' }
$res = Post '/reservas' @{ clienteId = $cli.id; vehiculoId = $veh.id; licenciaId = $lic.id; fechaInicio = '2026-11-01'; fechaFin = '2026-11-03' }
$con = Post '/contratos' @{ reservaId = $res.id; empleadoId = $emp.id; montoGarantia = 5000 }
$sal = Post '/inspecciones' @{ contratoId = $con.id; empleadoId = $emp.id; tipo = 'SALIDA'; kilometraje = 10000; nivelCombustible = 'LLENO'; observaciones = 'Sin detalles' }

# Inicial: 3 dias x 5000 = 15000 + ITBIS 2700 = 17700, cargos 0.
$ini = Post '/facturas' @{ contratoId = $con.id }
Write-Output "INICIAL tipo=$($ini.tipo) subtotal=$($ini.subtotal) cargos=$($ini.cargos) impuestos=$($ini.impuestos) total=$($ini.total)"
if ($ini.tipo -ne 'INICIAL' -or $ini.cargos -ne 0 -or $ini.total -ne 17700) { throw "Inicial inesperada: $($ini | ConvertTo-Json)" }

# Duplicada debe dar 409.
try {
    Post '/facturas' @{ contratoId = $con.id } | Out-Null
    throw 'Debio fallar la inicial duplicada'
} catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 409) { throw "Duplicada dio codigo inesperado: $($_.Exception.Message)" }
    Write-Output 'DUPLICADA -> 409 OK'
}

# Entrada: 300 km (incluidos 600, sin extra), 1/2 (2 niveles x 1500 = 3000) + dano 8000 = 11000 + ITBIS 1980 = 12980.
$ent = Post '/inspecciones' @{ contratoId = $con.id; empleadoId = $emp.id; tipo = 'ENTRADA'; kilometraje = 10300; nivelCombustible = '1/2'; observaciones = 'Rayadura con dano en puerta' }
$comp = Post "/facturas/$($ini.id)/complementaria" @{ fechaDevolucion = '2026-11-03' }
Write-Output "COMPLEMENTARIA tipo=$($comp.tipo) origen=$($comp.facturaOrigenId) cargos=$($comp.cargos) total=$($comp.total)"
if ($comp.tipo -ne 'COMPLEMENTARIA' -or $comp.facturaOrigenId -ne $ini.id -or $comp.cargos -ne 11000 -or $comp.total -ne 12980) { throw "Complementaria inesperada: $($comp | ConvertTo-Json)" }

# PDFs de ambas.
foreach ($f in @($ini.id, $comp.id)) {
    $pdf = Invoke-WebRequest -Uri "$base/facturas/$f/pdf" -UseBasicParsing
    $cabecera = [Text.Encoding]::ASCII.GetString($pdf.Content[0..3])
    Write-Output "PDF factura ${f}: $($pdf.StatusCode) bytes=$($pdf.RawContentLength) cabecera=$cabecera"
    if ($cabecera -ne '%PDF') { throw "PDF invalido para factura $f" }
}
Write-Output 'E2E OK'
