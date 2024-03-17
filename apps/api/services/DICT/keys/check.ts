import type { FastifyReply, FastifyRequest } from 'fastify';
import type { z } from 'zod';

import CheckKeysRequest from '@api/schemas/DICT/checkKeysRequest';
import buildXml from '@api/util/buildXml';
import zodValidator from '@api/util/zodValidator';

import type { RecursiveRecord } from '@api/types/recursiveRecord';
import errors from '@api/util/errors';
import statusCode from '@api/util/statusCode';
import database from '@repo/infra/database';
import logger from '@repo/infra/logger';

export default async (req: FastifyRequest, res: FastifyReply) => {
	try {
		function KeyOnResponse(key: string, response: { key: string }[]) {
			return response.filter((item) => item.key === key).length > 0;
		}

		const parsed_body: {
			err: unknown | null;
			data: z.infer<typeof CheckKeysRequest> | null;
		} = zodValidator(CheckKeysRequest, req);
		if (parsed_body.err) {
			return res
				.code(statusCode.BAD_REQUEST)
				.headers({ 'content-type': 'application/problem+xml' })
				.send(buildXml(parsed_body.err as RecursiveRecord));
		}

		let query = "SELECT * FROM 'tb_Entries' WHERE key = '' ";

		if (
			parsed_body.data &&
			typeof parsed_body.data?.CheckKeysRequest.Keys.Key !== 'object'
		)
			parsed_body.data.CheckKeysRequest.Keys.Key = [
				parsed_body.data.CheckKeysRequest.Keys.Key,
			];
		const params: string[] | undefined = (
			parsed_body.data?.CheckKeysRequest.Keys.Key as string[]
		).map((key) => {
			query = `${query} OR key = ?`;
			return key;
		});

		const data_query = await database.get_multiple_sync(query, params);

		const keys = (parsed_body.data?.CheckKeysRequest.Keys.Key as string[]).map(
			(key) => {
				return {
					'@hasEntry': `${KeyOnResponse(`${key}`, data_query)}`,
					'#text': `${key}`,
				};
			},
		);

		return res
			.code(statusCode.OK)
			.headers({
				'content-type': 'application/xml',
			})
			.send(
				buildXml({
					CheckKeysRequest: {
						Keys: {
							Key: keys,
						},
					},
				}),
			);
	} catch (e: unknown) {
		logger.warn(e);
		return res
			.code(statusCode.FORBIDDEN)
			.headers({
				'content-type': 'application/problem+xml',
			})
			.send(errors.service_unvaible());
	}
};
