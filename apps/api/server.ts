import fastify, { FastifyInstance } from 'fastify'
import logger from '@package/infra/logger';

const server: FastifyInstance = fastify();

//! Each route to his respectively folder/{route}
server.get('/welcome', async (request, reply) => {
  reply.code(200).send({ success: true, message: "Welcome to Bacen Simulator!" });
})
  
const server_port: number = Number(process.env.PORT) || 8080;
server.listen({ port: server_port }, (err, address) => {
  if (err) {
    logger.error(err);
    process.exit(1);
  }
  logger.log(`Server listening at ${address}`);
})