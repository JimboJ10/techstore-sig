package handlers

import (
	"net/http"
	"techstore-api/config"
	"techstore-api/models"
	"techstore-api/services"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func Login(c *gin.Context) {
	var req models.LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos invalidos"})
		return
	}

	var usuario models.Usuario
	var nombreRol string

	query := `
		SELECT u.id_usuario, u.id_rol, u.nombre_usuario, u.correo, 
		       u.password_hash, u.activo, r.nombre_rol
		FROM USUARIO u
		JOIN ROL r ON u.id_rol = r.id_rol
		WHERE u.correo = :1 AND u.activo = 1`

	row := config.DB.QueryRow(query, req.Correo)
	err := row.Scan(&usuario.IDUsuario, &usuario.IDRol, &usuario.NombreUsuario,
		&usuario.Correo, &usuario.PasswordHash, &usuario.Activo, &nombreRol)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciales invalidas"})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(usuario.PasswordHash), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciales invalidas"})
		return
	}

	token, err := services.GenerarToken(usuario.IDUsuario, nombreRol)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generando token"})
		return
	}

	c.JSON(http.StatusOK, models.LoginResponse{
		Token:         token,
		NombreUsuario: usuario.NombreUsuario,
		Rol:           nombreRol,
	})
}