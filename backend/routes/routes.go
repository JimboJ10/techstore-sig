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

		// Rutas protegidas
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

			// Ventas (Vendedor y Gerente)
			protegidas.POST("/ventas",
				middleware.RolRequired("Vendedor", "Gerente"),
				handlers.RegistrarVenta)
			protegidas.GET("/ventas", handlers.ListarVentas)
			protegidas.GET("/ventas/:id", handlers.DetallePedido)

			// Proceso BPM (Gerente y Administrador)
			protegidas.GET("/procesos-bpm", handlers.ListarProcesosBPM)
			protegidas.POST("/procesos-bpm",
				middleware.RolRequired("Gerente", "Administrador"),
				handlers.GenerarProcesoBPM)
			protegidas.PUT("/procesos-bpm/:id/aprobar",
				middleware.RolRequired("Gerente"),
				handlers.AprobarProcesoBPM)
			protegidas.PUT("/procesos-bpm/:id/recibir",
				middleware.RolRequired("Gerente", "Bodeguero"),
				handlers.RecibirProcesoBPM)

			// IoT - Bodega
			protegidas.POST("/iot/lectura", handlers.RegistrarLecturaIOT)
			protegidas.GET("/iot/lecturas", handlers.ListarLecturasIOT)

			// Dashboard
			protegidas.GET("/dashboard/kpis",
				middleware.RolRequired("Gerente"),
				handlers.GetKPIs)
			protegidas.GET("/dashboard/ventas-periodo",
				middleware.RolRequired("Gerente"),
				handlers.GetVentasPorPeriodo)
			protegidas.GET("/dashboard/productos-top",
				middleware.RolRequired("Gerente"),
				handlers.GetProductosTop)
		}
	}
}