package handlers

import (
	"database/sql"
	"net/http"
	"techstore-api/config"
	"techstore-api/models"

	"github.com/gin-gonic/gin"
)

// GET /api/clientes
func ListarClientes(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT id_cliente, nombres, apellidos, correo, telefono, direccion
		FROM CLIENTE
		ORDER BY id_cliente`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var clientes []models.Cliente
	for rows.Next() {
		var cl models.Cliente
		var correo, telefono, direccion sql.NullString
		err := rows.Scan(&cl.IDCliente, &cl.Nombres, &cl.Apellidos,
			&correo, &telefono, &direccion)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		cl.Correo = correo.String
		cl.Telefono = telefono.String
		cl.Direccion = direccion.String
		clientes = append(clientes, cl)
	}

	if clientes == nil {
		clientes = []models.Cliente{}
	}

	c.JSON(http.StatusOK, clientes)
}

// POST /api/clientes - crear nuevo cliente
func CrearCliente(c *gin.Context) {
	var cl models.Cliente

	if err := c.ShouldBindJSON(&cl); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos invalidos"})
		return
	}

	if cl.Nombres == "" || cl.Apellidos == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nombres y apellidos son obligatorios"})
		return
	}

	var idGenerado int
	_, err := config.DB.Exec(`
		INSERT INTO CLIENTE (nombres, apellidos, correo, telefono, direccion)
		VALUES (:1, :2, :3, :4, :5)
		RETURNING id_cliente INTO :6`,
		cl.Nombres, cl.Apellidos, cl.Correo, cl.Telefono, cl.Direccion,
		sql.Out{Dest: &idGenerado})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	cl.IDCliente = idGenerado
	c.JSON(http.StatusCreated, cl)
}

// GET /api/clientes/:id/historial
func HistorialCliente(c *gin.Context) {
	idCliente := c.Param("id")

	rows, err := config.DB.Query(`
		SELECT pe.id_pedido, TO_CHAR(pe.fecha_pedido, 'YYYY-MM-DD'), pe.estado, pe.total
		FROM PEDIDO pe
		WHERE pe.id_cliente = :1
		ORDER BY pe.fecha_pedido DESC`, idCliente)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	type PedidoHistorial struct {
		IDPedido    int     `json:"id_pedido"`
		FechaPedido string  `json:"fecha_pedido"`
		Estado      string  `json:"estado"`
		Total       float64 `json:"total"`
	}

	var historial []PedidoHistorial
	for rows.Next() {
		var p PedidoHistorial
		err := rows.Scan(&p.IDPedido, &p.FechaPedido, &p.Estado, &p.Total)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		historial = append(historial, p)
	}

	if historial == nil {
		historial = []PedidoHistorial{}
	}

	c.JSON(http.StatusOK, historial)
}
