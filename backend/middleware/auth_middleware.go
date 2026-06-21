package middleware

import (
	"net/http"
	"strings"
	"techstore-api/services"

	"github.com/gin-gonic/gin"
)

func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token no proporcionado"})
			c.Abort()
			return
		}

		partes := strings.Split(authHeader, " ")
		if len(partes) != 2 || partes[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Formato de token invalido"})
			c.Abort()
			return
		}

		claims, err := services.ValidarToken(partes[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token invalido o expirado"})
			c.Abort()
			return
		}

		// Guarda los datos del usuario en el contexto para usar en los handlers
		c.Set("id_usuario", claims.IDUsuario)
		c.Set("rol", claims.Rol)

		c.Next()
	}
}

// RolRequired exige que el usuario tenga uno de los roles permitidos
func RolRequired(rolesPermitidos ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		rolUsuario, exists := c.Get("rol")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "No se pudo verificar el rol"})
			c.Abort()
			return
		}

		permitido := false
		for _, r := range rolesPermitidos {
			if rolUsuario == r {
				permitido = true
				break
			}
		}

		if !permitido {
			c.JSON(http.StatusForbidden, gin.H{"error": "No tiene permisos para esta accion"})
			c.Abort()
			return
		}

		c.Next()
	}
}