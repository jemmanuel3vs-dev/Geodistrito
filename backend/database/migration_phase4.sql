-- ========================================
-- FASE 4: GeoDistrito Migration Script
-- Ejecutar después de actualizar schema.sql
-- ========================================

-- 1. Agregar columna 'estado' a tabla 'puntos'
ALTER TABLE puntos ADD COLUMN estado ENUM('pendiente','revisión','completado','cancelado') NOT NULL DEFAULT 'pendiente';

-- 2. Agregar columna 'usuario_id' a tabla 'puntos'
ALTER TABLE puntos ADD COLUMN usuario_id INT DEFAULT NULL;

-- 3. Agregar columna 'updated_at' a tabla 'puntos'
ALTER TABLE puntos ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 4. Agregar Foreign Key para usuario_id
ALTER TABLE puntos ADD CONSTRAINT fk_puntos_usuario 
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL;

-- 5. Agregar índices para rendimiento
ALTER TABLE puntos ADD INDEX idx_estado (estado);
ALTER TABLE puntos ADD INDEX idx_usuario_id (usuario_id);

-- 6. Crear tabla 'observaciones_puntos' si no existe
CREATE TABLE IF NOT EXISTS observaciones_puntos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  punto_id INT NOT NULL,
  usuario_id INT NOT NULL,
  comentario TEXT NOT NULL,
  prioridad ENUM('LOW','MEDIUM','HIGH') DEFAULT 'MEDIUM',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_punto_id (punto_id),
  KEY idx_usuario_id (usuario_id),
  FOREIGN KEY (punto_id) REFERENCES puntos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 7. Crear tabla 'auditoria_puntos' si no existe
CREATE TABLE IF NOT EXISTS auditoria_puntos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  punto_id INT NOT NULL,
  usuario_id INT NOT NULL,
  estado_anterior VARCHAR(60),
  estado_nuevo VARCHAR(60) NOT NULL,
  comentario TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_punto_id (punto_id),
  KEY idx_usuario_id (usuario_id),
  KEY idx_created_at (created_at),
  FOREIGN KEY (punto_id) REFERENCES puntos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 8. Verificar que todo está ok
SELECT 'Migration completed successfully ✅' as status;
SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME IN ('puntos', 'observaciones_puntos', 'auditoria_puntos')
ORDER BY TABLE_NAME, ORDINAL_POSITION;
