package handlers

import (
	"net/http"
	"techstore-api/config"
	"techstore-api/models"

	"github.com/gin-gonic/gin"
)

// GET /api/procesos-bpm - lista todos los procesos
func ListarProcesosBPM(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT b.id_proceso, b.id_proveedor, b.id_producto,
		       p.nombre_producto, pr.razon_social,
		       b.cantidad_solicitada, b.estado_proceso,
		       TO_CHAR(b.fecha_inicio, 'YYYY-MM-DD'),
		       NVL(TO_CHAR(b.fecha_aprobacion, 'YYYY-MM-DD'), ''),
		       NVL(TO_CHAR(b.fecha_recepcion, 'YYYY-MM-DD'), ''),
		       b.activado_automaticamente
		FROM PROCESO_BPM b
		JOIN PRODUCTO p ON b.id_producto = p.id_producto
		JOIN PROVEEDOR pr ON b.id_proveedor = pr.id_proveedor
		ORDER BY b.fecha_inicio DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var lista []models.ProcesoBPM
	for rows.Next() {
		var b models.ProcesoBPM
		err := rows.Scan(&b.IDProceso, &b.IDProveedor, &b.IDProducto,
			&b.NombreProducto, &b.NombreProveedor,
			&b.CantidadSolicitada, &b.EstadoProceso,
			&b.FechaInicio, &b.FechaAprobacion, &b.FechaRecepcion,
			&b.ActivadoAutomaticamente)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		lista = append(lista, b)
	}

	if lista == nil {
		lista = []models.ProcesoBPM{}
	}

	c.JSON(http.StatusOK, lista)
}

// POST /api/procesos-bpm - generar orden manualmente
func GenerarProcesoBPM(c *gin.Context) {
	var req models.GenerarBPMRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos invalidos"})
		return
	}

	_, err := config.DB.Exec(`
		INSERT INTO PROCESO_BPM (id_proveedor, id_producto, cantidad_solicitada, activado_automaticamente)
		VALUES (:1, :2, :3, 0)`,
		req.IDProveedor, req.IDProducto, req.CantidadSolicitada)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"mensaje": "Proceso BPM generado exitosamente"})
}

// PUT /api/procesos-bpm/:id/aprobar - aprobar orden usando SP
func AprobarProcesoBPM(c *gin.Context) {
	idProceso := c.Param("id")
	var req models.AprobarBPMRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos invalidos"})
		return
	}

	_, err := config.DB.Exec(`
		BEGIN
			SP_APROBAR_PROCESO_BPM(:1, :2);
		END;`,
		idProceso, req.IDEmpleado)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"mensaje": "Proceso BPM aprobado exitosamente"})
}

// PUT /api/procesos-bpm/:id/recibir - confirmar recepcion de mercaderia
func RecibirProcesoBPM(c *gin.Context) {
	idProceso := c.Param("id")

	// Obtener datos del proceso
	var idProducto, cantidad int
	err := config.DB.QueryRow(`
		SELECT id_producto, cantidad_solicitada
		FROM PROCESO_BPM WHERE id_proceso = :1`, idProceso).
		Scan(&idProducto, &cantidad)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Proceso no encontrado"})
		return
	}

	// Actualizar proceso a Recibido y sumar stock
	tx, err := config.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	_, err = tx.Exec(`
		UPDATE PROCESO_BPM
		SET estado_proceso = 'Recibido', fecha_recepcion = SYSDATE
		WHERE id_proceso = :1`, idProceso)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	_, err = tx.Exec(`
		UPDATE INVENTARIO
		SET stock_actual = stock_actual + :1, fecha_actualizacion = SYSDATE
		WHERE id_producto = :2`, cantidad, idProducto)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"mensaje": "Mercaderia recibida, inventario actualizado"})
}