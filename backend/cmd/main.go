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

	// Middleware CORS
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	routes.ConfigurarRutas(r)
	r.Run("0.0.0.0:8080")
}