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

describe('Testing the "entries" delete path', () => {
    test('Delete key that dont exists', async () => {
        const key = crypto.randomUUID();
        const fetchedData: any = await new Promise((resolve, reject) => Server?.inject(
            {
                method: 'POST',
                url: `api/dict/entries/${key}/delete`,
                headers: {
                    'Content-Type': 'application/xml',
                },
                body: `<?xml version="1.0" encoding="UTF-8" ?>
                <DeleteEntryRequest>
                    <Signature></Signature>
                    <Key>${key}</Key>
                    <Participant>12345678</Participant>
                    <Reason>ACCOUNT_CLOSURE</Reason>
                </DeleteEntryRequest>`

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
        expect(parsed.problem.type).toBe(
            'https://dict.pi.rsfn.net.br/api/v2/error/NotFound',
        );
        expect(parsed.problem.title).toBe('Not found');
        expect(parsed.problem.status).toBe(404);
        expect(parsed.problem.detail).toBe(
            'Entry associated with given key does not exist',
        );
    });

    test('Delete key that exists', async () => {
        const key = crypto.randomUUID();

        mockedDb.get_sync.mockImplementation(async (sql: string, params: string[]) => {
			switch (sql) {
				case 'SELECT * FROM tb_Entries WHERE key = ?':
					return {
                        key: key,
                        taxIdNumber: '00000000001',
                        accountNumber: '00000000000000000001',
                        keyType: 'EVP',
                        keyOwnershipDate: '2024-03-16T22:54:51.426Z',
                        openClaimCreationDate: '2024-03-16T22:54:51.426Z'
                    }

				case 'SELECT * FROM tb_Accounts WHERE accountNumber = ?':
					return  {
                        accountNumber: '00000000000000000001',
                        participant: '00000001',
                        accountType: 'CACC',
                        openingDate: '2024-03-15T14:24:05.347Z',
                        branch: '0001'
                    }
			}
		})

        const fetchedData: any = await new Promise((resolve, reject) => Server?.inject(
            {
                method: 'POST',
                url: `api/dict/entries/${key}/delete`,
                headers: {
                    'Content-Type': 'application/xml',
                },
                body: `<?xml version="1.0" encoding="UTF-8" ?>
                    <DeleteEntryRequest>
                        <Signature></Signature>
                        <Key>${key}</Key>
                        <Participant>00000001</Participant>
                        <Reason>ACCOUNT_CLOSURE</Reason>
                    </DeleteEntryRequest>`

            },
            (err, res) => {
                if (err) {
                    return reject(err)
                }

                return resolve(res)
            }
        ));


        expect(fetchedData.statusCode).toBe(200);
        expect(fetchedData.headers['content-type']).toBe('application/xml');
    });

    test('Delete without body', async () => {
        const key = crypto.randomUUID();

        const fetchedData: any = await new Promise((resolve, reject) => Server?.inject(
            {
                method: 'POST',
                url: `api/dict/entries/${key}/delete`,
                headers: {
                    'Content-Type': 'application/xml',
                }
            },
            (err, res) => {
                if (err) {
                    return reject(err)
                }

                return resolve(res)
            }
        ));


        expect(fetchedData.statusCode).toBe(400);
        expect(fetchedData.headers['content-type']).toBe('application/problem+xml');
    });
});
