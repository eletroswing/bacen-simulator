
import { FastifyInstance, RegisterOptions } from 'fastify';

export default (instance: FastifyInstance, _opts: RegisterOptions, done: Function) => {
    instance.get('/:key',          (req: any, res: any) => { res.send('Must get the key') });
    instance.post('/',             (req: any, res: any) => { res.send('Must create the key') });
    instance.put('/:key',          (req: any, res: any) => { res.send('Must update the key') });
    instance.post('/:key/delete',  (req: any, res: any) => { res.send('Must delete the key') });
    done();
}