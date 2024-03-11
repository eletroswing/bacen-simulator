import database from './database';
import logger from './logger';

const initial_queries: string[] = [
    `CREATE TABLE IF NOT EXISTS institutions (
        id                     TEXT NOT NULL PRIMARY KEY,
        participant            TEXT,
        branch                 TEXT
    );`,

    `CREATE TABLE IF NOT EXISTS accounts (
        id                     TEXT NOT NULL PRIMARY KEY,
        account_number         TEXT NOT NULL,
        account_type           TEXT NOT NULL,
        opening_date           TEXT NOT NULL,
        institution            TEXT
    );`,

    `CREATE TABLE IF NOT EXISTS keys (
        id                     TEXT NOT NULL PRIMARY KEY,
        key                    TEXT NOT NULL,
        key_type               TEXT NOT NULL,
        person_type            TEXT NOT NULL,
        tax_id                 TEXT NOT NULL,
        name                   TEXT NOT NULL,
        trade_name             TEXT,
        account                TEXT 
    );`
];

async function runMigrations(): Promise<void> {
    logger.log('Running migrations...');

    let promises = initial_queries.map((query: string) => 
       new Promise((resolve: Function, reject: Function) => 
          database.run(query, (err: Error | null) => {
            if (err) {
                logger.warn(`Error running query: `, err);
                return reject(err)
            }
            return resolve(true)
          }
        )
    ));

    await Promise.all(promises);
    return;
}

runMigrations();