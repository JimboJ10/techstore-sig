package models

// ─── Usuario ─────────────────────────────────────────────────────────────────
type Usuario struct {
	IDUsuario     int    `json:"id_usuario"`
	IDRol         int    `json:"id_rol"`
	NombreUsuario string `json:"nombre_usuario"`
	Correo        string `json:"correo"`
	PasswordHash  string `json:"-"`
	Activo        int    `json:"activo"`
	TotpSecret    string `json:"-"`
	TotpActivo    int    `json:"totp_activo"`
}

// ─── Auth requests / responses ───────────────────────────────────────────────
type LoginRequest struct {
	Correo   string `json:"correo"   binding:"required"`
	Password string `json:"password" binding:"required"`
}

// Respuesta cuando las credenciales son correctas y NO hay 2FA activo.
type LoginResponse struct {
	Token         string `json:"token"`
	IDUsuario     int    `json:"id_usuario"`
	IDEmpleado    int    `json:"id_empleado"`
	NombreUsuario string `json:"nombre_usuario"`
	Rol           string `json:"rol"`
}

// Respuesta cuando las credenciales son correctas y el 2FA SÍ está activo.
// El cliente debe usar el pre_token para completar el login en /auth/verify-2fa.
type PreLoginResponse struct {
	Requires2FA bool   `json:"requires_2fa"`
	PreToken    string `json:"pre_token"`
}

// ─── 2FA setup / confirm / disable ──────────────────────────────────────────
type Setup2FAResponse struct {
	QRBase64 string `json:"qr_base64"` // PNG en base64 listo para <img src="data:image/png;base64,...">
	Secret   string `json:"secret"`    // Clave TOTP en texto (para entrada manual en la app)
}

type Confirm2FARequest struct {
	Codigo string `json:"codigo_totp" binding:"required"`
}

type VerifyTOTPRequest struct {
	PreToken string `json:"pre_token"  binding:"required"`
	Codigo   string `json:"codigo_totp" binding:"required"`
}

type Disable2FARequest struct {
	Password string `json:"password"   binding:"required"`
	Codigo   string `json:"codigo_totp" binding:"required"`
}

type TwoFAStatusResponse struct {
	Activo bool `json:"activo"`
}
