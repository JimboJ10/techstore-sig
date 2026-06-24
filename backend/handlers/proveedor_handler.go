package handlers

import (
	"net/http"
	"techstore-api/config"

	"github.com/gin-gonic/gin"
)

type Proveedor struct {
	IDProveedor  int    `json:"id_proveedor"`
	RazonSocial  string `json:"razon_social"`
	RUC          string `json:"ruc"`
	Correo       string `json:"correo"`
	Telefono     string `json:"telefono"`
	ContactoNombre string `json:"contacto_nombre"`
}

func ListarProveedores(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT id_proveedor, razon_social, ruc, correo, telefono, contacto_nombre
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
		rows.Scan(&p.IDProveedor, &p.RazonSocial, &p.RUC,
			&p.Correo, &p.Telefono, &p.ContactoNombre)
		proveedores = append(proveedores, p)
	}

	if proveedores == nil {
		proveedores = []Proveedor{}
	}

	c.JSON(http.StatusOK, proveedores)
}