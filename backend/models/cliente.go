package models

type Cliente struct {
	IDCliente     int    `json:"id_cliente"`
	Nombres       string `json:"nombres"`
	Apellidos     string `json:"apellidos"`
	Correo        string `json:"correo"`
	Telefono      string `json:"telefono"`
	Direccion     string `json:"direccion"`
	FechaRegistro string `json:"fecha_registro,omitempty"`
}