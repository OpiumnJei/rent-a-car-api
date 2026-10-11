-- Bootstrap de la base de datos (ejecutar UNA vez contra master).
-- Por que: JDBC y Flyway crean tablas, no la base; sin RentACarDB el arranque
-- falla con "Cannot open database". Ejecutar con sqlcmd tras levantar compose:
--   sqlcmd -S localhost,1433 -U sa -P verYs3cret -Q "CREATE DATABASE RentACarDB"
IF DB_ID('RentACarDB') IS NULL
BEGIN
    CREATE DATABASE RentACarDB;
END
GO
