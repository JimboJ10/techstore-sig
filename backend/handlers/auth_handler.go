package handlers

import (
	"database/sql"
	"net/http"
	"techstore-api/config"
	"techstore-api/models"
	"techstore-api/services"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// Login verifica credenciales.
// - Si el usuario tiene 2FA activo: devuelve un pre-token temporal (5 min).
// - Si no tiene 2FA: devuelve el JWT completo directamente.
func Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos invalidos"})
		return
	}

	var usuario models.Usuario
	var nombreRol string
	var idEmpleado int
	var totpActivo int
	var totpSecret sql.NullString

	query := `
		SELECT u.id_usuario, u.id_rol, u.nombre_usuario, u.correo,
		       u.password_hash, u.activo, r.nombre_rol, e.id_empleado,
		       u.totp_activo, u.totp_secret
		FROM USUARIO u
		JOIN ROL r ON u.id_rol = r.id_rol
		JOIN EMPLEADO e ON e.id_usuario = u.id_usuario
		WHERE u.correo = :1 AND u.activo = 1`

	row := config.DB.QueryRow(query, req.Correo)
	err := row.Scan(
		&usuario.IDUsuario, &usuario.IDRol, &usuario.NombreUsuario,
		&usuario.Correo, &usuario.PasswordHash, &usuario.Activo,
		&nombreRol, &idEmpleado, &totpActivo, &totpSecret,
	)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciales invalidas"})
		return
	}

	if err = bcrypt.CompareHashAndPassword([]byte(usuario.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciales invalidas"})
		return
	}

	// Si el 2FA esta activo, emitir pre-token y pedir el codigo TOTP
	if totpActivo == 1 {
		preToken, err := services.GenerarPreToken(usuario.IDUsuario)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generando token temporal"})
			return
		}
		c.JSON(http.StatusOK, models.PreLoginResponse{
			Requires2FA: true,
			PreToken:    preToken,
		})
		return
	}

	// Sin 2FA: emitir JWT completo
	token, err := services.GenerarToken(usuario.IDUsuario, idEmpleado, nombreRol)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generando token"})
		return
	}
	c.JSON(http.StatusOK, models.LoginResponse{
		Token:         token,
		IDUsuario:     usuario.IDUsuario,
		IDEmpleado:    idEmpleado,
		NombreUsuario: usuario.NombreUsuario,
		Rol:           nombreRol,
	})
}

// VerifyTOTP recibe el pre-token y el codigo TOTP.
// Si ambos son validos emite el JWT completo.
func VerifyTOTP(c *gin.Context) {
	var req models.VerifyTOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos invalidos"})
		return
	}

	// Validar el pre-token
	preClaims, err := services.ValidarPreToken(req.PreToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token temporal invalido o expirado"})
		return
	}

	// Obtener datos completos del usuario
	var nombreRol string
	var idEmpleado int
	var totpSecret sql.NullString
	var nombreUsuario string

	row := config.DB.QueryRow(`
		SELECT u.nombre_usuario, r.nombre_rol, e.id_empleado, u.totp_secret
		FROM USUARIO u
		JOIN ROL r ON u.id_rol = r.id_rol
		JOIN EMPLEADO e ON e.id_usuario = u.id_usuario
		WHERE u.id_usuario = :1 AND u.activo = 1 AND u.totp_activo = 1`,
		preClaims.IDUsuario,
	)
	if err := row.Scan(&nombreUsuario, &nombreRol, &idEmpleado, &totpSecret); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no encontrado o 2FA desactivado"})
		return
	}

	if !totpSecret.Valid || totpSecret.String == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Configuracion 2FA incompleta"})
		return
	}

	// Validar codigo TOTP
	if !services.ValidarCodigoTOTP(totpSecret.String, req.Codigo) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Codigo 2FA incorrecto"})
		return
	}

	// Emitir JWT completo
	token, err := services.GenerarToken(preClaims.IDUsuario, idEmpleado, nombreRol)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generando token"})
		return
	}
	c.JSON(http.StatusOK, models.LoginResponse{
		Token:         token,
		IDUsuario:     preClaims.IDUsuario,
		IDEmpleado:    idEmpleado,
		NombreUsuario: nombreUsuario,
		Rol:           nombreRol,
	})
}

// Get2FAStatus devuelve si el usuario autenticado tiene el 2FA activo.
func Get2FAStatus(c *gin.Context) {
	idUsuario := c.GetInt("id_usuario")
	var activo int
	row := config.DB.QueryRow("SELECT totp_activo FROM USUARIO WHERE id_usuario = :1", idUsuario)
	if err := row.Scan(&activo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error consultando estado 2FA"})
		return
	}
	c.JSON(http.StatusOK, models.TwoFAStatusResponse{Activo: activo == 1})
}

// Setup2FA genera un nuevo secret TOTP y su QR para que el usuario lo escanee.
// Guarda el secret en DB con totp_activo=0 hasta que el usuario confirme.
func Setup2FA(c *gin.Context) {
	idUsuario := c.GetInt("id_usuario")

	// Obtener correo del usuario para personalizar el QR
	var correo string
	row := config.DB.QueryRow("SELECT correo FROM USUARIO WHERE id_usuario = :1", idUsuario)
	if err := row.Scan(&correo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo usuario"})
		return
	}

	secret, qrBase64, err := services.GenerarSecretTOTP(correo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generando configuracion 2FA"})
		return
	}

	// Guardar secret con totp_activo = 0 (pendiente de confirmar)
	_, err = config.DB.Exec(
		"UPDATE USUARIO SET totp_secret = :1, totp_activo = 0 WHERE id_usuario = :2",
		secret, idUsuario,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error guardando configuracion 2FA"})
		return
	}

	c.JSON(http.StatusOK, models.Setup2FAResponse{
		QRBase64: qrBase64,
		Secret:   secret,
	})
}

// Confirm2FA verifica el primer codigo TOTP y activa el 2FA definitivamente.
func Confirm2FA(c *gin.Context) {
	idUsuario := c.GetInt("id_usuario")
	var req models.Confirm2FARequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Codigo requerido"})
		return
	}

	var totpSecret sql.NullString
	row := config.DB.QueryRow(
		"SELECT totp_secret FROM USUARIO WHERE id_usuario = :1 AND totp_activo = 0",
		idUsuario,
	)
	if err := row.Scan(&totpSecret); err != nil || !totpSecret.Valid || totpSecret.String == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No hay configuracion 2FA pendiente de confirmar"})
		return
	}

	if !services.ValidarCodigoTOTP(totpSecret.String, req.Codigo) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Codigo incorrecto. Verifica que la app este sincronizada"})
		return
	}

	_, err := config.DB.Exec(
		"UPDATE USUARIO SET totp_activo = 1 WHERE id_usuario = :1",
		idUsuario,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error activando 2FA"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"mensaje": "2FA activado correctamente"})
}

// Disable2FA desactiva el 2FA previa reautenticacion completa (password + codigo actual).
func Disable2FA(c *gin.Context) {
	idUsuario := c.GetInt("id_usuario")
	var req models.Disable2FARequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos invalidos"})
		return
	}

	var passwordHash string
	var totpSecret sql.NullString
	row := config.DB.QueryRow(
		"SELECT password_hash, totp_secret FROM USUARIO WHERE id_usuario = :1 AND totp_activo = 1",
		idUsuario,
	)
	if err := row.Scan(&passwordHash, &totpSecret); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El 2FA no esta activo en esta cuenta"})
		return
	}

	// Verificar contrasena
	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Contrasena incorrecta"})
		return
	}

	// Verificar codigo TOTP actual
	if !totpSecret.Valid || !services.ValidarCodigoTOTP(totpSecret.String, req.Codigo) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Codigo 2FA incorrecto"})
		return
	}

	_, err := config.DB.Exec(
		"UPDATE USUARIO SET totp_activo = 0, totp_secret = NULL WHERE id_usuario = :1",
		idUsuario,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error desactivando 2FA"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"mensaje": "2FA desactivado correctamente"})
}
