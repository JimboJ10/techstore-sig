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
		api.POST("/auth/verify-2fa", handlers.VerifyTOTP) // paso 2 del login con 2FA

		// Rutas protegidas
		protegidas := api.Group("/")
		protegidas.Use(middleware.AuthRequired())
		{
			// Gestion 2FA (requiere JWT completo)
			protegidas.GET("/auth/2fa/status", handlers.Get2FAStatus)
			protegidas.GET("/auth/2fa/setup", handlers.Setup2FA)
			protegidas.POST("/auth/2fa/confirm", handlers.Confirm2FA)
			protegidas.POST("/auth/2fa/disable", handlers.Disable2FA)

			// Categorías y marcas (auxiliares para formularios)
			protegidas.GET("/categorias",
				middleware.RolRequired("Gerente", "Administrador"),
				handlers.ListarCategorias)
			protegidas.GET("/marcas",
				middleware.RolRequired("Gerente", "Administrador"),
				handlers.ListarMarcas)

			// Productos
			protegidas.GET("/productos",
				middleware.RolRequired("Gerente", "Administrador", "Vendedor", "Bodeguero"),
				handlers.ListarProductos)
			protegidas.POST("/productos",
				middleware.RolRequired("Gerente", "Administrador"),
				handlers.CrearProducto)
			protegidas.PUT("/productos/:id",
				middleware.RolRequired("Gerente", "Administrador"),
				handlers.ActualizarProducto)
			protegidas.DELETE("/productos/:id",
				middleware.RolRequired("Gerente", "Administrador"),
				handlers.DesactivarProducto)

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

			// Proveedores
			protegidas.GET("/proveedores",
				middleware.RolRequired("Gerente", "Administrador"),
				handlers.ListarProveedores)
			protegidas.POST("/proveedores",
				middleware.RolRequired("Gerente", "Administrador"),
				handlers.CrearProveedor)
			protegidas.PUT("/proveedores/:id",
				middleware.RolRequired("Gerente", "Administrador"),
				handlers.ActualizarProveedor)
			protegidas.DELETE("/proveedores/:id",
				middleware.RolRequired("Gerente", "Administrador"),
				handlers.EliminarProveedor)

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

			// Dashboard Gerencial
			protegidas.GET("/dashboard/kpis",
				middleware.RolRequired("Gerente"),
				handlers.GetKPIs)
			protegidas.GET("/dashboard/ventas-periodo",
				middleware.RolRequired("Gerente"),
				handlers.GetVentasPorPeriodo)
			protegidas.GET("/dashboard/ventas-mes",
				middleware.RolRequired("Gerente"),
				handlers.GetVentasPorMes)
			protegidas.GET("/dashboard/ventas-anio",
				middleware.RolRequired("Gerente"),
				handlers.GetVentasPorAnio)
			protegidas.GET("/dashboard/ventas-empleado",
				middleware.RolRequired("Gerente"),
				handlers.GetVentasPorEmpleado)
			protegidas.GET("/dashboard/productos-top",
				middleware.RolRequired("Gerente"),
				handlers.GetProductosTop)
			protegidas.GET("/dashboard/pedidos-estado",
				middleware.RolRequired("Gerente"),
				handlers.GetPedidosPorEstado)
			protegidas.GET("/dashboard/ticket-promedio",
				middleware.RolRequired("Gerente"),
				handlers.GetTicketPromedio)
			protegidas.GET("/dashboard/ventas-categoria",
				middleware.RolRequired("Gerente"),
				handlers.GetVentasPorCategoria)
			protegidas.GET("/dashboard/comparacion-periodos",
				middleware.RolRequired("Gerente"),
				handlers.GetComparacionPeriodos)

			// Empleados (para filtros del dashboard)
			protegidas.GET("/empleados",
				middleware.RolRequired("Gerente"),
				handlers.ListarEmpleados)
		}
	}
}
