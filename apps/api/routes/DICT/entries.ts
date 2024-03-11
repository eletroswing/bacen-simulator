
import { FastifyInstance, FastifyReply, FastifyRequest, RegisterOptions } from 'fastify';

import createKey from '@api/services/DICT/entries/createKey';

export default (instance: FastifyInstance, _opts: RegisterOptions, done: Function) => {
    instance.get('/:key', (req: FastifyRequest, res: FastifyReply) => { res.send('Must create the key') });

    instance.post('/', createKey);

    instance.put('/:key', (req: any, res: any) => { res.send('Must update the key') });
    instance.post('/:key/delete', (req: any, res: any) => { res.send('Must delete the key') });
    done();
}