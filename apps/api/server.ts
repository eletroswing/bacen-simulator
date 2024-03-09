import fastify, { FastifyInstance } from 'fastify'
import logger from '@package/infra/logger';

import XmlBodyParser from '@api/plugins/xmlBodyParser';
import router from '@api/routes';

const server: FastifyInstance = fastify();
//Welcome Test Route
server.get('/welcome', async (request, reply) => {
  reply.code(200).send({ success: true, message: "Welcome to Bacen Simulator!" });
})

server.register(XmlBodyParser(true));
server.register(router, { prefix: 'api' });

const server_port: number = Number(process.env.PORT) || 8080;

server.listen({ port: server_port }, (err, address) => {
  if (err) {
    logger.error(err);
    process.exit(1);
  }
  logger.log(`Server listening at ${address}`);
  logger.log(`\n`, server.printRoutes());
})