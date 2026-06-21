package routes

import (
	"techstore-api/handlers"

	"github.com/gin-gonic/gin"
)

func ConfigurarRutas(r *gin.Engine) {
	api := r.Group("/api")
	{
		api.GET("/productos", handlers.ListarProductos)
	}
}