-- ============================================
-- TECHSTORE SMART COMMERCE S.A.
-- Script 03: Stored Procedures
-- ============================================

-- ============================================
-- SP 1: REGISTRAR VENTA COMPLETA
-- Crea pedido + detalles + actualiza inventario
-- ============================================
CREATE OR REPLACE PROCEDURE SP_REGISTRAR_VENTA(
    p_id_cliente    IN NUMBER,
    p_id_empleado   IN NUMBER,
    p_id_producto   IN NUMBER,
    p_cantidad      IN NUMBER,
    p_id_metodo     IN NUMBER,
    p_id_pedido     OUT NUMBER
) AS
    v_precio        NUMBER(10,2);
    v_subtotal      NUMBER(10,2);
    v_stock         NUMBER;
BEGIN
    -- Verificar stock disponible
    SELECT stock_actual INTO v_stock
    FROM INVENTARIO WHERE id_producto = p_id_producto;

    IF v_stock < p_cantidad THEN
        RAISE_APPLICATION_ERROR(-20001, 'Stock insuficiente');
    END IF;

    -- Obtener precio del producto
    SELECT precio_unitario INTO v_precio
    FROM PRODUCTO WHERE id_producto = p_id_producto;

    v_subtotal := v_precio * p_cantidad;

    -- Crear pedido
    INSERT INTO PEDIDO (id_cliente, id_empleado, estado, total)
    VALUES (p_id_cliente, p_id_empleado, 'Pendiente', v_subtotal)
    RETURNING id_pedido INTO p_id_pedido;

    -- Insertar detalle
    INSERT INTO DETALLE_PEDIDO (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
    VALUES (p_id_pedido, p_id_producto, p_cantidad, v_precio, v_subtotal);

    -- Registrar pago
    INSERT INTO PAGO (id_pedido, id_metodo_pago, monto, estado_pago)
    VALUES (p_id_pedido, p_id_metodo, v_subtotal, 'Confirmado');

    -- Actualizar estado pedido
    UPDATE PEDIDO SET estado = 'Pagado' WHERE id_pedido = p_id_pedido;

    -- Descontar inventario
    UPDATE INVENTARIO
    SET stock_actual = stock_actual - p_cantidad,
        fecha_actualizacion = SYSDATE
    WHERE id_producto = p_id_producto;

    -- Crear envio
    INSERT INTO ENVIO (id_pedido, id_empleado, estado_envio)
    VALUES (p_id_pedido, p_id_empleado, 'Pendiente');

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END SP_REGISTRAR_VENTA;
/

-- ============================================
-- SP 2: APROBAR PROCESO BPM
-- Aprueba orden de compra y notifica
-- ============================================
CREATE OR REPLACE PROCEDURE SP_APROBAR_PROCESO_BPM(
    p_id_proceso      IN NUMBER,
    p_id_empleado     IN NUMBER
) AS
    v_estado VARCHAR2(50);
BEGIN
    SELECT estado_proceso INTO v_estado
    FROM PROCESO_BPM WHERE id_proceso = p_id_proceso;

    IF v_estado != 'Generado' THEN
        RAISE_APPLICATION_ERROR(-20002, 'Solo se pueden aprobar procesos en estado Generado');
    END IF;

    UPDATE PROCESO_BPM
    SET estado_proceso = 'Aprobado',
        fecha_aprobacion = SYSDATE,
        id_empleado_aprueba = p_id_empleado
    WHERE id_proceso = p_id_proceso;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END SP_APROBAR_PROCESO_BPM;
/

-- ============================================
-- SP 3: CONFIRMAR DESPACHO IOT
-- Registra lectura IoT y actualiza envio
-- ============================================
CREATE OR REPLACE PROCEDURE SP_CONFIRMAR_DESPACHO(
    p_id_dispositivo  IN NUMBER,
    p_codigo_barras   IN VARCHAR2,
    p_id_envio        IN NUMBER,
    p_tipo_evento     IN VARCHAR2
) AS
    v_id_producto NUMBER;
    v_tiempo      NUMBER;
BEGIN
    -- Buscar producto por codigo de barras
    SELECT id_producto INTO v_id_producto
    FROM PRODUCTO WHERE codigo_barras = p_codigo_barras;

    -- Registrar lectura IoT
    INSERT INTO LECTURA_IOT (id_dispositivo, id_producto, id_envio, codigo_leido, tipo_evento)
    VALUES (p_id_dispositivo, v_id_producto, p_id_envio, p_codigo_barras, p_tipo_evento);

    IF p_tipo_evento = 'Despacho' THEN
        -- Calcular tiempo de preparacion en minutos
        SELECT ROUND((SYSDATE - fecha_despacho) * 1440)
        INTO v_tiempo
        FROM ENVIO WHERE id_envio = p_id_envio;

        UPDATE ENVIO
        SET estado_envio = 'Despachado',
            fecha_despacho = SYSDATE,
            tiempo_preparacion_min = NVL(v_tiempo, 0)
        WHERE id_envio = p_id_envio;

        UPDATE PEDIDO SET estado = 'Despachado'
        WHERE id_pedido = (SELECT id_pedido FROM ENVIO WHERE id_envio = p_id_envio);
    END IF;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END SP_CONFIRMAR_DESPACHO;
/