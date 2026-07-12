package models

// Producto — estructura base + campos enriquecidos para el catálogo
type Producto struct {
	IDProducto      int     `json:"id_producto"`
	IDCategoria     int     `json:"id_categoria"`
	NombreCategoria string  `json:"nombre_categoria"`
	IDMarca         int     `json:"id_marca"`
	NombreMarca     string  `json:"nombre_marca"`
	NombreProducto  string  `json:"nombre_producto"`
	Descripcion     string  `json:"descripcion"`
	PrecioUnitario  float64 `json:"precio_unitario"`
	CodigoBarras    string  `json:"codigo_barras"`
	Activo          int     `json:"activo"`
	// Campos de inventario (LEFT JOIN — presentes en listado del catálogo)
	StockActual     int    `json:"stock_actual"`
	StockMinimo     int    `json:"stock_minimo"`
	StockMaximo     int    `json:"stock_maximo"`
	UbicacionBodega string `json:"ubicacion_bodega"`
}

// ProductoCreateRequest — payload para POST /api/productos
type ProductoCreateRequest struct {
	IDCategoria     int     `json:"id_categoria" binding:"required"`
	IDMarca         int     `json:"id_marca" binding:"required"`
	NombreProducto  string  `json:"nombre_producto" binding:"required"`
	Descripcion     string  `json:"descripcion"`
	PrecioUnitario  float64 `json:"precio_unitario" binding:"required,gt=0"`
	CodigoBarras    string  `json:"codigo_barras"`
	StockInicial    int     `json:"stock_inicial"`
	StockMinimo     int     `json:"stock_minimo"`
	StockMaximo     int     `json:"stock_maximo"`
	UbicacionBodega string  `json:"ubicacion_bodega"`
}

// ProductoUpdateRequest — payload para PUT /api/productos/:id
type ProductoUpdateRequest struct {
	IDCategoria     int     `json:"id_categoria" binding:"required"`
	IDMarca         int     `json:"id_marca" binding:"required"`
	NombreProducto  string  `json:"nombre_producto" binding:"required"`
	Descripcion     string  `json:"descripcion"`
	PrecioUnitario  float64 `json:"precio_unitario" binding:"required,gt=0"`
	CodigoBarras    string  `json:"codigo_barras"`
	StockMinimo     int     `json:"stock_minimo"`
	StockMaximo     int     `json:"stock_maximo"`
	UbicacionBodega string  `json:"ubicacion_bodega"`
}

// Categoria y Marca — auxiliares para dropdowns
type Categoria struct {
	IDCategoria     int    `json:"id_categoria"`
	NombreCategoria string `json:"nombre_categoria"`
}

type Marca struct {
	IDMarca     int    `json:"id_marca"`
	NombreMarca string `json:"nombre_marca"`
}