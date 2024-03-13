
import { FastifyInstance, FastifyReply, FastifyRequest, RegisterOptions } from 'fastify';
import check from '@api/services/DICT/keys/check';

export default (instance: FastifyInstance, _opts: RegisterOptions, done: Function) => {
    instance.post('/check', check);
    done();
}