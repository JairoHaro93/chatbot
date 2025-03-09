const mysql = require("mysql2");
const sql = require("mssql");
const dotenv = require("dotenv");

dotenv.config();

// CONFIGURACIÓN DE LA CONEXIÓN MYSQL
const poolmysql = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
});

// CONFIGURACIÓN DE LA CONEXIÓN SQL SERVER
const configSQL = {
  user: process.env.DB_SQL_USER,
  password: process.env.DB_SQL_PASSWORD,
  port: Number(process.env.DB_SQL_PORT),
  server: process.env.DB_SQL_SERVER,
  database: process.env.DB_SQL_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function connectDB() {
  try {
    return await sql.connect(configSQL);
  } catch (err) {
    throw new Error(`❌ ERROR AL CONECTAR SQL SERVER: ${err.message}`);
  }
}

module.exports = { poolmysql: poolmysql.promise(), connectDB, sql };
