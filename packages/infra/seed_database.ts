import database from './database';
import logger from './logger';
import crypto from 'node:crypto';

function getRandomId(): string {
    return crypto.randomBytes(32).toString();
};

const temp_institution_id: string = getRandomId();
const initial: string[] = [
    `INSERT INTO institutions VALUES ('${temp_institution_id}', '00000000', '0000')`, 
    `INSERT INTO accounts VALUES ('${getRandomId()}', '00000000000000000000', 'CACC', '${new Date().toISOString()}', '${temp_institution_id}')`, 
    `INSERT INTO accounts VALUES ('${getRandomId()}', '00000000000000000001', 'CACC', '${new Date().toISOString()}', '${temp_institution_id}')`, 
    `INSERT INTO accounts VALUES ('${getRandomId()}', '00000000000000000002', 'CACC',  '${new Date().toISOString()}', '${temp_institution_id}')`
];

async function runSeed(): Promise<void> {
    logger.log('Running seed for *institutions*, *accounts* and *keys*...');
    let promises = initial.map((query: string) => 
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

runSeed();