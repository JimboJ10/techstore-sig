-- ============================================
-- TECHSTORE SMART COMMERCE S.A.
-- Script 01: Creación de tablas
-- Base de datos: Oracle Free (FREEPDB1)
-- Usuario: techstore
-- ============================================

-- 1. ROL
CREATE SEQUENCE seq_rol START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE TABLE ROL (
    id_rol       NUMBER DEFAULT seq_rol.NEXTVAL PRIMARY KEY,
    nombre_rol   VARCHAR2(50) NOT NULL,
    descripcion  VARCHAR2(200)
);

-- 2. USUARIO
CREATE SEQUENCE seq_usuario START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE TABLE USUARIO (
    id_usuario      NUMBER DEFAULT seq_usuario.NEXTVAL PRIMARY KEY,
    id_rol          NUMBER NOT NULL,
    nombre_usuario  VARCHAR2(100) NOT NULL,
    correo          VARCHAR2(150) NOT NULL UNIQUE,
    password_hash   VARCHAR2(255) NOT NULL,
    totp_secret     VARCHAR2(100),
    activo          NUMBER(1) DEFAULT 1 CHECK (activo IN (0,1)),
    fecha_creacion  DATE DEFAULT SYSDATE,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES ROL(id_rol)
);

-- 3. EMPLEADO
CREATE SEQUENCE seq_empleado START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE TABLE EMPLEADO (
    id_empleado  NUMBER DEFAULT seq_empleado.NEXTVAL PRIMARY KEY,
    id_usuario   NUMBER NOT NULL,
    nombres      VARCHAR2(100) NOT NULL,
    apellidos    VARCHAR2(100) NOT NULL,
    cargo        VARCHAR2(80),
    telefono     VARCHAR2(20),
    CONSTRAINT fk_empleado_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
);

-- 4. CLIENTE
CREATE SEQUENCE seq_cliente START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE TABLE CLIENTE (
    id_cliente      NUMBER DEFAULT seq_cliente.NEXTVAL PRIMARY KEY,
    nombres         VARCHAR2(100) NOT NULL,
    apellidos       VARCHAR2(100) NOT NULL,
    correo          VARCHAR2(150) UNIQUE,
    telefono        VARCHAR2(20),
    direccion       VARCHAR2(250),
    fecha_registro  DATE DEFAULT SYSDATE
);

-- 5. CATEGORIA
CREATE SEQUENCE seq_categoria START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE TABLE CATEGORIA (
    id_categoria      NUMBER DEFAULT seq_categoria.NEXTVAL PRIMARY KEY,
    nombre_categoria  VARCHAR2(100) NOT NULL,
    descripcion       VARCHAR2(200)
);

-- 6. MARCA
CREATE SEQUENCE seq_marca START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE TABLE MARCA (
    id_marca      NUMBER DEFAULT seq_marca.NEXTVAL PRIMARY KEY,
    nombre_marca  VARCHAR2(100) NOT NULL,
    pais_origen   VARCHAR2(80)
);

-- 7. PRODUCTO
CREATE SEQUENCE seq_producto START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE TABLE PRODUCTO (
    id_producto      NUMBER DEFAULT seq_producto.NEXTVAL PRIMARY KEY,
    id_categoria     NUMBER NOT NULL,
    id_marca         NUMBER NOT NULL,
    nombre_producto  VARCHAR2(150) NOT NULL,
    descripcion      CLOB,
    precio_unitario  NUMBER(10,2) NOT NULL,
    codigo_barras    VARCHAR2(50) UNIQUE,
    activo           NUMBER(1) DEFAULT 1 CHECK (activo IN (0,1)),
    CONSTRAINT fk_producto_categoria FOREIGN KEY (id_categoria) REFERENCES CATEGORIA(id_categoria),
    CONSTRAINT fk_producto_marca FOREIGN KEY (id_marca) REFERENCES MARCA(id_marca)
);

-- 8. INVENTARIO
CREATE SEQUENCE seq_inventario START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE TABLE INVENTARIO (
    id_inventario        NUMBER DEFAULT seq_inventario.NEXTVAL PRIMARY KEY,
    id_producto          NUMBER NOT NULL UNIQUE,
    stock_actual         NUMBER DEFAULT 0 NOT NULL,
    stock_minimo         NUMBER DEFAULT 5 NOT NULL,
    stock_maximo         NUMBER DEFAULT 100 NOT NULL,
    ubicacion_bodega     VARCHAR2(80),
    fecha_actualizacion  DATE DEFAULT SYSDATE,
    CONSTRAINT fk_inventario_producto FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto)
);

-- 9. PROVEEDOR
CREATE SEQUENCE seq_proveedor START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE TABLE PROVEEDOR (
    id_proveedor    NUMBER DEFAULT seq_proveedor.NEXTVAL PRIMARY KEY,
    razon_social    VARCHAR2(150) NOT NULL,
    ruc             VARCHAR2(20) UNIQUE,
    correo          VARCHAR2(150),
    telefono        VARCHAR2(20),
    direccion       VARCHAR2(250),
    contacto_nombre VARCHAR2(100)
);

-- 10. METODO_PAGO
CREATE SEQUENCE seq_metodo_pago START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE TABLE METODO_PAGO (
    id_metodo_pago  NUMBER DEFAULT seq_metodo_pago.NEXTVAL PRIMARY KEY,
    nombre_metodo   VARCHAR2(80) NOT NULL,
    descripcion     VARCHAR2(200)
);

-- 11. PEDIDO
CREATE SEQUENCE seq_pedido START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE TABLE PEDIDO (
    id_pedido     NUMBER DEFAULT seq_pedido.NEXTVAL PRIMARY KEY,
    id_cliente    NUMBER NOT NULL,
    id_empleado   NUMBER NOT NULL,
    fecha_pedido  DATE DEFAULT SYSDATE,
    estado        VARCHAR2(30) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente','Pagado','En preparacion','Despachado','Entregado','Cancelado')),
    total         NUMBER(10,2) DEFAULT 0,
    observaciones VARCHAR2(500),
    CONSTRAINT fk_pedido_cliente FOREIGN KEY (id_cliente) REFERENCES CLIENTE(id_cliente),
    CONSTRAINT fk_pedido_empleado FOREIGN KEY (id_empleado) REFERENCES EMPLEADO(id_empleado)
);

-- 12. DETALLE_PEDIDO
CREATE SEQUENCE seq_detalle START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE TABLE DETALLE_PEDIDO (
    id_detalle      NUMBER DEFAULT seq_detalle.NEXTVAL PRIMARY KEY,
    id_pedido       NUMBER NOT NULL,
    id_producto     NUMBER NOT NULL,
    cantidad        NUMBER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMBER(10,2) NOT NULL,
    subtotal        NUMBER(10,2) NOT NULL,
    CONSTRAINT fk_detalle_pedido FOREIGN KEY (id_pedido) REFERENCES PEDIDO(id_pedido),
    CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto)
);

-- 13. PAGO
CREATE SEQUENCE seq_pago START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE TABLE PAGO (
    id_pago         NUMBER DEFAULT seq_pago.NEXTVAL PRIMARY KEY,
    id_pedido       NUMBER NOT NULL,
    id_metodo_pago  NUMBER NOT NULL,
    monto           NUMBER(10,2) NOT NULL,
    fecha_pago      DATE DEFAULT SYSDATE,
    referencia      VARCHAR2(100),
    estado_pago     VARCHAR2(30) DEFAULT 'Pendiente' CHECK (estado_pago IN ('Confirmado','Pendiente','Rechazado')),
    CONSTRAINT fk_pago_pedido FOREIGN KEY (id_pedido) REFERENCES PEDIDO(id_pedido),
    CONSTRAINT fk_pago_metodo FOREIGN KEY (id_metodo_pago) REFERENCES METODO_PAGO(id_metodo_pago)
);

-- 14. ENVIO
CREATE SEQUENCE seq_envio START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE TABLE ENVIO (
    id_envio                NUMBER DEFAULT seq_envio.NEXTVAL PRIMARY KEY,
    id_pedido               NUMBER NOT NULL,
    id_empleado             NUMBER NOT NULL,
    fecha_despacho          DATE,
    fecha_entrega_estimada  DATE,
    fecha_entrega_real      DATE,
    estado_envio            VARCHAR2(30) DEFAULT 'Pendiente' CHECK (estado_envio IN ('Pendiente','En preparacion','Despachado','Entregado')),
    tiempo_preparacion_min  NUMBER,
    CONSTRAINT fk_envio_pedido FOREIGN KEY (id_pedido) REFERENCES PEDIDO(id_pedido),
    CONSTRAINT fk_envio_empleado FOREIGN KEY (id_empleado) REFERENCES EMPLEADO(id_empleado)
);

-- 15. DEVOLUCION
CREATE SEQUENCE seq_devolucion START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE TABLE DEVOLUCION (
    id_devolucion    NUMBER DEFAULT seq_devolucion.NEXTVAL PRIMARY KEY,
    id_pedido        NUMBER NOT NULL,
    id_empleado      NUMBER NOT NULL,
    motivo           VARCHAR2(300),
    fecha_devolucion DATE DEFAULT SYSDATE,
    estado           VARCHAR2(30) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente','Aprobada','Rechazada')),
    CONSTRAINT fk_devolucion_pedido FOREIGN KEY (id_pedido) REFERENCES PEDIDO(id_pedido),
    CONSTRAINT fk_devolucion_empleado FOREIGN KEY (id_empleado) REFERENCES EMPLEADO(id_empleado)
);

-- 16. DISPOSITIVO_IOT
CREATE SEQUENCE seq_dispositivo START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE TABLE DISPOSITIVO_IOT (
    id_dispositivo     NUMBER DEFAULT seq_dispositivo.NEXTVAL PRIMARY KEY,
    nombre_dispositivo VARCHAR2(100) NOT NULL,
    tipo               VARCHAR2(50),
    ubicacion          VARCHAR2(100),
    activo             NUMBER(1) DEFAULT 1 CHECK (activo IN (0,1))
);

-- 17. LECTURA_IOT
CREATE SEQUENCE seq_lectura START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE TABLE LECTURA_IOT (
    id_lectura     NUMBER DEFAULT seq_lectura.NEXTVAL PRIMARY KEY,
    id_dispositivo NUMBER NOT NULL,
    id_producto    NUMBER NOT NULL,
    id_envio       NUMBER,
    codigo_leido   VARCHAR2(50),
    tipo_evento    VARCHAR2(30) CHECK (tipo_evento IN ('Despacho','Recepcion')),
    fecha_lectura  TIMESTAMP DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_lectura_dispositivo FOREIGN KEY (id_dispositivo) REFERENCES DISPOSITIVO_IOT(id_dispositivo),
    CONSTRAINT fk_lectura_producto FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto),
    CONSTRAINT fk_lectura_envio FOREIGN KEY (id_envio) REFERENCES ENVIO(id_envio)
);

-- 18. PROCESO_BPM
CREATE SEQUENCE seq_bpm START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE TABLE PROCESO_BPM (
    id_proceso               NUMBER DEFAULT seq_bpm.NEXTVAL PRIMARY KEY,
    id_proveedor             NUMBER NOT NULL,
    id_producto              NUMBER NOT NULL,
    cantidad_solicitada      NUMBER NOT NULL CHECK (cantidad_solicitada > 0),
    estado_proceso           VARCHAR2(50) DEFAULT 'Generado' CHECK (estado_proceso IN ('Generado','Aprobado','Enviado','Recibido','Cancelado')),
    fecha_inicio             DATE DEFAULT SYSDATE,
    fecha_aprobacion         DATE,
    fecha_recepcion          DATE,
    activado_automaticamente NUMBER(1) DEFAULT 0 CHECK (activado_automaticamente IN (0,1)),
    id_empleado_aprueba      NUMBER,
    CONSTRAINT fk_bpm_proveedor FOREIGN KEY (id_proveedor) REFERENCES PROVEEDOR(id_proveedor),
    CONSTRAINT fk_bpm_producto FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto),
    CONSTRAINT fk_bpm_empleado FOREIGN KEY (id_empleado_aprueba) REFERENCES EMPLEADO(id_empleado)
);

-- ============================================
-- TRIGGER BPM AUTOMATICO
-- Se activa cuando stock_actual < stock_minimo
-- ============================================
CREATE OR REPLACE TRIGGER trg_alerta_stock
AFTER UPDATE OF stock_actual ON INVENTARIO
FOR EACH ROW
WHEN (NEW.stock_actual < NEW.stock_minimo)
DECLARE
    v_proveedor NUMBER;
BEGIN
    SELECT id_proveedor INTO v_proveedor
    FROM PROCESO_BPM
    WHERE id_producto = :NEW.id_producto
    AND ROWNUM = 1;

    INSERT INTO PROCESO_BPM (
        id_proveedor, id_producto, cantidad_solicitada,
        estado_proceso, activado_automaticamente
    ) VALUES (
        v_proveedor, :NEW.id_producto,
        :NEW.stock_minimo * 2,
        'Generado', 1
    );
EXCEPTION
    WHEN NO_DATA_FOUND THEN NULL;
END;
/

COMMIT;