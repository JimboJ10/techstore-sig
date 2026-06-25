package services

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var JwtSecret = []byte("techstore_sig_secret_key_2026_machala")

type Claims struct {
	IDUsuario  int    `json:"id_usuario"`
	IDEmpleado int    `json:"id_empleado"`
	Rol        string `json:"rol"`
	jwt.RegisteredClaims
}

func GenerarToken(idUsuario int, idEmpleado int, rol string) (string, error) {
	claims := Claims{
		IDUsuario:  idUsuario,
		IDEmpleado: idEmpleado,
		Rol:        rol,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(8 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(JwtSecret)
}

func ValidarToken(tokenString string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
		return JwtSecret, nil
	})

	if err != nil || !token.Valid {
		return nil, err
	}

	return claims, nil
}
