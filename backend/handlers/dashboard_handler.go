package handlers

import (
	"net/http"
	"strconv"
	"techstore-api/config"

	"github.com/gin-gonic/gin"
)

// ─────────────────────────────────────────────
// Structs de respuesta
// ─────────────────────────────────────────────

type KPIResponse struct {
	TotalVentasMes     float64 `json:"total_ventas_mes"`
	CantidadPedidos    int     `json:"cantidad_pedidos"`
	ProductosCriticos  int     `json:"productos_criticos"`
	PedidosPendientes  int     `json:"pedidos_pendientes"`
	TiempoPromedioDesp float64 `json:"tiempo_promedio_despacho"`
	BPMPendientes      int     `json:"bpm_pendientes"`
	TicketPromedio     float64 `json:"ticket_promedio"`
	TasaDevolucion     float64 `json:"tasa_devolucion"`
}

type VentaPeriodo struct {
	Fecha string  `json:"fecha"`
	Total float64 `json:"total"`
}

type VentaMes struct {
	Mes   string  `json:"mes"`
	Total float64 `json:"total"`
}

type VentaAnio struct {
	Anio  string  `json:"anio"`
	Total float64 `json:"total"`
}

type VentaEmpleado struct {
	Empleado string  `json:"empleado"`
	Total    float64 `json:"total"`
	Cantidad int     `json:"cantidad"`
}

type ProductoTop struct {
	NombreProducto string  `json:"nombre_producto"`
	TotalVendido   int     `json:"total_vendido"`
	IngresoTotal   float64 `json:"ingreso_total"`
}

type PedidoEstado struct {
	Estado   string `json:"estado"`
	Cantidad int    `json:"cantidad"`
}

type TicketMes struct {
	Mes            string  `json:"mes"`
	TicketPromedio float64 `json:"ticket_promedio"`
}

type VentaCategoria struct {
	Categoria string  `json:"categoria"`
	Total     float64 `json:"total"`
	Cantidad  int     `json:"cantidad"`
}

type ComparacionPeriodo struct {
	Mes          string  `json:"mes"`
	AnioActual   float64 `json:"anio_actual"`
	AnioAnterior float64 `json:"anio_anterior"`
}

// ─────────────────────────────────────────────
// Helpers de filtro
// ─────────────────────────────────────────────

// buildFiltros construye las cláusulas WHERE dinámicas a partir de query params.
// Retorna la cláusula completa (con AND inicial si aplica) y los argumentos posicionales Oracle.
func buildFiltros(c *gin.Context, tableAlias string) (string, []interface{}) {
	anio := c.Query("anio")
	mes := c.Query("mes")
	idEmpleado := c.Query("id_empleado")

	where := ""
	args := []interface{}{}
	pos := 1

	if anio != "" {
		if where == "" {
			where += " WHERE "
		} else {
			where += " AND "
		}
		where += "EXTRACT(YEAR FROM " + tableAlias + "fecha_pedido) = :" + itoa(pos)
		args = append(args, anio)
		pos++
	}

	if mes != "" {
		if where == "" {
			where += " WHERE "
		} else {
			where += " AND "
		}
		where += "EXTRACT(MONTH FROM " + tableAlias + "fecha_pedido) = :" + itoa(pos)
		args = append(args, mes)
		pos++
	}

	if idEmpleado != "" {
		if where == "" {
			where += " WHERE "
		} else {
			where += " AND "
		}
		where += tableAlias + "id_empleado = :" + itoa(pos)
		args = append(args, idEmpleado)
		pos++
	}

	return where, args
}

func itoa(i int) string {
	return strconv.Itoa(i)
}


// ─────────────────────────────────────────────
// GET /api/dashboard/kpis
// Acepta: ?anio= &mes= &id_empleado=
// ─────────────────────────────────────────────
func GetKPIs(c *gin.Context) {
	var kpi KPIResponse

	filtros, args := buildFiltros(c, "")

	// Total ventas del periodo seleccionado (o mes actual si no hay filtro)
	if filtros == "" {
		config.DB.QueryRow(`
			SELECT NVL(SUM(total), 0)
			FROM PEDIDO
			WHERE TRUNC(fecha_pedido, 'MM') = TRUNC(SYSDATE, 'MM')
			AND estado != 'Cancelado'`).Scan(&kpi.TotalVentasMes)

		config.DB.QueryRow(`
			SELECT COUNT(*)
			FROM PEDIDO
			WHERE TRUNC(fecha_pedido, 'MM') = TRUNC(SYSDATE, 'MM')`).Scan(&kpi.CantidadPedidos)

		config.DB.QueryRow(`
			SELECT NVL(ROUND(AVG(total), 2), 0)
			FROM PEDIDO
			WHERE TRUNC(fecha_pedido, 'MM') = TRUNC(SYSDATE, 'MM')
			AND estado != 'Cancelado'`).Scan(&kpi.TicketPromedio)
	} else {
		config.DB.QueryRow(
			"SELECT NVL(SUM(total), 0) FROM PEDIDO"+filtros+" AND estado != 'Cancelado'",
			args...).Scan(&kpi.TotalVentasMes)

		config.DB.QueryRow(
			"SELECT COUNT(*) FROM PEDIDO"+filtros,
			args...).Scan(&kpi.CantidadPedidos)

		config.DB.QueryRow(
			"SELECT NVL(ROUND(AVG(total), 2), 0) FROM PEDIDO"+filtros+" AND estado != 'Cancelado'",
			args...).Scan(&kpi.TicketPromedio)
	}

	// Productos con stock crítico (no filtra por periodo)
	config.DB.QueryRow(`
		SELECT COUNT(*)
		FROM INVENTARIO
		WHERE stock_actual < stock_minimo`).Scan(&kpi.ProductosCriticos)

	// Pedidos pendientes (global)
	config.DB.QueryRow(`
		SELECT COUNT(*)
		FROM PEDIDO
		WHERE estado IN ('Pendiente', 'En preparacion')`).Scan(&kpi.PedidosPendientes)

	// Tiempo promedio de despacho en minutos (global)
	config.DB.QueryRow(`
		SELECT NVL(ROUND(AVG(tiempo_preparacion_min), 1), 0)
		FROM ENVIO
		WHERE tiempo_preparacion_min IS NOT NULL`).Scan(&kpi.TiempoPromedioDesp)

	// Procesos BPM pendientes de aprobar (global)
	config.DB.QueryRow(`
		SELECT COUNT(*)
		FROM PROCESO_BPM
		WHERE estado_proceso = 'Generado'`).Scan(&kpi.BPMPendientes)

	// Tasa de devolución: (devoluciones / total pedidos) * 100
	var totalPedidos, totalDevoluciones int
	config.DB.QueryRow(`SELECT COUNT(*) FROM PEDIDO`).Scan(&totalPedidos)
	config.DB.QueryRow(`SELECT COUNT(*) FROM DEVOLUCION WHERE estado != 'Rechazada'`).Scan(&totalDevoluciones)
	if totalPedidos > 0 {
		kpi.TasaDevolucion = float64(totalDevoluciones) / float64(totalPedidos) * 100
	}

	c.JSON(http.StatusOK, kpi)
}

// ─────────────────────────────────────────────
// GET /api/dashboard/ventas-mes
// Ventas totales agrupadas por mes del año dado.
// Acepta: ?anio= &id_empleado=
// ─────────────────────────────────────────────
func GetVentasPorMes(c *gin.Context) {
	anio := c.Query("anio")
	idEmpleado := c.Query("id_empleado")

	query := `
		SELECT TO_CHAR(fecha_pedido, 'MM') AS mes,
		       NVL(SUM(total), 0) AS total
		FROM PEDIDO
		WHERE estado != 'Cancelado'`

	args := []interface{}{}
	pos := 1

	if anio != "" {
		query += " AND EXTRACT(YEAR FROM fecha_pedido) = :" + itoa(pos)
		args = append(args, anio)
		pos++
	} else {
		query += " AND EXTRACT(YEAR FROM fecha_pedido) = EXTRACT(YEAR FROM SYSDATE)"
	}

	if idEmpleado != "" {
		query += " AND id_empleado = :" + itoa(pos)
		args = append(args, idEmpleado)
		pos++
	}

	query += `
		GROUP BY TO_CHAR(fecha_pedido, 'MM')
		ORDER BY mes ASC`

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var ventas []VentaMes
	for rows.Next() {
		var v VentaMes
		rows.Scan(&v.Mes, &v.Total)
		ventas = append(ventas, v)
	}
	if ventas == nil {
		ventas = []VentaMes{}
	}
	c.JSON(http.StatusOK, ventas)
}

// ─────────────────────────────────────────────
// GET /api/dashboard/ventas-anio
// Ventas totales agrupadas por año (últimos 4 años).
// Acepta: ?id_empleado=
// ─────────────────────────────────────────────
func GetVentasPorAnio(c *gin.Context) {
	idEmpleado := c.Query("id_empleado")

	query := `
		SELECT TO_CHAR(fecha_pedido, 'YYYY') AS anio,
		       NVL(SUM(total), 0) AS total
		FROM PEDIDO
		WHERE estado != 'Cancelado'
		AND EXTRACT(YEAR FROM fecha_pedido) >= EXTRACT(YEAR FROM SYSDATE) - 3`

	args := []interface{}{}
	if idEmpleado != "" {
		query += " AND id_empleado = :1"
		args = append(args, idEmpleado)
	}

	query += `
		GROUP BY TO_CHAR(fecha_pedido, 'YYYY')
		ORDER BY anio ASC`

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var ventas []VentaAnio
	for rows.Next() {
		var v VentaAnio
		rows.Scan(&v.Anio, &v.Total)
		ventas = append(ventas, v)
	}
	if ventas == nil {
		ventas = []VentaAnio{}
	}
	c.JSON(http.StatusOK, ventas)
}

// ─────────────────────────────────────────────
// GET /api/dashboard/ventas-empleado
// Ventas y cantidad de pedidos por empleado.
// Acepta: ?anio= &mes= &id_empleado=
// ─────────────────────────────────────────────
func GetVentasPorEmpleado(c *gin.Context) {
	anio := c.Query("anio")
	mes := c.Query("mes")
	idEmpleado := c.Query("id_empleado")

	query := `
		SELECT em.nombres || ' ' || em.apellidos AS empleado,
		       NVL(SUM(p.total), 0) AS total,
		       COUNT(p.id_pedido) AS cantidad
		FROM PEDIDO p
		JOIN EMPLEADO em ON em.id_empleado = p.id_empleado
		WHERE p.estado != 'Cancelado'`

	args := []interface{}{}
	pos := 1

	if anio != "" {
		query += " AND EXTRACT(YEAR FROM p.fecha_pedido) = :" + itoa(pos)
		args = append(args, anio)
		pos++
	}

	if mes != "" {
		query += " AND EXTRACT(MONTH FROM p.fecha_pedido) = :" + itoa(pos)
		args = append(args, mes)
		pos++
	}

	if idEmpleado != "" {
		query += " AND p.id_empleado = :" + itoa(pos)
		args = append(args, idEmpleado)
		pos++
	}

	query += `
		GROUP BY em.nombres || ' ' || em.apellidos
		ORDER BY total DESC`

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var ventas []VentaEmpleado
	for rows.Next() {
		var v VentaEmpleado
		rows.Scan(&v.Empleado, &v.Total, &v.Cantidad)
		ventas = append(ventas, v)
	}
	if ventas == nil {
		ventas = []VentaEmpleado{}
	}
	c.JSON(http.StatusOK, ventas)
}

// ─────────────────────────────────────────────
// GET /api/dashboard/productos-top
// Top 10 productos más vendidos por unidades.
// Acepta: ?anio= &mes= &id_empleado=
// ─────────────────────────────────────────────
func GetProductosTop(c *gin.Context) {
	anio := c.Query("anio")
	mes := c.Query("mes")
	idEmpleado := c.Query("id_empleado")

	query := `
		SELECT p.nombre_producto,
		       NVL(SUM(d.cantidad), 0) AS total_vendido,
		       NVL(SUM(d.subtotal), 0) AS ingreso_total
		FROM DETALLE_PEDIDO d
		JOIN PRODUCTO p ON d.id_producto = p.id_producto
		JOIN PEDIDO pe ON d.id_pedido = pe.id_pedido
		WHERE pe.estado != 'Cancelado'`

	args := []interface{}{}
	pos := 1

	if anio != "" {
		query += " AND EXTRACT(YEAR FROM pe.fecha_pedido) = :" + itoa(pos)
		args = append(args, anio)
		pos++
	}

	if mes != "" {
		query += " AND EXTRACT(MONTH FROM pe.fecha_pedido) = :" + itoa(pos)
		args = append(args, mes)
		pos++
	}

	if idEmpleado != "" {
		query += " AND pe.id_empleado = :" + itoa(pos)
		args = append(args, idEmpleado)
		pos++
	}

	query += `
		GROUP BY p.nombre_producto
		ORDER BY total_vendido DESC
		FETCH FIRST 10 ROWS ONLY`

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var productos []ProductoTop
	for rows.Next() {
		var p ProductoTop
		rows.Scan(&p.NombreProducto, &p.TotalVendido, &p.IngresoTotal)
		productos = append(productos, p)
	}
	if productos == nil {
		productos = []ProductoTop{}
	}
	c.JSON(http.StatusOK, productos)
}

// ─────────────────────────────────────────────
// GET /api/dashboard/pedidos-estado
// Conteo de pedidos agrupados por estado.
// Acepta: ?anio= &mes= &id_empleado=
// ─────────────────────────────────────────────
func GetPedidosPorEstado(c *gin.Context) {
	anio := c.Query("anio")
	mes := c.Query("mes")
	idEmpleado := c.Query("id_empleado")

	query := `
		SELECT estado,
		       COUNT(*) AS cantidad
		FROM PEDIDO
		WHERE 1=1`

	args := []interface{}{}
	pos := 1

	if anio != "" {
		query += " AND EXTRACT(YEAR FROM fecha_pedido) = :" + itoa(pos)
		args = append(args, anio)
		pos++
	}

	if mes != "" {
		query += " AND EXTRACT(MONTH FROM fecha_pedido) = :" + itoa(pos)
		args = append(args, mes)
		pos++
	}

	if idEmpleado != "" {
		query += " AND id_empleado = :" + itoa(pos)
		args = append(args, idEmpleado)
		pos++
	}

	query += `
		GROUP BY estado
		ORDER BY cantidad DESC`

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var estados []PedidoEstado
	for rows.Next() {
		var e PedidoEstado
		rows.Scan(&e.Estado, &e.Cantidad)
		estados = append(estados, e)
	}
	if estados == nil {
		estados = []PedidoEstado{}
	}
	c.JSON(http.StatusOK, estados)
}

// ─────────────────────────────────────────────
// GET /api/dashboard/ticket-promedio
// Ticket promedio mensual del año seleccionado.
// Acepta: ?anio= &id_empleado=
// ─────────────────────────────────────────────
func GetTicketPromedio(c *gin.Context) {
	anio := c.Query("anio")
	idEmpleado := c.Query("id_empleado")

	query := `
		SELECT TO_CHAR(fecha_pedido, 'MM') AS mes,
		       NVL(ROUND(AVG(total), 2), 0) AS ticket_promedio
		FROM PEDIDO
		WHERE estado != 'Cancelado'`

	args := []interface{}{}
	pos := 1

	if anio != "" {
		query += " AND EXTRACT(YEAR FROM fecha_pedido) = :" + itoa(pos)
		args = append(args, anio)
		pos++
	} else {
		query += " AND EXTRACT(YEAR FROM fecha_pedido) = EXTRACT(YEAR FROM SYSDATE)"
	}

	if idEmpleado != "" {
		query += " AND id_empleado = :" + itoa(pos)
		args = append(args, idEmpleado)
		pos++
	}

	query += `
		GROUP BY TO_CHAR(fecha_pedido, 'MM')
		ORDER BY mes ASC`

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var tickets []TicketMes
	for rows.Next() {
		var t TicketMes
		rows.Scan(&t.Mes, &t.TicketPromedio)
		tickets = append(tickets, t)
	}
	if tickets == nil {
		tickets = []TicketMes{}
	}
	c.JSON(http.StatusOK, tickets)
}

// ─────────────────────────────────────────────
// GET /api/dashboard/ventas-categoria
// Ventas totales agrupadas por categoría de producto.
// Acepta: ?anio= &mes= &id_empleado=
// ─────────────────────────────────────────────
func GetVentasPorCategoria(c *gin.Context) {
	anio := c.Query("anio")
	mes := c.Query("mes")
	idEmpleado := c.Query("id_empleado")

	query := `
		SELECT cat.nombre_categoria AS categoria,
		       NVL(SUM(d.subtotal), 0) AS total,
		       NVL(SUM(d.cantidad), 0) AS cantidad
		FROM DETALLE_PEDIDO d
		JOIN PRODUCTO p ON d.id_producto = p.id_producto
		JOIN CATEGORIA cat ON p.id_categoria = cat.id_categoria
		JOIN PEDIDO pe ON d.id_pedido = pe.id_pedido
		WHERE pe.estado != 'Cancelado'`

	args := []interface{}{}
	pos := 1

	if anio != "" {
		query += " AND EXTRACT(YEAR FROM pe.fecha_pedido) = :" + itoa(pos)
		args = append(args, anio)
		pos++
	}

	if mes != "" {
		query += " AND EXTRACT(MONTH FROM pe.fecha_pedido) = :" + itoa(pos)
		args = append(args, mes)
		pos++
	}

	if idEmpleado != "" {
		query += " AND pe.id_empleado = :" + itoa(pos)
		args = append(args, idEmpleado)
		pos++
	}

	query += `
		GROUP BY cat.nombre_categoria
		ORDER BY total DESC`

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var categorias []VentaCategoria
	for rows.Next() {
		var cat VentaCategoria
		rows.Scan(&cat.Categoria, &cat.Total, &cat.Cantidad)
		categorias = append(categorias, cat)
	}
	if categorias == nil {
		categorias = []VentaCategoria{}
	}
	c.JSON(http.StatusOK, categorias)
}

// ─────────────────────────────────────────────
// GET /api/dashboard/comparacion-periodos
// Ventas mensuales del año actual vs año anterior.
// Acepta: ?anio= &id_empleado=
// ─────────────────────────────────────────────
func GetComparacionPeriodos(c *gin.Context) {
	anio := c.Query("anio")
	idEmpleado := c.Query("id_empleado")

	anioRef := "EXTRACT(YEAR FROM SYSDATE)"
	if anio != "" {
		anioRef = anio
	}

	query := `
		SELECT mes,
		       NVL(SUM(CASE WHEN anio = ` + anioRef + ` THEN total ELSE 0 END), 0) AS anio_actual,
		       NVL(SUM(CASE WHEN anio = ` + anioRef + ` - 1 THEN total ELSE 0 END), 0) AS anio_anterior
		FROM (
		    SELECT TO_CHAR(fecha_pedido, 'MM') AS mes,
		           EXTRACT(YEAR FROM fecha_pedido) AS anio,
		           total
		    FROM PEDIDO
		    WHERE estado != 'Cancelado'
		    AND EXTRACT(YEAR FROM fecha_pedido) IN (` + anioRef + `, ` + anioRef + ` - 1)`

	args := []interface{}{}
	if idEmpleado != "" {
		query += " AND id_empleado = :1"
		args = append(args, idEmpleado)
	}

	query += `
		)
		GROUP BY mes
		ORDER BY mes ASC`

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var comparacion []ComparacionPeriodo
	for rows.Next() {
		var cp ComparacionPeriodo
		rows.Scan(&cp.Mes, &cp.AnioActual, &cp.AnioAnterior)
		comparacion = append(comparacion, cp)
	}
	if comparacion == nil {
		comparacion = []ComparacionPeriodo{}
	}
	c.JSON(http.StatusOK, comparacion)
}

// ─────────────────────────────────────────────
// GET /api/dashboard/ventas-periodo (legacy — se mantiene)
// Últimos 30 días diarios, ahora con filtros opcionales.
// ─────────────────────────────────────────────
func GetVentasPorPeriodo(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT TO_CHAR(fecha_pedido, 'YYYY-MM-DD') as fecha,
		       NVL(SUM(total), 0) as total
		FROM PEDIDO
		WHERE fecha_pedido >= SYSDATE - 30
		AND estado != 'Cancelado'
		GROUP BY TO_CHAR(fecha_pedido, 'YYYY-MM-DD')
		ORDER BY fecha ASC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var ventas []VentaPeriodo
	for rows.Next() {
		var v VentaPeriodo
		rows.Scan(&v.Fecha, &v.Total)
		ventas = append(ventas, v)
	}
	if ventas == nil {
		ventas = []VentaPeriodo{}
	}
	c.JSON(http.StatusOK, ventas)
}