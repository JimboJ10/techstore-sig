package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"strings"
	"techstore-api/config"
	"techstore-api/models"

	"github.com/gin-gonic/gin"
)

type PedidoDetalleResponse struct {
	IDPedido      int     `json:"id_pedido"`
	IDCliente     int     `json:"id_cliente"`
	Cliente       string  `json:"cliente"`
	IDEmpleado    int     `json:"id_empleado"`
	Empleado      string  `json:"empleado"`
	FechaPedido   string  `json:"fecha_pedido"`
	Estado        string  `json:"estado"`
	EstadoEnvio   string  `json:"estado_envio"`
	Total         float64 `json:"total"`
	IDEnvio       int     `json:"id_envio"`
	IDProducto    int     `json:"id_producto"`
	Producto      string  `json:"producto"`
	Cantidad      int     `json:"cantidad"`
	PrecioUnitario float64 `json:"precio_unitario"`
}

// POST /api/ventas - registra venta completa usando SP_REGISTRAR_VENTA
func RegistrarVenta(c *gin.Context) {
	var req models.PedidoRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos invalidos: " + err.Error()})
		return
	}

	idEmpleado, ok := c.Get("id_empleado")
	if !ok {
		c.JSON(http.StatusForbidden, gin.H{"error": "No se pudo verificar el empleado autenticado"})
		return
	}

	var idPedido int
	_, err := config.DB.Exec(`
		BEGIN
			SP_REGISTRAR_VENTA(:1, :2, :3, :4, :5, :6);
		END;`,
		req.IDCliente, idEmpleado, req.IDProducto,
		req.Cantidad, req.IDMetodo, sql.Out{Dest: &idPedido})

	if err != nil {
		if strings.Contains(err.Error(), "Stock insuficiente") {
			c.JSON(http.StatusConflict, gin.H{"error": "Stock insuficiente para registrar la venta"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, models.PedidoResponse{
		IDPedido: strconv.Itoa(idPedido),
		Mensaje:  "Venta registrada exitosamente",
	})
}

// GET /api/ventas - lista todos los pedidos
func ListarVentas(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT p.id_pedido, p.id_cliente, p.id_empleado,
		       TO_CHAR(p.fecha_pedido, 'YYYY-MM-DD') as fecha_pedido,
		       p.estado, p.total
		FROM PEDIDO p
		ORDER BY p.fecha_pedido DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var pedidos []models.Pedido
	for rows.Next() {
		var p models.Pedido
		err := rows.Scan(&p.IDPedido, &p.IDCliente, &p.IDEmpleado,
			&p.FechaPedido, &p.Estado, &p.Total)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		pedidos = append(pedidos, p)
	}

	if pedidos == nil {
		pedidos = []models.Pedido{}
	}

	c.JSON(http.StatusOK, pedidos)
}

// GET /api/ventas/:id - detalle de un pedido
func DetallePedido(c *gin.Context) {
	idPedido := c.Param("id")

	var p PedidoDetalleResponse
	err := config.DB.QueryRow(`
		SELECT pe.id_pedido,
		       pe.id_cliente,
		       cl.nombres || ' ' || cl.apellidos,
		       pe.id_empleado,
		       em.nombres || ' ' || em.apellidos,
		       TO_CHAR(pe.fecha_pedido, 'YYYY-MM-DD'),
		       pe.estado,
		       NVL(en.estado_envio, 'Sin envio'),
		       pe.total,
		       NVL(en.id_envio, 0),
		       NVL(dp.id_producto, 0),
		       NVL(pr.nombre_producto, ''),
		       NVL(dp.cantidad, 0),
		       NVL(dp.precio_unitario, 0)
		FROM PEDIDO pe
		JOIN CLIENTE cl ON cl.id_cliente = pe.id_cliente
		JOIN EMPLEADO em ON em.id_empleado = pe.id_empleado
		LEFT JOIN ENVIO en ON en.id_pedido = pe.id_pedido
		LEFT JOIN DETALLE_PEDIDO dp ON dp.id_pedido = pe.id_pedido
		LEFT JOIN PRODUCTO pr ON pr.id_producto = dp.id_producto
		WHERE pe.id_pedido = :1`, idPedido).
		Scan(&p.IDPedido, &p.IDCliente, &p.Cliente, &p.IDEmpleado, &p.Empleado,
			&p.FechaPedido, &p.Estado, &p.EstadoEnvio, &p.Total, &p.IDEnvio,
			&p.IDProducto, &p.Producto, &p.Cantidad, &p.PrecioUnitario)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pedido no encontrado"})
		return
	}

	c.JSON(http.StatusOK, p)
}

// PUT /api/ventas/:id/entregar - marca el pedido como entregado al cliente
func MarcarPedidoEntregado(c *gin.Context) {
	idPedido := c.Param("id")

	var estadoActual string
	var idEnvio int
	err := config.DB.QueryRow(`
		SELECT pe.estado,
		       NVL(en.id_envio, 0)
		FROM PEDIDO pe
		LEFT JOIN ENVIO en ON en.id_pedido = pe.id_pedido
		WHERE pe.id_pedido = :1`, idPedido).Scan(&estadoActual, &idEnvio)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pedido no encontrado"})
		return
	}

	if estadoActual != "Despachado" && estadoActual != "Pagado" {
		c.JSON(http.StatusConflict, gin.H{"error": "Solo se puede entregar un pedido pagado o despachado"})
		return
	}

	tx, err := config.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	_, err = tx.Exec(`
		UPDATE PEDIDO
		SET estado = 'Entregado'
		WHERE id_pedido = :1`, idPedido)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if idEnvio > 0 {
		_, err = tx.Exec(`
			UPDATE ENVIO
			SET estado_envio = 'Entregado',
			    fecha_entrega_real = SYSDATE
			WHERE id_envio = :1`, idEnvio)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"mensaje": "Pedido entregado correctamente"})
}

type MetodoPago struct {
	IDMetodoPago int    `json:"id_metodo_pago"`
	NombreMetodo string `json:"nombre_metodo"`
	Descripcion  string `json:"descripcion"`
}

// GET /api/metodos-pago - lista metodos configurados en Oracle
func ListarMetodosPago(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT id_metodo_pago, nombre_metodo, NVL(descripcion, '')
		FROM METODO_PAGO
		ORDER BY id_metodo_pago`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var metodos []MetodoPago
	for rows.Next() {
		var m MetodoPago
		if err := rows.Scan(&m.IDMetodoPago, &m.NombreMetodo, &m.Descripcion); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		metodos = append(metodos, m)
	}

	if metodos == nil {
		metodos = []MetodoPago{}
	}

	c.JSON(http.StatusOK, metodos)
}
