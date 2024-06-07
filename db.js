require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PG_DB_USER,// || 'postgres',
    host: process.env.PG_DB_HOST,// || 'localhost',
    database: process.env.PG_DB_NAME,// || 'newspaper_db',
    password: process.env.PG_DB_PASSWORD,// || 'babatunde_25',
    port: process.env.PG_DB_PORT,// || 5432,
});

module.exports = pool;
