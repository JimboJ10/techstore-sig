package models

type ProcesoBPM struct {
	IDProceso              int    `json:"id_proceso"`
	IDProveedor            int    `json:"id_proveedor"`
	IDProducto             int    `json:"id_producto"`
	NombreProducto         string `json:"nombre_producto,omitempty"`
	NombreProveedor        string `json:"nombre_proveedor,omitempty"`
	CantidadSolicitada     int    `json:"cantidad_solicitada"`
	EstadoProceso          string `json:"estado_proceso"`
	FechaInicio            string `json:"fecha_inicio"`
	FechaAprobacion        string `json:"fecha_aprobacion,omitempty"`
	FechaRecepcion         string `json:"fecha_recepcion,omitempty"`
	ActivadoAutomaticamente int   `json:"activado_automaticamente"`
}

type AprobarBPMRequest struct {
	IDEmpleado int `json:"id_empleado" binding:"required"`
}

type GenerarBPMRequest struct {
	IDProveedor        int `json:"id_proveedor" binding:"required"`
	IDProducto         int `json:"id_producto" binding:"required"`
	CantidadSolicitada int `json:"cantidad_solicitada" binding:"required"`
}