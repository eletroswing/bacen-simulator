import fastify, {
	type FastifyInstance,
	type FastifyReply,
	type FastifyRequest,
} from 'fastify';

import SwaggerJsDocsUiPlugin from '@api/plugins/SwaggerJsDocsUiPlugin';
import XmlBodyParser from '@api/plugins/xmlBodyParser';
import router from '@api/routes';
import buildXml from '@api/util/buildXml';
import statusCode from '@api/util/statusCode';

function errorHandler(
	error: Error,
	request: FastifyRequest,
	reply: FastifyReply,
) {
	return reply
		.code(statusCode.BAD_REQUEST)
		.headers({
			'content-type': 'application/problem+xml',
		})
		.send(
			buildXml({
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
								value: `${error.message
									.replace('Invalid Format:', '')
									.replace(/'/g, '')}`,
								property: 'entry',
							},
						},
					],
				},
			}),
		);
}

function BuildServer() {
	const server: FastifyInstance = fastify();

	server.setErrorHandler(errorHandler);
	server.register(XmlBodyParser(true));

	server.register(
		SwaggerJsDocsUiPlugin({
			route: '/docs',
			options: {
				definition: {
					openapi: '3.1.0',
					info: {
						title: 'Bacen Simulator',
						version: '0.0.1',
						description: 'Documentation for a Bacen Simulator',
					},
				},
				apis: ['services/**/**/*.yml'],
			},
		}),
	);
	
	server.register(router, { prefix: 'api' });

	return server;
}

export default BuildServer;