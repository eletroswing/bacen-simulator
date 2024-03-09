import fastify, { FastifyInstance } from 'fastify'
import logger from '@package/infra/logger';

import router from '@api/routes';

const server: FastifyInstance = fastify();

server.register(router, { prefix: 'api' });

const server_port: number = Number(process.env.PORT) || 8080;

server.listen({ port: server_port }, (err, address) => {
  if (err) {
    logger.error(err);
    process.exit(1);
  }
  logger.log(`Server listening at ${address}`);
  logger.log(server.printRoutes());
})