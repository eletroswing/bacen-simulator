import { FastifyInstance, RegisterOptions } from 'fastify';

export default (instance: FastifyInstance, _opts: RegisterOptions, done: Function) => {
    instance.post('/',                (req: any, res: any) => { res.send('Creates a return request.Only the debited participant can create a refund request.') });
    instance.get('/',                 (req: any, res: any) => { res.send('Gets list of return requests to which the participant is a party.') });
    instance.get('/:id',              (req: any, res: any) => { res.send('Gets details of a return request.') });
    instance.post('/:id/cancel',      (req: any, res: any) => { res.send('Cancela a Solicitação de devolução.') });
    instance.post('/:id/close',       (req: any, res: any) => { res.send('Close the return request.The request can only be closed by the challenged participant.') });
    done();
}