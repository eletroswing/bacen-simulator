import database from './database';
import logger from './logger';

const initial_queries: string[] = [
    `CREATE TABLE IF NOT EXISTS tb_Institutions (
        ispbNumber             TEXT NOT NULL PRIMARY KEY,
        nome                   TEXT
    );`,

    `CREATE TABLE IF NOT EXISTS tb_Owners (
        taxIdNumber            TEXT NOT NULL PRIMARY KEY,
        type                   TEXT NOT NULL,
        name                   TEXT NOT NULL,
        tradeName              TEXT
    );`,

    `CREATE TABLE IF NOT EXISTS tb_Accounts (
        accountNumber          TEXT NOT NULL PRIMARY KEY,
        participant            TEXT NOT NULL,
        accountType            TEXT NOT NULL,
        opening_date           TEXT,
        branch                 TEXT
    );`,

    `CREATE TABLE IF NOT EXISTS tb_Entries (
        key                    TEXT NOT NULL PRIMARY KEY,
        taxIdNumber            TEXT NOT NULL,
        accountNumber          TEXT NOT NULL,
        keyType                TEXT NOT NULL,
        keyOwnershipDate       TEXT,
        openClaimCreationDate  TEXT
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