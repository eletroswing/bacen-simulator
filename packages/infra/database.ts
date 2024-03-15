import sqlite from 'sqlite3';
import logger from './logger';
import path from 'node:path';

declare module 'sqlite3' {
    interface Database {
        get_sync: (sql: string, params: any) => Promise<any>;
        run_sync: (sql: string, params: any) => Promise<any>;
        get_multiple_sync: (sql: string, params: any) => Promise<any>;
        exec_sync: (sql: string) => Promise<any>;
    }
}

const database: sqlite.Database = new sqlite.Database(path.join(__dirname, 'database.sqlite'), (err: Error | null) => logger.error(err));

database.exec_sync = async (sql: string): Promise<any> => {
    return await new Promise((resolve, reject) => {
        database.exec(sql, (err: Error | null) => {
            if (err) {
                return reject(err);
            }

            return resolve(true)
        })
    })

};

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

database.get_multiple_sync = async (sql: string, params: any): Promise<any> => {
    return await new Promise((resolve, reject) => {
        let rows: any[] = [];
        database.each(sql, params, (err: Error | null, row: unknown) => {
            if (err) {
                return reject(err);
            }

            rows.push(row)
        }, (err, count ) => {
            if (err) {
                return reject(err);
            }

            resolve(rows)
        })
    })

};

export default database;