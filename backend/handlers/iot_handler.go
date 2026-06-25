package handlers

import (
	"net/http"
	"techstore-api/config"
	"techstore-api/models"

	"github.com/gin-gonic/gin"
)

// POST /api/iot/lectura - recibe evento desde Node-RED
func RegistrarLecturaIOT(c *gin.Context) {
	var req models.LecturaIOTRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos invalidos: " + err.Error()})
		return
	}

	if req.TipoEvento == "Despacho" && req.IDEnvio == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El envio es obligatorio para confirmar un despacho"})
		return
	}

	// Buscar producto por codigo de barras
	var idProducto int
	var nombreProducto string
	err := config.DB.QueryRow(`
		SELECT id_producto, nombre_producto
		FROM PRODUCTO WHERE codigo_barras = :1`, req.CodigoBarras).
		Scan(&idProducto, &nombreProducto)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Producto no encontrado con ese codigo de barras"})
		return
	}

	// Registrar lectura IoT
	_, err = config.DB.Exec(`
		BEGIN
			SP_CONFIRMAR_DESPACHO(:1, :2, :3, :4);
		END;`,
		req.IDDispositivo, req.CodigoBarras, req.IDEnvio, req.TipoEvento)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"mensaje":      "Lectura IoT registrada exitosamente",
		"producto":     nombreProducto,
		"codigo_leido": req.CodigoBarras,
		"tipo_evento":  req.TipoEvento,
	})
}

// GET /api/envios/pendientes - envios listos para confirmacion IoT
func ListarEnviosPendientes(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT e.id_envio, e.id_pedido, pe.id_cliente,
		       cl.nombres || ' ' || cl.apellidos AS cliente,
		       d.id_producto, p.nombre_producto, p.codigo_barras,
		       d.cantidad, TO_CHAR(pe.fecha_pedido, 'YYYY-MM-DD'),
		       pe.estado, e.estado_envio
		FROM ENVIO e
		JOIN PEDIDO pe ON pe.id_pedido = e.id_pedido
		JOIN CLIENTE cl ON cl.id_cliente = pe.id_cliente
		JOIN DETALLE_PEDIDO d ON d.id_pedido = pe.id_pedido
		JOIN PRODUCTO p ON p.id_producto = d.id_producto
		WHERE e.estado_envio IN ('Pendiente', 'En preparacion')
		ORDER BY pe.fecha_pedido DESC, e.id_envio DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	type EnvioPendiente struct {
		IDEnvio        int    `json:"id_envio"`
		IDPedido       int    `json:"id_pedido"`
		IDCliente      int    `json:"id_cliente"`
		Cliente        string `json:"cliente"`
		IDProducto     int    `json:"id_producto"`
		NombreProducto string `json:"nombre_producto"`
		CodigoBarras   string `json:"codigo_barras"`
		Cantidad       int    `json:"cantidad"`
		FechaPedido    string `json:"fecha_pedido"`
		EstadoPedido   string `json:"estado_pedido"`
		EstadoEnvio    string `json:"estado_envio"`
	}

	var envios []EnvioPendiente
	for rows.Next() {
		var e EnvioPendiente
		err := rows.Scan(&e.IDEnvio, &e.IDPedido, &e.IDCliente,
			&e.Cliente, &e.IDProducto, &e.NombreProducto, &e.CodigoBarras,
			&e.Cantidad, &e.FechaPedido, &e.EstadoPedido, &e.EstadoEnvio)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		envios = append(envios, e)
	}

	if envios == nil {
		envios = []EnvioPendiente{}
	}

	c.JSON(http.StatusOK, envios)
}

// GET /api/iot/lecturas - lista todas las lecturas
func ListarLecturasIOT(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT l.id_lectura, l.id_dispositivo, l.id_producto,
		       NVL(l.id_envio, 0), p.nombre_producto,
		       l.codigo_leido, l.tipo_evento,
		       TO_CHAR(l.fecha_lectura - INTERVAL '5' HOUR, 'YYYY-MM-DD HH24:MI:SS')
		FROM LECTURA_IOT l
		JOIN PRODUCTO p ON l.id_producto = p.id_producto
		ORDER BY l.fecha_lectura DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	type LecturaDetalle struct {
		IDLectura      int    `json:"id_lectura"`
		IDDispositivo  int    `json:"id_dispositivo"`
		IDProducto     int    `json:"id_producto"`
		IDEnvio        int    `json:"id_envio"`
		NombreProducto string `json:"nombre_producto"`
		CodigoLeido    string `json:"codigo_leido"`
		TipoEvento     string `json:"tipo_evento"`
		FechaLectura   string `json:"fecha_lectura"`
	}

	var lecturas []LecturaDetalle
	for rows.Next() {
		var l LecturaDetalle
		err := rows.Scan(&l.IDLectura, &l.IDDispositivo, &l.IDProducto,
			&l.IDEnvio, &l.NombreProducto, &l.CodigoLeido,
			&l.TipoEvento, &l.FechaLectura)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		lecturas = append(lecturas, l)
	}

	if lecturas == nil {
		lecturas = []LecturaDetalle{}
	}

	c.JSON(http.StatusOK, lecturas)
}
