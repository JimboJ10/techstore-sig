package handlers

import (
	"database/sql"
	"net/http"
	"techstore-api/config"
	"techstore-api/models"

	"github.com/gin-gonic/gin"
)

// GET /api/inventario - lista completa con nombre de producto
func ListarInventario(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT i.id_inventario, i.id_producto, p.nombre_producto,
		       i.stock_actual, i.stock_minimo, i.stock_maximo, i.ubicacion_bodega
		FROM INVENTARIO i
		JOIN PRODUCTO p ON i.id_producto = p.id_producto
		ORDER BY i.id_inventario`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var lista []models.Inventario
	for rows.Next() {
		var inv models.Inventario
		var ubicacion sql.NullString
		err := rows.Scan(&inv.IDInventario, &inv.IDProducto, &inv.NombreProducto,
			&inv.StockActual, &inv.StockMinimo, &inv.StockMaximo, &ubicacion)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		inv.UbicacionBodega = ubicacion.String
		lista = append(lista, inv)
	}

	if lista == nil {
		lista = []models.Inventario{}
	}

	c.JSON(http.StatusOK, lista)
}

// GET /api/inventario/alertas - productos bajo el stock minimo
func AlertasStock(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT p.id_producto, p.nombre_producto, i.stock_actual, i.stock_minimo
		FROM INVENTARIO i
		JOIN PRODUCTO p ON i.id_producto = p.id_producto
		WHERE i.stock_actual < i.stock_minimo
		ORDER BY i.stock_actual ASC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var alertas []models.AlertaStock
	for rows.Next() {
		var a models.AlertaStock
		err := rows.Scan(&a.IDProducto, &a.NombreProducto, &a.StockActual, &a.StockMinimo)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		alertas = append(alertas, a)
	}

	if alertas == nil {
		alertas = []models.AlertaStock{}
	}

	c.JSON(http.StatusOK, alertas)
}
