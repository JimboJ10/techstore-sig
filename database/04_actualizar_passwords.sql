-- ============================================
-- Actualizar contraseñas con hash bcrypt real
-- Password para todos: TechStore2026#
-- ============================================

UPDATE USUARIO 
SET password_hash = '$2a$10$Ez9gcnn.RI.B7v2Em2Xy8utPPaHjVbY0IFBGxUaeLE.RDUMdq2BhC'
WHERE id_usuario IN (1, 2, 3, 4);

COMMIT;