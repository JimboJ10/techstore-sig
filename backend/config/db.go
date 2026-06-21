package config

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/sijms/go-ora/v2"
)

var DB *sql.DB

func ConectarDB() {
	connStr := "oracle://techstore:TechStore2026%23@192.168.100.10:1521/FREEPDB1"

	db, err := sql.Open("oracle", connStr)
	if err != nil {
		log.Fatal("Error abriendo conexion:", err)
	}

	if err = db.Ping(); err != nil {
		log.Fatal("Error conectando a Oracle:", err)
	}

	DB = db
	fmt.Println("Conectado a Oracle FREEPDB1 exitosamente")
}