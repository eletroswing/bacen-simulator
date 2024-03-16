import check from '@api/services/DICT/keys/check';
import type { FastifyInstance, RegisterOptions } from 'fastify';

export default (
	instance: FastifyInstance,
	_opts: RegisterOptions,
	done: () => void,
) => {
	instance.post('/check', check);
	done();
};
