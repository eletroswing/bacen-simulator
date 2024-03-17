import type { FastifyRequest } from 'fastify';
import type z from 'zod';
import type { Schema } from 'zod';

import statusCode from './statusCode';

type RecursiveRecord = { [key: string]: never | RecursiveRecord };

function parse(
	schema: Schema,
	content: FastifyRequest | Record<string, unknown>,
): { err: unknown | null; data: z.infer<typeof schema> | null } {
	function getValueByPath(
		data: RecursiveRecord,
		path: string[],
	): RecursiveRecord {
		let value = data;
		for (const segment of path) {
			value = value[segment];
		}
		return value;
	}

	function BuildError(
		detail: string,
		violations: {
			violation: {
				reason: string;
				value: string | RecursiveRecord;
				property: string;
			};
		}[],
	) {
		return {
			problem: {
				'@xmlns': 'urn:ietf:rfc:7807',
				type: 'https://dict.pi.rsfn.net.br/api/v2/error/EntryInvalid',
				title: 'Entry is invalid',
				status: statusCode.BAD_REQUEST,
				detail: detail,
				violations: violations,
			},
		};
	}

	const isReq: boolean = Boolean((content as FastifyRequest).headers);

	if (
		isReq &&
		!['text/xml', 'application/xml', 'application/rss+xml'].includes(
			(content as FastifyRequest).headers['content-type'] as string,
		)
	)
		return {
			err: BuildError('Entry has invalid fields', [
				{
					violation: {
						reason: 'Entry has invalid body',
						value: `${content.body || 'No body detected'}`,
						property: 'entry',
					},
				},
			]),
			data: null,
		};

	const parsed = schema.safeParse(
		isReq ? (content as FastifyRequest).body : content,
	);
	if (parsed.success)
		return {
			err: null,
			data: isReq ? (content as FastifyRequest).body : content,
		};

	const json_err = JSON.parse(parsed.error.message);
	const value: RecursiveRecord = getValueByPath(
		(isReq ? (content as FastifyRequest).body : content) as RecursiveRecord,
		json_err[0].path,
	);

	return {
		err: BuildError('Entry has invalid fields', [
			{
				violation: {
					reason: json_err[0].message.replace(/'/g, ''),
					value: value || 'Missing value',
					property: json_err[0].path.join('.'),
				},
			},
		]),
		data: null,
	};
}

export default parse;
