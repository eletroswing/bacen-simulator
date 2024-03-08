import fastify, { FastifyInstance } from 'fastify'
import logger from '@package/infra/logger';

const server: FastifyInstance = fastify();

//! Each route to his respectively folder/{route}
// server.get('/ping', async (request, reply) => {
  //   return 'pong\n'
  // })
  
const server_port: number = Number(process.env.PORT) || 8080;
server.listen({ port: server_port }, (err, address) => {
  if (err) {
    logger.error(err);
    process.exit(1);
  }
  logger.log(`Server listening at ${address}`);
})