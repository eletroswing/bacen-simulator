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

describe('Testing the "entries" get path', () => {
	test('Check key that dont exists', async () => {
		const fetchedData: any = await new Promise((resolve, reject) => Server?.inject(
			{
				method: 'GET',
				url: `api/dict/entries/${crypto.randomUUID()}`,
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

	test('Check key that exists', async () => {
		const key = crypto.randomUUID();

		mockedDb.get_sync = jest
			.fn()
			.mockResolvedValue({
				key: '+5500000000000',
				taxIdNumber: '00000000001',
				accountNumber: '00000000000000000001',
				keyType: 'PHONE',
				keyOwnershipDate: '2024-03-16T22:54:51.426Z',
				openClaimCreationDate: '2024-03-16T22:54:51.426Z'
			});

		mockedDb.get_sync = jest
			.fn()
			.mockResolvedValue(
				{
					accountNumber: '00000000000000000001',
					participant: '00000001',
					accountType: 'CACC',
					openingDate: '2024-03-15T14:24:05.347Z',
					branch: '0001'

				});

		mockedDb.get_sync = jest
			.fn()
			.mockResolvedValue({
				taxIdNumber: '00000000001',
				type: 'NATURAL_PERSON',
				name: 'Testing Name',
				tradeName: 'null'
			});

		const fetchedData: any = await new Promise((resolve, reject) => Server?.inject(
			{
				method: 'GET',
				url: `api/dict/entries/${key}`,
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
