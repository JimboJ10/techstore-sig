package models

type Usuario struct {
	IDUsuario     int    `json:"id_usuario"`
	IDRol         int    `json:"id_rol"`
	NombreUsuario string `json:"nombre_usuario"`
	Correo        string `json:"correo"`
	PasswordHash  string `json:"-"`
	Activo        int    `json:"activo"`
}

type LoginRequest struct {
	Correo   string `json:"correo" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token         string `json:"token"`
	NombreUsuario string `json:"nombre_usuario"`
	Rol           string `json:"rol"`
}