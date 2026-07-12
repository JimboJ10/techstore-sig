package handlers

import (
	"database/sql"
	"net/http"
	"strings"
	"techstore-api/config"
	"techstore-api/models"

	"github.com/gin-gonic/gin"
)

// GET /api/productos — lista activos con categoría, marca e inventario
func ListarProductos(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT p.id_producto, p.id_categoria, c.nombre_categoria,
		       p.id_marca, m.nombre_marca, p.nombre_producto,
		       NVL(p.descripcion, ''), p.precio_unitario,
		       NVL(p.codigo_barras, ''), p.activo,
		       NVL(i.stock_actual, 0), NVL(i.stock_minimo, 0),
		       NVL(i.stock_maximo, 0), NVL(i.ubicacion_bodega, '')
		FROM PRODUCTO p
		JOIN CATEGORIA c ON c.id_categoria = p.id_categoria
		JOIN MARCA m ON m.id_marca = p.id_marca
		LEFT JOIN INVENTARIO i ON i.id_producto = p.id_producto
		WHERE p.activo = 1
		ORDER BY p.id_producto`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var productos []models.Producto
	for rows.Next() {
		var p models.Producto
		err := rows.Scan(
			&p.IDProducto, &p.IDCategoria, &p.NombreCategoria,
			&p.IDMarca, &p.NombreMarca, &p.NombreProducto,
			&p.Descripcion, &p.PrecioUnitario, &p.CodigoBarras, &p.Activo,
			&p.StockActual, &p.StockMinimo, &p.StockMaximo, &p.UbicacionBodega)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		productos = append(productos, p)
	}

	if productos == nil {
		productos = []models.Producto{}
	}

	c.JSON(http.StatusOK, productos)
}

// GET /api/categorias — lista de categorías para dropdowns
func ListarCategorias(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT id_categoria, nombre_categoria
		FROM CATEGORIA
		ORDER BY id_categoria`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var lista []models.Categoria
	for rows.Next() {
		var cat models.Categoria
		if err := rows.Scan(&cat.IDCategoria, &cat.NombreCategoria); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		lista = append(lista, cat)
	}

	if lista == nil {
		lista = []models.Categoria{}
	}
	c.JSON(http.StatusOK, lista)
}

// GET /api/marcas — lista de marcas para dropdowns
func ListarMarcas(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT id_marca, nombre_marca
		FROM MARCA
		ORDER BY id_marca`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var lista []models.Marca
	for rows.Next() {
		var m models.Marca
		if err := rows.Scan(&m.IDMarca, &m.NombreMarca); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		lista = append(lista, m)
	}

	if lista == nil {
		lista = []models.Marca{}
	}
	c.JSON(http.StatusOK, lista)
}

// POST /api/productos — crea producto + fila en INVENTARIO en transacción
func CrearProducto(c *gin.Context) {
	var req models.ProductoCreateRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos invalidos: " + err.Error()})
		return
	}

	tx, err := config.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var idProducto int
	_, err = tx.Exec(`
		INSERT INTO PRODUCTO (id_categoria, id_marca, nombre_producto, descripcion,
		                      precio_unitario, codigo_barras, activo)
		VALUES (:1, :2, :3, :4, :5, :6, 1)
		RETURNING id_producto INTO :7`,
		req.IDCategoria, req.IDMarca, req.NombreProducto, req.Descripcion,
		req.PrecioUnitario, req.CodigoBarras,
		sql.Out{Dest: &idProducto})

	if err != nil {
		tx.Rollback()
		if strings.Contains(err.Error(), "unique constraint") || strings.Contains(err.Error(), "ORA-00001") {
			c.JSON(http.StatusConflict, gin.H{"error": "El código de barras ya existe en otro producto"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	stockMin := req.StockMinimo
	if stockMin <= 0 {
		stockMin = 5
	}
	stockMax := req.StockMaximo
	if stockMax <= 0 {
		stockMax = 100
	}

	_, err = tx.Exec(`
		INSERT INTO INVENTARIO (id_producto, stock_actual, stock_minimo, stock_maximo, ubicacion_bodega)
		VALUES (:1, :2, :3, :4, :5)`,
		idProducto, req.StockInicial, stockMin, stockMax, req.UbicacionBodega)

	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"mensaje":     "Producto creado exitosamente",
		"id_producto": idProducto,
	})
}

// PUT /api/productos/:id — actualiza datos del producto e inventario
func ActualizarProducto(c *gin.Context) {
	idProducto := c.Param("id")

	var req models.ProductoUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos invalidos: " + err.Error()})
		return
	}

	tx, err := config.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	res, err := tx.Exec(`
		UPDATE PRODUCTO
		SET id_categoria = :1, id_marca = :2, nombre_producto = :3,
		    descripcion = :4, precio_unitario = :5, codigo_barras = :6
		WHERE id_producto = :7 AND activo = 1`,
		req.IDCategoria, req.IDMarca, req.NombreProducto,
		req.Descripcion, req.PrecioUnitario, req.CodigoBarras, idProducto)

	if err != nil {
		tx.Rollback()
		if strings.Contains(err.Error(), "unique constraint") || strings.Contains(err.Error(), "ORA-00001") {
			c.JSON(http.StatusConflict, gin.H{"error": "El código de barras ya existe en otro producto"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "Producto no encontrado o ya inactivo"})
		return
	}

	// Actualizar campos del inventario (sin tocar stock_actual — lo manejan los SPs)
	_, err = tx.Exec(`
		UPDATE INVENTARIO
		SET stock_minimo = :1, stock_maximo = :2,
		    ubicacion_bodega = :3, fecha_actualizacion = SYSDATE
		WHERE id_producto = :4`,
		req.StockMinimo, req.StockMaximo, req.UbicacionBodega, idProducto)

	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"mensaje": "Producto actualizado exitosamente"})
}

// DELETE /api/productos/:id — baja lógica (activo = 0), seguro con todas las FK
func DesactivarProducto(c *gin.Context) {
	idProducto := c.Param("id")

	res, err := config.DB.Exec(`
		UPDATE PRODUCTO SET activo = 0
		WHERE id_producto = :1 AND activo = 1`, idProducto)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Producto no encontrado o ya estaba inactivo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"mensaje": "Producto desactivado del catálogo"})
}
