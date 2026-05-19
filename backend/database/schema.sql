-- Esquema para la base de datos GeoDistrito

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin','capturista') NOT NULL DEFAULT 'capturista',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de puntos existente (actualizada FASE 4)
CREATE TABLE IF NOT EXISTS puntos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo VARCHAR(60) NOT NULL,
  latitud DECIMAL(12,8) NOT NULL,
  longitud DECIMAL(12,8) NOT NULL,
  distrito VARCHAR(80) NOT NULL,
  seccion VARCHAR(80),
  calle VARCHAR(120),
  colonia VARCHAR(120),
  municipio VARCHAR(120),
  encargado VARCHAR(120),
  url VARCHAR(255),
  estado ENUM('pendiente','revisión','completado','cancelado') NOT NULL DEFAULT 'pendiente',
  usuario_id INT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_estado (estado),
  KEY idx_created_at (created_at),
  KEY idx_usuario_id (usuario_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de observaciones (FASE 4)
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

-- Tabla de auditoría (FASE 4)
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
