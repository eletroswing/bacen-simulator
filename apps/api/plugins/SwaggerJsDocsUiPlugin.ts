import swaggerPath from 'swagger-ui-dist/absolute-path';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import FastifyPlugin from 'fastify-plugin';

import path from 'node:path';
import fs from 'node:fs';

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
    route?: string,
    options?: swaggerJsdoc.Options
}) {
    function execute(fastify: FastifyInstance, _options: any, next: Function) {
        const openapiSpecification = swaggerJsdoc(params?.options || defaultOptions);

        fastify.get('/swagger-ui.css', (_request: FastifyRequest, reply: FastifyReply) => {
            reply.type('text/css').send(fs.readFileSync(path.join(swaggerPath(), `swagger-ui.css`)));
        })

        fastify.get('/swagger-ui-bundle.js', (_request: FastifyRequest, reply: FastifyReply) => {
            reply.type('application/javascript').send(fs.readFileSync(path.join(swaggerPath(), `swagger-ui-bundle.js`)));
        })

        fastify.get('/swagger-ui-standalone-preset.js', (_request: FastifyRequest, reply: FastifyReply) => {
            reply.type('application/javascript').send(fs.readFileSync(path.join(swaggerPath(), `swagger-ui-standalone-preset.js`)));
        })

        fastify.get('/swagger.json', (_request: FastifyRequest, reply: FastifyReply) => {
            reply.type('application/json').send(JSON.stringify(openapiSpecification));
        })

        fastify.get(params?.route || '/docs', (_request: FastifyRequest, reply: FastifyReply) => {
            reply.type('text/html').send(`<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Swagger UI Example</title>
              <!-- Load Swagger UI CSS -->
              <link rel="stylesheet" type="text/css" href="/swagger-ui.css">
              <style>
                html, body {
                  margin: 0;
                  padding: 0;
                  height: 100%;
                }
                #swagger-ui {
                  height: 100%;
                }
              </style>
            </head>
            <body>
              <!-- Add the Swagger UI container -->
              <div id="swagger-ui"></div>
            
              <!-- Load Swagger UI JavaScript -->
              <script src="swagger-ui-bundle.js"></script>
              <script src="swagger-ui-standalone-preset.js"></script>
            
              <script>
                // Initialize Swagger UI
                const ui = SwaggerUIBundle({
                  dom_id: '#swagger-ui',
                  url: '/swagger.json', // Replace this with your Swagger JSON URL
                  presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                  ],
                  layout: 'BaseLayout',
                });
              </script>
            </body>
            </html>
            
`);
        })

        next();
    }

    return FastifyPlugin(execute, {
        name: 'SwaggerJsDocsUiPlugin'
    });
}

export default SwaggerJsDocsUiPlugin;