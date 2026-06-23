package handlers

import (
	"net/http"
	"techstore-api/config"

	"github.com/gin-gonic/gin"
)

type KPIResponse struct {
	TotalVentasMes     float64 `json:"total_ventas_mes"`
	CantidadPedidos    int     `json:"cantidad_pedidos"`
	ProductosCriticos  int     `json:"productos_criticos"`
	PedidosPendientes  int     `json:"pedidos_pendientes"`
	TiempoPromedioDesp float64 `json:"tiempo_promedio_despacho"`
	BPMPendientes      int     `json:"bpm_pendientes"`
}

type VentaPeriodo struct {
	Fecha string  `json:"fecha"`
	Total float64 `json:"total"`
}

type ProductoTop struct {
	NombreProducto string `json:"nombre_producto"`
	TotalVendido   int    `json:"total_vendido"`
}

func GetKPIs(c *gin.Context) {
	var kpi KPIResponse

	// Total ventas del mes actual
	config.DB.QueryRow(`
		SELECT NVL(SUM(total), 0)
		FROM PEDIDO
		WHERE TRUNC(fecha_pedido, 'MM') = TRUNC(SYSDATE, 'MM')
		AND estado != 'Cancelado'`).Scan(&kpi.TotalVentasMes)

	// Cantidad de pedidos del mes
	config.DB.QueryRow(`
		SELECT COUNT(*)
		FROM PEDIDO
		WHERE TRUNC(fecha_pedido, 'MM') = TRUNC(SYSDATE, 'MM')`).Scan(&kpi.CantidadPedidos)

	// Productos con stock crítico
	config.DB.QueryRow(`
		SELECT COUNT(*)
		FROM INVENTARIO
		WHERE stock_actual < stock_minimo`).Scan(&kpi.ProductosCriticos)

	// Pedidos pendientes
	config.DB.QueryRow(`
		SELECT COUNT(*)
		FROM PEDIDO
		WHERE estado IN ('Pendiente', 'En preparacion')`).Scan(&kpi.PedidosPendientes)

	// Tiempo promedio de despacho en minutos
	config.DB.QueryRow(`
		SELECT NVL(ROUND(AVG(tiempo_preparacion_min), 1), 0)
		FROM ENVIO
		WHERE tiempo_preparacion_min IS NOT NULL`).Scan(&kpi.TiempoPromedioDesp)

	// Procesos BPM pendientes de aprobar
	config.DB.QueryRow(`
		SELECT COUNT(*)
		FROM PROCESO_BPM
		WHERE estado_proceso = 'Generado'`).Scan(&kpi.BPMPendientes)

	c.JSON(http.StatusOK, kpi)
}

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

func GetProductosTop(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT p.nombre_producto, NVL(SUM(d.cantidad), 0) as total_vendido
		FROM DETALLE_PEDIDO d
		JOIN PRODUCTO p ON d.id_producto = p.id_producto
		GROUP BY p.nombre_producto
		ORDER BY total_vendido DESC
		FETCH FIRST 5 ROWS ONLY`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var productos []ProductoTop
	for rows.Next() {
		var p ProductoTop
		rows.Scan(&p.NombreProducto, &p.TotalVendido)
		productos = append(productos, p)
	}

	if productos == nil {
		productos = []ProductoTop{}
	}

	c.JSON(http.StatusOK, productos)
}