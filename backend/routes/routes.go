package routes

import (
	"techstore-api/handlers"
	"techstore-api/middleware"

	"github.com/gin-gonic/gin"
)

func ConfigurarRutas(r *gin.Engine) {
	api := r.Group("/api")
	{
		// Auth (publico, sin proteccion)
		api.POST("/auth/login", handlers.Login)

		// Rutas protegidas - requieren token valido
		protegidas := api.Group("/")
		protegidas.Use(middleware.AuthRequired())
		{
			// Cualquier usuario autenticado puede ver productos
			protegidas.GET("/productos", handlers.ListarProductos)

			// Solo Gerente puede ver el dashboard (ejemplo de restriccion por rol)
			protegidas.GET("/dashboard/kpis",
				middleware.RolRequired("Gerente"),
				handlers.GetKPIs)
		}
	}
}