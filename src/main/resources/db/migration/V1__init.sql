-- V1: esquema inicial Rent-a-Car (RF-01 a RF-06).
-- Por que: Flyway manda y JPA valida; este script es la fuente de verdad del modelo relacional.
-- Orden de creacion respeta FK: sucursal -> empleado/tipo -> tarifa/vehiculo -> cliente -> licencia -> reserva -> contrato -> inspeccion -> factura.

CREATE TABLE SUCURSAL (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(120) NOT NULL,
    direccion NVARCHAR(250) NULL,
    telefono NVARCHAR(40) NULL,
    activo BIT NOT NULL DEFAULT 1
);

-- Por que: tabla pedida por el usuario para fase de autenticacion (login con username/password hasheado Bcrypt 255 chars,
-- rol ADMINISTRADOR/AGENTE/MECANICO y activo para bloquear sin borrar historial). Adaptada al esquema existente:
-- id BIGINT (no INT), sucursal_id BIGINT (no INT) y SUCURSAL(id) (no id_sucursal) para mantener tipos/claves consistentes.
CREATE TABLE EMPLEADO (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    sucursal_id BIGINT NOT NULL FOREIGN KEY REFERENCES SUCURSAL(id),
    nombre NVARCHAR(100) NOT NULL,
    username NVARCHAR(50) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    rol NVARCHAR(50) NOT NULL,
    activo BIT NOT NULL DEFAULT 1
);

CREATE TABLE TIPO_VEHICULO (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(80) NOT NULL UNIQUE,
    activo BIT NOT NULL DEFAULT 1
);

CREATE TABLE TARIFA (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    tipo_vehiculo_id BIGINT NOT NULL FOREIGN KEY REFERENCES TIPO_VEHICULO(id),
    precio_por_dia DECIMAL(12,2) NOT NULL CHECK (precio_por_dia > 0),
    activo BIT NOT NULL DEFAULT 1
);
-- Por que: una sola tarifa activa por tipo (RF-01.2) mediante indice filtrado.
CREATE UNIQUE INDEX UX_TARIFA_TIPO_ACTIVA ON TARIFA(tipo_vehiculo_id) WHERE activo = 1;

CREATE TABLE VEHICULO (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    placa NVARCHAR(20) NOT NULL UNIQUE,
    marca NVARCHAR(80) NULL,
    modelo NVARCHAR(80) NULL,
    anio INT NULL,
    tipo_vehiculo_id BIGINT NOT NULL FOREIGN KEY REFERENCES TIPO_VEHICULO(id),
    sucursal_id BIGINT NOT NULL FOREIGN KEY REFERENCES SUCURSAL(id),
    estado NVARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE',
    kilometraje INT NOT NULL DEFAULT 0 CHECK (kilometraje >= 0)
);

CREATE TABLE CLIENTE (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    documento NVARCHAR(30) NOT NULL UNIQUE,
    nombre NVARCHAR(120) NOT NULL,
    apellido NVARCHAR(120) NULL,
    email NVARCHAR(150) NULL,
    telefono NVARCHAR(40) NULL,
    activo BIT NOT NULL DEFAULT 1
);

CREATE TABLE LICENCIA (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    cliente_id BIGINT NOT NULL FOREIGN KEY REFERENCES CLIENTE(id),
    numero NVARCHAR(30) NOT NULL UNIQUE,
    fecha_expiracion DATE NOT NULL,
    categoria NVARCHAR(10) NULL,
    activa BIT NOT NULL DEFAULT 1
);

CREATE TABLE RESERVA (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    cliente_id BIGINT NOT NULL FOREIGN KEY REFERENCES CLIENTE(id),
    vehiculo_id BIGINT NOT NULL FOREIGN KEY REFERENCES VEHICULO(id),
    licencia_id BIGINT NOT NULL FOREIGN KEY REFERENCES LICENCIA(id),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado NVARCHAR(20) NOT NULL DEFAULT 'CONFIRMADA',
    total_estimado DECIMAL(12,2) NULL,
    CONSTRAINT CK_RESERVA_RANGO CHECK (fecha_fin >= fecha_inicio)
);

CREATE TABLE CONTRATO (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    reserva_id BIGINT NOT NULL UNIQUE FOREIGN KEY REFERENCES RESERVA(id),
    empleado_id BIGINT NOT NULL FOREIGN KEY REFERENCES EMPLEADO(id),
    monto_garantia DECIMAL(12,2) NULL DEFAULT 0,
    total_estimado DECIMAL(12,2) NULL,
    estado NVARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    fecha_creacion DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

CREATE TABLE INSPECCION (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    contrato_id BIGINT NOT NULL FOREIGN KEY REFERENCES CONTRATO(id),
    empleado_id BIGINT NOT NULL FOREIGN KEY REFERENCES EMPLEADO(id),
    tipo NVARCHAR(10) NOT NULL CHECK (tipo IN ('SALIDA','ENTRADA')),
    kilometraje INT NOT NULL CHECK (kilometraje >= 0),
    nivel_combustible NVARCHAR(15) NOT NULL,
    observaciones NVARCHAR(MAX) NULL,
    fecha DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    -- Por que: RF-05.3 maximo una salida y una entrada por contrato.
    CONSTRAINT UQ_INSPECCION_CONTRATO_TIPO UNIQUE (contrato_id, tipo)
);

CREATE TABLE FACTURA (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    contrato_id BIGINT NOT NULL UNIQUE FOREIGN KEY REFERENCES CONTRATO(id),
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    cargos DECIMAL(12,2) NOT NULL DEFAULT 0,
    impuestos DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    fecha DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

CREATE TABLE FACTURA_DETALLE (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    factura_id BIGINT NOT NULL FOREIGN KEY REFERENCES FACTURA(id) ON DELETE CASCADE,
    concepto NVARCHAR(250) NOT NULL,
    cantidad DECIMAL(12,2) NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(12,2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE PARAMETRO_FACTURACION (
    clave NVARCHAR(60) PRIMARY KEY,
    valor NVARCHAR(60) NOT NULL
);
-- Por que: valores por defecto que espejan BillingProperties; en prod esta tabla manda.
INSERT INTO PARAMETRO_FACTURACION (clave, valor) VALUES
('ITBIS_PERCENT','18'),
('PRECIO_POR_NIVEL_COMBUSTIBLE','1500'),
('PRECIO_KM_EXTRA','50'),
('KM_INCLUIDO_POR_DIA','200'),
('RECARGO_DANIO','8000'),
('RECARGO_RETRASO_DIA','1000');
