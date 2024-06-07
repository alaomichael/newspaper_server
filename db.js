// require('dotenv').config();
// const { Pool } = require('pg');

// const pool = new Pool({
//     user: process.env.PG_DB_USER,// || 'postgres',
//     host: process.env.PG_DB_HOST,// || 'localhost',
//     database: process.env.PG_DB_NAME,// || 'newspaper_db',
//     password: process.env.PG_DB_PASSWORD,// || 'babatunde_25',
//     port: process.env.PG_DB_PORT,// || 5432,
// });

// module.exports = pool;



// Code with uuid for id
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PG_DB_USER,
    host: process.env.PG_DB_HOST,
    database: process.env.PG_DB_NAME,
    password: process.env.PG_DB_PASSWORD,
    port: process.env.PG_DB_PORT,
});

// Enable pgcrypto extension
const enablePgcryptoQuery = `
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
        CREATE EXTENSION "pgcrypto";
    END IF;
END $$;
`;

const createTableQuery = `
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createTriggerFunctionQuery = `
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
`;

const createTriggerQuery = `
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_updated_at'
    ) THEN
        CREATE TRIGGER update_updated_at
        BEFORE UPDATE ON articles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
`;

const initializeDatabase = async () => {
    try {
        await pool.query(enablePgcryptoQuery);
        await pool.query(createTableQuery);
        await pool.query(createTriggerFunctionQuery);
        await pool.query(createTriggerQuery);
        console.log('Table and trigger are ready');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};

initializeDatabase();


module.exports = pool;


// Code with serial number for id

// require('dotenv').config();
// const { Pool } = require('pg');

// const pool = new Pool({
//     user: process.env.PG_DB_USER,
//     host: process.env.PG_DB_HOST,
//     database: process.env.PG_DB_NAME,
//     password: process.env.PG_DB_PASSWORD,
//     port: process.env.PG_DB_PORT,
// });

// const createTableQuery = `
// CREATE TABLE IF NOT EXISTS articles (
//     id SERIAL PRIMARY KEY,
//     title VARCHAR(255) NOT NULL,
//     content TEXT NOT NULL,
//     author VARCHAR(255) NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );
// `;

// const createTriggerFunctionQuery = `
// CREATE OR REPLACE FUNCTION update_updated_at_column()
// RETURNS TRIGGER AS $$
// BEGIN
//     NEW.updated_at = NOW();
//     RETURN NEW;
// END;
// $$ LANGUAGE plpgsql;
// `;

// const createTriggerQuery = `
// CREATE TRIGGER update_updated_at
// BEFORE UPDATE ON articles
// FOR EACH ROW
// EXECUTE FUNCTION update_updated_at_column();
// `;

// const initializeDatabase = async () => {
//     try {
//         await pool.query(createTableQuery);
//         await pool.query(createTriggerFunctionQuery);
//         await pool.query(createTriggerQuery);
//         console.log('Table and trigger are ready');
//     } catch (err) {
//         console.error('Error initializing database', err);
//     }
// };

// initializeDatabase();

// module.exports = pool;
