package services

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var JwtSecret = []byte("techstore_sig_secret_key_2026_machala")

// Claims para el JWT completo (acceso total al sistema).
type Claims struct {
	IDUsuario  int    `json:"id_usuario"`
	IDEmpleado int    `json:"id_empleado"`
	Rol        string `json:"rol"`
	// "full" = token completo | "pre_auth" = paso intermedio de 2FA (5 min, sin acceso)
	Tipo string `json:"tipo"`
	jwt.RegisteredClaims
}

// GenerarToken emite el JWT completo con duración de 8 horas.
func GenerarToken(idUsuario int, idEmpleado int, rol string) (string, error) {
	claims := Claims{
		IDUsuario:  idUsuario,
		IDEmpleado: idEmpleado,
		Rol:        rol,
		Tipo:       "full",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(8 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(JwtSecret)
}

// GenerarPreToken emite un token temporal de 5 minutos solo para completar el 2FA.
// No puede usarse en rutas protegidas; el middleware lo rechaza si Tipo == "pre_auth".
func GenerarPreToken(idUsuario int) (string, error) {
	claims := Claims{
		IDUsuario: idUsuario,
		Tipo:      "pre_auth",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(5 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(JwtSecret)
}

// ValidarToken valida el JWT y devuelve los claims. Rechaza pre_auth tokens.
func ValidarToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
		return JwtSecret, nil
	})
	if err != nil || !token.Valid {
		return nil, err
	}
	if claims.Tipo == "pre_auth" {
		return nil, errors.New("pre-auth token no válido para acceso al sistema")
	}
	return claims, nil
}

// ValidarPreToken valida un token temporal de pre-autenticación 2FA.
func ValidarPreToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
		return JwtSecret, nil
	})
	if err != nil || !token.Valid {
		return nil, err
	}
	if claims.Tipo != "pre_auth" {
		return nil, errors.New("token no es un pre-auth válido")
	}
	return claims, nil
}
