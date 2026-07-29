-- ============================================================
-- TECHSTORE SIG -- Script 05: Agregar soporte de 2FA (TOTP)
-- Ejecutar en sqlplus como usuario techstore
-- 
-- Este script es SEGURO: no modifica datos existentes.
-- Todos los usuarios quedaran con totp_activo = 0 (inactivo)
-- hasta que cada uno active el 2FA desde su perfil.
-- ============================================================
-- Ya ejecutado en la BD de produccion el 2026-07-28
-- ============================================================

ALTER TABLE USUARIO ADD totp_activo NUMBER(1) DEFAULT 0 NOT NULL
  CHECK (totp_activo IN (0,1));

COMMIT;

-- Verificar:
-- SELECT id_usuario, nombre_usuario, totp_activo FROM USUARIO;
