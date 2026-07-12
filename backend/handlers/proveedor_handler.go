package handlers

import (
	"database/sql"
	"net/http"
	"strings"
	"techstore-api/config"

	"github.com/gin-gonic/gin"
)

type Proveedor struct {
	IDProveedor    int    `json:"id_proveedor"`
	RazonSocial    string `json:"razon_social"`
	RUC            string `json:"ruc"`
	Correo         string `json:"correo"`
	Telefono       string `json:"telefono"`
	Direccion      string `json:"direccion"`
	ContactoNombre string `json:"contacto_nombre"`
}

type ProveedorRequest struct {
	RazonSocial    string `json:"razon_social" binding:"required"`
	RUC            string `json:"ruc"`
	Correo         string `json:"correo"`
	Telefono       string `json:"telefono"`
	Direccion      string `json:"direccion"`
	ContactoNombre string `json:"contacto_nombre"`
}

// GET /api/proveedores
func ListarProveedores(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT id_proveedor, razon_social,
		       ruc, correo,
		       telefono, direccion, contacto_nombre
		FROM PROVEEDOR
		ORDER BY id_proveedor`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var proveedores []Proveedor
	for rows.Next() {
		var p Proveedor
		var ruc, correo, telefono, direccion, contacto sql.NullString
		err := rows.Scan(&p.IDProveedor, &p.RazonSocial,
			&ruc, &correo, &telefono, &direccion, &contacto)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		p.RUC = ruc.String
		p.Correo = correo.String
		p.Telefono = telefono.String
		p.Direccion = direccion.String
		p.ContactoNombre = contacto.String
		proveedores = append(proveedores, p)
	}

	if proveedores == nil {
		proveedores = []Proveedor{}
	}

	c.JSON(http.StatusOK, proveedores)
}

// POST /api/proveedores
func CrearProveedor(c *gin.Context) {
	var req ProveedorRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos invalidos: " + err.Error()})
		return
	}

	var idGenerado int
	_, err := config.DB.Exec(`
		INSERT INTO PROVEEDOR (razon_social, ruc, correo, telefono, direccion, contacto_nombre)
		VALUES (:1, :2, :3, :4, :5, :6)
		RETURNING id_proveedor INTO :7`,
		req.RazonSocial, req.RUC, req.Correo, req.Telefono, req.Direccion, req.ContactoNombre,
		sql.Out{Dest: &idGenerado})

	if err != nil {
		if strings.Contains(err.Error(), "unique constraint") || strings.Contains(err.Error(), "ORA-00001") {
			c.JSON(http.StatusConflict, gin.H{"error": "El RUC ya existe en otro proveedor"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, Proveedor{
		IDProveedor:    idGenerado,
		RazonSocial:    req.RazonSocial,
		RUC:            req.RUC,
		Correo:         req.Correo,
		Telefono:       req.Telefono,
		Direccion:      req.Direccion,
		ContactoNombre: req.ContactoNombre,
	})
}

// PUT /api/proveedores/:id
func ActualizarProveedor(c *gin.Context) {
	idProveedor := c.Param("id")

	var req ProveedorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos invalidos: " + err.Error()})
		return
	}

	res, err := config.DB.Exec(`
		UPDATE PROVEEDOR
		SET razon_social = :1, ruc = :2, correo = :3,
		    telefono = :4, direccion = :5, contacto_nombre = :6
		WHERE id_proveedor = :7`,
		req.RazonSocial, req.RUC, req.Correo, req.Telefono,
		req.Direccion, req.ContactoNombre, idProveedor)

	if err != nil {
		if strings.Contains(err.Error(), "unique constraint") || strings.Contains(err.Error(), "ORA-00001") {
			c.JSON(http.StatusConflict, gin.H{"error": "El RUC ya existe en otro proveedor"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Proveedor no encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"mensaje": "Proveedor actualizado exitosamente"})
}

// DELETE /api/proveedores/:id — físico con validación de FK a PROCESO_BPM
func EliminarProveedor(c *gin.Context) {
	idProveedor := c.Param("id")

	// Verificar que no tenga procesos BPM asociados
	var count int
	err := config.DB.QueryRow(`
		SELECT COUNT(*) FROM PROCESO_BPM
		WHERE id_proveedor = :1`, idProveedor).Scan(&count)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{
			"error": "No se puede eliminar el proveedor porque tiene órdenes de compra asociadas",
		})
		return
	}

	res, err := config.DB.Exec(`
		DELETE FROM PROVEEDOR WHERE id_proveedor = :1`, idProveedor)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Proveedor no encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"mensaje": "Proveedor eliminado exitosamente"})
}
