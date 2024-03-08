import sqlite from 'sqlite3';
import logger from './logger';

const database: sqlite.Database = new sqlite.Database('database.ts', (err: Error | null) => logger.error(err));
export default database;