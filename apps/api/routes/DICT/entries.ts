import { FastifyInstance, FastifyReply, FastifyRequest, RegisterOptions } from 'fastify';

import createKey from '@api/services/DICT/entries/createKey';
import getKey from '@api/services/DICT/entries/getKey';

export default (instance: FastifyInstance, _opts: RegisterOptions, done: Function) => {
    instance.get('/:key', getKey);

    instance.post('/', createKey);

    instance.put('/:key', (req: FastifyRequest, res: FastifyReply) => { res.send('Must update the key') });
    
    instance.post('/:key/delete', (req: FastifyRequest, res: FastifyReply) => { res.send('Must delete the key') });
    done();
}