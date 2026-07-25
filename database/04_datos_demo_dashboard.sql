-- ============================================================
-- TECHSTORE SIG -- Script de datos de prueba para Dashboard
-- Genera ~120 pedidos distribuidos en 2025 y 2026
-- Usa empleados/clientes/productos que YA existen en la BD
-- SEGURO: No modifica datos existentes, solo inserta nuevos
-- ============================================================

DECLARE
  TYPE t_nums IS TABLE OF NUMBER INDEX BY PLS_INTEGER;

  v_emps     t_nums;
  v_clientes t_nums;
  v_prods    t_nums;
  v_precios  t_nums;

  v_cnt_emp  NUMBER := 0;
  v_cnt_cli  NUMBER := 0;
  v_cnt_prod NUMBER := 0;

  v_id_pedido   NUMBER;
  v_id_emp      NUMBER;
  v_id_cli      NUMBER;
  v_id_prod     NUMBER;
  v_precio      NUMBER;
  v_cantidad    NUMBER;
  v_subtotal    NUMBER;
  v_total       NUMBER;
  v_n_items     NUMBER;
  v_fecha       DATE;
  v_estado      VARCHAR2(30);
  v_mes         NUMBER;
  v_anio        NUMBER;
  v_dia         NUMBER;

  PEDIDOS_POR_MES CONSTANT NUMBER := 5;

  TYPE t_estados IS TABLE OF VARCHAR2(30) INDEX BY PLS_INTEGER;
  v_estados t_estados;

  FUNCTION rand_int(p_min NUMBER, p_max NUMBER) RETURN NUMBER IS
  BEGIN
    RETURN TRUNC(p_min + DBMS_RANDOM.VALUE * (p_max - p_min + 1));
  END;

BEGIN
  v_estados(1)  := 'Entregado';
  v_estados(2)  := 'Entregado';
  v_estados(3)  := 'Entregado';
  v_estados(4)  := 'Pagado';
  v_estados(5)  := 'Pagado';
  v_estados(6)  := 'Despachado';
  v_estados(7)  := 'En preparacion';
  v_estados(8)  := 'Pendiente';
  v_estados(9)  := 'Cancelado';
  v_estados(10) := 'Cancelado';

  FOR r IN (SELECT id_empleado FROM EMPLEADO) LOOP
    v_cnt_emp := v_cnt_emp + 1;
    v_emps(v_cnt_emp) := r.id_empleado;
  END LOOP;

  FOR r IN (SELECT id_cliente FROM CLIENTE) LOOP
    v_cnt_cli := v_cnt_cli + 1;
    v_clientes(v_cnt_cli) := r.id_cliente;
  END LOOP;

  FOR r IN (SELECT id_producto, precio_unitario FROM PRODUCTO WHERE activo = 1) LOOP
    v_cnt_prod := v_cnt_prod + 1;
    v_prods(v_cnt_prod)   := r.id_producto;
    v_precios(v_cnt_prod) := r.precio_unitario;
  END LOOP;

  IF v_cnt_emp = 0 THEN
    RAISE_APPLICATION_ERROR(-20001, 'No hay empleados en la BD.');
  END IF;
  IF v_cnt_cli = 0 THEN
    RAISE_APPLICATION_ERROR(-20002, 'No hay clientes en la BD.');
  END IF;
  IF v_cnt_prod = 0 THEN
    RAISE_APPLICATION_ERROR(-20003, 'No hay productos activos en la BD.');
  END IF;

  DBMS_OUTPUT.PUT_LINE('Empleados: ' || v_cnt_emp ||
                       ' | Clientes: ' || v_cnt_cli ||
                       ' | Productos: ' || v_cnt_prod);

  FOR v_anio IN 2025..2026 LOOP
    FOR v_mes IN 1..12 LOOP

      IF v_anio = 2026 AND v_mes > EXTRACT(MONTH FROM SYSDATE) THEN
        CONTINUE;
      END IF;

      FOR i IN 1..PEDIDOS_POR_MES LOOP

        v_dia   := rand_int(1, 28);
        v_fecha := TO_DATE(
                     v_anio || '-' || LPAD(v_mes,2,'0') || '-' || LPAD(v_dia,2,'0'),
                     'YYYY-MM-DD'
                   );

        v_id_emp := v_emps(rand_int(1, v_cnt_emp));
        v_id_cli := v_clientes(rand_int(1, v_cnt_cli));

        IF v_anio = 2026 AND v_mes = EXTRACT(MONTH FROM SYSDATE) THEN
          v_estado := v_estados(rand_int(1, 10));
        ELSE
          v_estado := v_estados(rand_int(1, 7));
        END IF;

        INSERT INTO PEDIDO (id_cliente, id_empleado, fecha_pedido, estado, total, observaciones)
        VALUES (v_id_cli, v_id_emp, v_fecha, v_estado, 0, 'Demo dashboard')
        RETURNING id_pedido INTO v_id_pedido;

        v_n_items := rand_int(1, 4);
        v_total   := 0;

        FOR j IN 1..v_n_items LOOP
          DECLARE
            v_idx NUMBER;
          BEGIN
            v_idx      := rand_int(1, v_cnt_prod);
            v_id_prod  := v_prods(v_idx);
            v_precio   := v_precios(v_idx);
            v_cantidad := rand_int(1, 3);
            v_subtotal := v_precio * v_cantidad;
            v_total    := v_total + v_subtotal;

            INSERT INTO DETALLE_PEDIDO
              (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
            VALUES
              (v_id_pedido, v_id_prod, v_cantidad, v_precio, v_subtotal);
          END;
        END LOOP;

        UPDATE PEDIDO SET total = v_total WHERE id_pedido = v_id_pedido;

      END LOOP;
    END LOOP;
  END LOOP;

  COMMIT;
  DBMS_OUTPUT.PUT_LINE('Listo. Pedidos generados y confirmados.');

EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
    RAISE;
END;
/
