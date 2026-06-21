package handlers

import (
	"net/http"
	"techstore-api/config"
	"techstore-api/models"

	"github.com/gin-gonic/gin"
)

func ListarProductos(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT id_producto, id_categoria, id_marca, nombre_producto, 
		       precio_unitario, codigo_barras, activo 
		FROM PRODUCTO 
		WHERE activo = 1
		ORDER BY id_producto`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var productos []models.Producto
	for rows.Next() {
		var p models.Producto
		err := rows.Scan(&p.IDProducto, &p.IDCategoria, &p.IDMarca,
			&p.NombreProducto, &p.PrecioUnitario, &p.CodigoBarras, &p.Activo)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		productos = append(productos, p)
	}

	c.JSON(http.StatusOK, productos)
}