package handlers

import (
	"net/http"
	"techstore-api/config"

	"github.com/gin-gonic/gin"
)

// EmpleadoBasico es la estructura mínima para los filtros del dashboard
type EmpleadoBasico struct {
	IDEmpleado int    `json:"id_empleado"`
	Nombre     string `json:"nombre"`
	Cargo      string `json:"cargo"`
}

// GET /api/empleados
// Lista todos los empleados activos para usarse en filtros del dashboard
func ListarEmpleados(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT em.id_empleado,
		       em.nombres || ' ' || em.apellidos AS nombre,
		       NVL(em.cargo, 'Sin cargo') AS cargo
		FROM EMPLEADO em
		JOIN USUARIO u ON u.id_usuario = em.id_usuario
		WHERE u.activo = 1
		ORDER BY em.nombres ASC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var empleados []EmpleadoBasico
	for rows.Next() {
		var e EmpleadoBasico
		if err := rows.Scan(&e.IDEmpleado, &e.Nombre, &e.Cargo); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		empleados = append(empleados, e)
	}
	if empleados == nil {
		empleados = []EmpleadoBasico{}
	}
	c.JSON(http.StatusOK, empleados)
}
