package routes

import (
	"techstore-api/handlers"

	"github.com/gin-gonic/gin"
)

func ConfigurarRutas(r *gin.Engine) {
	api := r.Group("/api")
	{
		// Auth (publico)
		api.POST("/auth/login", handlers.Login)

		// Productos
		api.GET("/productos", handlers.ListarProductos)
	}
}