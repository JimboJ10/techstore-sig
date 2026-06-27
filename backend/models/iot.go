package models

type LecturaIOT struct {
	IDLectura     int    `json:"id_lectura"`
	IDDispositivo int    `json:"id_dispositivo"`
	IDProducto    int    `json:"id_producto"`
	IDEnvio       int    `json:"id_envio"`
	CodigoLeido   string `json:"codigo_leido"`
	TipoEvento    string `json:"tipo_evento"`
	FechaLectura  string `json:"fecha_lectura"`
}

type LecturaIOTRequest struct {
	IDDispositivo int    `json:"id_dispositivo" binding:"required"`
	CodigoLeido   string `json:"codigo_leido" binding:"required"`
	CodigoBarras  string `json:"codigo_barras"`
	IDEnvio       int    `json:"id_envio"`
	TipoEvento    string `json:"tipo_evento" binding:"required,oneof=Despacho Recepcion"`
	Timestamp     string `json:"timestamp"`
}
