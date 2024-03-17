import { describe, expect, test } from '@jest/globals';
import { XMLParser } from 'fast-xml-parser';

import database from '@repo/infra/database';
import BuildServer from '@api/buildServer';
import { type FastifyInstance } from 'fastify';

let Server: FastifyInstance | undefined = undefined;

beforeAll(() => {
    Server = BuildServer();
    jest.clearAllMocks();
});

afterAll(() => {
    Server?.close();
    jest.clearAllMocks();
});

jest.mock('@repo/infra/database');
const mockedDb = database as jest.Mocked<typeof database>;

describe('Testing the "entries" update path', () => {
    test('Update passing a key that doesnt exists', async () => {
        const key = crypto.randomUUID();

        const fetchedData: any = await new Promise((resolve, reject) => Server?.inject(
            {
                method: 'PUT',
                url: `api/dict/entries/${key}`,
                headers: {
                    'Content-Type': 'application/xml',
                },
                body: `<?xml version="1.0" encoding="UTF-8" ?>
            <UpdateEntryRequest>
                <Signature></Signature>
                <Key>${key}</Key>
                <Account>
                    <Participant>00000001</Participant>
                    <Branch>0001</Branch>
                    <AccountNumber>00000000000000000001</AccountNumber>
                    <AccountType>CACC</AccountType>
                    <OpeningDate>2024-03-15T14:24:05.347Z</OpeningDate>
                </Account>
                <Owner>
                    <Type>NATURAL_PERSON</Type>
                    <TaxIdNumber>00000000001</TaxIdNumber>
                    <Name>Testing Name</Name>
                </Owner>
                <Reason>USER_REQUESTED</Reason>
            </UpdateEntryRequest>`,
            },
            (err, res) => {
                if (err) {
                    return reject(err)
                }

                return resolve(res)
            }
        ));

        const parsed = new XMLParser().parse(fetchedData.payload);
        expect(fetchedData.headers['content-type']).toBe(
            'application/problem+xml',
        );
        expect(fetchedData.statusCode).toBe(404);
        expect(parsed['?xml']).toBe('');
        expect(parsed.problem.type).toBe(
            'https://dict.pi.rsfn.net.br/api/v2/error/NotFound',
        );
        expect(parsed.problem.title).toBe('Not found');
        expect(parsed.problem.status).toBe(404);
        expect(parsed.problem.detail).toBe(
            'Entry associated with given key does not exist',
        );
    });

    test('Update passing a key that exists', async () => {
        const key = crypto.randomUUID();

        mockedDb.get_sync = jest.fn().mockResolvedValue({
            key: key,
            taxIdNumber: '00000000001',
            accountNumber: '00000000000000000001',
            keyType: 'EVP',
            keyOwnershipDate: '2024-03-16T22:54:51.426Z',
            openClaimCreationDate: '2024-03-16T22:54:51.426Z'
        })
        mockedDb.exec_sync = jest.fn().mockResolvedValue(undefined)
        mockedDb.run_sync = jest.fn().mockResolvedValue(undefined)
        mockedDb.run_sync = jest.fn().mockResolvedValue(undefined)
        mockedDb.exec_sync = jest.fn().mockResolvedValue(undefined)

        const fetchedData: any = await new Promise((resolve, reject) => Server?.inject(
            {
                method: 'PUT',
                url: `api/dict/entries/${key}`,
                headers: {
                    'Content-Type': 'application/xml',
                },
                body: `<?xml version="1.0" encoding="UTF-8" ?>
                <UpdateEntryRequest>
                    <Signature></Signature>
                    <Key>${key}</Key>
                    <Account>
                        <Participant>00000001</Participant>
                        <Branch>0001</Branch>
                        <AccountNumber>00000000000000000001</AccountNumber>
                        <AccountType>CACC</AccountType>
                        <OpeningDate>2024-03-15T14:24:05.347Z</OpeningDate>
                    </Account>
                    <Owner>
                        <Type>NATURAL_PERSON</Type>
                        <TaxIdNumber>00000000001</TaxIdNumber>
                        <Name>Testing Name</Name>
                    </Owner>
                    <Reason>USER_REQUESTED</Reason>
                </UpdateEntryRequest>`,
            },
            (err, res) => {
                if (err) {
                    return reject(err)
                }

                return resolve(res)
            }
        ));

        expect(fetchedData.headers['content-type']).toBe('application/xml');
        expect(fetchedData.statusCode).toBe(200);
    });
});
