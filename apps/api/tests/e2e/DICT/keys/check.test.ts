import { describe, expect, test } from '@jest/globals';
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

jest.mock('@repo/infra/database', () => ({
	...jest.requireActual('@repo/infra/database'),
	get_multiple_sync: jest.fn(() => [{
		key: '+5500000000000',
		taxIdNumber: '00000000001',
		accountNumber: '00000000000000000001',
		keyType: 'PHONE',
		keyOwnershipDate: '2024-03-16T22:54:51.426Z',
		openClaimCreationDate: '2024-03-16T22:54:51.426Z'
	}])
}))

describe('Check Tests on DICT ', () => {
	test('Check passing a valid body', async () => {
		const key = '+5500000000000';

		const fetchedData: any = await new Promise((resolve, reject) => Server?.inject(
			{
				method: 'POST',
				url: 'api/dict/keys/check',
				headers: {
					'Content-Type': 'application/xml',
				},
				body: `<?xml version="1.0" encoding="UTF-8" ?><CheckKeysRequest><Keys><Key>${key}</Key></Keys></CheckKeysRequest>`,
			},
			(err, res) => {
				if (err) {
					return reject(err)
				}

				return resolve(res)
			}
		));

		expect(require('@repo/infra/database').get_multiple_sync).toHaveBeenCalled();
		expect(fetchedData.statusCode).toBe(200);
		expect(fetchedData.headers['content-type']).toBe('application/xml');
		expect(fetchedData.payload).toBe(
		  `<?xml version="1.0" encode="UTF-8" standalone="yes"?><CheckKeysRequest><Keys><Key hasEntry="true">${key}</Key></Keys></CheckKeysRequest>`,
		);
	});

	test('Check passing a valid body and key that dont exists', async () => {
		const key = crypto.randomUUID();
		const fetchedData: any = await new Promise((resolve, reject) => Server?.inject(
			{
				method: 'POST',
				url: 'api/dict/keys/check',
				headers: {
					'Content-Type': 'application/xml',
				},
				body: `<?xml version="1.0" encoding="UTF-8" ?><CheckKeysRequest><Keys><Key>${key}</Key></Keys></CheckKeysRequest>`,
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
		expect(fetchedData.payload).toBe(
			`<?xml version="1.0" encode="UTF-8" standalone="yes"?><CheckKeysRequest><Keys><Key hasEntry="false">${key}</Key></Keys></CheckKeysRequest>`,
		);
	});

	test('Check passing a valid body with 2 keys (true and false)', async () => {
		const key = crypto.randomUUID();

		const fetchedData: any = await new Promise((resolve, reject) => Server?.inject(
			{
				method: 'POST',
				url: 'api/dict/keys/check',
				headers: {
					'Content-Type': 'application/xml',
				},
				body: `<?xml version="1.0" encoding="UTF-8" ?><CheckKeysRequest><Keys><Key>${key}</Key><Key>+5500000000000</Key></Keys></CheckKeysRequest>`,
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
		expect(fetchedData.payload).toBe(
			`<?xml version="1.0" encode="UTF-8" standalone="yes"?><CheckKeysRequest><Keys><Key hasEntry="false">${key}</Key><Key hasEntry="true">+5500000000000</Key></Keys></CheckKeysRequest>`,
		);
	});
});
