package models

type Inventario struct {
	IDInventario        int    `json:"id_inventario"`
	IDProducto          int    `json:"id_producto"`
	NombreProducto      string `json:"nombre_producto,omitempty"`
	StockActual         int    `json:"stock_actual"`
	StockMinimo         int    `json:"stock_minimo"`
	StockMaximo         int    `json:"stock_maximo"`
	UbicacionBodega     string `json:"ubicacion_bodega"`
	FechaActualizacion  string `json:"fecha_actualizacion,omitempty"`
}

type AlertaStock struct {
	IDProducto     int    `json:"id_producto"`
	NombreProducto string `json:"nombre_producto"`
	StockActual    int    `json:"stock_actual"`
	StockMinimo    int    `json:"stock_minimo"`
}