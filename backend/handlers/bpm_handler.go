package handlers

import (
	"database/sql"
	"net/http"
	"strings"
	"techstore-api/config"
	"techstore-api/models"

	"github.com/gin-gonic/gin"
)

func ListarProcesosBPM(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT b.id_proceso, b.id_proveedor, b.id_producto,
		       p.nombre_producto, pr.razon_social,
		       b.cantidad_solicitada, b.estado_proceso,
		       TO_CHAR(b.fecha_inicio, 'YYYY-MM-DD'),
		       TO_CHAR(b.fecha_aprobacion, 'YYYY-MM-DD'),
		       TO_CHAR(b.fecha_recepcion, 'YYYY-MM-DD'),
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
		var fechaAprobacion, fechaRecepcion sql.NullString
		err := rows.Scan(&b.IDProceso, &b.IDProveedor, &b.IDProducto,
			&b.NombreProducto, &b.NombreProveedor,
			&b.CantidadSolicitada, &b.EstadoProceso,
			&b.FechaInicio, &fechaAprobacion, &fechaRecepcion,
			&b.ActivadoAutomaticamente)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if fechaAprobacion.Valid {
			b.FechaAprobacion = fechaAprobacion.String
		}
		if fechaRecepcion.Valid {
			b.FechaRecepcion = fechaRecepcion.String
		}
		lista = append(lista, b)
	}

	if lista == nil {
		lista = []models.ProcesoBPM{}
	}

	c.JSON(http.StatusOK, lista)
}

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

func AprobarProcesoBPM(c *gin.Context) {
	idProceso := c.Param("id")

	idEmpleado, ok := c.Get("id_empleado")
	if !ok {
		c.JSON(http.StatusForbidden, gin.H{"error": "No se pudo verificar el empleado autenticado"})
		return
	}

	_, err := config.DB.Exec(`
		BEGIN
			SP_APROBAR_PROCESO_BPM(:1, :2);
		END;`,
		idProceso, idEmpleado)

	if err != nil {
		if strings.Contains(err.Error(), "Solo se pueden aprobar") {
			c.JSON(http.StatusConflict, gin.H{"error": "Solo se pueden aprobar procesos en estado Generado"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"mensaje": "Proceso BPM aprobado exitosamente"})
}

func RecibirProcesoBPM(c *gin.Context) {
	idProceso := c.Param("id")

	var idProducto, cantidad int
	var estado string
	err := config.DB.QueryRow(`
		SELECT id_producto, cantidad_solicitada, estado_proceso
		FROM PROCESO_BPM WHERE id_proceso = :1`, idProceso).
		Scan(&idProducto, &cantidad, &estado)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Proceso no encontrado"})
		return
	}

	if estado != "Aprobado" && estado != "Enviado" {
		c.JSON(http.StatusConflict, gin.H{"error": "Solo se puede recibir mercaderia de procesos aprobados o enviados"})
		return
	}

	tx, err := config.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	_, err = tx.Exec(`
		UPDATE PROCESO_BPM
		SET estado_proceso = 'Recibido', fecha_recepcion = SYSDATE
		WHERE id_proceso = :1
		AND estado_proceso IN ('Aprobado', 'Enviado')`, idProceso)
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
