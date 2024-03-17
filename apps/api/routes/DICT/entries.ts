import type {
	FastifyInstance,
	FastifyReply,
	FastifyRequest,
	RegisterOptions,
} from 'fastify';

import createKey from '@api/services/DICT/entries/createKey';
import getKey from '@api/services/DICT/entries/getKey';
import updateKey from '@api/services/DICT/entries/updateKey';
import deleteKey from '@api/services/DICT/entries/deleteKey';

export default (
	instance: FastifyInstance,
	_opts: RegisterOptions,
	done: () => void,
) => {
	instance.get('/:key', getKey);
	instance.post('/', createKey);
	instance.put('/:key', updateKey);
	instance.post('/:key/delete', deleteKey);

	done();
};
