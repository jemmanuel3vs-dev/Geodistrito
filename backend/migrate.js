/**
 * Script para ejecutar migraciones de la BD
 * Uso: node migrate.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  let connection;
  try {
    console.log('📡 Conectando a MySQL...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'password',
      database: process.env.DB_NAME || 'geodistrito',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306
    });

    console.log('✅ Conectado a la base de datos');

    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, 'database', 'migration_phase4.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    const cleanedSQL = migrationSQL
      .split(/\r?\n/)
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    // Dividir por ; para ejecutar cada sentencia
    const statements = cleanedSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`\n🔧 Ejecutando ${statements.length} sentencias de migración...\n`);

    for (const statement of statements) {
      try {
        const result = await connection.execute(statement);
        console.log('✓', statement.substring(0, 60) + '...');
      } catch (err) {
        // Si es un error de "already exists", ignorar (es seguro)
        if (err.code === 'ER_DUP_KEYNAME' || err.code === 'ER_DUP_FIELDNAME') {
          console.log('ℹ️', statement.substring(0, 60) + '... (ya existe)');
        } else {
          throw err;
        }
      }
    }

    console.log('\n✅ Migración completada exitosamente\n');

    // Mostrar estado de tablas
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
      [process.env.DB_NAME || 'geodistrito']
    );

    console.log('📊 Tablas en la BD:');
    tables.forEach(table => console.log('  -', table.TABLE_NAME));

    await connection.end();
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    process.exit(1);
  }
}

runMigration();
