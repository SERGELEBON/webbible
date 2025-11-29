import pkg from 'pg';
const { Pool } = pkg;

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Database {
    constructor() {
        this.pool = null;
        this.init();
    }

    init() {
        // Connexion PostgreSQL via variables d’environnement
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5438,
            user: process.env.DB_USER || 'jelislabible',
            password: process.env.DB_PASSWORD || 'bible',
            database: process.env.DB_NAME || 'jelislabible'
        });

        this.pool.connect()
            .then(() => {
                logger.info('Connected to PostgreSQL database');
                this.migrate();
            })
            .catch((err) => {
                logger.error('PostgreSQL connection error:', err);
                throw err;
            });
    }

    migrate() {
        try {
            const schemaPath = join(__dirname, 'schema.sql');
            const schema = readFileSync(schemaPath, 'utf8');

            this.pool.query(schema)
                .then(() => {
                    logger.info('PostgreSQL migrations executed successfully');
                })
                .catch((err) => {
                    logger.error('Error executing migration:', err);
                    throw err;
                });

        } catch (err) {
            logger.error('Migration loading error:', err);
            throw err;
        }
    }

    // Equivalent de SQLite .all()
    query(sql, params = []) {
        return this.pool.query(sql, params)
            .then((res) => res.rows)
            .catch((err) => {
                logger.error('PostgreSQL query error:', err);
                throw err;
            });
    }

    // Equivalent de SQLite .run()
    run(sql, params = []) {
        return this.pool.query(sql, params)
            .then((res) => ({
                id: res.rows?.[0]?.id || null,
                changes: res.rowCount
            }))
            .catch((err) => {
                logger.error('PostgreSQL run error:', err);
                throw err;
            });
    }

    async close() {
        try {
            await this.pool.end();
            logger.info('PostgreSQL connection pool closed');
        } catch (err) {
            logger.error('Error closing PostgreSQL connection:', err);
            throw err;
        }
    }
}

export default new Database();
