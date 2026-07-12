package models

type PedidoRequest struct {
	IDCliente  int `json:"id_cliente" binding:"required"`
	IDProducto int `json:"id_producto" binding:"required"`
	Cantidad   int `json:"cantidad" binding:"required,min=1"`
	IDMetodo   int `json:"id_metodo_pago" binding:"required"`
}

type PedidoResponse struct {
	IDPedido string `json:"id_pedido"`
	Mensaje  string `json:"mensaje"`
}

type Pedido struct {
	IDPedido      int     `json:"id_pedido"`
	IDCliente     int     `json:"id_cliente"`
	Cliente       string  `json:"cliente"`
	IDEmpleado    int     `json:"id_empleado"`
	Empleado      string  `json:"empleado"`
	FechaPedido   string  `json:"fecha_pedido"`
	Estado        string  `json:"estado"`
	EstadoEnvio   string  `json:"estado_envio"`
	Total         float64 `json:"total"`
	Observaciones string  `json:"observaciones"`
}
