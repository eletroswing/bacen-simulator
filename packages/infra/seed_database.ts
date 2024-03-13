import database from './database';
import logger from './logger';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

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
    logger.log('Running seed for *tb_Institutions*, *tb_Owners* and *tb_Accounts*');
    const readStream = fs.createReadStream(csv_file_path, 'utf8');
    var promises: Promise<any>[] = []

    function generateTaxID() {
        return Math.floor(Math.random() * (99999999999 - 10000000000) + 10000000000);
    }

    function generateAccountNumber() {
        return Math.floor(Math.random() * (99999999999999999999 - 10000000000000000000) + 10000000000000000000);
    }

    readLines(readStream, (line: any) => {
        const institution_data = line.split(`;`);
        if (institution_data[2] && institution_data[2] != 'ISPB') {
            const taxId = generateTaxID();
            const accountNumber = generateAccountNumber();

            // Create a institution based on the actual line
            promises.push(new Promise((resolve: Function, reject: Function) =>
                database.run(`INSERT INTO tb_Institutions VALUES ('${institution_data[2]}', '${institution_data[1]}')`, (err: Error | null) => {
                    if (err) {
                        logger.warn(`Error running query: `, err);
                        return reject(err)
                    }
                    return resolve(true)
                }
            )));

            // Create a new owner
            promises.push(new Promise((resolve: Function, reject: Function) =>
                database.run(`INSERT INTO tb_Owners VALUES ('${taxId}', 'NATURAL_PERSON', 'Geraldo Pinho', '${null}')`, (err: Error | null) => {
                    if (err) {
                        logger.warn(`Error running query: `, err);
                        return reject(err)
                    }
                    return resolve(true)
                }
            )));

            // Create a new account linked to the created owner and the actual institution
            promises.push(new Promise((resolve: Function, reject: Function) =>
                database.run(`INSERT INTO tb_Accounts VALUES ('${accountNumber}', '${institution_data[2]}', 'CACC', '${new Date().toISOString()}', '0001')`, (err: Error | null) => {
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