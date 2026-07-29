package services

import (
	"bytes"
	"encoding/base64"
	"image/png"

	"github.com/pquerna/otp/totp"
)

// GenerarSecretTOTP genera un nuevo secret TOTP para el usuario y retorna:
//   - secret: la clave en formato base32 (para guardar en DB)
//   - qrBase64: imagen PNG del QR codificada en base64 (para mostrar al usuario)
func GenerarSecretTOTP(correo string) (secret string, qrBase64 string, err error) {
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "TechStore SIG",
		AccountName: correo,
	})
	if err != nil {
		return "", "", err
	}

	img, err := key.Image(256, 256)
	if err != nil {
		return "", "", err
	}

	var buf bytes.Buffer
	if err = png.Encode(&buf, img); err != nil {
		return "", "", err
	}

	qrBase64 = base64.StdEncoding.EncodeToString(buf.Bytes())
	return key.Secret(), qrBase64, nil
}

// ValidarCodigoTOTP comprueba si el codigo de 6 digitos es valido para el secret dado.
func ValidarCodigoTOTP(secret, codigo string) bool {
	return totp.Validate(codigo, secret)
}
