package main

import (
	"techstore-api/config"
	"techstore-api/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	config.ConectarDB()
	defer config.DB.Close()

	r := gin.Default()
	routes.ConfigurarRutas(r)

	r.Run("0.0.0.0:8080")
}