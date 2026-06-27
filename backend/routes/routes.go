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
			protegidas.GET("/productos",
				middleware.RolRequired("Gerente", "Administrador", "Vendedor", "Bodeguero"),
				handlers.ListarProductos)

			// Inventario
			protegidas.GET("/inventario",
				middleware.RolRequired("Gerente", "Administrador", "Vendedor", "Bodeguero"),
				handlers.ListarInventario)
			protegidas.GET("/inventario/alertas",
				middleware.RolRequired("Gerente", "Administrador", "Bodeguero"),
				handlers.AlertasStock)

			// Clientes
			protegidas.GET("/clientes",
				middleware.RolRequired("Gerente", "Vendedor"),
				handlers.ListarClientes)
			protegidas.POST("/clientes",
				middleware.RolRequired("Gerente", "Vendedor"),
				handlers.CrearCliente)
			protegidas.GET("/clientes/:id/historial",
				middleware.RolRequired("Gerente", "Vendedor"),
				handlers.HistorialCliente)

			// Ventas (Vendedor y Gerente)
			protegidas.GET("/metodos-pago",
				middleware.RolRequired("Vendedor", "Gerente"),
				handlers.ListarMetodosPago)
			protegidas.POST("/ventas",
				middleware.RolRequired("Vendedor", "Gerente"),
				handlers.RegistrarVenta)
			protegidas.GET("/ventas",
				middleware.RolRequired("Vendedor", "Gerente"),
				handlers.ListarVentas)
			protegidas.GET("/ventas/:id",
				middleware.RolRequired("Vendedor", "Gerente"),
				handlers.DetallePedido)
			protegidas.PUT("/ventas/:id/entregar",
				middleware.RolRequired("Vendedor", "Gerente"),
				handlers.MarcarPedidoEntregado)

			// Proceso BPM (Gerente y Administrador)
			protegidas.GET("/procesos-bpm",
				middleware.RolRequired("Gerente", "Administrador", "Bodeguero"),
				handlers.ListarProcesosBPM)
			protegidas.POST("/procesos-bpm",
				middleware.RolRequired("Gerente", "Administrador"),
				handlers.GenerarProcesoBPM)
			protegidas.PUT("/procesos-bpm/:id/aprobar",
				middleware.RolRequired("Gerente"),
				handlers.AprobarProcesoBPM)
			protegidas.PUT("/procesos-bpm/:id/recibir",
				middleware.RolRequired("Gerente", "Bodeguero"),
				handlers.RecibirProcesoBPM)

			// Proveedor
			protegidas.GET("/proveedores",
				middleware.RolRequired("Gerente", "Administrador"),
				handlers.ListarProveedores)

			// IoT - Bodega
			protegidas.GET("/envios/pendientes",
				middleware.RolRequired("Bodeguero", "Gerente"),
				handlers.ListarEnviosPendientes)
			protegidas.POST("/iot/lectura",
				middleware.RolRequired("Bodeguero", "Gerente"),
				handlers.RegistrarLecturaIOT)
			protegidas.GET("/iot/lecturas",
				middleware.RolRequired("Bodeguero", "Gerente"),
				handlers.ListarLecturasIOT)

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
