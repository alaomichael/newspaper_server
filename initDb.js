// require('dotenv').config();
// const pool = require('./db');

// const enablePgcryptoQuery = `
// DO $$ BEGIN
//     IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
//         CREATE EXTENSION "pgcrypto";
//     END IF;
// END $$;
// `;

// const createTableQuery = `
// CREATE TABLE IF NOT EXISTS articles (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
// DO $$ BEGIN
//     IF NOT EXISTS (
//         SELECT 1 FROM pg_trigger 
//         WHERE tgname = 'update_updated_at'
//     ) THEN
//         CREATE TRIGGER update_updated_at
//         BEFORE UPDATE ON articles
//         FOR EACH ROW
//         EXECUTE FUNCTION update_updated_at_column();
//     END IF;
// END $$;
// `;

// const initializeDatabase = async () => {
//     try {
//         await pool.query(enablePgcryptoQuery);
//         await pool.query(createTableQuery);
//         await pool.query(createTriggerFunctionQuery);
//         await pool.query(createTriggerQuery);
//         console.log('Table and trigger are ready');
//     } catch (err) {
//         console.error('Error initializing database:', err);
//     } finally {
//         await pool.end();
//     }
// };

// initializeDatabase();


require('dotenv').config();
const pool = require('./db');
const promiseRetry = require('promise-retry');

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

const executeQueryWithRetry = async (query) => {
    return promiseRetry((retry, number) => {
        console.log(`Attempt ${number} for query`);
        return pool.query(query).catch(retry);
    }, {
        retries: 5,
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 5000
    });
};

const initializeDatabase = async () => {
    try {
        await executeQueryWithRetry(enablePgcryptoQuery);
        await executeQueryWithRetry(createTableQuery);
        await executeQueryWithRetry(createTriggerFunctionQuery);
        await executeQueryWithRetry(createTriggerQuery);
        console.log('Table and trigger are ready');
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        await pool.end();
    }
};

initializeDatabase();
