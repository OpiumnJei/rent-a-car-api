-- V2: factura inicial + complementaria (flujo de cobro antes de entregar).
-- Por que: el negocio cobra antes de entregar el vehiculo, asi que la factura inicial
-- se emite tras la inspeccion de SALIDA (cargos = 0) y los cargos de la devolucion
-- van en una factura COMPLEMENTARIA vinculada a la inicial (documento fiscal inmutable).
-- Se relaja el UNIQUE(contrato_id) a "una sola INICIAL por contrato" y se agrega
-- tipo + factura_origen_id (FK autocontenida, null solo en la inicial).

-- Por que con SQL dinamico: el UNIQUE inline del V1 tiene nombre autogenerado (UQ__...),
-- asi que se busca en el catalogo en vez de hardcodearlo.
DECLARE @uq NVARCHAR(128);
SELECT @uq = kc.name
FROM sys.key_constraints kc
INNER JOIN sys.tables t ON kc.parent_object_id = t.object_id
WHERE t.name = 'FACTURA' AND kc.type = 'UQ';
IF @uq IS NOT NULL
    EXEC(N'ALTER TABLE FACTURA DROP CONSTRAINT [' + @uq + ']');
GO

-- Por que DEFAULT 'INICIAL': las facturas ya emitidas (si existen) quedan como iniciales.
ALTER TABLE FACTURA
    ADD tipo NVARCHAR(20) NOT NULL CONSTRAINT DF_FACTURA_TIPO DEFAULT 'INICIAL',
        factura_origen_id BIGINT NULL CONSTRAINT FK_FACTURA_ORIGEN REFERENCES FACTURA(id);
GO

ALTER TABLE FACTURA
    ADD CONSTRAINT CK_FACTURA_TIPO CHECK (tipo IN ('INICIAL', 'COMPLEMENTARIA'));
GO

-- Por que indice filtrado: preserva la invariante "una inicial por contrato"
-- permitiendo N complementarias del mismo contrato.
CREATE UNIQUE INDEX UX_FACTURA_INICIAL_POR_CONTRATO ON FACTURA(contrato_id) WHERE tipo = 'INICIAL';
GO
