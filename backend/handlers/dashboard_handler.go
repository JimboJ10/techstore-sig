package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetKPIs(c *gin.Context) {
	idUsuario, _ := c.Get("id_usuario")
	rol, _ := c.Get("rol")

	c.JSON(http.StatusOK, gin.H{
		"mensaje":    "Acceso autorizado al dashboard gerencial",
		"id_usuario": idUsuario,
		"rol":        rol,
	})
}