import type { Readable } from 'node:stream';
import {
	type ValidationError,
	XMLParser,
	XMLValidator,
	type validationOptions,
} from 'fast-xml-parser';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import FastifyPlugin from 'fastify-plugin';

const defaults = {
	contentType: ['text/xml', 'application/xml', 'application/rss+xml'],
};

function xmlBodyParserPlugin(validate = true) {
	function execute(
		fastify: FastifyInstance,
		options: validationOptions | undefined,
		next: () => void,
	) {
		const opts = Object.assign({}, defaults, options || {});
		function contentParser(
			_req: FastifyRequest,
			payload: Readable,
			done: (error: Error | null, parsedData?: unknown) => void,
		) {
			const xmlParser = new XMLParser({
				numberParseOptions: {
					leadingZeros: false,
					hex: true,
					skipLike: /\+[0-9]{10}/,
				},
			});
			const parsingOpts = opts;

			let body = '';
			payload.on('error', errorListener);
			payload.on('data', dataListener);
			payload.on('end', endListener);

			function errorListener(err: Error) {
				done(err);
			}

			function endListener() {
				if (!validate) {
					return handleParseXml(body);
				}

				const result: ValidationError | true = XMLValidator.validate(
					body,
					parsingOpts,
				);
				if (typeof result !== 'boolean' && result.err) {
					const invalidFormat: Error = new Error(
						`Invalid Format:  ${result.err.msg}`,
					);
					payload.removeListener('error', errorListener);
					payload.removeListener('data', dataListener);
					payload.removeListener('end', endListener);
					done(invalidFormat);
					return;
				}

				return handleParseXml(body);
			}

			function dataListener(data: string) {
				body = body + data;
			}

			function handleParseXml(body: string) {
				try {
					done(null, xmlParser.parse(body));
				} catch (err) {
					done(err as Error);
				}
			}
		}

		for (const type of opts.contentType)
			fastify.addContentTypeParser(type, contentParser);

		next();
	}

	return FastifyPlugin(execute, {
		name: 'xml-body-parser',
	});
}

export default xmlBodyParserPlugin;
