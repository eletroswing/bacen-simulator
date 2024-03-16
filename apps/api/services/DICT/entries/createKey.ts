import type { FastifyReply, FastifyRequest } from 'fastify';
import type { z } from 'zod';

import createEntrySchema from '@api/schemas/DICT/createEntrySchema';
import buildXml from '@api/util/buildXml';
import zodValidator from '@api/util/zodValidator';

import errors from '@api/util/errors';
import statusCode from '@api/util/statusCode';
import database from '@repo/infra/database';
import logger from '@repo/infra/logger';

type RecursiveRecord = { [key: string]: never | RecursiveRecord };
type PromiseResponse = { value: RecursiveRecord };

export default async (req: FastifyRequest, res: FastifyReply) => {
	const parsed_body: {
		err: unknown | null;
		data: z.infer<typeof createEntrySchema> | null;
	} = zodValidator(createEntrySchema, req);
	if (parsed_body.err || !parsed_body.data) {
		return res
			.code(statusCode.BAD_REQUEST)
			.headers({ 'content-type': 'application/problem+xml' })
			.send(buildXml(parsed_body.err as RecursiveRecord));
	}

	try {
		const {
			CreateEntryRequest: {
				RequestId,
				Signature,
				Entry: { Account, Key, Owner, KeyType },
			},
		}: z.infer<typeof createEntrySchema> = parsed_body.data;

		const queries_result = await Promise.allSettled([
			database.get_sync(
				'SELECT * FROM tb_Accounts WHERE accountNumber = ? AND participant = ?',
				[Account.AccountNumber, Account.Participant],
			),
			database.get_sync(
				'SELECT * FROM tb_Owners WHERE taxIdNumber = ? AND type = ? AND tradeName = ? AND name = ?',
				[Owner.TaxIdNumber, Owner.Type, Owner.TradeName || 'null', Owner.Name],
			),
			database.get_sync('SELECT * FROM tb_Entries WHERE key = ?', [Key]),
		]);

		if (
			!(queries_result[0] as PromiseResponse).value ||
			!(queries_result[1] as PromiseResponse).value ||
			(queries_result[2] as PromiseResponse).value
		)
			return res
				.code(statusCode.FORBIDDEN)
				.headers({
					'content-type': 'application/problem+xml',
				})
				.send(errors.forbidden());

		await database.run_sync(
			'INSERT INTO tb_Entries VALUES (?, ?, ?, ?, ?, ?)',
			[
				Key,
				Owner.TaxIdNumber,
				Account.AccountNumber,
				KeyType,
				new Date().toISOString(),
				new Date().toISOString(),
			],
		);

		return res
			.code(201)
			.headers({ 'content-type': 'application/xml' })
			.send(
				buildXml({
					CreateEntryResponse: {
						Signature: Signature,
						ResponseTime: new Date().toISOString(),
						CorrelationId: RequestId,
						Entry: {
							Key: Key,
							KeyType: KeyType,
							Account: Account,
							Owner: Owner,
							CreationDate: new Date().toISOString(),
							KeyOwnershipDate: new Date().toISOString(),
						},
					},
				}),
			);
	} catch (e: unknown) {
		logger.warn(e);
		return res
			.code(statusCode.SERVICE_UNAVAIBLE)
			.headers({
				'content-type': 'application/problem+xml',
			})
			.send(errors.service_unvaible());
	}
};
