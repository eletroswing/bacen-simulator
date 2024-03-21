import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import FastifyPlugin from 'fastify-plugin';
import swaggerPath from 'swagger-ui-dist/absolute-path';

import fs from 'node:fs';
import path from 'node:path';

import type { Readable } from 'node:stream';
import swaggerJsdoc from 'swagger-jsdoc';

const defaultOptions: swaggerJsdoc.Options = {
	definition: {
		openapi: '3.1.0',
		info: {
			title: 'Bacen Simulator',
			version: '0.0.1',
			description: 'Documentation for a Bacen Simulator',
		},
	},
	apis: ['routes/**/*.yml'],
};

function SwaggerJsDocsUiPlugin(params?: {
	route?: string;
	options?: swaggerJsdoc.Options;
}) {
	function execute(
		fastify: FastifyInstance,
		_options: Readable,
		next: () => void,
	) {
		const openapiSpecification = swaggerJsdoc(
			params?.options || defaultOptions,
		);

		fastify.get(
			'/api-reference.js',
			(_request: FastifyRequest, reply: FastifyReply) => {
				reply
					.type('application/javascript')
					.send(
						fs.readFileSync(
							path.join(__dirname, 'files', 'api-reference.js'),
						),
					);
			},
		);

		fastify.get(
			'/swagger.json',
			(_request: FastifyRequest, reply: FastifyReply) => {
				reply
					.type('application/json')
					.send(JSON.stringify(openapiSpecification));
			},
		);

		fastify.get(
			params?.route || '/docs',
			(_request: FastifyRequest, reply: FastifyReply) => {
				reply.type('text/html').send(`<!doctype html>
				<html>
				  <head>
					<title>API Reference</title>
					<meta charset="utf-8" />
					<meta
					  name="viewport"
					  content="width=device-width, initial-scale=1" />
				  </head>
				  <body>
					<script
					  id="api-reference"
					  data-url="swagger.json"></script>
					<script>
					  var configuration = {
						theme: 'purple',
					  }
				
					  var apiReference = document.getElementById('api-reference')
					  apiReference.dataset.configuration = JSON.stringify(configuration)
					</script>
					<script src="/api-reference.js"></script>
				  </body>
				</html>`);
			},
		);

		next();
	}

	return FastifyPlugin(execute, {
		name: 'SwaggerJsDocsUiPlugin',
	});
}

export default SwaggerJsDocsUiPlugin;
