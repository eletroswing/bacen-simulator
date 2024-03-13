import sqlite from 'sqlite3';
import logger from './logger';
import path from 'node:path';

declare module 'sqlite3' {
    interface Database {
        get_sync: (sql: string, params: any) => Promise<any>;
        run_sync: (sql: string, params: any) => Promise<any>;
    }
}

const database: sqlite.Database = new sqlite.Database(path.join(__dirname, 'database.sqlite'), (err: Error | null) => logger.error(err));

database.get_sync = async (sql: string, params: any): Promise<any> => {
    return await new Promise((resolve, reject) => {
        database.get(sql, params, (err: Error | null, row: unknown) => {
            if (err) {
                return reject(err);
            }

            return resolve(row)
        })
    })

};

database.run_sync = async (sql: string, params: any): Promise<any> => {
    return await new Promise((resolve, reject) => {
        database.run(sql, params, (err: Error | null, row: unknown) => {
            if (err) {
                return reject(err);
            }

            return resolve(row)
        })
    })

};

export default database;