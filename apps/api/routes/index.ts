import DICTRouter from '@api/routes/DICT';
import type { FastifyInstance, RegisterOptions } from 'fastify';

export default (
	instance: FastifyInstance,
	_opts: RegisterOptions,
	done: () => void,
) => {
	instance.register(DICTRouter, { prefix: 'dict' });
	done();
};
