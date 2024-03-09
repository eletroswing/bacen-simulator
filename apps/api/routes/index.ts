
import DICTRouter from '@api/routes/DICT';
import { FastifyInstance, RegisterOptions } from 'fastify';

export default (instance: FastifyInstance, _opts: RegisterOptions, done: Function) => {
    instance.register(DICTRouter, { prefix: 'dict' });
    done();
}