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
        v_id_producto     NUMBER;
        v_id_pedido       NUMBER;
        v_tiempo          NUMBER := 0;
        v_existente       NUMBER := 0;
BEGIN
        SELECT id_producto
            INTO v_id_producto
            FROM PRODUCTO
         WHERE codigo_barras = p_codigo_barras;

        SELECT id_pedido
            INTO v_id_pedido
            FROM ENVIO
         WHERE id_envio = p_id_envio;

        SELECT COUNT(*)
            INTO v_existente
            FROM LECTURA_IOT
         WHERE id_envio = p_id_envio
             AND id_producto = v_id_producto
             AND UPPER(tipo_evento) = 'DESPACHO';

        IF v_existente = 0 THEN
                INSERT INTO LECTURA_IOT (id_dispositivo, id_producto, id_envio, codigo_leido, tipo_evento)
                VALUES (p_id_dispositivo, v_id_producto, p_id_envio, p_codigo_barras, p_tipo_evento);

                SELECT ROUND((SYSDATE - NVL(fecha_despacho, SYSDATE)) * 1440)
                    INTO v_tiempo
                    FROM ENVIO
                 WHERE id_envio = p_id_envio;

                UPDATE ENVIO
                     SET estado_envio = 'Despachado',
                             fecha_despacho = SYSDATE,
                             tiempo_preparacion_min = NVL(v_tiempo, 0)
                 WHERE id_envio = p_id_envio
                     AND estado_envio NOT IN ('Despachado', 'Entregado');

                UPDATE PEDIDO
                     SET estado = 'Despachado'
                 WHERE id_pedido = v_id_pedido
                     AND estado NOT IN ('Despachado', 'Entregado');
        END IF;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END SP_CONFIRMAR_DESPACHO;
/

-- ============================================
-- SP 4: CONFIRMAR RECEPCION IOT
-- Registra lectura IoT, incrementa stock y cierra BPM
-- ============================================
CREATE OR REPLACE PROCEDURE SP_CONFIRMAR_RECEPCION(
    p_id_dispositivo  IN NUMBER,
    p_codigo_barras   IN VARCHAR2,
    p_id_envio        IN NUMBER,
    p_tipo_evento     IN VARCHAR2
) IS
        v_id_producto     NUMBER;
        v_cantidad        NUMBER := 0;
        v_id_pedido       NUMBER;
        v_id_proceso      NUMBER;
        v_existente       NUMBER := 0;
        v_total_items     NUMBER := 0;
        v_items_recibidos NUMBER := 0;
BEGIN
    SELECT id_producto
      INTO v_id_producto
      FROM PRODUCTO
     WHERE codigo_barras = p_codigo_barras;

        SELECT COUNT(*)
            INTO v_existente
            FROM LECTURA_IOT
         WHERE id_envio = p_id_envio
             AND id_producto = v_id_producto
             AND UPPER(tipo_evento) = 'RECEPCION';

        IF v_existente = 0 THEN
                INSERT INTO LECTURA_IOT (id_dispositivo, id_producto, id_envio, codigo_leido, tipo_evento)
                VALUES (p_id_dispositivo, v_id_producto, p_id_envio, p_codigo_barras, p_tipo_evento);

                BEGIN
                        SELECT d.cantidad, e.id_pedido
                            INTO v_cantidad, v_id_pedido
                            FROM ENVIO e
                            JOIN DETALLE_PEDIDO d ON d.id_pedido = e.id_pedido
                         WHERE e.id_envio = p_id_envio
                             AND d.id_producto = v_id_producto;

                        UPDATE INVENTARIO
                             SET stock_actual = stock_actual + v_cantidad,
                                     fecha_actualizacion = SYSDATE
                         WHERE id_producto = v_id_producto;
                EXCEPTION
                        WHEN NO_DATA_FOUND THEN
                                v_cantidad := 0;
                                v_id_pedido := NULL;
                END;

                BEGIN
                        SELECT id_proceso
                            INTO v_id_proceso
                            FROM (
                                        SELECT pb.id_proceso
                                            FROM PROCESO_BPM pb
                                         WHERE pb.id_producto = v_id_producto
                                             AND pb.estado_proceso IN ('Aprobado','Enviado')
                                         ORDER BY pb.fecha_inicio DESC
                                     )
                         WHERE ROWNUM = 1;

                        UPDATE PROCESO_BPM
                             SET estado_proceso = 'Recibido',
                                     fecha_recepcion = SYSDATE
                         WHERE id_proceso = v_id_proceso;
                EXCEPTION
                        WHEN NO_DATA_FOUND THEN NULL;
                END;

                BEGIN
                        SELECT COUNT(*) INTO v_total_items
                            FROM DETALLE_PEDIDO d
                         WHERE d.id_pedido = v_id_pedido;

                        SELECT COUNT(DISTINCT li.id_producto) INTO v_items_recibidos
                            FROM LECTURA_IOT li
                         WHERE li.id_envio = p_id_envio
                             AND UPPER(li.tipo_evento) = 'RECEPCION';

                        IF v_id_pedido IS NOT NULL
                             AND v_total_items > 0
                             AND v_items_recibidos >= v_total_items THEN
                                UPDATE ENVIO
                                     SET estado_envio = 'Entregado',
                                             fecha_entrega_real = SYSDATE
                                 WHERE id_envio = p_id_envio
                                     AND estado_envio <> 'Entregado';

                                UPDATE PEDIDO
                                     SET estado = 'Entregado'
                                 WHERE id_pedido = v_id_pedido
                                     AND estado <> 'Entregado';
                        END IF;
                EXCEPTION
                        WHEN OTHERS THEN
                                NULL;
                END;
        END IF;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END SP_CONFIRMAR_RECEPCION;
/