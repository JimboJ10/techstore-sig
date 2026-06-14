-- ============================================
-- TECHSTORE SMART COMMERCE S.A.
-- Script 02: Datos semilla
-- ============================================

-- ROLES
INSERT INTO ROL (nombre_rol, descripcion) VALUES ('Gerente', 'Acceso total al dashboard y reportes');
INSERT INTO ROL (nombre_rol, descripcion) VALUES ('Administrador', 'Gestiona usuarios y configuracion');
INSERT INTO ROL (nombre_rol, descripcion) VALUES ('Vendedor', 'Registra ventas y gestiona clientes');
INSERT INTO ROL (nombre_rol, descripcion) VALUES ('Bodeguero', 'Gestiona despachos y lecturas IoT');

-- USUARIOS (password_hash = 'TechStore2026#' hasheado con bcrypt)
INSERT INTO USUARIO (id_rol, nombre_usuario, correo, password_hash, activo)
VALUES (1, 'gerente', 'gerente@techstore.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1);

INSERT INTO USUARIO (id_rol, nombre_usuario, correo, password_hash, activo)
VALUES (2, 'admin', 'admin@techstore.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1);

INSERT INTO USUARIO (id_rol, nombre_usuario, correo, password_hash, activo)
VALUES (3, 'vendedor1', 'vendedor@techstore.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1);

INSERT INTO USUARIO (id_rol, nombre_usuario, correo, password_hash, activo)
VALUES (4, 'bodeguero1', 'bodeguero@techstore.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1);

-- EMPLEADOS
INSERT INTO EMPLEADO (id_usuario, nombres, apellidos, cargo, telefono)
VALUES (1, 'Carlos', 'Mendoza', 'Gerente General', '0991234567');

INSERT INTO EMPLEADO (id_usuario, nombres, apellidos, cargo, telefono)
VALUES (2, 'Ana', 'Torres', 'Administradora', '0992345678');

INSERT INTO EMPLEADO (id_usuario, nombres, apellidos, cargo, telefono)
VALUES (3, 'Luis', 'Ramirez', 'Vendedor', '0993456789');

INSERT INTO EMPLEADO (id_usuario, nombres, apellidos, cargo, telefono)
VALUES (4, 'Maria', 'Lopez', 'Bodeguera', '0994567890');

-- CLIENTES
INSERT INTO CLIENTE (nombres, apellidos, correo, telefono, direccion)
VALUES ('Juan', 'Perez', 'juan@gmail.com', '0995678901', 'Av. Principal 123, Machala');

INSERT INTO CLIENTE (nombres, apellidos, correo, telefono, direccion)
VALUES ('Sofia', 'Guerrero', 'sofia@gmail.com', '0996789012', 'Calle 5ta 456, Machala');

INSERT INTO CLIENTE (nombres, apellidos, correo, telefono, direccion)
VALUES ('Pedro', 'Vasquez', 'pedro@gmail.com', '0997890123', 'Urb. Las Flores, Machala');

-- CATEGORIAS
INSERT INTO CATEGORIA (nombre_categoria, descripcion) VALUES ('Laptops', 'Computadoras portatiles');
INSERT INTO CATEGORIA (nombre_categoria, descripcion) VALUES ('Smartphones', 'Telefonos inteligentes');
INSERT INTO CATEGORIA (nombre_categoria, descripcion) VALUES ('Monitores', 'Pantallas y monitores');
INSERT INTO CATEGORIA (nombre_categoria, descripcion) VALUES ('Accesorios', 'Perifericos y accesorios');

-- MARCAS
INSERT INTO MARCA (nombre_marca, pais_origen) VALUES ('Apple', 'Estados Unidos');
INSERT INTO MARCA (nombre_marca, pais_origen) VALUES ('Samsung', 'Corea del Sur');
INSERT INTO MARCA (nombre_marca, pais_origen) VALUES ('Dell', 'Estados Unidos');
INSERT INTO MARCA (nombre_marca, pais_origen) VALUES ('HP', 'Estados Unidos');
INSERT INTO MARCA (nombre_marca, pais_origen) VALUES ('Lenovo', 'China');

-- PRODUCTOS
INSERT INTO PRODUCTO (id_categoria, id_marca, nombre_producto, precio_unitario, codigo_barras, activo)
VALUES (1, 3, 'Dell Inspiron 15 3520', 899.99, 'DELL-INS-3520', 1);

INSERT INTO PRODUCTO (id_categoria, id_marca, nombre_producto, precio_unitario, codigo_barras, activo)
VALUES (1, 5, 'Lenovo IdeaPad 3', 749.99, 'LEN-IDEA-3', 1);

INSERT INTO PRODUCTO (id_categoria, id_marca, nombre_producto, precio_unitario, codigo_barras, activo)
VALUES (2, 1, 'iPhone 16 Pro', 1299.99, 'APL-IP16P', 1);

INSERT INTO PRODUCTO (id_categoria, id_marca, nombre_producto, precio_unitario, codigo_barras, activo)
VALUES (2, 2, 'Samsung Galaxy S25', 1099.99, 'SAM-GS25', 1);

INSERT INTO PRODUCTO (id_categoria, id_marca, nombre_producto, precio_unitario, codigo_barras, activo)
VALUES (3, 2, 'Samsung Monitor 27 FHD', 299.99, 'SAM-MON-27', 1);

INSERT INTO PRODUCTO (id_categoria, id_marca, nombre_producto, precio_unitario, codigo_barras, activo)
VALUES (4, 4, 'HP Mouse Inalambrico', 29.99, 'HP-MOUSE-01', 1);

-- INVENTARIO
INSERT INTO INVENTARIO (id_producto, stock_actual, stock_minimo, stock_maximo, ubicacion_bodega)
VALUES (1, 15, 5, 50, 'Bodega A - Estante 1');

INSERT INTO INVENTARIO (id_producto, stock_actual, stock_minimo, stock_maximo, ubicacion_bodega)
VALUES (2, 8, 5, 50, 'Bodega A - Estante 2');

INSERT INTO INVENTARIO (id_producto, stock_actual, stock_minimo, stock_maximo, ubicacion_bodega)
VALUES (3, 20, 5, 30, 'Bodega B - Estante 1');

INSERT INTO INVENTARIO (id_producto, stock_actual, stock_minimo, stock_maximo, ubicacion_bodega)
VALUES (4, 12, 5, 30, 'Bodega B - Estante 2');

INSERT INTO INVENTARIO (id_producto, stock_actual, stock_minimo, stock_maximo, ubicacion_bodega)
VALUES (5, 6, 3, 20, 'Bodega A - Estante 3');

INSERT INTO INVENTARIO (id_producto, stock_actual, stock_minimo, stock_maximo, ubicacion_bodega)
VALUES (6, 50, 10, 200, 'Bodega C - Estante 1');

-- PROVEEDORES
INSERT INTO PROVEEDOR (razon_social, ruc, correo, telefono, contacto_nombre)
VALUES ('TechDistrib S.A.', '0990123456001', 'ventas@techdistrib.com', '042123456', 'Roberto Silva');

INSERT INTO PROVEEDOR (razon_social, ruc, correo, telefono, contacto_nombre)
VALUES ('Global Tech Ecuador', '0990234567001', 'contacto@globaltech.ec', '042234567', 'Patricia Mora');

-- METODOS DE PAGO
INSERT INTO METODO_PAGO (nombre_metodo, descripcion) VALUES ('Efectivo', 'Pago en efectivo');
INSERT INTO METODO_PAGO (nombre_metodo, descripcion) VALUES ('Tarjeta de credito', 'Visa, Mastercard');
INSERT INTO METODO_PAGO (nombre_metodo, descripcion) VALUES ('Transferencia', 'Transferencia bancaria');

-- DISPOSITIVO IOT
INSERT INTO DISPOSITIVO_IOT (nombre_dispositivo, tipo, ubicacion, activo)
VALUES ('Lector Bodega Principal', 'Lector de barras', 'Bodega Principal', 1);

COMMIT;