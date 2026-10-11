# Habilita TCP/IP + puerto 1433 en .\SQLEXPRESS y arranca SQL Browser.
# Por que: JDBC solo habla TCP; la instancia estaba solo en Shared Memory y el
# Browser detenido, por eso el driver fallaba con timeout UDP 1434.
# EJECUTAR como Administrador: clic derecho en PowerShell -> Ejecutar como
# administrador -> .\scripts\enable-tcp-sqlexpress.ps1
#Requires -RunAsAdministrator

$ErrorActionPreference = 'Stop'
$instanceKey = 'MSSQL17.SQLEXPRESS'
$tcpRoot = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\$instanceKey\MSSQLServer\SuperSocketNetLib\Tcp"

Write-Host "1/4 Habilitando TCP/IP en $instanceKey..."
Set-ItemProperty -Path $tcpRoot -Name 'Enabled' -Value 1 -Type DWord
$ipAll = Join-Path $tcpRoot 'IPAll'
Set-ItemProperty -Path $ipAll -Name 'TcpPort' -Value '1433'
Set-ItemProperty -Path $ipAll -Name 'TcpDynamicPorts' -Value ''
Get-ChildItem -Path $tcpRoot | Where-Object { $_.PSChildName -like 'IP*' } | ForEach-Object {
    Set-ItemProperty -Path $_.PSPath -Name 'Enabled' -Value 1 -Type DWord -ErrorAction SilentlyContinue
}

Write-Host '2/4 Regla de firewall TCP 1433 (solo si no existe)...'
if (-not (Get-NetFirewallRule -DisplayName 'SQL Server SQLEXPRESS 1433' -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -DisplayName 'SQL Server SQLEXPRESS 1433' -Direction Inbound -Protocol TCP -LocalPort 1433 -Action Allow | Out-Null
}

Write-Host '3/4 SQL Browser en Manual + arranque...'
Set-Service -Name 'SQLBrowser' -StartupType Manual
Start-Service -Name 'SQLBrowser'

Write-Host '4/4 Reiniciando MSSQL$SQLEXPRESS...'
Restart-Service -Name 'MSSQL$SQLEXPRESS' -Force
Start-Sleep -Seconds 5

Write-Host 'Verificando (nombre de instancia y puerto directo)...'
sqlcmd -S 'localhost\SQLEXPRESS' -U sa -P Jg301102__ -Q "SELECT 'instancia OK' AS estado"
sqlcmd -S 'localhost,1433' -U sa -P Jg301102__ -Q "SELECT 'puerto OK' AS estado"
Write-Host 'Listo. Ya puedes arrancar la API con .\mvnw.cmd spring-boot:run'
