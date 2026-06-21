package routes

import (
	"techstore-api/handlers"
	"techstore-api/middleware"

	"github.com/gin-gonic/gin"
)

func ConfigurarRutas(r *gin.Engine) {
	api := r.Group("/api")
	{
		// Auth (publico)
		api.POST("/auth/login", handlers.Login)

		// Rutas protegidas - requieren token valido
		protegidas := api.Group("/")
		protegidas.Use(middleware.AuthRequired())
		{
			// Productos
			protegidas.GET("/productos", handlers.ListarProductos)

			// Inventario
			protegidas.GET("/inventario", handlers.ListarInventario)
			protegidas.GET("/inventario/alertas", handlers.AlertasStock)

			// Clientes
			protegidas.GET("/clientes", handlers.ListarClientes)
			protegidas.POST("/clientes", handlers.CrearCliente)
			protegidas.GET("/clientes/:id/historial", handlers.HistorialCliente)

			// Dashboard (solo Gerente)
			protegidas.GET("/dashboard/kpis",
				middleware.RolRequired("Gerente"),
				handlers.GetKPIs)
		}
	}
}