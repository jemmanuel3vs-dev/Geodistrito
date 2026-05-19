# FASE 4: GeoDistrito - Backend Implementation Guide

## 🎯 Estado: FASE 1 COMPLETA ✅

### Cambios Implementados

#### 1. **Base de Datos (schema.sql)**
- ✅ Agregada columna `estado` a tabla `puntos` (ENUM: pendiente, revisión, completado, cancelado)
- ✅ Agregada columna `usuario_id` para relacionar puntos con usuario que los creó
- ✅ Agregada columna `updated_at` para auditoría
- ✅ Nueva tabla `observaciones_puntos` para comentarios/observaciones
- ✅ Nueva tabla `auditoria_puntos` para historial de cambios de estado
- ✅ Índices para optimización de queries

#### 2. **Controllers**

**stats.controller.js** (Nuevo)
- `getOverviewStats()` - Estadísticas generales (total puntos, distritos, etc.)
- `getStatsByDistrict()` - Puntos por distrito con filtros
- `getStatsByType()` - Distribución por tipo (bardas, lonas, comités, casillas)
- `getStatsByMunicipality()` - Puntos por municipio
- `getActivityByDate()` - Actividad por fecha (últimos N días)
- `getStatsByUser()` - Puntos por usuario capturista
- `getStatsByState()` - Distribución de estados

**observations.controller.js** (Nuevo)
- `createObservation()` - Crear comentario/observación en un punto
- `getObservation()` - Obtener última observación de un punto
- `updateObservation()` - Editar observación (admin only)
- `updatePuntoState()` - Cambiar estado de punto + auditoría automática
- `getAuditHistory()` - Obtener historial de cambios

**puntos.controller.js** (Modificado)
- Agregado `usuario_id` en `createPunto()`
- Agregado `estado` (default: 'pendiente') en `createPunto()`
- Agregado campos `estado`, `usuario_id`, `updated_at` en `getPuntos()`
- Agregado `updated_at` en `updatePunto()`

#### 3. **Routes (puntos.routes.js)**

**Nuevos endpoints de estadísticas:**
- `GET /api/puntos/stats/overview` - Estadísticas generales
- `GET /api/puntos/stats/by-district` - Por distrito
- `GET /api/puntos/stats/by-type` - Por tipo
- `GET /api/puntos/stats/by-municipality` - Por municipio
- `GET /api/puntos/stats/activity-by-date?days=30` - Actividad por fecha
- `GET /api/puntos/stats/by-user` - Por usuario
- `GET /api/puntos/stats/by-state` - Por estado

**Nuevos endpoints de observaciones:**
- `POST /api/puntos/:id/observations` - Crear observación
- `GET /api/puntos/:id/observations` - Obtener última observación
- `PUT /api/puntos/:id/observations/:obsId` - Editar observación (admin)
- `PATCH /api/puntos/:id/state` - Cambiar estado (admin + auditoría)
- `GET /api/puntos/:id/audit` - Historial de cambios

---

## 🚀 Instalación de Migración

### Opción 1: Migración Automática (Recomendado)

```bash
cd backend
node migrate.js
```

Esto ejecutará automáticamente el script `database/migration_phase4.sql` que:
- Agrega columnas nuevas (seguro, usa ALTER TABLE IF NOT EXISTS)
- Crea tablas nuevas
- Crea índices para rendimiento
- Es idempotente (puede ejecutarse múltiples veces sin error)

### Opción 2: Migración Manual

Ejecutar en tu cliente MySQL (MySQL Workbench, DBeaver, etc.):

1. Abre `backend/database/migration_phase4.sql`
2. Copia todo el contenido
3. Ejecuta en tu BD `geodistrito`

### Opción 3: Actualizar schema completo (si es BD nueva)

```bash
mysql -u root -p geodistrito < backend/database/schema.sql
```

---

## ✅ Verificación Post-Migración

Ejecuta este query en MySQL para verificar que todo está correcto:

```sql
-- Verificar tabla puntos
SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'puntos' ORDER BY ORDINAL_POSITION;

-- Verificar nuevas tablas
SHOW TABLES LIKE '%observaciones%';
SHOW TABLES LIKE '%auditoria%';

-- Contar registros
SELECT 'usuarios' as tabla, COUNT(*) as cantidad FROM usuarios
UNION ALL
SELECT 'puntos', COUNT(*) FROM puntos
UNION ALL
SELECT 'observaciones_puntos', COUNT(*) FROM observaciones_puntos
UNION ALL
SELECT 'auditoria_puntos', COUNT(*) FROM auditoria_puntos;
```

---

## 🔐 Permisos y Seguridad

| Endpoint | Permiso | Descripción |
|----------|---------|-------------|
| GET /stats/* | Público | Estadísticas para dashboard (lectura) |
| POST observations | ✅ Auth | Capturista en propios puntos, Admin en cualquiera |
| GET observations | Público | Solo lectura de observaciones |
| PUT observations | 🔐 Admin | Solo administradores |
| PATCH state | 🔐 Admin | Solo administradores pueden cambiar estado |
| GET audit | ✅ Auth | Solo usuarios autenticados |

---

## 📊 Ejemplos de Uso

### 1. Obtener estadísticas generales

```bash
curl http://localhost:3000/api/puntos/stats/overview
```

Response:
```json
{
  "total_puntos": 42,
  "total_distritos": 4,
  "total_secciones": 28,
  "total_municipios": 3,
  "total_comites": 15,
  "usuarios_activos": 5
}
```

### 2. Puntos por distrito

```bash
curl http://localhost:3000/api/puntos/stats/by-district?estado=completado
```

### 3. Crear observación

```bash
curl -X POST http://localhost:3000/api/puntos/5/observations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "comentario": "Punto verificado, todo correcto",
    "prioridad": "HIGH"
  }'
```

### 4. Cambiar estado de punto

```bash
curl -X PATCH http://localhost:3000/api/puntos/5/state \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "estado": "completado",
    "comentario": "Verificación completada"
  }'
```

---

## 🧪 Testing Rápido

1. **Inicia el servidor:**
   ```bash
   cd backend
   npm install  # Si no lo hiciste
   npm start
   ```

2. **Verifica que está corriendo:**
   ```bash
   curl http://localhost:3000/
   ```

3. **Prueba un endpoint de stats:**
   ```bash
   curl http://localhost:3000/api/puntos/stats/overview
   ```

---

## 📋 Próximos Pasos (FASE 2-3)

- [ ] Crear `frontend/js/dashboard.js` (KPI cards, auto-refresh 30s)
- [ ] Crear `frontend/js/charts.js` (integración Chart.js)
- [ ] Crear `frontend/js/export.js` (exportaciones profesionales)
- [ ] Modificar `frontend/admin.html` (estructura dashboard)
- [ ] Modificar `frontend/js/api.js` (nuevas funciones fetch)
- [ ] Integrar Chart.js CDN en admin.html

---

## 🐛 Troubleshooting

**Error: "Database does not exist"**
- Asegúrate que existe BD `geodistrito`
- O executa: `mysql -u root -p -e "CREATE DATABASE geodistrito;"`

**Error: "Table puntos doesn't exist"**
- Ejecuta: `node migrate.js` desde `backend/`
- O importa `database/schema.sql` en MySQL

**Error: "Foreign key constraint fails"**
- Asegúrate que la tabla `usuarios` existe
- Ejecuta migración nuevamente: `node migrate.js`

**Conexión MySQL falla**
- Verifica credenciales en `.env`:
  - `DB_HOST`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`
- O usa valores por defecto: `localhost`, `root`, `password`, `geodistrito`

---

## 📝 Notas

- Todos los endpoints de estadísticas pueden recibir filtros opcionales: `?estado=pendiente&distrito=20`
- Las observaciones solo guardan la última (no historial)
- Los cambios de estado se registran automáticamente en `auditoria_puntos`
- Los nuevos puntos tienen `estado='pendiente'` por defecto
- Usuario capturista solo puede crear observaciones en sus propios puntos (verificación por `usuario_id`)

---

**Status:** ✅ FASE 1 Backend Completa
**Next:** Comenzar FASE 2 - Frontend Dashboard UI
