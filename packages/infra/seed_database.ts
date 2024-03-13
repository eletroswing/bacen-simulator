import database from './database';
import logger from './logger';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function getRandomId(): string {
    return crypto.randomUUID();
};

const csv_file_path = path.join(__dirname, '..', '..', 'assets', 'institutions_on_bacen_until_12_03_24.csv');

function readLines(input: any, callback: any) {
    let remaining = '';

    input.on('data', (data: any) => {
        remaining += data;
        let index = remaining.indexOf('\n');
        let last = 0;
        while (index > -1) {
            let line = remaining.substring(last, index);
            last = index + 1;
            callback(line);
            index = remaining.indexOf('\n', last);
        }
        remaining = remaining.substring(last);
    });

    input.on('end', () => {
        if (remaining.length > 0) {
            callback(remaining);
        }
    });
}

async function runSeed(): Promise<void> {
    logger.log('Running seed for *institutions* and *accounts*...');
    const readStream = fs.createReadStream(csv_file_path, 'utf8');
    var promises: Promise<any>[] = []

    readLines(readStream, (line: any) => {
        const institution_data = line.split(`;`);
        if (institution_data[2] && institution_data[2] != 'ISPB') {
            const inst_id = getRandomId();
            promises.push(new Promise((resolve: Function, reject: Function) =>
                database.run(`INSERT INTO institutions VALUES ('${inst_id}', '${institution_data[2]}', '0000')`, (err: Error | null) => {
                    if (err) {
                        logger.warn(`Error running query: `, err);
                        return reject(err)
                    }
                    return resolve(true)
                }
            )));

            promises.push(new Promise((resolve: Function, reject: Function) =>
                database.run(`INSERT INTO accounts VALUES ('${getRandomId()}', '00000000000000000000', 'CACC', '${new Date().toISOString()}', '${inst_id}')`, (err: Error | null) => {
                    if (err) {
                        logger.warn(`Error running query: `, err);
                        return reject(err)
                    }
                    return resolve(true)
                }
            )));

            promises.push(new Promise((resolve: Function, reject: Function) =>
                database.run(`INSERT INTO accounts VALUES ('${getRandomId()}', '00000000000000000001', 'CACC', '${new Date().toISOString()}', '${inst_id}')`, (err: Error | null) => {
                    if (err) {
                        logger.warn(`Error running query: `, err);
                        return reject(err)
                    }
                    return resolve(true)
                }
            )));
        };
    });

    await Promise.all(promises)
    logger.log('*Institutions* and *accounts* seeded successfully...');

    return;
}

runSeed();