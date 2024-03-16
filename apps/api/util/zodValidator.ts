import type { FastifyRequest } from 'fastify';
import type z from 'zod';
import type { Schema } from 'zod';

import statusCode from './statusCode';

type RecursiveRecord = { [key: string]: never | RecursiveRecord };

function parse(
	schema: Schema,
	content: FastifyRequest | Record<string, unknown>,
): { err: unknown | null; data: z.infer<typeof schema> | null } {
	const isReq: boolean = Boolean((content as FastifyRequest).headers);
	const req: FastifyRequest | Record<string, unknown> = content;

	if (!isReq) {
		const parsed = schema.safeParse(req);

		if (parsed.success) {
			return { err: null, data: req };
		}

		const json_err = JSON.parse(parsed.error.message);

		let value: RecursiveRecord = req.body as RecursiveRecord;
		for (let i = 0; i < json_err[0].path.length; i++) {
			value = value[json_err[0].path[i]];
		}

		return {
			// TODO: Create a generic error handler on errors.ts
			err: {
				problem: {
					'@xmlns': 'urn:ietf:rfc:7807',
					type: 'https://dict.pi.rsfn.net.br/api/v2/error/EntryInvalid',
					title: 'Entry is invalid',
					status: statusCode.BAD_REQUEST,
					detail: 'Entry has invalid paths',
					violations: [
						{
							violation: {
								reason: json_err[0].message.replace(/'/g, ''),
								value: value || 'Missing value',
								property: json_err[0].path.join('.'),
							},
						},
					],
				},
			},
			data: null,
		};
	}

	const condition = ![
		'text/xml',
		'application/xml',
		'application/rss+xml',
	].includes((req as FastifyRequest).headers['content-type'] as string);
	if (condition) {
		return {
			// TODO: Create a generic error handler on errors.ts
			err: {
				problem: {
					'@xmlns': 'urn:ietf:rfc:7807',
					type: 'https://dict.pi.rsfn.net.br/api/v2/error/EntryInvalid',
					title: 'Entry is invalid',
					status: statusCode.BAD_REQUEST,
					detail: 'Entry has invalid fields',
					violations: [
						{
							violation: {
								reason: 'Entry has invalid body',
								value: `${req.body || 'No body detected'}`,
								property: 'entry',
							},
						},
					],
				},
			},
			data: null,
		};
	}

	const parsed = schema.safeParse(req.body);
	if (parsed.success) {
		return { err: null, data: req.body };
	}

	const json_err = JSON.parse(parsed.error.message);

	let value: RecursiveRecord = req.body as RecursiveRecord;
	for (let i = 0; i < json_err[0].path.length; i++) {
		value = value[json_err[0].path[i]];
	}

	return {
		// TODO: Create a generic error handler on errors.ts
		err: {
			problem: {
				'@xmlns': 'urn:ietf:rfc:7807',
				type: 'https://dict.pi.rsfn.net.br/api/v2/error/EntryInvalid',
				title: 'Entry is invalid',
				status: statusCode.BAD_REQUEST,
				detail: 'Entry has invalid fields',
				violations: [
					{
						violation: {
							reason: json_err[0].message.replace(/'/g, ''),
							value: value || 'Missing value',
							property: json_err[0].path.join('.'),
						},
					},
				],
			},
		},
		data: null,
	};
}

export default parse;
