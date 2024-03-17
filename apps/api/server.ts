
import logger from '@repo/infra/logger';
import BuildServer from './buildServer';

const server_port: number = Number(process.env.PORT) || 8080;

const server = BuildServer();

server.listen({ host: '0.0.0.0', port: server_port }, (err, address) => {
	if (err) {
		logger.error(err);
		process.exit(1);
	}
	logger.log(`Server listening at ${address}`);
	logger.log('\n', server.printRoutes());
});