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

	var p models.Pedido
	err := config.DB.QueryRow(`
		SELECT id_pedido, id_cliente, id_empleado,
		       TO_CHAR(fecha_pedido, 'YYYY-MM-DD'),
		       estado, total
		FROM PEDIDO WHERE id_pedido = :1`, idPedido).
		Scan(&p.IDPedido, &p.IDCliente, &p.IDEmpleado,
			&p.FechaPedido, &p.Estado, &p.Total)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pedido no encontrado"})
		return
	}

	c.JSON(http.StatusOK, p)
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
