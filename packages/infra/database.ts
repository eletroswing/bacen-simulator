import sqlite from 'sqlite3';
import logger from './logger';
import path from 'node:path';

const database: sqlite.Database = new sqlite.Database(path.join(__dirname, 'database.sqlite'),(err: Error | null) => logger.error(err));
export default database;