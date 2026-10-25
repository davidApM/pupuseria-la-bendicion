const { Pool } = require('pg');

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'pupuseria_db',
    password: '110219',
    port: 5432,
});

module.exports = pool;