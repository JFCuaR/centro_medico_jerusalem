// db.js
/*const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Prueba la conexión al crearse
  (async () => {
    const connection = await pool.getConnection();
    console.log('✅ Conectado exitosamente a la base de datos');
    connection.release();
  })();

} catch (error) {
  console.error('❌ Error al crear el pool de conexiones:', error.message);
}

module.exports = pool;*/

// db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

// Prueba de conexión (SIN reventar el proceso)
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Conectado exitosamente a la base de datos');
    conn.release();
  } catch (err) {
    console.error('❌ No se pudo conectar a la base de datos:', err.message);
    // No hacemos throw para que no crashee el server
  }
})();

module.exports = pool;

