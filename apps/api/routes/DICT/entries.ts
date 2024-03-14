import { FastifyInstance, FastifyReply, FastifyRequest, RegisterOptions } from 'fastify';

import createKey from '@api/services/DICT/entries/createKey';
import getKey from '@api/services/DICT/entries/getKey';
import updateKey from '@api/services/DICT/entries/updateKey';

export default (instance: FastifyInstance, _opts: RegisterOptions, done: Function) => {
    instance.get('/:key', getKey);

    instance.post('/', createKey);

    instance.put('/:key', updateKey);
    
    instance.post('/:key/delete', (req: FastifyRequest, res: FastifyReply) => { res.send('Must delete the key') });
    done();
}