package models

type Producto struct {
	IDProducto      int     `json:"id_producto"`
	IDCategoria     int     `json:"id_categoria"`
	IDMarca         int     `json:"id_marca"`
	NombreProducto  string  `json:"nombre_producto"`
	Descripcion     string  `json:"descripcion"`
	PrecioUnitario  float64 `json:"precio_unitario"`
	CodigoBarras    string  `json:"codigo_barras"`
	Activo          int     `json:"activo"`
}